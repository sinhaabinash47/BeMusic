import {ChangeDetectionStrategy, Component, ElementRef, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {Tracks} from '../../web-player/tracks/tracks.service';
import {CurrentUser} from '@common/auth/current-user';
import {UploadedFile} from '@common/uploads/uploaded-file';
import {UploadQueueService} from '@common/uploads/upload-queue/upload-queue.service';
import {Settings} from '@common/core/config/settings.service';
import {Toast} from '@common/core/ui/toast.service';
import {AudioUploadValidator} from '../../web-player/audio-upload-validator';
import {BehaviorSubject} from 'rxjs';
import {UploadQueueItem} from '@common/uploads/upload-queue/upload-queue-item';
import {UploadInputConfig, UploadInputTypes} from '@common/uploads/upload-input-config';
import {Track} from '../../models/Track';
import {TrackFormComponent} from '../track-form/track-form.component';
import {Album} from '../../models/Album';
import {Router} from '@angular/router';
import {WaveformGenerator} from '../../web-player/tracks/waveform/waveform-generator';
import {UploadApiConfig} from '@common/uploads/types/upload-api-config';
import {environment} from '../../../environments/environment';

@Component({
    selector: 'upload-page',
    templateUrl: './upload-page.component.html',
    styleUrls: ['./upload-page.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [UploadQueueService],
})
export class UploadPageComponent {
    @ViewChild('clickMatButton', {read: ElementRef, static: true}) clickButton: ElementRef<HTMLButtonElement>;
    @ViewChildren(TrackFormComponent) trackForms: QueryList<TrackFormComponent>;
    public errors$ = new BehaviorSubject<{[key: string]: {[K in keyof Partial<Track>]: string}}>({});
    public uploadConfig: UploadInputConfig = {
        types: [UploadInputTypes.video, UploadInputTypes.audio],
        multiple: true
    };
    public savedMedia$ = new BehaviorSubject<(Track|Album)[]>([]);
    public createAlbum$ = new BehaviorSubject<boolean>(false);
    public autoCreateArtists = false;
    environment:any=environment;
    constructor(
        private track: Tracks,
        public currentUser: CurrentUser,
        public uploadQueue: UploadQueueService,
        public settings: Settings,
        protected tracks: Tracks,
        private toast: Toast,
        private audioValidator: AudioUploadValidator,
        private router: Router,
        private waveGenerator: WaveformGenerator,
    ) {}

    public uploadTracks(files: UploadedFile[]) {
        const params = {
            uri: this.environment.upload_base_url+'uploads',
            httpParams: {autoMatch: this.autoCreateArtists, diskPrefix: 'track_media', disk: 'public'},
            validator: this.audioValidator,
            willProcessFiles: true,
        } as UploadApiConfig;
        var forma = this.uploadConfig.types;
        console.log("list file format "+forma);
        files.forEach(obj=> {
           console.log(obj.mime);
           if((obj.mime).indexOf('video') > -1){
               if(forma[0].indexOf(obj.mime) > -1){
                this.uploadQueue.start(files, params).subscribe(response => {
                    const queueItem = this.uploadQueue.find(response.queueItemId);
                    this.waveGenerator.generate(queueItem.uploadedFile.native).then(waveData => {
                        queueItem.customData = {waveData};
                        queueItem.finishProcessing();
                    });
                });
               } else{
                this.toast.open('Not a valid file format');
               }
            } else {
                this.uploadQueue.start(files, params).subscribe(response => {
                    const queueItem = this.uploadQueue.find(response.queueItemId);
                    this.waveGenerator.generate(queueItem.uploadedFile.native).then(waveData => {
                        queueItem.customData = {waveData};
                        queueItem.finishProcessing();
                    });
                });
            }
         });
        
    }

    public addSavedMedia(newMedia: Track|Album) {
        this.savedMedia$.next([...this.savedMedia$.value, newMedia]);
    }

    public insideAdmin(): boolean {
        return this.router.url.indexOf('admin') > -1;
    }

    public trackByFn = (i: number, upload: UploadQueueItem) => upload.id;
}
