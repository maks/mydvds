/*global node:true */
/*jshint globalstrict:true,  sub:true */

"use strict";

var log = require('nlogger').logger(module),
    util = require('util'),
    model = require('./model');
    
exports.collections = function(userId, res) {
    model.getUserCollectionCounts(userId, function (err, collections) {
        if (err) {
            log.error(err);
            throw err;
        }
        log.info("colls:"+collections);
        res.send(JSON.stringify(collections));
    });
};
        

exports.dvds = function(userId, res, start, end) {
    model.getUserDvdTitlesBarcodes(userId, 'mydvds', start, end, function(err, dvds) {
        if (err) {
            log.error(err);
        } else {
            res.send(JSON.stringify(dvds));
        }
    });
}
