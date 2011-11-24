/*jshint node:true, globalstrict:true,  sub:true */

'use strict';

var vows = require('vows'),
    assert = require('assert'),
    model = require('../code/model'),
    userOne;

vows.describe('Data Model').addBatch({
    'Find User 1 ': {
        topic: function() {
                   model.User.find('id', 1, this.callback);
               },
        'results in User': function(err, result) {
            userOne = result;
            assert.instanceOf(result, model.User);
        },
        'results has an ID of 1': function(err, result) {
            assert.equal(result.id, 1);
        },
        'And get Collection Counts': {
            topic: function() {
                       userOne.getCollectionCounts(this.callback);
                   },
            'collection counts is an Array': function(err, result) {
                assert.instanceOf(result, Array);
            },
            'collection counts for user 1 is 1 long': function(err, result) {
                assert.equal(result.length, 5);
            },
            'mydvds collection is the first item': function(err, result) {
                assert.equal(result[0].name, 'mydvds');
            },
            'collection counts for mydvds is 249': function(err, result) {
                var i,
                    found = false;
                for(var i = 0; i < result.length; i++) {
                    console.log(result[i].name);
                    if (result[i].name === 'mydvds') {
                        assert.equal(result[i].count ,249);
                        found = true;
                    }
                }
                assert.isTrue(found);
            }
        }
    }
}).export(module);//export test suite
            



