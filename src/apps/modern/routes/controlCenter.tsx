import React, { type ChangeEvent, useCallback } from 'react';

import Page from 'components/Page';

import {
    type VelarisAnimationMode,
    type VelarisDensity,
    type VelarisHeroMode,
    type VelarisNavigationMode,
    type VelarisThemePreset
} from '../features/controlCenter/controlCenter';
import { useVelarisControlCenterPreferences } from '../features/controlCenter/useVelarisControlCenterPreferences';

const ControlCenter = () => {
    const {
        preferences,
        patchPreferences,
        resetPreferences,
        userId,
        serverId
    } = useVelarisControlCenterPreferences();

    const onSelectChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = event.currentTarget;
        switch (name) {
            case 'themePreset':
                patchPreferences({ themePreset: value as VelarisThemePreset });
                break;
            case 'density':
                patchPreferences({ density: value as VelarisDensity });
                break;
            case 'animationMode':
                patchPreferences({ animationMode: value as VelarisAnimationMode });
                break;
            case 'heroMode':
                patchPreferences({ heroMode: value as VelarisHeroMode });
                break;
            case 'navigationMode':
                patchPreferences({ navigationMode: value as VelarisNavigationMode });
                break;
            default:
                break;
        }
    }, [ patchPreferences ]);

    const onToggleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = event.currentTarget;
        switch (name) {
            case 'showSmartHome':
                patchPreferences({ showSmartHome: checked });
                break;
            case 'showDiscovery':
                patchPreferences({ showDiscovery: checked });
                break;
            case 'showFranchises':
                patchPreferences({ showFranchises: checked });
                break;
            case 'advancedPlayerEnabled':
                patchPreferences({ advancedPlayerEnabled: checked });
                break;
            default:
                break;
        }
    }, [ patchPreferences ]);

    const onAccentChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        patchPreferences({ customAccent: event.currentTarget.value });
    }, [ patchPreferences ]);

    const onResetClick = useCallback(() => {
        resetPreferences();
    }, [ resetPreferences ]);

    return (
        <Page
            id='velarisControlCenterPage'
            className='mainAnimatedPage velaris-control-center-page'
        >
            <main className='velaris-control-center'>
                <header className='velaris-control-center__hero'>
                    <div>
                        <span className='velaris-control-center__eyebrow'>VELARIS</span>
                        <h1>Control Center</h1>
                        <p>
                            Passe Oberfläche und sichtbare Velaris-Funktionen für dieses Profil an.
                            Server-Berechtigungen, Medien und Jellyfin-Playback bleiben unverändert.
                        </p>
                    </div>
                    <button
                        type='button'
                        className='velaris-control-center__reset'
                        onClick={onResetClick}
                    >
                        Standard wiederherstellen
                    </button>
                </header>

                {!userId || !serverId ? (
                    <section className='velaris-control-center__notice'>
                        Das Control Center benötigt ein angemeldetes Profil und einen aktiven Server.
                    </section>
                ) : (
                    <div className='velaris-control-center__grid'>
                        <section className='velaris-control-center__card velaris-control-center__card--theme'>
                            <div className='velaris-control-center__card-heading'>
                                <span className='material-icons' aria-hidden='true'>palette</span>
                                <div>
                                    <h2>Theme Customizer</h2>
                                    <p>Grundlook und Akzent des Velaris-Frontends.</p>
                                </div>
                            </div>

                            <label className='velaris-control-center__field'>
                                <span>Theme</span>
                                <select
                                    data-velaris-tv-focus='primary'
                                    name='themePreset'
                                    value={preferences.themePreset}
                                    onChange={onSelectChange}
                                >
                                    <option value='default'>Velaris Default</option>
                                    <option value='oled'>OLED Black</option>
                                    <option value='midnight'>Midnight</option>
                                    <option value='aurora'>Aurora</option>
                                    <option value='custom'>Custom Accent</option>
                                </select>
                            </label>

                            <label className='velaris-control-center__field velaris-control-center__field--color'>
                                <span>Eigener Akzent</span>
                                <span className='velaris-control-center__color-row'>
                                    <input
                                        type='color'
                                        name='customAccent'
                                        value={preferences.customAccent}
                                        onChange={onAccentChange}
                                        aria-label='Eigene Akzentfarbe'
                                    />
                                    <code>{preferences.customAccent}</code>
                                </span>
                            </label>

                            <div className='velaris-control-center__theme-preview' aria-hidden='true'>
                                <span className='velaris-control-center__theme-preview-glow'></span>
                                <strong>VELARIS</strong>
                                <span>Preview</span>
                            </div>
                        </section>

                        <section className='velaris-control-center__card'>
                            <div className='velaris-control-center__card-heading'>
                                <span className='material-icons' aria-hidden='true'>home</span>
                                <div>
                                    <h2>Home & Hero</h2>
                                    <p>Bestimme, wie präsent die Startseite auftritt.</p>
                                </div>
                            </div>

                            <label className='velaris-control-center__field'>
                                <span>Hero</span>
                                <select
                                    name='heroMode'
                                    value={preferences.heroMode}
                                    onChange={onSelectChange}
                                >
                                    <option value='cinematic'>Cinematic</option>
                                    <option value='compact'>Kompakt</option>
                                    <option value='hidden'>Ausblenden</option>
                                </select>
                            </label>

                            <div className='velaris-control-center__toggle'>
                                <input
                                    id='velaris-control-center-smart-home'
                                    type='checkbox'
                                    name='showSmartHome'
                                    checked={preferences.showSmartHome}
                                    onChange={onToggleChange}
                                    aria-label='Smart Home anzeigen'
                                />
                                <span>
                                    <strong>Smart Home</strong>
                                    <small>Persönliche Reihen und Weiterschauen auf Home anzeigen.</small>
                                </span>
                            </div>
                        </section>

                        <section className='velaris-control-center__card'>
                            <div className='velaris-control-center__card-heading'>
                                <span className='material-icons' aria-hidden='true'>dashboard_customize</span>
                                <div>
                                    <h2>Navigation & Dichte</h2>
                                    <p>Abstände, Navigationsbreite und Bewegungsverhalten.</p>
                                </div>
                            </div>

                            <label className='velaris-control-center__field'>
                                <span>Navigation</span>
                                <select
                                    name='navigationMode'
                                    value={preferences.navigationMode}
                                    onChange={onSelectChange}
                                >
                                    <option value='full'>Voll</option>
                                    <option value='compact'>Kompakt</option>
                                </select>
                            </label>

                            <label className='velaris-control-center__field'>
                                <span>Dichte</span>
                                <select
                                    name='density'
                                    value={preferences.density}
                                    onChange={onSelectChange}
                                >
                                    <option value='comfortable'>Komfortabel</option>
                                    <option value='compact'>Kompakt</option>
                                    <option value='spacious'>Großzügig</option>
                                </select>
                            </label>

                            <label className='velaris-control-center__field'>
                                <span>Animationen</span>
                                <select
                                    name='animationMode'
                                    value={preferences.animationMode}
                                    onChange={onSelectChange}
                                >
                                    <option value='full'>Voll</option>
                                    <option value='reduced'>Reduziert</option>
                                    <option value='off'>Aus</option>
                                </select>
                            </label>
                        </section>

                        <section className='velaris-control-center__card'>
                            <div className='velaris-control-center__card-heading'>
                                <span className='material-icons' aria-hidden='true'>tune</span>
                                <div>
                                    <h2>Feature Toggles</h2>
                                    <p>Velaris-Funktionsflächen pro Profil ein- oder ausblenden.</p>
                                </div>
                            </div>

                            <div className='velaris-control-center__toggle'>
                                <input
                                    id='velaris-control-center-discovery'
                                    type='checkbox'
                                    name='showDiscovery'
                                    checked={preferences.showDiscovery}
                                    onChange={onToggleChange}
                                    aria-label='Discovery anzeigen'
                                />
                                <span>
                                    <strong>Discovery</strong>
                                    <small>Entdecken in Desktop- und Mobile-Navigation anzeigen.</small>
                                </span>
                            </div>

                            <div className='velaris-control-center__toggle'>
                                <input
                                    id='velaris-control-center-franchises'
                                    type='checkbox'
                                    name='showFranchises'
                                    checked={preferences.showFranchises}
                                    onChange={onToggleChange}
                                    aria-label='Franchises und Studio anzeigen'
                                />
                                <span>
                                    <strong>Franchises & Studio</strong>
                                    <small>Franchise-Shelf und Franchise-Studio-Einstieg anzeigen.</small>
                                </span>
                            </div>

                            <div className='velaris-control-center__toggle'>
                                <input
                                    id='velaris-control-center-advanced-player'
                                    type='checkbox'
                                    name='advancedPlayerEnabled'
                                    checked={preferences.advancedPlayerEnabled}
                                    onChange={onToggleChange}
                                    aria-label='Advanced Player anzeigen'
                                />
                                <span>
                                    <strong>Advanced Player</strong>
                                    <small>Den Velaris-Advanced-Player-Zugang im Video-OSD anzeigen.</small>
                                </span>
                            </div>
                        </section>
                    </div>
                )}
            </main>
        </Page>
    );
};

export default ControlCenter;
