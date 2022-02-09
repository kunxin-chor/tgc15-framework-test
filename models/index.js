// if we require a direcyory or folder instead a file
// nodejs will default to look for index.js
const bookshelf = require('../bookshelf');

// for consistency, we keep the name of the model
// to be the same as the database, but singular and the
// first alphabet is uppercase
const Product = bookshelf.model('Product',{
    tableName:'products' // which table is this model referring to
})

module.exports = { Product };