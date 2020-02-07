sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox"
], function(Controller, MessageBox) {
	"use strict";

	var zController;
	var GlobalFuncs = sap.ui.controller("smud.org.wmLM01.controller.GlobalFuncs");

	return Controller.extend("smud.org.wmLM01.controller.Return", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf smud.org.wmLM01.view.Return
		 */
		onInit: function() {
			zController = this;
			this.getView().setModel(sap.ui.getCore().getModel("ReturnItems"));
			this.createTable();
		},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf smud.org.wmLM01.view.Return
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf smud.org.wmLM01.view.Return
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf smud.org.wmLM01.view.Return
		 */
		//	onExit: function() {
		//
		//	}

		back: function() {
			window.history.go(-1);
		},
		scanAufnr: function(oEvent) {
			GlobalFuncs.scan(oEvent, zController.getMaterials);
		},
		scan: function(oEvent) {
			GlobalFuncs.scan(oEvent);
		},
		createTable: function() {
			// Create the item table via JS
			var oTable = new sap.m.Table(zController.getView().createId("materialTable"), {
				//headerText: "Return Items",
				width: "100%",
				growing: true,
				filter: zController.handleMaterialSearch,
				growingThreshold: 50,
				noDataText: "No materials for the entered work order number",
				type: "Active" //enables itemPress event
			});

			var toolbar = new sap.m.Toolbar({
				content: [
					new sap.m.SearchField({
						placeholder: "Search for materials to return",
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
					new sap.m.Input({
						value: "{Matnr}",
						placeholder: "",
						maxLength: 18,
						editable: false,
						width: "100%"
							//description: "{Maktg}"
					}),
					new sap.m.Input({
						value: "{Maktg}",
						placeholder: "",
						maxLength: 40,
						editable: false,
						width: "100%"
					}),
					new sap.m.HBox({
						items: [
							new sap.m.Input({
								value: "{ReturnQty}",
								placeholder: "Qty",
								type: "Number",
								editable: "{= ${Sernp} === '' }",
								width: "auto",
								description: "{Meins}" //"Return Qty"
							}),
							new sap.m.Button({
								icon: "sap-icon://delete",
								width: "auto",
								press: function(oEvent) {
									var path = oEvent.getSource().getParent().getBindingContext().getPath();
									var index = path.replace("/", "");
									zController.getView().getModel().setProperty("/items/" + index + "/SerialNumbers", "");
									zController.getView().getModel().setProperty("/items/" + index + "/ReturnQty", "");
									sap.ui.getCore().byId(zController.getView().createId("materialTable")).getBinding("items").refresh();
								},
								enabled: true
							})
						]
					}),
					new sap.m.Button({
						text: "S/N Selection",
						visible: "{= ${Sernp} !== '' }",
						press: zController.f4SerialNumbers,
						enabled: true
					}),
					new sap.m.Input({
						value: "{Sgtxt}",
						placeholder: "Item text",
						type: "Text",
						width: "100%",
						maxLength: 50
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
		f4SerialNumbers: function(oEvent) {
			sap.ui.core.BusyIndicator.show(0);
			var that = zController;
			var oModel = zController.getView().getModel();
			var oData = oModel.getData();
			var path = oEvent.getSource().getParent().getBindingContext().getPath();
			var index = path.replace("/", "");
			var row = oData.items[index];
			var material = row.Matnr;
			var filters = new Array();
			var filterMatnr = new sap.ui.model.Filter({
				path: "Matnr",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: material
			});
			filters.push(filterMatnr);

			var filterBlart = new sap.ui.model.Filter({
				path: "Blart",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: "WE" //Goods Return
			});
			filters.push(filterBlart);

			var filterAufnr = new sap.ui.model.Filter({
				path: "Aufnr",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: oData.items[0].Aufnr
			});
			filters.push(filterAufnr);

			// Filter out serial numbers already selected
			// to prevent duplicate selections
			var sn = oModel.getProperty("/items/" + index + "/SerialNumbers");
			var snArray = [];
			if (sn) {
				snArray = sn.split("|");
			}
			for (var i = 0; i < snArray.length; i++) {
				filters.push(new sap.ui.model.Filter({
					path: "Sernr",
					operator: sap.ui.model.FilterOperator.NE,
					value1: snArray[i]
				}));
			}

			// Call the Serial Number help
			var oDataModel = zController.getView().getModel("Gwarehouse");
			oDataModel.read("/MaterialSNSet", {
				filters: filters,
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
					sap.ui.core.BusyIndicator.hide();
				}
			});
		},
		handleMaterialSearch: function(oEvent) {
			var searchStr = oEvent.getSource().getValue();
			zController.filterTable(sap.ui.getCore().byId(zController.getView().createId("materialTable")), ["Matnr", "Maktg", "Meins"],
				searchStr);
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
		getMaterials: function() {
			sap.ui.core.BusyIndicator.show(0);
			var returnItems = zController.getView().getModel();

			var filters = [];
			if (!returnItems.getProperty("/items/0/Aufnr")) {
				sap.ui.core.BusyIndicator.hide();
				return;
			} else {
				while (returnItems.getProperty("/items/0/Aufnr").length < 12) {
					returnItems.setProperty("/items/0/Aufnr", "0" + returnItems.getProperty("/items/0/Aufnr"));
				}
			}
			var aufnrFilter = new sap.ui.model.Filter({
				path: "Aufnr",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: returnItems.getProperty("/items/0/Aufnr")
			});
			var werksFilter = new sap.ui.model.Filter({
				path: "Werks",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: returnItems.getProperty("/items/0/Werks")
			});
			var lgnumFilter = new sap.ui.model.Filter({
				path: "Lgnum",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: returnItems.getProperty("/items/0/Lgnum")
			});

			filters.push(aufnrFilter);
			filters.push(werksFilter);
			filters.push(lgnumFilter);

			var movementType = returnItems.getProperty("/items/0/Bwart");

			var oDataModel = zController.getView().getModel("Return");
			oDataModel.read("/ReturnSet", {
				filters: filters,
				success: function(oData) {

					// Set Qty to blank instead of 0.000 so user does not have to backspace
					for (var i = 0; i < oData.results.length; i++) {
						oData.results[i].ReturnQty = "";
						oData.results[i].Bwart = movementType;
						oData.results[i].Sgtxt = "";
					}

					returnItems.setProperty("/items", oData.results);

					var colItemTemplate = sap.ui.getCore().byId(zController.getView().createId("tableColumnListItem"));
					var tabModel = new sap.ui.model.json.JSONModel(returnItems.getProperty("/items"), false);
					tabModel.setData(returnItems.getProperty("/items"), false);

					var context = new sap.ui.model.Context(tabModel, "/");
					var oTable = sap.ui.getCore().byId(zController.getView().createId("materialTable"));
					oTable.setBindingContext(context);
					oTable.setModel(tabModel);
					oTable.bindItems("/", colItemTemplate);

					sap.ui.core.BusyIndicator.hide();
				},
				error: function(oError) {
					var items = returnItems.getProperty("/items");
					while (items.length > 1) {
						items.pop();
					}
					var item = items[0];
					for (var key in item) {
						if (key !== "Lgnum" && key !== "Lgort" && key !== "Aufnr" && key !== "Werks" && key !== "Bwart") {
							item[key] = "";
						}
					}
					var oTable = sap.ui.getCore().byId(zController.getView().createId("materialTable"));
					oTable.destroyItems();
					MessageBox.show(JSON.parse(oError.responseText).error.message.value, {
						title: "Error",
						icon: "ERROR"
					});
					sap.ui.core.BusyIndicator.hide();
				}
			});
		},
		handleSNConfirm: function(oEvent) {
			var oTable = sap.ui.getCore().byId(zController.getView().createId("materialTable"));
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
				var material = selectedSNs[0].Matnr;
				while (material.substring(0, 1) === "0") {
					material = material.substring(1);
				}
				var items = oModel.getProperty("/items");
				var row = {};
				for (var i = 0; i < items.length; i++) {
					if (material == items[i].Matnr) {
						row = items[i];
					}
				}
				// Add new selections
				for (var i = 0; i < selectedSNs.length; i++) {
					if (row.SerialNumbers) {
						row.SerialNumbers = row.SerialNumbers + "|" + selectedSNs[i].Sernr;
					} else {
						row.SerialNumbers = selectedSNs[i].Sernr;
					}
				}
				// Get the Qty selected
				var snArray = row.SerialNumbers.split("|");
				row.ReturnQty = snArray.length.toString();

				oTable.getBinding("items").refresh();
			}
		},
		handleSNSearch: function(oEvent) {
			var searchStr = oEvent.getParameter("value");
			zController.filterTable(oEvent.getSource(), ["Matnr", "Sernr"], searchStr);
		},
		handleSNClose: function(oEvent) {},
		save: function() {
			sap.ui.core.BusyIndicator.show(0);
			var oDataModel = this.getView().getModel("Return");
			//	var oDataModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZWM_RETURNS_SRV", {});
			var oModel = zController.getView().getModel();
			var items = zController.getView().getModel().getData().items;
			var postItems = [];
			for (var i = 0; i < items.length; i++) {
				if (items[i].ReturnQty > 0) {
					var item = items[i];
					postItems.push({
						Matnr: item.Matnr,
						Meins: item.Meins,
						ReturnQty: item.ReturnQty,
						Sgtxt: item.Sgtxt,
						SerialNumbers: item.SerialNumbers
					});
				}
			}
			if (postItems.length > 0) {
				var request = {
					Aufnr: items[0].Aufnr,
					Werks: items[0].Werks,
					Lgort: items[0].Lgort,
					Wempf: items[0].Wempf,
					Lgnum: items[0].Lgnum,
					Bwart: items[0].Bwart,
					ItemsSet: postItems
				};
				oDataModel.create("/HeaderSet", request, {
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
			} else {
				MessageBox.show("You must enter a Qty > 0 for at least 1 item to create a return", {
					title: "Error",
					icon: "ERROR"
				});
				sap.ui.core.BusyIndicator.hide();
			}
		},
		goBack: function() {
			var oModel = zController.getView().getModel();
			oModel.setProperty("/items/0/Aufnr", "");
			oModel.setProperty("/items/0/Bwart", "");
			oModel.setProperty("/items/0/Wempf", "");
			sap.ui.getCore().byId(zController.getView().createId("materialTable")).destroyItems();
			window.history.go(-1);
		},
		uppercaseNoSpecial: function(oEvent) {
			GlobalFuncs.uppercaseNoSpecial(oEvent);
		}
	});
});