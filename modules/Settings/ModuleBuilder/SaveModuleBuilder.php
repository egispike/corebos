<?php
/*************************************************************************************************
 * Copyright 2020 JPL TSolucio, S.L. -- This file is a part of TSOLUCIO coreBOS Customizations.
* Licensed under the vtiger CRM Public License Version 1.1 (the "License"); you may not use this
* file except in compliance with the License. You can redistribute it and/or modify it
* under the terms of the License. JPL TSolucio, S.L. reserves all rights not expressly
* granted by the License. coreBOS distributed by JPL TSolucio S.L. is distributed in
* the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied
* warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. Unless required by
* applicable law or agreed to in writing, software distributed under the License is
* distributed on an "AS IS" BASIS, WITHOUT ANY WARRANTIES OR CONDITIONS OF ANY KIND,
* either express or implied. See the License for the specific language governing
* permissions and limitations under the License. You may obtain a copy of the License
* at <http://corebos.org/documentation/doku.php?id=en:devel:vpl11>
*************************************************************************************************/
//require_once 'include/utils/utils.php';
function SaveModuleBuilder($step) {
	global $mod_strings,$adb, $current_user;
	$userid = $current_user->id;
	switch ($step) {
		case '1':
			$modulename = vtlib_purify($_REQUEST['modulename']);
			$modulelabel = vtlib_purify($_REQUEST['modulelabel']);
			$parentmenu = vtlib_purify($_REQUEST['parentmenu']);
			$moduleicon = vtlib_purify($_REQUEST['moduleicon']);
			//check if module exists
			$modSql = $adb->pquery('SELECT * FROM vtiger_modulebuilder WHERE modulebuilder_name=?', array(
				$modulename
			));
			$modExsists = $adb->num_rows($modSql);
			if (isset($_COOKIE['ModuleBuilderID']) && $_COOKIE['ModuleBuilderID'] != '' && $modExsists > 0) {
				$adb->pquery('UPDATE vtiger_modulebuilder SET modulebuilder_name=?, modulebuilder_label=?, modulebuilder_parent=?, icon=? WHERE modulebuilderid=?', array(
					$modulename,
					$modulelabel,
					$parentmenu,
					$moduleicon,
					$_COOKIE['ModuleBuilderID']
				));
			} else {
				$ins = $adb->pquery('INSERT INTO vtiger_modulebuilder (modulebuilder_name, modulebuilder_label, modulebuilder_parent, status, icon) VALUES(?,?,?,?,?)', array(
					$modulename,
					$modulelabel,
					$parentmenu,
					'active',
					$moduleicon
				));

				$lastINSID = $adb->getLastInsertID();
				$adb->pquery('INSERT INTO vtiger_modulebuilder_name (modulebuilderid, date, completed, userid) VALUES (?,?,?,?)', array(
				$lastINSID,
				date('Y-m-d'),
				'20',
				$userid));
				$cookie_name = "ModuleBuilderID";
				$cookie_value = $lastINSID;
				setcookie($cookie_name, $cookie_value, time() + ((86400 * 30) * 7), "/");
			}
			break;
		case '2':
			$moduleid = $_COOKIE['ModuleBuilderID'];
			foreach ($_REQUEST['blocks'] as $key => $value) {
				if ($value != "") {
					$adb->pquery('INSERT INTO vtiger_modulebuilder_blocks (blocks_label, moduleid) VALUES (?,?)', array(
						$value,
						$moduleid
					));
					$adb->pquery('UPDATE vtiger_modulebuilder_name SET completed="40" WHERE userid=? AND modulebuilderid=?', array(
						$userid,
						$moduleid,
					));
				}
			}
			break;
		case '3':
			if (isset($_REQUEST['fields'])) {
				$moduleid = $_COOKIE['ModuleBuilderID'];
				//get Module Name
				$moduleSql = $adb->pquery('SELECT modulebuilder_name FROM vtiger_modulebuilder WHERE modulebuilderid=?', array($moduleid));
				$moduleName = $adb->query_result($moduleSql, 0, 0);
				$fields = vtlib_purify($_REQUEST['fields']);
				if ($fields[0]['fieldsid'] == '') {
					$adb->pquery('INSERT INTO vtiger_modulebuilder_fields (blockid, moduleid,fieldname,uitype,columnname,tablename,fieldlabel,presence,sequence,typeofdata,quickcreate,displaytype,masseditable,entityidentifier,relatedmodules) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', array(
						$fields[0]['blockid'],
						$moduleid,
						$fields[0]['fieldname'],
						$fields[0]['uitype'],
						$fields[0]['columnname'],
						strtolower('vtiger_'.$moduleName),
						$fields[0]['fieldlabel'],
						$fields[0]['presence'],
						$fields[0]['sequence'],
						$fields[0]['typeofdata'],
						$fields[0]['quickcreate'],
						$fields[0]['displaytype'],
						$fields[0]['masseditable'],
						$fields[0]['entityidentifier'],
						$fields[0]['relatedmodules'],
					));
					$adb->pquery('UPDATE vtiger_modulebuilder_name SET completed="60" WHERE userid=? AND modulebuilderid=?', array(
						$userid,
						$moduleid,
					));
				} else {
					$adb->pquery('UPDATE vtiger_modulebuilder_fields SET fieldname=?,columnname=?,fieldlabel=?,uitype=?,tablename=?,presence=?,sequence=?,typeofdata=?,quickcreate=?,displaytype=?,masseditable=?,entityidentifier=?,relatedmodules=? WHERE fieldsid=? AND blockid=? AND moduleid=?', array(
						$fields[0]['fieldname'],
						$fields[0]['columnname'],
						$fields[0]['fieldlabel'],
						$fields[0]['uitype'],
						strtolower('vtiger_'.$moduleName),
						$fields[0]['presence'],
						$fields[0]['sequence'],
						$fields[0]['typeofdata'],
						$fields[0]['quickcreate'],
						$fields[0]['displaytype'],
						$fields[0]['masseditable'],
						$fields[0]['entityidentifier'],
						$fields[0]['relatedmodules'],
						$fields[0]['fieldsid'],
						$fields[0]['blockid'],
						$moduleid,
					));
				}
			}
			break;
		case '4':
			$moduleid = $_COOKIE['ModuleBuilderID'];
			$customview = vtlib_purify($_REQUEST['customview']);
			print_r($customview);
			foreach ($customview as $key => $value) {
				$customviewid = $value['customviewid'];
				$viewname = $value['viewname'];
				$setdefault = (String)$value['setdefault'];
				$fields = (String)$value['fields']['field'];
				$setmetrics = 'false';
				if ($customviewid == '') {
					$adb->pquery('INSERT INTO vtiger_modulebuilder_customview (viewname, setdefault, setmetrics, fields, moduleid) VALUES(?,?,?,?,?)', array(
						$viewname,
						$setdefault,
						$setmetrics,
						$fields,
						$moduleid
					));
				} else {
					$adb->pquery('UPDATE vtiger_modulebuilder_customview SET viewname=?, setdefault=?, setmetrics=?, fields=?, moduleid=? WHERE customviewid=?', array(
						$viewname,
						$setdefault,
						$setmetrics,
						$fields,
						$moduleid,
						$customviewid
					));
				}
			}
			$adb->pquery('UPDATE vtiger_modulebuilder_name SET completed="80" WHERE userid=? AND modulebuilderid=?', array(
				$userid,
				$moduleid,
			));
			break;
		case '5':
			$moduleid = $_COOKIE['ModuleBuilderID'];
			$relatedlists = vtlib_purify($_REQUEST['relatedlists']);
			foreach ($relatedlists as $key => $value) {
				if ($key != '') {
					$adb->pquery('INSERT INTO vtiger_modulebuilder_relatedlists (function, label, actions, relatedmodule, moduleid) VALUES(?,?,?,?,?)', array(
						$value['name'],
						$value['label'],
						$value['actions'],
						$value['relatedmodule'],
						$moduleid
					));
				}
			}
			$adb->pquery('UPDATE vtiger_modulebuilder_name SET completed="Completed" WHERE userid=? AND modulebuilderid=?', array(
				$userid,
				$moduleid,
			));
			break;
		default:
			echo json_encode();
			break;
	}
}
?>