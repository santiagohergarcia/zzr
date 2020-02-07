sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox"
], function(Controller, Filter, FilterOperator, MessageToast, JSONModel, MessageBox) {
	"use strict";

	var GlobalFuncs = sap.ui.controller("smud.org.wmLM01.controller.GlobalFuncs");
	var zController;
	var index = 0;
	var snTable;

	return Controller.extend("smud.org.wmLM01.controller.GiUnplannedItem", {
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf smud.org.wmLM01.view.GiUnplannedItem
		 */
		onInit: function() {
			this.getView().setModel(sap.ui.getCore().getModel("GiUnplannedItem"));
			zController = this;
			this.createSerialNumbersTable();
		},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf smud.org.wmLM01.view.GiUnplannedItem
		 */
		//	onBeforeRendering: function() {
		///	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf smud.org.wmLM01.view.GiUnplannedItem
		 */
		//	onAfterRendering: function() {
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf smud.org.wmLM01.view.GiUnplannedItem
		 */
		//onExit: function() {
		//},
		liveChangeQty: function(oEvent, quantity) {
			var qty;
			if (!oEvent) {
				qty = quantity;
			} else {
				qty = oEvent.getSource().getValue();
			}
			var oModel = this.getView().getModel();

			if (oModel.getProperty("/Meins") == "EA") {
				qty = parseInt(qty).toString();
				oModel.setProperty("/Menge", qty);
			}

			var serialNumbers = oModel.getProperty("/serialNumbers");
			if (qty < 1 || !oModel.getProperty("/serialNumbersRequired")) {
				snTable.removeAllItems();
				oModel.setProperty("/serialNumbers", []);
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
					Sernr: ""
				});
			}

			var colItemTemplate = sap.ui.getCore().byId(this.getView().createId("snColumnListItem"));
			var tabModel = new sap.ui.model.json.JSONModel(serialNumbers, false);
			tabModel.setData(serialNumbers, false);

			var context = new sap.ui.model.Context(tabModel, "/");
			snTable.setBindingContext(context);
			snTable.setModel(tabModel);
			snTable.bindItems("/", colItemTemplate);
		},
		filterTable: function(oTable, fields, filterString) {
			// filter list
			var oBinding = oTable.getBinding("items");
			if (oBinding) {
				var oFilters = [];
				for (var i = 0; i < fields.length; i++) {
					oFilters.push(new sap.ui.model.Filter(fields[i], sap.ui.model.FilterOperator.Contains, filterString));
				}
				var filterObj = new sap.ui.model.Filter(oFilters, false);
				oBinding.filter(filterObj);
			} else {
				oBinding.filter([]);
			}
		},
		liveChangeBin: function(oEvent) {
			GlobalFuncs.uppercase(oEvent);
			if (!oEvent.getSource().getValue()) {
				return;
			}
			zController.getView().getModel().setProperty("/Matnr", "");
			zController.getView().getModel().setProperty("/Verme", "");
			zController.getView().getModel().setProperty("/Maktg", "");
			zController.getView().getModel().setProperty("/Meins", "");
			this.getView().getModel().setProperty("/Lgpla", oEvent.getSource().getValue());
		},
		changeBin: function(oEvent) {
			GlobalFuncs.uppercase(oEvent);
			zController.getView().getModel().setProperty("/Matnr", "");
			zController.getView().getModel().setProperty("/Verme", "");
			zController.getView().getModel().setProperty("/Maktg", "");
			zController.getView().getModel().setProperty("/Meins", "");
			this.getView().getModel().setProperty("/Lgpla", oEvent.getSource().getValue());
			zController.f4Matnr();
		},
		f4Matnr: function() {
			// Only show F4 if it is not already being displayed
			// When user change bin and clicks Material field it would
			// trigger F4 help twice.
			if (sap.ui.getCore().byId(zController.getView().createId("f4MatnrTable"))){
				sap.ui.getCore().byId(zController.getView().createId("f4MatnrTable")).destroy();
			}
			
			sap.ui.core.BusyIndicator.show();

			var oModel = this.getView().getModel();
			oModel.setProperty("/Matnr", "");

			if (!oModel.getProperty("/Lgpla")) {
				GlobalFuncs.showMessage("Error", "Enter a Bin", "ERROR");
				sap.ui.core.BusyIndicator.hide();
				return;
			}

			var columnItems = new sap.m.ColumnListItem({
				type: "Active" //enables itemPress event
			});
			//create cells to add to the rows.
			var Matnr = new sap.m.Text({
				text: "{Matnr}"
			});
			var Maktg = new sap.m.Text({
				text: "{Maktg}"
			});
			var Verme = new sap.m.Text({
				text: "{Verme}"
			});
			var Meins = new sap.m.Text({
				text: "{Meins}"
			});

			columnItems.addCell(Matnr);
			columnItems.addCell(Maktg);
			columnItems.addCell(Verme);
			columnItems.addCell(Meins);

			var tableDialog = new sap.m.TableSelectDialog(zController.getView().createId("f4MatnrTable"), {
				title: "Materials in Bin " + oModel.getProperty("/Lgpla"),
				columns: [
					new sap.m.Column({
						header: new sap.m.Label({
							text: "Material"
						})
					}),
					new sap.m.Column({
						header: new sap.m.Label({
							text: "Description"
						})
					}),
					new sap.m.Column({
						header: new sap.m.Label({
							text: "Available"
						})
					}),
					new sap.m.Column({
						header: new sap.m.Label({
							text: "Unit"
						})
					})
				],
				confirm: function(oEvent) {
					var oModel = zController.getView().getModel();
					var path = oEvent.getParameter("selectedItem").getBindingContext().getPath();
					var params = oEvent.getParameters();
					var object = oEvent.getSource().getBindingContext().getObject(path);
					oModel.setProperty("/Matnr", object.Matnr);
					oModel.setProperty("/Maktg", object.Maktg);
					oModel.setProperty("/Meins", object.Meins);
					oModel.setProperty("/Lgtyp", object.Lgtyp);
					oModel.setProperty("/Verme", object.Verme);
					if (object.Sernp) {
						oModel.setProperty("/serialNumbersRequired", true);
						// Trigger a call to oData service to retrieve Serial Numbers
						zController.showSerialNumberSelection(null, object.Matnr);
					} else {
						oModel.setProperty("/serialNumbersRequired", false);
					}
					zController.liveChangeQty(null, oModel.getProperty("/Menge"));
					tableDialog.destroy();
				},
				liveChange: function(oEvent) {
					var searchValue = oEvent.getParameter("value");
					zController.filterTable(tableDialog, ["Matnr", "Maktg", "Meins"], searchValue);
				}
			});

			// Get Materials for Bin
			var lgnum = oModel.getProperty("/Lgnum");
			var werks = oModel.getProperty("/Werks");
			var lgpla = oModel.getProperty("/Lgpla");

			// We need to search for special stock if a vendor is entered
			var vendorQuery = "";
			if (oModel.getProperty("/Lifnr")) {
				vendorQuery = " and Sobkz eq 'K' and Sonum eq '" + oModel.getProperty("/Lifnr") + "'";
			}

			var url = "/sap/opu/odata/sap/ZWM_GI_UNPLANNED_SRV/BinMaterialsSet?$filter=Lgnum eq '" + lgnum + "'" + " and Werks eq '" +
				werks + "' and Lgpla eq '" + lgpla + "'" + vendorQuery;
			$.ajax({
				url: url,
				type: "GET",
				dataType: "json",
				success: function(result, status, xhr) {
					var headers = xhr.getAllResponseHeaders();
					if (result.d.results[0]) { // Results were returned
						if (result.d.results.length === 1) {
							// When only 1 material exists, auto-populate it
							var oModel = zController.getView().getModel();
							var data = result.d.results[0];
							oModel.setProperty("/Matnr", data.Matnr);
							oModel.setProperty("/Maktg", data.Maktg);
							oModel.setProperty("/Meins", data.Meins);
							oModel.setProperty("/Lgtyp", data.Lgtyp);
							oModel.setProperty("/Verme", data.Verme);
							if (data.Sernp) {
								oModel.setProperty("/serialNumbersRequired", true);
								// Trigger a call to oData service to retrieve Serial Numbers
								zController.showSerialNumberSelection(null, data.Matnr);
							} else {
								oModel.setProperty("/serialNumbersRequired", false);
							}
							zController.liveChangeQty(null, oModel.getProperty("/Menge"));

							sap.ui.core.BusyIndicator.hide();

						} else {
							var oModel = new sap.ui.model.json.JSONModel(result.d.results, false);
							oModel.setData(result.d.results, false);

							var context = new sap.ui.model.Context(oModel, "/");
							tableDialog.setBindingContext(context);
							tableDialog.setModel(oModel);

							// Bind the path to the data table contained in "Result" from the REST call.
							tableDialog.bindItems("/", columnItems);
							tableDialog.open();
						}
						sap.ui.core.BusyIndicator.hide();

					} else {
						sap.ui.core.BusyIndicator.hide();
					}
				},
				error: function(jqXHR, textStatus, errorThrown) {
					GlobalFuncs.onAjaxError(jqXHR, textStatus, errorThrown);
					zController.getView().getModel().setProperty("/Lgpla", "");
				}
			});
		},

		goBack: function() {
			// First, remove all items from the array except the 1st
			var items = sap.ui.getCore().getModel("GiUnplanned").getProperty("/items");
			items[0].serialNumbersRequired = false;
			var oModel = new sap.ui.model.json.JSONModel(items[0], false);

			sap.ui.getCore().setModel(oModel, "GiUnplannedItem");
			zController.getView().setModel(oModel);

			//zController.getView().setModel(oModel);
			zController.clear();

			oModel.refresh();
			zController.getView().rerender();

			window.history.go(-1);
		},
		scanBin: function(oEvent) {
			GlobalFuncs.scan(oEvent, zController.onScanSuccess);
		},
		scan: function(oEvent) {
			GlobalFuncs.scan(oEvent);
		},
		uppercase: function(oEvent) {
			GlobalFuncs.uppercase(oEvent);
		},
		/*	changeBin: function(oEvent) {
				GlobalFuncs.uppercase(oEvent);
				if (!oEvent.getSource().getValue()) {
					return;
				}
				zController.getView().getModel().setProperty("/Matnr", "");
				zController.getView().getModel().setProperty("/Verme", "");
				zController.getView().getModel().setProperty("/Maktg", "");
				zController.getView().getModel().setProperty("/Meins", "");
			},*/
		onScanSuccess: function() {
			var oModel = zController.getView().getModel();
			if (oModel.getProperty("/Lgpla")) {
				oModel.setProperty("/Lgpla", oModel.getProperty("/Lgpla").toUpperCase());
				zController.f4Matnr();
			}
		},
		next: function() {
			zController.navigateItem("next");
		},
		prev: function() {
			zController.navigateItem("prev");
		},
		navigateItem: function(direction) {
			var oModel = sap.ui.getCore().getModel("GiUnplanned");
			var currentItem = this.getView().getModel();
			var items = oModel.getProperty("/items");
			var newIndex;
			var rowNumber = currentItem.getProperty("/Index") + 1;
			switch (direction) {
				case "next":
					if (!zController.checkRequiredFields()) {
						return;
					}
					if (rowNumber == items.length) {
						// Append a new row
						newIndex = currentItem.getProperty("/Index") + 1;
						items.push({
							Index: newIndex,
							Aufnr: currentItem.getProperty("/Aufnr"),
							Lgpla: "",
							Bwart: currentItem.getProperty("/Bwart"),
							Lifnr: currentItem.getProperty("/Lifnr"),
							Lgnum: currentItem.getProperty("/Lgnum"),
							Werks: currentItem.getProperty("/Werks"),
							Lgort: currentItem.getProperty("/Lgort"),
							vendorExists: currentItem.getProperty("/vendorExists"),
							Sernp: "",
							Menge: "",
							Meins: "",
							Maktg: "",
							serialNumbersRequired: false,
							Wempf: currentItem.getProperty("/Wempf"),
							serialNumbers: []
						});
						sap.ui.getCore().setModel(oModel, "GiUnplanned");
					} else {
						newIndex = rowNumber;
					}

					// Create new model and assign to GiUnplannedItem view
					var newModel = new sap.ui.model.json.JSONModel(items[newIndex], false);
					newModel.setData(items[newIndex], false);
					this.getView().setModel(newModel);
					zController.liveChangeQty(null, items[newIndex].Menge);
					var itemNumber = this.getView().getModel().getProperty("/Index") + 1;
					var itemCount = items.length;
					this.getView().getModel().setProperty("/itemNumberText", itemNumber + " of " + itemCount);
					break;
				case "prev":
					newIndex = currentItem.getProperty("/Index") - 1;
					if (currentItem.getProperty("/Index") == 0) {
						GlobalFuncs.showMessage("No Previous items", "No Previous Items", "INFORMATION");
						return;
					}
					if (!currentItem.getProperty("/Matnr") && !currentItem.getProperty("/Lgpla") && rowNumber == items.length) {
						// No data entered, we can remove the item
						items.pop(); // Remove last item and go back
					} else {
						if (!zController.checkRequiredFields()) {
							return;
						}

					}
					var newModel = new sap.ui.model.json.JSONModel(items[newIndex], false);
					newModel.setData(items[newIndex], false);
					this.getView().setModel(newModel);
					zController.liveChangeQty(null, items[newIndex].Menge);
					var itemNumber = this.getView().getModel().getProperty("/Index") + 1;
					var itemCount = items.length;
					this.getView().getModel().setProperty("/itemNumberText", itemNumber + " of " + itemCount);
					break;
				default:
					break;
			}

		},
		checkRequiredFields: function() {
			var oData = this.getView().getModel().getData();
			if (!oData.Matnr) {
				GlobalFuncs.showMessage("Required Field", "'Material' is required to proceed", "ERROR");
				return false;
			} else if (!oData.Lgpla) {
				GlobalFuncs.showMessage("Required Field", "'Bin' is required to proceed", "ERROR");
				return false;
			} /*else if (!oData.Menge || oData.Menge <= 0 || isNaN(oData.Menge)) {
				GlobalFuncs.showMessage("Invalid Qty", "'Qty' is invalid and is required to proceed", "ERROR");
				return false;
			}*/
			// Business requests that we ignore Qty 0
			if (oData.serialNumbersRequired) {
				for (var i = 0; i < oData.serialNumbers.length; i++) {
					var sn = oData.serialNumbers[i].Sernr;
					if (!sn) {
						GlobalFuncs.showMessage("Serial Numbers Required", "Serial Numbers are required to proceed", "ERROR");
						return false;
					}
				}
			}
			return true;
		},
		clear: function() {
			// Clear out appropriate fields
			var oModel = this.getView().getModel();
			oModel.setProperty("/Matnr", "");
			oModel.setProperty("/Maktg", "");
			oModel.setProperty("/Menge", "");
			zController.liveChangeQty(null, 0);
			oModel.setProperty("/Meins", "");
			oModel.setProperty("/Lgpla", "");
			oModel.setProperty("/Sgtxt", "");
			oModel.setProperty("/Verme", "");
			oModel.setProperty("/serialNumbers", []);
			this.getView().getModel().setProperty("/serialNumbersRequired", false);
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
					text: "Selected Serial Numbers"
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
				value: "{Sernr}",
				placeholder: "S/N",
				maxLength: 18,
				editable: false
			});
			var button = new sap.m.Button({
				width: "auto",
				icon: "sap-icon://delete",
				press: function(oEvent) {
					var path = oEvent.getSource().getParent().getBindingContext().getPath();
					var index = path.replace("/", "");
					var sn = zController.getView().getModel().getProperty("/serialNumbers");
					sn.splice(index, 1);
					zController.getView().getModel().setProperty("/Menge", sn.length.toString());
					snTable.getBinding("items").refresh();
				}
			});

			// Add the columns to table
			snTable.addColumn(inputCol);
			snTable.addColumn(buttonCol);

			columnItems.addCell(input);
			columnItems.addCell(button);

			this.getView().byId("vboxSN").addItem(snTable);

			// Add a button for adding more serial numbers
			var addButton = new sap.m.Button({
				icon: "sap-icon://add",
				press: zController.showSerialNumberSelection
			});
			this.getView().byId("vboxSN").addItem(addButton);
		},
		matnrScan: function(oEvent) {
			if (!this.getView().getModel().getProperty("/Lgpla")) {
				GlobalFuncs.showMessage("Error", "Enter a bin number", "ERROR");
				return;
			}
			GlobalFuncs.scan(oEvent, zController.checkMaterial);
		},
		checkMaterial: function() {
			var oModel = zController.getView().getModel();
			var url = "/sap/opu/odata/sap/ZWM_GI_UNPLANNED_SRV/BinMaterialsSet?$filter=Lgnum eq '" + oModel.getProperty("/Lgnum") + "'" +
				" and Werks eq '" +
				oModel.getProperty("/Werks") + "' and Lgpla eq '" + oModel.getProperty("/Lgpla") + "' " + "and Matnr eq '" + oModel.getProperty(
					"/Matnr") + "'";
			$.ajax({
				url: url,
				type: "GET",
				dataType: "json",
				success: function(result, status, xhr) {
					sap.ui.core.BusyIndicator.hide();
				},
				error: function(jqXHR, textStatus, errorThrown) {
					GlobalFuncs.onAjaxError(jqXHR, textStatus, errorThrown);
					oModel.setProperty("/Matnr", "");
				}
			});
		},
		validateFields: function() {
			var oModel = zController.getView().getModel();
			if (oModel.getProperty("/Meins") == "EA" && oModel.getProperty("/Menge").indexOf(".") >= 0) {
				GlobalFuncs.showMessage("Error", "No decimals allowed for Qty", "ERROR");
				return false;
			}
			if (parseFloat(oModel.getProperty("/Menge")) > parseFloat(oModel.getProperty("/Verme"))) {
				MessageBox.show("GI Qty cannot be greater than Available Qty in bin", {
					icon: "ERROR",
					title: "Error"
				});
				return false;
			}
			return true;
		},
		save: function() {
			if (!zController.checkRequiredFields() || !zController.validateFields()) {
				return;
			}
			sap.ui.core.BusyIndicator.show(0);
			// Make sure we save the current item back to the array model
			var oModel = sap.ui.getCore().getModel("GiUnplanned");
			var request = {
				ItemsSet: [],
				SerialNumbersSet: []
			};
			var items = oModel.getProperty("/items");
			var serialNumbers = [];

			for (var i = 0; i < items.length; i++) {
				var row = {};
				var itemNumber = i + 1;
				row.Item = itemNumber.toString(); //Item number for doc
				var item = items[i];
				if (item.Menge<=0){
					continue;
				}
				// Link the SN's to the item
				for (var s = 0; s < item.serialNumbers.length; s++) {
					var sn = item.serialNumbers[s];
					var serialNumber = {};
					serialNumber.MatdocItm = itemNumber.toString();
					if (!sn) {
						GlobalFuncs.showMessage("Error", "Maintain all serial numbers for item " + itemNumber + " before saving", "ERROR");
						sap.ui.core.BusyIndicator.hide();
						return;
					}
					serialNumber.Serialno = sn.Sernr;
					serialNumbers.push(serialNumber);
				}
				// Set the item fields needed for mat doc
				// Move all keys/values to request row except serialNumbers
				for (var key in item) {
					if (key != "Sernp" && key != "Index" && key.substring(0, 1) == key.substring(0, 1).toUpperCase() && key != "Verme") {
						row[key] = item[key];
					}
				}
				request.ItemsSet.push(row);
			}
			request.SerialNumbersSet = serialNumbers;
			request.ReturnSet = [];

			// GET call to retrieve CSRF token for the POST call// Get CSRF token via GET
			var url = "/sap/opu/odata/sap/ZWM_GI_UNPLANNED_SRV/HeaderSet";
			$.ajax({
				url: url,
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
					var headers = xhr.getAllResponseHeaders();
					var csrfToken = xhr.getResponseHeader("x-csrf-token");

					// POST to odata service:
					var jsonData = JSON.stringify(request);
					$.ajax({
						url: url,
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
							var messages = result.d.ReturnSet.results;
							if (messages.length > 0) {
								var message;
								for (var i = 0; i < messages.length; i++) {
									if (!message) {
										message = messages[i].Message;
									} else {
										message = message + "\n" + messages[i].Message;
									}
								}
								if (result.d.Mblnr) {
									GlobalFuncs.showMessage("Success", message, "SUCCESS", zController.goBack);
									var oModel = sap.ui.getCore().getModel("GiUnplanned");
									oModel.setProperty("/items/0/Aufnr", "");
									oModel.setProperty("/items/0/Wempf", "");
									oModel.setProperty("/items/0/Lifnr", "");
									var items = oModel.getProperty("/items");
									while (items.length > 1) {
										items.pop();
									}
									items[0].serialNumbers = [];
									oModel.setProperty("/items", items);
								} else {
									GlobalFuncs.showMessage("Error", message, "ERROR");
								}

							}
							sap.ui.core.BusyIndicator.hide();
						},
						error: function(jqXHR, textStatus, errorThrown) {
							GlobalFuncs.onAjaxError(jqXHR, textStatus, errorThrown);
							sap.ui.core.BusyIndicator.hide();
						}
					});

				},
				error: function(jqXHR, textStatus, errorThrown) {
					GlobalFuncs.onAjaxError(jqXHR, textStatus, errorThrown);
					sap.ui.core.BusyIndicator.hide();
				}
			});
		},
		handleSNClose: function(oEvent) {

		},
		handleSNConfirm: function(oEvent) {
			var oModel = this.getView().getModel();
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([]);
			var aContexts = oEvent.getParameter("selectedContexts");
			if (aContexts && aContexts.length) {
				var selectedSNs = aContexts.map(function(oContext) {
					return {
						Matnr: oContext.getObject().Matnr,
						Sernr: oContext.getObject().Sernr
					};
				});

				// Remove any null values
				var sn = oModel.getProperty("/serialNumbers");
				var count = sn.length;
				while (count > 0) {
					count--;
					if (!sn[count].Sernr) {
						sn.splice(count, 1);
					}
				}

				// Add new selections
				for (var i = 0; i < selectedSNs.length; i++) {
					sn.push({
						Sernr: selectedSNs[i].Sernr
					});
				}
				zController.liveChangeQty(null, sn.length);
			}
		},
		handleSNSearch: function(oEvent) {
			var searchStr = oEvent.getParameter("value");
			zController.filterTable(oEvent.getSource(), ["Matnr", "Sernr"], searchStr);

		},
		filterTableSearch: function(oTable, fields, filterString) {
			// filter list
			var oBinding = oTable.getBinding("items");
			if (oBinding) {
				var oFilters = [];
				for (var i = 0; i < fields.length; i++) {
					oFilters.push(new sap.ui.model.Filter(fields[i], sap.ui.model.FilterOperator.Contains, filterString));
				}
				var filterObj = new sap.ui.model.Filter(oFilters, false);
				oBinding.filter(filterObj);
			} else {
				oBinding.filter([]);
			}
		},
		showSerialNumberSelection: function(oEvent, material) {
			sap.ui.core.BusyIndicator.show(0);

			var that = zController;
			var oModel = zController.getView().getModel();

			if (!material) {
				material = oModel.getProperty("/Matnr");
			}

			var larray_filters = new Array();
			var l_filterMatnr = new sap.ui.model.Filter({
				path: "Matnr",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: material
			});
			larray_filters.push(l_filterMatnr);

			var l_filterMatnr = new sap.ui.model.Filter({
				path: "Matnr",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: material
			});
			larray_filters.push(l_filterMatnr);

			var l_filterBlart = new sap.ui.model.Filter({
				path: "Blart",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: "WA"
			});
			larray_filters.push(l_filterBlart);

			// Filter out serial numbers already selected
			// to prevent duplicate selections
			var sn = oModel.getProperty("/serialNumbers");
			var filter;
			var filters = [];
			for (var i = 0; i < sn.length; i++) {
				larray_filters.push(new sap.ui.model.Filter({
					path: "Sernr",
					operator: sap.ui.model.FilterOperator.NE,
					value1: sn[i].Sernr
				}));
			}

			// Call the Serial Number help
			var oDataModel = zController.getView().getModel("Gwarehouse");
			oDataModel.read("/MaterialSNSet", {
				filters: larray_filters,
				success: function(oData) {
					var oDataResultModel = new sap.ui.model.json.JSONModel();
					oDataResultModel.setData(oData);
					that.getView().setModel(oDataResultModel, "SNTable");
					if (!that._oDialog) {
						that._oDialog = sap.ui.xmlfragment("smud.org.wmLM01.fragments.serialNumbers", that);
					}
					that.getView().addDependent(that._oDialog);
					jQuery.sap.syncStyleClass("sapUiSizeCompact", that.getView(), that._oDialog);
					sap.ui.core.BusyIndicator.hide();
					that._oDialog.open();
				},
				error: function(oError) {
					MessageBox.show(JSON.parse(oError.responseText).error.message.value, {
						title: "Error",
						icon: "ERROR"
					});
				}

			});

			sap.ui.core.BusyIndicator.hide();
		},
		changeMaterial: function(oEvent) {

		},
		clearSerialNumberSelection: function(oEvent) {
			this.getView().getModel().setProperty("/Menge", "");
			zController.liveChangeQty(null, 0);
		}
	});

});