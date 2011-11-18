/*global node:true */
/*jshint globalstrict:true,  sub:true */

"use strict";

var log = require('nlogger').logger(module),
    util = require('util'),
    fs = require('fs'),
    path = require('path'),
    http = require('http-get'),
    express = require('express'),
    app = express.createServer(),
    api = require('./api'),
    misc = require('./misc'),
    model = require('./model'),

    PORT,
    BLANK_COVER_PREFIX; 

app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
    app.use(express.bodyParser());
    app.use(express.static('static'));
    PORT = 3000;
    BLANK_COVER_PREFIX = '../../icons/blank-cover-';
});

app.configure('production', function() {
    app.use(express.errorHandler());
    app.use(express.logger());
    app.use(express.bodyParser());
    app.use(express.static('/var/www/mydvds.com.au/html'));
    PORT = 8080;
    BLANK_COVER_PREFIX = '/var/www/mydvds.com.au/icons/blank-cover-';
});

log.info("serving static from:"+ 'static');


app.get('/', function(req, res, next){
    res.redirect('/home.html');
});

app.get('/api', function(req, res, next){
    //FIXME authenticate user

    next();
});

app.get('/images/:size/:barcode.jpg', function(req, res, next){
    var sizeUrls = {
            'small' : '-crop-120x120.jpg',
            'large' : '-crop-325x325.jpg'
        },
        cachedImg,
        cdnServerNumber = misc.getRandomInt(1,4),
        imagePath = ['static/covers',req.params.size,req.params.barcode].join('/')+'.jpg',
        blankCoverPath = BLANK_COVER_PREFIX+req.params.size+'.jpg',
        options = {url: 'http://cdn'+cdnServerNumber+'.fishpond.co.nz/'+req.params.barcode+sizeUrls[req.params.size]};

    if (path.existsSync(imagePath)) {
        log.info("found cached image:"+req.params.barcode+"["+req.params.size+"]");
        next(); //let static middleware serve the image
    } else {
        log.info("no cached image, fetching..."+options.url);
        http.get(options, imagePath, function (error, result) {
            if (error) {
                log.error("Error downloading images:"+error);
                try {
                    fs.symlinkSync(blankCoverPath, imagePath);
                } catch(err) {
                    log.error("error linking "+blankCoverPath+" to filepath "+imagePath+" :"+err);
                }
            } else {
                log.info('File downloaded at: ' + result.file);
            }
            res.sendfile(imagePath);
        });
    }
});


app.get('/api/user/:id/:operation?/:start?/:end?', function(req, res){
    var dvds,
        dvdList,
        start = req.params.start,
        end = req.params.end;

        log.debug('s'+start+'e'+end);
        model.User.find('id', req.params.id, function(err, user) {
            if (err) {
                log.error('user lookup error:'+err);
                throw new Error("could not find user for userid:"+req.params.id, res);
            }
            if (req.params.operation) {
                log.debug("doing op:"+req.params.operation);
                api[req.params.operation](user, res, start, end);

            }
        });
    //~ else {
        //~ client.hgetall('user:'+req.params.id, function (err, data) {
            //~ if (err) {
                //~ res.send('Sorry Error Occurred');
                //~ log.error('Error: ' + err);
            //~ } else {
                //~ user = data;
                //~ res.send('user ' + data.email);
            //~ }
        //~ });
    //~ }
});

app.listen(PORT);


log.info("mydvds listening on port:"+PORT);
