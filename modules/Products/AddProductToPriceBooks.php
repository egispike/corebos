<?php
/*+********************************************************************************
 * The contents of this file are subject to the vtiger CRM Public License Version 1.0
 * ("License"); You may not use this file except in compliance with the License
 * The Original Code is:  vtiger CRM Open Source
 * The Initial Developer of the Original Code is vtiger.
 * Portions created by vtiger are Copyright (C) vtiger.
 * All Rights Reserved.
 *******************************************************************************/
require_once 'Smarty_setup.php';
require_once 'modules/PriceBooks/PriceBooks.php';
require_once 'include/utils/utils.php';

global $app_strings,$mod_strings,$current_language,$theme,$log,$currentModule;
$current_module_strings = return_module_language($current_language, $currentModule);

$productid = vtlib_purify($_REQUEST['return_id']);
$theme_path='themes/'.$theme.'/';
$image_path=$theme_path."images/";
$productNameArr = getEntityName($currentModule, array($productid));
$productname = $productNameArr[$productid];

if (getFieldVisibilityPermission($currentModule, $current_user->id, 'unit_price') != '0') {
	echo "<link rel='stylesheet' type='text/css' href='themes/$theme/style.css'>";
	echo "<table border='0' cellpadding='5' cellspacing='0' width='100%' height='450px'><tr><td align='center'>";
	echo "<div style='border: 3px solid rgb(153, 153, 153); background-color: rgb(255, 255, 255); width: 55%; position: relative; z-index: 10000000;'>
		<table border='0' cellpadding='5' cellspacing='0' width='98%'>
		<tbody><tr>
		<td rowspan='2' width='11%'><img src=". vtiger_imageurl('denied.gif', $theme) ."' ></td>
		<td style='border-bottom: 1px solid rgb(204, 204, 204);' nowrap='nowrap' width='70%'><span class='genHeaderSmall'>".$app_strings['LBL_UNIT_PRICE_NOT_PERMITTED']
		."</span></td>
		</tr>
		<tr>
		<td class='small' align='right' nowrap='nowrap'>
		<a href='javascript:window.history.back();'>".$app_strings['LBL_GO_BACK'].'</a><br></td>
		</tr>
		</tbody></table> 
		</div>
		</td></tr></table>';
	exit();
}

$smarty=new vtigerCRM_Smarty;

$smarty->assign('MOD', $mod_strings);
$smarty->assign('APP', $app_strings);
$smarty->assign('IMAGE_PATH', $image_path);

$focus = new PriceBooks();

$list_query = getListQuery('PriceBooks');

$list_query .= ' and vtiger_pricebook.active<>0 ORDER BY pricebookid DESC';

$list_result = $adb->query($list_query);
$num_rows = $adb->num_rows($list_result);

//Retrieving the array of already releated products
if ($currentModule=='Products') {
	$sql1='select vtiger_crmobject.crmid, vtiger_pricebookproductrel.pricebookid,vtiger_products.unit_price
		from vtiger_pricebookproductrel
		inner join vtiger_crmobject on vtiger_crmobject.crmid=vtiger_pricebookproductrel.productid
		inner join vtiger_products on vtiger_products.productid=vtiger_pricebookproductrel.productid
		where vtiger_crmobject.deleted=0 and vtiger_pricebookproductrel.productid=?';
} else {
	$sql1='select vtiger_crmobject.crmid, vtiger_pricebookproductrel.pricebookid,vtiger_service.unit_price
		from vtiger_pricebookproductrel
		inner join vtiger_crmobject on vtiger_crmobject.crmid=vtiger_pricebookproductrel.productid
		inner join vtiger_service on vtiger_service.serviceid=vtiger_pricebookproductrel.productid
		where vtiger_crmobject.deleted=0 and vtiger_pricebookproductrel.productid=?';
}
$res1 = $adb->pquery($sql1, array($productid));
$num_prod_rows = $adb->num_rows($res1);
$pbk_array = array();
for ($i=0; $i<$num_prod_rows; $i++) {
	$pbkid=$adb->query_result($res1, $i, 'pricebookid');
	$pbk_array[$pbkid] = $pbkid;
}

$pro_unit_price = getUnitPrice($productid, $currentModule);
$prod_price_details = getPriceDetailsForProduct($productid, $pro_unit_price, 'available', $currentModule);

$prod_cur_price = array();
for ($i=0; $i<count($prod_price_details); $i++) {
	$prod_cur_info = $prod_price_details[$i];
	$prod_cur_price[$prod_cur_info['curid']] = $prod_cur_info['curvalue'];
}

$unit_price_array=array();
$field_name_array=array();

