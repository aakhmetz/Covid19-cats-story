/**
 * Our plugin-wide JS file.
 *
 * @package WordPress
 * @subpackage LXB_MailChimp_Tools
 * @since LXB_MailChimp_Tools 4.0
 */

/**
 * A global object with members that any of our jQuery plugins can use.
 *
 * @type {Object}
 */
var lxbMailChimpTools = {

	/**
	 * Set the value of a url var.
	 * @param {string}  url   The url we are editing.
	 * @param {string}  key   The key for our url variable.
	 * @param {string}  value The value for our url variable.
	 * @return {string} The updated url.
	 */
	setUrlParameter : function( url, key, value ) {
		
		// Default to the current url.
		if ( ! url ) { url = window.location.href; }
		
		var re = new RegExp( "([?&])" + key + "=.*?(&|#|$)(.*)", "gi");
		var hash = false;

		if ( re.test( url ) ) {

			if( typeof value !== 'undefined' && value !== null ) {

				return url.replace(re, '$1' + key + "=" + value + '$2$3');
			
			} else {

				hash = url.split('#');
				url = hash[0].replace( re, '$1$3' ).replace( /(&|\?)$/, '' );
				if( typeof hash[1] !== 'undefined' && hash[1] !== null ) {
					url += '#' + hash[1];
				}

				return url;
			}

		} else {
		  
			if( typeof value !== 'undefined' && value !== null ) {
				
				var separator = url.indexOf('?') !== -1 ? '&' : '?';
				
				hash = url.split( '#' );
				url = hash[0] + separator + key + '=' + value;
				
				if( typeof hash[1] !== 'undefined' && hash[1] !== null ) { 
					url += '#' + hash[1];
				}
				
				return url;
		
			} else {
			
				return url;
			}

		
		}
	
	},

	/**
	 * Grab the value of a url var.
	 * @param  {string} url    Any url.
	 * @param  {string} sParam The key for any url variable.
	 * @return {string} The value for sParam in url.
	 */
	getUrlParameter : function ( url, sParam ) {

		// Will hold the value of sParam if it's present in url.
		var out = '';

		// Break the url apart at the query string.
		var array = url.split( '?' );

		// Grab the second half of the url.
		if( typeof array[1] == 'undefined' ) { return false; }
		var queryStr = array[1];

		// Break the query string into key value pairs.
		var pairs = queryStr.split( '&' );

		// For each pair...
		jQuery( pairs ).each( function( k, v ) {

			// Break the pair into a key and a value.
			var pair = v.split( '=' );

			// If the key for this pair is what we're looking for...
			if( pair[0] == sParam ) {

				// Grab the value.
				out = pair[1];

			}

		});

		return out;
	}

};

/**
 * Our jQuery plugin for doing tablesorters.
 */
jQuery( document ).ready( function() {

	// Start an options object that we'll pass when we use our jQuery plugin.
	var options = {};

	// Apply our plugin to our table.
	jQuery( '.lxb_mailchimp_tools-tablesorter' ).lxbMctTableSorter( options );


});

jQuery( document ).ready( function( $ ) {

	/**
	 * Define our jQuery plugin for doing tablesorters.
	 *
	 * @param  {array}  options An array of options to pass to our plugin, documented above.
	 * @return {object} Returns the item that the plugin was applied to, making it chainable.
	 */
	$.fn.lxbMctTableSorter = function( options ) {

		// For each element to which our plugin is applied...
		return this.each( function() {

			// Save a reference to the table, so that we may safely use "this" later.
			var that = this;

			// Determine which column should sort first.
			var initialSortColumn    = $( that ).find( '[data-sort_initial_column=1]' );
			var initialSortColumnLength = initialSortColumn.length;

			if( initialSortColumnLength > 0 ) {
				initialSortColumnNum = $( initialSortColumn ).index();

			} else {
				initialSortColumnNum = 1;
			}

			// 1 means descending, which is pretty much what we always want.
			var direction = 1;
			
			var args = {

				sortList: [ [ initialSortColumnNum, direction ] ],
			}

			// Determine if we are forcing a numeric sort
			// see docs for more info on this: http://tablesorter.com/docs/example-parsers.html
			var numericSortColumns = jQuery( that ).find( 'thead' ).attr( 'data-force_numeric_sort' );

			// If we are, wrap up the columns we want in an object for the sort plugin
			if( typeof( numericSortColumns ) == 'string' ){

				var split = numericSortColumns.split(", ");

				var columns = {};

				// For each column that we are forcing a sort on, add an object to let the sorter know
				for ( var i = 0, len = split.length; i < len; i++) {

					var column = { sorter: 'digit' };

					var column_num = split[i];
				
					columns[column_num] = column;
			
				}
			}

			// If we have some columns to force sort, add those to the args before we apply the sort
			if( typeof( columns ) == 'object' ) {

				args.headers = columns;
			}

			// Apply tablesorter.
			$( that ).tablesorter( args );

			// Make our plugin chainable.
			return this;

		// End for each element to which our plugin is applied.
		});

	// End the definition of our plugin.
	};

}( jQuery ) );

