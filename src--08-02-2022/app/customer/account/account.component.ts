import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
