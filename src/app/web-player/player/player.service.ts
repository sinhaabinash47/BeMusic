import {Injectable} from '@angular/core';
import {PlayerQueue} from './player-queue.service';
import {Track} from '../../models/Track';
import {YoutubeStrategy} from './strategies/youtube-strategy.service';
import {PlayerState} from './player-state.service';
import {Settings} from '@common/core/config/settings.service';
import {FullscreenOverlay} from '../fullscreen-overlay/fullscreen-overlay.service';
import {WebPlayerState} from '../web-player-state.service';
import {PlaybackStrategy} from './strategies/playback-strategy.interface';
import {Html5Strategy} from './strategies/html5-strategy.service';
import {SoundcloudStrategy} from './strategies/soundcloud-strategy.service';
import {observable, Observable, ObservableInput, Subject, Subscription} from 'rxjs';
import {TrackPlays} from './track-plays.service';
import {LocalStorage} from '@common/core/services/local-storage.service';
import {BrowserEvents} from '@common/core/services/browser-events.service';
import {Title} from '@angular/platform-browser';
import {PlayerTracksService} from './player-tracks.service';
import {MetaTagsService} from '@common/core/meta/meta-tags.service';
import {LEFT_ARROW, RIGHT_ARROW, SPACE} from '@angular/cdk/keycodes';
import {CurrentUser} from '@common/auth/current-user';
import {Toast} from '@common/core/ui/toast.service';
import WaveSurfer from 'wavesurfer.js';

@Injectable({
    providedIn: 'root'
})
export class Player {
    public wavesurfer:any;
    private subscriptions: Subscription[] = [];
    private playbackStrategy: PlaybackStrategy;
    private activePlaybackStrategy: 'youtube'|'html5'|'soundcloud';
    private volume: number;

    /**
     * Whether playback has been started via user gesture.
     *
     * If true, there's no need to maximize player overlay
     * anymore, because external controls will work properly.
     */
    private playbackStartedViaGesture = false;
    wavePauseTime: any=0;
    showWave: boolean=false;
    waveLoad: boolean=false;
    waveloaded: boolean=false;
    cuedTrack: boolean=false;
    end: any=1;
    lastTrack:any;
    playSong:boolean=false;
    pauseSong:boolean=false;
    changedUrl:boolean=false;
    constructor(
        public queue: PlayerQueue,
        protected youtube: YoutubeStrategy,
        protected html5: Html5Strategy,
        protected soundcloud: SoundcloudStrategy,
        protected storage: LocalStorage,
        protected settings: Settings,
        public state: PlayerState,
        protected globalState: WebPlayerState,
        protected overlay: FullscreenOverlay,
        protected browserEvents: BrowserEvents,
        protected trackPlays: TrackPlays,
        protected title: Title,
        protected metaTags: MetaTagsService,
        protected trackLoader: PlayerTracksService,
        protected currentUser: CurrentUser,
        protected toast: Toast,
    ) {}

