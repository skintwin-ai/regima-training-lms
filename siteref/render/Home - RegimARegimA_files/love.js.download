jQuery(document).ready(function($){
	"use strict";
	/* global lolfmk_love_it_vars, jQuery */
	/*jslint eqeq: true*/
	var theme = lolfmk_love_it_vars.theme_name;
	$('.lol-love-wrap').on('click', '.lol-love', function() {
		var link = $(this);	
		var post_id = $(this).data('post-id');
		if ($.cookie(theme+'_loved_'+post_id) == post_id) {
			return false;
		}
		$.cookie(theme+'_loved_'+post_id, post_id, {expires: 365, path: '/'});
		var post_data = {
			action: 'lolfmk_love_it',
			item_id: post_id,
			love_it_nonce: lolfmk_love_it_vars.nonce
		};
		$.post(lolfmk_love_it_vars.ajaxurl, post_data, function(response) {
			if(response === 'loved') {
				link.addClass('loved');
				var count_wrap = link.children('span');
				var count = count_wrap.text();
				count_wrap.text(parseInt(count, 10) + 1);		
			}
		});
		return false;
	});	
});