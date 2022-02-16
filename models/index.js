// if we require a direcyory or folder instead a file
// nodejs will default to look for index.js
const bookshelf = require('../bookshelf');

// for consistency, we keep the name of the model
// to be the same as the database, but singular and the
// first alphabet is uppercase
const Product = bookshelf.model('Product',{
    tableName:'products', // which table is this model referring to
    // name of the relationship is the function name (below)
    // keep the name of the relationship to be the model name lowercase
    // it is singular because of belongsTo
    category()  {
        // eqv. one product belongs to one cateogry
        return this.belongsTo('Category')
    },
    tags() {
        return this.belongsToMany('Tag');
    }
})

// make sure the name of the model
// (1st parameter of the book bookshelf.model call) is the singular
// form of the table name and the first alphabet is upper case
const Category = bookshelf.model('Category', {
    tableName:'categories', // this model refers to the categories table in the database
                           // table name is plural
    // the relationship name is the lower case of the 
    // model name, plural (because it's hasMany relationship)
    products() {
        // the arg of hasMany is the Model name
        return this.hasMany('Product');
    },
})

// first arg is name of the model, so the model's name is Tag
const Tag = bookshelf.model("Tag", {
    'tableName':'tags',
    products() {
        return this.belongsToMany('Product');
    }
} )

// first arg is the name of the model, and it must be singular form of the
// table name, with the first alphabet in uppercase.
const User = bookshelf.model("User", {
    'tableName':'users'
})

module.exports = { Product, Category, Tag, User };