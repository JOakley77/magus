$(function () {
	test( "should provide no conflict", function () {
		var magus = $.fn.magus.noConflict();
		ok(!$.fn.magus, 'magus was set back to undefined (org value)');
        $.fn.magus = magus;
	});
});