/*jshint node:true, globalstrict:true,  sub:true */

'use strict';

var vows = require('vows'),
    assert = require('assert'),
    model = require('../code/model'),
    userOne;


exports.suite1 = vows.describe('User data');

exports.suite1.addBatch({
    'New user': {
        topic: new model.User( {
                   email: 'test@foo.com',
                   firstname: 'Foo',
                   lastname: 'Bar',
                   joinDate: new Date()
            }),
        'results in a new user' : function(topic) {
            assert.isNotNull(topic);
            assert.notEqual(topic, undefined);
            assert.instanceOf(topic, model.User);
        },
        'new user has correct properties' : function(topic) {
            assert.equal(topic.email, 'test@foo.com');
            assert.equal(topic.firstname, 'Foo');
        },
        'should respond to save' : function(topic) {
            assert.isFunction(topic.save);
        },
        'Save new user' : {
            topic: function(user) {
                   user.save(this.callback);
            },
            'results in User with an id assigned': function(err, user) {
                assert.isNotNull(user.id);
                assert.isNumber(user.id);
            }
        }
    }
})
.addBatch({
    'Find User 1 ': {
        topic: function() {
                   model.User.find('id', 1, this.callback);
               },
        'results in User': function(err, result) {
            userOne = result;
            assert.instanceOf(result, model.User);
        },
        'User has an ID of 1': function(err, result) {
            assert.equal(result.id, 1);
        },
        'And fetching Users Collections': {
            topic: function() {
                       userOne.getCollectionCounts(this.callback);
                   },
            'results  in an Array': function(err, result) {
                assert.instanceOf(result, Array);
            },
            'which has 5 collections in it': function(err, result) {
                assert.lengthOf(result, 5);
            },
            'mydvds collection is the first collection': function(err, result) {
                assert.include(result[0], 'name', 'count');
                assert.isString(result[0].name);
                assert.equal(result[0].name, 'mydvds');
            },
            'and mydvds contains 249 items': function(err, result) {
                var i,
                    found = false;
                for(i = 0; i < result.length; i++) {
                    if (result[i].name === 'mydvds') {
                        assert.equal(result[i].count ,249);
                        found = true;
                    }
                }
                assert.isTrue(found);
            }
        }
    }
});
            


