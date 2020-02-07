sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	var zController;
	var GlobalFuncs = sap.ui.controller("smud.org.wmLM01.controller.GlobalFuncs");
	var jsonData;
	var csrfToken = "";

	return Controller.extend("smud.org.wmLM01.controller.GrPrintItem", {
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf smud.org.wmLM01.view.GrPrintItem
		 */
		onInit: function() {
			zController = this;
			this.getView().setModel(sap.ui.getCore().getModel("GrPrintItem"));
		},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf smud.org.wmLM01.view.GrPrintItem
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf smud.org.wmLM01.view.GrPrintItem
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf smud.org.wmLM01.view.GrPrintItem
		 */
		//	onExit: function() {
		//
		//	}

		goBack: function() {
			window.history.go(-1);
		},
		print: function() {
			var oData = this.getView().getModel().getData();
			sap.ui.core.BusyIndicator.show(0);
			//Validate the quantities entered
			if (oData.PrintQty > oData.GrQty) {
				GlobalFuncs.showMessage("Invalid Entry", "Print Qty cannot be greater than GR Qty");
				sap.ui.core.BusyIndicator.hide();
				return;
			} else if (oData.PrintQty <= 0) {
				GlobalFuncs.showMessage("Invalid Entry", "Print Qty must be greater than 0");
				sap.ui.core.BusyIndicator.hide();
				return;
			}

			// Create the request object for the Print POST call
			var printQty = parseInt(oData.PrintQty);
			var request = {
				"PoNumber": oData.PoNumber,
				"PoItem": oData.PoItem,
				"Material": oData.Material,
				"PrintQty": printQty
			};

			// Get CSRF token for the POST call
			var getURL = "/sap/opu/odata/sap/ZWM_GOODS_RECEIPT_SRV/LabelPrintSet";
			jsonData = JSON.stringify(request);
			csrfToken = "";
			$.ajax({
				url: getURL,
				headers: {
					"X-Requested-With": "XMLHttpRequest",
					"Content-Type": "application/atom+xml",
					"DataServiceVersion": "2.0",
					"X-CSRF-Token": "Fetch",
					"Asynchronous": "false"
				},
				type: "GET",
				dataType: "json",
				success: function(result, status, xhr) {
					csrfToken = xhr.getResponseHeader("x-csrf-token");
					//POST Method call to create GR document
					var postURL = "/sap/opu/odata/sap/ZWM_GOODS_RECEIPT_SRV/LabelPrintSet";
					jsonData = JSON.stringify(request);
					$.ajax({
						url: postURL,
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
							sap.ui.core.BusyIndicator.hide();
							GlobalFuncs.showMessage("Label(s) Printing", "Your label is being printed");
						},
						error: function(jqXHR, textStatus, errorThrown) {
							sap.ui.core.BusyIndicator.hide();
							GlobalFuncs.showMessage("Error", errorThrown);
						}
					});
				},
				error: function(jqXHR, textStatus, errorThrown) {
					sap.ui.core.BusyIndicator.hide();
					GlobalFuncs.showMessage("Error", errorThrown);
				}
			});
		},
		next: function() {
			this.navigateItem("next");
		},
		previous: function() {
			this.navigateItem("prev");
		},
		navigateItem: function(direction) {
			var PrintItems = sap.ui.getCore().getModel("GrPrintItems");
			var PrintItem = this.getView().getModel();
			var matDoc = PrintItem.getProperty("/MatDocNumber");
			var item = PrintItem.getProperty("/PoItem");
			var poNumber = PrintItem.getProperty("/PoNumber");
			var data = PrintItems.getProperty("/items");
			// Update the current row
			for (var i = 0; i < data.length; i++) {
				var row = data[i];
				if (row.MatDocNumber == matDoc && row.PoItem == item && row.PoNumber == poNumber) {
					if (direction == "next") {
						i++;
					} else if (direction == "prev") {
						i--;
					}
					if (data[i]) {
						// Set the field values for the next item
						this.setFormValues(data[i]);
						return;
					} else {
						if (direction == "next") {
							GlobalFuncs.showMessage("Info", "You've reached the last item");
							return;
						} else if (direction == "prev") {
							GlobalFuncs.showMessage("Info", "You've reached the first item");
							return;
						}
					}
				}
			}
		},
		setFormValues: function(obj) {
			var oModel = this.getView().getModel();
			oModel.setProperty("/PoNumber", obj.PoNumber);
			oModel.setProperty("/PoItem", obj.PoItem);
			oModel.setProperty("/MatDocNumber", obj.MatDocNumber);
			oModel.setProperty("/Material", obj.Material);
			oModel.setProperty("/GrQty", obj.GrQty);
			oModel.setProperty("/PrintQty", obj.PrintQty);
		},
		checkNumber: function(oEvent) {
			var newValue = oEvent.getSource().getValue().replace(/\D/g, '');
			oEvent.getSource().setValue(newValue);
		}
	});

});