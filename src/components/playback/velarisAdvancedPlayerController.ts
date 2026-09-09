import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client/models/base-item-dto';
import type { MediaSegmentDto } from '@jellyfin/sdk/lib/generated-client/models/media-segment-dto';
import type { MediaSourceInfo } from '@jellyfin/sdk/lib/generated-client/models/media-source-info';

import { PlaybackSubscriber } from 'apps/legacy/features/playback/utils/playbackSubscriber';
import { ServerConnections } from 'lib/jellyfin-apiclient';

import type { PlaybackManager } from './playbackmanager';
import {
    DEFAULT_VELARIS_ADVANCED_PLAYER_PREFERENCES,
    formatVelarisChapterTime,
    getVelarisPlayMethodLabel,
    getVelarisQualityPreset,
    getVelarisQueueWindow,
    readVelarisAdvancedPlayerPreferences,
    saveVelarisAdvancedPlayerPreferences,
    VELARIS_QUALITY_PRESETS,
    type VelarisAdvancedPlayerPreferences,
    type VelarisQualityPreset
} from './velarisAdvancedPlayer';

interface PlaybackTrack {
    Index?: number | null
    DisplayTitle?: string | null
    Title?: string | null
    Language?: string | null
    Codec?: string | null
    Channels?: number | null
    Width?: number | null
    Height?: number | null
    BitRate?: number | null
    Type?: string | null
}

interface PlayerStateLike {
    PlayState?: {
        PlayMethod?: string | null
    } | null
}

interface PlayerScope {
    serverId: string
    userId: string
}

const BOUND_ATTRIBUTE = 'data-velaris-advanced-bound';
const PANEL_SELECTOR = '.velaris-advanced-player-panel';
const BUTTON_SELECTOR = '.btnVelarisAdvanced';
const TECH_SELECTOR = '.velaris-player-technical-overlay';
const TRANSITION_SELECTOR = '.velaris-player-segment-transition';
const MAX_QUEUE_ITEMS = 5;
const SEGMENT_TRANSITION_DURATION_MS = 6500;

const createTextElement = (tagName: string, className: string, text: string) => {
    const element = document.createElement(tagName);
    element.className = className;
    element.textContent = text;
    return element;
};

const getTrackLabel = (track: PlaybackTrack, fallback: string) => (
    track.DisplayTitle || track.Title || track.Language || track.Codec || fallback
);

const getItemLabel = (item: BaseItemDto) => {
    if (item.SeriesName && item.IndexNumber != null) {
        const season = item.ParentIndexNumber != null ? `S${item.ParentIndexNumber}` : '';
        const episode = `E${item.IndexNumber}`;
        return `${item.SeriesName} · ${season}${episode} · ${item.Name || 'Episode'}`;
    }

    return item.Name || 'Nächster Titel';
};

const getSegmentLabel = (segment: MediaSegmentDto) => {
    const type = String(segment.Type || '').toLowerCase();
    if (type === 'intro') return 'Intro erkannt';
    if (type === 'outro') return 'Credits erkannt';
    if (type === 'recap') return 'Rückblick erkannt';
    if (type === 'preview') return 'Vorschau erkannt';
    if (type === 'commercial') return 'Unterbrechung erkannt';
    return 'Segment erkannt';
};

class VelarisAdvancedPlayerController extends PlaybackSubscriber {
    private preferences: VelarisAdvancedPlayerPreferences = {
        ...DEFAULT_VELARIS_ADVANCED_PLAYER_PREFERENCES
    };

    private panelOpen = false;
    private transitionTimeout: ReturnType<typeof setTimeout> | null = null;

    constructor(playbackManager: PlaybackManager) {
        super(playbackManager);
        queueMicrotask(() => {
            this.refreshPreferences();
            this.ensureUi();
        });
    }

    private getCurrentItem() {
        if (!this.player) return undefined;
        return this.playbackManager.currentItem(this.player) as BaseItemDto | undefined;
    }