    public play() {
        if ( ! this.ready()) return;

        // if ( ! this.currentUser.hasPermission('tracks.play')) {
        //     this.state.buffering = false;
        //     return this.toast.open('To enable music playback you will need to upgrade to a higher plan.');
        // }
        const track = this.queue.getCurrent();
        // console.log("Track",track)
        if ( ! track) return this.stop();
        this.setStrategy(track);
        this.maybeMaximizeOverlay();
        if(this.wavePauseTime==0){
            this.wavesurfer.load(track.url);
            this.state.buffering=true;
            this.wavesurfer.on('ready',()=>{  
                this.state.buffering=false;           
                this.wavesurfer.play(this.wavePauseTime);
                this.playbackStrategy.play();
            })
        }else{ 
            this.changedUrl=false;          
            this.wavesurfer.play(this.wavePauseTime);
            this.playbackStrategy.play();
        }             
    }
    waveInit(){
        this.wavesurfer = WaveSurfer.create({
            container: '#waveform',
            backgroundColor: '#181818',
            cursorColor: 'transparent',
            progressColor:'#57ff23',
            waveColor: '#bebebee0',
            height:50,
            audioRate:1,
            responsive:true,
        });
        let url=this.getCuedTrack()?this.getCuedTrack().url:"https://ia800508.us.archive.org/15/items/LoveThemeFromTheGodfather/02LoveThemeFromTheGodfather.mp3";
        // let peaksArray= [0.8888,1.2233,25,35,45,-1.2233,49.8, -52.0,48.13, -50.35, -48.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,0.8888,1.2233,-1.2233,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,0.8888,1.2233,-1.2233,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,0.8888,1.2233,-1.2233,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37,51,45,43, -50.14,-49,-45,-43, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,0.8888,1.2233,-1.2233,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,0.8888,1.2233,-1.2233,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,0.8888,1.2233,-1.2233,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,0.8888,1.2233,-1.2233,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,
        // 49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,0.8888,1.2233,-1.2233,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,0.8888,1.2233,-1.2233,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,0.8888,1.2233,-1.2233,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35,49.8, -52.0,50.13, -52.35, -50.12 ,52.33, -50.16, 52.37, -50.14, 52.35];
        // this.wavesurfer.backend.peaks = peaksArray.map(p => p/128);
        
        this.wavesurfer.load(url);
        this.wavesurfer.drawBuffer();
    }
    playwave(){
        if(!this.showWave){
            this.showWave=true;
            this.wavesurfer.play(this.playbackStrategy.getCurrentTime());
        }
    }
    waveLoaded(){
        if(!this.waveloaded && !this.waveLoad){
            this.waveLoad=true;
            this.state.buffering=true;
        }
        if(this.waveLoad){
            this.state.buffering=true;
            if(this.getCurrentTime()){
                setTimeout(()=>{
                    this.waveloaded=true;
                    this.state.buffering=false;
                    this.wavesurfer.play(this.getCurrentTime());
                },1000)
            }
        }
    }
    showWavePlayer(){
        this.cuedTrack=true;
        this.waveLoad=true;
        this.waveloaded=true;
    }
    public mediaItemPlaying(queueId: string): boolean {
        return this.state.playing && this.queue.mediaItemIsQueued(queueId);
    }
    public playMediaItem(queueId: string, tracks?: Track[], selectTrack?: Track) {
        this.cueMediaItem(queueId, tracks, selectTrack).then(() => {
            this.play();
        });
    }

    public async cueMediaItem(queueId: string, tracks?: Track[], selectTrack?: Track) {
        this.stop();
        this.state.buffering = true;
        if ( ! this.queue.mediaItemIsQueued(queueId)) {
            if ( ! tracks) {
                tracks = await this.trackLoader.load(queueId);
            }
            await this.overrideQueue({
                tracks,
                queuedItemId: queueId
            });
        }
        if (selectTrack) {
            this.queue.select(selectTrack);
        }
    }

    public pause() {
        // this.showWave=false;
        this.wavesurfer.pause();
        this.playbackStrategy.pause();
        this.wavePauseTime=this.wavesurfer.getCurrentTime();
    }

    public togglePlayback() {
        if (this.isPlaying()) {
            this.pause();
        } else {
            this.play();
        }
    }

    public ready() {
        return this.playbackStrategy.isReady();
    }

    public isPlaying(): boolean {
        return this.state.playing;
    }

    public cued(track?: Track) {
        const cued = this.getCuedTrack() && this.getCuedTrack().id;
        if ( ! track) return cued;
        return cued && cued === track.id;
    }

    public getState(): PlayerState {
        return this.state;
    }

    public getQueue(): PlayerQueue {
        return this.queue;
    }

    public isBuffering(): boolean {
        return this.state.buffering;
    }

    public isMuted(): boolean {
        return this.state.muted;
    }

    public getCuedTrack(): Track {
        if ( ! this.playbackStrategy) return null;
        return this.playbackStrategy.getCuedTrack();
    }

    public mute() {
        this.playbackStrategy.mute();
        this.wavesurfer.setMute(true);
        this.state.muted = true;
    }

    public unMute() {
        this.playbackStrategy.mute();
        this.wavesurfer.setMute(false);
        this.state.muted = false;
    }

    public getVolume() {
        return this.volume;
    }

    public setVolume(volume: number) {
        this.volume = volume;
        this.playbackStrategy.setVolume(volume);
        this.storage.set('player.volume', volume);
    }

    public stop() {
        if ( ! this.state.playing) return;
        this.playbackStrategy.pause();
        this.seekTo(0);
        this.state.playing = false;
        this.wavesurfer.stop();
        this.wavePauseTime=0;
        this.state.firePlaybackStopped();
    }

