import { style } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { NavParams } from "ionic-angular";

@Component({
  selector: 'seed-aggregate-modal',
  templateUrl: './aggregate-modal.component.html',
  styles: ['.aggregateModalContainer{ background-color: white; }']
})
export class AggregateModalComponent implements OnInit {

  public columns: { field: string, type: 'numeric' | 'boolean' | 'text' | 'date', nullable?: boolean, key: boolean }[];

  constructor(public params: NavParams) {
    this.columns = this.params.data;
  }

  submit() {

  }

  ngOnInit() {

  }

}
