import { AggregateModalComponent } from './aggregate-modal/aggregate-modal.component';
import { state } from '@angular/animations';
import { Http } from '@angular/http';
import { ODataService } from './../odata.service';
import { Observable } from 'rxjs/Observable';
import { Component, OnInit, ViewChild, Input, QueryList, ViewChildren, ViewContainerRef } from '@angular/core';
import { GridDataResult, PageChangeEvent, GridComponent, FooterTemplateDirective } from "@progress/kendo-angular-grid";
import { SortDescriptor, State, FilterDescriptor, GroupDescriptor, CompositeFilterDescriptor, AggregateDescriptor } from "@progress/kendo-data-query";
import { Select, ModalController } from 'ionic-angular';
import { Subject } from "rxjs/Subject";


@Component({
  selector: 'seed-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss']
})
export class GridODataComponent implements OnInit {

  @ViewChild(GridComponent) grid: GridComponent;

  public view: Observable<GridDataResult>;

  @Input() url: string;
  @Input() tableName: string;

  metadata: { version: number, name: string, columns: { name: string, type: 'numeric' | 'boolean' | 'text' | 'date', nullable?: boolean, key: boolean }[] };

  sort: SortDescriptor[] = [];
  @Input() pageSize: number = 10;
  skip: number = 0;
  filter: CompositeFilterDescriptor;
  groups: GroupDescriptor[] = [];


  paginate: boolean = true;

  @ViewChildren(Select, { read: ViewContainerRef }) selects: QueryList<Select>;

  constructor(private http: Http, private service: ODataService, public modalCtrl: ModalController) {

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

        // if (this.grid) {
        //   this.grid.columns = new QueryList<ColumnBase>();
        // }

        const columnsInferid = Object.keys(data[0]);
        const predicate = columnsInferid.filter(r => r.startsWith('@odata.id'));
        const hasODataId = predicate && predicate.length > 0;

        if (this.metadata && hasODataId == false) {
          //Create the columns by the metadata object generated
          this.columns = this.metadata.columns.map(c => {
            const key = c.name;
            const editor = c.type;
            return {
              field: key, header: key, editor: editor, filter: editor, title: key
            }
          });
        } else {
          //Create the columns by infering the result
          const filtered = Object.keys(data[0]).filter(r => !(r.indexOf('@odata') != -1));
          this.columns = filtered.map(key => {

            //Maybe should check the metadata
            let editor: 'text' | 'numeric' | 'date' | 'boolean' = 'text';
            const reg = data[0];
            const valor = reg[key];
            const valorIsBoolean = (typeof valor) == 'boolean';
            const valorIsNumber = (typeof valor) == 'number';

            if (valor == null) {
              editor = 'text'; //revisit
            } else if (valorIsBoolean) {
              editor = 'boolean';
            } else if (valorIsNumber) {
              editor = 'numeric';
            } else {
              try {
                const valorDateTime = new Date(valor);
                if (!isNaN(valorDateTime.getDate())) {
                  editor = 'date';
                }
              } catch (err) { }
            }

            return {
              field: key, header: key, editor: editor, filter: editor, title: key
            }
          });
        }

        this.grid.columns.reset(this.columns);


      }
    });
    //this.view = new ODataService(this.http, this.url, this.tableName);
  }

  public sortChange(sort: SortDescriptor[]): void {
    this.sort = sort;
    this.load();
  }

  oDataVersion = 4;

  public aggregations: any = {};
  private aggregationSelects: Map<string, string> = new Map<string, string>();
  public aggregationChange(event, id) {
    this.aggregationSelects.set(id, event);



  }


  public aliases: any = {};
  private aliasInputs: Map<string, string> = new Map<string, string>();
  public aliasChange(event, id) {
    this.aliasInputs.set(id, event);
  }

  aggregationDummy: string;
  public groupChange(groups: GroupDescriptor[]): void {

    let columns = (this.metadata && this.metadata.columns) || this.columns;
    let modal = this.modalCtrl.create(AggregateModalComponent, columns);
    modal.onDidDismiss(data => {
      console.log('--------');
    });
    modal.present();
    

    // if (groups && groups.length > 0) {
    //   groups.forEach(group => {


    //     this.aggregationSelects.forEach((value, key) => {
    //       if (value && value != 'none') {

    //         // let alias = key;
    //         // const aliasInput = this.aliasInputs.get(key);
    //         // if(aliasInput) {
    //         //   alias = aliasInput;
    //         // }
    //         let alias = key;
    //         const aliasInput = this.aliases[key];
    //         if(aliasInput) {
    //           alias = aliasInput;
    //         }


    //         const agreggates = new Array<AggregateDescriptor>();
    //         agreggates.push(<any>{ field: key, aggregate: <any>value, alias: alias });
    //         group.aggregates = agreggates;
    //       }
    //     });


    //     // if (this.aggregationSelects.has(nameAggreg)) {
    //     //   let selectValue: any = this.aggregationSelects.get(nameAggreg);

    //     //   const agreggates = new Array<AggregateDescriptor>();
    //     //   const keys = this.metadata.columns.filter(c => c.key);
    //     //   keys.forEach(key => {
    //     //     agreggates.push({ field: key.name, aggregate: selectValue });
    //     //   });
    //     //   group.aggregates = agreggates;
    //     // }
    //   });



    //   // groups.forEach(group => {
    //   //   const agreggates = new Array<AggregateDescriptor>();
    //   //   //Maybe should be abble to allow the user to specify the aggregate (PivotGrid?)
    //   //   const keys = this.metadata.columns.filter(c => c.key);
    //   //   // const key = keys[0];
    //   //   // agreggates.push({ field: key.name, aggregate: 'count' });
    //   //   keys.forEach(key => {
    //   //     agreggates.push({ field: key.name, aggregate: 'count' });
    //   //   });
    //   //   group.aggregates = agreggates;
    //   // });
    // }
    // this.groups = groups;
    // this.load();
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

  selectOnlyVisible: boolean = true;

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


    if(!this.paginate){
      delete stateToQuery.skip;
      delete stateToQuery.take;
    }

    if(this.selectOnlyVisible && this.hiddenColumns.length > 0) {
      let selects = new Array<string>();
      
      let columnsToSelect = this.columns.map(c => c.field).filter(column => {
        const includes = this.hiddenColumns.indexOf(column) > -1;
        const notIncludes = !includes;
        return notIncludes;
      });
      columnsToSelect.forEach(col => {
        selects.push(col);
      });
      (<any>stateToQuery).select = selects;
    }


    if ((!!this.url) && (!!this.tableName)) {
      this.service.query(stateToQuery, this.url, this.tableName, true, this.oDataVersion);
    }

  }

  public refresh() {
    this.load();
  }

  //   modelChanged: Subject<number> = new Subject<number>();
  // changed(value: number) {
  //         this.modelChanged.next(value);
  //     }


  //

  public columns: Array<any> = new Array<any>();
  // public columns: {
  //   field: string, header: string, editor: string, filter: string
  // }[] = [

  // ];

  public hiddenColumns: string[] = [];

  public restoreColumns(): void {
    this.hiddenColumns = [];
  }

  public hideColumn(field: string): void {
    this.hiddenColumns.push(field);
  }

}
