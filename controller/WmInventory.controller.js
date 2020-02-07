sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	var zController;
	var GlobalFuncs = sap.ui.controller("smud.org.wmLM01.controller.GlobalFuncs");

	return Controller.extend("smud.org.wmLM01.controller.WmInventory", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf smud.org.wmLM01.view.WmInventory
		 */
		onInit: function() {
			zController = this;
			this.getView().setModel();
		},
		goBack: function() {
			window.history.go(-1);
		},
		uppercase: function(oEvent) {
			GlobalFuncs.uppercase(oEvent);
		},
		scan: function(oEvent) {
			GlobalFuncs.scan(oEvent);
		},
		liveChangeBinConfirm: function(oEvent){
			zController.uppercase(oEvent);
			
		}
		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf smud.org.wmLM01.view.WmInventory
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf smud.org.wmLM01.view.WmInventory
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf smud.org.wmLM01.view.WmInventory
		 */
		//	onExit: function() {
		//
		//	}

	});

});