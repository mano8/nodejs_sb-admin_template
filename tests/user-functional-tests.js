const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  suite('test POST /json-test/register', function () {
    test('Test ok', function (done) {
      chai
        .request(server)
        .post('/json-test/register')
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({
          username: 'userTest1',
          firstName: 'first Name test',
          lastName: 'last Name test',
          email: 'test.ddf@tst.zs',
          password: 'Pppp123-@#$%+=._',
          passwordControl: 'Pppp123-@#$%+=._'
        })
        .end(function (err, res) {
          assert.strictEqual(err, null);
          assert.strictEqual(res.status, 200);
          assert.strictEqual(res.body.status, true);
          assert.strictEqual(res.body.form.password, 'Pppp123-@#$%+=._');
          assert.strictEqual(res.body.form.passwordControl, 'Pppp123-@#$%+=._');
          assert.strictEqual(res.body.form.email, 'test.ddf@tst.zs');
          done();
        });
    });

    test('Test bad password', function (done) {
      chai
        .request(server)
        .post('/json-test/register')
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({
          username: 'userTest1',
          firstName: 'first Name test',
          lastName: 'last Name test',
          email: 'test.ddf@tst.zs',
          password: 'Pppp',
          passwordControl: 'Pppp'
        })
        .end(function (err, res) {
          assert.strictEqual(err, null);
          assert.strictEqual(res.status, 409);
          assert.strictEqual(res.body.status, false);
          assert.property(res.body, 'errors');
          assert.property(res.body.errors, 'password');
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
          email: 'test.ddf@tst.zs',
          password: 'Pppp123"@',
          passwordControl: 'Pppp123"@'
        })
        .end(function (err, res) {
          assert.strictEqual(err, null);
          assert.strictEqual(res.status, 409);
          assert.strictEqual(res.body.status, false);
          assert.property(res.body, 'errors');
          assert.property(res.body.errors, 'password');
          assert.strictEqual(res.body.errors.password.msgs[0], 'Invalid password, field must contain only alphanumeric and [./_-@#$%+] characters');
          assert.property(res.body.errors, 'passwordControl');
          assert.strictEqual(res.body.errors.passwordControl.msgs[0], 'Invalid Confirmation password, field must contain only alphanumeric and [./_-@#$%+] characters');
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

    test('Test bad email chars', function (done) {
      chai
        .request(server)
        .post('/json-test/register')
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({
          username: 'userTest1',
          firstName: 'first Name test',
          lastName: 'last Name test',
          email: 'teàst@tst.com',
          password: 'Pppp123@',
          passwordControl: 'Pppp123@'
        })
        .end(function (err, res) {
          assert.strictEqual(err, null);
          assert.strictEqual(res.status, 409);
          assert.strictEqual(res.body.status, false);
          assert.property(res.body, 'errors');
          assert.property(res.body.errors, 'email');
          assert.strictEqual(res.body.errors.email.msgs[0], 'Invalid email, field must contain only alphanumeric and [a-z0-9._\-@] characters.');
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
});