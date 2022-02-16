const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");
require("dotenv").config();


// setup sessions and flash messaging
const session = require('express-session');
const flash = require('connect-flash');
const FileStore = require('session-file-store')(session);

// create an instance of express app
let app = express();

// set the view engine
app.set("view engine", "hbs");

// static folder
app.use(express.static("public"));

// setup wax-on
wax.on(hbs.handlebars);
wax.setLayoutPath("./views/layouts");

// enable forms
app.use(
  express.urlencoded({
    extended: false
  })
);

// inject date for all hbs files
app.use(function(req,res,next){
  res.locals.date = new Date();  // res.locals is response.locals
                                 // the locals object contain the variables for the hbs file
                                 // if we define res.lcoals.date, it means that ALL hbs files
                                 // have access to the date variable
  next();  // MUST call the next functiont to pass the request to next middleware, or if there
           // is no more middlewares,pass to the route.
})

// configure sessions 
app.use(session({
  'store': new FileStore(),  // a sessions store determines how the session data is saved
                             // if using FileStore, we are saving it to a file. 
  'secret':'keyboard cat',   // used for encrpyting session ids 
  'resave': false,
  'saveUninitialized':true   // if a request arrives with no session, create a new session                          
}))

// setup the flash message
// add the flash function to req (aka the request) using the flash middleware
app.use(flash());

// register the Flash middleware
app.use(function(req,res,next){
  // req.flash - retriving the flash messages from the session file
  // and deleting it at the same time
  res.locals.success_messages = req.flash('success_messages');
  res.locals.error_messages = req.flash('error_messages');
  next();
})

// import in routes
const landingRoutes = require('./routes/landing');
const productRoutes = require('./routes/products');

async function main() {
    app.use('/', landingRoutes);
    // the first parameter is the prefix
    // the second parameter is the router object
    app.use('/products', productRoutes);
}

main();

app.listen(3000, () => {
  console.log("Server has started");
});