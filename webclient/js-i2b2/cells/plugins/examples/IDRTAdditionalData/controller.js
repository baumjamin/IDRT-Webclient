/**
 * @projectDescription	IDRTAdditionalData web client plugin.
 * @inherits			i2b2
 * @namespace			i2b2.IDRTAdditionalData
 * @author 				Benjamin Baum
 * @version 			1.0
 * ----------------------------------------------------------------------------------------
 */

i2b2.IDRTAdditionalData.patient_data = this;
i2b2.IDRTAdditionalData.list = this;
i2b2.IDRTAdditionalData.carts = this;
i2b2.IDRTAdditionalData.tabs = this;
i2b2.IDRTAdditionalData.model.dirtyResultsData = this;
/** 
 * show the instance num?
 */
i2b2.IDRTAdditionalData.showInstance = false;


//TODO
i2b2.IDRTAdditionalData.removeExcludedPanels = function(panels) {		
	var panelReturn = "";
	
	console.log(panels);
	
	
	var pData = i2b2.h.XPath(panels.refXML, '//panel');
	console.log("****");
	console.log(pData);
	console.info("****");
	for (var i1=0; i1<pData.length; i1++) {	
		////console.info(i1);
		console.log(pData[i1]);
		var invert = i2b2.h.getXNodeVal(pData[i1], 'invert');
		console.log(invert);
		if (invert==0){
			console.log("no invert")
			panelReturn+="<panel>"+pData[i1].innerHTML+"</panel>";
		}
		else
			console.log("invert")
		
	}
	console.log("RETURN");
	console.log(panelReturn);
	return panelReturn;
};

/**
 * This is the initialization function. It adds the drophandler to the dropzone
 */
i2b2.IDRTAdditionalData.Init = function(loadedDiv) {
	console.log("OPENED!");
	i2b2.IDRTAdditionalData.view.containerDiv = loadedDiv; 
	var divName = "dropzone"; 
	var op_trgt = {dropTarget:true}; 
	i2b2.sdx.Master.AttachType(divName, 'PRS', op_trgt); 
	i2b2.sdx.Master.setHandlerCustom(divName, "PRS", "DropHandler", i2b2.IDRTAdditionalData.Dropped);
	i2b2.IDRTAdditionalData.Resize();
};


/**
 * This function is called whenever the screen size changes.
 */
i2b2.IDRTAdditionalData.Resize = function() {
	var h = parseInt( $('anaPluginViewFrame').style.height ) - 61 - 17;
	$$("div#main")[0].style.height = h + 'px';
	for (var i = 0; i < $$('div.content').length;i++){
		$$('div.content')[i].style.height = (h-100) + 'px';
	}
};

/**
 * This function is called whenever a query is dropped onto a dropzone.
 */
i2b2.IDRTAdditionalData.Dropped = function(sdxData) {
	sdxData = sdxData[0];
	i2b2.IDRTAdditionalData.model.prsRecord = sdxData;
	$('dropzone').style.height = "16px";
	$('dropzone').innerHTML = i2b2.h.Escape(sdxData.sdxInfo.sdxDisplayName);
	$('dropzone').insertAdjacentHTML("beforeend","<span style='float:right'>You can drop more data here</span>");
	////////console.log($('anaPluginViewFrame').style.height);
	$('ad_table_content_tab1').style.display = "none";
//	$('IDRTAdditionalData_content').style={"margin:0px; margin-top:12px; padding:0px; background-color:#D9ECF0;border-collapse:collapse; border-spacing:0; border:1px solid #b8c9cd";
	$('IDRTAdditionalData_content').style.display = "block";
	$('IDRTAdditionalData_content').style.height = "93%";
	$('loaddiv').style.display = "block";
	$('loadspan').innerHTML = "Initialize";
	$('ADD-TAB').innerHTML="";

	//removes all content containers
	var container = document.getElementById("ADD-container");
	if (container){
		for (var i = 0; i < container.childNodes.length; i++){
			container.removeChild(container.childNodes[i]);
		}
	}
	container.parentNode.removeChild(container);

	document.getElementById("ADD-loading").style.display = "block";

	//generates the "Patientdata" Tab container.
	var html = '<div id = "ADD-container" class="ADD-container" style="display:block; height: 95%;">'+
	'<div id="container_tab1" class="tabcontainer" style="display: none;">'+
	'<div id="loaddiv">'+
	'<img'+
	'src="js-i2b2/cells/plugins/examples/IDRTAdditionalData/assets/load.gif">'+
	'<span id="loadspan"></span>'+
	'</div>'+
	'<div id="searchbar" class="searchbar" style="position: relative;">'+
	'<input type="text" id="searchtableinput" placeholder="Search"'+
	'style="margin-top: 2px;"'+
	'onkeyup="i2b2.IDRTAdditionalData.Search(this.value, \'tab1\');">'+
	'<div id="exportbox"'+
	'onclick="i2b2.IDRTAdditionalData.CSVExport(\'tab1\');">'+
	'<span id="csvexport">CSV Export</span>'+
	'</div>'+
	'</div>'+
	'<form class="modifierForm mfhidden"></form>'+
	'<div id="ad_table_content_tab1" class="content">'+
	'<table id="maintable_tab1" class="ADD-Table"'+
	'style="margin: 0px; margin-top: 12px; padding: 0px; background-color: #D9ECF0; border-collapse: collapse; border-spacing: 0; border: 1px solid #b8c9cd;">'+
	'<thead>'+
	'<tr id="tablehead_tab1">'+
	'</tr>'+
	'</thead>'+
	'<tbody id="tablebody_tab1">'+
	'</tbody>'+
	'</table>'+
	'</div>'+
	'</div>'+
	'</div>'; 

	//Adds the "Patientdata" tab to the content div.
	document.getElementById("IDRTAdditionalData_content").insertAdjacentHTML('BeforeEnd',html);

	var ResultSetId = sdxData.sdxInfo.sdxKeyValue;
	i2b2.IDRTAdditionalData.model.ResultSetId = ResultSetId;
	var QueryMasterId = sdxData.origData.QM_id;
	i2b2.IDRTAdditionalData.model.QueryMasterId = QueryMasterId;
	i2b2.IDRTAdditionalData.model.dirtyResultsData = true; // our input dataset has changed and any analysis needs to be redone 
	i2b2.IDRTAdditionalData.model.responseXML = '';
	i2b2.IDRTAdditionalData.model.responseString = '';
	i2b2.IDRTAdditionalData.model.id = QueryMasterId;
	i2b2.IDRTAdditionalData.getResults();
	i2b2.IDRTAdditionalData.Resize();




};

/**
 * This function adds a new tab to the main fiv.
 * @param id the id of the tab
 * @param name the name of the tab
 * @param style the designated style of the tab (default:none)
 * @param location the location of the tab (default:beforeend)
 */
