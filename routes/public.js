'use strict';
const publicController = require('../controllers/publicController.js')

module.exports = (app) => {
    app.route('/')
      .get((req, res) => {
        let page = {
          name: "Dashboard",
          title: "Dashboard",
          breadcrumbs: [
            {
              name: "Dashboard",
              link: '',
              text: "Dashboard",
            }
          ]
        }
        console.log("Home page data: ", page)
        res.render('index', { 
          page: page
        });    
      })
}