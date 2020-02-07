sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel"
], function(Controller, MessageToast, JSONModel) {
	"use strict";

	var GlobalFuncs = sap.ui.controller("smud.org.wmLM01.controller.GlobalFuncs");
	var zController;

	return Controller.extend("smud.org.wmLM01.controller.GiUnplanned", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf smud.org.wmLM01.view.GiUnplanned
		 */
		onInit: function() {
			zController = this;
			var oModel = sap.ui.getCore().getModel("GiUnplanned");
			this.getView().setModel(oModel);
			//this.createTable();
		},
		checkNumber: function(oEvent) {
			GlobalFuncs.checkNumber(oEvent, 12);
		},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf smud.org.wmLM01.view.GiUnplanned
		 */
		//	onBeforeRendering: function() {
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf smud.org.wmLM01.view.GiUnplanned
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf smud.org.wmLM01.view.GiUnplanned
		 */
		//	onExit: function() {
		//
		//	}
		goToUnplannedItem: function() {
			sap.ui.core.BusyIndicator.show(0);
			var oModel = this.getView().getModel();
			// Validate missing fields
			var lgnum = oModel.getProperty("/items/0/Lgnum");
			if (!oModel.getProperty("/items/0/Lgnum")) {
				GlobalFuncs.showMessage("Info", "Enter a Warehouse");
				sap.ui.core.BusyIndicator.hide();
				return;
			} else if (!oModel.getProperty("/items/0/Aufnr")) {
				GlobalFuncs.showMessage("Info", "Enter a Work Order number");
				sap.ui.core.BusyIndicator.hide();
				return;
			}
			// Show/hide Vendor field
			if (!oModel.getProperty("/items/0/Lifnr")) {
				oModel.setProperty("/items/0/vendorExists", false);
			} else {
				oModel.setProperty("/items/0/vendorExists", true);
			}

			// Clear some fields
			oModel.setProperty("/items/0/itemNumberText", "1 of 1");
			oModel.setProperty("/items/0/Lgpla", "");
			oModel.setProperty("/items/0/Matnr", "");
			oModel.setProperty("/items/0/Menge", 0);
			oModel.setProperty("/items/0/Maktg", "");
			oModel.setProperty("/items/0/Meins", "");
			oModel.setProperty("/items/0/Sgtxt", "");

			var vendor = oModel.getProperty("/items/0/Lifnr");
			var order = oModel.getProperty("/items/0/Aufnr");

			var url = "/sap/opu/odata/sap/ZWM_GI_UNPLANNED_SRV/ValidateOrderSet(Aufnr='" + order + "',Lifnr='" + vendor + "')";
			$.ajax({
				url: url,
				type: "GET",
				dataType: "json",
				success: function(result, status, xhr) {
						var item = oModel.getProperty("/items/0");
						item.Matnr = "";
						item.Maktg = "";
						item.Meins = "";
						item.Menge = "";
						item.Verme = "";
						item.Lgpla = "";
						item.Sgtxt = "";
						item.Lgtyp = "";
						var itemModel = sap.ui.getCore().getModel("GiUnplannedItem");
						itemModel.setProperty("/", item); 
					sap.ui.core.BusyIndicator.hide();
					sap.ui.core.UIComponent.getRouterFor(zController).navTo("GiUnplannedItem");
				},
				error: GlobalFuncs.onAjaxError
			});
		}, 
		uppercase: function(oEvent) {
			GlobalFuncs.uppercase(oEvent);
		},
		goBack: function() {
			window.history.go(-1);
		},
		scan: function(oEvent) {
			GlobalFuncs.scan(oEvent);
		},
		uppercaseNoSpecial: function(oEvent) {
			GlobalFuncs.uppercaseNoSpecial(oEvent);
		}
	});

});