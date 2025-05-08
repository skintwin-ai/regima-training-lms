(function($) {

"use strict";
/*global Modernizr, jQuery */
/*jslint bitwise: true */

var LOLLUM = {};

Modernizr.addTest('firefox', function () {
	return !!navigator.userAgent.match(/firefox/i);
});
Modernizr.addTest('safari', function () {
	return !!(navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1);
});

/*-----------------------------------------------------------------------------------*/
/*	Logo Retina
/*-----------------------------------------------------------------------------------*/
LOLLUM.logoRetina = function() {
	if ($("#retina-logo").length > 0) {
		var pixelRatio = !!window.devicePixelRatio ? window.devicePixelRatio : 1,
			desktopLogo = $('#desktop-logo'),
			retinaLogo = $('#retina-logo'),
			logoWidth = desktopLogo.width(),
			logoHeight = desktopLogo.height();
		if (pixelRatio > 1) {
			retinaLogo.attr({height: logoHeight, width: logoWidth});
			retinaLogo.css('display', 'inline-block');
			desktopLogo.hide();
		}
	}
};
/*-----------------------------------------------------------------------------------*/
/*	Navigation Menu
/*-----------------------------------------------------------------------------------*/
LOLLUM.submenu = function() {
	$('#nav-menu .sf-menu').find('.megamenu_wrap').find('ul').addClass('sub-mega');
	$('#nav-menu .sf-menu').superfish({
		popUpSelector: 'ul,.sf-mega,.megamenu_wrap',
		autoArrows: false,
		delay: 500,
		speed: 200,
		speedOut: 200,
		useClick: false
	});
};
/*-----------------------------------------------------------------------------------*/
/*	Sticky Header
/*-----------------------------------------------------------------------------------*/
LOLLUM.sticky = function() {
	var t = 30,
		body = $(document.documentElement);
	$(window).scroll(resizeHeader);
	$(window).resize(function(){
		resizeHeader();
	});
	function resizeHeader() {
		if ($(window).width() > 991) {
			var st = $(window).scrollTop();
			if (st > t) {
				body.addClass('fixed-yes');
			} else {
				body.removeClass('fixed-yes');
			}
		} else {
			body.removeClass('fixed-yes');
		}
	}
};
/*-----------------------------------------------------------------------------------*/
/*	Mobile Menu
/*-----------------------------------------------------------------------------------*/
LOLLUM.mobileMenu = function() {
	$('#mobile-primary-menu').customSelect({customClass:'mobile-select'});
	$('.mobile-nav-menu-inner').css('visibility', 'visible').animate({opacity: 1.0}, 200);
	$('#mobile-primary-menu').on('change', function() {
		window.location = $(this).val();
	});
};
/*-----------------------------------------------------------------------------------*/
/*	fitVids
/*-----------------------------------------------------------------------------------*/
LOLLUM.rVideos = function() {
	$(".entry-video, .video-widget, .entry-content").fitVids({
		customSelector: "iframe[src^='http://www.screenr.com']"
	});
};
/*-----------------------------------------------------------------------------------*/
/*	Flexslider
/*-----------------------------------------------------------------------------------*/
LOLLUM.flex = function() {
	if(jQuery().flexslider) {
		$('.flex-gallery').flexslider({
			controlNav: false,
			slideshowSpeed: 4000,
			animation: "fade",
			animationSpeed: 600,
			// smoothHeight:true,
			start: function(slider) {
				slider.find('.preloader').hide();
			}
		});
		$('.flex-testimonial').flexslider({
			controlNav: false,
			prevText: "",
			nextText: "",
			slideshowSpeed: 8000,
			animation: "slide",
			smoothHeight:true,
			animationSpeed: 600,
			start: function(slider) {
				slider.find('.preloader').hide();
			}
		});
		$('.flex-product').flexslider({
			manualControls: ".thumbnails-nav img",
			slideshow: false,
			animation: "fade",
			// smoothHeight:true,
			animationSpeed: 600,
			start: function(slider) {
				slider.find('.preloader').hide();
			}
		});
	}
};
/*-----------------------------------------------------------------------------------*/
/*	Toggles
/*-----------------------------------------------------------------------------------*/
LOLLUM.toggle = function() {
	var lolToggle = $('.lol-toggle'),
		toggleContents = $('.lol-toggle').find('.lol-toggle-content');
	toggleContents.not('[data-toggle="open"]').css('display', 'none');
	lolToggle.on('click', '.lol-toggle-header', function(){
		var toggleContent = $(this).next('.lol-toggle-content'),
			toggleIcon = $(this).find('.lol-icon-toggle'),
			iconOpen = '<i class="fa fa-chevron-down"></i>',
			iconClose = '<i class="fa fa-chevron-up"></i>';
		toggleContent.slideToggle();
		if (toggleIcon.hasClass('open')) {
			toggleIcon.removeClass('open');
			toggleIcon.html(iconOpen);
		} else {
			toggleIcon.addClass('open');
			toggleIcon.html(iconClose);
		}
	});
};
/*-----------------------------------------------------------------------------------*/
/*	FAQs
/*-----------------------------------------------------------------------------------*/
LOLLUM.faq = function() {
	var lolFaq = $('.lol-faq'),
		faqContents = $('.lol-faq').find('.lol-faq-content'),
		sortFaq = $('.faqs-select select');
	faqContents.css('display', 'none');
	lolFaq.on('click', '.lol-faq-header', function(){
		var faqContent = $(this).next('.lol-faq-content'),
			faqIcon = $(this).find('.lol-icon-faq'),
			iconOpen = 'Q',
			iconClose = 'A';
		faqContent.slideToggle();
		if ($(this).hasClass('open')) {
			$(this).removeClass('open');
			faqIcon.html(iconOpen);
		} else {
			$(this).addClass('open');
			faqIcon.html(iconClose);
		}
	});
	sortFaq.change(function(){
		var selector = $(this).val();
		if (selector !== '*') {
			$('.lol-faq-wrap .lol-faq').not('[data-filter~="'+selector+'"]').slideUp('normal', function(){
				$('.lol-faq-wrap .lol-faq').filter('[data-filter~="'+selector+'"]').slideDown();
			});
		} else {
			$('.lol-faq-wrap .lol-faq').slideDown();
		}
	});
	$('.faqs-tabs').find('a').on('click', function(e){
		e.preventDefault();
		var selector = $(this).attr('data-filter');
		if (selector !== '*') {
			$('.lol-faq-wrap .lol-faq').not('[data-filter="'+selector+' "]').slideUp('normal', function(){
				$('.lol-faq-wrap .lol-faq').filter('[data-filter="'+selector+' "]').slideDown();
			});
		} else {
			$('.lol-faq-wrap .lol-faq').slideDown();
		}
		$(this).parents('ul').find('li').removeClass('active');
		$(this).parent().addClass('active');
	});
	$('#lol-faq-topics li a, .back-faqs').on('click', function(e){
		e.preventDefault();
		var target = this.hash,
		$target = $(target);
		$('html, body').stop().animate({
		'scrollTop': $target.offset().top
		}, 600, 'easeOutCirc', function () {
			window.location.hash = target;
		});
	});
};
/*-----------------------------------------------------------------------------------*/
/*	Placeholder Support
/*-----------------------------------------------------------------------------------*/
LOLLUM.placeholder = function() {
	if(!Modernizr.input.placeholder){
		$('[placeholder]').focus(function() {
			var input = $(this);
			if (input.val() === input.attr('placeholder')) {
				input.val('');
				input.removeClass('placeholder');
			}
		}).blur(function() {
			var input = $(this);
			if (input.val() === '' || input.val() === input.attr('placeholder')) {
				input.addClass('placeholder');
				input.val(input.attr('placeholder'));
			}
		}).blur();
		$('[placeholder]').parents('form').submit(function() {
			$(this).find('[placeholder]').each(function() {
				var input = $(this);
				if (input.val() === input.attr('placeholder')) {
					input.val('');
				}
			});
		});
	}
};
/*-----------------------------------------------------------------------------------*/
/*	Filterable Portfolio
/*-----------------------------------------------------------------------------------*/
LOLLUM.isotope = function() {
	if(jQuery().isotope) {
		var itemsContainer = $('.section-filterable'),
			portfolioFilter = $('.portfolio-filter select'),
			layoutMode = 'fitRows';
		if (itemsContainer.hasClass('full-portfolio-wrap')) {
			layoutMode = 'sloppyMasonry';
		}
		itemsContainer.isotope({
			itemSelector: '.portfolio-item',
			layoutMode: layoutMode
		});
		portfolioFilter.change(function(){
			var selector = $(this).val();
			itemsContainer.isotope({ filter: selector });
		});
		$('.portfolio-tabs').find('a').on('click', function(e){
			e.preventDefault();
			var selector = $(this).attr('data-filter');
			itemsContainer.isotope({ filter: selector });
			$(this).parents('ul').find('li').removeClass('active');
			$(this).parent().addClass('active');		
		});
	}
};
/*-----------------------------------------------------------------------------------*/
/* Back to Top
/*-----------------------------------------------------------------------------------*/
LOLLUM.backTop = function() {
	var windowWidth = $(window).width();
	if (windowWidth > 1023) {
		var didScroll = false;
		$(window).scroll(function () {
			didScroll = true;
		});
		setInterval(function () {
			if (didScroll) {
				didScroll = false;
				if ($(this).scrollTop() > 200) {
					$('#back-top').fadeIn();
				} else {
					$('#back-top').fadeOut();
				}
			}
		}, 250);
		$('#back-top').click(function() {
			$('body,html').animate({
				scrollTop: 0
			}, 300);
			return false;
		});
	}
};
/*-----------------------------------------------------------------------------------*/
/*	Timer
/*-----------------------------------------------------------------------------------*/
LOLLUM.timer = function() {
	var daysDiv = document.getElementById("days"),
		hoursDiv = document.getElementById("hours"),
		minutesDiv = document.getElementById("minutes"),
		secondsDiv = document.getElementById("seconds"),
		totalSeconds,
		days,
		hours,
		minutes,
		seconds;
	function pad(num, size) {
		var s = num + "";
		while (s.length < size) {
			s = "0" + s;
		}
		return s;
	}
	function updateTime(){
		days = Math.floor((totalSeconds) / 86400);
		hours = Math.floor((totalSeconds % 86400) / 3600);
		minutes = Math.floor(((totalSeconds % 86400) % 3600) / 60);
		seconds = Math.floor(((totalSeconds % 86400) % 3600) % 60);
	}
	function updateDisplay(){
		daysDiv.innerHTML = pad(days, 2);
		hoursDiv.innerHTML = pad(hours, 2);
		minutesDiv.innerHTML = pad(minutes, 2);
		secondsDiv.innerHTML = pad(seconds, 2);
	}
	function countdown(){
		updateTime();
		updateDisplay();
		if (totalSeconds === 0){
			$('#countdown-wrap').fadeOut('slow', function() {
			$('#count-end').fadeIn();

			});
		} else {
			totalSeconds -= 1;
			window.setTimeout(countdown, 1000);
		}
	}
	function initCountdown(tSeconds){
		totalSeconds = tSeconds;
		countdown();
	}
	$('#countdown').each(function() {
		var tSeconds = $(this).data('countdown');
		initCountdown(tSeconds);
	});
};
/*-----------------------------------------------------------------------------------*/
/*	Skills
/*-----------------------------------------------------------------------------------*/
LOLLUM.animationsA = function() {
	$('.lol-skill').find('.lol-bar').appear(function() {
		var currentSkill = $(this);
		var w = currentSkill.data("skill");
		$(this).animate({width: w + "%"}, 600, 'easeInOutCirc');
	});
	if(jQuery().countTo) {
		$('.progress-number').appear(function() {
			$('.timer').countTo();
		});
	}
};
/*-----------------------------------------------------------------------------------*/
/*	Image Animations
/*-----------------------------------------------------------------------------------*/
LOLLUM.animationsB = function() {
	$('.lol-item-heading, .lol-item-heading-small, .lol-item-heading-parallax').appear(function() {
		$(this).children('h2').addClass('animated bounceInLeft done');
		$(this).children('p').addClass('animated bounceInRight done');
	});
	var specialImgs = $('#logo, .lol-item-block-feature, .lol-item-block-banner, .map-canvas-wrapper, .entry-video, .entry-audio, .dribbble-widget, .dribbble-dribbble-widget, .flickr-widget, .footer-dribbble-widget, #payment').find('img'),
		imgs = $('#wrap').find('img').not(specialImgs);
	imgs.appear(function() {
		$(this).addClass('animated fadeIn img-done');
	});
	$('.service-icon').parents('.row').appear(function() {
		$(this).find('.service-icon').each(function(i){
			var currentIcon = $(this);
			setTimeout(function(){
				currentIcon.addClass('animated bounceIn done');
			}, i * 200);
		});
	});
	$('.mini-service-icon').appear(function() {
		$(this).addClass('animated bounceIn done');
	});
	$('.lol-item-block-feature').find('img').appear(function() {
		$(this).addClass('animated bounceIn done');
	});
	$('.lol-item-block-banner').appear(function() {
		$(this).find('img').addClass('animated bounceInLeft done');
		$(this).find('.block-banner-content').addClass('animated bounceInRight done');
	});
};
/*-----------------------------------------------------------------------------------*/
/*	Parallax
/*-----------------------------------------------------------------------------------*/
LOLLUM.bgParallax = function() {
	if(jQuery().parallax) {
		$('.parallax-yes').each(function() {
			$(this).parallax("49%", 0.3);
		});
		$(window).resize(function(){
			$('.parallax-yes').each(function() {
				$(this).parallax("49%", 0.3);
			});
		});
	}
};
/*-----------------------------------------------------------------------------------*/
/*	Preloader
/*-----------------------------------------------------------------------------------*/
LOLLUM.preloader = function() {
	if(jQuery().jpreLoader) {
		$('body').jpreLoader({
			showSplash: true,
			splashID: '#splash',
			showPercentage: false,
			splashFunction: function() {
				$('.spinner').animate({'opacity' : 1}, 800, 'easeOutExpo');
			}
		}, function() {
			$('.spinner').animate({'opacity' : 0}, 800, 'easeOutExpo', function() {
				$(this).hide();
				setTimeout(function() {
					$('#bgsplash').addClass('loaded');
				}, 300);
			});
		});
	}
};
/*-----------------------------------------------------------------------------------*/
/*	prettyPhoto
/*-----------------------------------------------------------------------------------*/
LOLLUM.pretty = function() {
	if(jQuery().prettyPhoto) {
		$('.lol-item-image').find('a[data-rel^="prettyPhoto"]').prettyPhoto({
			deeplinking: false,
			social_tools: false,
			show_title: false
		});
	}
};
/*-----------------------------------------------------------------------------------*/
/*	Slider Link
/*-----------------------------------------------------------------------------------*/
LOLLUM.sliderNav = function() {
	var sliderLink = $('.link-slider').find('a'),
		t = 0;
	if ($(document.documentElement).hasClass('lol-sticky-header-yes')) {
		t = $('#branding').height();
	}
	sliderLink.on('click', function() {
		var target = this.hash,
		$target = $(target);
		$('html, body').stop().animate({
			'scrollTop': $target.offset().top - t
		}, 1000, 'easeOutCirc');
		return false;
	});
};
/*-----------------------------------------------------------------------------------*/
/*	Checkout Height
/*-----------------------------------------------------------------------------------*/
LOLLUM.checkoutHeight = function() {
	var h = $('#order-review-wrap').height();
	$('form.checkout').css('min-height', h);
};
/*-----------------------------------------------------------------------------------*/
/*	Init Functions
/*-----------------------------------------------------------------------------------*/
$(document).ready(function() {
	if ($(document.documentElement).hasClass('lol-preloader-yes')) {
		LOLLUM.preloader();
	}
	LOLLUM.submenu();
	LOLLUM.mobileMenu();
	LOLLUM.rVideos();
	LOLLUM.flex();
	LOLLUM.toggle();
	LOLLUM.faq();
	LOLLUM.placeholder();
	LOLLUM.bgParallax();
	LOLLUM.timer();
	LOLLUM.pretty();
	LOLLUM.backTop();
	LOLLUM.sliderNav();
	LOLLUM.animationsA();
	LOLLUM.checkoutHeight();
	if ((!Modernizr.touch) && ($(document.documentElement).hasClass('lol-sticky-header-yes')) && ($(document.documentElement).hasClass('lol-top-header-yes'))) {
		LOLLUM.sticky();
	}
	if ($(document.documentElement).hasClass('lol-animations-yes')) {
		if (Modernizr.touch && $(document.documentElement).hasClass('lol-animations-touch-yes')) {
			LOLLUM.animationsB();
		} else if (!Modernizr.touch) {
			LOLLUM.animationsB();
		}
	}
});
$(window).load(function() {
	LOLLUM.logoRetina();
	if (!$(document.documentElement).hasClass('lt-ie9')) {
		LOLLUM.isotope();
	}
});

})(jQuery);
