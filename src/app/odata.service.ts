import { Observable } from 'rxjs/Observable';
import { Http } from '@angular/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Injectable } from '@angular/core';
import { GridDataResult } from "@progress/kendo-angular-grid";
import { toODataString, State } from "@progress/kendo-data-query";

@Injectable()
export class ODataService extends BehaviorSubject<GridDataResult> {

  constructor(private http: Http) {
    super(null);
  }

  private insertAtString(original, index, string) {
    if (index > 0) {
      return original.substring(0, index) + string + original.substring(index, original.length);
    } else {
      return string + original;
    }
  }

  private fetch(state: State, url: string, tableName: string,
    includeCount = true, version = 4, additionalFilter = ''): Observable<GridDataResult> {
    let queryStr = `${toODataString(state)}`;

    if (additionalFilter) {
      const stringFilter = '$filter=';
      const indexOfFilter = queryStr.indexOf(stringFilter);
      if (indexOfFilter !== -1) {
        const indexToIncludeAdditionalFilters = indexOfFilter + stringFilter.length;
        queryStr = this.insertAtString(queryStr, indexToIncludeAdditionalFilters, additionalFilter);
      } else {
        queryStr += '&$filter=' + additionalFilter;
      }
    }

    let uri = `${url}${tableName}?${queryStr}`;


    if (version >= 4) {
      if (includeCount) {
        uri += "&$count=true";
      }
      uri += "&$format=json";
    } else {
      if (includeCount) {
        uri += "&$inlinecount=allpages";
      }
    }

    const hasGroups = state.group.length > 0;
    if (hasGroups) {
      let group = "(";

      let fields = '(' + state.group.map(g => g.field).join(',') + ')';

      group += fields + ',';

      state.group.forEach(groupDesc => {
        //TODO: Aggregates TEST
        if (groupDesc.aggregates && groupDesc.aggregates.length > 0) {

          let aggregate = "";

          groupDesc.aggregates.forEach(agreg => {
            let operator: string = agreg.aggregate;
            const agregField = agreg.field;

            if (operator == 'count') { operator = 'countdistinct'; };


            if ((<any>agreg).alias) {
              aggregate += `${agregField} with ${operator} as ` + (<any>agreg).alias + ",";
            } else {
              aggregate += `${agregField} with ${operator} as ${agregField},`;
            }


          });
          aggregate = aggregate.slice(0, -1);

          const aggregateClause = `aggregate(${aggregate})`;

          group += aggregateClause;
        }

        //aggregate(IdProcesso with countdistinct as IdProcesso)
      });

      group += ')';

      const groupClause = `&$apply=groupby${group}`;
      uri += groupClause;
    }


    if ((<any>state).select && (!hasGroups)) {
      let selectColumns = "";
      const selects: Array<string> = (<any>state).select;
      selects.forEach(col => {
        selectColumns += col + ",";
      });
      selectColumns = selectColumns.slice(0, -1);
      const selectClause = `$select=${selectColumns}`;
      uri += "&" + selectClause;
    }


    console.log(`REQUEST URL: '${uri}'`);

    return this.http
      .get(uri)
      .map(response => response.json())
      .map(response => {

        let total = 0;
        const responseCount = response["@odata.count"] || response["odata.count"];
        if (responseCount) {
          total = parseInt(responseCount, 10);
        } else {
          const arrayValues = response.value as Array<any>;
          total = arrayValues.length;
          if (state && state.take && state.take > 0) {
            if (arrayValues.length < state.take) {
              total = arrayValues.length;
            } else {
              total = state.take;
            }
          }


        }


        let dataResult = <GridDataResult>{
          data: response.value,
          total: total,
          //aggregateResult: translateAggregateResults(AggregateResults)
          //https://github.com/telerik/kendo-angular/issues/158#issuecomment-291503532
        };

        return dataResult;
      });
  }

  public query(state: State, url: string, tableName: string, includeCount = true, version = 4, additionalFilter = ''): void {
    this.fetch(state, url, tableName, includeCount, version, additionalFilter)
      .subscribe(x => super.next(x));
  }


}
