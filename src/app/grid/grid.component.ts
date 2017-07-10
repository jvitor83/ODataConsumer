import { state } from '@angular/animations';
import { Http } from '@angular/http';
import { ODataService } from './../odata.service';
import { Observable } from 'rxjs/Observable';
import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { GridDataResult, PageChangeEvent } from "@progress/kendo-angular-grid";
import { SortDescriptor, State, FilterDescriptor, GroupDescriptor, CompositeFilterDescriptor } from "@progress/kendo-data-query";
import { Subject } from "rxjs/Subject";

@Component({
  selector: 'seed-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss']
})
export class GridComponent implements OnInit {

  @ViewChild(GridComponent) grid: GridComponent;

  public view: Observable<GridDataResult>;

  @Input() url: string;
  @Input() tableName: string;



  sort: SortDescriptor[] = [];
  @Input() pageSize: number = 10;
  skip: number = 0;
  filter: CompositeFilterDescriptor;
  groups: GroupDescriptor[] = [];


  constructor(private http: Http, private service: ODataService) {

    //const url = "http://localhost:8153/api.rsc";
    //"dbo_Usuario"

  }

  ngOnInit() {
    this.view = this.service;


    // const state = Object.assign({}, null, {
    //   filter: {
    //     filters: [{
    //       field: "CategoryID", operator: "eq", value: CategoryID
    //     }],
    //     logic: "and"
    //   }
    // })

    this.load();

    this.view.subscribe(r => {
      if (r) {
        const data = r.data;
        //{ field: key, header: key, hidden: key == "id" }
        this.columns = Object.keys(data[0]).map(key => {

          //Maybe should check the metadata
          let editor: 'text' | 'numeric' | 'date' | 'boolean' = 'text';
          const reg = data[0];
          const valor = reg[key];
          const valorIsBoolean = (typeof valor) == 'boolean';
          const valorIsNumber = (typeof valor) == 'number';

          if (valorIsBoolean) {
            editor = 'boolean';
          } else if (valorIsNumber) {
            editor = 'numeric';
          } else {
            try {
              const valorDateTime = Date.parse(valor);
              if ((typeof valorDateTime) == 'number') {
                editor = 'date';
              }
            } catch (err) { }
          }

          return {
            field: key, header: key, editor: editor, filter: editor
          }
        });
      }
    });
    //this.view = new ODataService(this.http, this.url, this.tableName);
  }

  public sortChange(sort: SortDescriptor[]): void {
    this.sort = sort;
    this.load();
  }
  public groupChange(groups: GroupDescriptor[]): void {
    this.groups = groups;
    this.load();
  }
  public filterChange(filter: CompositeFilterDescriptor): void {
    this.filter = filter;
    //this.gridData = filterBy(sampleProducts, filter);
    this.load();
  }
  public pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.load();
  }

  private load(state?: State): void {
    let stateToQuery: State = null;

    if (state) {
      stateToQuery = state;
    } else {
      stateToQuery = {
        skip: this.skip,
        take: this.pageSize,
        filter: this.filter,
        sort: this.sort,
        group: this.groups
      };
    }

    this.service.query(stateToQuery, this.url, this.tableName);
  }

  public refresh() {
    this.load();
  }

  //   modelChanged: Subject<number> = new Subject<number>();
  // changed(value: number) {
  //         this.modelChanged.next(value);
  //     }


  //
  public columns: {
    field: string, header: string, editor: string, filter: string
  }[] = [

  ];

  public hiddenColumns: string[] = [];

  public restoreColumns(): void {
    this.hiddenColumns = [];
  }

  public hideColumn(field: string): void {
    this.hiddenColumns.push(field);
  }

}
