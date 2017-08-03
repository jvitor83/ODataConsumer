import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Component, OnInit, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from "rxjs/Subscription";
import { GridODataComponent } from "app/grid/grid.component";

@Component({
    templateUrl: './dashboard.component.html',
    styles: [
        'ion-label{ text-align: left; flex: initial !important; }'
    ]
})
export class DashboardComponent implements OnInit {

    @Input()
    public url: string;
    //private urlSubscription: Subscription;


    @Input() tableName: string;

    tables: string[] = [];

    @ViewChild(GridODataComponent) grid: GridODataComponent;

    public onUrlChange(url: string) {
        localStorage.setItem('oDataUrl',url);
        this.getTables(url);
    }

    private static columnType(type: string): 'numeric' | 'boolean' | 'text' | 'date' {
        if (type == 'Edm.Int16' || type == 'Edm.Int32' || type == 'Edm.Int64' || type == 'Edm.Double') {
            return 'numeric';
        } else if (type == 'Edm.Boolean') {
            return 'boolean';
        } else if (type == 'Edm.DateTimeOffset' || type == 'Edm.DateTime') {
            return 'date';
        } else {
            return 'text';
        }
    }

    metadata: Array<{ version : number, name: string, columns: { name: string, type: 'numeric' | 'boolean' | 'text' | 'date', nullable?: boolean, key: boolean }[] }>;

    private getTables(url: string) {


        let retorno: Array<{ version : number, name: string, columns: { name: string, type: 'numeric' | 'boolean' | 'text' | 'date', nullable?: boolean, key: boolean }[] }> = [];

        let format: 'xml' | 'json' = 'xml';
        if (format == 'xml') {
            const urlMetadata = `${url}$metadata`;
            this.http.get(urlMetadata)
                .map(value => {
                    let response = value.text();
                    let parser = new DOMParser();

                    const entidades = new Array<{ version : number, name: string, columns: Array<{ name: string, type: 'numeric' | 'boolean' | 'text' | 'date', nullable?: boolean, key: boolean }> }>();

                    let xmlDoc = parser.parseFromString(response, "text/xml");
                    let edmx = xmlDoc.getElementsByTagName("Edmx");

                    //version
                    let version = 4;
                    if(edmx && edmx.length > 0){
                        const node = edmx[0];
                        const versionString = node.attributes["Version"].value;
                        if(versionString){
                            version = parseInt(versionString);
                        }
                    }

                    let entitySets = xmlDoc.getElementsByTagName("EntitySet");
                    let entityTypes = xmlDoc.getElementsByTagName("EntityType");
                    for (var ia = 0; ia < entitySets.length; ia++) {

                        let entitySet = entitySets[ia];
                        const name = entitySet.attributes["Name"].value;
                        const entityTypeSplit: string[] = entitySet.attributes["EntityType"].value.split('.');
                        const entityTypeName = entityTypeSplit[entityTypeSplit.length - 1];

                        const colunas = new Array<{ name: string, type: 'numeric' | 'boolean' | 'text' | 'date', nullable?: boolean, key: boolean }>();

                        for (var ib = 0; ib < entityTypes.length; ib++) {
                            const entityType = entityTypes[ib];
                            const entityTypeAttributeName = entityType.attributes["Name"].value;
                            if (entityTypeAttributeName == entityTypeName) {

                                const keys = new Array<string>();
                                const columnsEntityType = entityType.getElementsByTagName("Property");
                                const keysEntityType = entityType.getElementsByTagName("Key");
                                if (keysEntityType && keysEntityType.length > 0) {
                                    const keyEntityType = keysEntityType[0];
                                    const keysOfEntityType = keyEntityType.getElementsByTagName("PropertyRef");
                                    for (var ic = 0; ic < keysOfEntityType.length; ic++) {
                                        const keyOfEntityType = keysOfEntityType[ic];
                                        const keyName = keyOfEntityType.attributes["Name"].value;
                                        keys.push(keyName);
                                    }
                                }


                                for (var id = 0; id < columnsEntityType.length; id++) {
                                    const columnEntityType = columnsEntityType[id];

                                    const columnEntityTypeName = columnEntityType.attributes["Name"].value;
                                    const columnType = columnEntityType.attributes["Type"].value;
                                    const columnTypeJs = DashboardComponent.columnType(columnType);
                                    const columnIsNullable = columnEntityType.attributes["Nullable"] && columnEntityType.attributes["Nullable"].value || null;

                                    const columnIsKey = keys.filter(r => r == columnEntityTypeName).length > 0;

                                    let coluna: { name: string, type: 'numeric' | 'boolean' | 'text' | 'date', nullable?: boolean, key: boolean } = {
                                        name: columnEntityTypeName,
                                        type: columnTypeJs,
                                        nullable: columnIsNullable,
                                        key: columnIsKey,
                                    };

                                    colunas.push(coluna);
                                }


                            }
                        }


                        let item: { version : number, name: string, columns: Array<{ name: string, type: 'numeric' | 'boolean' | 'text' | 'date', nullable?: boolean, key: boolean }> } = {
                            name: name,
                            columns: colunas,
                            version: version
                        };

                        entidades.push(item);
                    }
                    return entidades;
                })
                .subscribe(json => {
                    this.metadata = json;
                    this.grid.oDataVersion = json[0].version || 4;
                    // const tables: Array<{ kind: string, name: string, url: string }> = json.value;
                    // this.tables = tables.filter(table => table.kind == 'EntitySet').map(table => table.name);
                    this.tables = this.metadata.map(r => r.name);
                });
        } else if (format == 'json') {
            const urlMetadata = `${url}#metadata`;
            this.http.get(urlMetadata)
                .map(value => {
                    let response = value.json();
                    return response;
                })
                .subscribe(json => {
                    const tables: Array<{ kind: string, name: string, url: string }> = json.value;
                    this.tables = tables.filter(table => table.kind == 'EntitySet').map(table => table.name);
                });
        }
    }

    updateGrid(value: string) {
        if (!!value) {
            localStorage.setItem('oDataTable', value);
            this.tableName = value;
            this.grid.tableName = value;
            if (this.metadata) {
                const metadataTable = this.metadata.filter(m => m.name == value);
                if (metadataTable && metadataTable.length > 0) {
                    this.grid.metadata = metadataTable[0];
                }
            }
            this.grid.sort = [];
            this.grid.groups = [];
            this.grid.aggregations = [];
            
            this.grid.refresh();
        }

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
        const oDataUrl = localStorage.getItem('oDataUrl');
        if(oDataUrl){
            this.url = oDataUrl;
        }else{
            this.url = "https://gis.ices.dk/qcservice/api/qcdata/";
        }
        
        this.getTables(this.url);

        const table = localStorage.getItem('oDataTable');
        if(table){
            this.tableName = table;
        }else{
            this.tableName = 'mains';
        }

        console.debug('DashboardComponent ngOnInit');
    }
}
