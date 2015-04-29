/**
 * @projectDescription	AdditionalData web client plugin.
 * @inherits	i2b2
 * @namespace	i2b2.AdditionalData
 * @author	Achim Krüger
 * @version 	1.0
 * ----------------------------------------------------------------------------------------
 */

i2b2.AdditionalData.Init = function(loadedDiv) {
	console.log("Start der Funktion i2b2.AdditionalData.Init");
	// this function is called after the HTML is loaded into the viewer DIV 
	i2b2.AdditionalData.view.containerDiv = loadedDiv; 
	// i2b2.AdditionalData.view.containerDiv.innerHTML = "test"
	// register DIV as valid DragDrop target for Patient Record Sets (PRS) objects 
     var divName = "dropzone"; 
     // register for drop events of the following datatypes 
     var op_trgt = {dropTarget:true}; 
     i2b2.sdx.Master.AttachType(divName, 'PRS', op_trgt); 
     i2b2.sdx.Master.setHandlerCustom(divName, "PRS", "DropHandler", i2b2.AdditionalData.Dropped);
}

i2b2.AdditionalData.TabManager = function(tab) {
	document.getElementById("tab1").className = 'tab';
	document.getElementById("tab2").className = 'tab';
	// document.getElementById("tab3").className = 'tab';
	document.getElementById(tab).className = 'tab active';
	document.getElementById("tab1_container").style.display = "none";
	document.getElementById("tab2_container").style.display = "none";
	// document.getElementById("tab3_container").style.display = "none";
	document.getElementById(tab + "_container").style.display = "block";
}

i2b2.AdditionalData.Dropped = function(sdxData) {
	sdxData = sdxData[0];
	i2b2.AdditionalData.model.prsRecord = sdxData;
	$('dropzone').style.height = "16px";
	$('dropzone').innerHTML = i2b2.h.Escape(sdxData.sdxInfo.sdxDisplayName);
	$('dropzone').insertAdjacentHTML("beforeend","<span style='float:right'>You can drop more data here</span>");
	console.log($('anaPluginViewFrame').style.height);
	$('AdditionalData_content').style.display = "block";
	var ResultSetId = sdxData.sdxInfo.sdxKeyValue;
	i2b2.AdditionalData.model.ResultSetId = ResultSetId;
	var QueryMasterId = sdxData.origData.QM_id;
	i2b2.AdditionalData.model.QueryMasterId = QueryMasterId;
    i2b2.AdditionalData.model.dirtyResultsData = true; // our input dataset has changed and any analysis needs to be redone 
    i2b2.AdditionalData.model.responseXML = '';
	i2b2.AdditionalData.model.responseString = '';
	i2b2.AdditionalData.model.id = QueryMasterId;
	i2b2.AdditionalData.getResults();
}

i2b2.AdditionalData.reverse = function(s) {
  	var o = [];
  	for (var i = 0, len = s.length; i <= len; i++)
    	o.push(s.charAt(len - i));
  	return o.join('');
}

i2b2.AdditionalData.removeLastTerm = function(s) {
	var temp = s.split("\\");
	var newString = "";
	for (i = 0; i< temp.length-2; i++){
		newString= newString + temp[i] + "\\";
	}
	return newString;
}

