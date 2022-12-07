import {Injectable} from '@angular/core';
import {Playlist} from '../models/Playlist';
import {Album} from '../models/Album';
import {Track} from '../models/Track';
import {DefaultImagePaths} from './default-image-paths.enum';
import {environment} from '../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class WebPlayerImagesService {
    public getDefault(type: 'artist'|'album'|'artistBig'): string {
        if (type === 'artist') {
            return environment.image_base_url+DefaultImagePaths.artistSmall;
        } else if (type === 'artistBig') {
            return environment.image_base_url+DefaultImagePaths.artistBig;
        } else {
            return environment.image_base_url+DefaultImagePaths.album;
        }
    }

    public getPlaylistImage(playlist: Playlist): string {
        if (playlist.image) return environment.image_base_url+playlist.image;
        if (playlist.tracks && playlist.tracks[0] &&  playlist.tracks[0].album) return environment.image_base_url+playlist.tracks[0].album.image;
        return environment.image_base_url+this.getDefault('album');
    }

    public getAlbumImage(album: Album): string {
        if (album && album.image) return album.image;
        return this.getDefault('album');
    }

    public getTrackImage(track: Track) {
        if (track.image) {
            return track.image;
        } else if (track.album && track.album.image) {
            return track.album.image;
        } else {
            return DefaultImagePaths.album;
        }
    }
}
