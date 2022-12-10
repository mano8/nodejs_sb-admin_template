/**
 * utils.js
 * 
 */
 'use strict';
const crypto = require("crypto");

function Utils (){
    this.isObject = (value) => {
      return typeof value === 'object' && !Array.isArray(value) && value !== null
    }
  
    this.isArray = (value) => {
      return Array.isArray(value)
    }
    
    this.isNumber = (value) => {
      return !isNaN(value) && value != null
    }
  
    this.round = (value, decimals) => {
      return (this.isNumber(value) && this.isNumber(decimals)) ? +value.toFixed(decimals) : undefined;
    }
  
    this.isStr = (value) => {
      return (typeof value === 'string' || value instanceof String)
    }
    
    /*
    * Test if value is valid key.
    *
    */
    this.iskey = (value) => {
      return this.isStr(value) && /(?=\w{1,30}$)^([a-zA-Z0-9]+(?:_[a-zA-Z0-9]+)*)$/.test(value)
    }

    /*
    * Test if value has valid email chars.
    *
    */
    this.isEmailChars = (value) => {
      return this.isStr(value) && /^([a-z0-9._\-@]{4,80})$/i.test(value)
    }

    /*
    * Test if value has valid password chars.
    * can contain only [a-z0-9.\/_\-@#$%+]
    */
    this.isPasswordChars = (value) => {
      return this.isStr(value) && /^([a-z0-9._\-@#$%+=]+)$/i.test(value)
    }

    /*
    * Test if value has valid password chars.
    * can contain only [a-z0-9.\/_\-@#$%+]
    */
    this.isNameChars = (value) => {
      return this.isStr(value) && /^([^._@#$%+=&²"<>(){}\[\]|\\\/°£$ø%µ*,?;:!]+)$/i.test(value)
    }

    /*
    * Sanitize an alphanumeric value.
    *
    */
    this.alphanumSanitizer = (value, defaultValue='') => {
      return (this.isStr(value)) ? value.replace(/([^a-z0-9_]+)/gi, '') : defaultValue;
    }

    /*
    * Sanitize an email.
    *
    */
    this.emailSanitizer = (value) => {
      return value.replace(/([^a-z0-9._\-@]+)/gi, '');
    }

    /*
    * Sanitize a password.
    *
    */
    this.passwordSanitizer = (value) => {
      return value.replace(/([^a-z0-9._\-@]+)/gi, '');
    }

    /*
    * hash string value with md5 hex.
    *
    */
    this.getHash = (value) => {
      return (this.isStr(value)) ? crypto.createHash('md5').update(value.trim().toLowerCase()).digest("hex") : null;
    }

    this.getExtFromMimeType = (mimetype) => {
      return (this.isStr(mimetype) && mimetype !== '' && mimetype.split('/')[1]) ? mimetype.split('/')[1] : null;
    }
  }
  
  module.exports = Utils