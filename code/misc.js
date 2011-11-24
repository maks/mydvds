/*global node:true */
/*jshint globalstrict:true */

"use strict";

exports.copyProps = function(propList, src, dest) {
    var i;

    if (!propList || !(propList instanceof Array)) {
        throw new Error('Invalid list of property names');
    }
    for(i=0; i < propList.length; i++) {
        dest[propList[i]] = src[propList[i]];
    }
};

exports.getRandomInt = function(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
