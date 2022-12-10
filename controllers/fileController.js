const File = require('../models/File');
const Utils = require('../utils/utils.js');

let utils = new Utils();


exports.findFileById = (file_id, done) => {
  try {
    File.findById({"_id": personId}, done);
  } catch (error) {
    done(error, null);
  }
};

exports.createFile = (dataFile, done) => {
    try {
      let file = new File(dataFile);
      file.save((err, data) => {done(err, data);});
    } catch (error) {
      done(error, null);
    }
};

exports.updateFile = (file_id, dataFile, done) => {
    try {
      File.findOneAndUpdate(
        {"_id": file_id},
        dataFile, 
        { new: false },
        (err, data) => {done(err, data);}
      )
    } catch (error) {
      done(error, null);
    }
};

exports.removeFile = (file_id, done) => {
  try {
    File.findByIdAndRemove({"_id": file_id}, (err, data) =>   {
      done(err, data)
    })
  } catch (error) {
    done(error, null);
  }
};