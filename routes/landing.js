// holds all the rotues related to the landing page
// landing pages are: main page, about us, contact us

const express = require('express');
const router = express.Router(); // a Router is an object that can store many routes

// add in a route for the main page
router.get('/', function(req,res){
    res.render('landing/index')
});

router.get('/about-us', function(req,res){
    res.render('landing/about-us');
})

router.get('/contact-us', function(req,res){
    res.render('landing/contact-us');
})

module.exports = router; // export out the router so
                         // that index.js can use it