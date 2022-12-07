import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { CurrentUser } from '@common/auth/current-user';

@Component({
  selector: 'footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent implements OnInit {

  constructor(private router: Router, public user: CurrentUser) { }

  ngOnInit(): void {
  }

  isTournamentRoute() {
    console.log('this.router.url');
    console.log(window.location.href);
    var url = window.location.href;

    return (url.indexOf('admin') !== -1);
  }
}
