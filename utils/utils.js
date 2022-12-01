function Utils (){
    this.isObject = (value) => {
      return typeof value === 'object' && !Array.isArray(value) && value !== null
    }
  
    this.isArray = (value) => {
      return Array.isArray(value)
    }
    
    this.isNumber = (value) => {
      return !isNaN(value)
    }
  
    this.round = (value, decimals) => {
      return (this.isNumber(value) && this.isNumber(decimals)) ? +value.toFixed(decimals) : value;
    }
  
    this.isStr = (value) => {
      return (typeof value === 'string' || value instanceof String)
    }
    
    /*
    * Test if value is valid key.
    *
    */
    this.iskey = (value) => {
      return /(?=\w{1,30}$)^([a-zA-Z0-9]+(?:_[a-zA-Z0-9]+)*)$/.test(value)
    }
  }
  
  module.exports = Utils