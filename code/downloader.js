/*global node:true */
/*jshint globalstrict:true*/

"use strict";

var log = require('nlogger').logger(module),
    util = require('util'),
    fs = require('fs'),
    request = require('request');

exports.image = function(imageUrl, imageFilename, callback) {
    log.info("requesting..."+imageUrl);

    request({
        'uri': imageUrl,
        'encoding' : 'binary',
        },
        function (error, response, body) {

        if (!error && response.statusCode === 200) {
            console.info("downloaded"+imageUrl);
            console.info("data is a buffer:"+(body instanceof Buffer));
            //~ fs.writeFile(imageFilename, body, function (err) {
                //~ if (!err) {
                    //~ console.log('saved'+imageFilename);
                //~ }
                //~ if (callback) {
                    //~ callback(err);
                //~ }
            //~ });
        }
    });
};