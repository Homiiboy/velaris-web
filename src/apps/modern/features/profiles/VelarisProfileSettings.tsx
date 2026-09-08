import type { UserDto } from '@jellyfin/sdk/lib/generated-client';
import React, { type FC, useCallback, useEffect, useState } from 'react';

import toast from 'components/toast/toast';
import globalize from 'lib/globalize';
import Dashboard from 'utils/dashboard';
import { queryClient } from 'utils/query/queryClient';

import {
    clearVelarisProfileChoice,
    isValidVelarisProfilePin,
    VELARIS_PROFILE_ACCENTS,
    type VelarisProfileAccent
} from './profiles';
import { useVelarisProfilePreferences } from './useVelarisProfilePreferences';

interface VelarisProfileSettingsProps {
    user: UserDto
}

type SubtitleMode = 'Default' | 'Smart' | 'OnlyForced' | 'Always' | 'None';

type PasswordAwareUser = UserDto & {
    HasConfiguredPassword?: boolean
};

const LANGUAGE_OPTIONS = [
    { value: '', label: 'Serverstandard' },
    { value: 'deu', label: 'Deutsch' },
    { value: 'eng', label: 'English' },
    { value: 'fra', label: 'Français' },
    { value: 'ita', label: 'Italiano' },
    { value: 'spa', label: 'Español' },
    { value: 'jpn', label: '日本語' }
];

const SUBTITLE_MODE_OPTIONS: { value: SubtitleMode; label: string }[] = [
    { value: 'Default', label: 'Standard' },
    { value: 'Smart', label: 'Smart' },
    { value: 'OnlyForced', label: 'Nur erzwungene Untertitel' },
    { value: 'Always', label: 'Immer' },
    { value: 'None', label: 'Nie' }
];