/**
 * Our jQuery plugin for doing viewMores.
 */
jQuery( document ).ready( function() {

	// Start an options object that we'll pass when we use our jQuery plugin.
	var options = {};

	// Apply our plugin to our view more link.
	jQuery( '.LXB_MCT_View_More-get_link' ).lxbMctViewMore( options );

});

jQuery( document ).ready( function( $ ) {

	/**
	 * Define our jQuery plugin for doing viewMores.
	 *
	 * @param  {array}  options An array of options to pass to our plugin, documented above.
	 * @return {object} Returns the item that the plugin was applied to, making it chainable.
	 */
	$.fn.lxbMctViewMore = function( options ) {

		// For each element to which our plugin is applied...
		return this.each( function() {

			// Save a reference to the view more link, so that we may safely use "this" later.
			var that = this;

			// Grab the loding icon.
			var loadingIcon = $( that ).find( '.dashicons' ).hide();

			// When the link is clicked...
			$( that ).on( 'click', function( event ) {

				// Don't load a new page.
				event.preventDefault();

				// Show the loading icon.
				$( loadingIcon ).fadeIn();

				// Append the new items.
				appendItems();

			});

			/**
			 * Append the new items to the existing items.
			 */
			function appendItems() {

				// Get the pagination data.
				var args = $( that ).data();
				
				// Which page of results should we load?
				var page = args.page;

				// What would the next page be?
				var nextPage = page + 1;

				// Update the link to be ready to call the next page.
				$( that ).data( 'page', nextPage );

				// The href of the sso link that the user just clicked.
				var href = $( that ).attr( 'href' );

				// Grab the nonce off of the link.
				var nonce = lxbMailChimpTools.getUrlParameter( href, 'lxb_mailchimp_tools' );
				
				// Make a request to the WordPres AJAX API.
				load( args, nonce );

			}

			/**
			 * Makes an ajax request back to our php script.
			 */
			function load( args, nonce ) {

				// The data we want to send back to our php.
				var data = getData( args, nonce );

				/**
				 * Make an ajax http POST request, sending values from the form, back to our php handler.
				 *
				 * @param {string}   ajaxurl  The url for the wordpress admin ajax file.
				 * @param {array}    data     An array of data to send to our php.
				 * @param {response} response The response UI that our php sends back to us here in JS land.
				 */
				jQuery.ajax({
					type:   'POST',
					url:     ajaxurl,
					data:    data,
					success: function( response ) {

						// If there were no more items in the collection...
						if( response === '' ) {

							// Remove the button.
							$( that ).fadeOut();

						// Else, load the new items.
						} else {

							var out = $( '<div>' ).html( response ).hide();
							$( out ).insertBefore( that ).slideDown();

						}

						// Get rid of the loading icon.
						$( loadingIcon ).fadeOut();

					}
				});

			}

			/**
			 * Get the array of data that we are sending from the form to our php handler.
			 *
			 * @return {object} The data that we want to send back to our php script.
			 */
			function getData( args, nonce ) {

				// This data will be sent back to our php in $_POST.
				var out = {

					// This matches the suffix in add_action( 'wp_ajax_' ... ).
					'action' : 'lxb_mailchimp_tools',

					'args' : args,
					
					// Pass the nonce back to our php.
					'nonce' : nonce

				};

				return out;

			}

			// Make our plugin chainable.
			return this;

		// End for each element to which our plugin is applied.
		});

	// End the definition of our plugin.
	};

}( jQuery ) );