    private getScope(): PlayerScope | null {
        const item = this.getCurrentItem();
        if (!item?.ServerId) return null;

        const apiClient = ServerConnections.getApiClient(item.ServerId);
        const userId = apiClient?.getCurrentUserId();
        if (!userId) return null;

        return {
            serverId: item.ServerId,
            userId
        };
    }

    private refreshPreferences() {
        const scope = this.getScope();
        this.preferences = scope ?
            readVelarisAdvancedPlayerPreferences(window.localStorage, scope.serverId, scope.userId) :
            { ...DEFAULT_VELARIS_ADVANCED_PLAYER_PREFERENCES };
    }

    private savePreferences(next: VelarisAdvancedPlayerPreferences) {
        this.preferences = next;
        const scope = this.getScope();
        if (!scope) return;

        try {
            saveVelarisAdvancedPlayerPreferences(
                window.localStorage,
                scope.serverId,
                scope.userId,
                next
            );
        } catch (error) {
            console.warn('[VelarisAdvancedPlayer] unable to save preferences', error);
        }
    }

    private ensureUi() {
        const page = document.querySelector<HTMLElement>('#videoOsdPage');
        if (!page) return false;

        const actions = page.querySelector<HTMLElement>('.velaris-player-actions');
        const settingsButton = page.querySelector<HTMLElement>('.btnVideoOsdSettings');
        const controlSurface = page.querySelector<HTMLElement>('.velaris-player-control-surface');
        if (!actions || !settingsButton || !controlSurface) return false;

        let button = page.querySelector<HTMLButtonElement>(BUTTON_SELECTOR);
        if (!button) {
            button = document.createElement('button');
            button.type = 'button';
            button.className = 'btnVelarisAdvanced autoSize paper-icon-button-light';
            button.title = 'Advanced Player';
            button.setAttribute('aria-label', 'Advanced Player');
            button.setAttribute('aria-expanded', 'false');
            button.innerHTML = '<span class="largePaperIconButton material-icons tune" aria-hidden="true"></span>';
            actions.insertBefore(button, settingsButton);
        }

        if (!button.hasAttribute(BOUND_ATTRIBUTE)) {
            button.setAttribute(BOUND_ATTRIBUTE, 'true');
            button.addEventListener('click', () => this.togglePanel());
        }

        let panel = page.querySelector<HTMLElement>(PANEL_SELECTOR);
        if (!panel) {
            panel = this.createPanel();
            controlSurface.insertBefore(panel, controlSurface.querySelector('.velaris-player-actions'));
        }

        if (!panel.hasAttribute(BOUND_ATTRIBUTE)) {
            panel.setAttribute(BOUND_ATTRIBUTE, 'true');
            panel.addEventListener('click', event => this.onPanelClick(event));
            panel.addEventListener('keydown', event => {
                if (event.key === 'Escape') {
                    this.closePanel(true);
                }
            });
        }

        if (!page.querySelector(TECH_SELECTOR)) {
            const technicalOverlay = document.createElement('div');
            technicalOverlay.className = 'velaris-player-technical-overlay hide';
            technicalOverlay.setAttribute('aria-live', 'polite');
            page.append(technicalOverlay);
        }

        if (!page.querySelector(TRANSITION_SELECTOR)) {
            const transition = document.createElement('div');
            transition.className = 'velaris-player-segment-transition hide';
            transition.setAttribute('role', 'status');
            page.append(transition);
        }

        this.updateTechnicalOverlay();
        return true;
    }

