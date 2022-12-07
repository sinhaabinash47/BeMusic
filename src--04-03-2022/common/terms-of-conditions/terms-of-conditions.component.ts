import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'terms-of-conditions',
  templateUrl: './terms-of-conditions.component.html',
  styleUrls: ['./terms-of-conditions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TermsOfConditionsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
