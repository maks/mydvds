var r = require('redis');
var c = r.createClient();

c.keys('user:*', function(e,d) { 
    if (e) { 
        console.error(e) ;
    } 
    else { 
        d.forEach(function(x) { 
            console.log(x);
            c.hdel(x, 'status', function(e,d) {
                if (e) { 
                    throw e;
                } else {
                    console.log(d) ;
                }
            });
        }); 
    }
    process.exit(0);
});
