/*!
Package: magus (www.jasonthedev.com/plugins/magus)
Version: 1.0.0
Last updated: 2013-08-01
* Author: Jason Oakley <magus@jasonthedev.com>;
* Website: www.jasonthedev.com */
if (!jQuery) { throw new Error("Bootstrap requires jQuery") }

(function( $, window, document, undefined ){
    
    var PLUGIN_NS = 'magus';
    
    var Plugin = function ( target, options ) {

        var DEFAULT_OPTIONS = {

            debug                   : false,

            // panel options
            active_panel            : 0,
            disable_panels          : true,
            height                  : null,
            panel_height            : null,
            active_can_close        : false,
            set_active_completed_on_show    : true,     // will mark the current panel as completed before showing the next panel
            collapse_active_on_show : true,             // collapse the active panel before showing the next panel
            disable_bs_transition   : true,
            show_icons              : true,

            // accordion classes
            acc_group_class         : '.accordion-group',
            acc_heading_class       : '.accordion-heading',
            acc_toggle_class        : '.accordion-toggle',
            acc_collapsible_class   : '.collapse',

            // accordion state classes
            disabled_class          : '.magus-disabled',
            disabled_icon_class     : 'glyphicon glyphicon-ban-circle',
            show_disabled_icon      : true,

            active_class            : '.magus-active',
            active_icon_class       : 'glyphicon glyphicon-pushpin',
            show_active_icon        : true,

            inactive_class          : '.magus-inactive',
            inactive_icon_class     : 'glyphicon glyphicon-ok',
            show_inactive_icon      : true,

            completed_class         : '.magus-completed',
            completed_icon_class    : 'glyphicon glyphicon-ok-circle',
            show_completed_icon     : true,

            alert_class             : '.magus-alert',
            alert_icon_class        : 'glyphicon glyphicon-warning-sign',
            show_alert_icon         : true,

            // button classes
            trigger_goto            : '[data-goto]',
            trigger_prev            : '[data-goto="prev"]',
            trigger_next            : '[data-goto="next"]',
            trigger_hide            : '[data-hide]',
            trigger_show            : '[data-show]',
            trigger_alert           : '[data-alert]',
            trigger_disable         : '[data-disable]',

            // steps options
            show_steps              : true,
            steps_position          : 'top',
            steps_node_element      : 'li',
            steps_class             : '.magus-steps',

            // public callbacks
            init        : function() {},    // when the plugin initializes
        };

        this.options    = $.extend( true, DEFAULT_OPTIONS, options );
        this.magus      = $( target );
        this.steps      = $( this.steps_class );
        this._init( target, options );
        window.magus    = this;
        return this;
    };

    Plugin.prototype._cleanSelector = function( selector )
    {
        return selector.replace( '.', '' );
    };

    // Magus > INITIALIZATION
    // ====================
    Plugin.prototype._init = function ( target, options )
    {
        // initialize panels
        this._setup();

        // if height option is passed
        if ( this.options.height !== null ) this.setAccordionHeight( this.options.height );

        // user supplied callback
        this._hook( 'init', this );

        // start listeners
        this._setupListeners();
    };

    // Magus > SETUP
    // ====================
    Plugin.prototype._setup = function()
    {
        var plugin      = this,
            self        = this.magus,
            options     = this.options,
            height      = 0;

        if ( self.data( 'defaultPanel' ) !== undefined ) {
            options.active_panel = self.data( 'defaultPanel' );
        }

        if ( self.data( 'disablePanels' ) !== undefined ) {
            options.disable_panels = self.data( 'disablePanels' );
        }

        if ( options.disable_bs_transition === true ) {
            $.fn.collapse.Constructor.prototype.transition = function() {
                return false;
            };
        }

        // set an initial state for `last_active`
        self.last_active = options.active_panel;

        // setup accordion panels
        self.nodes = [];
        $.each( self.find( options.acc_group_class ), function( i, p ) {
            var panel = $( p );

            self.nodes.push({
                index       : i,
                element     : panel,
                collapsible : panel.find( options.acc_collapsible_class ),
                target      : panel.find( options.acc_toggle_class ).attr( 'href' ),
                step        : null,
                active      : i === options.active_panel ? true : false,
                disabled    : i === options.active_panel ? false : options.disable_panels,
                completed   : false
            });
        });

        // setup steps
        if ( options.show_steps === true ) {

            // set steps
            plugin.steps = $( options.steps_class );

            $.each( plugin.steps.find( options.steps_node_element ), function( i, n ) {
                var step_node   = $( n ),
                    panel_node  = $.grep( self.nodes, function( e ) { return e.target === step_node.find( 'a' ).attr( 'href' ); } );

                // attach step node to panel node
                self.nodes[panel_node[0].index].step = step_node;

                // SETUP > active node
                if ( self.nodes[panel_node[0].index].active === true ) step_node.addClass( plugin._cleanSelector( options.active_class ) );
           
                // SETUP > disabled node
                if ( self.nodes[panel_node[0].index].disabled === true ) step_node.addClass( plugin._cleanSelector( options.disabled_class ) );
                
                // SETUP > completed node
                if ( self.nodes[panel_node[0].index].completed === true ) step_node.addClass( plugin._cleanSelector( options.completed_class ) );
            });
        }

        // setup css classes on both panels & steps
        $.each( self.nodes, function( i, n ) {
            if ( n.active === true ) plugin.show( i );
            if ( n.disabled === true ) plugin.setDisabled( n.index, true );
        });

        // setup pagination
        if ( plugin.getActivePanel().index === 0 )
            $( options.trigger_prev ).attr( 'disabled', 'disabled' );
        else if ( plugin.getActivePanel().index === ( self.nodes.length - 1 ) )
            $( options.trigger_next ).attr( 'disabled', 'disabled' );

        // if panel_height option is passed
        if ( options.panel_height !== null ) plugin.setPanelHeight( options.active_panel, options.panel_height );
    };

    // Magus > USER DEFINED HOOKS
    // ====================
    Plugin.prototype._hook = function( name )
    {
        var args = arguments;
        if ( this.options[ name ] !== undefined ) {
            var fn  = this.options[name];
            args[0] = this.self;
            return fn.apply( this, args );
        }
    };

    Plugin.prototype.getActivePanel = function()
    {
        return $.grep( this.magus.nodes, function( e ) { return e.active; } )[0];
    };

    // Plugin.prototype._getOption = function( opt )
    // {
    //     if ( this.options[opt] !== undefined )
    //         return this.options[opt];
    // };

    // Magus > SET ICON
    // ====================
    Plugin.prototype._setIcon = function( idx, action )
    {
        var plugin      = this,
            self        = this.magus,
            panels      = {
                requested   : self.nodes[ idx ]
            },
            icon, append_to;

        switch( action ) {
            case 'disabled':
                icon = this.options.show_icons === true || this.options.show_disabled_icon === true ? this.options.disabled_icon_class : null;
                break;
            case 'active':
                icon = this.options.show_icons === true || this.options.show_active_icon === true ? this.options.active_icon_class : null;
                break;
            case 'inactive':
                icon = this.options.show_icons === true || this.options.show_inactive_icon === true ? this.options.inactive_icon_class : null;
                break;
            case 'completed':
                icon = this.options.show_icons === true || this.options.show_completed_icon === true ? this.options.completed_icon_class : null;
                break;
            case 'alert':
                icon = this.options.show_icons === true || this.options.show_alert_icon === true ? this.options.alert_icon_class : null;
                break;
        }

        if ( icon !== null ) {
            var el      = panels.requested.element.find( this.options.acc_toggle_class ),
                span    = el.find( 'span' );

            if ( span !== undefined && span.length > 0 ) span.remove();

            el.prepend( '<span class="' + icon + '"></span>' );
        }
    };

    // Magus > SETUP EVENT LISTENERS
    // ====================
    Plugin.prototype._setupListeners = function()
    {
        var plugin  = this,
            self    = this.magus,
            options = this.options;

        // button event > GOTO - direct|pagination
        $( document ).on( 'click', options.trigger_goto, function( e ) {
            var $target = $( e.currentTarget ),
                $value  = $target.data( 'goto' ),
                panels  = {
                    active      : plugin.getActivePanel(),
                    requested   : 0
                };

            // set panels.requested based on prev/next
            if ( $value === 'prev' && panels.active.index !== 0 ) {
                panels.requested = ( panels.active.index - 1 );
            }
            else if ( $value === 'next' && panels.active.index !== ( self.nodes.length - 1 ) ) {
                panels.requested = ( panels.active.index + 1 );
            }
            else {
                panels.requested = parseInt( $target.data( 'goto' ), 10 );
            }

            plugin.setGoTo( panels.requested );
        });

        // button event > HIDE
        $( document ).on( 'click', options.trigger_hide, function( e ) {
            var $target = $( e.currentTarget ),
                $value  = $target.data( 'hide' ),
                panels  = {
                    active      : plugin.getActivePanel(),
                    requested   : 0
                };

            console.log( 'hide' );
            
            if ( $value === 'current' ) panels.requested = panels.active.index;
            else panels.requested = parseInt( $value, 10 );

            self.last_active = panels.requested;
            plugin.hide( panels.requested );
            return false;
        });

        // button event > SHOW
        $( document ).on( 'click', options.trigger_show, function( e ) {
            var $target = $( e.currentTarget ),
                $value  = $target.data( 'show' ),
                panels  = {
                    active      : plugin.getActivePanel(),
                    last_active : self.last_active,
                    requested   : 0
                };

            console.log( self );
            console.log( self.last_active );
            console.log( panels.last_active );
            console.log( $value );
            console.log( parseInt( $value, 10 ) );
            
            if ( $value === 'last' ) panels.requested = panels.last_active;
            else panels.requested = parseInt( $value, 10 );

            console.log( '-',panels.requested );

            plugin.show( panels.requested );
            return false;
        });

        // button event > DISABLE
        $( document ).on( 'click', options.trigger_disable, function( e ) {
            var $target = $( e.currentTarget );
            console.log( 'disable this' );
            plugin.setDisabled( parseInt( $target.data( 'disable' ), 10 ), true );
        });

        // button event > ALERT
        $( document ).on( 'click', options.trigger_alert, function( e ) {
            var $target = $( e.currentTarget );
            plugin.setAlert( parseInt( $target.data( 'alert' ), 10 ) );
        });

        // // click event on accordion heading
        // $( document ).on( 'click', options.trigger_goto, function( e ) {
        //     var $target = $( e.currentTarget );

        //     e.preventDefault();
        //     e.stopPropagation();

        //     // disable requested panel but no navigation
        //     if ( $target.data( 'disable' ) !== undefined && $target.data( 'disable' ) === true ) {
        //         plugin.disable( $target.data( 'panel' ), true );
        //     }

        //     // enable requested panel but no navigation
        //     else if ( $target.data( 'disable' ) !== undefined && $target.data( 'disable' ) === false ) {
        //         plugin.disable( $target.data( 'panel' ), false );
        //     }

        //     // navigate to requested panel
        //     else {
        //         plugin.setGoTo( $target.data( 'goto' ), $target.data( 'completed' ) );
        //     }
        // });

        // stop propagation on disabled elements
        // $( this.options.acc_toggle_class ).on( 'click', function( e ) {

        //     var self    = window.awizard,
        //         $target = $( e.currentTarget ),
        //         $group  = $target.closest( self.options.acc_group_class ),
        //         $index  = $.grep( self.self.nodes, function( e ) { return e.target === $target.attr( 'href' ); } );

        //     e.preventDefault();
        //     e.stopPropagation();

        //     if ( $group.hasClass( self.options.disabled_class.replace( '.', '' ) ) || self.options.active_can_close === false ) {
        //         return false;
        //     }

        //     self.show( $index[0].index );
        //     return false;
        // });

        // listen for sidebar node click
        // $( this.options.sidebar_class + ' ' + this.options.sidebar_node_elem + ' a' ).on( 'click', function( e ) {

        //     var self    = window.awizard,
        //         $target = $( e.currentTarget ),
        //         $group  = $target.closest( self.options.acc_group_class ),
        //         $index  = $.grep( self.self.nodes, function( e ) { return e.target === $target.attr( 'href' ); } );

        //     e.preventDefault();
        //     e.stopPropagation();

        //     if ( $index[0].disabled === true || self.options.active_can_close === false ) {
        //         return false;
        //     }

        //     self.show( $index[0].index );
        // });
    };

    Plugin.prototype.setPanelHeight = function( idx, height )
    {
        var self        = this.magus
        self.nodes[ idx ].collapsible.height( parseInt( height, 10 ) );
        return self;
    };

    Plugin.prototype.setAccordionHeight = function( height )
    {
        this.magus.height( parseInt( height, 10 ) );
        return this.self;
    };

    Plugin.prototype.setAlert = function( idx )
    {
        var plugin      = this,
            self        = this.magus,
            options     = this.options,
            req_panel   = self.nodes[ idx ];

        if ( req_panel !== undefined ) {
            req_panel.element.addClass( plugin._cleanSelector( options.alert_class ) );
            req_panel.step.addClass( plugin._cleanSelector( options.alert_class ) );
            plugin._setIcon( idx, 'alert' );
        }
        return self;
    };

    Plugin.prototype.setDisabled = function( idx, state )
    {
        var plugin      = this,
            self        = this.magus,
            options     = this.options,
            req_panel   = self.nodes[ idx ];

        if ( req_panel !== undefined ) {

            // set disabled
            if ( state !== undefined && state === true ) {
                req_panel.disabled = true;
                req_panel.element.addClass( plugin._cleanSelector( options.disabled_class ) );
                req_panel.step.addClass( plugin._cleanSelector( options.disabled_class ) );
                plugin._setIcon( idx, 'disabled' );
                
                // user supplied hook after a panel has been disabled
                plugin._hook( 'onDisable' );
            }

            // unset disabled
            if ( state !== undefined && state === false ) {
                req_panel.disabled = false;
                req_panel.element.removeClass( plugin._cleanSelector( options.disabled_class ) );
                req_panel.step.removeClass( plugin._cleanSelector( options.disabled_class ) );

                // user supplied hook after a panel has been disabled
                plugin._hook( 'onEnable' );
            }
        }
        return self;
    };

    Plugin.prototype.complete = function( idx, state )
    {
        var plugin      = this,
            self        = this.magus,
            options     = this.options,
            req_panel   = self.nodes[ idx ];

        if ( req_panel !== undefined ) {

            // set completed
            if ( state !== undefined && state === true ) {
                req_panel.completed = true;
                req_panel.element.addClass( plugin._cleanSelector( options.completed_class ) );
                req_panel.step.addClass( plugin._cleanSelector( options.completed_class ) );
            }

            // unset completed
            if ( state !== undefined && state === false ) {
                req_panel.completed = false;
                req_panel.element.removeClass( plugin._cleanSelector( options.completed_class ) );
                req_panel.step.removeClass( plugin._cleanSelector( options.completed_class ) );
            }

            // user supplied hook after a panel has been set as complete
            plugin._hook( 'onComplete' );
        }
        return this.self;
    };

    Plugin.prototype.show = function( idx )
    {
        var plugin      = this,
            self        = this.magus,
            options     = this.options,
            panels      = {
                active      : $.grep( self.nodes, function( e ) { return e.active; } )[0],
                requested   : self.nodes[ idx ]
            };

        // hide the current panel
        if ( options.collapse_active_on_show === true && plugin.getActivePanel() !== undefined ) plugin.hide( panels.active.index );

        // user supplied hook before showing the panel
        plugin._hook( 'beforeShow', panels.active, panels.requested );

        // enable the requested panel
        panels.requested.active = true;
        panels.requested.element
            .removeClass( plugin._cleanSelector( options.inactive_class ) )
            .addClass( plugin._cleanSelector( options.active_class ) );
        panels.requested.element = $( options.acc_group_class ).eq( panels.requested.index );
        plugin._setIcon( idx, 'active' );
        panels.requested.collapsible.collapse( 'show' );

        // enable the requested sidebar node
        panels.requested.step
            .removeClass( plugin._cleanSelector( options.inactive_class ) )
            .addClass( plugin._cleanSelector( options.active_class ) );

        // set pagination buttons
        $.each( $( options.trigger_prev ), function() {
            if ( panels.requested.index !== 0 ) $( this ).removeAttr( 'disabled' );
            else $( this ).attr( 'disabled', 'disabled' );
        });

        $.each( $( options.trigger_next ), function() {
            if ( panels.requested.index !== ( self.nodes.length - 1 ) ) $( this ).removeAttr( 'disabled' );
            else $( this ).attr( 'disabled', 'disabled' );
        });

        // if panel_height option is passed
        if ( options.panel_height !== null ) plugin.setPanelHeight( panels.requested.index, options.panel_height );

        // user supplied hook after showing the panel
        plugin._hook( 'afterShow', plugin, panels.active, panels.requested );
        return this.self;
    };

    Plugin.prototype.hide = function( idx )
    {
        var plugin      = this,
            self        = this.magus,
            options     = this.options,
            panels      = {
                active      : $.grep( self.nodes, function( e ) { return e.active; } ),
                requested   : self.nodes[ idx ]
            };

        // deactivate the panel
        if ( panels.requested !== undefined ) {

            // user supplied hook before hiding the panel
            plugin._hook( 'beforeHide' );

            panels.requested.active = false;
            panels.requested.element
                .addClass( plugin._cleanSelector( options.inactive_class ) )
                .removeClass( plugin._cleanSelector( options.active_class ) )
                .removeClass( plugin._cleanSelector( options.alert_class ) );
            panels.requested.element = $( options.acc_group_class ).eq( panels.requested.index );
            plugin._setIcon( idx, 'inactive' );   
            panels.requested.collapsible.collapse( 'hide' );

            // inactive sidebar node
            panels.requested.step
                .addClass( plugin._cleanSelector( options.inactive_class ) )
                .removeClass( plugin._cleanSelector( options.active_class ) )
                .removeClass( plugin._cleanSelector( options.alert_class ) );

            // if panel_height option is passed
            if ( options.panel_height !== null ) plugin.setPanelHeight( panels.requested.index, 0 );

            // user supplied hook after hiding the panel
            plugin._hook( 'afterHide' );
        }
        return self;
    };

    Plugin.prototype.setGoTo = function( idx, completed )
    {
        var plugin      = this,
            self        = this.magus,
            options     = this.options,
            panels      = {
                active      : $.grep( self.nodes, function( e ) { return e.active; } ),
                requested   : self.nodes[ idx ]
            },
            set_complete= true;

        if ( panels.requested !== undefined ) {
            plugin.setDisabled( idx, false );

            if ( completed !== undefined && completed === false ) set_complete = false;

            plugin.complete( panels.active[0].index, set_complete );

            plugin.show( panels.requested.index );
        }
        return self;
    };

    var old = $.fn.magus;

    // Magus > PLUGIN DEFINITION
    // ====================
    $.fn[ PLUGIN_NS ] = function( methodOrOptions ) {
        if ( ! $(this).length ) {
            return $( this );
        }
        var instance = $( this ).data( PLUGIN_NS );
            
        // CASE: action method (public method on PLUGIN class)        
        if ( instance 
                && methodOrOptions.indexOf('_') !== 0 
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
            $.error( 'Plugin must be initialized before using method: ' + methodOrOptions );
        
        // CASE: invalid method
        }
        else if ( methodOrOptions.indexOf('_') === 0 ) {
            $.error( 'Method ' +  methodOrOptions + ' is private!' );
        }
        else {
            $.error( 'Method ' +  methodOrOptions + ' does not exist.' );
        }
    };

    // Magus > NO CONFLICT
    // ====================
    $.fn.magus.noConflict = function () {
        $.fn.magus = old;
        return this;
    };
})(jQuery, window, document);