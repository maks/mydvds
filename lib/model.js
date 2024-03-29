/*jshint node:true, globalstrict:true,  sub:true */

"use strict";

var log = require('nlogger').logger(module),
    step = require('step'),
    util = require('util'),
    assert = require('assert'),
    redis = require('redis').createClient(),
    misc = require('./misc'),
    User,
    Collection;


function getUser(id, callback) {
        redis.hgetall('user:'+id, function(err, data) {
            var u;
            if (err) {
                log.error("error fetching user data for ID:"+id);
            }
            //log.debug("got user"+util.inspect(data));
            u = new User(data, id);
            callback(err, u);
        });
}

/**
 * @param {Object} userdata
 * @param {Function} callback
 */
User = exports.User = function(userdata, id) {
    var d = userdata || {};

    this.id = id || null;
    this.joinDate = d.joinDate || new Date();
    this.lastLogin = d.lastLogin || new Date();

    misc.copyProps(['email', 'password', 'firstname', 'lastname', 'referredBy'], d, this);
};

/**
 * Lookup user in database mathcing the given criteria
 *
 * @param {String} fieldname 
 * @param {String} value
 */
User.find = function(fieldname, value, callback) {
    if (fieldname === 'id') { 
        getUser(value, callback);
    } else if (fieldname === 'email') {
        redis.get('user:email:'+value, function(err, data) {
            if (err || !data) {
                log.error('no key for user:email:'+value);
                callback(err, null);
            } else {
                getUser(data, callback);
            }
        });
    }
};


    

/**
 * @param {Function} callback
 */
User.prototype.save = function(callback) {
    var self = this;

    function savedata() {
        assert.ok((self.id !== undefined) && (self.id !== null), "User ID must be defined and not null before saving to Redis");
        assert.ok(typeof self.id == 'number', "User ID must be a numeric value before saving to Redis");
        redis.multi()
            .zadd(['user',self.id,'collections'].join(':'), 1, 'mydvds', 2, 'loaned' , 3 ,'borrowed' ,4 ,'wishlist' ,5 ,'towatch')
            .hmset(['user',self.id].join(':'), 
                   'email', self.email,
                   'firstname', self.firstname,
                   'lastname', self.lastname,
                   'joinDate', self.joinDate.getTime(),
                   'lastLogin', self.lastLogin.getTime()
                  )
            .sadd('users_all', self.id)
            .sadd('users_pending', self.id)
            .set('user:email:'+self.email, self.id)
        .exec(function(err) {
            callback(err, self);
        });
    }
    
    if (self.id) {//do we already have an ID allocated to us?
        savedata();
    } else {
        log.debug("getting next user id...");
        redis.incr('users_maxid', function(err, data) {
            if (err) {
                throw err;
            }
            self.id = parseInt(data, 10);
            savedata();
        });
    }
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
User.prototype.getDvdTitlesBarcodes = function(collection, start, end, callback) {
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
User.prototype.addDvdToCollection = function(collection, dvdID, callback) {
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
User.prototype.getCollectionCounts = function(callback) {
    var collections = [],
        self = this;
    step(
        function getCollectionKeys() {
            redis.zrange(['user',self.id,'collections'].join(':'), 0, -1, this);
        },
        function getCollectionCounts(err, results) {
            if (err) {
               throw err;
            } 
            
            var group = this.group(),
                i;

            for( i=0; i < results.length;i++) {
                collections[i] = { 'name' : results[i] };
                redis.zcard(['collection',self.id,results[i]].join(':'), group());
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

