const express = require('express');
// an Express router can store routes
const router = express.Router();

// import in the model
const { Product, Category, Tag } = require('../models');

// import in creatProductForm and bootstrapField
const {bootstrapField, createProductForm} = require('../forms');

const { checkIfAuthenticated} = require('../middlewares');

async function getProductById(productId) {
    const product = await Product.where({
        'id': productId
    }).fetch({
        'require':false,
        withRelated:['tags'] // fetch all the tags associated with the product
    });
    return product;
}

// add routes to the routers
router.get('/', async function(req,res){
    // If we are referring to the Model itself,
    // we are referring to the table
    let products = await Product.collection().fetch({
        withRelated:['category'] // fetch the category row that is related to the product as well
                                 // the argument takes in the relationship name
    }); // => select * from products
    
    console.log(products.toJSON());

    res.render('products/index',{
        'products': products.toJSON() // impt! make sure to call .toJSON() on
                                      // the results
    })
})

// add checkIfAuthenticated middleware for this route
router.get('/create',checkIfAuthenticated , async function(req,res){

     /* below is an example of how the choices for 
    dropdown select should look like:
    * it's an array of array.
    * each inner array represent a choice
        * element 0 is the value of the choice
        * element 1 is the display of the choice
        
     eg:  
        let choices = [
            [101, "ABC"],
            [202, "DEF"],
            [303, "GHI"]   
        ]
    */
 

    const allCategories = await Category.fetchAll().map(function(category){
        return [ category.get('id'), category.get('name')]
    });

    const allTags = await Tag.fetchAll().map(function(tag){
        return [ tag.get('id'), tag.get('name')]
    })

    const productForm = createProductForm(allCategories, allTags);
  

    res.render('products/create',{
        // convert the form object to HTML
        // and 'format' it using the bootstrapField function
        'form': productForm.toHTML(bootstrapField),
        'cloudinaryName':process.env.CLOUDINARY_NAME,
        'cloudinaryApiKey':process.env.CLOUDINARY_API_KEY,
        'cloudinaryUploadPreset':process.env.CLOUDINARY_UPLOAD_PRESET

    })
})

router.post('/create', checkIfAuthenticated, async function(req,res){
    // goal: create a new product based on the input in the forms

    const allCategories = await Category.fetchAll().map(function(category){
        return [ category.get('id'), category.get('name')]
    });

    const allTags = await Tag.fetchAll().map(function(tag){
        return [ tag.get('id'), tag.get('name')]
    })

    // create an instance of the product form
    const productForm = createProductForm(allCategories, allTags);
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
            newProduct.set('category_id', form.data.category_id);  
            newProduct.set('image_url', form.data.image_url)        ;
  
            await newProduct.save();

           // create the product first, then save the tags
           // beause we need the product to attach the tags
            if (form.data.tags) {
                let selectedTags = form.data.tags.split(',');
                // attach the product with the categories
                // which ids are in the array argument 
                await newProduct.tags().attach(selectedTags);
            }

            // flash messages can ONLY be used before a redirect
            req.flash('success_messages', 'Product created successfully')  // <-- we call the req.flash() function of the app.use(flash()) in index.js
            
            // a redirect sends a response back to the browser
            // tell it to visit the URL in the first argument
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

router.get('/:product_id/update', checkIfAuthenticated, async function(req,res){
  
    // get all the possible categories from the database
    const allCategories = await Category.fetchAll().map(function(category){
        return [ category.get('id'), category.get('name')]
    });

    // get all the possible tags
    const allTags = await Tag.fetchAll().map(function(tag){
        return [ tag.get('id'), tag.get('name')]
    })

    const productId = req.params.product_id;
   // fetch one row from the table
   // using the bookshelf orm
   const product = await getProductById(productId);

   // create an instance of product form
   const productForm  = createProductForm(allCategories, allTags);
   // reminder: to retrieve the value field 
   // from a model instance, use .get()
   productForm.fields.name.value = product.get('name'); // <== retrieve the product name and assign it to the form
   productForm.fields.cost.value = product.get('cost');
   productForm.fields.description.value = product.get('description');
   productForm.fields.category_id.value = product.get('category_id');

   // get only the ids from the tags that belongs to the product
   const selectedTags = await product.related('tags').pluck('id');
   // set the existing tags
   productForm.fields.tags.value = selectedTags;

   res.render('products/update',{
       'form': productForm.toHTML(bootstrapField),
       'product': product.toJSON()
   })
})

router.post('/:product_id/update', checkIfAuthenticated, async function(req,res){
    // fetch the instance of the product that we wish to update
    const product = await Product.where({
        'id': req.params.product_id
    }).fetch({
        require: true,
        withRelated:['tags']    
    })

    // get all the categories
    const allCategories = await Category.fetchAll().map(function(category){
        return [ category.get('id'), category.get('name')]
    });

    // get all the tags
    const allTags = await Tag.fetchAll().map(function(tag){
        return [ tag.get('id'), tag.get('name')]
    })

    // create the product form
    const productForm = createProductForm(allCategories, allTags);

    // pass the request into the product form
    productForm.handle(req, {
        'success':async function(form) {
            // executes if the form data is all valid
            // product.set('name', form.data.name);
            // product.set('cost', form.data.cost);
            // product.set('description', form.data.description)
            // product.set('category_id, form.data.category_id)
            // if ALL the names of the fields matches
            // the column names in the table, we can use the following shortcut

            // use object destructuring to extract the tags key from `form.data`
            // into the `tags` variable,
            // and all the remaining keys will go into `productData`
            let {tags, ...productData} = form.data;

            product.set(productData);
            await product.save();

            let tagIds = tags.split(','); // change for example '1,2,3' into [1,2,3]

            // get all the existing tags inside the product
            let existingTagIds = await product.related('tags').pluck('id');
            console.log("existingTagIds=",existingTagIds);
            // find all the tags to remove
            let toRemove = existingTagIds.filter( function(id){
                return tagIds.includes(id) === false;
            });
            console.log("toremove=", toRemove);
            await product.tags().detach(toRemove);
            await product.tags().attach(tagIds)

            res.redirect('/products');
        },
        'error':function() {
            // executes if the form data contains
            // invalid entries
        }
    })
})

router.get('/:product_id/delete', checkIfAuthenticated, async function(req,res){
    const product = await getProductById(req.params.product_id);
    res.render('products/delete',{
        'product': product.toJSON()
    })
})

router.post('/:product_id/delete', checkIfAuthenticated, async function(req,res){
    const product = await getProductById(req.params.product_id);
    await product.destroy(); // same as "DELETE FROM products where id = ?"
    res.redirect('/products');
})

// export the router
module.exports = router;