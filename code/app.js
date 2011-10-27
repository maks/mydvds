/*global node:true */
/*jshint globalstrict:true,  sub:true */

"use strict";

var log = require('nlogger').logger(module),
    sys = require('sys'),
    express = require('express'),
    app = express.createServer(),
    model = require('./model'),

    PORT = 3000; //FIXME - put into env specific config

app.configure('development', function(){
    app.use(express.bodyParser());
    app.use(express.static('static'));
});

app.configure('production', function() {
    app.use(express.logger());
    app.use(express.bodyParser());
    app.use(express.static('/var/www/mydvds.com.au/html'));
});

log.info("serving static from:"+ 'static');

app.get('/', function(req, res, next){
    res.redirect('/home.html');
});

app.get('/api', function(req, res, next){
    //FIXME authenticate user

    next();
});

app.get('/api/user/:id/:operation?', function(req, res){
    var user,
        dvds,
        dvdList,
        start = 0,
        end = 10;

    if (req.params.operation) {
        model.getDvdList(req.params.id, start, end, function(err, dvds) {
            if (err) {
                log.error(err);
            } else {
                res.send("Dvds:" + sys.inspect(dvds));
            }
        });

    } else {
        //~ client.hgetall('user:'+req.params.id, function (err, data) {
            //~ if (err) {
                //~ res.send('Sorry Error Occurred');
                //~ log.error('Error: ' + err);
            //~ } else {
                //~ user = data;
                //~ res.send('user ' + data.email);
            //~ }
        //~ });
    }
});

app.listen(PORT);


log.info("mydvds listening on port:"+PORT);