/**
 * Our jQuery plugin for doing tabbed panels.
 */
jQuery( document ).ready( function() {
	
	// Start an options object that we'll pass when we use our jQuery plugin.
	var options = {};

	// Apply our plugin to our table.
	jQuery( '.lxb_mailchimp_tools-tabbed_panels' ).lxbMctTabbedPanels( options );

});

jQuery( document ).ready( function( $ ) {

	/**
	 * Define our jQuery plugin for doing tabbed panels.
	 *
	 * @param  {array}  options An array of options to pass to our plugin, documented above.
	 * @return {object} Returns the item that the plugin was applied to, making it chainable.
	 */
	$.fn.lxbMctTabbedPanels = function( options ) {

		// For each element to which our plugin is applied...
		return this.each( function() {

			// Save a reference to the tabbed panels, so that we may safely use "this" later.
			var that = this;

			// The tabs.
			var tabs = $( that ).find( '.lxb_mailchimp_tools-tabbed_panels-tabs a' );

			// The panels.
			var panels = $( that ).find( '.lxb_mailchimp_tools-tabbed_panels-panel' );

			// Add our active,inactive classes to the panels.
			var inactive = $( panels ).filter( '.lxb_mailchimp_tools-inactive' );
			$( inactive ).hide();
			
			// When a tab is clicked...
			$( tabs ).on( 'click', function( event ){

				// Don't load a new page.
				event.preventDefault();

				// If it's not active...
				if( $( this ).hasClass( 'lxb_mailchimp_tools-inactive' ) ) {

					// Determine which panel refers to this tab.
					var id = $( this ).data( 'panel' );
					var panelForTab = $( panels ).filter( '#' + id );
					
					// Determine which panels do not refer to this tab.
					var otherTabs = $( tabs ).not( '[data-panel="' + id + '"]' );
					var otherPanels = $( panels ).not( '#' + id );		

					// Update the classes on this tab.
					$( this ).removeClass( 'lxb_mailchimp_tools-inactive' );
					$( this ).addClass( 'lxb_mailchimp_tools-active' );
					
					// Update classes on the panel for this tab.
					$( panelForTab ).removeClass( 'lxb_mailchimp_tools-inactive' );
					$( panelForTab ).addClass( 'lxb_mailchimp_tools-active' );

					// Update classes on the other tabs.
					$( otherTabs ).removeClass( 'lxb_mailchimp_tools-active' );
					$( otherTabs ).addClass( 'lxb_mailchimp_tools-inactive' );

					// Show/hide the correct panel.					
					$( otherPanels ).fadeOut(
						function() { $( panelForTab ).fadeIn();
					});

				}

			});
			
			// Make our plugin chainable.
			return this;

		// End for each element to which our plugin is applied.
		});

	// End the definition of our plugin.
	};
	
}( jQuery ) );
	
	/**
	 * Our jQuery plugin for doing submitting our form.
	 */
jQuery( document ).ready( function() {

	// Start an options object that we'll pass when we use our jQuery plugin.
	var options = {};

	// Apply our plugin to our table.
	jQuery( '.lxb_mct_subscribe_widget_form' ).lxbMctSubscribeSubmit( options );

});

