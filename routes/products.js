const express = require('express');
const router = express.Router();

router.get('/', function(req,res){
    res.send('View all products');
})

router.get('/create', function(req,res){
    res.send("Creating a new product");
})

module.exports = router;