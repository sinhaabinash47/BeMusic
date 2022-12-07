import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges
} from '@angular/core';
import {FormBuilder, FormGroup, FormControl} from '@angular/forms';
import {BehaviorSubject, Observable, of as observableOf, Subject} from 'rxjs';
import {CurrentUser} from '@common/auth/current-user';
import {Tracks} from '../../web-player/tracks/tracks.service';
import {Track} from '../../models/Track';
import {UploadQueueItem} from '@common/uploads/upload-queue/upload-queue-item';
import {DefaultImagePaths} from '../../web-player/default-image-paths.enum';
import {Toast} from '@common/core/ui/toast.service';
import {USER_MODEL} from '@common/core/types/models/User';
import {User} from '@common/core/types/models/User';
import {
    matExpansionAnimations,
    MatExpansionPanelState
} from '@angular/material/expansion';
import {Modal} from '@common/core/ui/dialogs/modal.service';
import {ConfirmModalComponent} from '@common/core/ui/confirm-modal/confirm-modal.component';
import {finalize, map, debounceTime, switchMap} from 'rxjs/operators';
import {openUploadWindow} from '@common/uploads/utils/open-upload-window';
import {UploadInputTypes} from '@common/uploads/upload-input-config';
import {AudioUploadValidator} from '../../web-player/audio-upload-validator';
import {UploadQueueService} from '@common/uploads/upload-queue/upload-queue.service';
import {WaveformGenerator} from '../../web-player/tracks/waveform/waveform-generator';
import {Router} from '@angular/router';
import {UploadFileResponse} from '@common/uploads/uploads-api.service';
import {Album} from '../../models/Album';
import {MixedArtist} from '../../web-player/artists/mixed-artist';
import {Settings} from '@common/core/config/settings.service';
import {isAbsoluteUrl} from '@common/core/utils/is-absolute-url';
import {FileEntry} from '@common/uploads/types/file-entry';
import {randomString} from '@common/core/utils/random-string';
import {scrollInvalidInputIntoView} from '@common/core/utils/scroll-invalid-input-into-view';
import {UploadApiConfig} from '@common/uploads/types/upload-api-config';
import {GENRE_MODEL} from '../../models/Genre';
import {SUBGENRE_MODEL} from '../../models/Subgenre';
import {Search} from '../../web-player/search/search.service';
import {BackendErrorResponse} from '@common/core/types/backend-error-response';
import {environment} from '../../../environments/environment';
import {Users} from '@common/auth/users.service';
import {AuthService} from '@common/auth/auth.service';
import {Subgenres} from '../../web-player/subgenres/subgenres.service';

export interface ExtractedMetadata {
    title?: string;
    album?: Album;
    album_name?: string;
    artist?: MixedArtist;
    artist_name?: string;
    genres?: string[];
    subgenres?: string[];
    duration?: number;
    release_date?: string;
    comment?: string;
    image?: FileEntry;
    lyrics?: string;
}

export interface TrackUploadResponse extends UploadFileResponse {
    metadata?: ExtractedMetadata;
}