jQuery( document ).ready( function( $ ) {

	/**
	 * Define our jQuery plugin for doing things.
	 *
	 * This plugin handles AJAX form submits from the Subscribe Widget shortcode.
	 *
	 * @param  {array}  options An array of options to pass to our plugin, documented above.
	 * @return {object} Returns the item that the plugin was applied to, making it chainable.
	 */
	$.fn.lxbMctSubscribeSubmit = function( options ) {

		// For each element to which our plugin is applied...
		return this.each( function() {

			// Save a reference to the table, so that we may safely use "this" later.
			var that = this;
			
			//Get the ajax url that we will post to.
			var ajaxurl = LXB_MCT_Subscribe_Shortcode.ajax_url;

			var section = $( that ).parent();

			var sectionHeader = $( section ).find( 'h3' );

			var resultHolder = $( LXB_MCT_Subscribe_Shortcode.result_holder ).hide().insertAfter( that );

			var resultMessage = $( resultHolder ).find( '.LXB_MCT_Subscribe_Shortcode-get_result_holder-message' );

			var original = $( resultMessage ).html();

			var spinner = $( resultHolder ).find( '.LXB_MCT_Subscribe_Shortcode-get_result_holder-spinner' );

			// When the form is submit...
			$( that ).on( 'submit', function( event ) {

				//Prevent the page from reloading.
				event.preventDefault();

				$( resultHolder ).removeClass( 'success' );
				$( resultHolder ).removeClass( 'error' );
				if( $( resultHolder ).is( ':visible' ) ) {
					$( resultMessage ).html( original );
				}
				$( resultHolder ).fadeIn();
				$( spinner ).fadeIn();
				
				var formData = {};

        		var groups = [];
        		
        		jQuery( this ).find( '[name]' ).each( function() {

        			if( this.name.search( 'group' ) > 0 ){

        				var hasGroups = true;

        				var groupName = this.name;

        				if( jQuery( this ).prop('checked' ) ){

        					groups.push(this.value); 
        				}
        			}

            		if( hasGroups ){

        				formData[groupName] = JSON.stringify( groups );
        			
        			} else {
						
						formData[this.name] = this.value;  
        			}
        		});

				// Send an HTTP request to the admin-ajax listener.
				load( formData );

			});
			
			/**
			 * Makes an ajax request back to our php script.
			 */
			function load( formData ) {

				// The data we want to send back to our php.
				var data = getData( formData );

				/**
				 * Make an ajax http POST request, sending values from the form, back to our php handler.
				 *
				 * @param {string}   ajaxurl  The url for the wordpress admin ajax file.
				 * @param {array}    data     An array of data to send to our php.
				 * @param {response} response The response UI that our php sends back to us here in JS land.
				 */
				
				jQuery.ajax({
					type:   'POST',
					url:     ajaxurl,
					data:    data,

					// Upon a successful attempt to contact the ajax listener...
					success: function( response ) {

						if( typeof response == 'object' ){

							response = JSON.stringify(response);
						}

						//Parse JSON to JS object.
						response = JSON.parse( response );

						//Should we forward the user somewhere?
						if( response.forward ) {

							// Send them where they want to go.
							window.location = response.url;

							//Subscribed successfully?
						} else if( response.error === false ) {

							$( spinner ).fadeOut( function() {
								var message = response.message;
								$( resultHolder ).addClass( 'success' );
								$( resultHolder ).removeClass( 'error' );
								$( resultMessage ).html( message );
							});

							// If there is already a result on the page...
							if( $( '.lxb_mct_subscribe_result' ).length ) {

								// Get rid of it.
								$( '.lxb_mct_subscribe_result' ).remove();
							}
						}

						//Was there an error?
						else if ( response.error === true ) {

							//Output the error instead
							$( spinner ).fadeOut( function() {
								var error = response.message;
								$( resultHolder ).addClass( 'error' );
								$( resultHolder ).removeClass( 'success' );
								$( resultMessage ).html( error );
							});							

							// If there is already a result on the page...
							if( $( '.lxb_mct_subscribe_result' ).length ) {

								// Get rid of it.
								$( '.lxb_mct_subscribe_result' ).remove();

							}

						}
					},
					
					// Upon a failed  attempt to contact the admin-ajax listener.					
					error: function( err ) {

						$( spinner ).fadeOut( function() {
							$( resultHolder ).addClass( 'error' );
							$( resultHolder ).removeClass( 'success' );
							$( resultMessage ).html( 'There was an error subscribing this user. Please try again.' );
						});
											
						// If there is already a result on the page...
						if( $( '.lxb_mct_subscribe_result' ).length ) {

							// Get rid of it.
							$( '.lxb_mct_subscribe_result' ).remove();

						}

					}


				});

			}

			/**
			 * Get the array of data that we are sending from the form to our php handler.
			 *
			 * @return {object} The data that we want to send back to our php script.
			 */
			function getData( args ) {

				// This data will be sent back to our php in $_POST.
				var out = {

					// This matches the suffix in add_action( 'wp_ajax_' ... ).
					'action' : 'lxb_mailchimp_tools_form',

					'args' : args,
					
				};
				
				return out;

			}

			// Make our plugin chainable.
			return this;

		// End for each element to which our plugin is applied.
		});

	// End the definition of our plugin.
	};

}( jQuery ) );

