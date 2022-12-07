import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {CrupdatePlanModalComponent} from '../crupdate-plan-modal/crupdate-plan-modal.component';
import {finalize} from 'rxjs/operators';
import {Plans} from '@common/shared/billing/plans.service';
import {CurrentUser} from '@common/auth/current-user';
import {Toast} from '@common/core/ui/toast.service';
import {Plan} from '@common/core/types/models/Plan';
import {BehaviorSubject, Observable} from 'rxjs';
import {DatatableService} from '../../../../datatable/datatable.service';

@Component({
    selector: 'plan-index',
    templateUrl: './plan-index.component.html',
    styleUrls: ['./plan-index.component.scss'],
    providers: [DatatableService],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanIndexComponent implements OnInit {
    public loading$ = new BehaviorSubject<boolean>(false);
    public plans$ = this.datatable.data$ as Observable<Plan[]>;

    constructor(
        private plans: Plans,
        public currentUser: CurrentUser,
        private toast: Toast,
        public datatable: DatatableService<Plan>,
    ) {}

    ngOnInit() {
        this.datatable.init({
            uri: Plans.BASE_URI,
        });
    }

    public maybeDeleteSelectedPlans() {
        this.datatable.confirmResourceDeletion('plans')
            .subscribe(() => {
                this.loading$.next(true);
                this.plans.delete(this.datatable.selectedRows$.value).pipe(finalize(() => {
                    //this.toast.open('Plan deleted.');
                    this.loading$.next(false);
                    this.datatable.reset();
                })).subscribe(() => {
                    this.toast.open('Plan deleted.');
                    this.datatable.reset();
                });
            });
    }

    public showCrupdatePlanModal(plan?: Plan) {
        this.datatable.openCrupdateResourceModal(
            CrupdatePlanModalComponent,
            {plan, plans: this.datatable.data$.value},
        ).subscribe();
    }

    public syncPlans() {
        this.loading$.next(true);
        this.plans.sync()
            .pipe(finalize(() => this.loading$.next(false)))
            .subscribe(() => {
                this.toast.open('Synced plans across all enabled payment gateways');
            });
    }

    // public planchangestatus(e, id) {
    //    let status = { hidden: e.checked?0:1 }
    //     this.plans.changestatus(id,status).subscribe((res) => {
    //         if(res.status){
    //             this.syncPlans();
    //             this.toast.open('Plans Status changed successfull');
    //         }else{
    //             this.toast.open('Plans Status didnt change')
    //         }
    //     });
    // }
}
