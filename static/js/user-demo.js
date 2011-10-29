var items = [];


function loadMydvdsData() {
    $.getJSON('/api/user/1/dvds', function(data) {
        //console.log("data:"+ data);
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

function init() {
    console.log("init...");

    $("#mydvds").bind("pageshow", function() {
         console.log("pageshow...");

         $('<ul/>', {
            'class': 'list',
            html: items.join('')
          }).appendTo('div#dvdlist_content');

         $('ul.list').listview();
    });
    loadMydvdsData();
}

$(init);


