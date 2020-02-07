sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	var zController;

	return Controller.extend("smud.org.wmLM01.controller.GlobalFuncs", {

		showMessage: function(title, message, type, callback) {
			$.sap.require("sap.m.MessageBox");
			sap.ui.define(["sap/m/MessageBox"], function(MessageBox) {
				if (!type) {
					type = MessageBox.Icon.INFORMATION;
				}
				MessageBox.show(
					message, {
						icon: type,
						title: title,
						onClose: function(oAction) {
							if (callback) {
								callback();
							}
						}
					}
				);
			});
		},
		GrItemSetFormValues: function(openItem) {
			var oModel = sap.ui.getCore().getModel("GrItem");
			var warehouse = sap.ui.getCore().getModel("Warehouse").getData();
			oModel.setProperty("/Ebelp", openItem.PoItem);
			if (openItem.StoreLoc) {
				// get from the PO line item
				oModel.setProperty("/Lgort", openItem.StoreLoc);
			} else {
				// set from the user's warehouse profile
				oModel.setProperty("/Lgort", warehouse.StorageLoc);
			}
			oModel.setProperty("/Ebeln", openItem.PoNumber);
			oModel.setProperty("/Matnr", openItem.Material);
			if (openItem.Plant) {
				oModel.setProperty("/Werks", openItem.Plant);
			} else {
				// get from warehouse user profile
				oModel.setProperty("/Werks", warehouse.Plant);
			}
			oModel.setProperty("/Maktg", openItem.ShortText);
			if (openItem.ConfQty > 0) {
				oModel.setProperty("/MengeConfirm", openItem.ConfQty);
			} else {
				oModel.setProperty("/MengeConfirm", "");
			}
			oModel.setProperty("/Menge", openItem.OpenQty);
			oModel.setProperty("/Meins", openItem.Unit);
			oModel.setProperty("/SerialNumbers", openItem.SerialNumbers);
			if (openItem.Sernp) {
				oModel.setProperty("/serialNumbersRequired", true);
			} else {
				oModel.setProperty("/serialNumbersRequired", false);
			}
		},
		wholeNumber: function(oEvent) {
			if (!/^[0-9]*$/.test(oEvent.getSource().getValue())) {
				var length = oEvent.getSource().getValue().length - 1;
				oEvent.getSource().setValue(oEvent.getSource().getValue().substring(0, length));
			}
		},
		scan: function(oEvent, callbackFunc) {
			// This func requires a button to be named with prefix btn and input with prefix
			// inp. btn is replaced with inp and the corresponding input field's value is set
			// with the scanned value.
			//used to retrieve values of input
			zController = this;
			var params = oEvent.getParameters();
			var id = params.id;
			var button = oEvent.getSource();
			id = id.replace("btn", "inp");

			$.sap.require("sap.ndc.BarcodeScanner");
			sap.ndc.BarcodeScanner.scan(
				function(oResult) {
					if (oResult.cancelled) {
						return;
					}
					// Set the value of input control
					if (oResult.text.length > sap.ui.getCore().byId(id).getMaxLength() && sap.ui.getCore().byId(id).getMaxLength() > 0) {
						zController.showMessage("Invalid", "Scanned barcode is longer than max length " + sap.ui.getCore().byId(id).getMaxLength());
						return;
					}
					if (sap.ui.getCore().byId(id).getType() == "Number" || sap.ui.getCore().byId(id).getType() == "Tel") {
						var isNum = /^\d+$/.test(oResult.text);
						if (isNum == false && oResult.text != "") {
							zController.showMessage("Invalid", "Barcode must only contain numbers");
							return;
						}
					}
					// Set the value of the input control
					if (oResult.text && !oResult.cancelled) {
						sap.ui.getCore().byId(id).setValue(oResult.text);
						sap.ui.getCore().byId(id).rerender();
					} else {
						return;
					}

					if (callbackFunc) {
						callbackFunc();
					}
				},
				function(oError) {
					var msg = "An error occurred while scanning";
					zController.showMessage("Error", msg);
				},
				function(oInputChange) {}
			);
		},
		checkNumber: function(oEvent, maxLength) {
			var newValue = oEvent.getSource().getValue().replace(/\D/g, '');
			if (newValue.length > maxLength) {
				newValue = newValue.substring(0, maxLength);
			}
			oEvent.getSource().setValue(newValue);
		},
		onAjaxError: function(jqXHR, textStatus, errorThrown) {
			zController.showMessage("Error", jqXHR.responseJSON.error.message.value, "ERROR"); // + "\n\nStatus: " + textStatus);
			sap.ui.core.BusyIndicator.hide();
		},

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf smud.org.wmLM01.view.GlobalFuncs
		 */
		onInit: function() {
			zController = this;
		},
		uppercaseNoSpecial: function(oEvent) {
			// Uppercase and only alphanumeric plus underscores
			var newValue = oEvent.getSource().getValue().replace(/[\W]+/g, '');
			newValue = newValue.toUpperCase();
			oEvent.getSource().setValue(newValue);
		},
		uppercase: function(oEvent) {
			var newValue = oEvent.getSource().getValue().toUpperCase();
			oEvent.getSource().setValue(newValue);
		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf smud.org.wmLM01.view.GlobalFuncs
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf smud.org.wmLM01.view.GlobalFuncs
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf smud.org.wmLM01.view.GlobalFuncs
		 */
		//	onExit: function() {
		//
		//	}

	});

});