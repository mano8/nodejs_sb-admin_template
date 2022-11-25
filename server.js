'use strict';

const express     = require('express');
const bodyParser  = require('body-parser');
const cors        = require('cors');
require('dotenv').config();

const apiRoutes         = require('./routes/login.js');

let app = express();

const port = process.env.PORT || 3000
const host = process.env.HOST || '127.0.0.1'


app.set('view engine', 'pug');
app.set('views', './views/pug');
app.use('/public', express.static(process.cwd() + '/public'));

app.use(cors({origin: '*'})); //For FCC testing purposes only



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


//Index page (static HTML)
let user;
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
app.route('/')
  .get(function (req, res) {
    res.render('index', { 
      page: page,
      user: user 
    });
  });


//Routing for API 
apiRoutes(app);  
    
//404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

//Start our server!
const listener = app.listen(port, host, function () {
  console.log('Your app is listening on port ' + listener.address().port + " addr: "+listener.address().address);
  
});

module.exports = app; //for testing
