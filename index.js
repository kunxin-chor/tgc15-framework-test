const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");
const csrf = require('csurf'); // protection vs. CRSF attacks
      
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
// this is a middleware that enables us to
// access to form data in req.body
app.use(
  express.urlencoded({
    extended: false
  })
);

// inject date for all hbs files
// middleware to inject the current date
//  as variable in all hbs files.
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

// global middleware - it is applied to all routes
// inject the current logged in user to hbs files
app.use(function(req,res,next){
  // res.locals is an object
  // res.locals.user is to add a new property named 'user' to the object
  res.locals.user = req.session.user;  // in hbs file,
                                       // we are able to access
                                       // the user object from the client's session
  next(); // MUST call next() or else your express app will just hang with no error messages
})

// app.use(function(req,res,next){
//   console.log(req.body);
//   next();
// })

// add in csrf protection
app.use(csrf());

// check if there is a csrf error. If so, render a friendly error message
app.use(function(err, req, res, next){
   // check for bad csrf token error
  if (err && err.code == "EBADCSRFTOKEN") {
    req.flash('error_messages', 'The form has expired. Please try again.');
    res.redirect('back'); // 'back' means tell the browser go back to previous page
  } else {
    next();
  }
})

// share the csrf token with all hbs files
app.use(function(req,res,next){
  res.locals.csrfToken = req.csrfToken();  // req.csrfToken() is available
                                           // after we do `app.use(csrf())`
  next();
})



// import in routes
const landingRoutes = require('./routes/landing');
const productRoutes = require('./routes/products');
const userRoutes = require('./routes/users');


async function main() {
    app.use('/', landingRoutes);
    // the first parameter is the prefix
    // the second parameter is the router object
    app.use('/products', productRoutes);
    app.use('/users', userRoutes);
}

main();

app.listen(3000, () => {
  console.log("Server has started");
});