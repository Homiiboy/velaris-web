import type { UserDto } from '@jellyfin/sdk/lib/generated-client';
import { ImageType } from '@jellyfin/sdk/lib/generated-client/models/image-type';
import React, { FunctionComponent, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import Dashboard from '../../../../utils/dashboard';
import globalize from '../../../../lib/globalize';
import { appHost } from '../../../../components/apphost';
import confirm from '../../../../components/confirm/confirm';
import toast from '../../../../components/toast/toast';
import { useUser } from 'hooks/api/useUser';
import loading from 'components/loading/loading';
import { queryClient } from 'utils/query/queryClient';
import UserPasswordForm from 'components/dashboard/users/UserPasswordForm';
import Page from 'components/Page';
import Loading from 'components/loading/LoadingComponent';
import Button from 'elements/emby-button/Button';

const UserProfile: FunctionComponent = () => {
    const [ searchParams ] = useSearchParams();
    const userId = searchParams.get('userId') || undefined;
    const { data: user, isPending: isUserPending } = useUser({ userId });
    const libraryMenu = useMemo(async () => ((await import('../../../../scripts/libraryMenu')).default), []);

    const element = useRef<HTMLDivElement>(null);

    const reloadUser = useCallback(() => {
        const page = element.current;

        if (!page) {
            console.error('[userprofile] Unexpected null page reference');
            return;
        }

        if (!user?.Name || !user?.Id) {
            throw new Error('Unexpected null user name or id');
        }

        void libraryMenu.then(menu => menu.setTitle(user.Name));

        let imageUrl = 'assets/img/avatar.png';
        if (user.PrimaryImageTag) {
            imageUrl = window.ApiClient.getUserImageUrl(user.Id, {
                tag: user.PrimaryImageTag,
                type: 'Primary'
            });
        }
        const userImage = (page.querySelector('#image') as HTMLDivElement);
        userImage.style.backgroundImage = 'url(' + imageUrl + ')';

        Dashboard.getCurrentUser().then(function (loggedInUser: UserDto) {
            if (!user.Policy) {
                throw new Error('Unexpected null user.Policy');
            }

            if (user.PrimaryImageTag) {
                (page.querySelector('#btnAddImage') as HTMLButtonElement).classList.add('hide');
                (page.querySelector('#btnDeleteImage') as HTMLButtonElement).classList.remove('hide');
            } else if (appHost.supports('fileinput') && (loggedInUser?.Policy?.IsAdministrator || user.Policy.EnableUserPreferenceAccess)) {
                (page.querySelector('#btnDeleteImage') as HTMLButtonElement).classList.add('hide');
                (page.querySelector('#btnAddImage') as HTMLButtonElement).classList.remove('hide');
            }
        }).catch(err => {
            console.error('[userprofile] failed to get current user', err);
        });
    }, [user, libraryMenu]);

    useEffect(() => {
        const page = element.current;

        if (!page) {
            console.error('[userprofile] Unexpected null page reference');
            return;
        }

        reloadUser();

        const onFileReaderError = (evt: ProgressEvent<FileReader>) => {
            loading.hide();
            switch (evt.target?.error?.code) {
                case DOMException.NOT_FOUND_ERR:
                    toast(globalize.translate('FileNotFound'));
                    break;
                case DOMException.ABORT_ERR:
                    onFileReaderAbort();
                    break;
                default:
                    toast(globalize.translate('FileReadError'));
            }
        };

        const onFileReaderAbort = () => {
            loading.hide();
            toast(globalize.translate('FileReadCancelled'));
        };

        const setFiles = (evt: Event) => {
            const userImage = (page.querySelector('#image') as HTMLDivElement);
            const target = evt.target as HTMLInputElement;
            const file = (target.files as FileList)[0];

            if (!file || !/image.*/.exec(file.type)) {
                return false;
            }

            const reader: FileReader = new FileReader();
            reader.onerror = onFileReaderError;
            reader.onabort = onFileReaderAbort;
            reader.onload = () => {
                if (!userId) {
                    console.error('[userprofile] missing user id');
                    return;
                }

                userImage.style.backgroundImage = 'url(' + reader.result + ')';
                window.ApiClient.uploadUserImage(userId, ImageType.Primary, file).then(function () {
                    loading.hide();
                    void queryClient.invalidateQueries({
                        queryKey: ['User']
                    });
                }).catch(err => {
                    console.error('[userprofile] failed to upload image', err);
                });
            };

            reader.readAsDataURL(file);
        };

        const onDeleteImageClick = function () {
            if (!userId) {
                console.error('[userprofile] missing user id');
                return;
            }

            confirm(
                globalize.translate('DeleteImageConfirmation'),
                globalize.translate('DeleteImage')
            ).then(function () {
                loading.show();
                window.ApiClient.deleteUserImage(userId, ImageType.Primary).then(function () {
                    loading.hide();
                    void queryClient.invalidateQueries({
                        queryKey: ['User']
                    });
                }).catch(err => {
                    console.error('[userprofile] failed to delete image', err);
                });
            }).catch(() => {
                // confirm dialog closed
            });
        };

        const addImageClick = function () {
            const uploadImage = page.querySelector('#uploadImage') as HTMLInputElement;
            uploadImage.value = '';
            uploadImage.click();
        };

        const onUploadImage = (e: Event) => {
            setFiles(e);
        };

        (page.querySelector('#btnDeleteImage') as HTMLButtonElement).addEventListener('click', onDeleteImageClick);
        (page.querySelector('#btnAddImage') as HTMLButtonElement).addEventListener('click', addImageClick);
        (page.querySelector('#uploadImage') as HTMLInputElement).addEventListener('change', onUploadImage);

        return () => {
            (page.querySelector('#btnDeleteImage') as HTMLButtonElement).removeEventListener('click', onDeleteImageClick);
            (page.querySelector('#btnAddImage') as HTMLButtonElement).removeEventListener('click', addImageClick);
            (page.querySelector('#uploadImage') as HTMLInputElement).removeEventListener('change', onUploadImage);
        };
    }, [reloadUser, user, userId]);

    if (isUserPending || !user) {
        return <Loading />;
    }

    return (
        <Page
            id='userProfilePage'
            title={globalize.translate('Profile')}
            className='mainAnimatedPage libraryPage userPreferencesPage userPasswordPage noSecondaryNavPage velaris-user-profile-page'
        >
            <div ref={element} className='velaris-user-profile'>
                <section className='velaris-profile-hero'>
                    <div className='velaris-profile-avatar-shell'>
                        <input
                            id='uploadImage'
                            className='velaris-profile-image-input'
                            type='file'
                            accept='image/*'
                        />
                        <div id='image' className='velaris-profile-avatar' />
                    </div>

                    <div className='velaris-profile-copy'>
                        <span className='velaris-profile-copy__eyebrow'>VELARIS PROFILE</span>
                        <h1 className='username'>{user.Name}</h1>
                        <p className='velaris-profile-copy__subtitle'>
                            Dein Profil, deine Wiedergabe und deine persönlichen Einstellungen an einem Ort.
                        </p>

                        <div className='velaris-profile-actions'>
                            <Button
                                type='button'
                                id='btnAddImage'
                                className='raised button-submit hide velaris-profile-action'
                                title={globalize.translate('ButtonAddImage')}
                            />
                            <Button
                                type='button'
                                id='btnDeleteImage'
                                className='raised hide velaris-profile-action'
                                title={globalize.translate('DeleteImage')}
                            />
                        </div>
                    </div>
                </section>

                <section className='velaris-profile-security'>
                    <UserPasswordForm user={user} />
                </section>
            </div>
        </Page>

    );
};

export default UserProfile;
