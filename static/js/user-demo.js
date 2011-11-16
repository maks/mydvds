/*global $:true, jQuery:true */

var items = [];


function loadMydvdsData() {
    $.getJSON('/api/user/1/dvds/50/70', function(data) {
        //console.log("data:"+ data);)
        if ($('ul.list').children() > 0) {
            return;
        }
        $.each(data, function(key, val) {
            items.push('<li id="' + key + '"> <img src="/images/small/'+
                val.barcode+'.jpg">'+
                val.title +
            '</li>');
          });
    });
}

function loadCollectionsData() {
    $.getJSON('/api/user/1/collections', function(data) {
            console.log("coll:"+JSON.stringify(data));
            if ($('ul#collections').children() > 0) {
                return;
            }
            $.each(data, function(key, val) {
                $('ul#collections').append('<li><a href="#mydvds">'+
                                           val.name+'<span class="ui-li-count">'+
                                           val.count+'</span></a></li>');
           });
           $('ul#collections').listview('refresh');

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
    loadCollectionsData();
    loadMydvdsData();
}

$(myDvdsInit);
