/*  simple script to migrate dat from old version of Mydvds
 *  expects data files to be csv format and in subfolder named 'data'
 */

var csv = require('csv'),
    type = process.argv[2], //first arg on cli
    loaders = {};


loaders.users = function (data) {
    console.log("loading user:"+data['EMAIL']);
}

console.log(this.loadusers);

csv()
.fromPath('data/'+type+'.csv', { "columns" : true} )
.on('data',function(data, index){
    //console.log('#'+index+' '+JSON.stringify(data));
    loaders[type](data);
})
.on('end',function(count){
    console.log('Number of lines: '+count);
})
.on('error',function(error){
    console.log(error.message);
});

