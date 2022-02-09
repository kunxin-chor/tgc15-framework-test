const express = require('express');
const router = express.Router();

// import in the model
const { Product } = require('../models');

router.get('/', async function(req,res){
    // If we are referring to the Model itself,
    // we are referring to the table
    let products = await Product.collection().fetch();
    res.send(products.toJSON());
})

router.get('/create', function(req,res){
    res.send("Creating a new product");
})

module.exports = router;