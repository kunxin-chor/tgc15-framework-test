const express = require('express');
// an Express router can store routes
const router = express.Router();

// import in the model
const { Product } = require('../models');

// import in creatProductForm and bootstrapField
const {bootstrapField, createProductForm} = require('../forms');

async function getProductById(productId) {
    const product = await Product.where({
        'id': productId
    }).fetch({
        'require':false
    });
    return product;
}

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
    const productForm = createProductForm();
    res.render('products/create',{
        // convert the form object to HTML
        // and 'format' it using the bootstrapField function
        'form': productForm.toHTML(bootstrapField)
    })
})

router.post('/create', function(req,res){
    // goal: create a new product based on the input in the forms

    // create an instance of the product form
    const productForm = createProductForm();
    productForm.handle(req,{
        // the success function will be called
        // if the form's data as provided by the user
        // has no errors or invalid data
        'success':async function(form) {
            console.log(form.data);

            // create a new instance of the Product model
            // NOTE: an instance of a model refers to ONE row
            // inside the table
            const newProduct = new Product();
            newProduct.set('name', form.data.name);
            newProduct.set('cost', form.data.cost);
            newProduct.set('description', form.data.description);
            await newProduct.save();
            res.redirect('/products');
        },
        // the function associated with 'error' will be
        // called if the form has invalid data,
        // such as having text for cost
        'error':function(form) {
            res.render('products/create',{
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

router.get('/:product_id/update', async function(req,res){
   const productId = req.params.product_id;
   // fetch one row from the table
   // using the bookshelf orm
   const product = await getProductById(productId);

   // create an instance of product form
   const productForm  = createProductForm();
   // reminder: to retrieve the value field 
   // from a model instance, use .get()
   productForm.fields.name.value = product.get('name'); // <== retrieve the product name and assign it to the form
   productForm.fields.cost.value = product.get('cost');
   productForm.fields.description.value = product.get('description');

   res.render('products/update',{
       'form': productForm.toHTML(bootstrapField),
       'product': product.toJSON()
   })
})

router.post('/:product_id/update', async function(req,res){
    // fetch the instance of the product that we wish to update
    const product = await Product.where({
        'id': req.params.product_id
    }).fetch({
        require: true
    })

    // create the product form
    const productForm = createProductForm();

    // pass the request into the product form
    productForm.handle(req, {
        'success':async function(form) {
            // executes if the form data is all valid
            // product.set('name', form.data.name);
            // product.set('cost', form.data.cost);
            // product.set('description', form.data.description)

            // if ALL the names of the fields matches
            // the column names in the table, we can use the following shortcut
            product.set(form.data);
            await product.save();
            res.redirect('/products');
        },
        'error':function() {
            // executes if the form data contains
            // invalid entries
        }
    })
})

router.get('/:product_id/delete', async function(req,res){
    const product = await getProductById(req.params.product_id);
    res.render('products/delete',{
        'product': product.toJSON()
    })
})

router.post('/:product_id/delete', async function(req,res){
    const product = await getProductById(req.params.product_id);
    await product.destroy();
    res.redirect('/products');
})

// export the router
module.exports = router;