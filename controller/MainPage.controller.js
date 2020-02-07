sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ndc/BarcodeScanner",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox"
], function(Controller, BarcodeScanner, JSONModel, MessageBox) {
	"use strict";

	var zController;
	var GlobalFuncs = sap.ui.controller("smud.org.wmLM01.controller.GlobalFuncs");
	var poNumber;

	return Controller.extend("smud.org.wmLM01.controller.MainPage", {
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf smud.org.wmLM01.view.MainPage
		 */
		onInit: function() {
			zController = this;
			// Set the model for the view to bind properties
			this.getView().setModel(sap.ui.getCore().getModel("MainPage"));

			// For cross-app navigation
			//https://blogs.sap.com/2016/06/20/cross-application-navigation-between-sapui5-applications/
			//	this.getRouter().getRoute("master").attachPatternMatched(this._onMasterMatched, this);
		},
		_onMasterMatched: function() {
			/*	var supplierID;
				var startupParams = this.getOwnerComponent().getComponentData().startupParameters; // get Startup params from Owner Component
				if ((startupParams.supplierID && startupParams.supplierID[0])) {
					this.getRouter().navTo("object", {
						supplierID: startupParams.supplierID[0] // read Supplier ID. Every parameter is placed in an array therefore [0] holds the value
					}, true);
				} else {
					this.getOwnerComponent().oListSelector.oWhenListLoadingIsDone.then(
						function(mParams) {
							if (mParams.list.getMode() === "None") {
								return;
							}
							supplierID = mParams.firstListitem.getBindingContext().getProperty("SupplierID");
							this.getRouter().navTo("object", {
								supplierID: supplierID
							}, true);
						}.bind(this),
						function(mParams) {
							if (mParams.error) {
								return;
							}
							this.getRouter().getTargets().display("detailNoObjectsAvailable");
						}.bind(this)
					);
				} */
		},
		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf smud.org.wmLM01.view.MainPage
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf smud.org.wmLM01.view.MainPage
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf smud.org.wmLM01.view.MainPage
		 */
		//	onExit: function() {
		//
		//	} 
		scanPoNumber: function(oEvent) {
			GlobalFuncs.scan(oEvent, zController.getOpenItems);
		},
		scanForPrint: function(oEvent) {
			GlobalFuncs.scan(oEvent, zController.getPrintItems);
		},
		scanMaterial: function(oEvent) {
			GlobalFuncs.scan(oEvent);
		},
		getOpenItems: function() {
			var oModel = zController.getView().getModel();
			sap.ui.core.BusyIndicator.show(0);
			//Get the PO# from input field
			poNumber = oModel.getProperty("/grEbeln");
			// Clear Serial Numbers
			sap.ui.getCore().serialNumbers = {};
			if (poNumber) {
				var getItemsURL = "/sap/opu/odata/sap/ZWM_GOODS_RECEIPT_SRV/ItemsSet?$filter=PoNumber eq '" + poNumber + "'";
				$.ajax({
					url: getItemsURL,
					type: "GET",
					dataType: "json",
					success: zController.onSuccess,
					error: zController.onError
				});
			} else {
				sap.ui.core.BusyIndicator.hide();
			}
		},
		getPrintItems: function() {
			var oData = zController.getView().getModel().getData();
			sap.ui.core.BusyIndicator.show(0);
			//Get the PO# from input field
			poNumber = oData.grPrintEbeln;
			var matDocNumber = oData.grPrintMblnr;
			var getItemsURL;
			if (poNumber && matDocNumber) {
				getItemsURL = "/sap/opu/odata/sap/ZWM_GOODS_RECEIPT_SRV/LabelPrintSet?$filter=PoNumber eq '" + poNumber +
					"' and MatDocNumber eq '" + matDocNumber + "'";
			} else if (poNumber) {
				getItemsURL = "/sap/opu/odata/sap/ZWM_GOODS_RECEIPT_SRV/LabelPrintSet?$filter=PoNumber eq '" + poNumber + "'";
			} else if (matDocNumber) {
				getItemsURL = "/sap/opu/odata/sap/ZWM_GOODS_RECEIPT_SRV/LabelPrintSet?$filter=MatDocNumber eq '" + matDocNumber + "'";
			} else {
				sap.ui.core.BusyIndicator.hide();
				return;
			}
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
				success: zController.onSuccessGetPrintItems,
				error: zController.onError
			});
		},
		onSuccess: function(result, status, xhr) {
			// Get the CSRF token and store it globally so we can access it
			// later via POST calls
			var headers = xhr.getAllResponseHeaders();

			if (result.d.results.length === 0) {
				GlobalFuncs.showMessage("Information", "No open GR items for this PO number", "ERROR");
				sap.ui.core.BusyIndicator.hide();
				return;
			} else {
				var oModel = sap.ui.getCore().getModel("GrOpenItems");
				oModel.setProperty("/items", result.d.results);
				oModel.refresh();
				sap.ui.core.UIComponent.getRouterFor(zController).navTo("GrOpenItems");
				sap.ui.core.BusyIndicator.hide();
			}
		},
		onError: function(jqXHR, textStatus, errorThrown) {
			GlobalFuncs.showMessage("Error", jqXHR.responseJSON.error.message.value);
			sap.ui.core.BusyIndicator.hide();
		},
		onSuccessGetPrintItems: function(result, status, xhr) {
			// Get the CSRF token and store it globally so we can access it
			// later via POST calls
			var headers = xhr.getAllResponseHeaders();
			sap.ui.getCore().csrfToken = xhr.getResponseHeader("x-csrf-token");

			var oModel = sap.ui.getCore().getModel("GrPrintItems");
			oModel.setProperty("/items", result.d.results);
			oModel.refresh();

			// Bind the path to the data table contained in "Result" from the
			//REST call.
			if (result.d.results.length === 0) {
				GlobalFuncs.showMessage("Information", "There are no labels to print");
				sap.ui.core.BusyIndicator.hide();
				return;
			} else {
				sap.ui.core.UIComponent.getRouterFor(zController).navTo("GrPrintItems");
				sap.ui.core.BusyIndicator.hide();
			}
		},
		goToPutaway: function() {
			var putawayModel = sap.ui.getCore().getModel("PutawayItem");
			var mainData = this.getView().getModel().getData();

			sap.ui.core.BusyIndicator.show(0);
			var material = mainData.putawayMatnr;
			var getItemsURL;
			if (mainData.consignment) {
				// Consignment Indicator is checked
				getItemsURL = "/sap/opu/odata/sap/ZWM_PUTAWAY_SRV/PutawaySet?$filter=Material eq '" + material + "'" +
					" and SpecialStock eq 'K'";
			} else {
				getItemsURL = "/sap/opu/odata/sap/ZWM_PUTAWAY_SRV/PutawaySet?$filter=Material eq '" + material + "'";
			}
			if (!material) {
				GlobalFuncs.showMessage("Error", "Enter a Material/UPC number");
				sap.ui.core.BusyIndicator.hide();
				return;
			}

			$.ajax({
				url: getItemsURL,
				type: "GET",
				dataType: "json",
				success: function(result, status, xhr) {
					// Set the Bin values for dropdown
					var bins = [];
					var description = "";
					var vendor = "";
					var uom = "";
					for (var i = 0; i < result.d.results.length; i++) {
						var row = result.d.results[i];
						if (row.Bin != 'OTHER_BIN') {
							bins.push({
								key: row.Bin,
								text: row.Bin + " / Qty: " + row.TotalQty
							});
						}
						description = row.Description;
						uom = row.Uom;
						vendor = row.PutawayVendor;
						if (i == 0) {
							if (mainData.consignment) {
								row.SpecialStock = "K";
							}
							putawayModel.setProperty("/", row);

							// Add OTHER_BIN option
							if (row.Bin != 'OTHER_BIN') {
								bins.push({
									key: "OTHER_BIN",
									text: "Other Bin"
								});
							}
						}
					}

					if (bins.length === 0) {
						bins.push({
							key: "OTHER_BIN",
							text: "Other Bin"
						});
					}

					// Set the other fields in PutawayItem view
					putawayModel.setProperty("/Material", mainData.putawayMatnr);
					putawayModel.setProperty("/Description", description);
					putawayModel.setProperty("/PutawayVendor", vendor);
					putawayModel.setProperty("/Uom", uom);
					putawayModel.setProperty("/consignment", mainData.consignment);

					// Clear the Confirm Bin
					putawayModel.setProperty("/BinConfirm", "");
					putawayModel.setProperty("/Bin", "");
					putawayModel.setProperty("/PutawayQty", ""); // Qty
					putawayModel.setProperty("/bins", bins);
					if (bins.length > 1) {
						putawayModel.setProperty("/otherBin", false);
					} else {
						putawayModel.setProperty("/otherBin", true);
					}

					// Default selection to index 0 which is the Primary bin returned by Odata
					if (sap.ui.getCore().putawayView) {
						var view = sap.ui.getCore().putawayView;
						sap.ui.getCore().byId(view.createId("inpBinLoc")).setSelectedKey(bins[0].key);
					}

					putawayModel.refresh();

					// Go to Putaway
					sap.ui.core.UIComponent.getRouterFor(zController).navTo("PutawayItem");
					sap.ui.core.BusyIndicator.hide();
				},
				error: this.onError
			});
		},
		goToReturn: function() {
			sap.ui.core.BusyIndicator.show(0);
			var oModel = this.getView().getModel("Gwarehouse");
			oModel.read("/WarehouseUserAssignmentSet?$filter=IssRecLbl eq 'I'", {
				success: function(oResult) {
					var oData = oResult.results[0];
					var oModel = sap.ui.getCore().getModel("ReturnItems");
					oModel.setProperty("/items/0/Lgnum", oData.Warehouse);
					oModel.setProperty("/items/0/Werks", oData.Plant);
					oModel.setProperty("/items/0/Lgort", oData.StorageLoc);
					sap.ui.core.UIComponent.getRouterFor(zController).navTo("Return");
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
		goToReturnPrint: function() {
			sap.ui.core.BusyIndicator.show(0);
			var oDataModel = this.getView().getModel("Gwarehouse");
			oDataModel.read("/WarehouseUserAssignmentSet?$filter=IssRecLbl eq 'L'", {
				success: function(oResult) {
					var oData = oResult.results[0];
					var oModel = sap.ui.getCore().getModel("ReturnPrint");
					oModel.setProperty("/Lgnum", oData.Warehouse);
					sap.ui.core.BusyIndicator.hide();
					sap.ui.core.UIComponent.getRouterFor(zController).navTo("ReturnPrint");
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
		goToGiPlanned: function() {
			var busy = new sap.m.BusyDialog({
				text: "Loading warehouse data"
			});
			busy.open();
			var oDataModel = this.getView().getModel("Gwarehouse");
			oDataModel.read("/WarehouseUserAssignmentSet?$filter=IssRecLbl eq 'I'", {
				success: function(oResult) {
					var oData = oResult.results[0];
					var oModel = sap.ui.getCore().getModel("GiPlanned");
					oModel.setProperty("/Lgnum", oData.Warehouse);
					busy.close();
					sap.ui.core.UIComponent.getRouterFor(zController).navTo("GiPlanned");
				},
				error: function(oError) {
					MessageBox.show(JSON.parse(oError.responseText).error.message.value, {
						title: "Error",
						icon: "ERROR"
					});
					busy.close();
				}
			});
		},
		goToGiUnplanned: function() {
			sap.ui.core.BusyIndicator.show(0);
			var oModel = sap.ui.getCore().getModel("GiUnplanned");

			// Get the warehouse data for Goods Issue
			var getItemsURL = "/sap/opu/odata/sap/ZWM_WAREHOUSE_APPLICATIONS_SRV/WarehouseUserAssignmentSet?$filter=IssRecLbl eq 'I'";
			$.ajax({
				url: getItemsURL,
				type: "GET",
				dataType: "json",
				success: function(result, status, xhr) {
					var headers = xhr.getAllResponseHeaders();
					if (result.d.results[0]) {
						sap.ui.getCore().warehouseUserAssignment = result.d.results[0];
						var warehouse = result.d.results[0];
						oModel.setProperty("/items/0/Lgort", warehouse.StorageLoc);
						oModel.setProperty("/items/0/Werks", warehouse.Plant);
						oModel.setProperty("/items/0/Lgnum", warehouse.Warehouse);
						sap.ui.core.UIComponent.getRouterFor(zController).navTo("GiUnplanned");
						sap.ui.core.BusyIndicator.hide();
					} else {
						sap.ui.core.BusyIndicator.hide();
						GlobalFuncs.showMessage("Error", "No User-Warehouse profile exists for Goods Issue");
					}
				},
				error: this.onError
			});
		},
		goToGiReplenish: function() {
			
		},
		checkNumber: function(oEvent) {
			var newValue = oEvent.getSource().getValue().replace(/\D/g, '');
			oEvent.getSource().setValue(newValue);
		},
		// Begin Insert for RAppana 12/02/2019[
		goToGmBinToBin: function() {
			sap.ui.core.BusyIndicator.show(0);
			var oDataModel = this.getView().getModel("Gwarehouse");
			var oDataLocalBinModel = sap.ui.getCore().getModel("GmBinToBin");
			oDataModel.read("/WarehouseUserAssignmentSet?$filter=IssRecLbl eq 'I'", {
				success: function(oData) {
					var oDataResultModel = new sap.ui.model.json.JSONModel();

					oDataResultModel.setData(oData);
					oDataLocalBinModel.setProperty("/Lgnum", oDataResultModel.getProperty("/results/0/Warehouse"));
					oDataLocalBinModel.setProperty("/Werks", oDataResultModel.getProperty("/results/0/Plant"));
					oDataLocalBinModel.setProperty("/Lgort", oDataResultModel.getProperty("/results/0/StorageLoc"));
					sap.ui.getCore().setModel(oDataLocalBinModel, "GmResultModel");
					sap.ui.core.UIComponent.getRouterFor(zController).navTo("GmBinToBin");
				},
				error: function(oError) {
					MessageBox.show(JSON.parse(oError.responseText).error.message.value, {
						title: "Error",
						icon: "ERROR"
					});
				}
			});
			// https://sapgd1.smud.org:8001/sap/opu/odata/sap/ZWM_WAREHOUSE_APPLICATIONS_SRV/WarehouseUserAssignmentSet
			sap.ui.core.BusyIndicator.hide();

		},
		// ]End Insert for RAppana 12/02/2019
		goToWmInventory: function() {
			//	sap.ui.core.UIComponent.getRouterFor(zController).navTo("WmInventory");
			//	sap.ui.core.BusyIndicator.hide();

			//	var supplier = oEvent.getSource().getBindingContext().getProperty("Product/SupplierID"); // read SupplierID from OData path Product/SupplierID
			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation"); // get a handle on the global XAppNav service
			var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
				target: {
					semanticObject: "LM50_INVENTORY",
					action: "create"
				},
				params: {
					//	"supplierID": supplier
				}
			})) || ""; // generate the Hash to display a Supplier
			oCrossAppNavigator.toExternal({
				target: {
					shellHash: hash
				}
			}); // navigate to Supplier application
		},
		goToWmPrintBinLabel: function() {
			sap.ui.core.BusyIndicator.show(0);
			var oWarehouseModel = this.getView().getModel("Gwarehouse");
			oWarehouseModel.read("/WarehouseUserAssignmentSet?$filter=IssRecLbl eq 'L'", {
				success: function(oResult) {
					var oData = oResult.results[0];
					var oModel = sap.ui.getCore().getModel("WmPrintBinLabel");
					oModel.setProperty("/Lgnum", oData.Warehouse);
					sap.ui.core.UIComponent.getRouterFor(zController).navTo("WmPrintBinLabel");
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
		f4PutawayMatnr: function() {
			// Show all materials in the Putaway bin eligible for Putaway transaction
			var busy = new sap.m.BusyDialog({
				text: "Searching for materials in PUTAWAY bin"
			});
			busy.open();

			var that = this;
			var oModel = this.getView().getModel();
			var lgnum = oModel.getProperty("/putawayLgnum");
			var filters = new Array();
			var filterLgnum = new sap.ui.model.Filter({
				path: "Lgnum",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: lgnum
			});
			filters.push(filterLgnum);
			var oDataModel = this.getView().getModel("Putaway");
			oDataModel.read("/MaterialsSet", {
				filters: filters,
				success: function(oData) {
					var oDataResultModel = new sap.ui.model.json.JSONModel();
					oDataResultModel.setData(oData);
					that.getView().setModel(oDataResultModel, "matTable");
					if (!that._oDialog) {
						that._oDialog = sap.ui.xmlfragment("smud.org.wmLM01.fragments.putawayMaterials", that);
					}
					that.getView().addDependent(that._oDialog);
					jQuery.sap.syncStyleClass("sapUiSizeCompact", that.getView(), that._oDialog);
					busy.close();
					that._oDialog.open();
				},
				error: function(oError) {
					MessageBox.show(JSON.parse(oError.responseText).error.message.value, {
						title: "Error",
						icon: "ERROR"
					});
					busy.close();
				}
			});
		},
		handlePutawayMaterialSelect: function(oEvent) {
			var oModel = this.getView().getModel();
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([]);
			var aContexts = oEvent.getParameter("selectedContexts");
			var matnr;
			if (aContexts && aContexts.length) {
				var selectedMaterialNbr = aContexts.map(function(oContext) {
					// This returns an array
					return oContext.getObject().Matnr;
				});
				if (selectedMaterialNbr[0]) {
					matnr = selectedMaterialNbr[0];
				} else {
					matnr = selectedMaterialNbr;
				}
				oModel.setProperty("/putawayMatnr", matnr);
				zController.goToPutaway();
			}
		},
		handleMaterialSearch: function(oEvent) {
			var searchStr = oEvent.getParameter("value");
			zController.filterTable(oEvent.getSource(), ["Matnr", "Maktg", "Meins"], searchStr);
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
		goToWmStockOverview: function() {
			sap.ui.core.BusyIndicator.show(0);
			var oDataModel = this.getView().getModel("Gwarehouse");
			oDataModel.read("/WarehouseUserAssignmentSet?$filter=IssRecLbl eq 'I'", {
				success: function(oResult) {
					var oData = oResult.results[0];
					var oModel = sap.ui.getCore().getModel("WmStockOverview");
					oModel.setProperty("/Lgnum", oData.Warehouse);
					oModel.setProperty("/Werks", oData.Plant);
					oModel.setProperty("/Lgort", oData.StorageLoc);
					sap.ui.core.BusyIndicator.hide();
					sap.ui.core.UIComponent.getRouterFor(zController).navTo("WmStockOverview");
				},
				error: function(oError) {
					MessageBox.show(JSON.parse(oError.responseText).error.message.value, {
						title: "Error",
						icon: "ERROR"
					});
					sap.ui.core.BusyIndicator.hide();
				}
			});
		}
	});
});