@Component({
    selector: 'track-form',
    templateUrl: './track-form.component.html',
    styleUrls: ['./track-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [matExpansionAnimations.bodyExpansion]
})
export class TrackFormComponent implements OnInit, OnChanges {
    maxerror = false;
    @Input() autoMatch = false;
    // track that is being edited
    @Input() track: Track;

    // creating a new track for this upload
    @Input() uploadQueueItem: UploadQueueItem;

    // track will be saved along with this album
    @Input() albumForm: FormGroup;

    // number of this track inside parent album
    @Input() number: number;

    @Output() canceled = new EventEmitter<UploadQueueItem|Track>();
    @Output() saved = new EventEmitter<Track>();

    public userAutocomplete: FormControl = new FormControl(null);
    public filteredUsers: Observable<User[]> = new Subject();
    public errors$ = new BehaviorSubject<{[K in keyof Partial<Track>]: string}>({});
    public defaultImage$ = new BehaviorSubject<string>(DefaultImagePaths.album);
    public loading$ = new BehaviorSubject<boolean>(false);
    public readonly uniqueId = randomString(5);
    public allCategories: any[];


    public form = this.fb.group({
        id: [null],
        name: [''],
        //image: [''],
        //description: [''],
        number: [1],
        //tags: [[]],
        genres: [[]],
        subgenres: [[]],
        duration: [null],
        url: [''],
        //youtube_id: [''],
        //spotify_popularity: [''],
        //album: [null],
        artists: [[]],
        //waveData: [null],
       // lyrics: [''],
        bpm:[""],
        category:[""],
        key:[""],
        date:[null],
        default:[null],
        varsion:[[]]
    });
    public expanded = false;
    varsionCount = [];
    formSubmit = false;

    constructor(
        private fb: FormBuilder,
        private currentUser: CurrentUser,
        private tracks: Tracks,
        private toast: Toast,
        private modal: Modal,
        protected subgenres: Subgenres,
        private users: Users,
        private audioValidator: AudioUploadValidator,
        private uploadQueue: UploadQueueService,
        private waveGenerator: WaveformGenerator,
        private router: Router,
        public settings: Settings,
        public auth: AuthService,
        private cd: ChangeDetectorRef,
        private search: Search,
    ) {}

    ngOnChanges(changes: SimpleChanges) {
        if (changes.number && changes.number.currentValue != null) {
            this.form.patchValue({number: changes.number.currentValue});
        }
    }

    ngOnInit() {
        this.getCategory();
        this.bindToUserAutocomplete();
        this.expanded = !this.albumForm;

        if (this.track) {
            console.log(this.track);
            const formValue = {...this.track};
            formValue.tags = (this.track.tags || []).map(t => t.name) as any;
            formValue.genres = (this.track.genres || []).map(t => t.display_name || t.name) as any;
            formValue.subgenres = (this.track.subgenres || []).map(t => t.name || t.name) as any;
            formValue.key = this.track.t_key;
            formValue.category = this.track.category_id;
            if(this.track.user_id){
                this.userAutocomplete.setValue(this.track.labeluser);
            }
            //console.log(this.track.user_id);
            //console.log('fffffffffffffffffffffff');
            // console.log(parseInt(this.track.varsion))
            // console.log(this.track.varsions)
            for(let i=1; i<=parseInt(this.track.varsion);i++){
                console.log('this.track.varsions[(i-1)].name')
                console.log(this.track.varsions[(i-1)].name)
                this.form.addControl('v['+i+'][title]',new FormControl(""));
                this.form.addControl('v['+i+'][category]',new FormControl(""));
                this.form.addControl('v['+i+'][genres]',new FormControl([]));
                this.form.addControl('v['+i+'][subgenres]',new FormControl([]));
                this.form.addControl('v['+i+'][key]',new FormControl(""));
                this.form.addControl('v['+i+'][bpm]',new FormControl(""));
                this.form.addControl('v['+i+'][default]',new FormControl(""));
                this.form.addControl('v['+i+'][url]',new FormControl(""));
                this.form.addControl('v['+i+'][id]',new FormControl(""));

                this.form.controls['v['+i+'][title]'].setValue(this.track.varsions[i-1].name);
                this.form.controls['v['+i+'][category]'].setValue(this.track.varsions[i-1].category);
                this.form.controls['v['+i+'][key]'].setValue(this.track.varsions[i-1].key);
                this.form.controls['v['+i+'][bpm]'].setValue(this.track.varsions[i-1].bpm);
                this.form.controls['v['+i+'][url]'].setValue(this.track.varsions[i-1].url);
                this.form.controls['v['+i+'][default]'].setValue(this.track.varsions[i-1].default_track);
                this.form.controls['v['+i+'][id]'].setValue(this.track.varsions[i-1].id);
                this.form.controls['v['+i+'][genres]'].setValue((this.track.varsions[i-1].genres || []).map(t => t.display_name || t.name) as any);
                this.form.controls['v['+i+'][subgenres]'].setValue((this.track.varsions[i-1].subgenres || []).map(t => t.name || t.name) as any);

                this.varsionCount.push(i);
            }
            this.form.patchValue(formValue);

            if (this.track.album) {
                this.defaultImage$.next(this.track.album.image || DefaultImagePaths.album);
            }
        }

        if (this.uploadQueueItem) {
            this.uploadQueueItem.uploadedResponse$.subscribe((response: TrackUploadResponse) => {
                this.patchFormUsingFileUpload(response, 0);
            });
        }

        if (this.albumForm) {
            this.albumForm.get('image').valueChanges.subscribe(url => {
                this.defaultImage$.next(url || DefaultImagePaths.album);
            });
        }
    }
    getCategory(){
        this.auth.getCategory().subscribe((res:any)=>{
            if(res.status == true){
                this.allCategories = res.data;
                this.cd.detectChanges();
            }
        })        
    }
    public displayFn(user?: User): string {
        return user ? user.email : null;
    }
    private bindToUserAutocomplete() {
        this.filteredUsers = this.userAutocomplete.valueChanges.pipe(
            debounceTime(400),
            switchMap(query => {
                if (!query) return observableOf([]);
                return this.users.getAll({query});
            })
        );
    }

    public getPayload(): Partial<Track> {
        const customData = this.uploadQueueItem ? this.uploadQueueItem.customData : {};
        const payload =  {...this.form.value, ...customData};
        delete payload.version;
        payload.versionArray = this.varsionCount;
        if ( ! payload.artists.length && this.settings.get('player.artist_type') === 'user') {
            payload.artists = [{id: this.currentUser.get('id'), artist_type: USER_MODEL}];
        }
        if (this.userAutocomplete.value) {
            payload.user_id = this.userAutocomplete.value.id;
        }
        return payload;
    }

    public isUploading() {
        return this.uploadQueueItem && !this.uploadQueueItem.completed;
    }

    public submit() {
        this.formSubmit = true;
        console.log(this.form)
        console.log(this.form.value)
        var da = this.form.value;
        for(let key in da) {
            if(key == 'varsion' || key == 'id'|| key == 'description'|| key == 'duration'|| key == 'default') continue; 
            if(key.indexOf('default') !== -1) continue; 
            if(this.form.value[key] == '' || this.form.value[key] == null){
                console.log(key)
                return;
            }
        }
        if(this.form.value.duration >= 5000000000000000000){
            this.maxerror = true;
            return false;
        } else {
            this.maxerror = false;
        }
        if (this.albumForm) return;
        this.loading$.next(true);

        const payload = this.getPayload();

        const request = this.track ?
            this.tracks.update(this.track.id, payload) :
            this.tracks.create(payload);

        request
            .pipe(finalize(() => this.loading$.next(false)))
            .subscribe(response => {
                if (this.uploadQueueItem) {
                    this.uploadQueue.remove(this.uploadQueueItem.id);
                }
                this.toast.open('Track saved.');
                this.form.markAsPristine();
                this.saved.emit(response.track);
            }, (errResponse: BackendErrorResponse) => {
                this.errors$.next(errResponse.errors);
                scrollInvalidInputIntoView(this.errors$.value, `track-form-${this.uniqueId}`);
            });
    }

    public toggleExpandedState() {
        this.expanded = !this.expanded;
    }

    public getExpandedState(): MatExpansionPanelState {
        return this.expanded ? 'expanded' : 'collapsed';
    }

    public maybeCancel() {
        this.modal.show(ConfirmModalComponent, {
            title: 'Remove Track',
            body:  'Are you sure you want to cancel the upload and remove this track?',
            ok:    'Remove'
        }).beforeClosed().subscribe(confirmed => {
            if ( ! confirmed) return;
            if (this.uploadQueueItem) {
                this.uploadQueue.remove(this.uploadQueueItem.id);
                this.canceled.emit(this.uploadQueueItem);
                this.toast.open('Upload canceled.');
            } else if (this.track) {
                this.tracks.delete([this.track.id]).subscribe(() => {
                    this.canceled.emit(this.track);
                    this.toast.open('Track deleted.');
                });
            }
        });
    }

    public openUploadMusicModal(version) {
        const params = {
            uri: environment.upload_base_url+'uploads',
            validator: this.audioValidator,
            httpParams: {autoMatch: this.autoMatch, diskPrefix: 'track_media', disk: 'public'},
            willProcessFiles: true,
        } as UploadApiConfig;
        openUploadWindow({types: [UploadInputTypes.audio, UploadInputTypes.video]}).then(uploadedFiles => {
            if ( ! uploadedFiles) return;
            // if this track form is already attached to existing upload queue item
            // replace that item in queue service instead of creating a new item
            const replacements = this.uploadQueueItem ? {[this.uploadQueueItem.id]: uploadedFiles[0]} : uploadedFiles;
            this.uploadQueue.start(replacements, params).subscribe(response => {
                const queueItem = this.uploadQueue.find(response.queueItemId);
                this.waveGenerator.generate(queueItem.uploadedFile.native).then(waveData => {
                    this.form.patchValue({waveData});
                    queueItem.finishProcessing();
                });
                this.patchFormUsingFileUpload(response, version);
                this.cd.detectChanges();
                console.log(this.uploadQueueItem);
                this.toast.open('Track uploaded.');
            }, () => this.toast.open('Could not upload track'));
            // make sure progress bar is shown if we're editing track from admin
            if ( ! this.uploadQueueItem) {
                this.uploadQueueItem = this.uploadQueue.uploads$.value[0];
                //this.cd.markForCheck();
            }
        });
    }

    private patchFormUsingFileUpload(response: TrackUploadResponse, version) {
        if(version == 'def'){
            const values: {[K in keyof Partial<Track>]: any} & {lyrics?: string} = {
                url: response.fileEntry.url,
            };
            //this.form.patchValue(values);
            this.form.controls['duration'].setValue(response.metadata.duration);
            this.form.controls['url'].setValue(response.fileEntry.url);
        }
        if(version >= 0){
            // const values: {[K in keyof Partial<Track>]: any} & {lyrics?: string} = {
            //     "v[1][url]": response.fileEntry.url,
            // };
            //this.form.controls['v['+version+'][duration]'].setValue(response.metadata.duration);
            this.form.controls['v['+version+'][url]'].setValue(response.fileEntry.url);
        }
        return;
    }

    public insideAdmin(): boolean {
        return this.router.url.indexOf('admin') > -1;
    }

    public shouldShowDurationField() {
        const trackUrl = this.form.get('url').value;
        return !trackUrl || isAbsoluteUrl(trackUrl);
    }

    public suggestTagFn = (query: string) => {
        return this.search.media(query, {modelTypes: ['App\\Tag'], limit: 5})
            .pipe(map(response => response.results.tags.map(tag => tag.name)));
    }

    public suggestGenreFn = (query: string) => {
        return this.search.media(query, {modelTypes: [GENRE_MODEL], limit: 5})
            .pipe(map(response => response.results.genres.map(genre => genre.name)));
    }
    public suggestGenreFnWc = (query: string) => {
        return this.search.media2(query, this.form.get('category').value)
            .pipe(map(response => response['pagination']['data'].map(genre => genre.name)));
    }
    public suggestSubgenreFn = (query: string) => {
        return this.subgenres.getAllSub({query})
            .pipe(map(response => response.map(genre => genre.name)));
    }

    versioncount(){
        var v = (!this.varsionCount.length)? 1 : (this.varsionCount.length + 1);
        this.form.addControl('v['+v+'][title]',new FormControl(""));
        this.form.addControl('v['+v+'][category]',new FormControl(""));
        this.form.addControl('v['+v+'][genres]',new FormControl([]));
        this.form.addControl('v['+v+'][subgenres]',new FormControl([]));
        this.form.addControl('v['+v+'][key]',new FormControl(""));
        this.form.addControl('v['+v+'][bpm]',new FormControl(""));
        this.form.addControl('v['+v+'][default]',new FormControl(""));
        this.form.addControl('v['+v+'][url]',new FormControl(""));
        this.varsionCount.push(v);
        this.form.controls['varsion'].setValue(this.varsionCount);
        this.formSubmit = false;
        console.log(this.varsionCount)
    }
    removeVersion(i){
        //i= i-1;
        this.form.removeControl('v['+i+'][title]');
        this.form.removeControl('v['+i+'][category]');
        this.form.removeControl('v['+i+'][genres]');
        this.form.removeControl('v['+i+'][subgenres]');
        this.form.removeControl('v['+i+'][key]');
        this.form.removeControl('v['+i+'][bpm]');
        this.form.removeControl('v['+i+'][default]');
        this.form.removeControl('v['+i+'][url]');
        var index = this.varsionCount.indexOf(i);
        if (index !== -1) {
          this.varsionCount.splice(index, 1);
        }
        console.log(this.varsionCount)
        //console.log(this.track.varsions)
        //this.track.varsions.splice(i, 1);
        //console.log(this.track.varsions)
        this.form.controls['varsion'].setValue(this.varsionCount);
    }
    getformname(i, name){
        return 'v['+i+']['+name+']';
    }
    getUrlVal(name){
        return this.form.value[name];
    }
    showError(name){
        if( (this.form.value[name] == '' || this.form.value[name] == null)&& this.formSubmit){
            return true;
        }
    }
    changeDefault(e, v = null){
        console.log(v);
        if(v != null){
            if(e == "on" && this.varsionCount.length > 0){
                this.form.controls['default'].setValue(null);
                for(let i=1; i<=this.varsionCount.length;i++){
                    if(i != v){
                        this.form.controls['v['+i+'][default]'].setValue(null);
                    }
                }
            }
        } else {
            if(e == "on" && this.varsionCount.length > 0){
                for(let i=1; i<=this.varsionCount.length;i++){
                    this.form.controls['v['+i+'][default]'].setValue(null);
                }
            }
        }
    }
}