    private createPanel() {
        const panel = document.createElement('section');
        panel.className = 'velaris-advanced-player-panel hide';
        panel.setAttribute('aria-label', 'Advanced Player');

        const header = document.createElement('header');
        header.className = 'velaris-advanced-player-panel__header';
        const heading = document.createElement('div');
        heading.append(
            createTextElement('span', 'velaris-advanced-player-panel__eyebrow', 'ADVANCED PLAYER'),
            createTextElement('strong', 'velaris-advanced-player-panel__title', 'Wiedergabe')
        );
        const closeButton = document.createElement('button');
        closeButton.type = 'button';
        closeButton.className = 'velaris-advanced-player-panel__close';
        closeButton.dataset.action = 'close';
        closeButton.setAttribute('aria-label', 'Advanced Player schließen');
        closeButton.innerHTML = '<span class="material-icons close" aria-hidden="true"></span>';
        header.append(heading, closeButton);

        const grid = document.createElement('div');
        grid.className = 'velaris-advanced-player-panel__grid';
        grid.append(
            this.createSection('next', 'Nächste Episode'),
            this.createSection('quality', 'Qualität'),
            this.createSection('audio', 'Audio'),
            this.createSection('subtitles', 'Untertitel'),
            this.createSection('chapters', 'Kapitel'),
            this.createSection('queue', 'Episode Queue'),
            this.createSection('technical', 'Technik & Übergänge')
        );
        panel.append(header, grid);
        return panel;
    }

    private createSection(id: string, title: string) {
        const section = document.createElement('div');
        section.className = `velaris-advanced-player-section velaris-advanced-player-section--${id}`;
        section.dataset.section = id;
        section.append(
            createTextElement('span', 'velaris-advanced-player-section__title', title),
            createTextElement('div', 'velaris-advanced-player-section__content', '')
        );
        return section;
    }

    private getSectionContent(id: string) {
        return document.querySelector<HTMLElement>(
            `#videoOsdPage ${PANEL_SELECTOR} [data-section="${id}"] .velaris-advanced-player-section__content`
        );
    }

