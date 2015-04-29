{
	files:["controller.js"],
	css:["styles.css"],
	config: {
		short_name: "IDRT Additional Data",
		name: "IDRT Additional Data v1",
		description: "Darstellung eines Patientensets",
		category: ["celless", "plugin", "examples"],
		plugin: {
			isolateHtml: false,
			isolateComm: false,
			html: {
				source: 'injected_screens.html',
				mainDivId: 'main'
			}
		}
	}
}