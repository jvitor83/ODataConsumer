import { Router } from '@angular/router';
import { style } from '@angular/animations';
import { PopoverController, Platform, ToastController } from 'ionic-angular';
import { Component, OnInit, Input, Inject } from '@angular/core';
import { Network } from '@ionic-native/network';
import { AUTH_SERVICE, BaseAuthService } from "../../../shared/services/base-auth.service";
import { Observable } from "rxjs/Observable";
import { Subscriber } from "rxjs/Subscriber";



@Component({
  selector: 'seed-userinfo',
  templateUrl: './userinfo.component.html',
  styles: [`
  ion-icon { 
    font-size: 100px; 
    color : white; 
    text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;
}

p {
    word-wrap: break-word;
}
  `]
})
export class UserinfoComponent implements OnInit {

  constructor( @Inject(AUTH_SERVICE) private authService: BaseAuthService<any>, private platform: Platform, private popoverCtrl: PopoverController, private router: Router, private network: Network, public toastCtrl: ToastController) {

  }

  name;
  image;
  isLoggedIn;

  ngOnInit() {
    this.authService.auth.subscribe(authenticated => {
      this.name = authenticated.identity.user.name;
      this.image = authenticated.identity.user.pictureUri;
      this.isLoggedIn = authenticated.isAuthenticated;
    });
    //this.authService.isAuthenticated.subscribe(isAuthenticated => this.isLoggedIn = isAuthenticated);
  }

  // get name(){
  //   return this.authService.authenticated.subscribe(r => r.user.name);
  //   // return this.authService.authenticated.flatMap(authenticated => {
  //   //   return authenticated.user.name;
  //   // });
  // }


  static isUser(user: Oidc.User | void): user is Oidc.User {
    return (<Oidc.User>user) !== undefined;
  }

  // get image() {
  //   return this.authService.authenticated.flatMap(r => {
  //     const picture = r.user.getClaim('picture');
  //     return picture;
  //   });
  //   // let imageUrl: Array<string> = this.authService.currentUser && this.authService.currentUser.profile && this.authService.currentUser.profile.picture || null;
  //   // if (imageUrl != null && imageUrl.length > 0) {
  //   //   return imageUrl[0];
  //   // }
  //   // return null;
  // }

  // async isLoggedIn() {
  //   return this.authService.isAuthenticated.asObservable();
  // }

  // get isLoggedIn() {
  //   return this.authService.isAuthenticated.asObservable();
  // }

  logout() {
    this.authService.logout();
    this.router.navigate(['']);
  }

  login() {
    var networkState = this.network.type;
    if (networkState !== 'none') {
      localStorage.removeItem(location.host + ':callback');
      this.authService.login();
    } else {
      this.toastCtrl.create({
        message: 'Impossible to Login without Internet connection!',
        duration: 3000
      }).present();
    }
  }

}
