const express = require('express');
// an Express router can store routes
const router = express.Router();

// import in the model
const { Product } = require('../models');

// add routes to the routers
router.get('/', async function(req,res){
    // If we are referring to the Model itself,
    // we are referring to the table
    let products = await Product.collection().fetch(); // => select * from products
    
    res.render('products/index',{
        'products': products.toJSON() // impt! make sure to call .toJSON() on
                                      // the results
    })
})

router.get('/create', function(req,res){
    res.send("Creating a new product");
})

// export the router
module.exports = router;