i2b2.IDRTAdditionalData.addNewTab = function(id, name, style, location){
	if (!location)
		location = "BeforeEnd";
	if (!style)
		style = 'none';

	$('ADD-TAB').insertAdjacentHTML(location,'<div id="'+id+'" onclick="i2b2.IDRTAdditionalData.TabManager(\''+id+'\');" class="tab">'+name+'</div>');

	var html = '<div id="container_'+id+'" class="tabcontainer" style="display: '+style+';">'+
	'<div id="loaddiv" style="display: none">'+
	'<img'+
	'src="js-i2b2/cells/plugins/examples/IDRTAdditionalData/assets/load.gif">'+
	'<span id="loadspan"></span>'+
	'</div>'+
	'<div id="searchbar" class="searchbar" style="position:relative;">'+
	'<input type="text" id="searchtableinput" placeholder="Search" style="margin-top:2px;" onkeyup="i2b2.IDRTAdditionalData.Search(this.value,\''+id+'\');">'+
	'<div id="exportbox" onclick="i2b2.IDRTAdditionalData.CSVExport(\''+id+'\');"><span id="csvexport">CSV Export</span></div>'+
	'</div>';

	html+='<form class="modifierForm mfhidden">';
	html+='</form>';
	html+=
		'<div id="ad_table_content_'+id+'" style="display: '+style+'" class="content">'+
		'<table class="ADD-Table" id="table_'+id+'" style="margin: 0px;	margin-top:12px;	padding: 0px;	background-color: #D9ECF0;	border-collapse: collapse;	border-spacing: 0;	border:1px solid #b8c9cd;">'+
		'<thead>'+
		'<tr id="tablehead_'+id+'" style="padding: 5px;cursor: pointer;">'+
		'</tr>'+
		'</thead>'+
		'<tbody id="tablebody_'+id+'" style="padding: 5px;cursor: pointer;">'+
		'</tbody>'+
		'</table>'+
		'</div>'+
		'</div>';

	//if the id == cart, which means it's the special cartesian product tab, add a form with all modifiers
	if (id == 'cart'){
		html = '<div id="container_'+id+'" class="tabcontainer" style="display: none;">';
		html+='<div id="loaddiv" style="display: block">'+
		'<img'+
		'src="js-i2b2/cells/plugins/examples/IDRTAdditionalData/assets/load.gif">'+
		'<span id="loadspan"></span>'+
		'</div>'+
		'<div id="searchbar" class="searchbar" style="position:relative;">'+
		'<input type="text" id="searchtableinput" placeholder="Search" style="margin-top:2px;" onkeyup="i2b2.IDRTAdditionalData.Search(this.value,\''+id+'\');">'+
		'<div id="exportbox" onclick="i2b2.IDRTAdditionalData.CSVExport(\''+id+'\');"><span id="csvexport">CSV Export</span></div>'+
		'</div>';
		html+='<form id="modifierForm" class="modifierForm">';
		for (var h = 0; h<i2b2.IDRTAdditionalData.carts.length;h++){
			var applied_path = i2b2.IDRTAdditionalData.carts[h];
			var modifierid = i2b2.IDRTAdditionalData.tabs[applied_path].id;
			var name = i2b2.IDRTAdditionalData.tabs[applied_path].name;
			if (applied_path!='@')
				html+=
					'<input onclick="i2b2.IDRTAdditionalData.modifyCarts(\''+modifierid+'\');" type="checkbox" name="'+ name +'" value="'+applied_path+'" checked>'+name+'</input>';
		}
		html+='</form>';

		html+=
			'<div id="ad_table_content_'+id+'" style="display: none" class="content">'+
			'<table class="ADD-Table" id="table_'+id+'" style="margin: 0px;	margin-top:12px;	padding: 0px;	background-color: #D9ECF0;	border-collapse: collapse;	border-spacing: 0;	border:1px solid #b8c9cd;">'+
			'<thead>'+
			'<tr id="tablehead_'+id+'" style="padding: 5px;cursor: pointer;">'+
			'</tr>'+
			'</thead>'+
			'<tbody id="tablebody_'+id+'" style="padding: 5px;cursor: pointer;">'+
			'</tbody>'+
			'</table>'+
			'</div>'+
			'</div>';
	}

	$('ADD-container').insertAdjacentHTML('BeforeEnd',html);
	$('tablehead_'+id).innerHTML ='<th onclick="i2b2.IDRTAdditionalData.TableSorter(0,\''+id+'\');">Patient ID <img src="js-i2b2/cells/plugins/examples/IDRTAdditionalData/assets/arrows.png" width="8px"></th>';
	if(i2b2.IDRTAdditionalData.showInstance)
		$('tablehead_'+id).insertAdjacentHTML('BeforeEnd', '<th onclick="i2b2.IDRTAdditionalData.TableSorter(1,\''+id+'\');">Instance Num <img src="js-i2b2/cells/plugins/examples/IDRTAdditionalData/assets/arrows.png" width="8px"></th>');	// creating a new table header
	$('tablebody_'+id).innerHTML = '';
	if (id == 'cart')
		i2b2.IDRTAdditionalData.TabManager(id);
	i2b2.IDRTAdditionalData.Resize();
};

/**
 * this function handels the tabs. It activates the clicked tab and deactivates the others.
 * @param tab the selected tab
 */
i2b2.IDRTAdditionalData.TabManager = function(tab) {	// tab handling
	for (var i = 0; i< document.getElementById("ADD-TAB").childNodes.length;i++){
		var child = document.getElementById("ADD-TAB").childNodes[i];
		if(child.localName==='div' && child.className==='tab active'){
			child.className='tab';
		}
	}
	for (var i2 = 0; i2< document.getElementById("ADD-container").childNodes.length;i2++){
		var child = document.getElementById("ADD-container").childNodes[i2];
		if(child.className==='tabcontainer'){
			child.style.display="none";
		}
	}
	document.getElementById(tab).className = 'tab active';
	document.getElementById("ad_table_content_"+tab).style.display = "block";
	document.getElementById("container_"+tab).style.display = "block";
	document.getElementById("ADD-loading").style.display = "none";

};

/**
 * @param suffix the end of a string
 * @returns true if the String ends with the suffix
 */
