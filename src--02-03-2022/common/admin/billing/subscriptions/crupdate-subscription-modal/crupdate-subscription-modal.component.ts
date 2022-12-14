import {ChangeDetectionStrategy, Component, Inject, OnInit} from '@angular/core';
import {MatDatepicker} from '@angular/material/datepicker';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormBuilder, FormControl} from '@angular/forms';
import {debounceTime, distinctUntilChanged, finalize, switchMap} from 'rxjs/operators';
import {BehaviorSubject, Observable, of as observableOf, Subject} from 'rxjs';
import {User} from '@common/core/types/models/User';
import {Toast} from '@common/core/ui/toast.service';
import {Users} from '@common/auth/users.service';
import {Subscription} from '@common/shared/billing/models/subscription';
import {Plans} from '@common/shared/billing/plans.service';
import {Subscriptions} from '@common/shared/billing/subscriptions.service';
import {Plan} from '@common/core/types/models/Plan';
import {BackendErrorResponse} from '@common/core/types/backend-error-response';

export interface CrupdateSubscriptionModalData {
    subscription?: Subscription;
}

interface Errors extends Partial<Subscription> {
    general?: string;
}

@Component({
    selector: 'crupdate-subscription-modal',
    templateUrl: './crupdate-subscription-modal.component.html',
    styleUrls: ['./crupdate-subscription-modal.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrupdateSubscriptionModalComponent implements OnInit {
    public loading$ = new BehaviorSubject<boolean>(false);

    public form = this.fb.group({
        plan_id: [''],
        description: [''],
        renews_at: [''],
        ends_at: [''],
    });
    
    public errors$ = new BehaviorSubject<Errors>({});

    public userAutocomplete: FormControl = new FormControl(null);
    public filteredUsers: Observable<User[]> = new Subject();
    public plans: Plan[] = [];
    
    constructor(
        private dialogRef: MatDialogRef<CrupdateSubscriptionModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: CrupdateSubscriptionModalData,
        public subscriptions: Subscriptions,
        private toast: Toast,
        private users: Users,
        private plansApi: Plans,
        private fb: FormBuilder,
    ) {
        this.resetState();
    }

    ngOnInit() {
        this.resetState();
        this.bindToUserAutocomplete();
        this.fetchPlans();

        // toggle renews_at/ends_at enabled/disabled state
        this.form.get('ends_at').valueChanges.pipe(distinctUntilChanged()).subscribe(value => {
            value ? this.form.get('renews_at').disable() : this.form.get('renews_at').enable();
        });
        this.form.get('renews_at').valueChanges.pipe(distinctUntilChanged()).subscribe(value => {
            value ? this.form.get('ends_at').disable() : this.form.get('ends_at').enable();
        });

        if (this.data.subscription) {
            this.hydrateModel(this.data.subscription);
        }
    }
    
    public confirm() {
        this.loading$.next(true);
        let request;

        if (this.data.subscription) {
            request = this.subscriptions.update(this.data.subscription.id, this.getPayload());
        } else {
            request = this.subscriptions.create(this.getPayload());
        }

        request
            .pipe(finalize(() => this.loading$.next(false)))
            .subscribe(response => {
                this.close(response.subscription);
                const action = this.data.subscription ? 'updated' : 'created';
                this.toast.open('Subscription ' + action);
            }, (errResponse: BackendErrorResponse) => this.errors$.next(errResponse.errors));
    }
    
    public close(data?: any) {
        this.resetState();
        this.dialogRef.close(data);
    }

    public displayFn(user?: User): string {
        return user ? user.email : null;
    }
    
    private hydrateModel(subscription: Subscription) {
        const data = {...subscription};

        // if (data.renews_at) {
        //     data.renews_at = this.mysqlToDate(data.renews_at);
        // }

        // if (data.ends_at) {
        //     data.ends_at = this.mysqlToDate(data.ends_at);
        // }

        if (subscription.user_id) {
            this.userAutocomplete.setValue(subscription.user);
        }
        
        this.form.patchValue(data);
    }
    
    private getPayload() {
        // const payload = {
        //     plan_id: this.model.plan_id,
        //     description: this.model.description,
        // } as Partial<Subscription>;
        //
        // const renewsAt = this.dateToMysql(this.model.renews_at as any),
        //     endsAt = this.dateToMysql(this.model.ends_at as any);
        //
        // if (renewsAt) payload.renews_at = renewsAt as any;
        // if (endsAt) payload.ends_at = endsAt as any;
        //
        // // if we are creating a new subscription, start user ID to payload
        // if (!this.updating && this.userAutocomplete.value) {
        //     payload['user_id'] = this.userAutocomplete.value.id;
        // }
        //
        // return payload;

        const payload = this.form.value as Partial<Subscription>;

        const renewsAt = this.dateToMysql(payload.renews_at),
            endsAt = this.dateToMysql(payload.ends_at);

        if (renewsAt) payload.renews_at = renewsAt as string;
        if (endsAt) payload.ends_at = endsAt as string;

        // if we are creating a new subscription, add user ID to payload
        if (!this.data.subscription && this.userAutocomplete.value) {
            payload.user_id = this.userAutocomplete.value.id;
        }
        
        return payload;
    }

    /**
     * Format js date instance into mysql timestamp format.
     */
    private dateToMysql(date: string | Date) {
        if (!date || typeof date === 'string') return date;
        return date.toJSON().split('.')[0].replace('T', ' ');
    }

    private mysqlToDate(date: string): any {
        const t = date.split(/[- :]/) as any[];
        return new Date(Date.UTC(t[0], t[1] - 1, t[2], t[3], t[4], t[5]));
    }
    
    private resetState() {
        this.form.reset();
        this.errors$.next({});
    }

    public toggleDatePicker(datePicker: MatDatepicker<Date>) {
        if (datePicker.opened) {
            datePicker.close();
        } else {
            datePicker.open();
        }
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
    
    private fetchPlans() {
        this.plansApi.all().subscribe(response => {
            this.plans = response.pagination.data;

            // select first plan, if none is selected yet
            if (!this.form.value.plan_id && this.plans.length) {
                this.form.patchValue({plan_id: this.plans[0].id});
            }
        });
    }
}
