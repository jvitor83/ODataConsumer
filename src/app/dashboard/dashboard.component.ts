import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from "rxjs/Subscription";

@Component({
    templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {

    @Input()
    public url: string;
    //private urlSubscription: Subscription;


    @Input() tableName: string;

    tables: string[] = [];

    public onUrlChange(url: string) {
        this.getTables(url);
    }

    private getTables(url: string) {
        const urlMetadata = `${url}#metadata`;
        this.http.get(urlMetadata).map(value => value.json()).subscribe(json => {
            const tables: Array<{kind: string, name: string, url: string}> = json.value;
            this.tables = tables.map(table => table.name);
        });
    }

    // public ngOnDestroy(): void {
    //     if (this.urlSubscription) {
    //         this.urlSubscription.unsubscribe();
    //     }
    // }

    constructor(private http: Http) {
        console.debug('DashboardComponent constructor');
    }

    ngOnInit(): void {
        console.debug('DashboardComponent ngOnInit');
    }
}