/**
 * Our jQuery plugin for doing a chartJS for our campaign stats.
 */
jQuery( document ).ready( function() {

	// Start an options object that we'll pass when we use our jQuery plugin.
	var options = {};

	// Apply our plugin to our table.
	jQuery( '.LXB_MCT_Admin-get_single_content-item-24_hour' ).lxbMctCampaignChart( options );

});

jQuery( document ).ready( function( $ ) {

	/**
	 * This plugin uses Chart.js to draw a graph of MailChimp interaction data.
	 *
	 * Currently displays clicks and opens in a line graph for every 24 hour period.
	 *
	 * @param  {array}  options An array of options to pass to our plugin, documented above.
	 * @return {object} Returns the item that the plugin was applied to, making it chainable.
	 */
	$.fn.lxbMctCampaignChart = function( options ) {

		// For each element to which our plugin is applied...
		return this.each( function() {
			
			var that = this;
			
			// Get the data from our localized variable.
			var campaignData = LXB_MCT_Campaigns_Page;

			// Parse it.
			campaignData = JSON.parse( campaignData );

			// If we dont have any campaign data...
			if ( ! campaignData.length ) {

				// Hide the 24 hour div.
				$( that ).hide();

				//Break execution right quick.
				return;
			}
			
			// Call a function to get an array of x axis labels.
			var labels = getDataArray( campaignData, 'timestamp' );

			// Call a function to get an array of opens data points.
			var uniqueOpens = getDataArray( campaignData, 'unique_opens' );
				
			// Call a function to get an array of recipients data points.
			var recipientsClicks = getDataArray( campaignData, 'recipients_clicks' );

			// Get max value of our two lines.
			var opensMax = Math.max.apply( null, uniqueOpens );
			
			var clicksMax = Math.max.apply( null, recipientsClicks );
			
			// Get the max of the data set.
			var maxAxis = Math.max( opensMax, clicksMax );
			
			// Set our y axis step.
			var step = 2;
			
			// If the max data variable is even, Increase the max of the graph by two for spacing.
			if ( maxAxis % step === 0 ) {
				
				maxAxis += 2;
				
			} else {

				//If the maxAxis is odd, increase the max axis by one to keep step even.
				maxAxis += 1;
			}
			
			// Assign a variable to the current context.
			var canvas = $( '.LXB_MCT_Campaigns_Page-get_24_hour_canvas' );
			
			// Create our data object with a bunch of presets.
			var data = {
				labels: labels,
				datasets: [
					{
						label: "Opens",
						fill: false,
						lineTension: 0.0,
						backgroundColor: "rgba(1,116,171, 1)",
						borderColor: "rgba(1,116,171, 1)",
						borderCapStyle: 'butt',
						borderWidth: 3,
						borderDash: [],
						borderDashOffset: 0.0,
						borderJoinStyle: 'miter',
						pointBorderColor: "rgba(1,116,171, 1)",
						pointBackgroundColor: "#fff",
						pointBorderWidth: 1,
						pointHoverRadius: 5,
						pointHoverBackgroundColor: "rgba(1,116,171, 1)",
						pointHoverBorderColor: "rgba(1,116,171, 1)",
						pointHoverBorderWidth: 2,
						pointRadius: 1,
						pointHitRadius: 10,
						data: uniqueOpens,
						spanGaps: false,
					},
					{
						label: "Clicks",
						fill: false,
						lineTension: 0.0,
						backgroundColor: "rgba(169,224,45, 1)",
						borderColor: "rgba(169,224,45, 1)",
						borderWidth: 3,
						borderCapStyle: 'butt',
						borderDash: [],
						borderDashOffset: 0.0,
						borderJoinStyle: 'miter',
						pointBorderColor: "rgba(169,224,45, 1)",
						pointBackgroundColor: "#fff",
						pointBorderWidth: 1,
						pointHoverRadius: 5,
						pointHoverBackgroundColor: "rgba(169,224,45, 1)",
						pointHoverBorderColor: "rgba(169,224,45, 1)",
						pointHoverBorderWidth: 2,
						pointRadius: 1,
						pointHitRadius: 10,
						data: recipientsClicks,
						spanGaps: false,
					}
				],
				
			};
			
			// Create our new chart.
			var myChart = new Chart(
				canvas,
				{
					type: 'line',
					data: data,
					responsive: true,
					maintainAspectRatio: false,
					options: {
						
						scales: {
							xAxes: [{
								gridLines: {
									color: "rgba(0, 0, 0, 0.0)"
								},
								ticks: {
									callback: function(dataLabel, index) {
										return index % 4 === 0 ? dataLabel : null;
									},
									fontSize: '11',
									maxRotation: '0'	
								},
								type: 'time',
								time: {
									parser: function(time) {
										return moment(time).utc();
									},
									tooltipFormat: 'h:mm a',
								},
							}],
							yAxes: [{
							ticks: {
								beginAtZero:false,
								stepSize: step,
								max: maxAxis
							}
						}]
					}
				}
			});

			// Make our plugin chainable.
			return this;

		// End for each element to which our plugin is applied.
		});
		
		/**
		 * @param {Object} data. The data we get from our AJAX request.
		 * @param dataKey  {String} The key whose values we want to parse.
		 * @return {Array}
		 */
		function getDataArray( data, dataKey ) {
			
			var dataArray = [];
			
			data.forEach( function( dataObject ) {
				
				var value = dataObject[dataKey];
				
				dataArray.push(value);
				
			});
			
			return dataArray;
			
		}

	// End the definition of our plugin.
	};

}( jQuery ) );

