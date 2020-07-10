loadJS('index.php?module=Settings&action=SettingsAjax&file=getjslanguage');
loadJS('modules/Settings/ModuleBuilder/fieldconfigs.js');
const tuiGrid = tui.Grid;
let url = 'index.php?module=Settings&action=SettingsAjax&file=BuilderFunctions';
let dataGridInstance;

const mb = {
	/**
     * Save values for each step
     * @param {number} step
     * @param {boolean} forward
     * @param {string} buttonid
     */
	SaveModule: (step, forward = true, buttonid = '') => {
		if (step == 1) {
			const modulename = mb.loadElement('modulename');
			const modulelabel = mb.loadElement('modulelabel');
			const parentmenu = mb.loadElement('parentmenu');
			const moduleicon = mb.loadElement('moduleicon');
			var data = {
				modulename: modulename,
				modulelabel: modulelabel,
				parentmenu: parentmenu,
				moduleicon: moduleicon,
				step: step
			};
		}
		if (step == 2) {
			var blocks_label = [];
			const number_block = mb.loadElement('number_block');
			for (var i = 1; i <= number_block; i++) {
				blocks_label[i] = mb.loadElement('blocks_label_' + i);
			}
			var data = {
				blocks: blocks_label,
				step: step
			};
		}

		if (step == 3) {
			var fields = [];
			const number_field = mb.loadElement('number_field');
			var btnid = buttonid.split('-')[4];
			if (forward == false) {
				var fieldValues = {};
				var fieldsid = mb.loadElement('fieldsid_' + btnid);
				var blockid = mb.loadElement('select-for-field-' + btnid);
				var fieldname = mb.loadElement('fieldname_' + btnid);
				const columnname =mb.loadElement('columnname_' + btnid);
				const fieldlabel = mb.loadElement('fieldlabel_' + btnid);
				const entityidentifier = mb.loadElement('entityidentifier_' + btnid);
				const relatedmodules = mb.loadElement('relatedmodules_' + btnid);
				const masseditable = mb.loadElement('Masseditable_' + btnid);
				const displaytype = mb.loadElement('Displaytype_' + btnid);
				const quickcreate = mb.loadElement('Quickcreate_' + btnid);
				const typeofdata = mb.loadElement('Typeofdata_' + btnid);
				const presence = mb.loadElement('Presence_' + btnid);
				var uitype = mb.loadElement('Uitype_' + btnid);
				fieldValues = {
					fieldsid: fieldsid,
					blockid: blockid,
					fieldname: fieldname,
					columnname: columnname,
					fieldlabel: fieldlabel,
					entityidentifier: entityidentifier,
					relatedmodules: relatedmodules,
					masseditable: masseditable,
					displaytype: displaytype,
					quickcreate: quickcreate,
					typeofdata: typeofdata,
					presence: presence,
					uitype: uitype,
					sequence: number_field,
				};
				fields.push(fieldValues);
				var data = {
					fields: fields,
					step: step
				};
			} else {
				var data = {
					fields: [],
					step: step
				};
			}
		}

		if (step == 4) {
			let customViews = [];
			let field;
			const number_customview = mb.loadElement('number_customview');
			for (var i = 1; i <= number_customview; i++) {
				var customObj = {
					customviewid: mb.loadElement('customviewid-'+i),
					viewname: mb.loadElement('viewname-'+i),
					setdefault: mb.loadElement('setdefault-'+i),
				};
				const checkSize = document.getElementsByName('checkbox-options-'+i).length;
				var fieldObj = [];
				for (var j = 0; j < checkSize; j++) {
					const checkedValue = document.querySelector('#checkbox-'+j+'-id-'+i);
					if (checkedValue.checked == true) {
						fieldObj.push(checkedValue.value);
					}
				}
				field = fieldObj.join(',');
				customObj.fields = {
					field
				};
				customViews.push(customObj);
			}
			var data = {
				customview: customViews,
				step: step
			};
		}

		if (step == 5) {
			let relatedLists = [];
			const number_related = mb.loadElement('number_related');
			for (var i = 1; i <= number_related; i++) {
				let lists = {
					relatedmodule: mb.loadElement('autocomplete-module-'+i),
					actions: mb.loadElement('related-action-'+i),
					name: mb.loadElement('autocomplete-related-'+i),
					label: mb.loadElement('related-label-'+i),
				};
				relatedLists[i] = lists;
			}
			var data = {
				relatedlists: relatedLists,
				step: step
			};
		}

		jQuery.ajax({
			method: 'POST',
			url: url+'&methodName=Save',
			data: data
		}).done(function (response) {
			const msg = mod_alert_arr.RecordDeleted;
			mb.loadMessage(msg, true);
			if (forward == false && step == 3) {
				const message = `<p class="slds-section__title" style="float: right">${btnid}: ${mod_alert_arr.Field} &nbsp;<span style="color: blue">${fieldname}</span>&nbsp; ${mod_alert_arr.WasSaved}!</p>`;
				mb.removeElement('for-field-' + btnid, true);
				mb.loadElement('for-field-inputs-' + btnid, true).innerHTML = message;
			}
			if (forward == true) {
				mb.loadElement('step-' + step, true).style.display = 'none';
				var nextstep = step + 1;
				var progress = parseInt(nextstep) * 20 - 20;
				mb.loadElement('progress', true).style.width = progress + '%';
				mb.loadElement('progresstext', true).innerHTML = mod_alert_arr.LBL_MB_PROGRESS+': ' + progress + '%';
				mb.loadElement('step-' + nextstep, true).style.display = 'block';
			}
			if (step == 1) {
				mb.generateDefaultBlocks();
			} else if (step == 5) {
				mb.loadTemplate();
			}
		});
	},
	/**
     * Go to back step
     * @param {number} step
     * @param {boolean} mod
     * @param {number} moduleid
     */
	backTo: (step, mod = false, moduleid = 0) => {
		let thisStep = step + 1;
		//remove `finish module` step
		mb.removeElement('info', true);
		mb.removeElement('blocks', true);
		mb.loadElement('step-6', true).style.display = 'none';
		if (mod == true) {
			for (let i = 1; i <=5; i++) {
				if (i != step) {
					mb.loadElement('step-' + i, true).style.display = 'none';
				}
			}
			mb.loadElement('step-' + step, true).style.display = '';
		} else {
		    mb.loadElement('step-' + thisStep, true).style.display = 'none';
		    mb.loadElement('step-' + step, true).style.display = '';
		}
		if (step == 1) {
			//load active module
			jQuery.ajax({
				method: 'GET',
				url: url+'&methodName=loadValues&step='+step+'&moduleid='+moduleid,
			}).done(function (response) {
				const res = JSON.parse(response);
				mb.loadElement('modulename', true).value = res.name;
				mb.loadElement('modulelabel', true).value = res.label;
				mb.loadElement('parentmenu', true).value = res.parent;
				mb.loadElement('moduleicon', true).value = res.icon;
				mb.updateProgress(1);
			});
		}

		if (step == 2) {
			mb.generateDefaultBlocks();
			const getUl = mb.loadElement('ul-block-mb', true);
			if (getUl != null) {
				mb.removeElement('ul-block-mb');
			}
			//load blocks
			jQuery.ajax({
				method: 'GET',
				url: url+'&methodName=loadValues&step='+step+'&moduleid='+moduleid,
			}).done(function (response) {
				const res = JSON.parse(response);
				const getDiv = mb.loadElement('loadBlocks', true);
				const ul = document.createElement('ul');
				ul.className = 'slds-has-dividers_top-space slds-list_ordered';
				ul.id = 'ul-block-mb';
				getDiv.appendChild(ul);
				for (let i = 0; i < res.length; i++) {
					const li = document.createElement('li');
					const id = res[i].blocksid+'-block';
					let removeBtn = `<button class='slds-button slds-button_outline-brand' onclick='mb.removeBlock("${id}")' style='margin-left: 10px'>Remove</button>`;
					if (res[i].blocks_label.toUpperCase() == 'LBL_MODULEBLOCK_INFORMATION' || res[i].blocks_label.toUpperCase() == 'LBL_CUSTOM_INFORMATION' || res[i].blocks_label.toUpperCase() == 'LBL_DESCRIPTION_INFORMATION') {
						removeBtn = '';
					}
					li.innerHTML = res[i].blocks_label.toUpperCase()+removeBtn;
					li.className = 'slds-item';
					li.id = 'li-block-mb-'+res[i].blocksid;
					ul.appendChild(li);
				}
				mb.updateProgress(2);
			});
		}
		if (step == 3) {
			//load module fields
			jQuery.ajax({
				method: 'GET',
				url: url+'&methodName=loadValues&step='+step+'&moduleid='+moduleid,
			}).done(function (response) {
				const res = JSON.parse(response);
				const getT = mb.loadElement('loadFields', true);
				const ul = document.createElement('ul');
				ul.className = 'slds-list_ordered';
				ul.id = 'ul-field-mb';
				getT.appendChild(ul);
				for (let i = 0; i < res.length; i++) {
					const li = document.createElement('li');
					const id = res[i].fieldsid+'-field';
					let fieldname = res[i].fieldname;
					let fieldlabel = res[i].fieldlabel;
					let entityidentifier = res[i].entityidentifier;
					let relatedmodules = res[i].relatedmodules;
					let sequence = res[i].sequence;
					let uitype = res[i].uitype;
					let presence = res[i].presence;
					let quickcreate = res[i].quickcreate;
					let displaytype = res[i].displaytype;
					let mandatory = res[i].typeofdata;
					let masseditable = res[i].masseditable;
					let removeBtn = `<button class='slds-button slds-button_outline-brand' onclick='mb.removeField("${id}")' style='margin-left: 10px'>Remove</button>`;
					let editBtn = `<button class='slds-button slds-button_outline-brand' onclick='mb.editField("${id}","${fieldname}","${fieldlabel}","${entityidentifier}","${relatedmodules}","${sequence}","${uitype}","${presence}","${quickcreate}",${displaytype},"${masseditable}","${mandatory}")' style='margin-left: 10px'>Edit</button>`;
					li.innerHTML = res[i].fieldname+removeBtn+editBtn;
					li.className = 'slds-item';
					li.id = 'li-field-mb-'+res[i].fieldsid;
					ul.appendChild(li);
				}
				mb.updateProgress(3);
			});
		}
		if (step == 4) {
			jQuery.ajax({
				method: 'GET',
				url: url+'&methodName=loadValues&step='+step+'&moduleid='+moduleid,
			}).done(function (response) {
				const res = JSON.parse(response);
				const CustomView = document.getElementById('CustomView');
				if (CustomView != null) {
					mb.removeElement('CustomView', true);
				}
				const editview = document.getElementById('loadViews');
				if (editview != null) {
					mb.removeElement('loadViews', true);
				}
				const getView = mb.loadElement('loadViews', true);
				const ul = document.createElement('ul');
				ul.className = 'slds-list_ordered';
				ul.id = 'ul-view-mb';
				ul.style.marginTop = "20px";
				getView.appendChild(ul);
				for (let i = 0; i < res.length; i++) {
					const li = document.createElement('li');
					let editBtn = `<button class='slds-button slds-button_outline-brand' onclick='mb.editView("${res[i].customviewid}","${res[i].viewname}","${res[i].fields}","${res[i].setdefault}")' style='margin-left: 10px'>Edit View</button>`;
					li.innerHTML = res[i].viewname+editBtn;
					li.className = 'slds-item';
					li.id = 'li-view-mb-'+res[i].customviewid;
					ul.appendChild(li);
				}
				mb.updateProgress(4);
			});
		}
	},
	/**
     * Update progress bar in real time for step 1
     * @param {number} step
     */
	updateProgress: (step) => {
		if (step == 1) {
			const data = {
				modulename: mb.loadElement('modulename'),
				modulelabel: mb.loadElement('modulelabel'),
				parentmenu: mb.loadElement('parentmenu'),
				moduleicon: mb.loadElement('moduleicon'),
			};
			var NULL = [];
			for (var i in data) {
				if (data[i] == '') {
					NULL[i] = i;
				}
			}
			const size = Object.keys(NULL).length;
			const progress = (20 - (parseInt(size) * 5));
			mb.loadElement('progress', true).style.width = progress + '%';
			mb.loadElement('progresstext', true).innerHTML = mod_alert_arr.LBL_MB_PROGRESS+': ' + progress + '%';
			if (progress == 20) {
				mb.loadElement('btn-step-1', true).removeAttribute('disabled');
			} else {
				mb.loadElement('btn-step-1', true).setAttribute('disabled', '');
			}
		} else {
			const progress = parseInt(step) * 20;
			mb.loadElement('progress', true).style.width = progress + '%';
			mb.loadElement('progresstext', true).innerHTML = mod_alert_arr.LBL_MB_PROGRESS+': ' + progress + '%';
		}
	},
	/**
     * Show module icons in step 1
     * @param {string} iconReference
     */
	showModuleIcon: (iconReference) => {
		let newicon = iconReference.split('-');
		let spn = mb.loadElement('moduleiconshow', true);
		let svg = mb.loadElement('moduleiconshowsvg', true);
		let curicon = svg.getAttribute('xlink:href');
		let category = curicon.substr(24);
		category = category.substr(0, category.indexOf('-'));
		let icon = curicon.substr(curicon.indexOf('#')+1);
		spn.classList.remove('slds-icon-'+category+'-'+icon);
		spn.classList.add('slds-icon-'+newicon[0]+'-'+newicon[1]);
		svg.setAttribute('xlink:href', 'include/LD/assets/icons/'+newicon[0]+'-sprite/svg/symbols.svg#'+newicon[1]);
	},
	/**
     * generate Default Blocks
     */
	generateDefaultBlocks: () => {
		mb.removeElement('blocks_inputs', true);
		mb.loadElement('number_block').value = '1';
		jQuery.ajax({
			method: 'GET',
			url: url+'&methodName=loadDefaultBlocks',
		}).done(function (response) {
			const res = JSON.parse(response);
			if (res == 'load') {
				mb.generateInput('default');
			} else {
				mb.loadElement('number_block', true).value = '0';
				mb.generateInput();
			}
		});
	},
	/**
     * Generate block input for step 2
     */
	generateInput: (type = '') => {
		if (type == 'default') {
			const MODULEBLOCK = document.createElement('input');
			MODULEBLOCK.type = 'text';
			MODULEBLOCK.id = 'blocks_label_1';
			MODULEBLOCK.value = 'LBL_MODULEBLOCK_INFORMATION';
			MODULEBLOCK.className ='slds-input';
			mb.loadElement('blocks_inputs', true).appendChild(MODULEBLOCK);
			const CUSTOM = document.createElement('input');
			CUSTOM.type = 'text';
			CUSTOM.id = 'blocks_label_2';
			CUSTOM.value = 'LBL_CUSTOM_INFORMATION';
			CUSTOM.className ='slds-input';
			mb.loadElement('blocks_inputs', true).appendChild(CUSTOM);
			const DESCRIPTION = document.createElement('input');
			DESCRIPTION.type = 'text';
			DESCRIPTION.id = 'blocks_label_3';
			DESCRIPTION.value = 'LBL_DESCRIPTION_INFORMATION';
			DESCRIPTION.className ='slds-input';
			mb.loadElement('blocks_inputs', true).appendChild(DESCRIPTION);
			mb.loadElement('number_block', true).value = '3';
		} else {
			const number_block = mb.autoIncrementIds('number_block');
			const input = document.createElement('input');
			input.type = 'text';
			input.id = 'blocks_label_' + number_block;
			input.placeholder = 'LBL_BLOCKNAME_INFORMATION';
			input.className ='slds-input';
			mb.loadElement('blocks_inputs', true).appendChild(input);
		}
	},
	/**
     * Generate field input for step 3
     */
	generateFields: () => {
		const number_field = mb.autoIncrementIds('number_field');
		const table = mb.getTable('Table');
		const row = mb.createRow(table, 0, 'for-field-inputs-', number_field);
		const cell = mb.createCell(row, 0, 'fields_inputs_', number_field);

		mb.loadBlocks(table, number_field);

		let func = {
			'style': 'width: 15%; margin: 5px'
		};
		for (var i = 0; i < textfields.length; i++) {
			const fnObj = {
				instance: cell,
				placeholder: textfields[i],
				name: textfields[i]+'_',
				id: textfields[i]+'_',
				inc: number_field,
				attr: func,
			};
			const input = mb.createInput(fnObj);
			if (textfields[i]=='fieldname') {
				input.onchange = (elem) => {
					mb.loadElement('columnname' + '_' + number_field, true).value = elem.target.value;
					mb.loadElement('fieldlabel' + '_' + number_field, true).value = elem.target.value;
				};
			}
			// add input field for fieldsid to hold value of id will help on editing
			const hidd = {
				instance: cell,
				placeholder: 'fieldsid',
				name: 'fieldsid_',
				id: 'fieldsid_',
				inc: number_field,
				attr: func,
				type: 'hidden'
			};
			const input2 = mb.createInput(hidd);
			cell.appendChild(input2);
		}
		for (var i = 0; i < fieldtypes.length; i++) {
			const type = fieldtypes[i].type;
			const values = fieldtypes[i].values;
			const selecttype = document.createElement('select');
			selecttype.id = type + '_' + number_field;
			selecttype.className = 'slds-input';
			selecttype.style = 'width: 15%; margin: 5px';
			cell.appendChild(selecttype);

			const defaultOption = document.createElement('option');
			defaultOption.text = type;
			defaultOption.setAttribute('disabled', '');
			defaultOption.setAttribute('selected', '');
			selecttype.appendChild(defaultOption);
			for (var j in values) {
				const option = document.createElement('option');
				option.value = j;
				option.text = values[j];
				selecttype.appendChild(option);
			}
		}
		for (let i = 0; i < checkboxFields.length; i++) {
			const fnObj = {
				instance: cell,
				placeholder: checkboxFields[i].type,
				name: checkboxFields[i].type+'_',
				id: checkboxFields[i].type+'_',
				inc: number_field,
				attr: '',
				type: 'checkbox',
			};
			const chBox = mb.createInput(fnObj);
			cell.appendChild(chBox);
			mb.createLabel(cell, checkboxFields[i].value);
		}
		//create save button for each field
		const saveBtn = document.createElement('button');
		saveBtn.id ='save-btn-for-field-' + number_field;
		saveBtn.className = 'slds-button slds-button_brand';
		saveBtn.setAttribute('onclick', 'mb.SaveModule(3, false, this.id)');
		saveBtn.innerHTML = mod_alert_arr.LBL_MB_SAVEFIELD;
		const p = document.createElement('p');
		p.appendChild(saveBtn);
		cell.appendChild(p);
	},
	/**
     * Open tui grid to list all modules
     */
	openModal: () => {
		dataGridInstance = new tuiGrid({
			el: document.getElementById('moduleListView'),
			columns: [
				{
					name: 'modulebuilder_name',
					header: mod_alert_arr.ModuleName,
				},
				{
					name: 'date',
					header: mod_alert_arr.DateCreated,
				},
				{
					name: 'completed',
					header: mod_alert_arr.Status,
				},
				{
					name: 'export',
					header: mod_alert_arr.Export,
				}
			],
			data: {
				api: {
					readData: {
						url: url+'&methodName=loadModules',
						method: 'GET'
					}
				}
			},
			useClientSort: false,
			pageOptions: {
				perPage: '5'
			},
			rowHeight: 'auto',
			bodyHeight: 'auto',
			scrollX: false,
			scrollY: false,
			columnOptions: {
				resizable: true
			},
			header: {
				align: 'left',
				valign: 'top'
			},
			onGridUpdated: (ev) => {
				mb.updateData();
			}
		});
		tui.Grid.applyTheme('striped');
		mb.loadElement('moduleListsModal', true).style.display = '';
	},
	/**
     * Generate field input for step 3 at edit mode
     */
	generateEditFields: (id, fieldname, fieldlabel, entityidentifier, relatedmodules, sequence, uitype, presence, quickcreate, displaytype, masseditable, mandatory) => {
		const number_field = sequence;
		const table = mb.getTable('Table');
		const row = mb.createRow(table, 0, 'for-field-inputs-', number_field);
		const cell = mb.createCell(row, 0, 'fields_inputs_', number_field);

		mb.loadBlocks(table, number_field);

		let func = {
			'style': 'width: 15%; margin: 5px'
		};
		for (var i = 0; i < textfields.length; i++) {
			const fnObj = {
				instance: cell,
				placeholder: textfields[i],
				name: textfields[i]+'_',
				id: textfields[i]+'_',
				inc: number_field,
				attr: func,
			};
			const input = mb.createInput(fnObj);
			if (textfields[i]=='fieldname') {
				mb.loadElement('fieldname' + '_' + number_field, true).value = fieldname;
			}
			if (textfields[i]=='columnname') {
				mb.loadElement('columnname' + '_' + number_field, true).value = fieldname;
			}
			if (textfields[i]=='fieldlabel') {
				mb.loadElement('fieldlabel' + '_' + number_field, true).value = fieldlabel;
			}
			if (textfields[i]=='sequence') {
				mb.loadElement('sequence' + '_' + number_field, true).value = sequence;
			}
			if (textfields[i]=='entityidentifier') {
				mb.loadElement('entityidentifier' + '_' + number_field, true).value = entityidentifier;
			}
			if (textfields[i]=='relatedmodules') {
				mb.loadElement('relatedmodules' + '_' + number_field, true).value = relatedmodules;
			}
			// add input field for fieldsid to hold value of id
			const hidd = {
				instance: cell,
				placeholder: 'fieldsid',
				name: 'fieldsid_',
				id: 'fieldsid_',
				inc: number_field,
				attr: func,
				type: 'hidden'
			};
			const input2 = mb.createInput(hidd);
			cell.appendChild(input2);
			mb.loadElement('fieldsid' + '_' + number_field, true).value = id;


		}
		for (var i = 0; i < fieldtypes.length; i++) {
			const type = fieldtypes[i].type;
			const values = fieldtypes[i].values;
			const selecttype = document.createElement('select');
			selecttype.id = type + '_' + number_field;
			selecttype.className = 'slds-input';
			selecttype.style = 'width: 15%; margin: 5px';
			cell.appendChild(selecttype);

			const defaultOption = document.createElement('option');
			defaultOption.text = type;
			defaultOption.setAttribute('disabled', '');
			defaultOption.setAttribute('selected', '');
			selecttype.appendChild(defaultOption);
			for (var j in values) {
				const option = document.createElement('option');
				option.value = j;
				option.text = values[j];
				selecttype.appendChild(option);
			}
			if (type=='Uitype') {
				mb.loadElement(selecttype.id, true).value = uitype;
			}
			if (type=='Presence') {
				mb.loadElement(selecttype.id, true).value = presence;
			}
			if (type=='Quickcreate') {
				mb.loadElement(selecttype.id, true).value = quickcreate;
			}
			if (type=='Displaytype') {
				mb.loadElement(selecttype.id, true).value = displaytype;
			}
			if (type=='Masseditable') {
				mb.loadElement(selecttype.id, true).value = masseditable;
			}
		}
		for (let i = 0; i < checkboxFields.length; i++) {
			const fnObj = {
				instance: cell,
				placeholder: checkboxFields[i].type,
				name: checkboxFields[i].type+'_',
				id: checkboxFields[i].type+'_',
				inc: number_field,
				attr: '',
				type: 'checkbox',
			};
			const chBox = mb.createInput(fnObj);
			cell.appendChild(chBox);
			mb.createLabel(cell, checkboxFields[i].value);
			if (mandatory == 'on') {
				mb.loadElement(checkboxFields[i].type+'_'+ number_field, true).value = mandatory;
				document.getElementById('Typeofdata_'+number_field).checked = true;
			} else {
				mb.loadElement(checkboxFields[i].type+'_'+ number_field, true).value = mandatory;
				document.getElementById('Typeofdata_'+number_field).checked = false;
			}
		}
		//create save button for each field
		const saveBtn = document.createElement('button');
		saveBtn.id ='save-btn-for-field-' + number_field;
		saveBtn.className = 'slds-button slds-button_brand';
		saveBtn.setAttribute('onclick', 'mb.SaveModule(3, false, this.id)');
		saveBtn.innerHTML = mod_alert_arr.LBL_MB_SAVEFIELD;
		const p = document.createElement('p');
		p.appendChild(saveBtn);
		cell.appendChild(p);
	},
	/**
     * Close modal
     */
	closeModal: () => {
		mb.loadElement('moduleListsModal', true).style.display = 'none';
		document.getElementById('moduleListView').innerHTML = '';
	},
	/**
     * Load all blocks for specific module in step 3
     * @param {Table} tableInstance - Current table instance
     * @param {number} number_field
     */
	loadBlocks: (tableInstance, number_field) => {
		jQuery.ajax({
			method: 'GET',
			url: url+'&methodName=loadBlocks',
		}).done(function (response) {
			const res = JSON.parse(response);
			const row = tableInstance.insertRow(0);
			row.setAttribute('id', 'for-field-' + number_field);
			//create select
			const select = document.createElement('select');
			select.id = 'select-for-field-' + number_field;
			select.className = 'slds-input';
			select.style = 'width: 25%; margin: 5px';
			row.appendChild(select);
			//create default option
			const defaultOption = document.createElement('option');
			defaultOption.setAttribute('selected', '');
			defaultOption.setAttribute('disabled', '');
			defaultOption.value = '';
			select.appendChild(defaultOption);
			defaultOption.innerHTML = mod_alert_arr.LBL_CHOOSEFIELDBLOCK + ' ' + number_field;

			for (var i = 0; i < res.length; i++) {
				const options = document.createElement('option');
				options.value = res[i].blocksid;
				options.innerHTML = res[i].blocks_label;
				select.appendChild(options);
			}
		});
	},
	/**
     * Generate inputs for custom views in step 4
     */
	generateCustomView: () => {
		const number_customview = mb.autoIncrementIds('number_customview');
		const table = mb.getTable('CustomView');
		const row = mb.createRow(table, 0, 'for-customview-', number_customview);
		const cell = mb.createCell(row, 0, 'customview_inputs', number_customview);
		//create viewname
		const func = {
			'style': 'width: 25%'
		};
		const fnObj = {
			instance: cell,
			placeholder: 'Viewname',
			name: 'viewname-',
			id: 'viewname-',
			inc: number_customview,
			attr: func,
		};
		mb.createInput(fnObj);
		// create hidden customviewid
		const inputid = {
			instance: cell,
			placeholder: 'Customviewid',
			name: 'customviewid-',
			id: 'customviewid-',
			inc: number_customview,
			attr: func,
			type: 'hidden'
		};
		mb.createInput(inputid);
		//create setdefault
		const setdefault = document.createElement('select');
		setdefault.name = 'setdefault-' + number_customview;
		setdefault.id = 'setdefault-' + number_customview;
		setdefault.className = 'slds-input';
		setdefault.setAttribute('style', 'width: 25%');
		for (var val in setdefaultOption[0]) {
			const createOption = document.createElement('option');
			createOption.innerHTML =  setdefaultOption[0][val];
			createOption.value =  val;
			setdefault.appendChild(createOption);
		}
		cell.appendChild(setdefault);

		//get all fields
		const p = document.createElement('p');
		p.innerHTML = mod_alert_arr.LBL_CHOOSECUSTOMVIEW;
		cell.appendChild(p);
		jQuery.ajax({
			method: 'GET',
			url: url+'&methodName=loadFields',
		}).done(function (response) {
			const res = JSON.parse(response);
			for (var f in res) {
				const div = document.createElement('div');
				const checkbox = `
                    <div class="slds-form-element">
                      <div class="slds-form-element__control">
                        <div class="slds-checkbox">
                          <input type="checkbox" class="for-checkbox-${number_customview}" name="checkbox-options-${number_customview}" id="checkbox-${f}-id-${number_customview}" value="${res[f]['fieldsid']}"/>
                          <label class="slds-checkbox__label" for="checkbox-${f}-id-${number_customview}">
                            <span class="slds-checkbox_faux"></span>
                            <span class="slds-form-element__label">${res[f]['fieldname']}</span>
                          </label>
                        </div>
                      </div>
                    </div>
                `;
				div.innerHTML = checkbox;
				cell.appendChild(div);
			}
		});
	},
	generateEditCustomView: (viewnameid, viewname, fields, setdefault, customviewno) => {
		document.getElementById('number_customview').value = 0;
		const number_customview = mb.autoIncrementIds('number_customview');
		const table = mb.getTable('CustomView');
		const row = mb.createRow(table, 0, 'for-customview-', number_customview);
		const cell = mb.createCell(row, 0, 'customview_inputs', number_customview);
		//create viewname
		const func = {
			'style': 'width: 25%'
		};
		const fnObj = {
			instance: cell,
			placeholder: 'Viewname',
			name: 'viewname-',
			id: 'viewname-',
			inc: number_customview,
			attr: func,
		};
		mb.createInput(fnObj);
		mb.loadElement('viewname-'+number_customview, true).value = viewname;
		// create hidden customviewid
		const inputid = {
			instance: cell,
			placeholder: 'Customviewid',
			name: 'customviewid-',
			id: 'customviewid-',
			inc: number_customview,
			attr: func,
			type: 'hidden'
		};
		mb.createInput(inputid);
		mb.loadElement('customviewid-'+number_customview, true).value = viewnameid;

		const customN = {
			instance: cell,
			placeholder: 'Customview_No',
			name: 'customview_no-',
			id: 'customview_no-',
			inc: number_customview,
			attr: func,
			type: 'hidden'
		};
		mb.createInput(customN);
		mb.loadElement('customview_no-'+number_customview, true).value = customviewno;
		//create setdefault2
		const setdefault2 = document.createElement('select');
		setdefault2.name = 'setdefault-' + number_customview;
		setdefault2.id = 'setdefault-' + number_customview;
		setdefault2.className = 'slds-input';
		setdefault2.setAttribute('style', 'width: 25%');
		for (var val in setdefaultOption[0]) {
			const createOption = document.createElement('option');
			createOption.innerHTML =  setdefaultOption[0][val];
			createOption.value =  val;
			setdefault2.appendChild(createOption);
		}
		cell.appendChild(setdefault2);
		mb.loadElement('setdefault-'+number_customview, true).value = setdefault;

		//get all fields
		const p = document.createElement('p');
		p.innerHTML = mod_alert_arr.LBL_CHOOSECUSTOMVIEW;
		cell.appendChild(p);
		jQuery.ajax({
			method: 'GET',
			url: url+'&methodName=loadFields',
		}).done(function (response) {
			const res = JSON.parse(response);
			for (var f in res) {
				const div = document.createElement('div');
				const checkbox = `
                    <div class="slds-form-element">
                      <div class="slds-form-element__control">
                        <div class="slds-checkbox">
                          <input type="checkbox" class="for-checkbox-${number_customview}" name="checkbox-options-${number_customview}" id="checkbox-${f}-id-${number_customview}" value="${res[f]['fieldsid']}"/>
                          <label class="slds-checkbox__label" for="checkbox-${f}-id-${number_customview}">
                            <span class="slds-checkbox_faux"></span>
                            <span class="slds-form-element__label">${res[f]['fieldname']}</span>
                          </label>
                        </div>
                      </div>
                    </div>
                `;
				div.innerHTML = checkbox;
				cell.appendChild(div);
				if (res[f]['fieldname'] == fields) {
					document.querySelector('#checkbox-'+f+'-id-'+number_customview).checked = true;
				} else {
					document.querySelector('#checkbox-'+f+'-id-'+number_customview).checked = false;
				}
			}
		});
	},
	/**
     * Function that load an alert message for success or error
     * @param {text} msg
     * @param {boolean} show
     * @param {text} type - success/error
     */
	loadMessage: (msg, show = true, type = 'success') => {
		var icon = 'task';
		if (type == 'error') {
			icon = 'first_non_empty';
		}
		if (show == true) {
			ldsPrompt.show(type.toUpperCase(), msg, type);
		}
	},
	/**
     * Increment id from each step when generate fields
     * @param {string} id
     */
	autoIncrementIds: (id) => {
		let number = mb.loadElement(id);
		number = parseInt(number) + 1;
		mb.loadElement(id, true).value = number;
		return number;
	},
	/**
     * Update grid in every change
     */
	updateData: () => {
		let btn = '';
		for (var i = 0; i < 5; i++) {
			let completed = dataGridInstance.getValue(i, 'completed');
			let moduleid = dataGridInstance.getValue(i, 'moduleid');
			if (completed == 'Completed') {
				btn = `<button class="slds-button slds-button_brand" aria-live="assertive">
                        <span class="slds-text-not-pressed">
                        <svg class="slds-button__icon slds-button__icon_small slds-button__icon_left" aria-hidden="true">
                            <use xlink:href="include/LD/assets/icons/utility-sprite/svg/symbols.svg#download"></use>
                        </svg>${mod_alert_arr.Export}</span>
                    </button>`;
			} else {
				let step = 0;
				if (completed == '20%') {
					step = 1;
				} else if (completed == '40%') {
					step = 2;
				} else if (completed == '60%') {
					step = 3;
				} else if (completed == '80%') {
					step = 4;
				}
				btn = `<button class="slds-button slds-button_neutral slds-button_dual-stateful" onclick="mb.backTo(${step}, true, ${moduleid}); mb.closeModal()" aria-live="assertive">
                        <span class="slds-text-not-pressed">
                        <svg class="slds-button__icon slds-button__icon_small slds-button__icon_left" aria-hidden="true">
                            <use xlink:href="include/LD/assets/icons/utility-sprite/svg/symbols.svg#edit"></use>
                        </svg>${mod_alert_arr.StartEditing}</span>
                    </button>`;
			}
			dataGridInstance.setValue(i, 'export', btn, false);
		}
	},
	/**
     * Check for module if exists in first step
     * @param {string} id
     */
	checkForModule: (id) => {
		const moduleName = mb.loadElement(id);
		jQuery.ajax({
			method: 'POST',
			url: url,
			data: 'modulename='+moduleName+'&methodName=checkForModule'
		}).done(function (response) {
			if (response == 1) {
				const msg = moduleName+' '+mod_alert_arr.Module+' '+mod_alert_arr.AlreadyExists;
				mb.loadMessage(msg, true, 'error');
			} else {
				mb.loadMessage('', false);
			}
		});
	},
	/**
     * Autocomplete inputs for modules and function names
     * @param {string} el
     * @param {string} type - module/name
     */
	autocomplete: (el, type) => {
		const forId = el.id.split('-')[2];
		const val = mb.loadElement(el.id);
		let method = 'name';
		if (type == 'module') {
			method = type;
		}
		jQuery.ajax({
			method: 'POST',
			url: url,
			data: 'query='+val+'&methodName=autocomplete&method='+method
		}).done(function (response) {
			mb.removeElement('autocomplete-span-'+forId, true);
			mb.removeElement('autocomplete-modulespan-'+forId, true);
			let res = JSON.parse(response);
			if (response.length < 3) {
				mb.removeElement('autocomplete-span-'+forId, true);
				mb.removeElement('autocomplete-modulespan-'+forId, true);
			} else {
				let span = document.createElement('span');
				let ul = '<ul class="slds-dropdown__list" style="background: white; width: 25%; border: 1px solid #d1d1d1; position: absolute; z-index: 1000">';
				for (let i = 0; i < res.length; i++) {
					ul += `<li class="slds-dropdown__item">
                            <a onclick="mb.setValueToInput(this.id, ${forId}, '${method}')" tabindex="${i}" id="${res[i].name}">
                                <span class="slds-truncate" title="${res[i].name}">${res[i].name}</span>
                            </a>
                        </li>`;
				}
				ul += '</ul>';
				span.innerHTML = ul;
				if (type == 'module') {
					mb.loadElement('autocomplete-modulespan-'+forId, true).appendChild(span);
				} else if (type == 'name') {
					mb.loadElement('autocomplete-span-'+forId, true).appendChild(span);
				}
			}
		});
	},
	loadTemplate: () => {
		jQuery.ajax({
			method: 'POST',
			url: url,
			data: 'methodName=loadTemplate'
		}).then(function (response) {
			let res = JSON.parse(response);
			let label;
			//load info block
			const info = mb.loadElement('info', true);
			const infoList = document.createElement('ol');
			info.appendChild(infoList);
			for (let i in res.info) {
				const elList = document.createElement('li');
				if (i == 'name') {
					label = mod_alert_arr.name;
				} else if (i == 'parent') {
					label = mod_alert_arr.parent;
				} else if (i == 'icon') {
					label = mod_alert_arr.icon;
				} else if (i == 'label') {
					label = mod_alert_arr.label;
				}
				elList.innerHTML = `
				<div class="slds-tree__item">
					<span class="slds-has-flexi-truncate">
						<span class="slds-tree__item-label slds-truncate" title="${res.info[i]}">
							<strong>${label}:</strong> ${res.info[i]}
						</span>
					</span>
				</div>`;
				infoList.appendChild(elList);
			}
			//load blocks
			const blocks = mb.loadElement('blocks', true);
			const blockList = document.createElement('ol');
			blocks.appendChild(blockList);
			for (let i in res.blocks) {
				const elList = document.createElement('li');
				const index = parseInt(i) + 1;
				elList.innerHTML = `
					<div class="slds-tree__item">
						<span class="slds-has-flexi-truncate">
							<span class="slds-tree__item-label slds-truncate" title="Blockname: ${res.blocks[i].blocks_label}">
								${index}. ${res.blocks[i].blocks_label}
							</span>
						</span>
					</div>`;
				blockList.appendChild(elList);
			}
			//load views
			const views = mb.loadElement('views', true);
			const viewList = document.createElement('ul');
			viewList.className = 'slds-tree';
			views.appendChild(viewList);
			for (let i in res.views) {
				const elList = document.createElement('li');
				let tree = `
				      <div class="slds-tree__item">
				        <button class="slds-button slds-button_icon slds-m-right_x-small" aria-hidden="true" tabindex="-1" title="Expand Tree Branch">
				          <svg class="slds-button__icon slds-button__icon_small" aria-hidden="true">
				            <use xlink:href="include/LD/assets/icons/utility-sprite/svg/symbols.svg#chevronright"></use>
				          </svg>
				        </button>
				        <span class="slds-has-flexi-truncate">
				          <span class="slds-tree__item-label slds-truncate" title="Viewname: ${res.views[i].viewname}">${res.views[i].viewname}</span>
				        </span>
				      </div>
				      <ul role="group">`;
				      for (let j in res.views[i].fields) {
				        tree += `
					        <li aria-level="2" role="treeitem">
					          <div class="slds-tree__item">
					            <button class="slds-button slds-button_icon slds-m-right_x-small slds-is-disabled" aria-hidden="true" tabindex="-1" title="Expand Tree Item">
					              <svg class="slds-button__icon slds-button__icon_small" aria-hidden="true">
					                <use xlink:href="include/LD/assets/icons/utility-sprite/svg/symbols.svg#chevronright"></use>
					              </svg>
					            </button>
					            <span class="slds-has-flexi-truncate">
					              <span class="slds-tree__item-label slds-truncate" title="Fieldname: ${res.views[i].fields[j]}">${res.views[i].fields[j]}</span>
					            </span>
					          </div>
					        </li>`;
				    	}
				tree += '</ul>';
				elList.innerHTML = tree;
				viewList.appendChild(elList);
			}
		});
	},
	/**
     * Set values for each input on autocomplete
     * @param {string} name - function name
     * @param {string} forId
     * @param {string} type - module/name
     */
	setValueToInput: (name, forId, type) => {
		if (type == 'module') {
			mb.removeElement('autocomplete-modulespan-'+forId, true);
			mb.loadElement('autocomplete-module-'+forId, true).value = name;
		} else if (type == 'name') {
			mb.removeElement('autocomplete-span-'+forId, true);
			mb.loadElement('autocomplete-related-'+forId, true).value = name;
		}
	},
	/**
     * Generate related lists for step 5
     */
	generateRelatedList: () => {
		const number_related = mb.autoIncrementIds('number_related');
		const table = mb.getTable('RelatedLists');
		const row = mb.createRow(table, 0, 'for-related-', number_related);
		const cell = mb.createCell(row, 0, 'related_inputs_', number_related);

		const span = document.createElement('span');
		span.id = 'autocomplete-span-'+number_related;

		var func = {
			'onkeyup': 'mb.autocomplete(this, "name")',
		};
		mb.createLabel(cell, 'Function name');
		var fnObj = {
			instance: cell,
			placeholder: 'Function name',
			name: 'related-function-',
			id: 'autocomplete-related-',
			inc: number_related,
			attr: func,
		};
		mb.createInput(fnObj);
		cell.appendChild(span);

		const cell2 = mb.createCell(row, 1, 'related_inputs_', number_related);
		mb.createLabel(cell2, 'Label');
		fnObj = {
			instance: cell2,
			placeholder: 'Label',
			name: 'related-label-',
			id: 'related-label-',
			inc: number_related,
			attr: '',
		};
		mb.createInput(fnObj);

		const cell3 = mb.createCell(row, 0, 'related_inputs_', number_related);
		mb.createLabel(cell3, 'Actions');
		fnObj = {
			instance: cell3,
			placeholder: 'Actions',
			name: 'related-action-',
			id: 'related-action-',
			inc: number_related,
			attr: '',
		};
		mb.createInput(fnObj);

		const cell4 = mb.createCell(row, 0, 'related_inputs_', number_related);
		func = {
			'onkeyup': 'mb.autocomplete(this, "module")',
		};
		mb.createLabel(cell4, 'Related module');
		fnObj = {
			instance: cell4,
			placeholder: 'Related module',
			name: 'related-module-',
			id: 'autocomplete-module-',
			inc: number_related,
			attr: func,
		};
		mb.createInput(fnObj);

		const spanModule = document.createElement('span');
		spanModule.id = 'autocomplete-modulespan-'+number_related;
		cell4.appendChild(spanModule);
	},
	/**
     * Create html labels
     * @param {Label} instance - Current label instance
     * @param {text} value
     */
	createLabel: (instance, value) => {
		const label = document.createElement('label');
		label.innerHTML = value;
		return instance.appendChild(label);
	},
	/**
     * Create html inputs
     * @param {object} scope = {
        instance: {Input},
        placeholder: {string},
        name: {string},
        id: {string},
        inc: {number},
        attr: {object},
     }
     */
	createInput: (scope) => {
		const input = document.createElement('input');
		input.placeholder = scope.placeholder;
		input.id = scope.id+scope.inc;
		input.name = scope.name+scope.inc;
		if (scope.type != '' && scope.type != undefined) {
			input.setAttribute('type', scope.type);
		} else {
			input.className = 'slds-input';
		}
		if (scope.attr != '') {
			for (let f in scope.attr) {
				input.setAttribute(f, scope.attr[f]);
			}
		}
		return scope.instance.appendChild(input);
	},
	/**
     * Get table instance
     * @param {string} id
     */
	getTable: (id) => {
		const table = mb.loadElement(id, true);
		return table;
	},
	/**
     * Create table row
     * @param {Row} instance  - Current row instance
     * @param {number} index
     * @param {string} id
     * @param {number} inc
     */
	createRow: (instance, index, id, inc) => {
		const row = instance.insertRow(index);
		row.id = id + inc;
		return row;
	},
	/**
     * Create table data
     * @param {Cell} instance - Current cell instance
     * @param {number} index
     * @param {string} id
     * @param {number} inc
     */
	createCell: (instance, index, id, inc) => {
		const cell = instance.insertCell(index);
		cell.id = id + inc;
		cell.style = 'padding: 20px';
		return cell;
	},
	/**
     * Remove block on step 2
     * @param {string} blockid - Current cell instance
     */
	removeBlock: (blockid) => {
		const id = blockid.split('-')[0];
		jQuery.ajax({
			method: 'POST',
			url: url+'&methodName=removeBlock',
			data: 'blockid='+id
		}).done(function (response) {
			const res = JSON.parse(response);
			if (res == true) {
				mb.removeElement('li-block-mb-'+id);
			}
		});
	},
	/**
     * Remove Field on step 3
     * @param {string} fieldsid - Current cell instance
     */
	removeField: (fieldsid) => {
		const id = fieldsid.split('-')[0];
		jQuery.ajax({
			method: 'POST',
			url: url+'&methodName=removeField',
			data: 'fieldsid='+id
		}).done(function (response) {
			const res = JSON.parse(response);
			if (res == true) {
				mb.removeElement('li-field-mb-'+id);
			}
		});
	},
	/**
     * Edit Field on step 3
     * @param {string} fieldsid - Current cell instance
     */
	editField: (fieldsid, fieldname, fieldlabel, entityidentifier, relatedmodules, sequence, uitype, presence, quickcreate, displaytype, masseditable, mandatory) => {
		const id = fieldsid.split('-')[0];
		mb.generateEditFields(id, fieldname, fieldlabel, entityidentifier, relatedmodules, sequence, uitype, presence, quickcreate, displaytype, masseditable, mandatory);
	},
	editView: (viewnameid, viewname, fields, setdefault) => {
		mb.generateEditCustomView(viewnameid, viewname, fields, setdefault);
	},
	/**
     * Remove elements
     * @param {string} elementId
     * @param {boolean} type
     */
	removeElement: (elementId, type = false) => {
		var element = mb.loadElement(elementId, true);
		if (type == true) {
			element.innerHTML = '';
		} else {
			element.parentNode.removeChild(element);
		}
	},
	/**
     * Get values for inputs
     * @param {string} id
     * @param {boolean} type
     */
	loadElement: (id, type = false) => {
		let value = '';
		if (type == true) {
			value = document.getElementById(id);
		} else {
			value = document.getElementById(id).value;
		}
		return value;
	},
};