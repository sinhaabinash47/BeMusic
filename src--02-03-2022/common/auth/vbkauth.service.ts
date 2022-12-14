import {Injectable, NgZone} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {CurrentUser} from './current-user';
import {Toast} from '../core/ui/toast.service';
import {User} from '../core/types/models/User';
import {BehaviorSubject, Observable} from 'rxjs';
import {Settings} from '../core/config/settings.service';
import {AppHttpClient} from '../core/http/app-http-client.service';
import {BackendResponse} from '../core/types/backend-response';
import { RoleService } from '@common/admin/roles/role.service';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    isLabel:boolean=false;
    public forcedEmail$ = new BehaviorSubject(null);
    agree: any;
    constructor(
        protected httpClient: AppHttpClient,
        protected currentUser: CurrentUser,
        protected router: Router,
        protected route: ActivatedRoute,
        protected toast: Toast,
        protected zone: NgZone,
        protected config: Settings,
        public rolesService: RoleService
    ) {
        this.agree=JSON.parse(localStorage.getItem('isAgree'));
    }
    isAgree(){
        return this.agree && this.agree.value
    }
    public djTypes(){
        return this.httpClient.get('djtypes');
    }
    public trendingTracks(){
        return this.httpClient.get('trendingTracks');
    }
    public login(credentials: object): BackendResponse<{data: string}> {
        return this.httpClient.post('auth/login', credentials);
    }

    public register(credentials: object): BackendResponse<{bootstrapData?: string, message?: string}> {
        return this.httpClient.post('auth/register', credentials);
    }

    public logOut() {
        this.httpClient.post('auth/logout').subscribe(() => {
            this.currentUser.assignCurrent();
            this.router.navigate(['/login']);
        });
    }

    public sendPasswordResetLink(credentials: object): Observable<{ data: string }> {
        return this.httpClient.post('auth/password/email', credentials);
    }

    public resetPassword(credentials: object): Observable<{ data: User }> {
        return this.httpClient.post('auth/password/reset', credentials);
    }

    public resendEmailConfirmation(email: string): BackendResponse<void> {
        return this.httpClient.post('auth/email/verify/resend', {email});
    }

    /**
     * Get URI user should be redirect to after login.
     */
    public getRedirectUri(): string {
        if (this.currentUser.redirectUri) {
            const redirectUri = this.currentUser.redirectUri;
            this.currentUser.redirectUri = null;
            return redirectUri;
        } else if (this.currentUser.isAdmin()) {
            return this.config.get('vebto.auth.adminRedirectUri');
        } else {
            return this.config.get('vebto.auth.redirectUri');
        }
    }
    public fetchAllRoles() {
        return this.httpClient.get('roles');
    }
}
