/**
 * multer.js
 * Multer Helper Utility Used to set configuration
 * 
 */
 'use strict';

 const multer = require("multer");
 const Utils = require('./utils.js');
 let utils = new Utils();

 function MulterHelper(){
    this.multerStorage = null;
    this.multerFilter = null;
    this.upload = null;

    this.get_destination = (req, file, done) => {
      done(null, 'public')
    }

    this.get_file_hash = (value) => {
      return (utils.isStr(value)) ? utils.getHash(`${value}_${Date.now()}`) : null;
    }

    this.getPath = (file_type) => {
      if(file_type === 'image'){
        return 'gallery/';
      }
      else if(file_type === 'audio'){
        return 'audio/';
      }
      else if(file_type === 'music'){
        return 'music/';
      }
      else if(file_type === 'video'){
        return 'video/';
      }
      else{
        return 'files/';
      }
    }

    this.getFilename = (user_id, file_ext, name='avatar') => {
      if(utils.isStr(user_id) && utils.isStr(file_ext) && utils.isStr(name)){
        const filename = utils.alphanumSanitizer(name);
        const ext = utils.alphanumSanitizer(file_ext);
        const hash = this.get_file_hash(user_id);
        return `${filename}_${hash}.${ext}`
      }
      return null
    }

    this.setUpload = (file_type='image', category='avatar') => {
      
      if(utils.isStr(file_type) && utils.isStr(category)){
        this.multerStorage = multer.diskStorage({
          destination: (req, file, cb) => {
            const path = this.getPath(file_type)
            cb(null, `public/uploaded/${path}`);
          },
          filename: (req, file, cb) => {
            const ext = utils.getExtFromMimeType(file.mimetype);
            const user_id = req.user._id+''
            const filename = this.getFilename(user_id, ext);
            
            ///`files/admin-${file.fieldname}-${Date.now()}.${ext}`
            if(utils.isStr(filename)){
              cb(null, `${filename}`);
            }
            else{
              cb(new Error("Faltal Error unable to set file name."), false)
            }
          },
        });
        
        this.multerFilter = (req, file, cb) => {
          const ext = utils.getExtFromMimeType(file.mimetype);
          if(file_type === 'image' && ['jpg', 'jpeg', 'png'].indexOf(ext)){
            cb(null, true);
          }
          else if(file_type === 'audio' && ['wav'].indexOf(ext)){
            cb(null, true);
          }
          else if(file_type === 'music' && ['mp3'].indexOf(ext)){
            cb(null, true);
          }
          else if(file_type === 'video' && ['mpeg'].indexOf(ext)){
            cb(null, true);
          }
          else if(file_type === 'file' && ['pdf', 'csv', 'json'].indexOf(ext)){
            cb(null, true);
          }
          else{
            cb(new Error(`Not a ${file_type} file!!!`), false);
          }
        };
        
        this.upload = multer({
          storage: this.multerStorage,
          fileFilter: this.multerFilter,
        });

        return true;
      }
      return false;
    }
  }
  
  module.exports = MulterHelper