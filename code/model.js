/*global node:true */
/*jshint globalstrict:true,  sub:true */

"use strict";

var log = require('nlogger').logger(module),
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
}

exports.addDvdToCollection = function(userId, collection, dvdID, callback) {
    client.zadd(['collection',userId,collection].join(':'), dvdID, function(err, data) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, data);
        }
    });
};
