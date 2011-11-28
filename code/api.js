/*jshint node:true, globalstrict:true,  sub:true */

"use strict";

var log = require('nlogger').logger(module),
    User = require('./model').User,
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

exports.login = function(email, password, res) {

    log.debug('lookup:'+email);
    User.find('email', email, function(err, user) {
        if (err || !user) {
            log.error('could not lookup user:'+email+" "+err);
            res.send('Invalid Login', 404);
        } else {
            if (password === user.password) {
                log.debug("got login user:"+util.inspect(user));
                res.send(JSON.stringify(user));
            } else {
                log.debug("Invalid password for:"+util.inspect(user));
            }

        }
    });

};