i2b2.AdditionalData.getColumnName = function(mod,newKey,applied_path) {
	if (mod) {
		var name;
		console.log("Fordere Namen nach modifier_key '" + mod + "' an");
		var temp = i2b2.h.getXNodeVal(i2b2.h.XPath(i2b2.ONT.ajax.GetTermInfo("Plugin:AdditionalData",{concept_key_value:mod,ont_synonym_records:true,ont_hidden_records:true}).refXML,'//concept')[0],"visualattributes");
		console.log("visualattributes: " + temp);
		if (temp=='RA '|| temp=='RA'|| temp=='RAE') {
			console.log("Start key auslesen");
			var key2 = i2b2.h.getXNodeVal(i2b2.h.XPath(i2b2.ONT.ajax.GetTermInfo("Plugin:AdditionalData",{concept_key_value:mod,ont_synonym_records:true,ont_hidden_records:true}).refXML,'//concept')[0],"key");
			console.log("key2: " + key2);
			var keys3 = key2.split("\\");
			console.log(keys3);
			if (keys3.length<=5) {
				applied_path = "\\\\i2b2" + applied_path;
				console.log("applied_path: " + applied_path);
				return new Array(i2b2.h.getXNodeVal(i2b2.h.XPath(i2b2.ONT.ajax.GetTermInfo("Plugin:AdditionalData",{concept_key_value:applied_path,ont_synonym_records:true,ont_hidden_records:true}).refXML,'//concept')[0],"name"),applied_path);
				
			};
			var newKey2 = "";
			for (i = 0; i< keys3.length-2;i++){
				newKey2= newKey2 + keys3[i] + "\\";
			}
			return new Array(i2b2.h.getXNodeVal(i2b2.h.XPath(i2b2.ONT.ajax.GetTermInfo("Plugin:AdditionalData",{concept_key_value:newKey2,ont_synonym_records:true,ont_hidden_records:true}).refXML,'//concept')[0],"name"),newKey2);
		}else {
			return new Array(i2b2.h.getXNodeVal(i2b2.h.XPath(i2b2.ONT.ajax.GetTermInfo("Plugin:AdditionalData",{concept_key_value:mod,ont_synonym_records:true,ont_hidden_records:true}).refXML,'//concept')[0],"name"),mod);
		};
		// console.log(i2b2.h.XPath(i2b2.ONT.ajax.GetTermInfo("Plugin:AdditionalData",{concept_key_value:mod,ont_synonym_records:true,ont_hidden_records:true}).refXML,'//concept')[0]);
	}else {
		console.log("Fordere Namen nach modifiziertem item_key '" + newKey + "' an");
		return new Array(i2b2.h.getXNodeVal(i2b2.h.XPath(i2b2.ONT.ajax.GetTermInfo("Plugin:AdditionalData",{concept_key_value:newKey,ont_synonym_records:true,ont_hidden_records:true}).refXML,'//concept')[0],"name"),newKey);
	}
}

