/*!
Package: magus (www.jasonthedev.com/plugins/magus)
Version: 1.0.0
Last updated: 2013-07-30
* Author: Jason Oakley <magus@jasonthedev.com>;
* Website: www.jasonthedev.com */
if (!jQuery) { throw new Error("Bootstrap requires jQuery") }

(function( $, window, document, undefined ){
	
	/**
	 * The plugin namespace, ie for $('.selector').myPluginName(options)
	 * 
	 * Also the id for storing the object state via $('.selector').data()  
	 */
	var PLUGIN_NS = 'awizard';
	
	/*###################################################################################
	 * PLUGIN BRAINS
	 *  
	 * INSTRUCTIONS:
	 * 
	 * To init, call...
	 * $('selector').myPluginName(options) 
	 * 
	 * Some time later...  
	 * $('selector').myPluginName('myActionMethod')
	 *  
	 * DETAILS:
	 * Once inited with $('...').myPluginName(options), you can call
	 * $('...').myPluginName('myAction') where myAction is a method in this
	 * class.
	 * 
	 * The scope, ie "this", **is the object itself**.  The jQuery match is stored
	 * in the property this.self.  In general this value should be returned to allow
	 * for jQuery chaining by the user.
	 *  
	 * Methods which begin with underscore are private and not 
	 * publically accessible.
	 * 
	 * CHECK IT OUT...
	 * var mySelecta = 'DIV';
	 * jQuery(mySelecta).myPluginName();
	 * jQuery(mySelecta).myPluginName('publicMethod');
	 * jQuery(mySelecta).myPluginName('_privateMethod');  
	 *
	 *###################################################################################*/
 
	/**
	 * Quick setup to allow property and constant declarations ASAP
	 * IMPORTANT!  The jquery hook (bottom) will return a ref to the target for chaining on init 
	 * BUT it requires a reference to this newly instantiated object too! Hence "return this" over "return this.self"
	 * The later is encouraged in all public API methods.
	 */
	var Plugin = function ( target, options ) {

		var DEFAULT_OPTIONS = {

			debug					: false,

			// panel options
			active_panel			: 0,
			disable_panels			: true,
			height					: null,
			panel_height			: null,
			active_can_close		: false,
			set_active_completed_on_show	: true,		// will make the current panel as completed before showing the next panel
			collapse_active_on_show	: true,				// collapse the active panel before showing the next panel
			disable_bs_transition	: true,
			
			// accordion classes
			acc_group_class			: '.accordion-group',
			acc_heading_class		: '.accordion-heading',
			acc_toggle_class		: '.accordion-toggle',
			acc_collapsible_class	: '.collapse',

			// accordion state classes
			disabled_class			: '.acc-disabled',
			active_class			: '.acc-active',
			inactive_class			: '.acc-inactive',
			completed_class			: '.acc-completed',

			// button classes
			button_class			: '.btn',

			// sidebar status panel options
			show_sidebar			: true,
			sidebar_node_elem		: 'li',
			sidebar_class			: '.awizard-sidebar',

			// public callbacks
			init		: function() {},	// when the plugin initializes
			beforeShow	: function() {},	// before showing a panel
			afterShow	: function() {},	// after showing a panel
			beforeHide	: function() {},	// before hiding a panel
			afterHide	: function() {},	// after hiding a panel
			onDisable	: function() {},	// when a panel has been disabled
			onEnable	: function() {},	// when a panel has been enabled
			onComplete	: function() {}		// when a panel has been marked as completed
		};
 
		this.options		= $.extend( true, DEFAULT_OPTIONS, options );
		this.self			= $( target );
		this.sidebar		= $( this.sidebar_class );
		this._init( target, options );
		window.awizard = this;
		return this;
	};
 
 
	/** #### Plugin Init #### */
	Plugin.prototype._init = function ( target, options )
	{
		// initialize panels
 		this._setup();

 		// if height option is passed
 		if ( this.options.height !== null ) this.setAccordionHeight( this.options.height );

 		// user supplied callback
 		this._hook( 'init', this );

 		// start listeners
 		this._listen();
	};

	Plugin.prototype._cleanSelector	= function( selector )
	{

		return selector.replace( '.', '' );
	};

	Plugin.prototype._hook = function( name )
	{
		if ( this.options[ name ] !== undefined ) {
			var fn	= this.options[name];
			arguments[0] = this.self;
			return fn.apply( this, arguments );
		}
	};

	Plugin.prototype._setup = function()
	{
		var $this	= this,
			height	= 0;

		if ( $this.self.data( 'defaultPanel' ) !== undefined ) {
			$this.options.active_panel = $this.self.data( 'defaultPanel' );
		}

		// setup accordion panels
		$this.self.nodes = [];
		$.each( $this.self.find( this.options.acc_group_class ), function( i, p ) {
			var $panel = $( p );

			$this.self.nodes.push({
				index		: i,
				target		: $panel.find( $this.options.acc_toggle_class ).attr( 'href' ),
				elem		: $panel,
				collapsible	: $panel.find( $this.options.acc_collapsible_class ),
				active		: false,
				disabled	: $panel.data( 'disabled' ),
				completed	: false
			});

			// SET > data-attr[default-panel]
			if ( $this.self.nodes[ $this.options.active_panel ] !== undefined ) {
				$this.self.nodes[ $this.options.active_panel ].active = true;
			}

			// SET > data-attr[disable-panels]
			if ( $this.self.data( 'disablePanels' ) !== undefined && $this.self.data( 'disablePanels' ) === true && $this.self.nodes[i].active !== true ) {
				$this.self.nodes[i].disabled = true;
			}

			// SETUP > active panel
			if ( $this.self.nodes[i].active !== undefined && $this.self.nodes[i].active === true ) {
				$this.self.nodes[i].elem
					.addClass( $this._cleanSelector( $this.options.active_class ) )
					.find( $this.options.acc_collapsible_class ).addClass( 'in' );
			}

			// SETUP > diabled panels
			if ( $this.self.nodes[i].disabled !== undefined && $this.self.nodes[i].disabled === true ) {
				$this.self.nodes[i].elem.addClass( $this._cleanSelector( $this.options.disabled_class ) );
				$this.self.nodes[i].elem.find( $this._cleanSelector( $this.options.acc_toggle_class ) ).removeAttr( 'data-toggle' );
			}
		});

		// setup sidebar nodes
		if ( this.options.show_sidebar === true ) {

			// set sidebar
			$this.sidebar = $( this.options.sidebar_class );
			$.each( $this.sidebar.find( $this.options.sidebar_node_elem ), function( i, n ) {
				var $sbNode		= $( n ),
					$panelNode	= $.grep( $this.self.nodes, function( e ) { return e.target === $sbNode.find( 'a' ).attr( 'href' ); } );

				// attach sidebar node to panel nodes
				$this.self.nodes[$panelNode[0].index].sb_elem = $sbNode;

				// SETUP > active node
				if ( $this.self.nodes[$panelNode[0].index].active === true ) $sbNode.addClass( $this._cleanSelector( $this.options.active_class ) );
				
				// SETUP > active node
				if ( $this.self.nodes[$panelNode[0].index].disabled === true ) $sbNode.addClass( $this._cleanSelector( $this.options.disabled_class ) );
				
				// SETUP > completed node
				if ( $this.self.nodes[$panelNode[0].index].completed === true ) $sbNode.addClass( $this._cleanSelector( $this.options.completed_class ) );
			

			});
		}

 		// if panel_height option is passed
 		if ( $this.options.panel_height !== null ) $this.setPanelHeight( $this.options.active_panel, $this.options.panel_height );
	};

	Plugin.prototype._listen = function()
	{
		var self = this;

		// click event on accordion heading
		//$( self.options.button_class, self.sidebar_class + ' a' ).on( 'click', function( e ) {
		$( document ).on( 'click', self.options.button_class, function( e ) {
			var $target = $( e.currentTarget );

			e.preventDefault();
			e.stopPropagation();

			if ( self.options.disable_bs_transition === true ) {
	 			$.fn.collapse.Constructor.prototype.transition = function() {
	 				return false;
	 			};
	 		}

			// disable requested panel but no navigation
			if ( $target.data( 'disable' ) !== undefined && $target.data( 'disable' ) === true ) {
				self.disable( $target.data( 'panel' ), true );
			}

			// enable requested panel but no navigation
			else if ( $target.data( 'disable' ) !== undefined && $target.data( 'disable' ) === false ) {
				self.disable( $target.data( 'panel' ), false );
			}

			// navigate to requested panel
			else {
				self.goTo( $target.data( 'panel' ), $target.data( 'completed' ) );
			}
		});

		// stop propagation on disabled elements
		$( this.options.acc_toggle_class ).on( 'click', function( e ) {

			var self	= window.awizard,
				$target	= $( e.currentTarget ),
				$group	= $target.closest( self.options.acc_group_class ),
				$index	= $.grep( self.self.nodes, function( e ) { return e.target === $target.attr( 'href' ); } );

			e.preventDefault();
			e.stopPropagation();

			if ( $group.hasClass( self.options.disabled_class.replace( '.', '' ) ) || self.options.active_can_close === false ) {
				return false;
			}

			self.show( $index[0].index );
			return false;
		});

		// listen for sidebar node click
		$( this.options.sidebar_class + ' ' + this.options.sidebar_node_elem + ' a' ).on( 'click', function( e ) {

			var self	= window.awizard,
				$target	= $( e.currentTarget ),
				$group	= $target.closest( self.options.acc_group_class ),
				$index	= $.grep( self.self.nodes, function( e ) { return e.target === $target.attr( 'href' ); } );

			e.preventDefault();
			e.stopPropagation();

			if ( $index[0].disabled === true || self.options.active_can_close === false ) {
				return false;
			}

			self.show( $index[0].index );
		});
	};

	Plugin.prototype.setAccordionHeight = function( height )
	{
		this.self.height( parseInt( height, 10 ) );
		return this.self;
	};

	Plugin.prototype.getActivePanel = function()
	{
		return $.grep( this.self.nodes, function( e ) { return e.active; } )[0];
	};

	Plugin.prototype.setPanelHeight = function( idx, height )
	{
		var self		= this,
			req_panel	= this.self.nodes[ idx ];

		req_panel.collapsible.height( parseInt( height ) );

		return this.self;
	};

	Plugin.prototype.show = function( idx )
	{
		var self		= this,
			active_panel= $.grep( this.self.nodes, function( e ) { return e.active; } ),
			req_panel	= this.self.nodes[ idx ];

		if ( req_panel !== undefined && active_panel[0].index !== idx ) {

			// hide the current panel
			if ( self.options.collapse_active_on_show === true ) self.hide( active_panel[0].index );

			// user supplied hook before showing the panel
			self._hook( 'beforeShow', active_panel[0], req_panel );

			// enable the requested panel
			req_panel.active = true;
			req_panel.elem
				.removeClass( self._cleanSelector( self.options.inactive_class ) )
				.addClass( self._cleanSelector( self.options.active_class ) );
			req_panel.collapsible.collapse( 'show' );

			// enable the requested sidebar node
			req_panel.sb_elem
				.removeClass( self._cleanSelector( self.options.inactive_class ) )
				.addClass( self._cleanSelector( self.options.active_class ) );

			// if panel_height option is passed
 			if ( this.options.panel_height !== null ) this.setPanelHeight( req_panel.index, this.options.panel_height );

			// user supplied hook after showing the panel
			self._hook( 'afterShow', self, active_panel[0], req_panel );
		}
		return this.self;
	};

	Plugin.prototype.hide = function( idx )
	{
		var self		= this,
			req_panel	= this.self.nodes[ idx ];

		// deactivate the panel
		if ( req_panel !== undefined ) {

			// user supplied hook before hiding the panel
			self._hook( 'beforeHide' );

			req_panel.active = false;
			req_panel.elem
				.addClass( self._cleanSelector( this.options.inactive_class ) )
				.removeClass( self._cleanSelector( this.options.active_class ) );
			req_panel.collapsible.collapse( 'hide' );

			// inactive sidebar node
			req_panel.sb_elem
				.addClass( self._cleanSelector( self.options.inactive_class ) )
				.removeClass( self._cleanSelector( self.options.active_class ) );

			// if panel_height option is passed
 			if ( this.options.panel_height !== null ) this.setPanelHeight( req_panel.index, 0 );

			// user supplied hook after hiding the panel
			self._hook( 'afterHide' );
		}
		return this.self;
	};

	Plugin.prototype.goTo = function( idx, completed )
	{
		var self		= this,
			active_panel= $.grep( this.self.nodes, function( e ) { return e.active; } ),
			req_panel	= this.self.nodes[ idx ],
			set_complete= true;

		if ( req_panel !== undefined ) {
			self.disable( idx, false );

			if ( completed !== undefined && completed === false ) set_complete = false;

			self.complete( active_panel[0].index, set_complete );

			self.show( req_panel.index );
		}

		return this.self;
	};

	Plugin.prototype.disable = function( idx, state )
	{
		var self		= this,
			req_panel	= this.self.nodes[ idx ];

		if ( req_panel !== undefined ) {

			// set disabled
			if ( state !== undefined && state === true ) {
				req_panel.disabled = true;
				req_panel.elem.addClass( self._cleanSelector( self.options.disabled_class ) );
				req_panel.sb_elem.addClass( self._cleanSelector( self.options.disabled_class ) );

				// user supplied hook after a panel has been disabled
				self._hook( 'onDisable' );
			}

			// unset disabled
			if ( state !== undefined && state === false ) {
				req_panel.disabled = false;
				req_panel.elem.removeClass( self._cleanSelector( self.options.disabled_class ) );
				req_panel.sb_elem.removeClass( self._cleanSelector( self.options.disabled_class ) );

				// user supplied hook after a panel has been disabled
				self._hook( 'onEnable' );
			}
		}
		return this.self;
	};

	Plugin.prototype.complete = function( idx, state )
	{
		var self		= this,
			req_panel	= this.self.nodes[ idx ];

		if ( req_panel !== undefined ) {

			// set completed
			if ( state !== undefined && state === true ) {
				req_panel.completed = true;
				req_panel.elem.addClass( self._cleanSelector( self.options.completed_class ) );
				req_panel.sb_elem.addClass( self._cleanSelector( self.options.completed_class ) );
			}

			// unset completed
			if ( state !== undefined && state === false ) {
				req_panel.completed = false;
				req_panel.elem.removeClass( self._cleanSelector( self.options.completed_class ) );
				req_panel.sb_elem.removeClass( self._cleanSelector( self.options.completed_class ) );
			}

			// user supplied hook after a panel has been set as complete
			self._hook( 'onComplete' );
		}
		return this.self;
	};
 
	$.fn[ PLUGIN_NS ] = function( methodOrOptions ) {
		if ( ! $(this).length ) {
			return $( this );
		}
		var instance = $( this ).data( PLUGIN_NS );
			
		// CASE: action method (public method on PLUGIN class)        
		if ( instance 
				&& methodOrOptions.indexOf('_') != 0 
				&& instance[ methodOrOptions ] 
				&& typeof( instance[ methodOrOptions ] ) == 'function' ) {
			
			return instance[ methodOrOptions ]( Array.prototype.slice.call( arguments, 1 ) ); 
				
				
		// CASE: argument is options object or empty = initialise            
		}
		else if ( typeof methodOrOptions === 'object' || ! methodOrOptions ) {
 
			instance = new Plugin( $(this), methodOrOptions );    // ok to overwrite if this is a re-init
			$(this).data( PLUGIN_NS, instance );
			return $(this);
		
		// CASE: method called before init
		}
		else if ( !instance ) {
			$.error( 'Plugin must be initialised before using method: ' + methodOrOptions );
		
		// CASE: invalid method
		}
		else if ( methodOrOptions.indexOf('_') == 0 ) {
			$.error( 'Method ' +  methodOrOptions + ' is private!' );
		}
		else {
			$.error( 'Method ' +  methodOrOptions + ' does not exist.' );
		}
	};
})(jQuery, window, document);