String.prototype.endsWith = function(suffix) {
	return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

/**
 * 
 * @param k the element in the array
 * @returns true if the Array contains k 
 */
Array.prototype.contains = function(k) {
	for(var p in this)
		if(this[p] === k)
			return true;
	return false;
};


//TODO CART PRODUCT!
/**
 * Builds the cartesian product
 * @param carts the modifier for the cartesian product
 */
i2b2.IDRTAdditionalData.cartProduct = function(carts){

	//removes all old table headers
	var tableHeader = document.getElementById("tablehead_cart");
	while(tableHeader.hasChildNodes())
	{
		tableHeader.removeChild(tableHeader.firstChild);
	}
	var tableRow = document.getElementById("tablebody_cart");
	while(tableRow.hasChildNodes())
	{
		tableRow.removeChild(tableRow.firstChild);
	}

	var list = i2b2.IDRTAdditionalData.list;
	var patient_data = i2b2.IDRTAdditionalData.patient_data;
	//console.log(carts);
	//ADDS TABLE HEADER
	var mod = '@';
	for (var j = 0; j < ths[mod].length; j++){
		var currentHeader = ths[mod][j][0];
		//console.log("PD currentHeader: " + currentHeader);
		$('tablehead_cart').insertAdjacentHTML('BeforeEnd', '<th onclick="i2b2.IDRTAdditionalData.TableSorter('+counter+',\'cart\');"title='
				+ths[mod][j][1]+'>' + currentHeader + ' <img src="js-i2b2/cells/plugins/examples/IDRTAdditionalData/assets/arrows.png" width="8px"></th>');		
	}

	var counter = 1;
	for (var i1 = 0; i1<carts.length;i1++){
		var mod = carts[i1];
//		//console.log("current mod: " + mod);
		if(mod != '@'){
			for (var j = 0; j < ths[mod].length; j++){
				counter++;
				var currentHeader = ths[mod][j][0];
				$('tablehead_cart').insertAdjacentHTML('BeforeEnd', '<th onclick="i2b2.IDRTAdditionalData.TableSorter('+counter+',\'cart\');"title='
						+ths[mod][j][1]+'>' + currentHeader + ' <img src="js-i2b2/cells/plugins/examples/IDRTAdditionalData/assets/arrows.png" width="8px"></th>');		
			}
		}
	}
	var id = 'cart';
	if(i2b2.IDRTAdditionalData.showInstance)
		$('tablehead_cart').insertAdjacentHTML('afterBegin', '<th onclick="i2b2.IDRTAdditionalData.TableSorter(1,\''+id+'\');">Instance Num <img src="js-i2b2/cells/plugins/examples/IDRTAdditionalData/assets/arrows.png" width="8px"></th>');	// creating a new table header
	$('tablehead_cart').insertAdjacentHTML('afterBegin','<th onclick="i2b2.IDRTAdditionalData.TableSorter(0,\''+id+'\');">Patient ID <img src="js-i2b2/cells/plugins/examples/IDRTAdditionalData/assets/arrows.png" width="8px"></th>');

//	//console.info("PDPDPDPDPDPDP");
	//console.log(patient_data);
	if (carts.length>1){
		for (var p in patient_data) {
//			//console.log(p);
			for (var r in patient_data[p].rows) {
//				//console.log("\t"+r);
				var insert = false;
				var str_ = "<tr><td>" + patient_data[p].name +"</td>";
				if(i2b2.IDRTAdditionalData.showInstance)
					str_ += "<td>" + r +"</td>"; 
				for (var i = 0; i < ths['@'].length; i++) {
//					//console.log("\t\t"+patient_data[p][ths['@'][i][1]]);
					str_+="<td>"+patient_data[p][ths['@'][i][1]]+"</td>";
				}

				for (var i2 = 0; i2<carts.length;i2++){
					var applied_path = carts[i2];
					if (applied_path!='@'  ){
						isRowsObjectEmpty = false;
						for (var k = 0; k < ths[applied_path].length; k++) {
							if (patient_data[p].rows[r][ths[applied_path][k][1]] && list[p][applied_path].contains(r)) {
								insert=true;
								str_+="<td>"+patient_data[p].rows[r][ths[applied_path][k][1]]+"</td>";
							}else  {
								str_+="<td>-</td>";
							}
						}
					}
				}
				str_+="</tr>";
				if (insert || carts.length==1){
					$('tablebody_cart').insertAdjacentHTML("BeforeEnd", str_);
				}
			}
		}
	}
	else {
		for (var p in patient_data) {
//			//console.log(p);

			var str_ = "<tr><td>" + patient_data[p].name +"</td>";
			if(i2b2.IDRTAdditionalData.showInstance)
				str_ += "<td>" + "1" +"</td>"; 
			for (var i = 0; i < ths['@'].length; i++) {
//				//console.log("  " + ths['@'][i][1]);
//				//console.log("\t"+patient_data[p][ths['@'][i][1]]);
				if (patient_data[p][ths['@'][i][1]])
					str_+="<td>"+patient_data[p][ths['@'][i][1]]+"</td>";
				else
					str_+="<td></td>";
			}
			str_+="</tr>";
			$('tablebody_cart').insertAdjacentHTML("BeforeEnd", str_);
		}
	}
};

/**
 * modifies the cartesian product tab.
 * @param carts the new modifier list
 */
i2b2.IDRTAdditionalData.modifyCarts = function(carts){
	var x = document.getElementById("modifierForm");
	i2b2.IDRTAdditionalData.carts = new Array();
	i2b2.IDRTAdditionalData.carts.push("@");
	for (var i = 0; i< x.childNodes.length;i++){
		var child = x.childNodes[i];
		if (child.type == 'checkbox' && child.checked){
			i2b2.IDRTAdditionalData.carts.push(child.value);
		}
	}
	i2b2.IDRTAdditionalData.cartProduct(i2b2.IDRTAdditionalData.carts);
};

/**
 * Sorts the selected tablecolumn
 * @param col the selected coloumn
 * @param tab the selected tab
 */
i2b2.IDRTAdditionalData.TableSorter = function(col, tab) {
	var reset_search = false;
	if (!(ad_search=="")) {
		reset_search = true;
		var temp = ad_search;
		i2b2.IDRTAdditionalData.Search("",tab);
	};
	var rows = $('tablebody_'+tab).rows,
	rlen = rows.length,
	arr = new Array(),
	i, j, cells, clen;
	for (i = 0; i < rlen; i++) {	// fill the array with values from the table
		cells = rows[i].cells;
		clen = cells.length;
		arr[i] = new Array();
		for (j = 0; j < clen; j++) {
			arr[i][j] = cells[j].innerHTML;
		}
	}
	arr.sort(function (a, b) {		// sort the array by the specified column number (col) and order (asc)
		return (a[col] == b[col]) ? 0 : ((a[col] > b[col]) ? asc : -1 * asc);
	});
	for (i = 0; i < rlen; i++) {	// replace existing rows with new rows created from the sorted array
		rows[i].innerHTML = "<td>" + arr[i].join("</td><td>") + "</td>";
	}
	asc*=-1;
	if (reset_search)
		i2b2.IDRTAdditionalData.Search(temp, tab);
};

/**
 * Hides all lines that do not contain the searched string
 * @param string the search string
 * @param tab the selected tab
 */
i2b2.IDRTAdditionalData.Search = function(string, tab) {
	var s = string;
	ad_search = s.toLowerCase();
	ad_searchtab = tab;
	var rows = $('tablebody_'+tab).rows,
	rlen = rows.length,
	arr = new Array(),
	i, j, cells, clen;
	// fill the array with values from the table
	for (i = 0; i < rlen; i++) {
		cells = rows[i].cells;
		clen = cells.length;
		arr[i] = new Array();
		var st = "";
		for (j = 0; j < clen; j++) {
			arr[i][j] = cells[j].innerHTML;
			st += " " + arr[i][j];
		}
		st = st.toLowerCase();
		if (st.indexOf(ad_search) !=-1) {
			rows[i].style.display = "table-row";
		}else{
			rows[i].style.display = "none";
		}
	}
};

/**
 * NYI: Creates an MS-Excel Sheet.
 * @param tab the selected tab
 */
i2b2.IDRTAdditionalData.CreateExcelSheet = function(tab) {
	var i, j, str,
	myTable = document.getElementById('tablebody_'+tab),
	rowCount = myTable.rows.length,
	excel = new ActiveXObject('Excel.Application');// Activates Excel
	excel.Workbooks.Add(); // Opens a new Workbook
	excel.Application.Visible = true; // Shows Excel on the screen
	for (i = 0; i < rowCount; i++) {
		for (j = 0; j < myTable.rows[i].cells.length; j++) {
			str = myTable.rows[i].cells[j].innerText;
			excel.ActiveSheet.Cells(i + 1, j + 1).Value = str; // Writes to the sheet
		}
	}
	return;
};

/**
 * NYI: decodes a UTF-8 String
 * @param utftext
 * @returns {String}
 */
function decode_utf8(utftext) {
	var plaintext = ""; var i=0; var c=c1=c2=0;
	// while-Schleife, weil einige Zeichen uebersprungen werden
	while(i<utftext.length)
	{
		c = utftext.charCodeAt(i);
		if (c<128) {
			plaintext += String.fromCharCode(c);
			i++;}
		else if((c>191) && (c<224)) {
			c2 = utftext.charCodeAt(i+1);
			plaintext += String.fromCharCode(((c&31)<<6) | (c2&63));
			i+=2;}
		else {
			c2 = utftext.charCodeAt(i+1); c3 = utftext.charCodeAt(i+2);
			plaintext += String.fromCharCode(((c&15)<<12) | ((c2&63)<<6) | (c3&63));
			i+=3;}
	}
	return plaintext;
}

/**
 * Exports the selected table to CSV
 * @param tab the selected tab
 */
i2b2.IDRTAdditionalData.CSVExport = function(tab) {
	var data = [];
//	var sss = "data:text/csv;charset=ISO-8859-15,";
	var sss = "data:application/vnd.ms-excel,";
	var header = $('tablehead_'+tab).cells;
	for (var i2 = 0; i2 < header.length; i2++) {
		var headerName = header[i2].textContent;
		sss+=headerName+";";
	}
	sss = sss.substring(0, sss.length - 1);

	var rows = $('tablebody_'+tab).rows,
	rlen = rows.length,
	arr = new Array(),
	i, j, cells, clen;
	// fill the array with values from the table
	for (i = 0; i < rlen; i++) {
		cells = rows[i].cells;
		clen = cells.length;
		arr[i] = new Array();
		var st = "";
		for (j = 0; j < clen; j++) {
			arr[i][j] = cells[j].textContent;
			st += " " + arr[i][j];
		}
		st = st.toLowerCase();

		if (st.indexOf(ad_search) !=-1 || ad_searchtab != tab) {
			data.push(arr[i]);
		}
	}
	if (tab=='tab1')
		tab='@';
	sss+="\n";
	for (var i = 0; i < data.length; i++) {
		for (var j = 0; j < data[i].length; j++) {
			if (data[i][j]=="-")
				data[i][j]="";
			sss +=data[i][j]+";";
		};
		sss = sss.substring(0, sss.length - 1);
		sss+="\n";
	};
	sss = decode_utf8(sss);
//	//console.log(decode_utf8(sss));
	var encodedUri = encodeURI(sss);
	var link2 = document.createElement("a");
	document.body.appendChild(link2);
	link2.setAttribute("href", encodedUri);
	var date = new Date();
	var minutes = date.getMinutes();
	var seconds = date.getSeconds();
	if (seconds <10)
		seconds = "0"+seconds;
	if (minutes<10)
		minutes="0"+minutes;
	var hours = date.getHours();
	if (hours<10)
		hours="0"+hours;
	var month = date.getMonth()+1;
	if (month<10)
		month = "0"+month;

	link2.setAttribute("download", date.getFullYear()+""+month+""+date.getUTCDate()+ ""+hours+""+minutes+""+seconds+"_i2b2Query.csv");
	link2.click();

};

/**
 * Reverses the String
 * @param s the string to reverse
 */
i2b2.IDRTAdditionalData.reverse = function(s) {		//returns the reversed string
	var o = [];
	for (var i = 0, len = s.length; i <= len; i++)
		o.push(s.charAt(len - i));
	return o.join('');
};

/**
 * Returns the name of a column for a concept key + applied path
 * @param concept_key the concept_key of the item
 * @param applied_path the applied_path of the item
 */
i2b2.IDRTAdditionalData.getColumnNameNew = function(concept_key, applied_path) {
	console.info("concept_key: " + concept_key + "\t" + "applied_path: "+ applied_path)
	var resultXML = i2b2.ONT.ajax.GetTermInfo("Plugin:IDRTAdditionalData",{concept_key_value:concept_key, ont_synonym_records:true, ont_hidden_records:true});
	//console.info("resultXML");
	//console.info(resultXML);
	//console.info("resultXML");
	var visual = i2b2.h.getXNodeVal(i2b2.h.XPath(resultXML.refXML,'//concept')[0],"visualattributes");
	var basecode = i2b2.h.getXNodeVal(i2b2.h.XPath(resultXML.refXML,'//concept')[0],"basecode");
	if (visual=='RA '|| visual=='RA'|| visual=='RAE') {
		var key2 = i2b2.h.getXNodeVal(i2b2.h.XPath(resultXML.refXML,'//concept')[0],"key");
		var keys3 = key2.split("\\");
		if (keys3.length<=5) {
			applied_path = "\\\\i2b2" + applied_path;
			return i2b2.h.getXNodeVal(i2b2.h.XPath(i2b2.ONT.ajax.GetTermInfo("Plugin:IDRTAdditionalData",{concept_key_value:applied_path,ont_synonym_records:true,ont_hidden_records:true}).refXML,'//concept')[0],"name");
		}
		var newKey2 = "";
		for (var i = 0; i< keys3.length-2;i++){
			newKey2= newKey2 + keys3[i] + "\\";
		}
		var resultXML2=i2b2.ONT.ajax.GetTermInfo("Plugin:IDRTAdditionalData",{concept_key_value:newKey2,ont_synonym_records:true,ont_hidden_records:true});
		var basecode2 = i2b2.h.getXNodeVal(i2b2.h.XPath(resultXML2.refXML,'//concept')[0],"basecode");
		var dimcode = i2b2.h.getXNodeVal(i2b2.h.XPath(resultXML2.refXML,'//concept')[0],"dimcode").replace(/\\/g, "|");
		if(dimcode.startsWith("|"))
			dimcode = dimcode.substring(1, dimcode.length);
		var combinedKey = basecode2;// +"|"+ dimcode;
//		//console.log("combinedKey");
		console.log("CONB KEY");
		console.log(combinedKey);
		if (combinedKey.endsWith("|"))
			combinedKey = combinedKey.substring(0, combinedKey.length-1);
		return new Array(i2b2.h.getXNodeVal(i2b2.h.XPath(resultXML2.refXML,'//concept')[0],"name"),combinedKey);
	}
	else {
		console.log("else visual: " + visual);
		if (visual=='DA '|| visual=='DA'|| visual=='DAE') {
//			
			var dim = i2b2.h.getXNodeVal(i2b2.h.XPath(resultXML.refXML,'//concept')[0],"dimcode").replace(/\\/g, "|");
			if(dim.startsWith("|"))
			dim = dim.substring(1, dim.length);
//			basecode = basecode + "|"+ dim;
			console.log("Basecode: " + basecode);
		}
		console.log("BASECODE");
		console.log("111else basecode: " + basecode);
		if (basecode){
			if (basecode.endsWith("|"))
				basecode = basecode.substring(0, basecode.length-1);
//			basecode = basecode.split(":")[0];
		}
		console.log("else basecode: " + basecode);
		return new Array(i2b2.h.getXNodeVal(i2b2.h.XPath(resultXML.refXML,'//concept')[0],"name"),basecode);
	}
};

/**
 * Gets the result of the query
 */
i2b2.IDRTAdditionalData.getResults = function() {
	if(i2b2.IDRTAdditionalData.model.dirtyResultsData) {
		$('tablehead_tab1').innerHTML ='<th onclick="i2b2.IDRTAdditionalData.TableSorter(0,\'tab1\');">Patient ID <img src="js-i2b2/cells/plugins/examples/IDRTAdditionalData/assets/arrows.png" width="8px"></th>';
		if(i2b2.IDRTAdditionalData.showInstance)
			$('tablehead_tab1').insertAdjacentHTML('BeforeEnd', '<th onclick="i2b2.IDRTAdditionalData.TableSorter(1,\'tab1\');">Instance Num <img src="js-i2b2/cells/plugins/examples/IDRTAdditionalData/assets/arrows.png" width="8px"></th>');	// creating a new table header

		$('tablebody_tab1').innerHTML = '';



		var patient_data = new Object();	// this object holds all patients just as objects.
		var tabs = new Object();			// information about tabs
		ad_search = "";
		ad_searchtab="";
		asc = 1;
		ths = new Object();	// global twodimensional array, holds table headers in plaintext and concept_cd/modifier_cd
		var scopedCallback = new i2b2_scopedCallback();
		scopedCallback.scope = this;
		scopedCallback.callback = function(results) {
			if (results.error) {
				return false;
			}

			//Patientendata Tab
			tabs["@"] = new Array();
			tabs["@"].name="Patientendaten";
			tabs["@"].id="PAT";
			$('ADD-TAB').insertAdjacentHTML('afterbegin','<div id="tab1" onclick="i2b2.IDRTAdditionalData.TabManager(\'tab1\');" class="tab">Patientendaten</div>');

			var t = results.refXML;
			var pData = i2b2.h.XPath(t, '//item');
			////console.info("****");
			////console.info(pData);
			////console.info("****");
			for (var i1=0; i1<pData.length; i1++) {	
				////console.info(i1);
				////console.info(pData[i1]);
				var item = i2b2.h.getXNodeVal(pData[i1], 'item_key');
				var leaf = i2b2.h.getXNodeVal(pData[i1], 'item_icon');
				var mod = i2b2.h.getXNodeVal(pData[i1], 'modifier_key');
				var applied_path = i2b2.h.getXNodeVal(pData[i1], 'applied_path');
				if (!applied_path)
					applied_path="@";

				var basecodeFromAppliedPath = applied_path;
				if (basecodeFromAppliedPath!='@'){
					basecodeFromAppliedPath = basecodeFromAppliedPath.replace(/\\/g, "|");
					if (basecodeFromAppliedPath.endsWith("|")){
						basecodeFromAppliedPath = basecodeFromAppliedPath.substring(0, basecodeFromAppliedPath.length-1);
					}
				}
//				//console.info("basecodeFromAppliedPathbasecodeFromAppliedPathbasecodeFromAppliedPathbasecodeFromAppliedPath");
//				//console.info(basecodeFromAppliedPath);
				if (leaf=="LAE" || leaf=="LA" || leaf=="RA" ||leaf=="RAE"){

					var resultXML = i2b2.ONT.ajax.GetTermInfo("Plugin:IDRTAdditionalData",{concept_key_value:item, ont_synonym_records:true, ont_hidden_records:true});
					////console.info("get terms?");
					////console.info(resultXML);
					////console.info("get terms?");
					var columndatatype = i2b2.h.getXNodeVal(i2b2.h.XPath(resultXML.refXML,'//concept')[0],"columndatatype");
					var name  = i2b2.h.getXNodeVal(i2b2.h.XPath(resultXML.refXML,'//concept')[0],"name");
					var basecode =  i2b2.h.getXNodeVal(i2b2.h.XPath(resultXML.refXML,'//concept')[0],"basecode");
					////console.log("Name: " + name);
					////console.log("Datatype: " + columndatatype);
					////console.log("Path: " + basecode);

					var name3;
					var name2;
					if (columndatatype=="N"){
						//TODO MAGIC
						basecode  = basecode.substring(0,basecode.indexOf(":"));
						name2 = new Array(name,basecode);
						name3 = new Array(null,basecode);
					}
					else if (columndatatype=="T"){
						var keys = item.split("\\");
						var newKey = "";
						for (var i = 0; i< keys.length-2;i++){
							newKey= newKey + keys[i] + "\\";
						}

//						////console.log("643");
						name2 = i2b2.IDRTAdditionalData.getColumnNameNew(newKey,applied_path);
//						////console.log("RETURNING: ");
//						////console.log(name2);
						name3 = i2b2.IDRTAdditionalData.getColumnNameNew(item,applied_path);
						name3[1] = name3[1].substring(0,name3[1].indexOf(":"));
					}



//					////console.info(name2[1]);
//					////console.log("NAME3");
//					////console.log(name2);

					//TODO 3 lines
//					if (newKey.startsWith("\\\\i2b2")){
//					newKey = newKey.substring(6, item.length);
//					}
//					newKey = newKey.replace(/\\/g, "|");
					var name = name2[0];
					$('loadspan').innerHTML = "Resolving items: " +name + " " + tabs[applied_path];
//					applied_path=basecodeFromAppliedPath;
					var insert = true;
					if (!ths[applied_path]){
						ths[applied_path] = new Array();
						var insertTHS = new Array();
						//console.log("pushin: " +name2[0] + " " + name3[1] + " for " + applied_path);
						insertTHS.push(name2[0],name3[1]);
//						console.log("0PUSH: " + insertTHS);
						ths[applied_path].push(insertTHS);
						if (applied_path=='@')
							$('tablehead_tab1').insertAdjacentHTML('BeforeEnd', '<th onclick="i2b2.IDRTAdditionalData.TableSorter('+ths[applied_path].length+',\'tab1\');" title='+name3[1]+'>' + name + ' <img src="js-i2b2/cells/plugins/examples/IDRTAdditionalData/assets/arrows.png" width="8px"></th>');
						else
							$('tablehead_'+tabs[applied_path].id).insertAdjacentHTML('BeforeEnd', '<th onclick="i2b2.IDRTAdditionalData.TableSorter('+ths[applied_path].length+',\''+id+'\');" title='+name3[1]+'>' + 
									name + ' <img src="js-i2b2/cells/plugins/examples/IDRTAdditionalData/assets/arrows.png" width="8px"></th>');
					}
					else{
						for (var i = 0; i < ths[applied_path].length; i++) {	// check if name is already in ths
							if (ths[applied_path][i][1] == name2[1]) {
								insert = false;
								break;
							};
						};
						if (insert) {	
							var insertTHS = new Array();
							
							insertTHS.push(name2[0],name2[1]);
//							console.log("01PUSH: " + insertTHS);
							ths[applied_path].push(insertTHS);	//if true, push the array name2 (returned from function i2b2.IDRTAdditionalData.getColumnName) in ths
							if (applied_path==='@')
								$('tablehead_tab1').insertAdjacentHTML('BeforeEnd', '<th onclick="i2b2.IDRTAdditionalData.TableSorter('+ths[applied_path].length+',\'tab1\');" title='+name2[1]+'>' + 
										name + ' <img src="js-i2b2/cells/plugins/examples/IDRTAdditionalData/assets/arrows.png" width="8px"></th>');	// creating a new table header
						} 
					};
				}
				else{
//					console.info("11ELSEELSEELSEELSEELSEELSE");
//					console.info(applied_path);
					if (applied_path != "@"){
						if (!applied_path.startsWith("\\\\i2b2"))
							applied_path = "\\\\i2b2"+applied_path;
					}
					if (!tabs[applied_path]){
						var name;
						//Getting name for Modifier Tab
						if (mod){
//							console.log("691");
							name = i2b2.IDRTAdditionalData.getColumnNameNew(applied_path,applied_path)[0];
							console.log("RETURNING: ");
							//console.log(name);
						}
						else{
							//console.log("695");
							name = i2b2.IDRTAdditionalData.getColumnNameNew(item,applied_path)[0];
							//console.log("RETURNING: ");
							//console.log(name);
						}
						tabs[applied_path] = new Array();
						tabs[applied_path].name=name;
						var id = applied_path.replace(/\\/g, "|");
						tabs[applied_path].id=id;

						//Adds a new Tab to the table
						i2b2.IDRTAdditionalData.addNewTab(id,name);
					}
					var name2;
					if (!mod){
						//console.log("708");
						name2 = i2b2.IDRTAdditionalData.getColumnNameNew(item,applied_path);
						//console.log("RETURNING: ");
						//console.log(name2);
					}
					else{
						//console.log("712");
						name2 = i2b2.IDRTAdditionalData.getColumnNameNew(mod,applied_path);
						//console.log("RETURNING: ");
						//console.log(name2);
					}

					var name = name2[0];
					$('loadspan').innerHTML = "Resolving from items: " +name;
//					applied_path=basecodeFromAppliedPath;
					var insert = true;
					if (!ths[applied_path]){
						ths[applied_path] = new Array();
//						console.log("1PUSH: " + name2);
						ths[applied_path].push(name2);	
						if (applied_path=='@')
							$('tablehead_tab1').insertAdjacentHTML('BeforeEnd', '<th onclick="i2b2.IDRTAdditionalData.TableSorter('+ths[applied_path].length+',\''+'tab1'+'\');"title='+name2[1]+'>' + 
									name + ' <img src="js-i2b2/cells/plugins/examples/IDRTAdditionalData/assets/arrows.png" width="8px"></th>');
						else
							$('tablehead_'+tabs[applied_path].id).insertAdjacentHTML('BeforeEnd', '<th onclick="i2b2.IDRTAdditionalData.TableSorter('+ths[applied_path].length+',\''+tabs[applied_path].id+'\');"title='+name2[1]+'>' +
									name + ' <img src="js-i2b2/cells/plugins/examples/IDRTAdditionalData/assets/arrows.png" width="8px"></th>');
					}
					else{
						for (var i = 0; i < ths[applied_path].length; i++) {
							if (ths[applied_path][i][1] == name2[1]) {
								//console.log(ths[applied_path][i][1] + " == " + name2[1]);
								insert = false;
								break;
							}
						}
						if (insert) {
							if (ths[applied_path]){
//								console.log("2PUSH: " + name2);
								ths[applied_path].push(name2);	
							}
							if (applied_path=='@')
								$('tablehead_tab1').insertAdjacentHTML('BeforeEnd', '<th onclick="i2b2.IDRTAdditionalData.TableSorter('+ths[applied_path].length+',\''+'tab1'+'\');"title='+name2[1]+'>' +
										name + ' <img src="js-i2b2/cells/plugins/examples/IDRTAdditionalData/assets/arrows.png" width="8px"></th>');
							else
								$('tablehead_'+tabs[applied_path].id).insertAdjacentHTML('BeforeEnd', '<th onclick="i2b2.IDRTAdditionalData.TableSorter('+ths[applied_path].length+',\''+tabs[applied_path].id+'\');"title='+name2[1]+'>' +
										name + ' <img src="js-i2b2/cells/plugins/examples/IDRTAdditionalData/assets/arrows.png" width="8px"></th>');
						}
					}
				}
			}

			console.log("thsthsthsthsthsths");
			console.log(ths);
			//Loading Observations from Server
			$('loadspan').innerHTML = "Resolving observations... (this could take some time!)";
			// set a marker where "panel" appears first time - cut there - invert the string - set a marker where "lenap" appears first time - cut there  - invert the string again - replace all escapechars
			var panels = (i2b2.IDRTAdditionalData.reverse(i2b2.IDRTAdditionalData.reverse(i2b2.h.Escape(results.msgResponse).replace(/panel/,"cuthere&lt;panel").split("cuthere")[1])
					.replace(/;tg&lenap/,"cuthere").split("cuthere")[1])+"panel&gt;").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot/g,'"');
			
		panels = i2b2.IDRTAdditionalData.removeExcludedPanels(results);
		
		console.log(panels);
			var pgstart = 1;
			var pgend =4740992; //number of max returned patients. Can be used for paging.
			var filter = '<input_list>\n' +
			'	<patient_list max="'+pgend+'" min="'+pgstart+'">\n'+
			'		<patient_set_coll_id>'+i2b2.IDRTAdditionalData.model.ResultSetId+'</patient_set_coll_id>\n'+
			'	</patient_list>\n'+
			'</input_list>\n'+
			'<filter_list>\n'+
			panels+
			'</filter_list>\n'+
			'<output_option>\n'+
			'	<observation_set blob="true" onlykeys="false"/>\n'+
			'	<pid_set select="using_filter_list" onlykeys="false"/>\n'+
			'</output_option>\n';
			//console.info("**************");
			//console.log(filter);
			var scopedCallback = new i2b2_scopedCallback();
			scopedCallback.scope = this;
			scopedCallback.callback = function(results) {
				if (results.error) {
					$('loadspan').innerHTML = "Error";
					alert("Server Responded with Error!");
					return false;
				};
				var patient_set = i2b2.h.XPath(results.refXML, '//pid');
				for(var j = 0;j<patient_set.length;j++){
					var pid_setPatient_id =  i2b2.h.getXNodeVal(patient_set[j], 'patient_id');
					var patient_map_id = i2b2.h.getXNodeVal(patient_set[j], 'patient_map_id[@source="GOE" or @source="IDRT"]');
					if(patient_map_id==undefined)
						patient_map_id = pid_setPatient_id;
					//insert a new patient object in the patient_data with the attributes id, name for the table and a new object "rows". rows is mentioned to hold for every instance num greater than 1 a new object witht all values from the observations for this instance num
//					//console.log("for??");
					patient_data[pid_setPatient_id] = {id:pid_setPatient_id, name:patient_map_id, hasPheno: false, isInserted:false, rows:{}};	

				}
//				//console.log("1");
				var observation_set = i2b2.h.XPath(results.refXML, '//*[local-name() = "observation_set"]');
				for (var i = 0;i<observation_set.length;i++){
					var observations = i2b2.h.XPath(observation_set[i],'observation');
					for (i1=0;i1<observations.length;i1++){
						var patient_id = i2b2.h.getXNodeVal(observations[i1], 'patient_id');
//						//console.log("1,1");
						var instance_num = i2b2.h.getXNodeVal(observations[i1], 'instance_num');
//						//console.log("1,2");
						var modifier_cd = i2b2.h.getXNodeVal(observations[i1], 'modifier_cd');
//						//console.log("modifier_cd " + modifier_cd);
//						//console.log("2");
//						//console.log(patient_data);
//						//console.log("2,0001");
//						//console.log(patient_id);

						patient_data[patient_id].isInserted=false;
//						//console.log("2,00");
						if (instance_num>1) {
//							//console.log("2,1");
							if(!(patient_data[patient_id].rows[instance_num])) {	// if no object for that instance num was found in rows, the next line will create a new object
								patient_data[patient_id].rows[instance_num] = {};
							}
						}

						else {
//							//console.log("2,2");
							patient_data[patient_id].hasPheno = true;
						}
//						//console.log("2,33");
						var tdclass;
						if (modifier_cd=="@") {
							var concept_cd = i2b2.h.getXNodeVal(observations[i1], 'concept_cd');
							concept_cd = concept_cd.replace(/[|,]/g,"\\");
							concept_cd = concept_cd.split(":");
							//TODO
//							//console.log("4");
							tdclass = (concept_cd[0]);//.replace(/ /g, "-");
//							tdclass=i2b2.h.getXNodeVal(observations[i1], 'concept_cd');
						}else{
//							//console.log("3");
							modifier_cd = modifier_cd.replace(/[|,]/g,"\\");
							modifier_cd = modifier_cd.split(":");
							if (modifier_cd[0].split("\\")[0].length<1) {
								tdclass = ( modifier_cd[0]+ "\\");//.replace(/ /g, "-");
							}else{
								tdclass = (modifier_cd[0]+ "\\");//.replace(/ /g, "-");
							}
							//TODO
							tdclass = i2b2.h.getXNodeVal(observations[i1], 'modifier_cd');
							//console.log("new tdclass before: " + tdclass);
							tdclass = tdclass.split(":");
							//TODO
							tdclass = (tdclass[0]);//.replace(/ /g, "-");
						}
//						//console.log("5");
						tdclass = tdclass.replace(/\\/g, "|");
						//console.log("new tdclass after: " + tdclass);
						var valuetype_cd = i2b2.h.getXNodeVal(observations[i1], 'valuetype_cd');
						var tdvalue;
						if (valuetype_cd=="T") {
							tdvalue = i2b2.h.getXNodeVal(observations[i1], 'tval_char');
						}else {
							tdvalue = i2b2.h.getXNodeVal(observations[i1], 'nval_num');
						}	
						console.log("tdval:" + tdvalue);
						console.log("tdclass: " + tdclass);
						if (instance_num>1) {
							patient_data[patient_id].rows[instance_num][tdclass] = tdvalue;		// add a new entry to the instance num object in the rows object in the patient object in the patien_data object ;)
						}else{
							patient_data[patient_id][tdclass] = tdvalue;	// otherwise add it as a "global" attribute for the patient - this should be phenotypical
							patient_data[patient_id].hasPheno = true;
						}
					}
				}
//				//console.log("6");
				i2b2.IDRTAdditionalData.tabs = tabs;
				//console.log("patient_datapatient_datapatient_datapatient_data");
				//console.log(patient_data);
				//This removes all instance_nums that are not in all modifiers.
				var masterInstanceSet = new Object();
				for (var patient in patient_data){
					masterInstanceSet[patient] = new Array();
					//console.log("pat: " +patient);
					if (patient_data[patient].rows){

						for (var instance_num in patient_data[patient].rows) {
//							var insert = true;
//							//console.log("i:\t"+instance_num);
//							for (var basecode in patient_data[patient].rows[instance_num]){
//							//console.log("b:\t\t"+basecode);
//							for (var i2 in patient_data[patient].rows){
//							//console.log("i2:\t\t\t"+i2);
//							if(!patient_data[patient].rows[i2][basecode]){
//							insert=false;
//							//console.log("break");
//							break;
//							}
//							}
//							if(insert){
//							//console.log("insert");
//							masterInstanceSet[patient].push(instance_num);
//							}


//							}
							
//							console.log("inst: \t"+instance_num);
							for (var applied_path in ths){
								if (applied_path!='@'){
//									console.log("appl: \t\t" + applied_path);
									for (var i = 0; i < ths[applied_path].length; i++) {
										//console.log("ths[applied_path][i][1] \t\t\t" + ths[applied_path][i][1]);
										if (patient_data[patient].rows[instance_num][ths[applied_path][i][1]]) {
											//console.log("YES");
//											if (patient_data[patient].rows[instance_num].startsWith(newPath)) {
											if (!masterInstanceSet[patient][applied_path]){
												//console.log("1");
												masterInstanceSet[patient][applied_path] = new Object();
											}
											if (!masterInstanceSet[patient][applied_path][ths[applied_path][i][1]]){
												//console.log("2");
												masterInstanceSet[patient][applied_path][ths[applied_path][i][1]]=new Array();
											}
											//console.log("-->\t\t\t\t"+ths[applied_path][i][1]);
											masterInstanceSet[patient][applied_path][ths[applied_path][i][1]].push(instance_num);
										}
										else
											console.log("NOPE");
									}
								}
							}
						}
					}
				}
				console.log("Patient_data");
				console.log(patient_data);
				console.log("MIS");
				console.log(masterInstanceSet);
				console.log("THEADER");
				console.log(ths);
				var list = new Object();
				var tmp = masterInstanceSet;
				for (var patient in masterInstanceSet){
					list[patient]=new Array();
					//console.log("1");
					for (var applied_path in ths){
						if (applied_path!='@'){
							//console.log("2");
							list[patient][applied_path]=new Array();
							for (var i = 0; i < ths[applied_path].length; i++) {
								//console.log("3:" + i + " " + applied_path);
								var concept = ths[applied_path][i][1];
								//console.log("3.000001");
								if (!masterInstanceSet[patient][applied_path])
									continue;
								if (masterInstanceSet[patient][applied_path][concept]){
									//console.log("3");
									for (var i3 = 0; i3< masterInstanceSet[patient][applied_path][concept].length;i3++){
										//console.log("3.1");
										var instance=masterInstanceSet[patient][applied_path][concept][i3];
										for (var applied_path2 in ths){
											//console.log("4");
											if (applied_path2 != '@'){
												var insert = true;
												//console.log("5");
												for (var i2 = 0; i2 < ths[applied_path2].length; i2++) {
													//console.log("6");
													var conceptToCheck = ths[applied_path2][i2][1];
													if (tmp[patient][applied_path][conceptToCheck]){ //&& applied_path2 != applied_path
														if (!tmp[patient][applied_path][conceptToCheck].contains(instance)){
															insert =false;
															break;
														}
													}
													else {
														insert=false;
														break;
													}
												}
												if (insert && !list[patient][applied_path].contains(instance)){
													//console.log("7");
													list[patient][applied_path].push(instance);
												}
											}
										}
									}
								}
								else {
									console.log("ELSE")
								}
							}
						}
					}
				}
				console.log("DONE");
				i2b2.IDRTAdditionalData.list = list;
				i2b2.IDRTAdditionalData.patient_data = patient_data;
				for (var p in patient_data) {
					//console.info(p);
					//for all patients: if there are rows, create for every row a tablerow
					var isRowsObjectEmpty = true;
					for (var r in patient_data[p].rows) {
						isRowsObjectEmpty = false;
//						//console.info("r: " + r);
						for (var applied_path in ths){
//							//console.info("pa: " + p + "  a: " + applied_path);
							if (applied_path!='@' && list[p][applied_path].contains(r) ){


								var pat_tab = "<tr><td>" + patient_data[p].name +"</td>";
								if(i2b2.IDRTAdditionalData.showInstance)
									pat_tab += "<td>" + "1" +"</td>";

								var combined_tab = "<tr><td>" + patient_data[p].name +"</td>";
								if(i2b2.IDRTAdditionalData.showInstance)
									combined_tab += "<td>" + r +"</td>";
								if (!patient_data[p].hasPheno && !patient_data[p].isInserted){

									patient_data[p].isInserted=true;
									$('tablebody_tab1').insertAdjacentHTML("BeforeEnd", pat_tab);
								}
								var str_ = "<tr><td>" + patient_data[p].name +"</td>";

								if (applied_path == "@"){ 
									if(i2b2.IDRTAdditionalData.showInstance)
										str_ += "<td>" + "1" +"</td>"; 
								}
								else{
									if(i2b2.IDRTAdditionalData.showInstance)
										str_ += "<td>" + r +"</td>";
								}
								var insert = false;
								for (var i = 0; i < ths[applied_path].length; i++) {
									if (patient_data[p][ths[applied_path][i][1]]) {		// if this is a phenotypical attribute, take it and continue
										insert=true;
										str_+="<td>"+patient_data[p][ths[applied_path][i][1]]+"</td>";
									}else{
										if (patient_data[p].rows[r][ths[applied_path][i][1]]) {
											insert=true;
											str_+="<td>"+patient_data[p].rows[r][ths[applied_path][i][1]]+"</td>";
										}else  {
											str_+="<td></td>";
										};
									};
								}
								str_+="</tr>";

								if (insert){
									$('tablebody_'+tabs[applied_path].id).insertAdjacentHTML("BeforeEnd", str_);
								}
							}
							else if (applied_path=='@'){
								var str_ = "<tr><td>" + patient_data[p].name +"</td>";
								if(i2b2.IDRTAdditionalData.showInstance)
									str_ += "<td>" + "1" +"</td>"; 
								for (var i22 = 0; i22 < ths[applied_path].length; i22++) {
									if (patient_data[p][ths[applied_path][i22][1]]) {		// if this is a phenotypical attribute, take it and continue
										insert=true;
//										//console.log("insert");
										str_+="<td>"+patient_data[p][ths[applied_path][i22][1]]+"</td>";
									}else{
//										//console.log("else");
										if (patient_data[p].rows[r][ths[applied_path][i22][1]]) {
//											//console.log("if2");
											insert=true;
											str_+="<td>"+patient_data[p].rows[r][ths[applied_path][i22][1]]+"</td>";
										}else  {
//											//console.log("else2");
											str_+="<td></td>";
										};
									};
								}
								str_+="</tr>";
//								//console.info(str_);
								if (!patient_data[p].isInserted)
									$('tablebody_tab1').insertAdjacentHTML("BeforeEnd", str_);
								patient_data[p].isInserted=true;
							}
						}
					}
					if (isRowsObjectEmpty) {//if there are no rows, display only the global attributes
						//console.info("isRowsObjectEmpty: " + isRowsObjectEmpty)
						var tables = new Object();
						for (var applied_path in ths){
							tables[applied_path] = "<tr><td>" + patient_data[p].name +"</td>";
							if(i2b2.IDRTAdditionalData.showInstance)
								tables[applied_path] += "<td>" + "1" +"</td>";
							for (var i = 0; i < ths[applied_path].length; i++) {
								if (patient_data[p][ths[applied_path][i][1]]) {
									tables[applied_path]+="<td>"+patient_data[p][ths[applied_path][i][1]]+"</td>";
								}else{
									tables[applied_path]+="<td></td>";
								};
							}
						};
						tables[applied_path]+="</tr>";
						$('tablebody_tab1').insertAdjacentHTML("BeforeEnd", tables[applied_path]);
					}
				}
				var carts = new Array();
				var counter = 0;
				//console.log("thsthsthsthsths");
				//console.log(ths);
				for (var mods in ths){
					counter++;
					carts.push(mods);
				}
				//console.log("*************");
				//console.log(patient_data);
				i2b2.IDRTAdditionalData.carts = carts;
				if (counter>1){
					i2b2.IDRTAdditionalData.addNewTab('cart','Combined', 'block', 'afterBegin');
					i2b2.IDRTAdditionalData.cartProduct(carts);

					$('loaddiv').style.display = "none";
					$('ad_table_content_tab1').style.display = "block";
				}
				else {
					$('loaddiv').style.display = "none";
					i2b2.IDRTAdditionalData.TabManager("tab1");
				}
			};
			i2b2.CRC.ajax.getPDO_fromInputList("Plugin:IDRTAdditionalData", {patient_limit:0, PDO_Request:filter}, scopedCallback);
		};
		i2b2.IDRTAdditionalData.model.dirtyResultsData = false;
		i2b2.CRC.ajax.getRequestXml_fromQueryMasterId("Plugin:IDRTAdditionalData", { qm_key_value: i2b2.IDRTAdditionalData.model.id }, scopedCallback);
	}
};

/**
 * This function is called if the plugin is unloaded.
 */
i2b2.IDRTAdditionalData.Unload = function() {
	i2b2.IDRTAdditionalData.model.dirtyResultsData = false;
	i2b2.IDRTAdditionalData.model = {};
	i2b2.IDRTAdditionalData.model.requestString = '';
	i2b2.IDRTAdditionalData.model.responseXML = '';
	i2b2.IDRTAdditionalData.model.responseString = '';
	return true;
};
