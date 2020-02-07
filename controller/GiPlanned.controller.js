sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox"
], function(Controller, MessageToast, JSONModel, MessageBox) {
	"use strict";

	var GlobalFuncs = sap.ui.controller("smud.org.wmLM01.controller.GlobalFuncs");
	var zController;

	return Controller.extend("smud.org.wmLM01.controller.GiPlanned", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf smud.org.wmLM01.view.GiPlanned
		 */
		onInit: function() {
			zController = this;
			this.getView().setModel(sap.ui.getCore().getModel("GiPlanned"));
			this.createTable();

			this._oView = this.getView();
			this._oView.addEventDelegate({
				onBeforeHide: function(oEvent) {
					// Remove items from the table and clear filter search on BACK
					sap.ui.getCore().byId(zController.createId("materialTable")).removeAllItems();
					sap.ui.getCore().byId(zController.getView().createId("materialTableSearch")).setValue("");
					zController.getView().getModel().setProperty("/Tanum", "");
					zController.getView().getModel().setProperty("/Benum", "");
				},
				onAfterHide: function(oEvent) {
					//     debugger;
				}
			}, this);
		},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf smud.org.wmLM01.view.GiPlanned
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf smud.org.wmLM01.view.GiPlanned
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf smud.org.wmLM01.view.GiPlanned
		 */
		//onExit: function() {

		//},
		getItems: function() {
			var oTable = sap.ui.getCore().byId(zController.getView().createId("materialTable"));
			var oModel = zController.getView().getModel();
			var data = zController.getView().getModel().getData();
			oTable.removeAllItems();
			if (oTable.getBinding("items")) {
				oTable.getBinding("items").refresh();
			}
			oModel.setProperty("/Benum", "");
			if (!data.Tanum) {
				MessageBox.show("Enter a Transfer Order", {
					title: "Error",
					icon: "ERROR"
				});
				return;
			}
			// Busy dialog...
			var busy = new sap.m.BusyDialog({
				text: "Retrieving transfer order items to confirm"
			});
			busy.open();

			// Filters for Entity Set
			var filters = [
				new sap.ui.model.Filter({
					path: "Lgnum",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: data.Lgnum
				}),
				new sap.ui.model.Filter({
					path: "Tanum",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: data.Tanum
				})
			];

			var oDataModel = this.getView().getModel("GiPlannedService");
			oDataModel.read("/ItemsSet", {
				filters: filters,
				success: function(oResult) {
					var firstRow = oResult.results[0];
					var oData = oResult.results;
					oModel.setProperty("/Benum", firstRow.Benum);

					for (var i = 0; i < oData.length; i++) {
						oData[i].VsolmConfirm = "";
					}

					// Bind the results to the material table
					var colItemTemplate = sap.ui.getCore().byId(zController.getView().createId("tableColumnListItem"));
					var tabModel = new sap.ui.model.json.JSONModel(oData, false);
					tabModel.setData(oData, false);
					var context = new sap.ui.model.Context(tabModel, "/");
					oTable.setBindingContext(context);
					oTable.setModel(tabModel);
					oTable.bindItems("/", colItemTemplate);

					busy.close();
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

		scan: function(oEvent) {
			GlobalFuncs.scan(oEvent);
		},
		scanTanum: function(oEvent) {
			GlobalFuncs.scan(oEvent, zController.getItemsAfterScan);
		},
		getItemsAfterScan: function() {
			if (zController.getView().getModel().getProperty("/Tanum")) {
				zController.getItems();
			}
		},
		createTable: function() {
			// Create the item table via JS
			var oTable = new sap.m.Table(zController.getView().createId("materialTable"), {
				headerText: "Confirm Items",
				width: "100%",
				growing: true,
				filter: zController.handleMaterialSearch,
				alternateRowColors: true,
				growingThreshold: 50,
				noDataText: "No items selected to confirm",
				type: "Active" //enables itemPress event
			});

			var toolbar = new sap.m.Toolbar({
				content: [
					new sap.m.SearchField(zController.getView().createId("materialTableSearch"), {
						placeholder: "Search for items to confirm",
						liveChange: zController.handleMaterialSearch
					})
				]
			});
			oTable.setHeaderToolbar(toolbar);

			//columns!!!
			var inputCol = new sap.m.Column({
				width: "75%"
			});
			// rows!!!
			var columnItems = new sap.m.ColumnListItem(this.getView().createId("tableColumnListItem"), {
				//	type: "Active" //enables itemPress event
			});
			//create cells to add to the rows.
			var vbox = new sap.m.VBox({
				items: [

					new sap.m.HBox({
						alignItems: sap.m.FlexAlignItems.Center,
						items: [
							new sap.m.Label({
								text: "Item/Recip.",
								design: "Standard",
								width: "auto"
							}),
							new sap.m.Input({
								value: "{Tapos}",
								placeholder: "",
								maxLength: 5,
								editable: false,
								width: "75px"
							}),
							new sap.m.Input({
								value: "{Wempf}",
								placeholder: "",
								maxLength: 12,
								editable: false,
								width: "auto"
							})
						]
					}),

					new sap.m.Input({
						value: "{Matnr}",
						placeholder: "",
						maxLength: 18,
						editable: false,
						width: "100%",
						description: "{Maktx}"
					}),
					new sap.m.Input({
						value: "{Vlpla}",
						placeholder: "Bin",
						maxLength: 10,
						editable: false,
						width: "200px"
					}),
					new sap.m.HBox({
						alignItems: sap.m.FlexAlignItems.Center,
						items: [
							new sap.m.Input({
								value: "{VlplaConfirm}",
								placeholder: "Confirm Bin",
								change: zController.uppercaseNoSpecial,
								maxLength: 10,
								editable: true,
								width: "200px"
							}),
							new sap.m.Button({
								icon: "sap-icon://bar-code",
								width: "50px",
								press: function(oEvent) {
									var path = oEvent.getSource().getParent().getBindingContext().getPath();
									var index = path.replace("/", "");
									var table = sap.ui.getCore().byId(zController.getView().createId("materialTable"));
									var tabBinding = table.getBinding("items");
									var tabModel = table.getModel();
									// Scan bin
									$.sap.require("sap.ndc.BarcodeScanner");
									sap.ndc.BarcodeScanner.scan(
										function(oResult) {
											if (oResult.cancelled) {
												return;
											}
											// Set the value of input control
											if (oResult.text.length > 10) {
												MessageBox.show("Invalid", "Bin max length is 10", {
													title: "Error",
													icon: "ERROR"
												});
												return;
											}
											var path = "/" + index + "/VlplaConfirm";
											var newValue = oResult.text.toUpperCase();
											tabModel.setProperty(path, newValue);
											tabBinding.refresh();
										},
										function(oError) {},
										function(oInputChange) {}
									);
								},
								enabled: true
							})
						]
					}),
					new sap.m.HBox({
						items: [
							new sap.m.Input({
								value: "{Vsolm}",
								placeholder: "Qty",
								type: "Number",
								editable: false, //"{= ${Sernp} === '' }",
								width: "250px",
								description: "{Meins}" //"Return Qty"
							})
						]
					}),
					new sap.m.Input({
						value: "{VsolmConfirm}",
						placeholder: "Confirm Qty",
						type: "Number",
						editable: true,
						width: "250px",
						description: "{Meins}" //"Return Qty"
					})
				]
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
					oTable.getBinding("items").refresh();
				}
			});

			// Add the columns to table
			oTable.addColumn(inputCol);

			columnItems.addCell(vbox);

			this.getView().byId("vboxTable").addItem(oTable);
		},
		uppercaseNoSpecial: function(oEvent) {
			GlobalFuncs.uppercaseNoSpecial(oEvent);
		},
		handleMaterialSearch: function(oEvent) {
			var searchStr = oEvent.getSource().getValue();
			zController.filterTable(sap.ui.getCore().byId(zController.getView().createId("materialTable")), ["Matnr", "Maktx", "Meins", "Vlpla",
				"Wempf"
			], searchStr);
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
				if (oBinding) {
					oBinding.filter([]);
				}
			}
		},
		tanumLiveChange: function(oEvent) {
			var oModel = zController.getView().getModel();
			oModel.setProperty("/Benum", "");
			var table = sap.ui.getCore().byId(zController.getView().createId("materialTable"));
			table.removeAllItems();
		},
		save: function() {
			var viewData = zController.getView().getModel().getData();
			var viewModel = zController.getView().getModel();
			var tabModel = sap.ui.getCore().byId(zController.getView().createId("materialTable")).getModel();
			var tabData = tabModel.getData();
			var items = [];

			for (var i = 0; i < tabData.length; i++) {
				if (tabData[i].VsolmConfirm && tabData[i].VsolmConfirm > 0) {
					if (tabData[i].Vlpla != tabData[i].VlplaConfirm) {
						MessageBox.show("Item " + tabData[i].Tapos + " 'Confirm Bin' is incorrect", {
							title: "Error",
							icon: "ERROR"
						});
						busy.close();
						return;
					}
					items.push(tabData[i]);
				}
			}
			if (items.length === 0) {
				MessageBox.show("No items have been confirmed (Qty > 0)", {
					title: "Error",
					icon: "ERROR"
				});
				busy.close();
				return;
			}
			// Busy dialog...
			var busy = new sap.m.BusyDialog({
				text: "Saving confirmation of transfer order " + viewData.Tanum
			});
			busy.open();

			var oDataModel = this.getView().getModel("GiPlannedService");
			var request = {
				Lgnum: viewData.Lgnum,
				Tanum: viewData.Tanum,
				Benum: viewData.Benum,
				ItemsSet: items
			};
			oDataModel.create("/HeaderSet", request, {
				success: function(data, response) {
					var hdrMessage = response.headers["sap-message"];
					var hdrMessageObject = JSON.parse(hdrMessage);
					var message = hdrMessageObject.message;
					GlobalFuncs.showMessage("Success", message, "SUCCESS", zController.goBack);
					// Clear table and view data
					var table = sap.ui.getCore().byId(zController.getView().createId("materialTable"));
					var tabModel = table.removeAllItems();
					table.getBinding("items").refresh();
					viewModel.setProperty("/Tanum", "");
					viewModel.setProperty("/Benum", "");
					busy.close();
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
		goBack: function() {
			window.history.go(-1);
		}
	});
});