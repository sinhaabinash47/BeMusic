import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {Modal} from '@common/core/ui/dialogs/modal.service';
import {CurrentUser} from '@common/auth/current-user';
import {Settings} from '@common/core/config/settings.service';
import {Toast} from '@common/core/ui/toast.service';
import {HttpErrors} from '@common/core/http/errors/http-errors.enum';
import {Channel} from '../channel';
import {CHANNEL_BASE_URI, ChannelService} from '../channel.service';
import {BackendErrorResponse} from '@common/core/types/backend-error-response';
import {DatatableService} from '@common/datatable/datatable.service';
import {Observable} from 'rxjs';

@Component({
    selector: 'channel-index',
    templateUrl: './channel-index.component.html',
    styleUrls: ['./channel-index.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [DatatableService],
})
export class ChannelIndexComponent implements OnInit {
    public channels$ = this.datatable.data$ as Observable<Channel[]>;
    constructor(
        public datatable: DatatableService<Channel>,
        private channels: ChannelService,
        private modal: Modal,
        public currentUser: CurrentUser,
        public settings: Settings,
        private toast: Toast,
    ) {}

    ngOnInit() {
        this.datatable.init({
            uri: CHANNEL_BASE_URI,
        });
    }

    public maybeDeleteSelectedChannels() {
        this.datatable.confirmResourceDeletion('channels').subscribe(confirmed => {
            const ids = this.datatable.selectedRows$.value;
            this.channels.delete(ids).subscribe(() => {
                this.datatable.reset();
                this.toast.open('Channels deleted.');
            }, (errResponse: BackendErrorResponse) => {
                this.toast.open(errResponse.message || HttpErrors.Default);
            });
        });
    }
}
