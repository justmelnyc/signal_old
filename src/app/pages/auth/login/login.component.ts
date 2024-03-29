import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import * as firebase from 'firebase/app';

import { IUser } from '../../../_core/interfaces/user';
import { ILoginInfo } from '../../../_core/interfaces/login-info';
import { SharedService } from '../../../_core/services/SharedService/shared.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginUser: ILoginInfo = {
    email: '',
    password: ''
  };

  formChecker = {
    success: true,
    msg: ''
  };

  constructor(
    private router: Router,
    private afAuth: AngularFireAuth,
    private adb: AngularFireDatabase,
    private sharedService: SharedService
  ) { }

  ngOnInit() {
  }

  authenticate() {
    this.formChecker = this.loginFormValidation();

    if (this.formChecker.success) {
      this.authenticateUser();
    }
  }

  async authenticateUser() {
    try {
      await this.afAuth.auth.signInWithEmailAndPassword(this.loginUser.email, this.loginUser.password);
      // await this.afAuth.auth.createUserWithEmailAndPassword(this.loginUser.email, this.loginUser.password);

      const currentUser = await this.afAuth.auth.currentUser;
      const user: IUser = {
        id: currentUser.uid,
        name: currentUser.displayName,
        email: currentUser.email,
        password: this.loginUser.password,
        photo: currentUser.photoURL,
        admin: false
      };

      const db = await this.adb.object(`users/${currentUser.uid}`).valueChanges().first().toPromise() as IUser;

      if (!db) {
        await this.adb.object(`users/${currentUser.uid}`).set(user);
      } else {
        user.admin = db.admin;
      }

      this.sharedService.storeUser(user);
      this.router.navigate(['']);
    } catch (e) {
      console.log(e);
    }
  }

  loginFormValidation()  {
    if (!this.loginUser.email || !this.loginUser.password) {
      return {success: false, msg: 'All fields are required'};
    } else {
      if (!this.loginUser.email.match(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/)) {
        return {success: false, msg: 'Enter a valid email address'};
      }

      if (!this.loginUser.password.match(/^[a-zA-Z0-9!@#$%^&*]{6,100}$/)) {
        return {success: false, msg: 'Password must be at least 6 characters'};
      }
      return {success: true, msg: ''};
    }
  }
}
