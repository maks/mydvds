/*global node:true */
/*jshint globalstrict:true,  sub:true */

"use strict";

var log = require('nlogger').logger(module),
    util = require('util');
    
exports.collections = function(user, res) {
    user.getCollectionCounts(function (err, collections) {
        if (err) {
            log.error(err);
            throw err;
        }
        log.info("colls:"+collections);
        res.send(JSON.stringify(collections));
    });
};
        

exports.dvds = function(user, res, start, end) {
    if (!user || !(user.getDvdTitlesBarcodes instanceof Function)) {
        log.error("invalid user: %j", JSON.stringify(user));
        res.send("[]");
    } else {
        log.debug("calling getDvdTitle...");
        user.getDvdTitlesBarcodes('mydvds', start, end, function(err, dvds) {
            log.debug("got dvds callback");
            if (err) {
                log.error(err);
            } else {
                res.send(JSON.stringify(dvds));
            }
        });
    }
};
