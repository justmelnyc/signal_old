let functions = require('firebase-functions');
import * as firebase from 'firebase';

const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

const express = require('express');
const router = new express.Router();
const routerNonAuth = new express.Router();
const cors = require('cors')({origin: true});

const storageRef = firebase.storage().ref();

router.use(cors);
routerNonAuth.use(cors);

routerNonAuth.post('/create-account', (req, res) => {
  admin.auth().createUser({
    email: req.body.email,
    emailVerified: false,
    password: req.body.password,
    displayName: req.body.name,
    disabled: false
  })
    .then(function(userRecord) {
      // See the UserRecord reference doc for the contents of userRecord.
      console.log("Successfully created new user:", userRecord);
      res.send(200, userRecord);
    })
    .catch(function(error) {
      console.log("Error creating new user:", error);
      res.status(500).send(error.message);
    });
});

routerNonAuth.post('/delete-account', (req, res) => {
  admin.auth().deleteUser(req.body)
    .then(function() {
      console.log("Successfully deleted selected account:", );
      res.send(200);
    })
    .catch(function(error) {
      console.log("Error deleting account:", error);
      res.status(500).send(error.message);
    });
});

exports.addNewAccount = functions.https.onRequest((req, res) => {
  req.url = '/create-account';
  return routerNonAuth(req, res)
});

exports.deleteAccount = functions.https.onRequest((req, res) => {
  req.url = '/delete-account';
  return routerNonAuth(req, res)
});
