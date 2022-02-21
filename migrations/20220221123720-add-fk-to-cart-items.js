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
  // first arg: the name of the table to add the FK to (the child table)
  // second arg: the destination table (i.e the parent table)
  // third arg: the name of the FK,
  // fourth arg: mapping 
  return db.addForeignKey('cart_items', 'products', 'cart_items_products_fk',{
    'product_id':'id'
  },{
    'onDelete':'CASCADE',
    'onUpdate':'RESTRICT'
  });
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};
