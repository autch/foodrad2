
var load_ok = [];

function check_done_loading(sym) {
    load_ok.push(sym);

    if(load_ok.length >= 2) {
	jQuery.mobile.hidePageLoadingMsg();
	jQuery('#submit').removeProp("disabled");
    }
}

function get_area() {
    jQuery.getJSON('prefectures.js', function(results){ 
	var sel = jQuery('#select-home_pref');
	sel.empty();
	sel.append(jQuery("<option>").text("すべて").val(""));
	for(var i = 0; i < results.length; i++) {
	    var item = results[i];

	    var opt = jQuery("<option>");
	    var caption = item['area'];
	    if(caption == null) caption = "（不明）"
	    opt.text(caption + " (" + item['count'] + ")").val(item['area']);
	    sel.append(opt);
	}
	sel.trigger("create");
	check_done_loading("home_pref");
    });
}

function get_categories() {
    jQuery.getJSON('categories.js', function(result) {
	var sel = jQuery('#select-category');
	sel.empty();
	sel.append(jQuery("<option>").text("すべて").val(""));
	for(var key in result) {
	    var item = result[key];
	    var opt = jQuery("<option>");
	    var caption = key + " (" + item['count'] + ")";

            opt.data("items", item['items']);		
	    opt.text(caption).val(key);
	    sel.append(opt);
	}
	sel.trigger("create");
	check_done_loading("category");
    });
}

function onchange_category() {
    var opt_sel = jQuery("#select-category option:selected");
    var sel = jQuery('#select-item_name');
    var cat = opt_sel.data("items");

    jQuery('#category').val(opt_sel.val());
    sel.empty();
    sel.append(jQuery("<option>").text("すべて").val(""));

    if(!cat) return;
    for(var i = 0; i < cat.length; i++) {
	var opt = jQuery("<option>");
	
	opt.text(cat[i]).val(cat[i]);
	sel.append(opt);
    }
    sel.trigger("create");
}

function on_submit() {
    var ul = jQuery("#result");
    ul.empty();

    jQuery.mobile.showPageLoadingMsg();

    jQuery.getJSON('search.php?callback=?', {
	"area": jQuery('#home_pref').val(),
	"category": jQuery('#category').val(),
	"name": jQuery('#item_name').val(),
	"Cs": jQuery('#cs_total').val(),
	"I131": jQuery('#I131').val()
    }, function(result) {
	var ul = jQuery("#result");
	ul.empty();

	if(result == null || result.length == 0) {
            jQuery("#resultPage h1").text("ヒットなし");
	    jQuery("<li>").text("見つかりませんでした").appendTo(ul);
	    jQuery.mobile.changePage(jQuery('#resultPage'));
	    jQuery('ul.dynamic-list').listview('refresh');
	    jQuery.mobile.hidePageLoadingMsg();
	    return;
	}

	for(var i = 0; i < result.length; i++) {
	    var item = result[i];
	    var template = "<li><a><div class=\"result-container\"><h3><small/></h3></div></a></li>";
	    var tmpl_item = jQuery(template);
	    var container = jQuery("div", tmpl_item);
	    var anchor = jQuery("a", tmpl_item);
	    jQuery("small", tmpl_item).text(item[8] + " " + item[10]).before(item[9] + " ");

	    jQuery("<p>", { text: item[4] + " " + item[5] + "産" }).appendTo(container);
	    jQuery("<p>", { text: item[13] + "採取、" + item[14]+ "判明" }).appendTo(container);

	    var color_val = null;
	    if(item.length == 19) {
		var cs;
		cs = "Cs134+137: " + item[18] + " " +
		    "(Cs134: " + item[16] + ", Cs137: " + item[17] + ") [Bq/kg]";
		jQuery("<p>", { text: cs }).appendTo(container);
		color_val = item[18];
	    } else if(item.length == 18) {
		jQuery("<p>", { text: "Cs134+137: " + item[17] + " Bq/kg"}).appendTo(container);
		color_val = item[17];
	    }
	    if(color_val != null) {
		if(color_val >= 500) {
                    container.addClass("lv3");
		} else if(color_val >= 100) {
                    container.addClass("lv2");
		}
	    }

	    anchor.data("item", item);
	    anchor.attr("href", "#detailPage")

	    tmpl_item.appendTo(ul);
	}
	jQuery(ul).delegate("a", "click", function(event) {
	    showDetail(event);	    
	    jQuery('#detailPage').trigger("create");
	});
	jQuery("#resultPage h1").text(result.length +  "件ヒット");
	jQuery.mobile.changePage(jQuery('#resultPage'));
	jQuery('ul.dynamic-list').listview('refresh');
	jQuery.mobile.hidePageLoadingMsg();
    });
    return false;
}

function showDetail(event) {
    var data = jQuery(event.currentTarget).data("item");
    for(var key in data) {
	var td = jQuery("#detail-" + key);
	if(td && td.length > 0) {
	    td.text(data[key]);
	}
    }
}

function get_timestamp() {
    jQuery.get('timestamp.txt', function(data){ 
	var span = jQuery('#timestamp');
	var d = new Date(data);
	var text = d.getFullYear() + "年" + (d.getMonth() + 1) + "月" + d.getDate() + "日 " +
                   d.getHours() + "時" + d.getMinutes() + "分";
	span.text(text);
    });
}
