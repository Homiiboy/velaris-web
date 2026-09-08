import React, { type FC, useCallback, useEffect, useMemo, useState } from 'react';

import { useApi } from 'hooks/useApi';
import Dashboard from 'utils/dashboard';

import {
    getChosenVelarisProfileId,
    markVelarisProfileChosen,
    readVelarisProfilePreferences,
    shouldShowVelarisProfilePicker,
    type VelarisPublicProfile
} from './profiles';

const VelarisProfileGate: FC = () => {
    const { user, __legacyApiClient__ } = useApi();
    const currentUserId = user?.Id;
    const serverId = __legacyApiClient__?.serverId();
    const [ profiles, setProfiles ] = useState<VelarisPublicProfile[] | null>(null);
    const [ dismissed, setDismissed ] = useState(false);

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

    const chosenProfileId = useMemo(() => {
        if (!serverId) return null;
        return getChosenVelarisProfileId(window.sessionStorage, serverId);
    }, [ serverId ]);

    const isOpen = Boolean(
        !dismissed &&
        profiles &&
        currentUserId &&
        shouldShowVelarisProfilePicker(profiles, currentUserId, chosenProfileId)
    );

    const chooseProfile = useCallback((profileId: string) => {
        if (!serverId || !currentUserId) return;

        if (profileId === currentUserId) {
            markVelarisProfileChosen(window.sessionStorage, serverId, currentUserId);
            setDismissed(true);
            return;
        }

        Dashboard.switchProfile(profileId);
    }, [ currentUserId, serverId ]);

    const onProfileClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
        const profileId = event.currentTarget.dataset.profileId;
        if (profileId) chooseProfile(profileId);
    }, [ chooseProfile ]);

    if (!isOpen || !profiles || !serverId || !__legacyApiClient__) return null;

    return (
        <div className='velaris-profile-gate' role='dialog' aria-modal='true' aria-labelledby='velaris-profile-gate-title'>
            <div className='velaris-profile-gate__ambient' aria-hidden='true' />
            <div className='velaris-profile-gate__panel'>
                <span className='velaris-profile-gate__eyebrow'>VELARIS PROFILES</span>
                <h1 id='velaris-profile-gate-title'>Wer schaut gerade?</h1>
                <p>Wähle dein Profil. Verlauf, Empfehlungen und Velaris-Einstellungen bleiben voneinander getrennt.</p>

                <div className='velaris-profile-gate__grid'>
                    {profiles.filter(profile => profile.Id && profile.Name).map(profile => {
                        const profileId = profile.Id as string;
                        const preferences = readVelarisProfilePreferences(window.localStorage, serverId, profileId);
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
                                        <span><span className='material-icons' aria-hidden='true'>lock</span> PIN</span>
                                    )}
                                    {profileId === currentUserId && <span>AKTIV</span>}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default VelarisProfileGate;
