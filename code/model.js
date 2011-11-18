/*global node:true */
/*jshint globalstrict:true,  sub:true */

"use strict";

var log = require('nlogger').logger(module),
    step = require('step'),
    redis = require('redis').createClient(),
    User,
    Collection;


function copyProps(propList, src, dest) {
    var i;

    if (!propList || (propList instanceof Array)) {
        throw new Error('Invalid list of property names');
    }
    for(i=0; i < propList.length; i++) {
        dest[i] = src[i];
    }
}

/**
 * @param {Object} userdata
 * @param {Function} callback
 */
User = exports.User = function(userdata, callback) {
    var d = userdata || {};

    redis.incr('users_maxid', function(err,data) {

        this.id = data;
        this.joinDate = new Date();
        this.lastLogin = new Date();

        copyProps(['email', 'firstname', 'lastname', 'referredBy'], d, this);
        callback(err, this);
    });
};

/**
 * @param {Function} callback
 */
User.save = function(callback) {
        redis.multi()
            .sadd(['user', this.id, 'collections'].join(':'), 'mydvds', 'loans', 'borrowed', 'wishlist', 'towatch')
            .hmset(['user',this.id].join(':'), 
                   'email', this.email,
                   'firstname', this.firstname,
                   'lastname', this.lastname,
                   'joinDate', this.joinDate.getTime(),
                   'lastLogin', this.lastLogin.getTime()
                  )
            .sadd('users_all', this.id)
            .sadd('users_pending', this.id)
        .exec(function(err) {
            callback(err, this);
        });
};


/**
 * @param {String|Number} collection
 * @param {Number|String} start defaults to 0 if null be MUST be specified even if null
 * @param {Number|String} end defaults to 10 if null be MUST be specified even if null
 * @param {Function(err, data)} callback where:
 *  error {Object} error if any 
 *  data {Array} of {Object}, each {Object} has title and barcode {String} properties.
 *
 */
User.getDvdTitlesBarcodes = function(collection, start, end, callback) {

    redis.sort(['collection', this.id, collection].join(':'),
        'BY', 'dvd:*->title',
        'LIMIT', (start || 0), (end || 10),
        'ALPHA',
        'GET', 'dvd:*->title',
        'GET', 'dvd:*->barcode',

        function(err, data) {
            var objList = [],
                i;

            if (err) {
                callback(err, null);
            } else {
                for(i = 0; i < data.length; i=i+2) {
                    objList.push({ 'title' : data[i], 'barcode' : data[i+1]});
                }
                callback(null, objList);
            }
        }
    );
};

/**
 * @param {String|Number} collection
 * @param {String|Number} dvdID
 * @param {Function}  callback
 *
 */
User.addDvdToCollection = function(collection, dvdID, callback) {
    redis.zadd([this.id, 'collection', collection].join(':'), dvdID, function(err, data) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, data);
        }
    });
};

/**
 * @param {Function}  callback
 */
User.getCollectionCounts = function(callback) {
    var collections = [];
    step(
        function getCollectionKeys() {
            redis.keys('collection:'+this.id+':*', this);
        },
        function getCollectionCounts(err, results) {
            if (err) {
               throw err;
            } 
            
            var group = this.group(),
                i;

            console.log('res:'+JSON.stringify(results));
            for( i=0; i < results.length;i++) {
                collections[i] = { 'name' : results[i].replace(/^(.*:)+/,'') };
                console.log('repl:'+results[i].replace(/^(.*:)+/,''));
                redis.zcard(results[i], group());
            }
        },
        function collate(err, collectionCounts) {
            var i;

            for(i=0; i < collectionCounts.length;i++) {
                collections[i].count = collectionCounts[i];
            }
            callback(err, collections);
        }
    );
};

