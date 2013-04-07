
/*jshint node:true, globalstrict:true,  sub:true */

'use strict';

var vows = require('vows'),
    assert = require('assert'),
    misc = require('../lib/misc');


exports.suite1 = vows.describe('misc utils');

exports.suite1.addBatch({
    'copy properties': {
        topic: function() {
                   var a = { email: 'test@foo.com',
                   firstname: 'Foo',
                   lastname: 'Bar'},
                    b = {};

                    misc.copyProps(['email', 'firstname'], a,b);
                    return b;
            },
        'results in object with copied properties' : function(topic) {
            assert.isNotNull(topic);
            assert.equal(topic.email, 'test@foo.com');
        },
        'and the object does not have the unlisted properties' : function(topic) {
            assert.isNotNull(topic);
            assert.isUndefined(topic.lastname); 
        }
    }
});
