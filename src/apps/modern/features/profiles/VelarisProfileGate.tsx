import React, { type FC, useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { getVelarisLocalStorage, getVelarisSessionStorage } from 'apps/modern/utils/velarisStorage';
import viewContainer from 'components/viewContainer';
import { useApi } from 'hooks/useApi';
import Dashboard from 'utils/dashboard';
import { queryClient } from 'utils/query/queryClient';

import {
    getVelarisDialogFocusableElements,
    getVelarisDialogFocusWrapTarget
} from './profileFocus';
import {
    getChosenVelarisProfileId,
    markVelarisProfileChosen,
    readVelarisProfilePreferences,
    shouldShowVelarisProfilePicker,
    type VelarisPublicProfile
} from './profiles';

const VelarisProfileGate: FC = () => {
    const { user, __legacyApiClient__ } = useApi();
    const location = useLocation();
    const dialogRef = useRef<HTMLDivElement>(null);
    const currentUserId = user?.Id;
    const serverId = __legacyApiClient__?.serverId();
    const [ profiles, setProfiles ] = useState<VelarisPublicProfile[] | null>(null);
    const [ dismissedScope, setDismissedScope ] = useState<string | null>(null);
    const [ pendingProfile, setPendingProfile ] = useState<VelarisPublicProfile | null>(null);
    const [ credential, setCredential ] = useState('');
    const [ errorMessage, setErrorMessage ] = useState('');
    const [ isSwitching, setIsSwitching ] = useState(false);

    useEffect(() => {
        if (!currentUserId || !serverId || !__legacyApiClient__) return;

        let active = true;
        __legacyApiClient__.getPublicUsers()
            .then((publicProfiles: VelarisPublicProfile[]) => {
                if (active) setProfiles(publicProfiles || []);
            })
            .catch((error: unknown) => {
                console.debug('[VelarisProfiles] startup profile discovery unavailable', error);
                if (active) setProfiles([]);
            });

        return () => {
            active = false;
        };
    }, [ __legacyApiClient__, currentUserId, serverId ]);

    const chosenProfileId = serverId ?
        getChosenVelarisProfileId(getVelarisSessionStorage(), serverId) :
        null;
    const currentScope = currentUserId && serverId ?
        `${serverId}:${currentUserId}:${location.key}` :
        null;

    const isOpen = Boolean(
        currentScope
        && dismissedScope !== currentScope
        && profiles
        && currentUserId
        && shouldShowVelarisProfilePicker(profiles, currentUserId, chosenProfileId)
    );

    const authenticateProfile = useCallback(async (
        profile: VelarisPublicProfile,
        password: string
    ) => {
        if (!profile.Id || !profile.Name || !serverId || !__legacyApiClient__) return;

        setIsSwitching(true);
        setErrorMessage('');
        try {
            const result = await __legacyApiClient__.authenticateUserByName(profile.Name, password);
            if (!result?.User?.Id || !result.AccessToken) {
                throw new Error('Profile authentication returned an incomplete response');
            }

            queryClient.clear();
            viewContainer.reset();
            Dashboard.onServerChanged(result.User.Id, result.AccessToken, __legacyApiClient__);
            markVelarisProfileChosen(getVelarisSessionStorage(), serverId, result.User.Id);
            setPendingProfile(null);
            setCredential('');
            setDismissedScope(currentScope);
            void Dashboard.navigate('home');
        } catch (error) {
            console.warn('[VelarisProfiles] profile switch authentication failed', error);
            setErrorMessage(profile.HasPassword ?
                'PIN oder Passwort ist nicht korrekt.' :
                'Dieses Profil konnte nicht geöffnet werden.');
        } finally {
            setIsSwitching(false);
        }
    }, [ __legacyApiClient__, currentScope, serverId ]);

    const chooseProfile = useCallback((profile: VelarisPublicProfile) => {
        if (!serverId || !currentUserId || !profile.Id) return;

        if (profile.Id === currentUserId) {
            markVelarisProfileChosen(getVelarisSessionStorage(), serverId, currentUserId);
            setDismissedScope(currentScope);
            return;
        }

        if (profile.HasPassword) {
            setCredential('');
            setErrorMessage('');
            setPendingProfile(profile);
            return;
        }

        void authenticateProfile(profile, '');
    }, [ authenticateProfile, currentScope, currentUserId, serverId ]);

    const onProfileClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
        const profileId = event.currentTarget.dataset.profileId;
        const profile = profiles?.find(candidate => candidate.Id === profileId);
        if (profile) chooseProfile(profile);
    }, [ chooseProfile, profiles ]);

    const onCredentialChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setCredential(event.target.value);
    }, []);

    const onCredentialSubmit = useCallback((event: React.FormEvent) => {
        event.preventDefault();
        if (pendingProfile) void authenticateProfile(pendingProfile, credential);
    }, [ authenticateProfile, credential, pendingProfile ]);

    const onCredentialCancel = useCallback(() => {
        setPendingProfile(null);
        setCredential('');
        setErrorMessage('');
    }, []);

    const onDialogKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Escape' && pendingProfile) {
            event.preventDefault();
            onCredentialCancel();
            return;
        }
        if (event.key !== 'Tab' || !dialogRef.current) return;

        const focusableElements = getVelarisDialogFocusableElements(dialogRef.current);
        const wrapTarget = getVelarisDialogFocusWrapTarget(
            document.activeElement,
            focusableElements,
            event.shiftKey
        );
        if (!wrapTarget) return;

        event.preventDefault();
        wrapTarget.focus();
    }, [ onCredentialCancel, pendingProfile ]);

    useEffect(() => {
        if (!isOpen || pendingProfile) return;

        const focusTimer = window.setTimeout(() => {
            const firstTarget = dialogRef.current ?
                getVelarisDialogFocusableElements(dialogRef.current)[0] :
                undefined;
            firstTarget?.focus();
        }, 0);

        return () => window.clearTimeout(focusTimer);
    }, [ isOpen, pendingProfile ]);

    if (!isOpen || !profiles || !serverId || !__legacyApiClient__) return null;

    return (
        <div
            ref={dialogRef}
            className='velaris-profile-gate'
            role='dialog'
            aria-modal='true'
            aria-labelledby='velaris-profile-gate-title'
            aria-describedby='velaris-profile-gate-description'
            aria-busy={isSwitching}
            tabIndex={-1}
            onKeyDown={onDialogKeyDown}
        >
            <div className='velaris-profile-gate__ambient' aria-hidden='true' />
            <div className='velaris-profile-gate__panel'>
                <span className='velaris-profile-gate__eyebrow'>VELARIS PROFILES</span>
                <h1 id='velaris-profile-gate-title'>Wer schaut gerade?</h1>
                <p id='velaris-profile-gate-description'>
                    Wähle dein Profil. Verlauf, Empfehlungen und Velaris-Einstellungen bleiben voneinander getrennt.
                </p>

                <div className='velaris-profile-gate__grid'>
                    {profiles.filter(profile => profile.Id && profile.Name).map(profile => {
                        const profileId = profile.Id as string;
                        const preferences = readVelarisProfilePreferences(
                            getVelarisLocalStorage(),
                            serverId,
                            profileId
                        );
                        const imageUrl = profile.PrimaryImageTag ? __legacyApiClient__.getUserImageUrl(profileId, {
                            width: 360,
                            tag: profile.PrimaryImageTag,
                            type: 'Primary'
                        }) : undefined;

                        return (
                            <button
                                key={profileId}
                                type='button'
                                className='velaris-profile-gate__profile'
                                data-profile-id={profileId}
                                data-accent={preferences.accent}
                                onClick={onProfileClick}
                                disabled={isSwitching}
                            >
                                <span
                                    className='velaris-profile-gate__avatar'
                                    style={imageUrl ? { backgroundImage: `url("${imageUrl}")` } : undefined}
                                >
                                    {!imageUrl && <span className='material-icons' aria-hidden='true'>person</span>}
                                </span>
                                <strong>{profile.Name}</strong>
                                <span className='velaris-profile-gate__badges'>
                                    {preferences.kidsMode && <span>KIDS</span>}
                                    {profile.HasPassword && (
                                        <span><span className='material-icons' aria-hidden='true'>lock</span> GESCHÜTZT</span>
                                    )}
                                    {profileId === currentUserId && <span>AKTIV</span>}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {pendingProfile && (
                    <form className='velaris-profile-gate__credential' onSubmit={onCredentialSubmit}>
                        <strong>{pendingProfile.Name} entsperren</strong>
                        <span>Gib den Profil-PIN oder das Jellyfin-Passwort ein.</span>
                        <input
                            type='password'
                            value={credential}
                            onChange={onCredentialChange}
                            autoComplete='current-password'
                            aria-label={`PIN oder Passwort für ${pendingProfile.Name}`}
                            autoFocus
                        />
                        {errorMessage && <span className='velaris-profile-gate__error' role='alert'>{errorMessage}</span>}
                        <div>
                            <button type='button' className='raised cancel' onClick={onCredentialCancel} disabled={isSwitching}>Zurück</button>
                            <button type='submit' className='raised button-submit' disabled={isSwitching || !credential}>Öffnen</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default VelarisProfileGate;
