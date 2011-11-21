var vows = require('vows'),
    assert = require('assert')
    model = require('../code/model');

vows.describe('Data Model').addBatch({
    'Find User 1 ': {
        topic: function() {
                   model.User.find('id', 1, this.callback);
               },
        'results in User with ID 1': function(err, result) {
            assert.instanceOf(result, model.User);
            assert.equal(result.id, 1);
        }
    }
}).export(module);//export test suite
            



