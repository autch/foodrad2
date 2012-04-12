
// { カテゴリ: [品名, 品名, ...] }
var categories = {
};
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
	categories = result;
	var sel = jQuery('#select-category');
	sel.empty();
	sel.append(jQuery("<option>").text("すべて").val(""));
	for(var key in categories) {
	    var item = categories[key];
	    var opt = jQuery("<option>");
	    var caption = key + " (" + item['count'] + ")";
		
	    opt.text(caption).val(key);
	    sel.append(opt);
	}
	sel.trigger("create");
	check_done_loading("category");
    });
}

function onchange_category(cat_name) {
    jQuery('#category').val(cat_name);

    var sel = jQuery('#select-item_name');
    var cat = categories[cat_name]['items'];

    sel.empty();
    sel.append(jQuery("<option>").text("すべて").val(""));
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
	"Cs": jQuery('#cs_total').val()
    }, function(result) {
	var ul = jQuery("#result");
	ul.empty();

	if(result == null || result.length == 0) {
	    jQuery("<li>").text("見つかりませんでした").appendTo(ul);
	    jQuery.mobile.changePage(jQuery('#resultPage'));
	    jQuery('ul.dynamic-list').listview('refresh');
	    jQuery.mobile.hidePageLoadingMsg();
	    return;
	}

	for(var i in result) {
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
		var color;
		if(color_val >= 500) {
		    color = "#fc0";
		} else if(color_val >= 100) {
		    color = "#ffc";
		} else {
		    color = null;
		}
		if(color)
		    jQuery("div", tmpl_item).css("border-left", "8px solid " + color);
	    }

	    jQuery.data(anchor, "item", item);	    
	    anchor.attr("href", "#detailPage")
	    anchor.click(item, function(event) {
		showDetail(event);
	    });

	    tmpl_item.appendTo(ul);
	}
	jQuery.mobile.changePage(jQuery('#resultPage'));
	jQuery('ul.dynamic-list').listview('refresh');
	jQuery.mobile.hidePageLoadingMsg();
    });
    return false;
}

function showDetail(event) {
    var data = event.data;
    for(var key in data) {
	var td = jQuery("#detail-" + key);
	if(td && td.length > 0) {
	    td.text(data[key]);
	}
    }
}
