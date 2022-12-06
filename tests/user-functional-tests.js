const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const User = require('../models/User');
chai.use(chaiHttp);
const Utils = require('../utils/utils.js');
const utils = new Utils();

let user_test;
suiteSetup(function() {
  // runs before all tests in this file regardless where this line is defined.
  let user_data = {
    username: 'userTest123',
    firstName: 'first Name test',
    lastName: 'last Name test',
    email: 'test.ddf@tst.zs',
    password: 'Azerty123@',
    passwordControl: 'Azerty123@'
  };
  return User.findOne({username: user_data.username})
    .then((user) => {
      if (!utils.isObject(user) || user === {}) {
        let user = new User(user_data);
        return user.save()
          .then((user) => {
            if (!utils.isObject(user) || user === {}){
              return Promise.reject('Fatal Error, unable to find the user id.')
            }
            else{
              user_test = user
              return Promise.resolve(user)
            }
          })
          .catch((error) => {
            return Promise.reject(error)
          })
      }
      else{
        user_test = user
        return Promise.resolve(user)
      }
    })
    .catch((error) => {
      return Promise.reject(error)
    })
});

suite('Functional Tests', function() {
  
  suite('test User POST /json-test/register', function () {

    test('Test Register ok', function (done) {
      chai
        .request(server)
        .post('/json-test/register')
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({
          username: 'userTest1234',
          firstName: 'first Name test',
          lastName: 'last Name test',
          email: 'test123.ddf@tst.zs',
          password: 'Pppp123-@#$%+=._',
          passwordControl: 'Pppp123-@#$%+=._'
        })
        .end(function (err, res) {
          assert.strictEqual(err, null);
          assert.strictEqual(res.status, 200);
          assert.strictEqual(res.body.status, true);
          assert.strictEqual(res.body.form.password, 'Pppp123-@#$%+=._');
          assert.strictEqual(res.body.form.passwordControl, 'Pppp123-@#$%+=._');
          assert.strictEqual(res.body.form.email, 'test123.ddf@tst.zs');
          done();
        });
    });

    test('Test bad fields chars', function (done) {
      chai
        .request(server)
        .post('/json-test/register')
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({
          username: 'userTest1 sds',
          firstName: 'first &"Name test',
          lastName: 'last &"Name test',
          email: 'test.ddf@tst.zs s',
          password: 'Pppp',
          passwordControl: 'Pppp'
        })
        .end(function (err, res) {
          assert.strictEqual(err, null);
          assert.strictEqual(res.status, 409);
          assert.strictEqual(res.body.status, false);
          assert.strictEqual(res.body.errors.username.msgs[0], 'Invalid username, field must contain only alphanumeric characters and `_`');
          assert.strictEqual(res.body.errors.firstName.msgs[0], 'Invalid First Name, field do not contain special characters like [/_-@#$%+...].');
          assert.strictEqual(res.body.errors.lastName.msgs[0], 'Invalid Last Name, field do not contain special characters like [/_-@#$%+...].');
          assert.strictEqual(res.body.errors.email.msgs[0], 'Email is not valid.');
          assert.strictEqual(res.body.errors.password.msgs[0], 'Password must be greater than 8 and contain at least one uppercase letter, one lowercase letter, and one number');
          done();
        });
    });

    test('Test bad password char', function (done) {
      chai
        .request(server)
        .post('/json-test/register')
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({
          username: 'userTest1',
          firstName: 'first Name test',
          lastName: 'last Name test',
          email: 'teàst.ddf@tst.zs',
          password: 'Pppp123"@',
          passwordControl: 'Pppp123"@'
        })
        .end(function (err, res) {
          assert.strictEqual(err, null);
          assert.strictEqual(res.status, 409);
          assert.strictEqual(res.body.status, false);
          assert.strictEqual(res.body.errors.password.msgs[0], 'Invalid password, field must contain only alphanumeric and [./_-@#$%+] characters');
          assert.strictEqual(res.body.errors.passwordControl.msgs[0], 'Invalid Confirmation password, field must contain only alphanumeric and [./_-@#$%+] characters');
          assert.strictEqual(res.body.errors.email.msgs[0], 'Invalid email, field must contain only alphanumeric and [a-z0-9._\-@] characters.');
          done();
        });
    });

    test('Test bad password control match', function (done) {
      chai
        .request(server)
        .post('/json-test/register')
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({
          username: 'userTest1',
          firstName: 'first Name test',
          lastName: 'last Name test',
          email: 'test.ddf@tst.zs',
          password: 'Pppp123@',
          passwordControl: 'Pppp124@'
        })
        .end(function (err, res) {
          assert.strictEqual(err, null);
          assert.strictEqual(res.status, 409);
          assert.strictEqual(res.body.status, false);
          assert.property(res.body, 'errors');
          assert.property(res.body.errors, 'passwordControl');
          assert.strictEqual(res.body.errors.passwordControl.msgs[0], 'Passwords do not match');
          done();
        });
    });

    test('Test bad email', function (done) {
      chai
        .request(server)
        .post('/json-test/register')
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({
          username: 'userTest1',
          firstName: 'first Name test',
          lastName: 'last Name test',
          email: 'test.ddf@tst',
          password: 'Pppp123@',
          passwordControl: 'Pppp123@'
        })
        .end(function (err, res) {
          assert.strictEqual(err, null);
          assert.strictEqual(res.status, 409);
          assert.strictEqual(res.body.status, false);
          assert.property(res.body, 'errors');
          assert.property(res.body.errors, 'email');
          assert.strictEqual(res.body.errors.email.msgs[0], 'Email is not valid.');
          done();
        });
    });

    test('Test required fields', function (done) {
      chai
        .request(server)
        .post('/json-test/register')
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({})
        .end(function (err, res) {
          assert.strictEqual(err, null);
          assert.strictEqual(res.status, 409);
          assert.strictEqual(res.body.status, false);
          assert.property(res.body, 'errors');
          assert.strictEqual(res.body.errors.username.msgs[0], 'Username is required');
          assert.strictEqual(res.body.errors.firstName.msgs[0], 'First Name is required');
          assert.strictEqual(res.body.errors.lastName.msgs[0], 'Last Name is required');
          assert.strictEqual(res.body.errors.email.msgs[0], 'Email is required');
          assert.strictEqual(res.body.errors.password.msgs[0], 'Password is required');
          assert.strictEqual(res.body.errors.passwordControl.msgs[0], 'Confirmation password is required');
          done();
        });
    });
  });

  suite('test User POST /json-test/edit-password', function () {
    test('Test ok', function (done) {
      
      chai
        .request(server)
        .post('/json-test/edit-password')
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({
          _id: ''+user_test._id || null,
          oldPassword: 'Azerty123@',
          password: 'Pppp123-@#$%+=._',
          passwordControl: 'Pppp123-@#$%+=._'
        })
        .end(function (err, res) {
          assert.strictEqual(err, null);
          assert.strictEqual(res.status, 200);
          assert.strictEqual(res.body.status, true);
          assert.strictEqual(res.body.form.oldPassword, 'Azerty123@');
          assert.strictEqual(res.body.form.password, 'Pppp123-@#$%+=._');
          assert.strictEqual(res.body.form.passwordControl, 'Pppp123-@#$%+=._');
          done();
        });
    });

    test('Test bad fields', function (done) {
      chai
        .request(server)
        .post('/json-test/edit-password')
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({
          _id: ''+user_test._id || null,
          oldPassword: 'Azerty124@',
          password: 'Pppp',
          passwordControl: 'Pppp123'
        })
        .end(function (err, res) {
          assert.strictEqual(err, null);
          assert.strictEqual(res.status, 409);
          assert.strictEqual(res.body.status, false);
          assert.strictEqual(res.body.errors.oldPassword.msgs[0], 'Error, please verrify your old password.');
          assert.strictEqual(res.body.errors.password.msgs[0], 'Password must be greater than 8 and contain at least one uppercase letter, one lowercase letter, and one number');
          assert.strictEqual(res.body.errors.passwordControl.msgs[0], 'Passwords do not match');
          done();
        });
    });

    test('Test required fields', function (done) {
      chai
        .request(server)
        .post('/json-test/edit-password')
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({_id: ''+user_test._id})
        .end(function (err, res) {
          assert.strictEqual(err, null);
          assert.strictEqual(res.status, 409);
          assert.strictEqual(res.body.status, false);
          assert.strictEqual(res.body.errors.oldPassword.msgs[0], 'Old Password is required');
          assert.strictEqual(res.body.errors.password.msgs[0], 'Password is required');
          assert.strictEqual(res.body.errors.passwordControl.msgs[0], 'Confirmation password is required');
          done();
        });
    });
  });

  suite('test User POST /json-test/edit-profile', function (){
    test('test ok', function (done) {
      chai
        .request(server)
        .post('/json-test/edit-profile')
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({
          _id: ''+user_test._id,
          username: 'userTest1234',
          firstName: 'first Name test',
          lastName: 'last Name test',
          email: 'test.ddf@tst.zs'
        })
        .end(function (err, res) {
          assert.strictEqual(err, null);
          assert.strictEqual(res.status, 200);
          assert.strictEqual(res.body.status, true);
          assert.strictEqual(res.body.form.username, 'userTest1234');
          assert.strictEqual(res.body.form.firstName, 'first Name test');
          assert.strictEqual(res.body.form.lastName, 'last Name test');
          assert.strictEqual(res.body.form.email, 'test.ddf@tst.zs');
        });
    });

    test('Test no changes', function (done) {
      chai
        .request(server)
        .post('/json-test/edit-profile')
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({
          _id: ''+user_test._id,
          username: 'userTest123',
          firstName: 'first Name test',
          lastName: 'last Name test',
          email: 'test.ddf@tst.zs'
        })
        .end(function (err, res) {
          assert.strictEqual(err, null);
          assert.strictEqual(res.status, 200);
          assert.strictEqual(res.body.status, true);
          assert.strictEqual(res.body.form.username, 'userTest123');
          assert.strictEqual(res.body.form.firstName, 'first Name test');
          assert.strictEqual(res.body.form.lastName, 'last Name test');
          assert.strictEqual(res.body.form.email, 'test.ddf@tst.zs');
          done();
        });
    });

    test('Test bad username', function (done) {
      chai
        .request(server)
        .post('/json-test/edit-profile')
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({
          _id: ''+user_test._id,
          username: 'userTest123 s',
          firstName: 'first Name test',
          lastName: 'last Name test',
          email: 'test.ddf@tst.zs '
        })
        .end(function (err, res) {
          assert.strictEqual(err, null);
          assert.strictEqual(res.status, 409);
          assert.strictEqual(res.body.status, false);
          assert.strictEqual(res.body.errors.username.msgs[0], 'Invalid username, field must contain only alphanumeric characters and `_`');
          assert.strictEqual(res.body.errors.email.msgs[0], 'Email is not valid.');
          done();
        });
    });
  });
});