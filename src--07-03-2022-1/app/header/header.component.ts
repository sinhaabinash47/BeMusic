import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { CurrentUser } from '@common/auth/current-user';
import { Settings } from '@common/core/config/settings.service';
import { ThemeService } from '@common/core/theme.service';
import { Localizations } from '@common/core/translations/localizations.service';
import { LocalizationWithLines } from '@common/core/types/localization-with-lines';
import { BehaviorSubject } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { Translations } from '@common/core/translations/translations.service';
import { Toast } from '@common/core/ui/toast.service';
import { AuthService } from '@common/auth/auth.service';
import { HttpErrors } from '@common/core/http/errors/http-errors.enum';
interface TranslationLine {
  key: string;
  translation: string;
}
@Component({
  selector: 'header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements OnInit {
  public selectedLocalization: LocalizationWithLines;
  public localizations$ = new BehaviorSubject<LocalizationWithLines[]>([]);
  public lines$ = new BehaviorSubject<TranslationLine[]>([]);
  public apiUrl: any;
  constructor(public theme: ThemeService, public config: Settings, public user: CurrentUser,
    public router: Router, private localizationsApi: Localizations, private settings: Settings,
    private toast: Toast, private i18n: Translations, public auth: AuthService) {
    this.apiUrl = auth.getApiUrl()
  }

  ngOnInit(): void {
    this.localizationsApi.all()
      .subscribe(response => {
        console.log(response.localizations)
        this.setLocalizations(response.localizations);
      });

  }
  private setLocalizations(localizations: LocalizationWithLines[]) {
    this.localizations$.next(localizations);
    const active = localizations.find(l => l.model.language === this.settings.get('i18n.default_localization')) || localizations[0];
    if (active) {
      this.setSelectedLocalization(active);
    }
  }
  public setSelectedLocalization(localization: LocalizationWithLines) {
    if (this.selectedLocalization?.model.id === localization.model.id) return;

    this.selectedLocalization = localization;
    //   if lang lines are already fetched for this localization, bail
    if (localization.lines) {
      this.lines$.next(this.originalLines());
      this.i18n.setLocalization(this.selectedLocalization);
    } else {
      this.selectedLocalization.lines = {};
      this.localizationsApi.get(this.selectedLocalization.model.name)
        .subscribe(response => {
          this.selectedLocalization = response.localization;
          this.i18n.setLocalization(this.selectedLocalization);
          const localizations = [...this.localizations$.value];
          const i = localizations.findIndex(loc => loc.model.id === localization.model.id);
          localizations[i] = response.localization;
          this.localizations$.next(localizations);
          this.lines$.next(this.originalLines());
        });
    }

  }
  private linesToArray(lines: { [key: string]: string }): TranslationLine[] {
    const transformed = [];
    for (const key in lines) {
      transformed.push({ key, translation: lines[key] });
    }
    return transformed;
  }
  private originalLines() {
    return this.selectedLocalization.lines ?
      this.linesToArray(this.selectedLocalization.lines) :
      [];
  }
  isLabelUser(){
    return this.user.hasRole('label')
  }
  showMenus() {
    return ((location.pathname !== '/complete-profile') && (location.pathname !== '/plans') && ((this.router.url !== '/complete-profile') && (this.router.url !== '/plans')))
  }
}
