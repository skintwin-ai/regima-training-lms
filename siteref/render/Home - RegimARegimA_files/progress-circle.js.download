(function($) {
	$(document).ready(function() {
		"use strict";
		/* global lolfmk_progress_vars, jQuery */
		/*jslint bitwise: true */
		var color = lolfmk_progress_vars.barColor;
		$('.chart').appear(function() {
			var currentChart = $(this);
			currentChart.easyPieChart({
				animate: 1000,
				barColor: color,
				trackColor: '#dfdfdf',
				lineWidth: 10,
				lineCap: 'square',
				size: '120',
				scaleColor: false,
				easing: 'easeOutBounce',
				onStep: function(value) {
					this.$el.find('span').text(~~value+'%');
				},
				onStop: function() {
					this.$el.find('span').text(currentChart.data('percent')+'%');
				}
			});
		});
	});
})(jQuery);