i2b2.AdditionalData.getResults = function() {
	if(i2b2.AdditionalData.model.dirtyResultsData) {
		ths = new Array();
		var patientMap = new Object();
		var map = new Object();
		var position = new Array();
		function Patient(patient_num,realpid) {
			console.info("New patient with id " + realpid + " was created!");
			this.realpid=realpid;
			this.patient_num=patient_num;
		}
		var scopedCallback = new i2b2_scopedCallback();
		scopedCallback.scope = this;
		scopedCallback.callback = function(results) {
			// THIS function is used to process the AJAX results of the getChild call
			//		results data object contains the following attributes:
			//			refXML: xmlDomObject <--- for data processing
			//			msgRequest: xml (string)
			//			msgResponse: xml (string)
			//			error: boolean
			//			errorStatus: string [only with error=true]
			//			errorMsg: string [only with error=true]
			// check for errors
			if (results.error) {
				return false;
			}
			var t = results.refXML;
			var retChildren = {};
			console.log(t);
			console.info("i2b2.h.XPath(t, '//item')");
			var pData = i2b2.h.XPath(t, '//item');
			console.info("done, items: " + pData.length);
			console.info(pData);
			for (var i1=0; i1<pData.length; i1++) {	
				console.info("check item " + (i1+1));
				console.log(pData[i1]);
				var item = i2b2.h.getXNodeVal(pData[i1], 'item_key');
				var leaf = i2b2.h.getXNodeVal(pData[i1], 'item_icon');
				var mod = i2b2.h.getXNodeVal(pData[i1], 'modifier_key');
				var applied_path = i2b2.h.getXNodeVal(pData[i1], 'applied_path');
				if (mod) {
					console.log("modifier_key: "+mod);
				}else{
					console.log("no modifier_key found!!!!");
				};
				console.log("item_key: " + item);
				console.log("item_icon: " + leaf);
				if (leaf=="LAE" || leaf=="LA" || leaf=="RA" ||leaf=="RAE"){
					console.log("Weiterbehandlung weil item_icon '" + leaf + "' gefunden wurde");
					var keys = item.split("\\");
					var newKey = "";
					for (i = 0; i< keys.length-2;i++){
						newKey= newKey + keys[i] + "\\";
					}
				
					console.log("modifizierter item_key: " + newKey);
					var name2 = i2b2.AdditionalData.getColumnName(mod,newKey,applied_path);
					console.log(name2);
					var name = name2[0];
					console.log("Name: " + name);
					var insert = true;
					for (var i = 0; i < ths.length; i++) {
						if (ths[i][0] == name) {
							insert = false;
						};
					};
					if (insert) {
						ths.push(name2);
						$('tablehead').insertAdjacentHTML('BeforeEnd', '<th>' + name + '</th>');
						console.log("Pushed " + name + " into tableheader");
					} else {
						console.log("Pushed " + name + " not into tableheader");
					};
					console.log(ths);
				}
				else{
					console.log("Kein LA");
					// console.log(i2b2.h.XPath(i2b2.ONT.ajax.GetTermInfo("Plugin:AdditionalData",{concept_key_value:item,ont_synonym_records:true,ont_hidden_records:true}).refXML,'//concept')[0]);
					var name2 = i2b2.AdditionalData.getColumnName(mod,item,applied_path);
					console.log(name2);
					var name = name2[0];
					console.log("Name: " + name);
					// var name = i2b2.h.getXNodeVal(pData[i1],'modifier_name');
					var insert = true;
					for (var i = 0; i < ths.length; i++) {
						if (ths[i][0] == name) {
							insert = false;
						};
					};
					if (insert) {
						ths.push(name2);
						$('tablehead').insertAdjacentHTML('BeforeEnd', '<th>' + name + '</th>');
						console.log("Pushed " + name + " into tableheader");
					} else {
						console.log("Pushed " + name + " not into tableheader");
					};
					console.log(ths);
				}
			}
			var panels = (i2b2.AdditionalData.reverse(i2b2.AdditionalData.reverse(i2b2.h.Escape(results.msgResponse).replace(/panel/,"cuthere&lt;panel").split("cuthere")[1]).replace(/;tg&lenap/,"cuthere").split("cuthere")[1])+"panel&gt;").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot/g,'"');
			var pgstart = 1;
			var pgend =4740992;
			var filter = '<input_list>\n' +
			'	<patient_list max="'+pgend+'" min="'+pgstart+'">\n'+
			'		<patient_set_coll_id>'+i2b2.AdditionalData.model.ResultSetId+'</patient_set_coll_id>\n'+
			'	</patient_list>\n'+
			'</input_list>\n'+
			'<filter_list>\n'+
			panels+
			'</filter_list>\n'+
			'<output_option>\n'+
			'	<observation_set blob="true" onlykeys="false"/>\n'+
			'	<pid_set select="using_filter_list" onlykeys="false"/>\n'+
			'</output_option>\n';
			var scopedCallback = new i2b2_scopedCallback();
			scopedCallback.scope = this;
			scopedCallback.callback = function(results) {
				console.log("Start der zweiten callback");
				console.log(results);
				if (results.error) {
					console.log("error");
					return false;
				};
				var patient_set = i2b2.h.XPath(results.refXML, '//pid');
				// console.log(patient_set);
				// console.log(patient_set.length);
				for(j=0;j<patient_set.length;j++){
					var pid_setPatient_id =  i2b2.h.getXNodeVal(patient_set[j], 'patient_id');
					var patient_map_id = i2b2.h.getXNodeVal(patient_set[j], 'patient_map_id[@source="GOE" or @source="IDRT"]');
					if(patient_map_id==undefined)
						patient_map_id = pid_setPatient_id;
					console.info(pid_setPatient_id + "|" + patient_map_id);
					var tablestring = '';
					for (var i = 0; i < ths.length; i++) {

						tablestring+='<td id='+ths[i][1].replace(/ /g, "-")+'_'+pid_setPatient_id+'></td>'
					};
					$('tablebody').insertAdjacentHTML("BeforeEnd", "<tr><td>" + pid_setPatient_id + "</td>" + tablestring + "</tr>");
					// patientMap[pid_setPatient_id] = new Patient(pid_setPatient_id,patient_map_id);
				}
				var observation_set = i2b2.h.XPath(results.refXML, '//*[local-name() = "observation_set"]');
				// console.log(observation_set);
				for (i=0;i<observation_set.length;i++){
					var observations = i2b2.h.XPath(observation_set[i],'observation');
					// console.log(observations);
					for (i1=0;i1<observations.length;i1++){
						var patient_id = i2b2.h.getXNodeVal(observations[i1], 'patient_id');
						var modifier_cd = i2b2.h.getXNodeVal(observations[i1], 'modifier_cd');
						if (modifier_cd=="@") {
							var concept_cd = i2b2.h.getXNodeVal(observations[i1], 'concept_cd');
							concept_cd = concept_cd.replace(/[|,]/g,"\\");
							concept_cd = concept_cd.split(":");
							console.log("concept_cd: "+concept_cd[0]);
							var tdid = "\\\\i2b2" + concept_cd[0] + "\\_" + patient_id;
							tdid = tdid.replace(/ /g, "-");
							console.log("tdid: " + tdid);
						}else{
							modifier_cd = modifier_cd.replace(/[|,]/g,"\\");
							modifier_cd = modifier_cd.split(":");
							console.log("modifier_cd: "+modifier_cd[0]);
							if (modifier_cd[0].split("\\")[0].length<1) {
								var tdid = "\\\\i2b2" + modifier_cd[0] + "\\_" + patient_id;
								tdid = tdid.replace(/ /g, "-");
							}else{
								var tdid = "\\\\i2b2\\" + modifier_cd[0] + "\\_" + patient_id;
								tdid = tdid.replace(/ /g, "-");
							}
							console.log("tdid: " + tdid);
						}
						var valuetype_cd = i2b2.h.getXNodeVal(observations[i1], 'valuetype_cd');
						if (valuetype_cd=="T") {
							var tdvalue = i2b2.h.getXNodeVal(observations[i1], 'tval_char');
						}else {
							var tdvalue = i2b2.h.getXNodeVal(observations[i1], 'nval_num');
						}
						console.log("inserting " + tdvalue + " in td " + tdid);
						if ($(tdid).innerHTML=="") {
							$(tdid).insertAdjacentHTML("BeforeEnd", tdvalue);
						}else{
							$(tdid).insertAdjacentHTML("BeforeEnd", " ,"+tdvalue);
						}
						


					}
				}
			}
			console.log("i2b2.CRC.ajax.getPDO_fromInputList");
			i2b2.CRC.ajax.getPDO_fromInputList("Plugin:AdditionalData", {patient_limit:0, PDO_Request:filter}, scopedCallback);
		}
		i2b2.AdditionalData.model.dirtyResultsData = false;
		i2b2.CRC.ajax.getRequestXml_fromQueryMasterId("Plugin:AdditionalData", { qm_key_value: i2b2.AdditionalData.model.id }, scopedCallback);

	}
}

i2b2.AdditionalData.Unload = function() {
	i2b2.AdditionalData.model = {};
	i2b2.AdditionalData.model.requestString = '';
	i2b2.AdditionalData.model.responseXML = '';
	i2b2.AdditionalData.model.responseString = '';
	return true;
}