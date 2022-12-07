import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {Tracks} from '../../../web-player/tracks/tracks.service';
import {FormattedDuration} from '../../../web-player/player/formatted-duration.service';
import {Modal} from '@common/core/ui/dialogs/modal.service';
import {CurrentUser} from '@common/auth/current-user';
import {Track} from '../../../models/Track';
import {CrupdateLyricModalComponent} from '../../lyrics-page/crupdate-lyric-modal/crupdate-lyric-modal.component';
import {WebPlayerUrls} from '../../../web-player/web-player-urls.service';
import {DatatableService} from '../../../../common/datatable/datatable.service';
import {Observable} from 'rxjs';
 import {Toast} from '@common/core/ui/toast.service';

@Component({
    selector: 'track-index',
    templateUrl: './track-index.component.html',
    styleUrls: ['./track-index.component.scss'],
    encapsulation: ViewEncapsulation.None,
    providers: [DatatableService],
})
export class TrackIndexComponent implements OnInit {
    public tracks$ = this.datatable.data$ as Observable<Track[]>;
    constructor(
        private modal: Modal,
        private tracks: Tracks,
        private toast: Toast,
        private duration: FormattedDuration,
        public currentUser: CurrentUser,
        public datatable: DatatableService<Track>,
        public urls: WebPlayerUrls,
    ) {}

    ngOnInit() {
        this.datatable.sort$.next({orderBy: 'spotify_popularity'});
        this.datatable.init({
            uri: 'tracks',
            staticParams: {with: 'artists',area: 'admin' }
            //staticParams: {}
        });
    }

    public openCrupdateLyricModal(track: Track) {
        this.modal.open(CrupdateLyricModalComponent, {track, lyric: track.lyric})
            .afterClosed().subscribe(lyric => {
            if ( ! lyric) return;
            track.lyric = lyric;
        });
    }

    public maybeDeleteSelectedTracks() {
        this.datatable.confirmResourceDeletion('tracks').subscribe(() => {
            const ids = this.datatable.selectedRows$.value;
            this.tracks.delete(ids).subscribe(() => {
                this.datatable.reset();
            });
        });
    }

    public toggleEnable(e, id) {
        if(e.checked){
            this.tracks.enable(id).subscribe(() => {
                this.toast.open('Enable successfully.');
                this.datatable.reset();
            });
        } else {
            this.tracks.disable(id).subscribe(() => {
                this.toast.open('Disable successfully.');
                this.datatable.reset();
            });
        }
    }
    public formatDuration(duration: number) {
        return this.duration.fromMilliseconds(duration);
    }
}
