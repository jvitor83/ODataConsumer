import { AggregateModalComponent } from './aggregate-modal/aggregate-modal.component';
import { state } from '@angular/animations';
import { Http } from '@angular/http';
import { ODataService } from './../odata.service';
import { Observable } from 'rxjs/Observable';
import { Component, OnInit, ViewChild, Input, QueryList, ViewChildren, ViewContainerRef, ApplicationRef } from '@angular/core';
import { GridDataResult, PageChangeEvent, GridComponent, FooterTemplateDirective } from "@progress/kendo-angular-grid";
import { SortDescriptor, State, FilterDescriptor, GroupDescriptor, CompositeFilterDescriptor, AggregateDescriptor } from "@progress/kendo-data-query";
import { Select, ModalController } from 'ionic-angular';
import { Subject } from "rxjs/Subject";


@Component({
  selector: 'seed-grid',
  templateUrl: './grid.component.html',
  styles: [' .pageSizeInput{ width: 50px; }']
})
export class GridODataComponent implements OnInit {

  @Input() public parentRelation: {
    name: string;
    type: string;
    path: string;
    target: string;
  };
  @Input() public dataItemTableName;
  @Input() public dataItem;

  @ViewChild(GridComponent) grid: GridComponent;

  public view: Observable<GridDataResult>;

  @Input() url: string;
  @Input() tableName: string;

  @Input()
  metadata: { version: number, name: string, type: string,
    columns: { name: string, type: 'numeric' | 'boolean' | 'text' | 'date', nullable?: boolean, key: boolean }[],
    relations: Array<{ name: string, type: string, path: string, target: string }> };

  @Input()
  fullMetadata: {
    version: number;
    type: string;
    name: string;
    columns: {
      name: string;
      type: "boolean" | "numeric" | "text" | "date";
      nullable?: boolean;
      key: boolean;
    }[];
    relations: {
      name: string;
      type: string;
      path: string;
      target: string;
    }[];
  }[];

  sort: SortDescriptor[] = [];
  @Input() pageSize: number = 10;
  skip: number = 0;
  filter: CompositeFilterDescriptor;
  groups: GroupDescriptor[] = [];


  paginate: boolean = true;

  @ViewChildren(Select, { read: ViewContainerRef }) selects: QueryList<Select>;

  private service: ODataService;

  constructor(private http: Http, public modalCtrl: ModalController, private app: ApplicationRef) {
    this.service = new ODataService(this.http);
    //const url = "http://localhost:8153/api.rsc";
    //"dbo_Usuario"

  }

  public relations = [];

  // get relations(){
  //   if (this.metadata && this.metadata.relations) {
  //     return this.metadata.relations;
  //   } else {
  //     return [];
  //   }
  // }

  // public hasRelations(dataItem: any, index: number) {
  //   if (relations) {
  //     return relations.length > 0;
  //   } else {
  //     return false;
  //   }

  // }

