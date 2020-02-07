sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function(JSONModel, Device) {
	"use strict";

	return {

		createDeviceModel: function() {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},
		createAppModel: function() {

			var WarehouseData = {
				PoNumber: "",
				Uname: "",
				IssRecLbl: "",
				Warehouse: "",
				StorageLoc: "",
				Plant: "",
				Print: ""
			};
			var WarehouseModel = new JSONModel(WarehouseData);
			sap.ui.getCore().setModel(WarehouseModel, "Warehouse");

			var GiUnplannedData = {
				items: [{
					Index: 0,
					itemNumberText: "1 of 1",
					Aufnr: "", //Work order
					Bwart: "261", //Movement Type
					Lifnr: "", //Vendor
					vendorExists: false,
					Wempf: "", //Recipient
					Lgnum: "", //Warehouse
					Werks: "", //Plant
					Sernp: "", //Serial Number profile
					serialNumbersRequired: false,
					Lgort: "",
					// The following fields will be used in GiUnplannedItem
					Matnr: "",
					Maktg: "",
					Lgpla: "",
					Lgtyp: "",
					Menge: "",
					Meins: "",
					Sgtxt: "",
					serialNumbers: []
				}]
			};
			var GiUnplannedModel = new JSONModel(GiUnplannedData);
			sap.ui.getCore().setModel(GiUnplannedModel, "GiUnplanned");

			var GiUnplannedItemData = {};
			var GiUnplannedItemModel = new JSONModel(GiUnplannedItemData);
			sap.ui.getCore().setModel(GiUnplannedItemModel, "GiUnplannedItem");

			var mainPageData = {
				grEbeln: "",
				grPrintEbeln: "",
				grPrintMblnr: "",
				grPrintLgnum: "",
				putawayLgnum: "",
				putawayMatnr: "",
				putawayLgort: "",
				putawayWerks: "",
				consignment: false
			};
			var mainPageModel = new JSONModel(mainPageData);
			sap.ui.getCore().setModel(mainPageModel, "MainPage");

			// GR Open Items - GrOpenItems
			var GrOpenItemsPageData = {
				tableHeader: "",
				materialFilter: "",
				items: [{
					PoItem: "111",
					Material: "",
					ShortText: "",
					OpenQty: "",
					SerialNumbers: [{
						PoItem: "",
						Serialno: ""
					}]
				}]
			};
			var GrOpenItemsPageModel = new JSONModel(GrOpenItemsPageData);
			sap.ui.getCore().setModel(GrOpenItemsPageModel, "GrOpenItems");

			// GR Item - GrItem
			var GrItemData = {
				SerialNumbers: [{
					PoItem: "",
					Serialno: ""
				}],
				serialNumbersRequired: false
			};
			var GrItemModel = new JSONModel(GrItemData);
			sap.ui.getCore().setModel(GrItemModel, "GrItem");

			// GR Print Label Items
			var printItemsData = {
				items: [{
					PoNumber: "",
					PoItem: "",
					Material: "",
					MatDocNumber: ""
				}]
			};
			var printItemsModel = new JSONModel(printItemsData);
			sap.ui.getCore().setModel(printItemsModel, "GrPrintItems");

			// GR Print Label Item - screen we print label from
			var printItemData = {
				PoNumber: "",
				PoItem: "",
				Material: "",
				MatDocNumber: "",
				ShortText: "",
				GrQty: "",
				PrintQty: ""
			};
			var printItemModel = new JSONModel(printItemData);
			sap.ui.getCore().setModel(printItemModel, "GrPrintItem");

			// Putaway
			var putawayItemData = {
				Material: "",
				Description: "",
				Uom: "",
				SpecialStock: "",
				Warehouse: "",
				Plant: "",
				StorageLoc: "",
				TotalQty: "",
				PutawayQty: "",
				Vendor: "",
				StorageType: "",
				Bin: "",
				BinPrimary: "",
				BinConfirm: "",
				TransferOrder: "",
				bins: [{
					bin: ""
				}],
				otherBin: false
			};
			var putawayItemModel = new JSONModel(putawayItemData);
			sap.ui.getCore().setModel(putawayItemModel, "PutawayItem");

			// Goods Movement - Bin to Bin Transfer
			var GmBinToBinData = {
				"Matnr": "",
				"Maktg": "",
				"Meins": "",
				"Werks": "",
				"Lgort": "",
				"Lgnum": "",
				"Anfme": "",
				"Vltyp": "",
				"Vlpla": "",
				"Nltyp": "",
				"Nlpla": ""
			};

			var binToBinModel = new JSONModel(GmBinToBinData);
			sap.ui.getCore().setModel(binToBinModel, "GmBinToBin");

			var ReturnData = {
				items: [{
					Lgnum: "",
					Werks: "",
					Lgort: "",
					Aufnr: "",
					Bwart: "",
					Wempf: "",
					Matnr: "",
					Maktg: "",
					Menge: "",
					Meins: "",
					serialNumbersRequired: false
				}]
			};
			var ReturnModel = new JSONModel(ReturnData);
			sap.ui.getCore().setModel(ReturnModel, "ReturnItems");

			var ReturnPrintData = {
				Lgnum: "",
				Matnr: "",
				Maktg: "",
				Qty: ""
			};
			var ReturnPrintModel = new JSONModel(ReturnPrintData);
			sap.ui.getCore().setModel(ReturnPrintModel, "ReturnPrint");

			var WmPrintBinLabelData = {
				Lgnum: "",
				Lgtyp: "",
				LgplaFrom: "",
				LgplaTo: "",
				Qty: "",
				Size4x2: true,
				Size3x1: false,
				NormalLabel: true,
				MaterialLabel: false,
				NonStock: false,
				SouthDock: false
			};
			var WmPrintBinLabelModel = new JSONModel(WmPrintBinLabelData);
			sap.ui.getCore().setModel(WmPrintBinLabelModel, "WmPrintBinLabel");
			
			var WmStockOverviewData = {
				Lgnum:"",
				Lgort:"",
				Werks:"",
				Matnr:"",
				Maktg:"",
				Meins:""
			};
			var WmStockOverviewModel = new JSONModel(WmStockOverviewData);
			sap.ui.getCore().setModel(WmStockOverviewModel, "WmStockOverview");
			
			var GiPlannedData = {
				Lgnum:"",
				Tanum:"",
				Benum:""
			};
			var GiPlannedModel = new JSONModel(GiPlannedData);
			sap.ui.getCore().setModel(GiPlannedModel, "GiPlanned");
		}
	};
});