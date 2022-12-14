import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {DatatableService} from '../datatable.service';
import {Subscription} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import { WebPlayerUrls } from 'src/app/web-player/web-player-urls.service';
@Component({
    selector: 'datatable-footer',
    templateUrl: './datatable-footer.component.html',
    styleUrls: ['./datatable-footer.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatatableFooterComponent implements OnInit, OnDestroy {
    @Input() hidePerPage = false;
    public perPageControl = new FormControl(10);
    public from: number;
    public to: number;
    public totalRecords: number;
    public lastPage: number;
    public currentPage: number;
    public havePrevious: boolean;
    public haveNext: boolean;
    private changeRef: Subscription;

    constructor(
        public datable: DatatableService<any>,
        private cd: ChangeDetectorRef,
        public urls:WebPlayerUrls
    ) {}

    ngOnInit() {
        this.changeRef = this.datable.paginator.response$
            .pipe(filter(r => !!r?.pagination), map(r => r.pagination))
            .subscribe(pagination => {
                this.to = pagination.per_page * pagination.current_page;
                this.from = (this.to - pagination.per_page) || 1;
                this.totalRecords = pagination.total;
                this.lastPage = pagination.last_page;
                this.currentPage = pagination.current_page;
                this.havePrevious = pagination.current_page > 1;
                this.haveNext = pagination.current_page < pagination.last_page;
                this.perPageControl.setValue(parseInt('' + pagination.per_page), {emitEvent: false});
                this.cd.markForCheck();
            });

        this.perPageControl.valueChanges
            .subscribe(perPage => {
                this.datable.paginator.changePerPage(perPage);
            });
    }

    ngOnDestroy() {
        // this.changeRef.unsubscribe();
        this.datable.destroy();
    }

    public previousPage() {
        this.urls.expandedIndex=[];
        this.datable.paginator.previousPage();
    }

    public nextPage() {
        this.urls.expandedIndex=[];
        this.datable.paginator.nextPage();
    }

    public goToPage(e){
        this.urls.expandedIndex=[];
        this.datable.paginator.goToPage(e.target.value);
    }
    public goToPageAnchor(page){
        this.urls.expandedIndex=[];
        this.datable.paginator.goToPage(page);
    }
}