/**
 * Our jQuery plugin for doing a confirm/deny overlay.
 */
jQuery( document ).ready( function() {

	// Start an options object that we'll pass when we use our jQuery plugin.
	var options = {};

	// Apply our plugin to our form.
	jQuery( '.lxb_mct-instant_send #submitpost #publish, .lxb-mct-unsubscribe' ).lxbMCTOverlay( options );

});

jQuery( document ).ready( function( $ ) {

	/**
	 * Define our jQuery plugin for doing a confirm/deny overlay.
	 * 
	 * @param  {array}  options An array of options to pass to our plugin, documented above.
	 * @return {object} Returns the item that the plugin was applied to, making it chainable.
	 */
	$.fn.lxbMCTOverlay = function( options ) {

		// For each element to which our plugin is applied...
		return this.each( function() {

			// Save a reference to the form, so that we may safely use "this" later.
			var that = this;

			// The selector string for the overlay.
			var whichOverlaySel = '#' + $( that ).attr( 'id' ) + '-overlay';

			// The HTML for the overlay.
			var whichOverlay = $( whichOverlaySel );

			// The button to close the overlay.
			var close = $( whichOverlay ).find( '.LXB_MCT_Overlay-get-close' );

			// The buttons to say yes in the overlay.
			var yes = $( whichOverlay ).find( '[data-action="yes"]' );

			// The buttons to say no in the overlay.
			var no = $( whichOverlay ).find( '[data-action="no"]' );

			// Remove the active class from the overlay and fade it out.
			var cancel = function( event ) {

				event.preventDefault();

				$( whichOverlay ).fadeOut( function() {
					$( this ).removeClass( 'LXB_MCT_Overlay-get-active' );
				});

			};

			// Stash the overlay at the end of the DOM.
			$( whichOverlay ).hide().appendTo( 'body' );

			// When the link or submit button is clicked...
			$( that ).on( 'click', function( event ) {

				event.preventDefault();

				// Display the overlay.
				$( whichOverlay ).addClass( 'LXB_MCT_Overlay-get-active' ).fadeIn();

			});

			// When the close or 'no' button are clicked, remove the overlay and don't submit the form.
			$( close ).add( no ).click( cancel );

			// When the yes button is clicked...
			$( yes ).on( 'click', function( event ) {

				var button = this;

				$( whichOverlay ).fadeOut( function() {
					$( this ).removeClass( 'LXB_MCT_Overlay-get-active' );
				});

				// If we are clicking on a link, navigate the page.
				if( $( that ).is( 'a' ) ) {

					var url = $( that ).attr( 'href' );

					window.location.replace( url );
				
				// Else, it's probably a form submit.  Run it.
				} else {
				
					$( that ).unbind( 'click' );

					var metaData = $( this ).attr( 'data-meta_data' );
					if( typeof metaData != 'undefined' ) {

						var hiddenInput = $( '<input>' ).attr({ 'type' : 'hidden', 'name' : metaData, 'value' : true });
						var form = $( that ).closest( 'form' );
						$( hiddenInput ).appendTo( form );

					}

					$( that ).click();
				
				}

			});

			// Make our plugin chainable.
			return this;

		// End for each element to which our plugin is applied.
		});

	// End the definition of our plugin.
	};

}( jQuery ) );

