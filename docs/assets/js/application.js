// NOTICE!! DO NOT USE ANY OF THIS JAVASCRIPT
// IT'S ALL JUST JUNK FOR THE DOCS!
// ++++++++++++++++++++++++++++++++++++++++++

!function( $ ) {
    $(function() {
        var APP  = {
            window  : $( window ),
            body    : $( document.body ),
            navHeight   : $( '.navbar' ).outerHeight( true ) + 10
        };

        APP.body.scrollspy({
            target  : '.bs-sidebar',
            offset  : APP.navHeight
        });

        $( '.bs-docs-container [href=#]' ).click( function( e ) {
            e.preventDefault();
        });

        APP.body.on( 'click', '.bs-sidenav [href^=#]', function( e ) {
            var $target = $( this.getAttribute( 'href' ) );
            e.preventDefault();
            AP.window.scrollTop( $target.offset().top - APP.navHeight + 5 );
        });

        // back to top
        setTimeout( function() {
            var $sideBar = $( '.bs-sidebar' );

            $sideBar.affix({
                offset  : {
                    top : function() {
                        var offsetTop   = $sideBar.offset().top,
                            sideBarMargin   = parseInt( $sideBar.children( 0 ).css( 'margin-top' ), 10 ),
                            navOuterHeight  = $( '.bs-docs-nav' ).height();

                        return ( this.top = offsetTop - navOuterHeight - sideBarMargin );
                    },
                    bottom  : function() {
                        return ( this.bottom = $( '.bs-footer' ).outerHeight( true ) );
                    }
                }
            });
        }, 100 );

        setTimeout( function() {
            $( '.bs-top' ).affix();
        }, 100 );

        // Examples

        // Basic
        $( '#magus_basic_example' ).magus();
    });
}( window.jQuery );