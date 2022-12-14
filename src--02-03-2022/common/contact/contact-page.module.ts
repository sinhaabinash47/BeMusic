import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ContactComponent} from '@common/contact/contact.component';
import {MaterialNavbarModule} from '@common/core/ui/material-navbar/material-navbar.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TranslationsModule} from '@common/core/translations/translations.module';
import { MatButtonModule } from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';


@NgModule({
    declarations: [
        ContactComponent,
    ],
    imports: [
        CommonModule,
        MaterialNavbarModule,
        FormsModule,
        ReactiveFormsModule,
        TranslationsModule,
        MatButtonModule,
        MatIconModule
    ],
    exports: [
        ContactComponent,
    ]
})
export class ContactPageModule {
}
