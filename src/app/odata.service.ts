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

  private fetch(state: State, url: string, tableName: string, includeCount = true): Observable<GridDataResult> {
    const queryStr = `${toODataString(state)}`;

    let uri = `${url}${tableName}?${queryStr}`;

    if (includeCount) {
      uri += "&$count=true";
    }
    uri += "&$format=json";

    const hasGroups = state.group.length > 0;
    if (hasGroups) {
      let group = "";

      state.group.forEach(groupDesc => {
        const field = groupDesc.field;
        group += `(${field})`;
        //TODO: Aggregates TEST
        if (groupDesc.aggregates && groupDesc.aggregates.length > 0) {

          groupDesc.aggregates.forEach(agreg => {
            let operator: string = agreg.aggregate;
            const agregField = agreg.field;

            if(operator == 'count'){ operator = 'countdistinct' };

            group += `,aggregate(${agregField} with ${operator} as ${agregField})`;
          });
        }
        //aggregate(IdProcesso with countdistinct as IdProcesso)
      });

      const groupClause = `&$apply=groupby(${group})`;
      uri += groupClause;
    }

    console.log(`REQUEST URL: '${uri}'`);

    return this.http
      .get(uri)
      .debounceTime(750)
      .map(response => response.json())
      .map(response => {

        let total = state.take;
        const responseCount = response["@odata.count"];
        if (responseCount) {
          total = parseInt(responseCount, 10);
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

  public query(state: State, url: string, tableName: string): void {
    this.fetch(state, url, tableName)
      .subscribe(x => super.next(x));
  }


}
