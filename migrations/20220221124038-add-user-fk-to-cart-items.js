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
  return db.addForeignKey('cart_items', 'users', 'cart_items_users_fk',{
    'user_id':'id'
  },{
    'onDelete':'CASCADE', // if we delete a user, all its related cart items will be removed
    'onUpdate':'RESTRICT'
  });
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};
