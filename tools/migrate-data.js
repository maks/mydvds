/*global node:true */
/*jshint globalstrict:true,  sub:true */

/*  simple script to migrate dat from old version of Mydvds
 *  expects data files to be csv format and in subfolder named 'data'
 */

"use strict";

var csv = require('csv'),
    redis = require('redis'),
    client = redis.createClient(),
    type = process.argv[2], //first arg on cli
    loaders = {},
    maxID = 0;


function prepID(data) {
    var id = parseInt(data['id'], 10),
        i;
    delete data['ID'];

    if (isNaN(id)) {
        throw new Error("Invalid "+type+"ID"+data['id']);
    }

    if (id > maxID) {
        maxID = id;
    }
    return id;
}

loaders.users = function (data) {
    var id = prepID(data),
        i;

    console.log("loading user:"+data['email']);
    client.hmset("user:"+id, data);
    client.sadd("users_all", id);
};

loaders.dvds = function(data) {
    var id = prepID(data),
        i;

    delete data['type'];
    delete data['ref_id'];
    delete data['verified'];

    console.log("loading dvd:"+data['title']);
    client.hmset("dvd:"+id, data);
    client.sadd("dvds_all", id);
};

csv()
.fromPath('data/'+type+'.csv', { "columns" : true} )
.on('data',function(data, index){
    //console.log('#'+index+' '+JSON.stringify(data));
    loaders[type](data);
})
.on('end',function(count){
    console.log('Processed: '+count+' '+type);
    client.set(type+"_maxid", maxID);
    client.quit();
    process.exit(0);
})
.on('error',function(error){
    console.log(error.message);
});

