sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox"
], function(Controller, MessageBox) {
	"use strict";

	var zController;
	var GlobalFuncs = sap.ui.controller("smud.org.wmLM01.controller.GlobalFuncs");

	return Controller.extend("smud.org.wmLM01.controller.WmPrintBinLabel", {
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf smud.org.wmLM01.view.WmPrintBinLabel
		 */
		onInit: function() {
			this.getView().setModel(sap.ui.getCore().getModel("WmPrintBinLabel"));
			zController = this;
		},
		uppercase: function(oEvent) {
			GlobalFuncs.uppercase(oEvent);
		},
		scan: function(oEvent) {
			GlobalFuncs.scan(oEvent, zController.uppercaseBins);
		},
		uppercaseBins: function() {
			var oData = zController.getView().getModel().getData();
			oData.LgplaFrom = oData.LgplaFrom.toUpperCase();
			oData.LgplaTo = oData.LgplaTo.toUpperCase();
		},
		goBack: function() {
			window.history.go(-1);
		},
		print: function() {
			sap.ui.core.BusyIndicator.show();
			var oData = zController.getView().getModel().getData();
			// First, validate input fields
			if (!oData.LgplaFrom) {
				MessageBox.show("'Bin (from)' is required to print", {
					title: "Required Field",
					icon: "ERROR"
				});
				return;
			} else if (!oData.Lgnum) {
				MessageBox.show("'Warehouse' is required to print", {
					title: "Required Field",
					icon: "ERROR"
				});
				return;
			} else if (!oData.Lgtyp) {
				MessageBox.show("'Storage Type' is required to print", {
					title: "Required Field",
					icon: "ERROR"
				});
				return;
			} else if (oData.Qty < 1) {
				MessageBox.show("'Quantity' is required to print", {
					title: "Required Field",
					icon: "ERROR"
				});
				return;
			} else if (oData.Qty > 100) {
				MessageBox.show("'Quantity' must be < 100", {
					title: "Invalid Field",
					icon: "ERROR"
				});
			}

			// Now we need to make an oData call to print the label(s)
			var oDataModel = this.getView().getModel("Gwarehouse");
			var request = {
				Lgnum: oData.Lgnum,
				LgplaFrom: oData.LgplaFrom,
				LgplaTo: oData.LgplaTo,
				Lgtyp: oData.Lgtyp,
				Qty: parseInt(oData.Qty),
				// Label Size
				Size4x2: oData.Size4x2,
				Size3x1: oData.Size3x1,
				// Label Type
				NormalLabel: oData.NormalLabel,
				MaterialLabel: oData.MaterialLabel,
				NonStock: oData.NonStock,
				SouthDock: oData.SouthDock
			};
			oDataModel.create("/PrintBinLabelSet", request, {
				success: function(data, response) {
					// Clear inputs
					oData.LgplaFrom = "";
					oData.LgplaTo = "";
					oData.Qty = "";
					oData.Lgtyp = "";
					oData.Lgnum = "";
					var hdrMessage = response.headers["sap-message"];
					var hdrMessageObject = JSON.parse(hdrMessage);
					var message = hdrMessageObject.message;
					GlobalFuncs.showMessage("Success", message, "SUCCESS", zController.goBack); 
					sap.ui.core.BusyIndicator.hide();
				},
				error: function(oError) {
					MessageBox.show(JSON.parse(oError.responseText).error.message.value, {
						title: "Error",
						icon: "ERROR"
					});
					sap.ui.core.BusyIndicator.hide();
				}
			});
		},
		wholeNumber: function(oEvent) {
				GlobalFuncs.wholeNumber(oEvent);
			}
			/**
			 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
			 * (NOT before the first rendering! onInit() is used for that one!).
			 * @memberOf smud.org.wmLM01.view.WmPrintBinLabel
			 */
			//	onBeforeRendering: function() {
			//
			//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf smud.org.wmLM01.view.WmPrintBinLabel
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf smud.org.wmLM01.view.WmPrintBinLabel
		 */
		//	onExit: function() {
		//
		//	}

	});

});