    private createActionButton(
        label: string,
        action: string,
        value?: string,
        selected = false
    ) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'velaris-advanced-player-chip';
        button.dataset.action = action;
        if (value != null) button.dataset.value = value;
        if (selected) {
            button.classList.add('is-selected');
            button.setAttribute('aria-pressed', 'true');
        }
        button.textContent = label;
        return button;
    }

    private togglePanel() {
        if (this.panelOpen) {
            this.closePanel(true);
            return;
        }

        if (!this.ensureUi()) return;
        const panel = document.querySelector<HTMLElement>(`#videoOsdPage ${PANEL_SELECTOR}`);
        const button = document.querySelector<HTMLButtonElement>(`#videoOsdPage ${BUTTON_SELECTOR}`);
        if (!panel || !button) return;

        this.panelOpen = true;
        panel.classList.remove('hide');
        button.setAttribute('aria-expanded', 'true');
        void this.renderPanel();
    }

    private closePanel(returnFocus = false) {
        const panel = document.querySelector<HTMLElement>(`#videoOsdPage ${PANEL_SELECTOR}`);
        const button = document.querySelector<HTMLButtonElement>(`#videoOsdPage ${BUTTON_SELECTOR}`);
        this.panelOpen = false;
        panel?.classList.add('hide');
        button?.setAttribute('aria-expanded', 'false');
        if (returnFocus) button?.focus();
    }

    private async renderPanel() {
        if (!this.player || !this.ensureUi()) return;
        this.renderNextEpisode();
        this.renderQuality();
        this.renderAudio();
        this.renderSubtitles();
        this.renderChapters();
        this.renderTechnicalControls();
        await this.renderQueue();
    }

    private renderNextEpisode() {
        const container = this.getSectionContent('next');
        if (!container) return;
        container.replaceChildren();

        const nextItem = this.playbackManager.getNextItem() as BaseItemDto | null | undefined;
        const section = container.closest<HTMLElement>('.velaris-advanced-player-section');
        section?.classList.toggle('hide', !nextItem);
        if (!nextItem) return;

        const button = this.createActionButton(getItemLabel(nextItem), 'next-episode');
        button.classList.add('velaris-advanced-player-next');
        container.append(button);
    }

    private renderQuality() {
        const container = this.getSectionContent('quality');
        if (!container || !this.player) return;
        container.replaceChildren();

        const supportedCommands = this.playbackManager.getSupportedCommands(this.player) as string[];
        const section = container.closest<HTMLElement>('.velaris-advanced-player-section');
        const supported = supportedCommands.includes('SetMaxStreamingBitrate');
        section?.classList.toggle('hide', !supported);
        if (!supported) return;

        for (const preset of VELARIS_QUALITY_PRESETS) {
            container.append(this.createActionButton(
                preset.label,
                'quality',
                preset.id,
                preset.id === this.preferences.qualityPreset
            ));
        }
    }

    private renderAudio() {
        const container = this.getSectionContent('audio');
        if (!container || !this.player) return;
        container.replaceChildren();

        const tracks = this.playbackManager.audioTracks(this.player) as PlaybackTrack[];
        const currentIndex = this.playbackManager.getAudioStreamIndex(this.player) as number;
        const section = container.closest<HTMLElement>('.velaris-advanced-player-section');
        section?.classList.toggle('hide', tracks.length < 2);
        if (tracks.length < 2) return;

        tracks.forEach((track, index) => {
            if (track.Index == null) return;
            container.append(this.createActionButton(
                getTrackLabel(track, `Audio ${index + 1}`),
                'audio',
                String(track.Index),
                track.Index === currentIndex
            ));
        });
    }

    private renderSubtitles() {
        const container = this.getSectionContent('subtitles');
        if (!container || !this.player) return;
        container.replaceChildren();

        const tracks = this.playbackManager.subtitleTracks(this.player) as PlaybackTrack[];
        const currentIndex = this.playbackManager.getSubtitleStreamIndex(this.player) as number;
        const section = container.closest<HTMLElement>('.velaris-advanced-player-section');
        section?.classList.toggle('hide', tracks.length === 0);
        if (!tracks.length) return;

        container.append(this.createActionButton('Aus', 'subtitles', '-1', currentIndex === -1));
        tracks.forEach((track, index) => {
            if (track.Index == null) return;
            container.append(this.createActionButton(
                getTrackLabel(track, `Untertitel ${index + 1}`),
                'subtitles',
                String(track.Index),
                track.Index === currentIndex
            ));
        });
    }

    private renderChapters() {
        const container = this.getSectionContent('chapters');
        const item = this.getCurrentItem();
        if (!container) return;
        container.replaceChildren();

        const chapters = item?.Chapters || [];
        const section = container.closest<HTMLElement>('.velaris-advanced-player-section');
        section?.classList.toggle('hide', chapters.length < 2);
        if (!item?.Id || !item.ServerId || chapters.length < 2) return;

        const apiClient = ServerConnections.getApiClient(item.ServerId);
        chapters.forEach((chapter, index) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'velaris-advanced-player-chapter';
            button.dataset.action = 'chapter';
            button.dataset.value = String(chapter.StartPositionTicks || 0);

            if (chapter.ImageTag && apiClient) {
                const preview = document.createElement('span');
                preview.className = 'velaris-advanced-player-chapter__preview';
                const imageUrl = apiClient.getUrl(`Items/${item.Id}/Images/Chapter/${index}`, {
                    tag: chapter.ImageTag,
                    maxWidth: 320
                });
                preview.style.backgroundImage = `url("${imageUrl}")`;
                button.append(preview);
            }

            const text = document.createElement('span');
            text.className = 'velaris-advanced-player-chapter__text';
            text.append(
                createTextElement('strong', '', chapter.Name || `Kapitel ${index + 1}`),
                createTextElement('span', '', formatVelarisChapterTime(chapter.StartPositionTicks))
            );
            button.append(text);
            container.append(button);
        });
    }

    private async renderQueue() {
        const container = this.getSectionContent('queue');
        if (!container || !this.player) return;
        container.replaceChildren();

        try {
            const playlist = await this.playbackManager.getPlaylist(this.player) as BaseItemDto[];
            const currentIndex = this.playbackManager.getCurrentPlaylistIndex(this.player) as number;
            const upcoming = getVelarisQueueWindow(playlist || [], currentIndex, MAX_QUEUE_ITEMS);
            const section = container.closest<HTMLElement>('.velaris-advanced-player-section');
            section?.classList.toggle('hide', upcoming.length === 0);

            upcoming.forEach((item, index) => {
                const row = document.createElement('div');
                row.className = 'velaris-advanced-player-queue-item';
                row.append(
                    createTextElement('span', 'velaris-advanced-player-queue-item__index', String(index + 1).padStart(2, '0')),
                    createTextElement('span', 'velaris-advanced-player-queue-item__title', getItemLabel(item))
                );
                container.append(row);
            });
        } catch (error) {
            console.debug('[VelarisAdvancedPlayer] queue unavailable', error);
            container.closest<HTMLElement>('.velaris-advanced-player-section')?.classList.add('hide');
        }
    }

    private renderTechnicalControls() {
        const container = this.getSectionContent('technical');
        if (!container) return;
        container.replaceChildren(
            this.createActionButton(
                this.preferences.technicalOverlay ? 'Technik-Overlay: An' : 'Technik-Overlay: Aus',
                'technical-overlay',
                undefined,
                this.preferences.technicalOverlay
            ),
            this.createActionButton(
                this.preferences.segmentTransitions ? 'Segment-Hinweise: An' : 'Segment-Hinweise: Aus',
                'segment-transitions',
                undefined,
                this.preferences.segmentTransitions
            )
        );
    }

    private onPanelClick(event: MouseEvent) {
        const target = (event.target as HTMLElement).closest<HTMLButtonElement>('button[data-action]');
        if (!target || !this.player) return;

        const action = target.dataset.action;
        const value = target.dataset.value;
        switch (action) {
            case 'close':
                this.closePanel(true);
                break;
            case 'next-episode':
                this.playbackManager.nextTrack(this.player);
                this.closePanel(false);
                break;
            case 'quality':
                if (value) this.setQualityPreset(value as VelarisQualityPreset);
                break;
            case 'audio':
                if (value != null) {
                    this.playbackManager.setAudioStreamIndex(Number(value), this.player);
                    this.renderAudio();
                }
                break;
            case 'subtitles':
                if (value != null) {
                    this.playbackManager.setSubtitleStreamIndex(Number(value), this.player);
                    this.renderSubtitles();
                }
                break;
            case 'chapter':
                if (value != null) {
                    this.playbackManager.seek(Number(value), this.player);
                    this.closePanel(false);
                }
                break;
            case 'technical-overlay':
                this.savePreferences({
                    ...this.preferences,
                    technicalOverlay: !this.preferences.technicalOverlay
                });
                this.updateTechnicalOverlay();
                this.renderTechnicalControls();
                break;
            case 'segment-transitions':
                this.savePreferences({
                    ...this.preferences,
                    segmentTransitions: !this.preferences.segmentTransitions
                });
                this.renderTechnicalControls();
                break;
            default:
                break;
        }
    }

    private setQualityPreset(id: VelarisQualityPreset) {
        this.savePreferences({
            ...this.preferences,
            qualityPreset: id
        });
        this.applyQualityPreset();
        this.renderQuality();
    }

    private applyQualityPreset() {
        if (!this.player) return;
        const supportedCommands = this.playbackManager.getSupportedCommands(this.player) as string[];
        if (!supportedCommands.includes('SetMaxStreamingBitrate')) return;

        const preset = getVelarisQualityPreset(this.preferences.qualityPreset);
        this.playbackManager.setMaxStreamingBitrate({
            enableAutomaticBitrateDetection: preset.automatic,
            maxBitrate: preset.maxBitrate
        }, this.player);
    }

    private updateTechnicalOverlay() {
        const overlay = document.querySelector<HTMLElement>(`#videoOsdPage ${TECH_SELECTOR}`);
        if (!overlay) return;
        overlay.replaceChildren();

        if (!this.preferences.technicalOverlay || !this.player) {
            overlay.classList.add('hide');
            return;
        }

        const state = this.playbackManager.getPlayerState(this.player) as PlayerStateLike | null | undefined;
        const mediaSource = this.playbackManager.currentMediaSource(this.player) as MediaSourceInfo | null | undefined;
        const streams = (mediaSource?.MediaStreams || []) as PlaybackTrack[];
        const video = streams.find(stream => stream.Type === 'Video');
        const audio = streams.find(stream => stream.Type === 'Audio');

        overlay.append(
            createTextElement('strong', 'velaris-player-technical-overlay__method', getVelarisPlayMethodLabel(state?.PlayState?.PlayMethod)),
            this.createTechnicalRow('Video', [
                video?.Width && video?.Height ? `${video.Width}×${video.Height}` : null,
                video?.Codec?.toUpperCase(),
                video?.BitRate ? `${Math.round(video.BitRate / 1_000_000)} Mbps` : null
            ]),
            this.createTechnicalRow('Audio', [
                audio?.Codec?.toUpperCase(),
                audio?.Channels ? `${audio.Channels} Kanäle` : null
            ]),
            this.createTechnicalRow('Container', [ mediaSource?.Container?.toUpperCase() ])
        );
        overlay.classList.remove('hide');
    }

    private createTechnicalRow(label: string, values: Array<string | null | undefined>) {
        const row = document.createElement('div');
        row.className = 'velaris-player-technical-overlay__row';
        const content = values.filter(Boolean).join(' · ') || '—';
        row.append(
            createTextElement('span', '', label),
            createTextElement('strong', '', content)
        );
        return row;
    }

    private showSegmentTransition(segment: MediaSegmentDto) {
        const transition = document.querySelector<HTMLElement>(`#videoOsdPage ${TRANSITION_SELECTOR}`);
        if (!transition || !this.preferences.segmentTransitions) return;

        if (this.transitionTimeout) clearTimeout(this.transitionTimeout);
        transition.replaceChildren();
        transition.append(createTextElement('strong', '', getSegmentLabel(segment)));

        const type = String(segment.Type || '').toLowerCase();
        const nextItem = this.playbackManager.getNextItem() as BaseItemDto | null | undefined;
        if (type === 'outro' && nextItem) {
            transition.append(createTextElement('span', '', getItemLabel(nextItem)));
            const nextButton = this.createActionButton('Nächste Episode', 'transition-next');
            nextButton.addEventListener('click', () => {
                if (this.player) this.playbackManager.nextTrack(this.player);
                transition.classList.add('hide');
            });
            transition.append(nextButton);
        }

        transition.classList.remove('hide');
        this.transitionTimeout = setTimeout(() => {
            transition.classList.add('hide');
            this.transitionTimeout = null;
        }, SEGMENT_TRANSITION_DURATION_MS);
    }

    onPlayerChange() {
        this.ensureUi();
        this.refreshPreferences();
        this.updateTechnicalOverlay();
        if (this.panelOpen) void this.renderPanel();
    }

    onPlayerItemStarted() {
        this.ensureUi();
        this.refreshPreferences();
        this.applyQualityPreset();
        this.updateTechnicalOverlay();
        if (this.panelOpen) void this.renderPanel();
    }

    onPlayerMediaStreamsChange() {
        this.updateTechnicalOverlay();
        if (this.panelOpen) void this.renderPanel();
    }

    onPlayerStateChange() {
        this.ensureUi();
        this.updateTechnicalOverlay();
    }

    onPlayerPlaylistItemAdd() {
        if (this.panelOpen) void this.renderQueue();
    }

    onPlayerPlaylistItemMove() {
        if (this.panelOpen) void this.renderQueue();
    }

    onPlayerPlaylistItemRemove() {
        if (this.panelOpen) void this.renderQueue();
    }

    onPromptSkip(_event: unknown, segment: MediaSegmentDto) {
        this.ensureUi();
        this.showSegmentTransition(segment);
    }

    onPlaybackStop() {
        this.closePanel(false);
        document.querySelector<HTMLElement>(`#videoOsdPage ${TECH_SELECTOR}`)?.classList.add('hide');
        document.querySelector<HTMLElement>(`#videoOsdPage ${TRANSITION_SELECTOR}`)?.classList.add('hide');
        if (this.transitionTimeout) {
            clearTimeout(this.transitionTimeout);
            this.transitionTimeout = null;
        }
    }
}

export const bindVelarisAdvancedPlayer = (playbackManager: PlaybackManager) => (
    new VelarisAdvancedPlayerController(playbackManager)
);
