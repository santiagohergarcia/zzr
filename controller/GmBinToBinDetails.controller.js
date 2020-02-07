sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	'sap/m/MessageBox'
], function(Controller, MessageToast, JSONModel, MessageBox) {
	"use strict";

	var GlobalFuncs = sap.ui.controller("smud.org.wmLM01.controller.GlobalFuncs");
	var zController;
	
	return Controller.extend("smud.org.wmLM01.controller.GmBinToBinDetails", {

		onInit: function() {
			zController = this;
			this.getView().setModel(sap.ui.getCore().getModel("GmResultModel"));

		},
		onBeforeRendering: function() {

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
		////https://sapgd1.smud.org:8001/sap/opu/odata/sap/ZWM_BIN_TO_BIN_SRV/BINtoBINSet(Matnr='10000013')?$format=json

		saveBinToBin: function() {
			sap.ui.core.BusyIndicator.show(0);
			var that = this;
			var oDataModel = this.getView().getModel("GmBinToBin");
			var oDataUI = this.getView().getModel().getData();
			var oModel = this.getView().getModel();
			if (oDataUI.Anfme == null || oDataUI.Anfme < 1) {
				MessageBox.show("Please enter Quantity", {
					title: "Error Message",
					icon: "ERROR"
				});
				sap.ui.core.BusyIndicator.hide();
				return;
			} else if (oDataUI.Nltyp == null || oDataUI.Nltyp == '') {
				MessageBox.show("Please enter Dest Type", {
					title: "Error Message",
					icon: "ERROR"
				});
				sap.ui.core.BusyIndicator.hide();
				return;
			} else if (oDataUI.Nlpla == null || oDataUI.Nlpla == '') {
				MessageBox.show("Please enter Dest Bin", {
					title: "Error Message",
					icon: "ERROR"
				});
				sap.ui.core.BusyIndicator.hide();
				return;
			}
			oDataModel.create("/BINtoBINSet", oDataUI, {
				success: function(data, response) {

					oModel.setProperty("/Anfme", 0.000);
					oModel.setProperty("/Nltyp", "");
					oModel.setProperty("/Nlpla", "");

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
		uppercase: function(oEvent) {
			GlobalFuncs.uppercase(oEvent);
		},
		goBack: function() {
			window.history.go(-1);
		},
		scan: function(oEvent) {
			GlobalFuncs.scan(oEvent, this.getDestStorageType);
		},
		uppercaseNoSpecial: function(oEvent) {
			GlobalFuncs.uppercaseNoSpecial(oEvent);
		},
		getDestStorageType: function() {
			var dropdown = zController.getView().byId("inpDestinationType");
			dropdown.clearSelection();
			dropdown.setValue("");
			dropdown.destroyItems();
			sap.ui.core.BusyIndicator.show(0);
			var oDataModel = zController.getView().getModel("Gwarehouse");
			var oModel = sap.ui.getCore().getModel("GmResultModel");
			var lgnum = oModel.getProperty("/Lgnum");
			oModel.setProperty("/Nlpla", oModel.getProperty("/Nlpla").toUpperCase());
			var lgpla = oModel.getProperty("/Nlpla");
			var vlpla = oModel.getProperty("/Vlpla");
			var vltyp = oModel.getProperty("/Vltyp");
			if (!lgpla) {
				sap.ui.core.BusyIndicator.hide();
				return;
			} else if (lgpla === vlpla) {
				// Source bin = Destination bin, throw an error
				/*		MessageBox.show("Destination Bin must be different than Source Bin", {
							title: "Invalid Dest. Bin",
							icon: "ERROR"
						});
						sap.ui.core.BusyIndicator.hide();
						return; */
			}

			var filters = [new sap.ui.model.Filter({
					path: "Lgnum",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: lgnum
				}),
				new sap.ui.model.Filter({
					path: "Lgpla",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: lgpla
				})
			];

			oDataModel.read("/BinMasterDataSet", {
				filters: filters,
				success: function(oData) {
					var bins = oData.results;
					for (var i = 0; i < bins.length; i++) {
						var bin = bins[i];
					//	if (bin.Lgtyp != vltyp) || bin.Lgpla != lgpla) {
							dropdown.addItem(
								new sap.ui.core.Item({
									key: bin.Lgtyp,
									text: bin.Lgtyp
								})
							);
							dropdown.setSelectedKey(bin.Lgtyp);
					//	}
					}
					if (dropdown.getItems().length == 0) {
						MessageBox.show("The Destination Bin has no storage type applicable for Bin to Bin", {
							title: "Error Message",
							icon: "ERROR"
						});
					}
					sap.ui.core.BusyIndicator.hide();
				},
				error: function(oError) {
					MessageBox.show(JSON.parse(oError.responseText).error.innererror.errordetails[0].message, {
						title: "Error Message",
						icon: "ERROR"
					});
					sap.ui.core.BusyIndicator.hide();
				}
			});
		}
	});

});