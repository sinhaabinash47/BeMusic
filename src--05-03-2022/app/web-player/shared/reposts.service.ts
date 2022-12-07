import {Injectable} from '@angular/core';
import {AppHttpClient} from '@common/core/http/app-http-client.service';
import {BackendResponse} from '@common/core/types/backend-response';
import {Track} from '../../models/Track';
import {Repost} from '../../models/repost';
import {Album} from '../../models/Album';

const BASE_URI = 'repost';

export type CrupdateRepostResponse = BackendResponse<{repost?: Repost, action: 'added'|'removed'}>;

@Injectable({
    providedIn: 'root'
})
export class RepostsService {
    constructor(private http: AppHttpClient) {}

    public crupdate(media: Track|Album): CrupdateRepostResponse {
        return this.http.post(`${BASE_URI}`, {repostable_id: media.id, repostable_type: media.model_type});
    }
}
