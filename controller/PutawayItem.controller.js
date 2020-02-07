sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	var GlobalFuncs = sap.ui.controller("smud.org.wmLM01.controller.GlobalFuncs");
	var zController;
	var dropdown;

	return Controller.extend("smud.org.wmLM01.controller.PutawayItem", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf smud.org.wmLM01.view.PutawayItem
		 */
		onInit: function() {
			zController = this;
			this.getView().setModel(sap.ui.getCore().getModel("PutawayItem"));
			dropdown = sap.ui.getCore().byId(this.getView().createId("inpBinLoc"));
			sap.ui.getCore().putawayView = this.getView();

			// Bin the bins in the model to the dropdown / ComboBox
			var oItemTemplate = new sap.ui.core.ListItem({
				key: "{key}",
				text: "{text}"
			});
			dropdown.bindAggregation("items", "/bins", oItemTemplate);

			var bins = this.getView().getModel().getProperty("/bins");
			dropdown.setSelectedKey(bins[0].key);
		},
		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf smud.org.wmLM01.view.PutawayItem
		 */
		//	onBeforeRendering: function() {
		//	
		//	},
		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf smud.org.wmLM01.view.PutawayItem
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf smud.org.wmLM01.view.PutawayItem
		 */
		//	onExit: function() {
		//
		//	}
		goBack: function() {
			dropdown.destroyItems();
			window.history.go(-1);
		},
		save: function() {
			sap.ui.core.BusyIndicator.show(0);
			var oData = zController.getView().getModel().getData();

			// Validation
			/*	if (oData.Bin != oData.BinConfirm){
					GlobalFuncs.showMessage("Error", "Confirmed Bin is not equal to selected Bin", "ERROR");
				} */

			// GET call to get CSRF token for POST
			// First, we need to make a GET call to get a CSRF token for the POST
			var getItemsURL = "/sap/opu/odata/sap/ZWM_PUTAWAY_SRV/PutawaySet";
			$.ajax({
				url: getItemsURL,
				headers: {
					"X-Requested-With": "XMLHttpRequest",
					"Content-Type": "application/atom+xml",
					"DataServiceVersion": "2.0",
					"X-CSRF-Token": "Fetch",
					"Asynchronous": "false"
				},
				type: "GET",
				dataType: "json",
				success: this.postPutaway,
				error: function(jqXHR, textStatus, errorThrown) {
					sap.ui.core.BusyIndicator.hide();
					GlobalFuncs.showMessage("Error", jqXHR.responseJSON.error.message.value, "ERROR");
				}
			});
		},
		changeBinSelection: function(oEvent) {
			var oModel = this.getView().getModel();
			var params = oEvent.getParameters();
			var value = params.selectedItem.getProperty("key");
			if (value == "OTHER_BIN") {
				oModel.setProperty("/otherBin", true);
			} else {
				oModel.setProperty("/otherBin", false);
			}
			oModel.refresh();
		},
		postPutaway: function(result, status, xhr) {
			var putawayModel = sap.ui.getCore().getModel("PutawayItem");
			var mainModel = sap.ui.getCore().getModel("MainPage");
			var putawayData = putawayModel.getData();

			//POST Method call to create GR document
			var csrfToken = xhr.getResponseHeader("x-csrf-token");
			var postItemsURL = "/sap/opu/odata/sap/ZWM_PUTAWAY_SRV/PutawaySet";
			var request = {};

			putawayData.Warehouse = mainModel.getProperty("/putawayLgnum");
			putawayData.Material = mainModel.getProperty("/putawayMatnr");
			putawayData.StorageLoc = mainModel.getProperty("/putawayLgort");
			putawayData.Plant = mainModel.getProperty("/putawayWerks");

			var putawayQty = putawayData.PutawayQty;

			if (!putawayQty || putawayQty <= 0) {
				GlobalFuncs.showMessage("Error", "Putaway Qty must be greater than zero");
				sap.ui.core.BusyIndicator.hide();
				return;
			}
			putawayData.PutawayQty = putawayQty;
			var binSelected = dropdown.getSelectedKey();
			putawayData.PutawayVendor = putawayModel.getProperty("/PutawayVendor");
			if (putawayData.PutawayVendor) {
				putawayData.SpecialStock = "K";
			}

			// Set up the json request
			request.Material = putawayData.Material;
			request.SpecialStock = putawayData.SpecialStock;
			request.Warehouse = putawayData.Warehouse;
			request.Plant = putawayData.Plant;
			request.StorageLoc = putawayData.StorageLoc;
			request.PutawayQty = putawayData.PutawayQty;
			request.PutawayVendor = putawayData.PutawayVendor;
			request.StorageType = putawayData.StorageType;
			request.Material = putawayData.Material;
			if (binSelected && binSelected != "OTHER_BIN") {
				request.BinConfirm = binSelected;
			} else {
				request.BinConfirm = putawayData.Bin;
			}

			var jsonData = JSON.stringify(request);

			$.ajax({
				url: postItemsURL,
				headers: {
					"X-Requested-With": "XMLHttpRequest",
					"Content-Type": "application/json",
					"DataServiceVersion": "2.0",
					"X-CSRF-Token": csrfToken
				},
				data: jsonData,
				type: "POST",
				dataType: "json",
				success: function(result, status, xhr) {
					var order = result.d.TransferOrder;
					if (order) {
						mainModel.setProperty("/putawayMatnr", "");
						mainModel.setProperty("/consignment", false);
						GlobalFuncs.showMessage("Success", "Created Transfer Order " + order, "SUCCESS", zController.goBack);
						putawayModel.setProperty("/TransferOrder", order);
					} else {
						GlobalFuncs.showMessage("Error", "Unable to create Transfer Order", "ERROR", zController.goBack);
					}
					sap.ui.core.BusyIndicator.hide();
				},
				error: function(jqXHR, textStatus, errorThrown) {
					sap.ui.core.BusyIndicator.hide();
					GlobalFuncs.showMessage("Error", jqXHR.responseJSON.error.message.value);
				}
			});
		},
		checkNumber: function(oEvent) {
			var newValue = oEvent.getSource().getValue().replace(/\D/g, '');
			oEvent.getSource().setValue(newValue);
		},
		scan: function(oEvent) {
			GlobalFuncs.scan(oEvent);
		},
		uppercase: function(oEvent) {
			GlobalFuncs.uppercase(oEvent);
		}
	});

});