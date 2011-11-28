/*global $:true, jQuery:true */

var items = [],
    user;


function loadMydvdsData() {
    if (!user) {
        console.error('Not logged in!');
        return;
    }
    $.getJSON('/api/user/'+user.id+'/dvds/50/70', function(data) {
        //console.log("data:"+ data);)
        if ($('ul.list').children() > 0) {
            return;
        }
        $.each(data, function(key, val) {
            items.push('<li id="' + key + '"> <img src="/covers/small/'+
                val.barcode+'.jpg">'+
                val.title +
            '</li>');
          });
    });
}

function loadCollectionsData(callback) {
    if (!user) {
        console.error('Not logged in!');
        return;
    }
    console.log('id:'+user.id);
    $.getJSON('/api/user/'+user.id+'/collections', function(data) {
            console.log("coll:"+JSON.stringify(data));
            if ($('ul#collections').children() > 0) {
                return;
            }
            $.each(data, function(key, val) {
                $('ul#collections').append('<li><a href="#mydvds">'+
                                           val.name+'<span class="ui-li-count">'+
                                           val.count+'</span></a></li>');
           });

           callback();
    });
}

function myDvdsInit() {
    console.log("init...");

    $("#mydvds").bind("pageshow", function() {
         console.log("pageshow...");

         $('<ul/>', {
            'class': 'list',
            html: items.join('')
          }).appendTo('div#dvdlist_content');

         $('ul.list').listview();
    });

    $("#login").bind("submit", function() {
        console.debug("doing login:"+$("#email").val());
        $.post('/login', $('form#login').serialize(), 
            function(data) {
                console.debug('Logged In!');
            })
            .success(function(data) {
                console.debug("login ok", data);
                user = JSON.parse(data);

                loadCollectionsData( function() {
                    $.mobile.changePage('#main');
                    
                    loadMydvdsData();
                });
            })
            .error(function(jqxhr, err, exp) { 
                console.debug('Error in login',err);
            });
        return false;
    });

}

$(myDvdsInit);
