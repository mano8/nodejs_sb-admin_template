/**
 * gravatar.js
 * Gravatar Utility Used to get links and profile data
 * 
 */
'use strict';
const Utils = require('./utils.js');
let utils = new Utils();

function Gravatar(){

  this.getHash = (email) => {
    return utils.getHash(email);
  }

  this.getUrl = (hash, type='identicon') => {
    const grv_type = utils.alphanumSanitizer(type, 'identicon');
    return (utils.isStr(hash)) ? "https://www.gravatar.com/avatar/"+hash+".jpg?d="+grv_type : null;
  }

  this.getAvatar = (email, type='identicon') => {
    return this.getUrl(this.getHash(email), type);
  }
}

module.exports = Gravatar