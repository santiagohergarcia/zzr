sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	var zController;
	var GlobalFuncs = sap.ui.controller("smud.org.wmLM01.controller.GlobalFuncs");
	var jsonData;
	var csrfToken = "";
	var snTable;

	return Controller.extend("smud.org.wmLM01.controller.GrItem", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf smud.org.wmLM01.view.GrItem
		 */
		onInit: function() {
			zController = this;
			this.getView().setModel(sap.ui.getCore().getModel("GrItem"));
			this.createSerialNumbersTable();
		},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf smud.org.wmLM01.view.GrItem
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf smud.org.wmLM01.view.GrItem
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf smud.org.wmLM01.view.GrItem
		 */
		//	onExit: function() {
		//
		//	}
		goBack: function() {
			window.history.go(-1);
		},
		save: function() {
			sap.ui.core.BusyIndicator.show(0);
			// First, get the current screen values into the table
			// The navigateItem function does this for us.
			var returncode = this.navigateItem("transfer screen values to table");
			if (returncode) {
				sap.ui.core.BusyIndicator.hide();
				return;
			}
			// Prepare the request JSON object for oData service call
			var tableData = sap.ui.getCore().getModel("GrOpenItems").getProperty("/items");
			var oModel = this.getView().getModel();
			var request = {};
			var itemArray = [];
			var snArray = [];
			request["PoNumber"] = oModel.getProperty("/Ebeln");
			for (var i = 0; i < tableData.length; i++) {
				var tableRow = tableData[i];
				if (tableRow.ConfQty > 0) {
					var row = {};
					row["PoNumber"] = tableRow.PoNumber;
					row["PoItem"] = tableRow.PoItem;
					row["StoreLoc"] = tableRow.StoreLoc;
					row["Plant"] = tableRow.Plant;
					row["ConfQty"] = tableRow.ConfQty;
					row["Unit"] = tableRow.Unit;
					row["MoveType"] = "101";
					row["Material"] = tableRow.Material;
					itemArray.push(row);
					for (var sIndex = 0; sIndex < tableRow.SerialNumbers.length; sIndex++) {
						snArray.push({
							PoItem: tableRow.PoItem,
							Serialno: tableRow.SerialNumbers[sIndex]["Serialno"]
						});
					}
				}
			}
			if (itemArray.length == 0) {
				GlobalFuncs.showMessage("Invalid data", "None of the GR items have Qty entered");
				sap.ui.core.BusyIndicator.hide();
				return;
			} else {
				request["ItemsSet"] = itemArray;
				// Add Serial Numbers
				request["SerialNumbersSet"] = snArray;
				request["ReturnSet"] = [];
				jsonData = JSON.stringify(request);
			}
			// First, we need to make a GET call to get a CSRF token for the POST
			var getItemsURL = "/sap/opu/odata/sap/ZWM_GOODS_RECEIPT_SRV/HeaderSet";
			$.ajax({
				url: getItemsURL,
				//xhrFields: xhrHeader,
				headers: {
					"X-Requested-With": "XMLHttpRequest",
					"Content-Type": "application/atom+xml",
					"DataServiceVersion": "2.0",
					"X-CSRF-Token": "Fetch",
					"Asynchronous": "false"
				},
				type: "GET",
				dataType: "json",
				success: this.postGrDocument,
				error: function(jqXHR, textStatus, errorThrown) {
					sap.ui.core.BusyIndicator.hide();
					GlobalFuncs.showMessage("Error", errorThrown);
				}
			});
		},
		scan: function(oEvent) {
			GlobalFuncs.scan(oEvent);
		},
		postGrDocument: function(result, status, xhr) {
			//POST Method call to create GR document
			csrfToken = xhr.getResponseHeader("x-csrf-token");
			var postItemsURL = "/sap/opu/odata/sap/ZWM_GOODS_RECEIPT_SRV/HeaderSet";
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
					var returnSet = result.d.ReturnSet.results;
					var ItemsSet = result.d.ItemsSet.results;
					var GrItem = ItemsSet[0];
					var matDocNumber = GrItem.MatDocNumber;
					for (var i = 0; i < returnSet.length; i++) {
						var returnRow = returnSet[i];
						if (returnRow.Type == "E") {
							GlobalFuncs.showMessage("Error", returnRow.Message);
							sap.ui.core.BusyIndicator.hide();
							return;
						} else if (returnRow.Type == "S") {
							sap.ui.getCore().getModel("MainPage").setProperty("/grPrintMblnr", matDocNumber);
							sap.ui.core.BusyIndicator.hide();
							GlobalFuncs.showMessage("Success", returnRow.Message, "SUCCESS", zController.goBackTwice);
							return;
						}
					}
				},
				error: function(jqXHR, textStatus, errorThrown) {
					sap.ui.core.BusyIndicator.hide();
					GlobalFuncs.showMessage("Error", errorThrown);
				}
			});
		},
		goBackTwice: function(){
			window.history.go(-2);
		},
		text: function() {
			var openItems = sap.ui.getCore().getModel("GrOpenItems").getProperty("/items");
			var item = this.getView().getModel().getData();
			var material = item.Matnr;
			var itemNumber = item.Ebelp;
			for (var i = 0; i < openItems.length; i++) {
				var row = openItems[i];
				if (row.PoItem == itemNumber) {
					GlobalFuncs.showMessage("Material " + material + " Text", row.PoLongText);
				}
			}
		},
		requestor: function() {
			var openItems = sap.ui.getCore().getModel("GrOpenItems").getProperty("/items");
			var itemNumber = sap.ui.getCore().getModel("GrItem").getProperty("/Ebelp");
			for (var i = 0; i < openItems.length; i++) {
				var row = openItems[i];
				if (row.PoItem == itemNumber) {
					GlobalFuncs.showMessage("Requestor for item " + itemNumber, row.Requestor);
				}
			}
		},
		find: function() {

		},
		navigateItem: function(direction) {
			var itemModel = sap.ui.getCore().getModel("GrItem");
			var openModel = sap.ui.getCore().getModel("GrOpenItems");
			var item = itemModel.getProperty("/Ebelp");
			var data = openModel.getProperty("/items");
			// Update the current row
			for (var i = 0; i < data.length; i++) {
				var row = data[i];
				if (row.PoItem == item) {
					var confQty = itemModel.getProperty("/MengeConfirm");
					var openQty = itemModel.getProperty("/Menge");
					openQty = openQty * (1.00 + (row.OverdeliveryTolerance * 0.01));
					//Validate the quantities entered
					if (confQty > openQty) {
						GlobalFuncs.showMessage("Invalid Entry", "Confirm Qty cannot be greater than Open Qty plus overdelivery tolerance");
						return 1;
					} else if (confQty < 0) {
						GlobalFuncs.showMessage("Invalid Entry", "Confirm Qty cannot be less than 0.000");
						return 2;
					}
					// Transfer table values from screen
					row.ConfQty = itemModel.getProperty("/MengeConfirm");
					row.Plant = itemModel.getProperty("/Werks");
					row.StoreLoc = itemModel.getProperty("/Lgort");
					row.SerialNumbers = itemModel.getProperty("/SerialNumbers");

					data[i] = row;
					openModel.setProperty("/items", data);

					if (direction == "next") {
						i++;
					} else if (direction == "prev") {
						i--;
					}
					if (data[i]) {
						// Set the field values for the next item
						GlobalFuncs.GrItemSetFormValues(data[i]);
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
		next: function(direction) {
			this.navigateItem("next");
		},
		previous: function() {
			this.navigateItem("prev");
		},
		checkNumber: function(oEvent) {
			var newValue = oEvent.getSource().getValue().replace(/\D/g, '');
			oEvent.getSource().setValue(newValue);
		},
		createSerialNumbersTable: function() {
			// Create the item table via JS
			snTable = new sap.m.Table({
				//headerText: "Enter Serial Numbers",
				width: "100%",
				growing: true,
				growingThreshold: 50,
				noDataText: "Enter a Qty",
				type: "Active" //enables itemPress event
			});

			//columns!!!
			var inputCol = new sap.m.Column({
				header: new sap.m.Label({
					text: "Enter Serial Numbers"
				}),
				width: "75%"
			});
			var buttonCol = new sap.m.Column({
				header: new sap.m.Label({
					text: "Scan"
				})
			});
			// rows!!!
			var columnItems = new sap.m.ColumnListItem(this.getView().createId("snColumnListItem"), {
				type: "Active" //enables itemPress event
			});
			//create cells to add to the rows.
			var input = new sap.m.Input({
				value: "{Serialno}",
				placeholder: "S/N",
				maxLength: 18
			});
			var button = new sap.m.Button({
				width: "auto",
				icon: "sap-icon://bar-code",
				press: function(oEvent) {
					var path = oEvent.getSource().getParent().getBindingContext().getPath();
					$.sap.require("sap.ndc.BarcodeScanner");
					sap.ndc.BarcodeScanner.scan(
						function(oResult) {
							if (oResult.cancelled) {
								return;
							}
							// Set the value of input control
							if (oResult.text.length > 18) {
								GlobalFuncs.showMessage("Invalid", "Serial number max length is 18 characters", "ERROR");
								return;
							}
							zController.getView().getModel().setProperty(path + "/Serialno", oResult.text);
							snTable.getBinding("items").refresh();
						},
						function(oError) {
							var msg = "An error occurred while scanning";
							GlobalFuncs.showMessage("Error", msg, "ERROR");
						},
						function(oInputChange) {}
					);
				}
			});

			// Add the columns to table
			snTable.addColumn(inputCol);
			snTable.addColumn(buttonCol);

			columnItems.addCell(input);
			columnItems.addCell(button);

			var oModel = this.getView().getModel();
			var context = new sap.ui.model.Context(oModel, "/items");
			snTable.setBindingContext(context);
			snTable.setModel(oModel);
			snTable.bindItems("/SerialNumbers", columnItems);

			this.getView().byId("vboxSN").addItem(snTable);
		},
		liveChangeQty: function(oEvent, quantity) {
			var qty;
			if (!oEvent) {
				qty = quantity;
			} else {
				qty = oEvent.getSource().getValue();
			}
			var oModel = this.getView().getModel();

			if (oModel.getProperty("/Unit") == "EA") {
				qty = parseInt(qty).toString();
				oModel.setProperty("/ConfQty", qty);
			}

			var serialNumbers = oModel.getProperty("/SerialNumbers");
			if (!serialNumbers) {
				serialNumbers = [];
			}
			if (qty < 1 || !oModel.getProperty("/serialNumbersRequired")) {
				snTable.removeAllItems();
				oModel.setProperty("/SerialNumbers", []);
				serialNumbers = [];
				return;
			}

			// Remove extra serial number rows
			while (qty < serialNumbers.length) {
				serialNumbers.pop();
			}

			// Add additional rows
			while (qty > serialNumbers.length) {
				serialNumbers.push({
					Serialno: ""
				});
			}
			oModel.setProperty("/SerialNumbers", serialNumbers);
			oModel.refresh();
		}
	});
});