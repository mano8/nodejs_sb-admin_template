var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;
var mongoose = require('mongoose');

var db;
var error;
var waiting = [];

mongoose.Promise = global.Promise;
const URI = process.env.MONGO_URI;
//mongo connection
mongoose.connect(URI, { useNewUrlParser: true, useUnifiedTopology: true }, function(err, database) {
    error = err;
    db = database;

    waiting.forEach(function(callback) {
        callback(err, database);
    });


     if(!err) {
    console.log("We are connected to stormdb");
  }
});

var db = mongoose.connection;

module.exports.db = db;
