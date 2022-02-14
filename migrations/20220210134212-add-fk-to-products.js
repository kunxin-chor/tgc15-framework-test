'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  // first arg: name of the table in the database
  return db.addColumn('products', 'category_id',{
    'type':'int',
    'unsigned':true,
    'notNull': true, // every product must have a category_id that refers to an id in the categories
    'foreignKey':{
      // the name is not used in coding at all
      // it's just that every fk must have a unique name
      'name':'product_category_fk',
      // which table the fk is referring to
      'table':'categories',
      // which column the fk is referring to
      'mapping':'id',
      'rules':{
        'onDelete':'cascade', // if we delete a category, all the products belonging to the category will be deleted
        'onUpdate':'restrict' // prevent the primary key of a category to be changed
      }
    }
  })
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};
