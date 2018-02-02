import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Http, RequestOptions, Headers } from '@angular/http';

import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';

import { SharedService } from '../../../_core/services/shared.service';

import { IUser } from '../../../_core/interfaces/user';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-new-user',
  templateUrl: './new-user.component.html',
  styleUrls: ['./new-user.component.scss']
})
export class NewUserComponent implements OnInit {

  uid = '';
  newAccount = {
    email: '',
    password: '',
    username: ''
  };

  formChecker = {
    success: true,
    msg: ''
  };

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private adb: AngularFireDatabase,
    private afAuth: AngularFireAuth,
    private sharedService: SharedService,
    private http: Http
  ) {}

  ngOnInit() {
    this.getUser();
  }

  async getUser() {
    let user = this.sharedService.getUser();
    if (!user) {
      await this.afAuth.authState.first().toPromise();
      this.uid = await this.afAuth.auth.currentUser.uid;
      user = await this.adb.object(`users/${this.uid}`).valueChanges().first().toPromise() as IUser;
      this.sharedService.storeUser(user);
    } else {
      this.uid = user.id;
    }

    if (!user.admin) {
      this.router.navigate(['/reservations']);
    }
  }

  createAccount() {
    this.formChecker = this.newAccountFormValidator();

    if (this.formChecker.success) {
      this.createNewAccount();
    }
  }

  createNewAccount() {
    const newUser: IUser = {
      name: this.newAccount.username,
      email: this.newAccount.email,
      password: this.newAccount.password,
      admin: false
    };

    // this.adb.list(`users`).push(newUser);
    const reqOptions = new RequestOptions({headers: new Headers({'Content-Type': 'application/json; charset=UTF-8'})});
    return this.http.post(`${environment.firebase.cloudFunctionsURL}/create-account`, JSON.stringify(newUser), reqOptions)
      .map(x => x.json())
  }

  newAccountFormValidator() {
    if (!this.newAccount.email || !this.newAccount.password || !this.newAccount.username) {
      return {success: false, msg: 'All fields are required'};
    } else {
      if (!this.newAccount.email.match(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/)) {
        return {success: false, msg: 'Enter a valid email address'};
      }

      if (!this.newAccount.password.match(/^[a-zA-Z0-9!@#$%^&*]{6,100}$/)) {
        return {success: false, msg: 'Password must be at least 6 characters'};
      }
      return {success: true, msg: ''};
    }
  }
}