    /**
     * Get time that has elapsed since playback start.
     */
    public getCurrentTime() {
        return this.playbackStrategy.getCurrentTime();
    }

    /**
     * Get total duration of track in seconds.
     */
    public getDuration() {
        return this.playbackStrategy.getDuration();
    }

    /**
     * Seek to specified time in track.
     */
    public seekTo(time: number): Promise<any> {
        this.playbackStrategy.seekTo(time);
        return new Promise(resolve => setTimeout(() => resolve(), 50));
    }

    /**
     * Toggle between repeat, repeat one and no repeat modes.
     */
    public toggleRepeatMode() {
        if (this.state.repeating) {
            this.state.repeatingOne = true;
        } else if (this.state.repeatingOne) {
            this.state.repeatingOne = false;
            this.state.repeating = false;
        } else {
            this.state.repeating = true;
        }
    }

    public playNext() {
        this.stop();
        let track = this.queue.getCurrent();
        
        if (this.state.repeating && this.queue.isLast()) {
            track = this.queue.getFirst();
        } else if ( ! this.state.repeatingOne) {
            track = this.queue.getNext();
        }

        this.queue.select(track);
        this.wavePauseTime=0;
        this.play();
        
    }

    /**
     * Play previous track in queue based on current repeat setting.
     */
    public playPrevious() {
        this.stop(); 
        let track = this.queue.getCurrent();
        
        if (this.state.repeating && this.queue.isFirst()) {
            track = this.queue.getLast();
        } else if (!this.state.repeatingOne) {
            track = this.queue.getPrevious();
        }
        this.queue.select(track);
        this.wavePauseTime=0;
        this.play();
    }

    /**
     * Toggle player shuffle mode.
     */
    public toggleShuffle() {
        if (this.state.shuffling) {
            this.queue.restoreOriginal();
        } else {
            this.queue.shuffle();
        }

        this.state.shuffling = !this.state.shuffling;
    }

    /**
     * Override player queue and cue first track.
     */
    public overrideQueue(params: {tracks: Track[], queuedItemId?: string}, queuePointer: number = 0): Promise<any> {
        this.putQueueIntoLocalStorage(params.tracks);
        this.queue.override(params, queuePointer);
        return this.cueTrack(this.queue.getCurrent());
    }

    /**
     * Cue specified track for playback.
     */
    public cueTrack(track: Track): Promise<any> {
        let promise: Promise<any>;
        this.setStrategy(track);

        if ( ! track || ! this.playbackStrategy) {
            promise = new Promise(resolve => resolve());
        } else {
            this.queue.select(track);
            promise = this.playbackStrategy.cueTrack(track);
        }

        return promise.then(() => {
            this.state.buffering = false;
        });
    }

    public maximize() {
        this.playbackStrategy.maximize();
    }

    public getPlaybackStrategy(): string {
        return this.activePlaybackStrategy;
    }

    public init() {
        this.loadStateFromLocalStorage();
        this.setStrategy(this.queue.getCurrent());
        this.setInitialVolume();
        this.cueTrack(this.queue.getCurrent()).then(() => {
            this.initMediaSession();
        });
        this.bindToPlaybackStateEvents();
        this.initKeybinds();
    }

    private initMediaSession(destroy = false) {
        if ('mediaSession' in navigator && this.settings.get('audio_search_provider') === 'local') {
            const actionHandlers = {
                play: () => this.play(),
                pause: () => this.pause(),
                previoustrack: () => this.playPrevious(),
                nexttrack: () => this.playNext(),
                stop: () => this.stop(),
                seekbackward: (details) => this.seekTo(this.getCurrentTime() - 10),
                seekforward: (details) => this.seekTo(this.getCurrentTime() + 10),
                seekto: (details) => this.seekTo(details.seekTime),
            };
            for (const key in actionHandlers) {
                try {
                    navigator.mediaSession.setActionHandler(key as MediaSessionAction, destroy ? null : actionHandlers[key]);
                } catch (error) {}
            }
            if (destroy) {
                navigator.mediaSession.metadata = null;
                navigator.mediaSession.playbackState = 'none';
            }
        }
    }

    public initForEmbed(track: Track) {
        this.setStrategy(track);
        this.setInitialVolume();
        this.cueTrack(track);
    }