const VelarisProfileSettings: FC<VelarisProfileSettingsProps> = ({ user }) => {
    const { preferences, patchPreferences, serverId } = useVelarisProfilePreferences();
    const [ audioLanguage, setAudioLanguage ] = useState('');
    const [ subtitleLanguage, setSubtitleLanguage ] = useState('');
    const [ subtitleMode, setSubtitleMode ] = useState<SubtitleMode>('Default');
    const [ currentCredential, setCurrentCredential ] = useState('');
    const [ pin, setPin ] = useState('');
    const [ pinConfirmation, setPinConfirmation ] = useState('');
    const [ savingPlayback, setSavingPlayback ] = useState(false);
    const [ savingPin, setSavingPin ] = useState(false);
    const hasConfiguredPassword = Boolean((user as PasswordAwareUser).HasConfiguredPassword);

    useEffect(() => {
        setAudioLanguage(user.Configuration?.AudioLanguagePreference || '');
        setSubtitleLanguage(user.Configuration?.SubtitleLanguagePreference || '');
        setSubtitleMode((user.Configuration?.SubtitleMode as SubtitleMode) || 'Default');
    }, [ user.Configuration ]);

    const onAccentClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
        const accent = event.currentTarget.dataset.accent as VelarisProfileAccent | undefined;
        if (accent) patchPreferences({ accent });
    }, [ patchPreferences ]);

    const onKidsModeChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        patchPreferences({ kidsMode: event.target.checked });
    }, [ patchPreferences ]);

    const onSwitchProfile = useCallback(() => {
        if (!serverId) return;

        clearVelarisProfileChoice(window.sessionStorage, serverId);
        void Dashboard.navigate('home');
    }, [ serverId ]);

    const onAudioLanguageChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
        setAudioLanguage(event.target.value);
    }, []);

    const onSubtitleLanguageChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
        setSubtitleLanguage(event.target.value);
    }, []);

    const onSubtitleModeChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
        setSubtitleMode(event.target.value as SubtitleMode);
    }, []);

    const onCurrentCredentialChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentCredential(event.target.value);
    }, []);

    const onPinChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setPin(event.target.value);
    }, []);

    const onPinConfirmationChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setPinConfirmation(event.target.value);
    }, []);

    const savePlaybackPreferences = useCallback(async () => {
        if (!user.Id || !user.Configuration) return;

        setSavingPlayback(true);
        try {
            await window.ApiClient.updateUserConfiguration(user.Id, {
                ...user.Configuration,
                AudioLanguagePreference: audioLanguage,
                SubtitleLanguagePreference: subtitleLanguage,
                SubtitleMode: subtitleMode,
                RememberAudioSelections: true,
                RememberSubtitleSelections: true
            });
            await queryClient.invalidateQueries({ queryKey: [ 'User' ] });
            toast(globalize.translate('SettingsSaved'));
        } catch (error) {
            console.error('[VelarisProfiles] unable to save playback preferences', error);
            toast(globalize.translate('HeaderError'));
        } finally {
            setSavingPlayback(false);
        }
    }, [ audioLanguage, subtitleLanguage, subtitleMode, user.Configuration, user.Id ]);

    const savePin = useCallback(async (event: React.FormEvent) => {
        event.preventDefault();
        if (!user.Id) return;

        if (!isValidVelarisProfilePin(pin)) {
            toast('Der Profil-PIN muss aus 4 bis 8 Ziffern bestehen.');
            return;
        }
        if (pin !== pinConfirmation) {
            toast('Die beiden PINs stimmen nicht überein.');
            return;
        }

        setSavingPin(true);
        try {
            await window.ApiClient.updateUserPassword(user.Id, currentCredential, pin);
            setCurrentCredential('');
            setPin('');
            setPinConfirmation('');
            await queryClient.invalidateQueries({ queryKey: [ 'User' ] });
            toast('Profil-PIN gespeichert.');
        } catch (error) {
            console.error('[VelarisProfiles] unable to save profile PIN', error);
            toast('Profil-PIN konnte nicht gespeichert werden. Prüfe dein aktuelles Passwort.');
        } finally {
            setSavingPin(false);
        }
    }, [ currentCredential, pin, pinConfirmation, user.Id ]);

    return (
        <section className='velaris-profile-2-settings' aria-labelledby='velaris-profile-2-title'>
            <div className='velaris-profile-2-settings__heading'>
                <span>PROFILES 2.0</span>
                <h2 id='velaris-profile-2-title'>Dein Velaris Profil</h2>
                <p>Darstellung, Home, Wiedergabe und Profilzugriff bleiben an dein aktuelles Profil gebunden.</p>
            </div>

            <div className='velaris-profile-2-settings__grid'>
                <article className='velaris-profile-2-card'>
                    <h3>Profilfarbe</h3>
                    <p>Dein Akzent markiert Avatar, Profilwahl und persönliche Velaris-Flächen.</p>
                    <div className='velaris-profile-accents' role='group' aria-label='Profilfarbe'>
                        {VELARIS_PROFILE_ACCENTS.map(accent => (
                            <button
                                key={accent}
                                type='button'
                                className='velaris-profile-accent'
                                data-accent={accent}
                                data-selected={preferences.accent === accent}
                                onClick={onAccentClick}
                                aria-label={`Profilfarbe ${accent}`}
                                aria-pressed={preferences.accent === accent}
                            />
                        ))}
                    </div>
                </article>

                <article className='velaris-profile-2-card'>
                    <h3>Kids Mode</h3>
                    <label className='velaris-profile-toggle'>
                        <input type='checkbox' checked={preferences.kidsMode} onChange={onKidsModeChange} />
                        <span>Velaris Kids Mode für dieses Profil</span>
                    </label>
                    <p className='velaris-profile-2-note'>
                        Kids Mode vereinfacht die Velaris-Oberfläche. Welche Medien wirklich erreichbar sind,
                        wird weiterhin sicher durch die Jellyfin-Berechtigungen dieses Users bestimmt.
                    </p>
                </article>

                <article className='velaris-profile-2-card velaris-profile-2-card--wide'>
                    <h3>Profil wechseln</h3>
                    <p>Öffne die Velaris-Profilwahl erneut, ohne Server oder App zu verlassen.</p>
                    <button type='button' className='raised' onClick={onSwitchProfile} disabled={!serverId}>
                        Wer schaut gerade?
                    </button>
                </article>

                <article className='velaris-profile-2-card velaris-profile-2-card--wide'>
                    <h3>Audio & Untertitel</h3>
                    <p>Diese Einstellungen werden serverseitig im Jellyfin-Profil gespeichert und bei der Wiedergabe verwendet.</p>
                    <div className='velaris-profile-playback-grid'>
                        <label>
                            <span>Bevorzugte Audiosprache</span>
                            <select value={audioLanguage} onChange={onAudioLanguageChange}>
                                {LANGUAGE_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                            </select>
                        </label>
                        <label>
                            <span>Bevorzugte Untertitelsprache</span>
                            <select value={subtitleLanguage} onChange={onSubtitleLanguageChange}>
                                {LANGUAGE_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                            </select>
                        </label>
                        <label>
                            <span>Untertitelmodus</span>
                            <select value={subtitleMode} onChange={onSubtitleModeChange}>
                                {SUBTITLE_MODE_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                            </select>
                        </label>
                    </div>
                    <button type='button' className='raised button-submit' onClick={savePlaybackPreferences} disabled={savingPlayback}>
                        Wiedergabepräferenzen speichern
                    </button>
                </article>

                <article className='velaris-profile-2-card velaris-profile-2-card--wide'>
                    <h3>Profil-PIN</h3>
                    <p>
                        Der PIN wird nicht in Velaris gespeichert. Er ersetzt die Jellyfin-Anmeldeinformation dieses Profils
                        und wird bei einem Profilwechsel vom Server geprüft.
                    </p>
                    <form className='velaris-profile-pin-form' onSubmit={savePin}>
                        {hasConfiguredPassword && (
                            <label>
                                <span>Aktuelles Passwort / aktueller PIN</span>
                                <input
                                    type='password'
                                    value={currentCredential}
                                    onChange={onCurrentCredentialChange}
                                    autoComplete='current-password'
                                />
                            </label>
                        )}
                        <label>
                            <span>Neuer PIN (4–8 Ziffern)</span>
                            <input
                                type='password'
                                inputMode='numeric'
                                pattern='[0-9]{4,8}'
                                value={pin}
                                onChange={onPinChange}
                                autoComplete='new-password'
                            />
                        </label>
                        <label>
                            <span>PIN bestätigen</span>
                            <input
                                type='password'
                                inputMode='numeric'
                                pattern='[0-9]{4,8}'
                                value={pinConfirmation}
                                onChange={onPinConfirmationChange}
                                autoComplete='new-password'
                            />
                        </label>
                        <button type='submit' className='raised button-submit' disabled={savingPin}>Profil-PIN speichern</button>
                    </form>
                </article>

                <article className='velaris-profile-2-card velaris-profile-2-card--wide'>
                    <h3>Home & Empfehlungen</h3>
                    <p>
                        Reihenfolge und Sichtbarkeit deiner Smart-Home-Bereiche werden bereits pro Jellyfin-Profil gespeichert.
                        Empfehlungen werden weiterhin aus den für dieses Profil sichtbaren Servermedien und seinem individuellen
                        Wiedergabeverlauf erzeugt.
                    </p>
                </article>
            </div>
        </section>
    );
};

export default VelarisProfileSettings;
