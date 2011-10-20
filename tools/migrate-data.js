var csv = require('csv');


csv()
.fromPath('data/users.csv', { "columns" : true} )
.on('data',function(data,index){
    //console.log('#'+index+' '+JSON.stringify(data));
    console.log("email:"+data["EMAIL"]);
})
.on('end',function(count){
    console.log('Number of lines: '+count);
})
.on('error',function(error){
    console.log(error.message);
});

function loadUser(data) {

}