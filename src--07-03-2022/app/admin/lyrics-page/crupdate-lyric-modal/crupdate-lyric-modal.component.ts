import {AfterViewInit, Component, Inject, Optional, ViewChild, ViewEncapsulation} from '@angular/core';
import {Lyrics} from '../../../web-player/lyrics/lyrics.service';
import {of as observableOf} from 'rxjs';
import {TextEditorComponent} from '@common/text-editor/text-editor.component';
import {Track, TRACK_MODEL} from '../../../models/Track';
import {FormBuilder, FormGroup, FormControl} from '@angular/forms';
import {Lyric} from '../../../models/Lyric';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
//import {FormControl} from '@angular/forms';
import {debounceTime, distinctUntilChanged, finalize, map, startWith, switchMap} from 'rxjs/operators';
import {Search} from '../../../web-player/search/search.service';
import {WebPlayerImagesService} from '../../../web-player/web-player-images.service';
import {Artist} from '../../../models/Artist';
import {Playlists} from '../../../web-player/playlists/playlists.service'
import {MixedArtist} from '../../../web-player/artists/mixed-artist';
import {BackendErrorResponse} from '@common/core/types/backend-error-response';
import {Toast} from '@common/core/ui/toast.service';

export interface CrupdateLyricModalData {
    lyric?: Lyric,
    track?: Track
}

@Component({
    selector: 'crupdate-lyric-modal',
    templateUrl: './crupdate-lyric-modal.component.html',
    styleUrls: ['./crupdate-lyric-modal.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class CrupdateLyricModalComponent implements AfterViewInit {
    @ViewChild('textEditor', { static: true }) textEditor: TextEditorComponent;

    /**
     * Track this lyric belong to.
     */
    public track: Track = new Track();

    /**
     * Lyric model.
     */
    public lyric = new Lyric({text: ''});

    /**
     * Input for attaching lyric to a track.
     */
    public trackInput = {
        formControl: new FormControl(),
        searchResults: null,
    };

    public loading = false;
    public formSubmit = false;
    public allPlayList = null;

    public errors: {track_id?: string, text?: string} = {};

    /**
     * CrupdateLyricModalComponent Constructor.
     */
    constructor(
        private fb: FormBuilder,
        protected lyrics: Lyrics,
        public playlists: Playlists,
        private dialogRef: MatDialogRef<CrupdateLyricModalComponent>,
        private search: Search,
        private toast: Toast,
        public images: WebPlayerImagesService,
        @Optional() @Inject(MAT_DIALOG_DATA) public data: CrupdateLyricModalData,
    ) {
        this.hydrate();
        this.bindTrackInput();
        this.playlists.all().subscribe((res:any)=>{
            if(res.status==='success'){
                this.allPlayList = res.pagination.data;
                console.log(this.allPlayList);

            }
        })
    }

    ngAfterViewInit() {
        this.textEditor.setContents(this.lyric.text);
        this.textEditor.focus();
    }

    public form = this.fb.group({
        playlist: [''],
    });
    iserror(){
        if(this.form.get('playlist').value == ""){
            return true;
        }
        return false;
    }

    public addtolist() {
        var self = this;
        this.formSubmit = true;
        if(this.iserror()){
            return;
        }
        this.playlists.addTracks(this.form.get('playlist').value, [this.track]).subscribe((res:any)=>{
            if(res.id){
                this.toast.open('Added successfully');
                self.dialogRef.close(self.lyric);
            } else {
                this.toast.open('something went wrong.');
                self.dialogRef.close(self.lyric);
            }
        });

    }   
    public confirm() {
        this.loading = true;

        this.createOrUpdateLyrics()
            .pipe(finalize(() => this.loading = false))
            .subscribe(response => {
                this.close(response.lyric);
            }, (errResponse: BackendErrorResponse) => {
                this.errors = errResponse.errors;
            });
    }

    public close(lyric?: Lyric) {
        this.dialogRef.close(lyric);
        this.textEditor.destroyEditor();
    }

    private createOrUpdateLyrics() {
        if (this.lyric.id) {
            return this.lyrics.update(this.lyric.id, this.getPayload());
        } else {
            return this.lyrics.create(this.getPayload());
        }
    }

    private getPayload() {
        return {
            text: this.textEditor.getContents(),
            track_id: this.track.id,
        };
    }

    private hydrate() {
        if (this.data.lyric) {
            this.lyric = this.data.lyric;
        }

        this.track = this.data.track || this.lyric.track;
        this.trackInput.formControl.setValue(this.track);
    }

    /**
     * Function for track autocomplete input.
     */
    public trackDisplayFn(track?: Track|string): string {
        if ( ! track) return '';

        if (typeof track === 'string') {
            return track;
        } else {
            return track.name;
        }
    }

    private bindTrackInput() {
        this.trackInput.searchResults = this.trackInput.formControl.valueChanges
            .pipe(
                distinctUntilChanged(),
                debounceTime(350),
                startWith(''),
                switchMap(query => {
                    const searchQuery = this.trackDisplayFn(query);

                    const results = this.search.media(searchQuery, {limit: 5, modelTypes: [TRACK_MODEL]})
                        .pipe(map(response => response.results.tracks));

                    // make sure search is not triggered after user clicks on autocomplete result
                    return (searchQuery && (! this.track || searchQuery !== this.track.name)) ? results : observableOf([]);
                })
            );
    }

    public attachTrack(event: MatAutocompleteSelectedEvent) {
        this.track = event.option.value;
        this.errors = {};
    }

    public artistsString(artists: MixedArtist[]): string {
        return artists.map(a => a.name).join(', ');
    }
}
