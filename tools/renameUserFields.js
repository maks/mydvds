var r = require('redis');
var c = r.createClient();

c.keys('user:*', function(e,d) { 
    if (e) { 
        console.error(e) ;
    } 
    else { 
        d.forEach(function(x) { 
            console.log('x'+x);
            c.hgetall(x, function(e,all) {
                if (e) { 
                    throw e;
                } else {
                    console.log(x+':'+JSON.stringify(all.join_date)) ;
                    console.log(x+':'+JSON.stringify(all.last_login)) ;
                    console.log(x+':'+JSON.stringify(all.referred_by)) ;
                    c.multi()
                        .hset(x, 'joinDate', all.join_date)
                        .hset(x, 'lastLogin', all.last_login)
                        .hset(x, 'referredBy', all.referred_by)
                        .hdel(x, 'join_date')
                        .hdel(x, 'last_login')
                        .hdel(x, 'referred_by')
                    .exec(function(err) {
                        console.log('done:'+err);
                    });
                    
                }
            });
        }); 
    }
});
