import {AppConfig} from '@common/core/config/app-config';
import {HomepageAppearancePanelComponent} from './admin/appearance/homepage-appearance-panel/homepage-appearance-panel.component';

export const BEMUSIC_CONFIG: AppConfig = {
    assetsPrefix: 'client',
    translations: {
        public_disk_driver_description: 'Where site uploads (music and video files, avatars, media images etc.) should be stored.',
    },
    navbar: {
        defaultPosition: 'dashboard',
        defaultColor: 'primary',
        dropdownItems: [
            {route: '/', name: 'Player', icon: 'audiotrack'},
        ]
    },
    auth: {
        redirectUri: '/',
        adminRedirectUri: '/',
    },
    accountSettings: {
        hideNavbar: true,
    },
    customPages: {
        hideNavbar: true,
    },
    admin: {
        pages: [
            {name: 'upload', icon: 'cloud-upload', route: 'upload', permission: 'tracks.create'},
            {name: 'channels', icon: 'queue-music', route: 'channels', permission: 'channels.create'},
            {name: 'artists', icon: 'mic', route: 'artists', permission: 'artists.view'},
            {name: 'albums', icon: 'album', route: 'albums', permission: 'albums.view'},
            {name: 'library', icon: 'audiotrack', route: 'tracks', permission: 'tracks.view'},
            {name: 'categories', icon: 'local-offer', route: 'categories', permission: 'genres.view'},
            {name: 'genres', icon: 'local-offer', route: 'genres', permission: 'genres.view'},
            {name: 'subgenres', icon: 'local-offer', route: 'subgenres', permission: 'genres.view'},
            {name: 'lyrics', icon: 'queue-music', route: 'lyrics', permission: 'lyrics.view'},
            {name: 'playlists', icon: 'playlist-play', route: 'playlists', permission: 'playlists.view'},
        ],
        settingsPages: [
            {name: 'interface', route: 'interface'},
            {name: 'player', route: 'player'},
            {name: 'providers', route: 'providers'},
        ],
        ads: [
            {
                name: 'Slot #1',
                slot: 'ads.general_top',
                description: 'This ad will appear at the top of most pages. Best size <= 150px height or responsive.'
            },
            {
                name: 'Slot #2',
                slot: 'ads.general_bottom',
                description: 'This ad will appear at the bottom of most pages. Best size <= 150px height or responsive.'
            },
            {
                name: 'Slot #3',
                slot: 'ads.artist_top',
                description: 'This ad will appear in artist page only (below popular songs). Best size <= 1000px width or responsive.'
            },
            {
                name: 'Slot #4',
                slot: 'ads.artist_bottom',
                description: 'This ad will appear in artist page only (below similar artists). Best size <= 430px width or responsive.'
            },
            {
                name: 'Slot #5',
                slot: 'ads.album_above',
                description: 'This ad will appear in album page only (above album tracks). Best size is as wide as possible or responsive.'
            },
        ],
    },
};
