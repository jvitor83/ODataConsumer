import { Component, OnInit } from '@angular/core';
import { NavParams } from "ionic-angular";

@Component({
  selector: 'seed-aggregate-modal',
  templateUrl: './aggregate-modal.component.html',
  styleUrls: ['./aggregate-modal.component.scss']
})
export class AggregateModalComponent implements OnInit {

  public columns: { name: string, type: 'numeric' | 'boolean' | 'text' | 'date', nullable?: boolean, key: boolean }[];

  constructor(public params: NavParams) {
    this.columns = this.params.data;
  }

  ngOnInit() {

  }

}
