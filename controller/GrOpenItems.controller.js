sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	var zController;
	var GlobalFuncs = sap.ui.controller("smud.org.wmLM01.controller.GlobalFuncs");
	var oTable;
	
	return Controller.extend("smud.org.wmLM01.controller.GrOpenItems", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf smud.org.wmLM01.view.GrOpenItems
		 */
			onInit: function() {
				zController = this;
				var oModel = sap.ui.getCore().getModel("GrOpenItems");
				this.getView().setModel(oModel);
				
				// Create the item table via JS
				oTable = new sap.m.Table({
					headerText: oModel.tableHeader,
					width:"100%",
					growing: true,
					growingThreshold: 50,
					includeItemInSelection:true,
					itemPress:[this.getItem, this],
					mode:sap.m.ListMode.SingleSelectMaster
				});
				//columns!!!
				var poItemCol = new sap.m.Column({
					header: new sap.m.Label({
						text: "Item"
					})
				});
				var materialCol = new sap.m.Column({
					header: new sap.m.Label({
						text: "Material"
					})
				});
				var descriptionCol = new sap.m.Column({
					header: new sap.m.Label({
						text: "Description"
					})
				});
				var openCol = new sap.m.Column({
					header: new sap.m.Label({
						text: "Open QTY"
					})
				});
				// rows!!!
				var columnItems = new sap.m.ColumnListItem(this.createId("GrOpenItemsTemplate"),{
					type:"Active" //enables itemPress event
				});
				//create cells to add to the rows.
				var poItem = new sap.m.Text({
					text: "{PoItem}"
				});
				var material = new sap.m.Text({
					text: "{Material}"
				});
				var description = new sap.m.Text({
					text: "{ShortText}"
				});
				var open = new sap.m.Text({
					text: "{OpenQty}"
				});
				
				// Add the columns to table
				oTable.addColumn(poItemCol);
				oTable.addColumn(materialCol);
				oTable.addColumn(descriptionCol);
				oTable.addColumn(openCol);
				
				columnItems.addCell(poItem);
				columnItems.addCell(material);
				columnItems.addCell(description);
				columnItems.addCell(open);
				
				var context = new sap.ui.model.Context(oModel, "/items");
				oTable.setBindingContext(context);
				oTable.setModel(oModel);
				oTable.bindItems("/items", columnItems);
				
				var hbox = sap.ui.getCore().byId(this.createId("hboxTable"));
				hbox.addItem(oTable);
			},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf smud.org.wmLM01.view.GrOpenItems
		 */
		//	onBeforeRendering: function() {
		//	
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf smud.org.wmLM01.view.GrOpenItems
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf smud.org.wmLM01.view.GrOpenItems
		 */
		//	onExit: function() {
		//
		//	}
		
		goBack: function(){
			zController.clearFilters();
			window.history.go(-1);
		},
		getItem: function(oEvent){
			sap.ui.core.BusyIndicator.show(0);
			//var GrItem = sap.ui.getCore().getModel().getProperty("/GrItem/view");
			var path = oEvent.getParameter("listItem").getBindingContext().getPath();
			var context = oEvent.getSource().getBindingContext();
			var openItem = context.getObject(path);
			var index = parseInt(path.substring(path.lastIndexOf('/') + 1));
			
			GlobalFuncs.GrItemSetFormValues(openItem);
			
			zController.clearFilters();
			sap.ui.core.UIComponent.getRouterFor(zController).navTo("GrItem");
			sap.ui.core.BusyIndicator.hide();
		},
		scanMaterial: function(){
			$.sap.require("sap.ndc.BarcodeScanner");
			sap.ndc.BarcodeScanner.scan(
				function(oResult) { 
					if (oResult.text.length > 18){
						var msg = "PO# cannot be longer than 18 characters";
						GlobalFuncs.showMessage("Invalid Material", msg);
						return;
					} else if (oResult.text.length == 0) {
						return;
					}
					// Set the value of input control
					sap.ui.getCore().byId(zController.createId("inpGrOpenItemsMaterial")).setValue(oResult.text);
					sap.ui.getCore().byId(zController.createId("inpGrOpenItemsMaterial")).rerender();
					zController.filterByMaterial(oResult.text);
				},
    			function(oError) {
    				var msg = "An error occurred while scanning";
    				GlobalFuncs.showMessage("Error", msg);
    			},
    			function(oInputChange) { 
    			}
			);
		},
		clearFilters: function(){
			var itemBinding = oTable.getBinding("items");
			
			var oModel = this.getView().getModel();
			oModel.setProperty("/filterMaterial", "");
			itemBinding.filter([]);
		},
		filterByMaterial: function(value){
			var itemBinding = oTable.getBinding("items");
			var filterMaterial = new sap.ui.model.Filter("Material", sap.ui.model.FilterOperator.Contains, value);
			var filterUPC = new sap.ui.model.Filter("MaterialUpc", sap.ui.model.FilterOperator.Contains, value);
			var filterShortText = new sap.ui.model.Filter("ShortText", sap.ui.model.FilterOperator.Contains, value);
			var filterPoItem = new sap.ui.model.Filter("PoItem", sap.ui.model.FilterOperator.Contains, value);
			var filter = new sap.ui.model.Filter({
				filters: [
					filterMaterial,
					filterUPC,
					filterShortText,
					filterPoItem
				]
			});
			itemBinding.filter([filter]);
		},
		onChangeMaterial: function(oEvent){
			var params = oEvent.getParameters();
			this.filterByMaterial(params.newValue);
		},
		checkNumber: function(oEvent){
			var newValue = oEvent.getSource().getValue().replace(/\D/g,'');
			oEvent.getSource().setValue(newValue);
		}
	});

});