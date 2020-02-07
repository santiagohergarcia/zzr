sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox"
], function(Controller, MessageBox) {
	"use strict";

	var zController;
	var GlobalFuncs = sap.ui.controller("smud.org.wmLM01.controller.GlobalFuncs");

	return Controller.extend("smud.org.wmLM01.controller.WmStockOverview", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf smud.org.wmLM01.view.WmStockOverview
		 */
		onInit: function() {
			this.getView().setModel(sap.ui.getCore().getModel("WmStockOverview"));
			zController = this;
			this.createTable();
		},
		scan: function(oEvent) {
			GlobalFuncs.scan(oEvent);
		},
		matnrLiveChange: function(oEvent) {
			var oModel = zController.getView().getModel();
			oModel.setProperty("/Meins", "");
			oModel.setProperty("/Maktg", "");
			var table = sap.ui.getCore().byId(zController.getView().createId("overviewTable"));
			table.removeAllItems();
		},
		uppercaseNoSpecial: function(oEvent) {
			GlobalFuncs.uppercaseNoSpecial(oEvent);
		},
		getInventory: function() {
			var busy = new sap.m.BusyDialog({
				text: "Searching for Inventory"
			});
			busy.open();
			var data = zController.getView().getModel().getData();
			var oModel = zController.getView().getModel();
			var oDataModel = this.getView().getModel("Gwarehouse");

			// Filters for Entity Set
			var filters = [new sap.ui.model.Filter({
					path: "Lgnum",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: data.Lgnum
				}),
				new sap.ui.model.Filter({
					path: "Werks",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: data.Werks
				}),
				new sap.ui.model.Filter({
					path: "Lgort",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: data.Lgort
				}),
				new sap.ui.model.Filter({
					path: "Matnr",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: data.Matnr
				})
			];

			oDataModel.read("/StockOverviewSet", {
				filters: filters,
				success: function(oResult) {
					var oData = oResult.results; // array returned
					/*	var oModel = sap.ui.getCore().getModel("WmStockOverview");
						oModel.setProperty("/Lgnum", oData.Warehouse);
						oModel.setProperty("/Werks", oData.Plant);
						oModel.setProperty("/Lgort", oData.StorageLoc);
						sap.ui.core.BusyIndicator.hide();
						sap.ui.core.UIComponent.getRouterFor(zController).navTo("WmStockOverview"); */
					oModel.setProperty("/Maktg", oData[0].Maktg);
					oModel.setProperty("/Meins", oData[0].Meins);

					var colItemTemplate = sap.ui.getCore().byId(zController.getView().createId("tableColumnListItem"));
					var tabModel = new sap.ui.model.json.JSONModel(oData, false);
					tabModel.setData(oData, false);

					var context = new sap.ui.model.Context(tabModel, "/");
					var oTable = sap.ui.getCore().byId(zController.getView().createId("overviewTable"));
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
		createTable: function() {
			// Create the item table via JS
			var oTable = new sap.m.Table(zController.getView().createId("overviewTable"), {
				headerText: "Stock Overview",
				width: "100%",
				growing: true,
				alternateRowColors: true,
				//filter: zController.handleMaterialSearch,
				growingThreshold: 50,
				noDataText: "No data"
					//type: "Active" //enables itemPress event
			});
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
						items: [
							new sap.m.VBox({
								items: [
									new sap.m.Label({
										text: "Stor.Type",
										design: "Standard"
									}),
									new sap.m.Input({
										value: "{Lgtyp}",
										editable: false,
										width: "auto"
									})
								]
							}),
							new sap.m.VBox({
								items: [
									new sap.m.Label({
										text: "Bin",
										design: "Standard"
									}),
									new sap.m.Input({
										value: "{Lgpla}",
										editable: false,
										width: "auto"
									})
								]
							}),
							new sap.m.VBox({
								items: [
									new sap.m.Label({
										text: "Stk.Type",
										design: "Standard"
									}),
									new sap.m.Input({
										value: "{Sobkz}",
										editable: false,
										width: "auto"
									})
								]
							})
						]
					}),
					new sap.m.HBox({
						items: [
							new sap.m.VBox({
								items: [
									new sap.m.Label({
										text: "Total",
										design: "Standard"
									}),
									new sap.m.Input({
										value: "{Gesme}",
										editable: false,
										width: "auto"
									})
								]
							}),
							new sap.m.VBox({
								items: [
									new sap.m.Label({
										text: "Available",
										design: "Standard"
									}),
									new sap.m.Input({
										value: "{Verme}",
										editable: false,
										width: "auto"
									})
								]
							}),
							new sap.m.VBox({
								items: [
									new sap.m.Label({
										text: "Putaway",
										design: "Standard"
									}),
									new sap.m.Input({
										value: "{Einme}",
										editable: false,
										width: "auto"
									})
								]
							}),
							new sap.m.VBox({
								items: [
									new sap.m.Label({
										text: "Picking",
										design: "Standard"
									}),
									new sap.m.Input({
										value: "{Ausme}",
										editable: false,
										width: "auto"
									})
								]
							})
						]
					})
				]
			});

			// Add the columns to table
			oTable.addColumn(inputCol);

			columnItems.addCell(vbox);

			this.getView().byId("vboxTable").addItem(oTable);
		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf smud.org.wmLM01.view.WmStockOverview
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf smud.org.wmLM01.view.WmStockOverview
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf smud.org.wmLM01.view.WmStockOverview
		 */
		//	onExit: function() {
		//
		//	}

	});

});