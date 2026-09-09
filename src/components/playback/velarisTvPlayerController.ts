import type { PlaybackStopInfo } from 'types/playbackStopInfo';

import { PlaybackSubscriber } from 'apps/legacy/features/playback/utils/playbackSubscriber';
import focusManager from 'components/focusManager';
import layoutManager from 'components/layoutManager';
import { EventType } from 'constants/eventType';
import Events, { type Event } from 'utils/events';

import type { PlaybackManager } from './playbackmanager';

const TV_PLAYER_FOCUS_DELAY_MS = 60;
const TV_PLAYER_FOCUS_SELECTOR = [
    '.velaris-player-primary-action',
    '.btnPause',
    '.btnPlayPause',
    '.btnVelarisAdvanced',
    '.btnVideoOsdSettings'
].join(',');

class VelarisTvPlayerController extends PlaybackSubscriber {
    private focusTimer: ReturnType<typeof setTimeout> | null = null;

    constructor(playbackManager: PlaybackManager) {
        super(playbackManager);
        this.onOsdChanged = this.onOsdChanged.bind(this);
    }

    private clearFocusTimer() {
        if (this.focusTimer) {
            clearTimeout(this.focusTimer);
            this.focusTimer = null;
        }
    }

    private focusPrimaryControl() {
        if (!layoutManager.tv) return;

        const page = document.querySelector<HTMLElement>('#videoOsdPage');
        if (!page) return;
        if (document.activeElement && page.contains(document.activeElement)) return;

        const target = page.querySelector<HTMLElement>(TV_PLAYER_FOCUS_SELECTOR);
        if (target && focusManager.isCurrentlyFocusable(target)) {
            focusManager.focus(target);
        }
    }

    onOsdChanged(_event: Event, isOpen: boolean) {
        this.clearFocusTimer();
        if (!isOpen || !layoutManager.tv) return;

        this.focusTimer = setTimeout(() => {
            this.focusTimer = null;
            this.focusPrimaryControl();
        }, TV_PLAYER_FOCUS_DELAY_MS);
    }

    onPlayerChange() {
        Events.off(document, EventType.SHOW_VIDEO_OSD, this.onOsdChanged);
        if (this.playbackManager.getCurrentPlayer()) {
            Events.on(document, EventType.SHOW_VIDEO_OSD, this.onOsdChanged);
        }
    }

    onPlaybackStop(_event: Event, playbackStopInfo: PlaybackStopInfo) {
        this.clearFocusTimer();
        if (!playbackStopInfo.nextItem) {
            Events.off(document, EventType.SHOW_VIDEO_OSD, this.onOsdChanged);
        }
    }
}

let tvPlayerController: VelarisTvPlayerController | null = null;

export const bindVelarisTvPlayer = (playbackManager: PlaybackManager) => {
    if (!tvPlayerController) {
        tvPlayerController = new VelarisTvPlayerController(playbackManager);
    }

    return tvPlayerController;
};
