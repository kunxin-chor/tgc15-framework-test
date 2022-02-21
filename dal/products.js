const { Product, Category, Tag } = require('../models')

async function getProductById(productId) {
    const product = await Product.where({
        'id': productId
    }).fetch({
        'require':false,
        withRelated:['tags'] // fetch all the tags associated with the product
    });
    return product;
}

async function getAllCategories() {
    const allCategories = await Category.fetchAll().map(function(category){
        return [ category.get('id'), category.get('name')]
    });
    return allCategories;
}

async function getAllTags() {
    const allTags = await Tag.fetchAll().map(function(tag){
        return [ tag.get('id'), tag.get('name')]
    })
    return allTags;
}

async function createProduct(productData) {
    const newProduct = new Product();
    newProduct.set('name', productData.name);
    newProduct.set('cost', productData.cost);
    newProduct.set('description', productData.description);
    newProduct.set('category_id', productData.category_id);  
    newProduct.set('image_url', productData.image_url)        ;

    await newProduct.save();
    return newProduct;
}

module.exports = { getProductById, getAllCategories, getAllTags, createProduct}