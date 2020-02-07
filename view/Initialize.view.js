sap.ui.jsview("smud.org.wmLM01.view.Initialize", {

	/** Specifies the Controller belonging to this View. 
	 * In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	 * @memberOf controller.Initialize
	 */
	getControllerName: function() {
		return "smud.org.wmLM01.controller.Initialize";
	},

	/** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	 * Since the Controller is given to this method, its event handlers can be attached right away.
	 * @memberOf controller.Initialize
	 */
	createContent: function(oController) {
		var app = new sap.m.App("myApp", {
			initialPage: "MainPage"
		});

		var GlobalFuncs = sap.ui.controller("smud.org.wmLM01.controller.GlobalFuncs");

		var initGlobalFuncs = sap.ui.xmlview({
			viewName: "smud.org.wmLM01.view.GlobalFuncs"
		});

		var getItemsURL = "/sap/opu/odata/sap/ZWM_WAREHOUSE_APPLICATIONS_SRV/WarehouseUserAssignmentSet?$filter=IssRecLbl eq 'L'";
		$.ajax({
			url: getItemsURL,
			type: "GET",
			dataType: "json",
			success: function(result, status, xhr) {
				var headers = xhr.getAllResponseHeaders();
				if (result.d.results[0]) {
					var warehouse = result.d.results[0];
					sap.ui.getCore().getModel("Warehouse").setProperty("/", result.d.results[0]);
					var mainPage = sap.ui.getCore().getModel("MainPage");
					mainPage.setProperty("/grPrintLgnum", warehouse.Warehouse);
					mainPage.setProperty("/putawayLgnum", warehouse.Warehouse);
					mainPage.setProperty("/putawayWerks", warehouse.Plant);
					mainPage.setProperty("/putawayLgort", warehouse.StorageLoc);
				} else {
					GlobalFuncs.showMessage("Error", "No User-Warehouse profile exists", "ERROR");
				}
			},
			error: function(jqXHR, textStatus, errorThrown) {
				GlobalFuncs.showMessage("Error", jqXHR.responseJSON.error.message.value, "ERROR");
			}
		});
		return app;
	}

});