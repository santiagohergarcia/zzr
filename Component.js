sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"smud/org/wmLM01/model/models"
], function(UIComponent, Device, models) {
	"use strict";

	return UIComponent.extend("smud.org.wmLM01.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function() {

			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// set the device model
			this.setModel(models.createDeviceModel(), "device");

			// Create the main model for the app
			models.createAppModel();

			// create the views based on the url/hash
			this.getRouter().initialize();

		},
		destroy: function() {
			UIComponent.prototype.destroy.apply(this, arguments);
		}
	});
});