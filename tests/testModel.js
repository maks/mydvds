var util = require('util'),
    m = require('./code/model.js');


m.getUserCollectionCounts(1, function(data) { 
        console.log('got:'+util.inspect(data)); 
        process.exit(0);
    });
