(function() {
    function LoadQueue() {
	this.queue = [];
	this.onComplete = function() {};
    }

    LoadQueue.prototype.register = function(f) {
	this.queue.push(f);
    };

    LoadQueue.prototype.done = function(f) {
	this.queue = this.queue.filter(function(v, i, a) { return v !== f; });
	if(this.queue.length == 0) this.onComplete.call(this);
    };

    LoadQueue.prototype.start = function(callback) {
	var self = this;
	this.onComplete = callback;
	this.queue.forEach(function(v, i, a) { v(self); }.bind(this));
    };

    var get_area = function get_area(load_queue) {
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
	    load_queue.done(get_area);
	});
    };

    var get_categories = function get_categories(load_queue) {
	jQuery.getJSON('categories.js', function(result) {
	    var sel = jQuery('#select-category');
	    sel.empty();
	    sel.append(jQuery("<option>").text("すべて").val(""));
	    for(var key in result) {
		var item = result[key];
		var opt = jQuery("<option>");
		var caption = key + " (" + item['count'] + ")";

		opt.data("items", item['items']); // これのせいで Handlebars にできない
		opt.text(caption).val(key);
		sel.append(opt);
	    }
	    load_queue.done(get_categories);
	});
    };
    var get_timestamp = function get_timestamp(load_queue) {
	jQuery.get('timestamp.txt', function(data){ 
	    var span = jQuery('#timestamp');
	    var d = new Date(data);
	    var text = d.getFullYear() + "年" + (d.getMonth() + 1) + "月" + d.getDate() + "日 " +
                d.getHours() + "時" + d.getMinutes() + "分";
	    span.text(text);
	    load_queue.done(get_timestamp);
	});
    };

    $(document).on("click", "#searchForm button", function() {
	var ul = jQuery("#result");
	ul.empty();

	jQuery.mobile.loading("show");

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
		jQuery(ul).listview("refresh");
		jQuery.mobile.loading("hide");
		return;
	    }

	    var tmpl_result = jQuery('#tmpl-item').data("template");
	    ul.html(tmpl_result({ result: result }));
	    jQuery("#resultPage h1").text(result.length +  "件ヒット");
	    jQuery.mobile.changePage(jQuery('#resultPage'));
	    jQuery(ul).listview("refresh");
	    jQuery.mobile.loading("hide");
	});
	return false;
    });

    jQuery(document).on("click", "#resultPage ul li a", function(e) {
	var data = jQuery(this).data("item");
	for(var key in data) {
	    var td = jQuery("#detail-" + key);
	    if(td && td.length > 0) {
		td.text(data[key]);
	    }
	}
    });

    jQuery(function() {
	var lq = new LoadQueue();

	jQuery.mobile.loading("show");
	jQuery('#submit').attr('disabled', "disabled");
	lq.register(get_timestamp);
	lq.register(get_area);
	lq.register(get_categories);
	lq.start(function() {
	    jQuery.mobile.loading("hide");
	    jQuery('#submit').removeProp("disabled");
	});

	jQuery('#select-category').on("change", function(e) {
	    var sel = jQuery('#select-item_name');
	    var cat = $(this).find("option:selected").data("items");
	    
	    jQuery('#category').val($(this).val());
	    sel.empty();
	    jQuery("<option>").text("すべて").val("").appendTo(sel);   
	    if(!cat) return;
	    for(var i = 0; i < cat.length; i++) {
		jQuery("<option>").text(cat[i]).val(cat[i]).appendTo(sel);
	    }
	});

	jQuery("#select-home_pref").on("change", function(e) {
	    $('#home_pref').val($(this).val());
	});
				    
	jQuery("#select-item_name").on("change", function(e) {
	    $('#item_name').val($(this).val());
	});

	jQuery('#tmpl-item').data("template", Handlebars.compile(jQuery('#tmpl-item').html()));
	
	jQuery(document).on('pageinit', '#mainPage', function() {
	});
    });

})();

