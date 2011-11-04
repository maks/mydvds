/*global node:true */
/*jshint globalstrict:true,  sub:true */

"use strict";

var log = require('nlogger').logger(module),
    Step = require('step'),
    redis = require('redis'),
    client = redis.createClient();


/**
 *
 */
exports.getDvdTitlesBarcodes = function(userId, collection, start, end, callback) {

    client.sort(['collection',userId, collection].join(':'),
        'LIMIT', start, end,
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

exports.addDvdToCollection = function(userId, collection, dvdID, callback) {
    client.zadd(['collection',userId,collection].join(':'), dvdID, function(err, data) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, data);
        }
    });
};

exports.getUserCollectionCounts = function(userId, callback) {
    var collections = [];
    Step(
        function getCollectionKeys() {
            client.keys('collection:'+userId+':*', this);
        },
        function getCollectionCounts(err, results) {
            if (err) {
               throw err;
            } 
            
            var group = this.group(),
                i;

            console.log('res:'+JSON.stringify(results));
            for( i=0; i < results.length;i++) {
                collections[i] = { 'name' : results[i] };
                client.zcard(results[i], group());
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
