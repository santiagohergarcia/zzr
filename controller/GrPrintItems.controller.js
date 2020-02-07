sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	var zController;
	var GlobalFuncs = sap.ui.controller("smud.org.wmLM01.controller.GlobalFuncs");

	return Controller.extend("smud.org.wmLM01.controller.GrPrintItems", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf smud.org.wmLM01.view.view.GrPrintItems
		 */
		onInit: function() {
			zController = this;
			var oModel = sap.ui.getCore().getModel("GrPrintItems");
			this.getView().setModel(oModel);
			// Create the item table via JS
			var oTable = new sap.m.Table({
				headerText: "Print GR Labels",
				width: "100%",
				growing: true,
				growingThreshold: 50,
				includeItemInSelection: true,
				itemPress: [this.getPrintItem, this],
				mode: sap.m.ListMode.SingleSelectMaster
			});
			//columns!!!
			var poNumberCol = new sap.m.Column({
				header: new sap.m.Label({
					text: "PO Number"
				})
			});
			var poItemCol = new sap.m.Column({
				header: new sap.m.Label({
					text: "PO Item"
				})
			});
			var matDocNumberCol = new sap.m.Column({
				header: new sap.m.Label({
					text: "Mat. Doc#"
				})
			});
			var materialCol = new sap.m.Column({
				header: new sap.m.Label({
					text: "Material"
				})
			});

			// rows!!!
			//				var columnItems = new sap.m.ColumnListItem(this.getView().createId("GrPrintItemsTemplate"),{
			var columnItems = new sap.m.ColumnListItem({
				type: "Active" //enables itemPress event
			});
			//create cells to add to the rows.
			var poNumber = new sap.m.Text({
				text: "{PoNumber}"
			});
			var poItem = new sap.m.Text({
				text: "{PoItem}"
			});
			var material = new sap.m.Text({
				text: "{Material}"
			});
			var matDocNumber = new sap.m.Text({
				text: "{MatDocNumber}"
			});

			// Add the columns to table
			oTable.addColumn(poNumberCol);
			oTable.addColumn(poItemCol);
			oTable.addColumn(matDocNumberCol);
			oTable.addColumn(materialCol);

			columnItems.addCell(poNumber);
			columnItems.addCell(poItem);
			columnItems.addCell(matDocNumber);
			columnItems.addCell(material);

			var context = new sap.ui.model.Context(oModel, "/items");
			oTable.setBindingContext(context);
			oTable.setModel(oModel);
			oTable.bindItems("/items", columnItems);

			var hbox = sap.ui.getCore().byId(this.getView().createId("GrPrintHboxTable"));
			hbox.addItem(oTable);
		},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf smud.org.wmLM01.view.view.GrPrintItems
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf smud.org.wmLM01.view.view.GrPrintItems
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf smud.org.wmLM01.view.view.GrPrintItems
		 */
		//	onExit: function() {
		//
		//	}
		goBack: function() {
			window.history.go(-1);
		},
		getPrintItem: function(oEvent) {
			var path = oEvent.getParameter("listItem").getBindingContext().getPath();
			var oSource = oEvent.getSource();
			var context = oSource.getBindingContext();
			var object = context.getObject(path);
			var oModel = sap.ui.getCore().getModel("GrPrintItem");

			oModel.setProperty("/PoNumber", object.PoNumber);
			oModel.setProperty("/PoItem", object.PoItem);
			oModel.setProperty("/MatDocNumber", object.MatDocNumber);
			oModel.setProperty("/Material", object.Material);
			oModel.setProperty("/ShortText", object.ShortText);
			oModel.setProperty("/GrQty", object.GrQty);
			oModel.setProperty("/PrintQty", object.GrQty);
			
			sap.ui.core.UIComponent.getRouterFor(zController).navTo("GrPrintItem");
			
		},
		checkNumber: function(oEvent) {
			var newValue = oEvent.getSource().getValue().replace(/\D/g, '');
			oEvent.getSource().setValue(newValue);
		}
	});

});