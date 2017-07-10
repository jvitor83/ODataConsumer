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

    if(includeCount){
       uri += "&$count=true";
    }
    uri += "&$format=json";

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

        return (<GridDataResult>{
          data: response.value,
          total: total
        })
      });
  }

  public query(state: State, url: string, tableName: string): void {
    this.fetch(state, url, tableName)
      .subscribe(x => super.next(x));
  }


}