    public destroy() {
        this.metaTags.staticTitle = null;
        this.playbackStrategy && this.playbackStrategy.destroy();
        this.state.playing = false;
        this.initMediaSession(true);

        this.subscriptions.forEach(subscription => {
            subscription.unsubscribe();
        });

        this.subscriptions = [];
    }

    private putQueueIntoLocalStorage(tracks: Track[]) {
        if ( ! tracks) return;
        this.storage.set('player.queue', {tracks: tracks.slice(0, 15)});
    }

    private setStrategy(track: Track): PlaybackStrategy {
        if(track && !track.url){
           track.url="https://ia800508.us.archive.org/15/items/LoveThemeFromTheGodfather/02LoveThemeFromTheGodfather.mp3"
        }
        if (track && track.url) {
            this.playbackStrategy = this.html5;
            this.activePlaybackStrategy = 'html5';
        }
        // else if (this.settings.get('audio_search_provider') === 'soundcloud') {
        //     this.playbackStrategy = this.soundcloud;
        //     this.activePlaybackStrategy = 'soundcloud';
        // } else {
        //     this.playbackStrategy = this.youtube;
        //     this.activePlaybackStrategy = 'youtube';
        // }

        // destroy all except current active playback strategy
        if (this.activePlaybackStrategy !== 'youtube') this.youtube.destroy();
        if (this.activePlaybackStrategy !== 'html5') this.html5.destroy();
        if (this.activePlaybackStrategy !== 'soundcloud') this.soundcloud.destroy();

        return this.playbackStrategy;
    }

    private loadStateFromLocalStorage() {
        this.state.muted = this.storage.get('player.muted', false);
        this.state.repeating = this.storage.get('player.repeating', true);
        this.state.repeatingOne = this.storage.get('player.repeatingOne', false);
        this.state.shuffling = this.storage.get('player.shuffling', false);
        const queuePointer = this.storage.get('player.queue.pointer', 0);
        this.queue.override(this.storage.get('player.queue', {tracks: []}), queuePointer);
    }

    private setInitialVolume() {
        let defaultVolume = this.settings.get('player.default_volume', 30);
            defaultVolume = this.storage.get('player.volume', defaultVolume);

        this.setVolume(defaultVolume);
        this.html5.setVolume(defaultVolume);
    }

    /**
     * Maximize fullscreen overlay if we're on mobile,
     * because youtube embed needs to be visible to start
     * playback with external youtube iframe api controls
     */
    private async maybeMaximizeOverlay(): Promise<boolean> {
        const shouldOpen = this.settings.get('player.mobile.auto_open_overlay');

        if (this.playbackStartedViaGesture || ! shouldOpen || ! this.globalState.isMobile) return;

        await this.overlay.maximize();
        this.playbackStartedViaGesture = true;
    }

    private bindToPlaybackStateEvents() {
        this.state.onChange$.subscribe(async type => {
            if (type === 'PLAYBACK_STARTED') {
                const cuedTrack = this.getCuedTrack();
                if (cuedTrack) {
                    this.trackPlays.increment(cuedTrack);
                    this.metaTags.staticTitle = `${cuedTrack.name} - ${(cuedTrack.artists && cuedTrack.artists[0] ? cuedTrack.artists[0].name : '?')}`;
                }
            } else if (type === 'PLAYBACK_ENDED') {
                this.trackPlays.clearPlayedTrack(this.getCuedTrack());
                if (this.queue.isLast() && this.queue.queuedMediaItemId) {
                    this.state.buffering = true;
                    await this.trackLoader.load(this.queue.queuedMediaItemId, this.queue.getLast()).then(tracks => {
                        this.queue.append(tracks);
                    });
                }
                this.playNext();
            } else if (type === 'PLAYBACK_PAUSED') {
                this.metaTags.staticTitle = null;
            }
        });
    }

    public initKeybinds() {
        const sub = this.browserEvents.globalKeyDown$.subscribe((e: KeyboardEvent) => {
            // SPACE - toggle playback
            if (e.keyCode === SPACE) {
                this.togglePlayback(); e.preventDefault();

            // ctrl+right - play next track
            } else if (e.ctrlKey && e.keyCode === RIGHT_ARROW) {
                this.playNext(); e.preventDefault();

            // ctrl+left - play previous track
            } else if (e.ctrlKey && e.keyCode === LEFT_ARROW) {
                this.playPrevious(); e.preventDefault();
            }
        });

        this.subscriptions.push(sub);
    }
}