  getMetadataFromTable(name) {
    const mt = this.fullMetadata.filter(r => r.name === name)[0];
    return mt;
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

    //this.load();

    this.view.subscribe(r => {
      if (r) {
        const data = r.data;

        // if (this.grid) {
        //   this.grid.columns = new QueryList<ColumnBase>();
        // }
        if (data && data.length > 0) {
          const columnsInferid = Object.keys(data[0]);
          const predicate = columnsInferid.filter(r => r.startsWith('@odata.id'));
          const hasODataId = predicate && predicate.length > 0;

          if (this.metadata && hasODataId === false) {
            // Create the columns by the metadata object generated
            this.columns = this.metadata.columns.map(c => {
              const key = c.name;
              const editor = c.type;
              return {
                field: key, header: key, editor: editor, filter: editor, title: key
              };
            });
            this.relations = this.metadata.relations;
          } else {
            // Create the columns by infering the result
            const filtered = Object.keys(data[0]).filter(r => !(r.indexOf('@odata') !== -1));
            this.columns = filtered.map(key => {

              // Maybe should check the metadata
              let editor: 'text' | 'numeric' | 'date' | 'boolean' = 'text';
              const reg = data[0];
              const valor = reg[key];
              const valorIsBoolean = (typeof valor) === 'boolean';
              const valorIsNumber = (typeof valor) === 'number';

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
              };
            });
          }
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

  private hasKey(name: string, json: any) {

  }

  // tslint:disable-next-line:member-ordering
  public static detailsOfGroupBy(dataItem: any, index: number) {
    let hasODataIdColumn = false;
    if (dataItem) {
      const keys = Object.keys(dataItem);
      if (keys) {
        const filter = keys.filter(k => k === '@odata.id');
        if (filter) {
          hasODataIdColumn = filter.length > 0;
        }
      }
    }


    if (hasODataIdColumn) {
      return true;
    } else {
      return false;
    }
  }

  public notShowDetailsOfGroupBy(dataItem: any, index: number) {
    return !GridODataComponent.detailsOfGroupBy(dataItem, index);
  }

  public showDetailsOfGroupBy(dataItem: any, index: number): boolean {

    // TODO: The only way i found to check if are groupped is to see if dataItem has '@odata.id' property
    // because the 'this' has another scope
    return GridODataComponent.detailsOfGroupBy(dataItem, index);
  }


  aggregationDummy: string;
  public groupChange(groups: GroupDescriptor[]): void {

    if (groups && groups.length > 0) {
      //groups.forEach(group => {
      const group = groups[groups.length - 1];


      const agreggates = new Array<AggregateDescriptor>();
      const columns = (this.metadata && this.metadata.columns);// || this.columns;
      if (columns) {
        columns.forEach(c => {
          if (c.key) {



            agreggates.push(<any>{ field: c.name, aggregate: <any>'count', alias: c.name });



          }
        })
      }

      group.aggregates = agreggates;


      // });



      // let modal = this.modalCtrl.create(AggregateModalComponent, columns);
      // modal.onDidDismiss(data => {
      //   console.log('--------');
      // });
      // modal.present();
    }


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
    this.groups = groups;
    // this.load();
  }
  public filterChange(filter: CompositeFilterDescriptor): void {
    this.filter = filter;
    // this.gridData = filterBy(sampleProducts, filter);
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


    //
    let additionalFilter = '';
    if (this.dataItem) {
      const dataTable = this.fullMetadata.filter(r => r.name === this.dataItemTableName);
      if (dataTable && dataTable.length > 0) {
        const metadataParentTable = dataTable[0];
        const keys = metadataParentTable.columns.filter(r => r.key);
        if (keys && keys.length > 0) {

          const parentTableMetadata = this.fullMetadata.filter(m => m.name === this.dataItemTableName)[0];
          const parentToSonRelation = parentTableMetadata.relations.filter(r => r.name === this.parentRelation.name)[0];

          const sonTableMetadata = this.fullMetadata.filter(m => m.name === this.tableName)[0];
          if (sonTableMetadata) {
            const sonToParentRelation = sonTableMetadata.relations.filter(r => r.target === this.dataItemTableName)[0];

            if (sonToParentRelation) {
              if (sonToParentRelation.type.indexOf('Collection') !== -1) {

                let filters = '';
                keys.forEach((key, index) => {
                  const keyName = key.name;
                  let value = this.dataItem[keyName];
                  if (typeof value === 'string') { value = encodeURIComponent(value); }

                  let filter = '';
                  if (index > 0) { filter += ' and '; }
                  filter = keyName + ' eq ' + value;
                  filters += filter;
                });
                additionalFilter += sonToParentRelation.name + '/any(i: i/' + filters + ')';
              } else {
                let filters = '';
                keys.forEach((key, index) => {
                  const keyName = key.name;
                  let value = this.dataItem[keyName];
                  if (typeof value === 'string') { value = encodeURIComponent(value); }

                  let filter = '';
                  if (index > 0) { filter += ' and '; }
                  filter = sonToParentRelation.name + '/' + keyName + ' eq ' + value;
                  filters += filter;
                });
                additionalFilter += filters;
              }
            }
          }


        }
      }
    }


    // // TODO: Check if has a way to infer the dataItemTableName (instead of creating another property)
    // if (this.dataItem && this.dataItemTableName) {
    //   const dataTable = this.fullMetadata.filter(r => r.name === this.dataItemTableName);
    //   if (dataTable && dataTable.length > 0) {
    //     const metadataParentTable = dataTable[0];
    //     const keys = metadataParentTable.columns.filter(r => r.key);
    //     if (keys && keys.length > 0) {
    //       if (!stateToQuery.filter) {
    //         stateToQuery.filter = {
    //           logic: 'and',
    //           filters: new Array<FilterDescriptor | CompositeFilterDescriptor>()
    //         };
    //       } else {
    //         stateToQuery.filter.filters.shift();
    //       }
    //       stateToQuery.filter.logic = 'and';

    //       const parentTableMetadata = this.fullMetadata.filter(m => m.name === this.dataItemTableName)[0];
    //       const parentToSonRelation = parentTableMetadata.relations.filter(r => r.name === this.parentRelation.name)[0];

    //       const sonTableMetadata = this.fullMetadata.filter(m => m.name === this.tableName)[0];
    //       const sonToParentRelation = sonTableMetadata.relations.filter(r => r.target === this.dataItemTableName)[0];

    //       if (sonToParentRelation) {
    //         if (sonToParentRelation.type.indexOf('Collection') !== -1) {

    //           keys.forEach(key => {
    //             const keyName = key.name;
    //             let value = this.dataItem[keyName];
    //             //if (typeof value === 'string') { value = encodeURIComponent(value); }
    //             const filterDescriptor: FilterDescriptor = {
    //               field: sonToParentRelation.name + '/any(i: i/' + keyName,
    //               operator: 'eq',
    //               value: value + ')'
    //             };
    //             stateToQuery.filter.filters.unshift(filterDescriptor);
    //           });
    //         }
    //       }


    //     }
    //   }
    // }


    // if (this.dataItem && this.groups && this.groups.length > 0) {
    //   if (!stateToQuery.filter) {
    //     stateToQuery.filter = {
    //       logic: 'and',
    //       filters: new Array<FilterDescriptor | CompositeFilterDescriptor>()
    //     };
    //   } else {
    //     stateToQuery.filter.filters.shift();
    //   }
    //   console.log(this.dataItem);
    //   for (const key in this.dataItem) {
    //     const hasArrow = key.indexOf('@') != -1;
    //     const keys = Object.keys(this.dataItem);
    //     const hasColumnWithArrow = keys.some(item => {
    //       const startsWithKeyWithArrow = item.startsWith(key + '@');
    //       return startsWithKeyWithArrow;
    //     });
    //     if ((!hasArrow) && (!hasColumnWithArrow)) {
    //       stateToQuery.filter.logic = 'and';
    //       let value = this.dataItem[key];
    //       if(typeof value == 'string') { value = encodeURIComponent(value); }
    //       const filterDescriptor: FilterDescriptor = {
    //         field: key,
    //         operator: 'eq',
    //         value: value
    //       };
    //       stateToQuery.filter.filters.unshift(filterDescriptor);
    //     }else{
    //       //detail

    //       stateToQuery.filter.logic = 'and';
    //       //get the keys of endtype
    //       const child = this.fullMetadata.filter(r => r.name == this.tableName);
    //       const keysTable = this.metadata.columns.filter(r => r.key);
    //       keysTable.forEach(key => {
    //         const keyName = key.name;
    //         let value = this.dataItem[keyName];
    //         if(typeof value == 'string') { value = encodeURIComponent(value); }
    //         const filterDescriptor: FilterDescriptor = {
    //           field: keyName,
    //           operator: 'eq',
    //           value: value
    //         };
    //         stateToQuery.filter.filters.unshift(filterDescriptor);
    //       });
    //     }
    //   }
    // }



    if (!this.paginate) {
      delete stateToQuery.skip;
      delete stateToQuery.take;
    }

    if (this.selectOnlyVisible && this.hiddenColumns.length > 0) {
      const selects = new Array<string>();

      const columnsToSelect = this.columns.map(c => c.field).filter(column => {
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
      this.service.query(stateToQuery, this.url, this.tableName, true, this.oDataVersion, additionalFilter);
    }
    this.app.tick();
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
