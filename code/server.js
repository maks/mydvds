/*jshint node:true, es5:true, globalstrict:true,  sub:true */


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
    model = require('./model');


    app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
    app.use(express.bodyParser());
    app.use(express.static('static'));

log.info("serving static from:"+ 'static');


app.get('/', function(req, res, next){
    res.redirect('/index.html');

});

app.get('/api', function(req, res, next){
    //FIXME authenticate user

    next();
});

app.post('/register', function(req,res,next) {

    log.info('register:'+util.inspect(req.body));
    
    api.register(req.body, res);
});

app.post('/login', function(req,res,next) {
    var email = req.body.email,
        password = req.body.password;

    log.info('login:'+email+'|'+password);
    
    api.login(email, password, res);
});

app.get('/covers/:size/:barcode.jpg', function(req, res, next){
    var sizeUrls = {
            'small' : '-crop-120x120.jpg',
            'large' : '-crop-325x325.jpg'
        },
        cachedImg,
        cdnServerNumber = misc.getRandomInt(1,4),
        imagePath = ['static/covers',req.params.size,req.params.barcode].join('/')+'.jpg',
        blankCoverPath = process.env.BLANK_COVER_PREFIX+req.params.size+'.jpg',
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

app.listen(process.env.PORT);


log.info("mydvds listening on port:"+process.env.PORT);
