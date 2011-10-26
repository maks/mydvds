/*global node:true */
/*jshint globalstrict:true,  sub:true */

"use strict";

var log = require('nlogger').logger(module),
    app = require('express').createServer(),
    redis = require('redis'),
    client = redis.createClient(),

    PORT = 3000; //FIXME - put into env specific config

app.get('/', function(req, res){
  res.send('hello world');
});

app.get('/user/:id/:operation?', function(req, res){
    var user, dvds;

    if (req.params.operation) {
        client.zrange(['collection',req.params.id,'mydvds'].join(':'), 0, -1, function(err, data) {
            if (err) {
                res.send('Sorry Error Occurred');
                log.error('Error: ' + err);
            } else {
                user = data;
                res.send('dvds: ' + data);
            }
        });

    } else {
        client.hgetall('user:'+req.params.id, function (err, data) {
            if (err) {
                res.send('Sorry Error Occurred');
                log.error('Error: ' + err);
            } else {
                user = data;
                res.send('user ' + data.email);
            }
        });
    }
});

app.listen(PORT);


log.info("mydvds listening on port:"+PORT);