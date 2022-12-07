import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import { AboutUsComponent } from '@common/about-us/about-us.component';
import {ContactComponent} from '@common/contact/contact.component';
import { FaqsComponent } from '@common/faqs/faqs.component';

import {AuthGuard} from '@common/guards/auth-guard.service';
import { PrivacyPolicyComponent } from '@common/privacy-policy/privacy-policy.component';
import { RefundPolicyComponent } from '@common/refund-policy/refund-policy.component';
import { TermsOfConditionsComponent } from '@common/terms-of-conditions/terms-of-conditions.component';
import { ComparePlansComponent } from './customer/homepage/compare-plans/compare-plans.component';

const routes: Routes = [
    { path: '', redirectTo: 'customer/home', pathMatch: 'full' },
    {path: 'customer', loadChildren: () => import('src/app/customer/app-customer.module').then(m => m.AppCustomerModule)},
    {path: 'label', loadChildren: () => import('src/app/label/app-label.module').then(m => m.AppLabelModule)},
    {path: 'admin', loadChildren: () => import('src/app/admin/app-admin.module').then(m => m.AppAdminModule), canLoad: [AuthGuard]},
    {path: 'billing', loadChildren: () => import('@common/billing/billing.module').then(m => m.BillingModule)},
    {path: 'notifications', loadChildren: () => import('@common/notifications/notifications.module').then(m => m.NotificationsModule)},
    {path: 'contact', component: ContactComponent},
    {path: 'about', component: AboutUsComponent},
    {path: 'terms-of-conditions', component: TermsOfConditionsComponent},
    {path: 'privacy-policy', component: PrivacyPolicyComponent},
    {path: 'refund-policy', component: RefundPolicyComponent},
    {path: 'faqs', component: FaqsComponent},
    {path: 'plans', component: ComparePlansComponent}
    // {path: 'pricing', redirectTo: 'billing/pricing'},
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
