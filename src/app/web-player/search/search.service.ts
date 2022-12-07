import {Injectable} from '@angular/core';
import {AppHttpClient} from '@common/core/http/app-http-client.service';
import {Observable} from 'rxjs';
import {SearchResponse} from './search-results';
import {BackendResponse} from '@common/core/types/backend-response';
import {Track} from '../../models/Track';

interface SearchEverythingParams {
    query?: string;
    category?: string;
    genres?: string;
    subgenres?: string;
    limit?: number;
    forceLocal?: boolean;
    flatten?: boolean;
    modelTypes: string[];
}

@Injectable({
    providedIn: 'root'
})
export class Search {
    constructor(private http: AppHttpClient) {}

    public media(query: string = '', params: SearchEverythingParams): BackendResponse<SearchResponse> {
        params.query = query;
        return this.http.get('search', params);
    }
    public searchcutomTrack(query: string = '', params: SearchEverythingParams): BackendResponse<SearchResponse> {
        params.query = query;
        return this.http.get('searchcutomTrack', params);
    }

    public media2(query: string = '', catid): BackendResponse<SearchResponse> {
        return this.http.get('searchBycat/'+catid+'?query='+query);
    }

    public videoId(artistName: string, track: Track): Observable<{ title: string, id: string }[]> {
        return this.http.get(`search/audio/${track.id}/${this.doubleEncode(artistName)}/${this.doubleEncode(track.name)}`);
    }

    private doubleEncode(string: string) {
        return encodeURIComponent(encodeURIComponent(string));
    }
}
