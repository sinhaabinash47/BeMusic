import {ChangeDetectionStrategy, Component, Inject, Optional} from '@angular/core';
import {Artist, ARTIST_MODEL} from '../../../models/Artist';
import {Album, ALBUM_MODEL} from '../../../models/Album';
import {Track, TRACK_MODEL} from '../../../models/Track';
import {WebPlayerUrls} from '../../web-player-urls.service';
import * as copyToClipboard from 'copy-to-clipboard';
import {Toast} from '@common/core/ui/toast.service';
import {Settings} from '@common/core/config/settings.service';
import {Playlist, PLAYLIST_MODEL} from '../../../models/Playlist';
import {AppHttpClient} from '@common/core/http/app-http-client.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {BehaviorSubject} from 'rxjs';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {ShareableNetworks, shareLinkSocially} from '@common/core/utils/share-link-socially';
import {WebPlayerImagesService} from '../../web-player-images.service';
import {MIXED_ARTIST_MODEL, MixedArtist} from '../../artists/mixed-artist';
import {CurrentUser} from '@common/auth/current-user';

type mediaItemModel = Track|Album|Artist|Playlist;

export interface ShareMediaItemModalData {
    mediaItem: mediaItemModel;
}

@Component({
    selector: 'share-media-item-modal',
    templateUrl: './share-media-item-modal.component.html',
    styleUrls: ['./share-media-item-modal.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShareMediaItemModalComponent {
    public mediaItem: mediaItemModel;
    public activeTab$ = new BehaviorSubject<string>('share');
    public link: string;

    public embedLinkSafe: SafeResourceUrl;
    public embedLink: string;
    public embedCode: string;
    public iframeHeight: number;
    public shouldShowNav: boolean;

    constructor(
        private urls: WebPlayerUrls,
        private toast: Toast,
        private settings: Settings,
        private http: AppHttpClient,
        private dialogRef: MatDialogRef<ShareMediaItemModalComponent>,
        @Optional() @Inject(MAT_DIALOG_DATA) public data: ShareMediaItemModalData,
        private sanitizer: DomSanitizer,
        private images: WebPlayerImagesService,
        public currentUser: CurrentUser,
    ) {
        this.mediaItem = data.mediaItem;
        this.link = this.getLink();
        this.embedLinkSafe = this.sanitizer.bypassSecurityTrustResourceUrl(this.link + '/embed');
        this.embedLink = this.link + '/embed';
        this.iframeHeight = this.mediaItem.model_type === TRACK_MODEL ? 165 : 450;
        this.shouldShowNav = this.mediaItem.model_type === TRACK_MODEL || this.mediaItem.model_type === ALBUM_MODEL;
        this.embedCode = `<iframe width="100%" height="${this.iframeHeight}" scrolling="no" frameborder="no" allow="autoplay" src="${this.embedLink}"></iframe>`;
    }

    public close() {
        this.dialogRef.close();
    }

    public getType(): string {
        const modelType = this.mediaItem.model_type === MIXED_ARTIST_MODEL ?
            (this.mediaItem as any as MixedArtist).artist_type :
            this.mediaItem.model_type;
        return modelType.split('\\').pop().toLowerCase();
    }

    public shareUsing(network: ShareableNetworks) {
        shareLinkSocially(network, this.getLink(), this.getName(), this.getImage());
    }

    public copyLink() {
        copyToClipboard(this.link);
        this.toast.open('Copied link to clipboard.');
    }

    public getShareImage(name: string): string {
        return this.settings.getAssetUrl('images/social-icons/' + name + '.png');
    }

    public selectLink(e) {
        e.target.setSelectionRange(0, e.target.value.length);
    }

    private getLink(encode = false): string {
        let url = this.urls.routerLinkToUrl(this.urls[this.getType()](this.mediaItem));
        url = url.replace(/ /g, '+');
        return encode ? encodeURIComponent(url) : url;
    }

    private getImage() {
        switch (this.mediaItem.model_type) {
            case ARTIST_MODEL:
                return (this.mediaItem as Artist).image_small;
            case ALBUM_MODEL:
                return this.images.getAlbumImage(this.mediaItem as Album);
            case TRACK_MODEL:
                return this.images.getTrackImage(this.mediaItem as Track);
            case PLAYLIST_MODEL:
                return this.images.getPlaylistImage(this.mediaItem as Playlist);
        }
    }

    private getName() {
        let name: string;
        switch (this.mediaItem.model_type) {
            case ALBUM_MODEL:
                let albumName = this.mediaItem.name;
                if ((this.mediaItem as Album)?.artist?.name) {
                    albumName = `${albumName} by ${(this.mediaItem as Album)?.artist?.name}`;
                }
                name = albumName;
                break;
            case TRACK_MODEL:
                let trackName = this.mediaItem.name;
                if ((this.mediaItem as Track)?.artists[0]?.name) {
                    trackName = `${trackName} by ${(this.mediaItem as Track)?.artists[0]?.name}`;
                }
                name = trackName;
                break;
            default:
                name = this.mediaItem.name;
                break;
        }
        return encodeURIComponent(name);
    }

    public openTab(tab: string) {
        this.activeTab$.next(tab);
    }
}
