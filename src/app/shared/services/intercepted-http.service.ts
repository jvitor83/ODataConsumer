import { Injectable, Inject, Injector } from "@angular/core";
import { ConnectionBackend, RequestOptions, Request, RequestOptionsArgs, Response, Http, Headers, XHRBackend } from "@angular/http";
import { Observable } from "rxjs/Rx";
import { BaseAuthService, AUTH_SERVICE } from "./base-auth.service";

@Injectable()
export class InterceptedHttp extends Http {
  constructor(backend: ConnectionBackend, defaultOptions: RequestOptions, @Inject(AUTH_SERVICE) protected authService: BaseAuthService<any>) {
    super(backend, defaultOptions);
  }

  request(url: string | Request, options?: RequestOptionsArgs): Observable<Response> {
    return super.request(url, options);
  }

  get(url: string, options?: RequestOptionsArgs): Observable<Response> {
    url = this.updateUrl(url);
    return super.get(url, this.getRequestOptionArgs(options));
  }

  post(url: string, body: string, options?: RequestOptionsArgs): Observable<Response> {
    url = this.updateUrl(url);
    return super.post(url, body, this.getRequestOptionArgs(options));
  }

  put(url: string, body: string, options?: RequestOptionsArgs): Observable<Response> {
    url = this.updateUrl(url);
    return super.put(url, body, this.getRequestOptionArgs(options));
  }

  delete(url: string, options?: RequestOptionsArgs): Observable<Response> {
    url = this.updateUrl(url);
    return super.delete(url, this.getRequestOptionArgs(options));
  }

  private updateUrl(req: string) {
    return req;
  }

  private getRequestOptionArgs(options?: RequestOptionsArgs): RequestOptionsArgs {
    if (options == null) {
      options = new RequestOptions();
    }
    if (options.headers == null) {
      options.headers = new Headers();
    }

    if (!options.headers.has('Content-Type')) {
      //options.headers.append('Content-Type', 'application/json');
    }

    if (this.authService && this.authService.auth.value.isAuthenticated) {
      options.headers.append('Authorization', 'Bearer ' + this.authService.auth.value.identity.token);
    }

//"x-cdata-authtoken: MY_AUTH_TOKEN"
    //options.headers.append('x-cdata-authtoken', '8c8P2t8j6N4g8y5W9x2z');

    return options;
  }
}



export function httpFactory(
  xhrBackend: XHRBackend,
  requestOptions: RequestOptions,
  authenticationStateService: BaseAuthService<any>
): Http {
  return new InterceptedHttp(
    xhrBackend,
    requestOptions,
    authenticationStateService
  );
}
