const express = require('express')
const router = express.Router();

const productDataLayer = require('../../dal/products');

router.get('/', async function(req,res){
    const allProducts = await productDataLayer.getAllProducts();
    res.json(allProducts);
})


module.exports = router;