/**
 * Our jQuery plugin for doing an instant send preview.
 */
jQuery( document ).ready( function() {

	// Start an options object that we'll pass when we use our jQuery plugin.
	var options = {};

	// Apply our plugin to our form.
	jQuery( '#LXB_MCT_Immediate_Send.postbox' ).lxbMCTInstantSendPreview( options );

});

jQuery( document ).ready( function( $ ) {

	/**
	 * Define our jQuery plugin for doing a confirm/deny overlay.
	 * 
	 * @param  {array}  options An array of options to pass to our plugin, documented above.
	 * @return {object} Returns the item that the plugin was applied to, making it chainable.
	 */
	$.fn.lxbMCTInstantSendPreview = function( options ) {

		// For each element to which our plugin is applied...
		return this.each( function() {

			// Save a reference to the form, so that we may safely use "this" later.
			var that = this;

			var inner = $( that ).find( '.inside' );

			// The form input where the user types email addresses.
			var emailInput = $( that ).find( '.LXB_MCT_Immediate_Send-preview-emails' );

			// The button to send the preview.
			var button = $( that ).find( '.LXB_MCT_Immediate_Send-preview-button' );

			var spinner = $( that ).find( '.spinner' );

			var feedback = $( that ).find( '.LXB_MCT_Immediate_Send-preview-feedback' ).hide();
			var feedbackColor = $( that ).find( '.LXB_MCT_Immediate_Send-preview-feedback-color' );
			var feedbackText  = $( that ).find( '.LXB_MCT_Immediate_Send-preview-feedback-text' );

			$( button ).on( 'click', function( event ) {

				event.preventDefault();

				var postID = $( button ).data( 'post_id' );
				var emailAddresses = $( emailInput ).val();

				send( postID, emailAddresses );

			});

			function send( postID, emailAddresses ) {

				var url = LXB_MCT_Immediate_Send.preview;

				removeMessage();

				addSpinner();

				formData = {
					post_id         : postID,
					email_addresses : emailAddresses
				};

				$.ajax({

					type        : 'POST',
					url         : url,
					data        : formData

				})
				.success( function( data, textStatus, jqXHR ) {
					console.log( 'success' );
					updateMessage( 'Success, your preview has been sent!', 'green' );
					removeSpinner();			
				})
				.error( function( data, textStatus, errorThrown ) {
					console.log( 'fail' );
					updateMessage( data.responseJSON.message, 'red' );
					removeSpinner();
				});

			}

			function updateMessage( title, color ) {

				$( feedbackColor).addClass( color );
				$( feedbackText).text( title );

				$( feedback ).fadeIn();

			}

			function removeMessage() {

				$( feedbackColor).removeClass( 'green' );
				$( feedbackColor).removeClass( 'red' );
				$( feedback ).fadeOut();

			}

			function addSpinner() {

				$( spinner ).addClass( 'is-active' );

			}

			function removeSpinner() {
				
				$( spinner ).removeClass( 'is-active' );

			}			

			// Make our plugin chainable.
			return this;

		// End for each element to which our plugin is applied.
		});

	// End the definition of our plugin.
	};

}( jQuery ) );