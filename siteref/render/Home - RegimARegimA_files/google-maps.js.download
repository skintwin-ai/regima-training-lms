(function($) {

"use strict";

/* global google, jQuery */
/*jshint unused: false */

$('.map-canvas-wrapper').each(function() {
	var el = $(this),
		lat = el.data('lat'),
		lng = el.data('lng'),
		z = el.data('zoom'),
		m = el.data('marker'),
		mapCanvas = el.children().get(0);
	var coordinates = new google.maps.LatLng(lat, lng);
	var mapOptions = {
		zoom: z,
		center: coordinates,
		scrollwheel: false,
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		mapTypeControl: false
	};
	var map = new google.maps.Map(mapCanvas, mapOptions);
	if (m == 'marker-yes') {
		var marker = new google.maps.Marker({
			position: coordinates,
			map: map
    });
	}
});

})(jQuery);