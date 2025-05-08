jQuery(document).ready(function($){
	"use strict";
	/* global lolfmk_process_form_a_vars, jQuery */
	$( '.lol-newsletter-button' ).on( 'click', function( e ) {
		var el = $( this ),
			form = el.parent( 'form' ),
			display_name = form.data( 'name' ),
			confirm = form.data( 'confirm' ),
			list_id = form.find( '.lol-newsletter-list-id' ).val(),
			first_name = form.find( '.lol-newsletter-first-name' ).val(),
			last_name = form.find( '.lol-newsletter-last-name' ).val(),
			email = form.find( '.lol-newsletter-email' ).val(),
			response_message_el = form.parent( '.lol-item-newsletter' ).find( '.lol-newsletter-response' ),
			loader = form.find( '.lol-newsletter-loader' );

		response_message_el.find( '.lol_newsletter_message' ).remove();
		loader.addClass( 'loading' );

		var post_data = {
			action: 'lolfmk_process_form_a',
			m_display_name: display_name,
			m_confirm: confirm,
			m_list_id: list_id,
			m_first_name: first_name,
			m_last_name: last_name,
			m_email: email,
			mailchimp_form_nonce: lolfmk_process_form_a_vars.nonce
		};
		$.post(lolfmk_process_form_a_vars.ajaxurl, post_data, function( response ) {
			response_message_el.append( response );
			loader.removeClass( 'loading' );
		});
		e.preventDefault();
	});	
});