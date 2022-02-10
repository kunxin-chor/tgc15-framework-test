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
  // first arg of db.createTable is the table name
  // - try to use plural (works better with the bookshelf ORM)
  // - all lowercase (so that it can work with bookshefl orm)
  return db.createTable('categories',{
    // id int unsigned PRIMARY KEY AUTO_INCREMENT
    'id': {
      'type':'int',
      'unsigned':true,
      'primaryKey':true,
      'autoIncrement':true
    },
    // name varchar(100)
    'name': {
      'type':'string',
      'length':100
    }
  } )
};

exports.down = function(db) {
  return db.dropTable('categories');
};

exports._meta = {
  "version": 1
};
