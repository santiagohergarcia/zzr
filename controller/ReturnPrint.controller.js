sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox"
], function(Controller, MessageBox) {
	"use strict";

	var zController;
	var GlobalFuncs = sap.ui.controller("smud.org.wmLM01.controller.GlobalFuncs");

	return Controller.extend("smud.org.wmLM01.controller.ReturnPrint", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf smud.org.wmLM01.view.ReturnPrint
		 */
		onInit: function() {
			this.getView().setModel(sap.ui.getCore().getModel("ReturnPrint"));
			zController = this;
		},
		uppercaseNoSpecial: function(oEvent) {
			GlobalFuncs.uppercaseNoSpecial(oEvent);
		},
		scanMatnr: function(oEvent) {
			GlobalFuncs.scan(oEvent, zController.getMaktg);
		},
		wholeNumber: function(oEvent){
			GlobalFuncs.wholeNumber(oEvent);
		},
		getMaktg: function() {
			var oModel = zController.getView().getModel();
			var oData = zController.getView().getModel().getData();
			var oDataModel = zController.getView().getModel("ReturnPrintOdata");
			oDataModel.read("/ReturnPrintSet('" + oData.Matnr + "')", {
				success: function(oResult) {
					oModel.setProperty("/Maktg", oResult.Maktg);
					oModel.refresh();
				},
				error: function(oError) {
					MessageBox.show(JSON.parse(oError.responseText).error.message.value, {
						title: "Error",
						icon: "ERROR"
					});
					oModel.setProperty("/Matnr", "");
					oModel.setProperty("/Maktg", "");
				}
			});
		},
		print: function() {
			sap.ui.core.BusyIndicator.show(0);
			var oData = zController.getView().getModel().getData();
			oData.Qty = parseInt(oData.Qty);
			if (oData.Qty > 100) {
				MessageBox.show("Print Qty cannot exceed 100", {
					title: "Error",
					icon: "ERROR"
				});
				sap.ui.core.BusyIndicator.hide();
				return;
			} else if (oData.Qty <= 0 || !oData.Qty) {
				MessageBox.show("Print Qty cannot be less than 1", {
					title: "Error",
					icon: "ERROR"
				});
				sap.ui.core.BusyIndicator.hide();
				return;
			}
			var oDataModel = zController.getView().getModel("ReturnPrintOdata");
			var request = {};
			request.Matnr = oData.Matnr;
			request.Lgnum = oData.Lgnum;
			request.Qty = oData.Qty;
			oDataModel.create("/ReturnPrintSet", request, {
				success: function(data, response) {
					oData.Matnr = "";
					oData.Maktg = "";
					oData.Qty = 0;
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
		goBack: function() {
			window.history.go(-1);
		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf smud.org.wmLM01.view.ReturnPrint
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf smud.org.wmLM01.view.ReturnPrint
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf smud.org.wmLM01.view.ReturnPrint
		 */
		//	onExit: function() {
		//
		//	}

	});

});