/*!
Package: magus (www.jasonthedev.com/plugins/magus)
Version: 1.0.0
Last updated: 2013-08-03
* Author: Jason Oakley <magus@jasonthedev.com>;
* Website: www.jasonthedev.com */
if (!jQuery) { throw new Error("Bootstrap requires jQuery") }

+function ($) { "use strict";
    
    var Magus = function ( target, options ) {
        this.$element       = $( target );
        this.options        = $.extend( {}, Magus.DEFAULTS, options );
        this.proxy      = $.proxy( this.$element, this );

        // set global scope
        var $scope  = {};
        $scope.this = this;
        $scope.el   = this.$element;

        // setup data attributes
        if ( this._isDefined( this.$element.data( 'defaultPanel' ) ) ) this.options.active = this.$element.data( 'defaultPanel' );
        if ( this._isDefined( this.$element.data( 'disablePanels' ) ) ) this.options.disable_nonactive = this.$element.data( 'disablePanels' );

        // reference the steps
        var steps = this.options.manage_steps ? this.$element.find( this.options.sel_steps ) : null;

        // set an initial state for the last active node
        this.last = this.options.active;

        // setup accordion panels
        this.$element.panels = [];
        $.each( this.$element.find( this.options.bs_sel_group ), function( i, el ) {
            var panel = $( el );

            // panel setup
            $scope.el.panels.push({
                index       : i,
                acc_panel   : panel,
                acc_body    : panel.find( $scope.this.options.bs_sel_body ),
                target      : panel.find( $scope.this.options.bs_sel_toggle ).attr( 'href' ),
                step        : steps !== undefined ? steps.find( $scope.this.options.steps_node_element ).eq( i ) : null,
                active      : i === $scope.this.options.active ? true : false,
                disabled    : i === $scope.this.options.active ? false : $scope.this.options.disable_nonactive,
                completed   : false
            });

            if ( $scope.el.panels[i].active === true ) {
                $scope.this.active = $scope.el.panels[i];
                $scope.this.show( i );
            }

            if ( $scope.el.panels[i].disabled === true )
                $scope.this.disabled( i, true );
        });

        if ( this.options.disable_toggle ) {
            $( document ).off( 'click.bs.collapse.data-api' );
            $( document ).on( 'click.bs.collapse.data-api', '[data-toggle="collapse"]', function( e ) {
                e.isDefaultPrevented = true;
                e.preventDefault();
                e.stopPropagation();
                return false;
            });
        }
    };

    Magus.DEFAULTS = {
        
        /* Magus Options
        ================================= */
        debug                   : false,    // show debug messages
        active                  : 0,        // the active panel
        disable_nonactive       : true,     // will disable the non-active panels
        disable_toggle          : true,     // disable toggling the panel on panel heading click
        collapse_active_on_show : true,     // collapse the active panel before showing the next panel
        show_icons              : true,     // show icons

        /* Magus Selectors
        ================================= */
        magus                   : '.magus',

        /* Magus states, icons and options
        ================================= */
        sel_disabled            : '.magus-disabled',
        icon_disabled           : '<span class="glyphicon glyphicon-ban-circle"></span>',
        enable_disabled_icon    : true,

        sel_active              : '.magus-active',
        icon_active             : '<span class="glyphicon glyphicon-pushpin"></span>',
        enable_active_icon      : true,

        sel_inactive            : '.magus-inactive',
        icon_inactive           : '<span class="glyphicon glyphicon-ok"></span>',
        enable_inactive_icon    : true,

        sel_completed           : '.magus-completed',
        icon_completed          : '<span class="glyphicon glyphicon-ok-circle"></span>',
        enable_completed_icon   : true,

        sel_alert               : '.magus-alert',
        icon_alert              : '<span class="glyphicon glyphicon-warning-sign"></span>',
        enable_alert_icon       : true,

        /* Steps
        ================================= */
        manage_steps            : true,
        sel_steps               : '.magus-steps',
        steps_node_element      : 'li',

        /* Bootstrap Collapse Selectors
        ================================= */
        bs_sel_group            : '.accordion-group',
        bs_sel_heading          : '.accordion-heading',
        bs_sel_toggle           : '.accordion-toggle',
        bs_sel_body             : '.collapse',

        /* Triggers
        ================================= */
        trigger_goto            : '[data-goto]',
        trigger_prev            : '[data-goto="prev"]',
        trigger_next            : '[data-goto="next"]',
        trigger_hide            : '[data-hide]',
        trigger_show            : '[data-show]',
        trigger_alert           : '[data-alert]',
        trigger_disable         : '[data-disable]'
    };

    /*  Helper function to check if 
        string is defined or undefined
    ========================================= */
    Magus.prototype._isDefined = function( s )
    {
        return s !== undefined ? true : false;
    };

    /*  Clean selector
    ========================================= */
    Magus.prototype._cleanSelector = function( selector )
    {
        return selector.replace( '.', '' );
    };

    /* Set Icon
    ================================ */
    Magus.prototype._setIcon = function( idx, action )
    {
        var requested = this.$element.panels[ parseInt( idx, 10 ) ],
            icon, append_to;

        if ( ! this.options.show_icons ) return;

        switch( action ) {
            case 'disabled':
                icon = this.options.enable_disabled_icon === true ? this.options.icon_disabled : null;
                break;
            case 'active':
                icon = this.options.enable_active_icon === true ? this.options.icon_active : null;
                break;
            case 'inactive':
                icon = this.options.enable_inactive_icon === true ? this.options.icon_inactive : null;
                break;
            case 'completed':
                icon = this.options.enable_completed_icon === true ? this.options.icon_completed : null;
                break;
            case 'alert':
                icon = this.options.enable_alert_icon === true ? this.options.icon_alert : null;
                break;
        }

        if ( icon ) {
            var el = requested.acc_panel.find( this.options.bs_sel_toggle );
            el.html( icon + el.html().replace( /<\/?[^>]+(>|$)/g, '' ) );
        }
    };

    /* Return active panel object
    ================================ */
    Magus.prototype.getActivePanel = function()
    {
        return $.grep( this.$element.panels, function( e ) { return e.active; } )[0];
    };

    /* Set Alert Class
    ================================ */
    Magus.prototype.setAlert = function( idx )
    {
        var requested = $scope.element.nodes[ parseInt( idx, 10 ) ];

        if ( requested !== undefined ) {
            requested.element.addClass( $scope.plugin._cleanSelector( $scope.options.alert_class ) );
            requested.step.addClass( $scope.plugin._cleanSelector( $scope.options.alert_class ) );
            scope.plugin._setIcon( parseInt( idx, 10 ), 'alert' );
        }
        return $scope.plugin;
    };

    /* Set Complete Class
    ================================ */
    Magus.prototype.setComplete = function( idx, state )
    {
        var requested = this.$element.panels[ parseInt( idx, 10 ) ];

        // set completed
        if ( state !== undefined && state === true ) {
            requested.completed = true;
            requested.acc_panel.addClass( this._cleanSelector( this.options.sel_completed ) );
            requested.step.addClass( this._cleanSelector( this.options.sel_completed ) );
        }

        // unset completed
        if ( state !== undefined && state === false ) {
            requested.completed = false;
            requested.acc_panel.removeClass( this._cleanSelector( this.options.sel_completed ) );
            requested.step.removeClass( this._cleanSelector( this.options.sel_completed ) );
        }
        return this;
    };

    /* Show Panel
    ================================ */
    Magus.prototype.show = function( idx )
    {
        var requested = this.$element.panels[ parseInt( idx, 10 ) ];

        requested.active = true;
        requested.acc_panel
            .removeClass( this._cleanSelector( this.options.sel_inactive ) )
            .addClass( this._cleanSelector( this.options.sel_active ) );
        this._setIcon( parseInt( idx, 10 ), 'active' );

        // enable requested sidebar node
        requested.step
            .removeClass( this._cleanSelector( this.options.sel_inactive ) )
            .addClass( this._cleanSelector( this.options.sel_active ) );

        this.active = requested;
        
        requested.acc_body.collapse( 'show' );

        return this;
    };

    /* Hide Panel
    ================================ */
    Magus.prototype.hide = function( idx )
    {
        var requested   = this.$element.panels[ parseInt( idx, 10 ) ];

        // inactivate req acc panel
        requested.active = false;
        requested.acc_panel
            .addClass( this._cleanSelector( this.options.sel_inactive ) )
            .removeClass( this._cleanSelector( this.options.sel_active ) )
            .removeClass( this._cleanSelector( this.options.sel_alert ) );
        this._setIcon( parseInt( idx, 10 ), 'inactive' );
        requested.acc_body.collapse( 'hide' );

        // inactivate req sb node
        requested.step
            .addClass( this._cleanSelector( this.options.sel_inactive ) )
            .removeClass( this._cleanSelector( this.options.sel_active ) )
            .removeClass( this._cleanSelector( this.options.sel_alert ) );

        return this;
    };

    /* Set Panel as Disabled
    ================================ */
    Magus.prototype.disabled = function( idx, state )
    {
        var requested   = this.$element.panels[ parseInt( idx, 10 ) ];

        // set disabled
        if ( state !== undefined && state === true ) {
            requested.disabled = true;
            requested.acc_panel.addClass( this._cleanSelector( this.options.sel_disabled ) );
            requested.step.addClass( this._cleanSelector( this.options.sel_disabled ) );
            this._setIcon( parseInt( idx, 10 ), 'disabled' );
        }

        // unset disabled
        if ( state !== undefined && state === false ) {
            requested.disabled = false;
            requested.acc_panel.removeClass( this._cleanSelector( this.options.sel_disabled ) );
            requested.step.removeClass( this._cleanSelector( this.options.sel_disabled ) );
        }
        return this;
    };

    /* Go To Panel (by index)
    ================================ */
    Magus.prototype.goto = function( idx, completed )
    {
        var set_complete    = true,
            requested       = this.$element.panels[ parseInt( idx, 10 ) ];

        if ( requested !== undefined ) {
            this.disabled( idx, false );

            if ( completed !== undefined && completed === false ) set_complete = false;

            this.setComplete( this.active.index, set_complete );
            this.hide( this.active.index );
            this.show( requested.index );
        }
        return this;
    };

    /* Plugin Definition
    ================================ */
    var old = $.fn.magus;
    
    $.fn.magus = function( option ) {
        return this.each( function() {
            var $this   = $( this ),
                data    = $this.data( 'bs.plugin.magus' ),
                options = $.extend( {}, Magus.DEFAULTS, $this.data(), typeof option === 'object' && option );

            if ( ! data ) $this.data( 'bs.plugin.magus', ( data = new Magus( this, options ) ) );
            if ( typeof option === 'string' ) data[ option ]();
        });
    };

    $.fn.magus.Constructor = Magus;

    // Magus > NO CONFLICT
    // ====================
    $.fn.magus.noConflict = function () {
        $.fn.magus = old;
        return this;
    };

    /* Data API & Listeners
    ================================ */
    $( document ).on( 'click.bs.plugin.magus.data-api', '[data-goto], .magus-steps a', function( e ) {
        var $target     = $( this ),
            $value      = $target.data( 'goto' ),
            $scope      = $target.closest( '.magus' ).data( 'bs.plugin.magus' ),
            requested;

        // sidebar clicks
        if ( $value === undefined ) {
            var panel_requested = $.grep( $scope.$element.panels, function( e ) { return e.target === $target.attr( 'href' ); } )[0];

            if ( typeof panel_requested === 'object' ) {
                if ( panel_requested.disabled ) return false;
                requested = panel_requested.index;
            }
        }

        // previous panel
        else if ( $value === 'prev' ) 
            requested = ( $scope.active.index - 1 ) < 0 ? 0 : ( $scope.active.index - 1 );
        
        // next panel
        else if ( $value === 'next' )
            requested = $scope.active.index !== ( $scope.$element.panels.length - 1 ) ? ( $scope.active.index + 1 ) : $scope.active.index;
        
        // go directly to panel by panel index
        else 
            requested = parseInt( $target.data( 'goto' ), 10 );

        if ( requested === $scope.getActivePanel().index ) return false;

        $scope.goto( requested );
        e.preventDefault();
    });

    $( window ).on( 'load', function() {
        var $scope = {};

        $( '[data-magus]' ).each( function() {
            var $magus = $( this );
            $magus.magus( $magus.data() );
        });
    });

}(window.jQuery);