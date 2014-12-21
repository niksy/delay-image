var $ = require('jquery');

module.exports = {
	$doc: $(document),
	setup: function () {
		this.$el = $(this.element);

		this.$el.addClass(this.options.classes.image);
	},
	destroy: function () {
		$.each(this.options.classes, $.proxy(function ( prop, className ) {
			this.$el.removeClass(className);
		}, this));
	}
};
