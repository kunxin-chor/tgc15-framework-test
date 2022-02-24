const express = require('express')
const router = express.Router();
const { createProductForm } = require('../../forms');


const productDataLayer = require('../../dal/products');
const { Product } = require('../../models');
const { checkIfAuthenticatedWithJWT } = require('../../middlewares');

router.get('/', async function(req,res){
    const allProducts = await productDataLayer.getAllProducts();
    res.json(allProducts);
})

// POST /api/products
// allow user to add in new products
router.post('/', checkIfAuthenticatedWithJWT, async function(req,res){
    const allCategories = await productDataLayer.getAllCategories();
    const allTags = await productDataLayer.getAllTags();
    const productForm = createProductForm(allCategories, allTags);

    productForm.handle(req,{
        'success':async function(form) {

            // object destructuring
            // extract out tags from form.data into the `tags` variable
            // the remaining key values pairs in form.data will be stored in productData
            let { tags, ...productData } = form.data;
            const product = new Product(productData)   ;
            await product.save();

            // save the many to many relationship between the new product and tags
            if (tags) {
                await product.tags().attach(tags.split(','));
            }
            res.json(product);
        },
        'error':async function(form) {
            // manual errors handling
            let errors = {};
            // in caolan form, all form errors are stored in forms.fields.keys
            for (let key in form.fields) {
                // check if that particular key has an error
                if (form.fields[key].error) {
                    // if there is, add it to the errors object
                    errors[key] = form.fields[key].error;
                }
            }
            res.json(errors);
        }
    })
})


module.exports = router;
