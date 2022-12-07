import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'refund-policy',
  templateUrl: './refund-policy.component.html',
  styleUrls: ['./refund-policy.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RefundPolicyComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
