sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	'sap/m/MessageBox',
	'sap/ui/model/Filter'
], function(Controller, MessageToast, JSONModel, MessageBox, Filter) {
	"use strict";

	var GlobalFuncs = sap.ui.controller("smud.org.wmLM01.controller.GlobalFuncs");
	var zController;
	//var oModel;
	var oDataResultModel = new sap.ui.model.json.JSONModel();
	return Controller.extend("smud.org.wmLM01.controller.GmBinToBin", {

		/**
		 *
		 */

		onInit: function() {
			zController = this;
			this.getView().setModel(sap.ui.getCore().getModel("GmResultModel"));
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
		////https://sapgd1.smud.org:8001/sap/opu/odata/sap/ZWM_BIN_TO_BIN_SRV/BINtoBINSet(Matnr='10000013')?$format=xml
		///https://sapgd1.smud.org:8001/sap/opu/odata/sap/ZWM_WAREHOUSE_APPLICATIONS_SRV/WarehouseUserAssignmentSet?$filter=IssRecLbl eq 'I'

		gotoBinToBin: function() {
			//sap.ui.core.BusyIndicator.show(0);
			var that = this;
			var oMaterialNbrfromUi = this.getView().byId("inpMaterialNumber");
			var oDataUI = this.getView().getModel().getData();
			if (oDataUI.Lgpla == null || oDataUI.Lgpla == '') {
				MessageBox.show("Please enter Src Bin", {
					title: "Error Message",
					icon: "ERROR"
				});
				return;
			} else if (oDataUI.Matnr == null || oDataUI.Matnr == '') {
				MessageBox.show("Please enter Material Number", {
					title: "Error Message",
					icon: "ERROR"
				});
				return;
			}
			if(oDataUI.Vltyp == null || oDataUI.Vltyp == '') {
				//
				MessageBox.show("Please enter Source Type", {
					title: "Error Message",
					icon: "ERROR"
				});
				return;
			}
	
			var oDataModel = this.getView().getModel("GmBinToBin"); //sap.ui.getCore().getModel("GmBinToBin");
		//	oDataModel.read("/BINtoBINSet('" + oMaterialNbrfromUi.getValue() + "')", {
			oDataModel.read("/BINtoBINSet(Matnr='"+ oDataUI.Matnr+"',Vltyp='"+oDataUI.Vltyp+"',Vlpla='"+oDataUI.Lgpla+"')", {
				success: function(oData) {
					oDataResultModel.setData(oData);
					oDataResultModel.setProperty("/Vltyp", oDataUI.Vltyp);
					oDataResultModel.setProperty("/Vlpla", oDataUI.Lgpla);
					oDataResultModel.setProperty("/Anfme", "");
					sap.ui.getCore().setModel(oDataResultModel, "GmResultModel");
					sap.ui.core.UIComponent.getRouterFor(zController).navTo("GmBinToBinDetails");
					sap.ui.core.BusyIndicator.hide();
				},
				error: function(oError) {
					if(oError != null && JSON.parse(oError.responseText) != null) {
						MessageBox.show(JSON.parse(oError.responseText).error.message.value, {
							title: "Error Message",
							icon: "ERROR"
						});
					} else {
						MessageBox.show("Error processing Bin to Bin move", {
							title: "Error",
							icon: "ERROR"
						});
					}
					sap.ui.core.BusyIndicator.hide();
				}
			});
		},
		populateSrcType: function() {
			//var SrcTypeTxt = zController.getView().byId("inpSourceType");
			//MessageBox.show("Inside populateSrcType ");
			var dropdown = zController.getView().byId("inpSourceType");
			dropdown.clearSelection();
			dropdown.setValue("");
			dropdown.destroyItems();
			sap.ui.core.BusyIndicator.show(0);
			var oDataModel = this.getView().getModel("Gwarehouse");
			var oModel = sap.ui.getCore().getModel("GmResultModel");
			var oDataUI = this.getView().getModel().getData();
			var lgnum = oModel.getProperty("/Lgnum");
		//oModel.setProperty("/Vltyp", oModel.getProperty("/Vltyp").toUpperCase());
			var vlpla = oDataUI.Lgpla;
			if (!vlpla){
				sap.ui.core.BusyIndicator.hide();
				return;
			}
			
			var filters = [new sap.ui.model.Filter({
					path: "Lgnum",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: lgnum
				}),
				new sap.ui.model.Filter({
					path: "Lgpla",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: vlpla
				})
			];

			oDataModel.read("/BinMasterDataSet", {
				filters: filters,
				success: function(oData) {
					var bins = oData.results;
					for (var i = 0; i < bins.length; i++) {
						var bin = bins[i];
						dropdown.addItem(
							new sap.ui.core.Item({
								key: bin.Lgtyp,
								text: bin.Lgtyp
							})
						);
						if (bin.Lgtyp == zController.getView().getModel().getProperty("/Vltyp")) {
							dropdown.setSelectedKey(bin.Lgtyp);
						}
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
		showf4Matnr: function() {
			//// https://sapgd1.smud.org:8001/sap/opu/odata/sap/ZWM_GI_UNPLANNED_SRV/BinMaterialsSet?$filter=Lgnum eq 'EC1' and Werks eq 'MAIN' and Lgpla eq '52A03'&$format=json
			sap.ui.core.BusyIndicator.show();
			var that = this;
			var oModel = this.getView().getModel();
			if (!oModel.getProperty("/Lgpla")) {
				GlobalFuncs.showMessage("Error", "Enter a Bin", "ERROR");
				sap.ui.core.BusyIndicator.hide();
				return;
			}
			var lgnum = oModel.getProperty("/Lgnum");
			var werks = oModel.getProperty("/Werks");
			var lgpla = oModel.getProperty("/Lgpla");
			var larray_filters = new Array();
			var l_filter1 = new sap.ui.model.Filter({
				path: "Lgnum",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: lgnum
			});
			var l_filter2 = new sap.ui.model.Filter({
				path: "Werks",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: werks
			});
			var l_filter3 = new sap.ui.model.Filter({
				path: "Lgpla",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: lgpla
			});
			larray_filters.push(l_filter1);
			larray_filters.push(l_filter2);
			larray_filters.push(l_filter3);
			var filterStr = "$filter=Lgnum eq " + lgnum + " and Werks eq " + werks + " and Lgpla eq " + lgpla;
			var oDataModel = this.getView().getModel("GiUnp");
			oDataModel.read("/BinMaterialsSet", {
				filters: larray_filters,
				success: function(oData) {
					var oDataResultModel = new sap.ui.model.json.JSONModel();
					oDataResultModel.setData(oData);
					that.getView().setModel(oDataResultModel, "matTable");
					if (!that._oDialog) {
						that._oDialog = sap.ui.xmlfragment("smud.org.wmLM01.fragments.material", that);
					}
					that.getView().addDependent(that._oDialog);
					jQuery.sap.syncStyleClass("sapUiSizeCompact", that.getView(), that._oDialog);
					sap.ui.core.BusyIndicator.hide();
					that._oDialog.open();
				},
				error: function(oError) {
					//MessageBox.show(JSON.parse(oError.responseText).error.innererror.errordetails[0].message,{ title: "Error Message"});
					MessageBox.show(JSON.parse(oError.responseText), {
						title: "Error",
						icon: "ERROR"
					});
				}

			});

			sap.ui.core.BusyIndicator.hide();

		},
		handleMaterialSelect: function(oEvent) {
			var oModel = this.getView().getModel();
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([]);
			var aContexts = oEvent.getParameter("selectedContexts");
			if (aContexts && aContexts.length) {
				var selectedMaterialNbr = aContexts.map(function(oContext) {
					return oContext.getObject().Matnr;
				});
				var selectedSourceType = aContexts.map(function(oContext) {
					return oContext.getObject().Lgtyp;
				});
				oModel.setProperty("/Matnr", selectedMaterialNbr);
				oModel.setProperty("/Lgtyp", selectedSourceType[0].toString());
				oModel.setProperty("/Vltyp", selectedSourceType[0].toString());

				zController.gotoBinToBin();
			}
		},
		handleMaterialSearch: function(oEvent) {
			var searchStr = oEvent.getParameter("value");
			zController.filterTable(oEvent.getSource(), ["Matnr", "Maktg", "Meins"], searchStr);
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
		uppercase: function(oEvent) {
			GlobalFuncs.uppercase(oEvent);
		},
		goBack: function() {
			window.history.go(-1);
		},
		scan: function(oEvent) {
			GlobalFuncs.scan(oEvent);
		},
		scanBin: function(oEvent) {
			GlobalFuncs.scan(oEvent);
		},
		uppercaseNoSpecial: function(oEvent) {
			GlobalFuncs.uppercaseNoSpecial(oEvent);
		}
	});

});