$other_text = '
	<table border="0" cellpadding="1" cellspacing="0" width="90%" align="center">
	<form name="addToPB" method="POST" id="addToPB">
	   <tr>
		<td align="center">&nbsp;
			<input name="product_id" type="hidden" value="'.$productid.'">
			<input name="idlist" type="hidden">
			<input name="viewname" type="hidden">';

	//we should not display the Add to PriceBook button if there is no pricebooks to associate
if ($num_rows != $num_prod_rows) {
	$other_text.='<input class="crmbutton small save" type="submit" value="'.$mod_strings['LBL_ADD_PRICEBOOK_BUTTON_LABEL'].'" onclick="return addtopricebook()"/>&nbsp;';
}

$other_text .='<input title="'.$app_strings['LBL_CANCEL_BUTTON_TITLE'].'" accessKey="'.$app_strings['LBL_CANCEL_BUTTON_KEY'];
$other_text .='" class="crmbutton small cancel" onclick="window.history.back()" type="button" name="button" value="'.$app_strings['LBL_CANCEL_BUTTON_LABEL'].'"></td>';
$other_text .='
	   </tr>
	</table>';

$smarty->assign('PRICEBOOKLISTHEADER', "<img height='1' src='themes/images/blank.gif'>\n" . $other_text);

//List View Table Header
$list_header = '';
$list_header .= '<tr>';
$list_header .='<td class="lvtCol" width="5%"><input type="checkbox" name="selectall" onClick=\'toggleSelect(this.checked,"selected_id");updateAllListPrice() \'></td>';
$list_header .= '<td class="lvtCol" width="35%">'.$mod_strings['LBL_PRICEBOOK'].'</td>';
$list_header .= '<td class="lvtCol" width="20%">'.$app_strings['LBL_CURRENCY'].'</td>';
$list_header .= '<td class="lvtCol" width="20%">'.getTranslatedString('LBL_PRODUCT_UNIT_PRICE', 'Products').'</td>';
$list_header .= '<td class="lvtCol" width="20%">'.$mod_strings['LBL_PB_LIST_PRICE'].'</td>';
$list_header .= '</tr>';

$smarty->assign('LISTHEADER', $list_header);

$list_body ='';
for ($i=0; $i<$num_rows; $i++) {
	$entity_id = $adb->query_result($list_result, $i, 'crmid');
	if (! array_key_exists($entity_id, $pbk_array)) {
		$pk_currency_id = $adb->query_result($list_result, $i, 'currency_id');
		$pk_currency_name = $adb->query_result($list_result, $i, 'currency_name');
		$unit_price = $prod_cur_price[$pk_currency_id];
		$field_name = $entity_id.'_listprice';
		$unit_price_array[]='"'.$unit_price.'"';
		$field_name_array[]="'".$field_name."'";

		$list_body .= '<tr class="lvtColData" onmouseover="this.className=\'lvtColDataHover\'" onmouseout="this.className=\'lvtColData\'" bgcolor="white">';
		$list_body .= '<td><INPUT type=checkbox NAME="selected_id" id="check_'.$entity_id.'" value= '.$entity_id;
		$list_body .= ' onClick=\'toggleSelectAll(this.name,"selectall");updateListPriceForField("'.$field_name.'",this)\'></td>';
		$list_body .= '<td>'.$adb->query_result($list_result, $i, "bookname").'</td>';
		$list_body .= '<td>'.$pk_currency_name.'</td>';
		$list_body .= '<td>'.$unit_price.'</td>';

		$list_body .='<td>';
		if (isPermitted('PriceBooks', 'EditView', "") == 'yes') {
			$list_body .= '<input type="text" name="'.$field_name.'" style="visibility:hidden;" id="'.$field_name.'">';
		} else {
			$list_body .= '<input type="text" name="'.$field_name.'" style="visibility:hidden;" readonly id="'.$field_name.'">';
		}
		$list_body .= '</td></tr>';
	}
}

$smarty->assign('UNIT_PRICE_ARRAY', implode(',', $unit_price_array));
$smarty->assign('FIELD_NAME_ARRAY', implode(',', $field_name_array));

if (!empty($order_by)) {
	$url_string .='&order_by='.$order_by;
}
if (!empty($sorder)) {
	$url_string .='&sorder='.$sorder;
}

$smarty->assign('LISTENTITY', $list_body);
$smarty->assign('RETURN_MODULE', vtlib_purify($_REQUEST['return_module']));
$smarty->assign('RETURN_ACTION', vtlib_purify($_REQUEST['return_action']));
$smarty->assign('RETURN_ID', $productid);
$smarty->display('AddProductToPriceBooks.tpl');
?>
