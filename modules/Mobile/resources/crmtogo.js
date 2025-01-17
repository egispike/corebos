/*+**********************************************************************************
 * The contents of this file are subject to the vtiger CRM Public License Version 1.0
 * ("License"); You may not use this file except in compliance with the License
 * The Original Code is:  vtiger CRM Open Source
 * The Initial Developer of the Original Code is vtiger.
 * Portions created by vtiger are Copyright (C) vtiger.
 * All Rights Reserved.
 * Modified by crm-now GmbH, www.crm-now.com
 ************************************************************************************/
//handle search for related entries
( function ($) {
	function ExecuteFunctions(functiontocall, params) {
		var baseurl = 'index.php?_operation=ExecuteFunctions';

		// Return a new promise avoiding jquery and prototype
		return new Promise(function (resolve, reject) {
			var url = baseurl+'&functiontocall='+functiontocall;
			var req = new XMLHttpRequest();
			req.open('POST', url, true);  // make call asynchronous

			req.onload = function () {
				// check the status
				if (req.status == 200) {
					// Resolve the promise with the response text
					resolve(req.response);
				} else {
					// Otherwise reject with the status text which will hopefully be a meaningful error
					reject(Error(req.statusText));
				}
			};

			// Handle errors
			req.onerror = function () {
				reject(Error('Network/Script Error'));
			};

			// Make the request
			req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
			req.send(params);
		});
	}
	function pageIsSelectmenuDialog(page) {
		var isDialog = false;
		var id = page && page.prop('id');
		$('.filterable-select').each(function () {
			if ($(this).prop('id') + '-dialog' === id ) {
				isDialog = true;
				return false;
			}
		});
		return isDialog;
	}
	function updateOnlineStatus(event) {
		if (event.srcElement.origin !== window.location.origin) {
			return;
		}
		var condition = navigator.onLine ? 'online' : 'offline';
		if (condition == 'offline') {
			jQuery.blockUI({
				message: cbMobile_arr.status_offline,
				css: {
					border: 'none',
					padding: '15px',
					backgroundColor: '#000',
					'-webkit-border-radius': '10px',
					'-moz-border-radius': '10px',
					opacity: .5,
					color: '#fff'
				}
			});
		} else {
			jQuery.unblockUI();
		}
	}
	window.addEventListener('online',  updateOnlineStatus);
	window.addEventListener('offline', updateOnlineStatus);
	$.mobile.document
		// Upon creation of the select menu, we want to make use of the fact that the ID of the
		// listview it generates starts with the ID of the select menu itself, plus the suffix "-menu".
		// We retrieve the listview and insert a search input before it.
		.on('selectmenucreate', '.filterable-select', function (event) {
			var input;
			var selectmenu = $(event.target);
			//remove not selected options
			$('option:not(:selected)', selectmenu).remove();
			var list = $('#' + selectmenu.prop('id') + '-menu');
			var form = list.jqmData('filter-form');
			// We store the generated form in a variable attached to the popup so we avoid creating a
			// second form/input field when the listview is destroyed/rebuilt during a refresh.
			if (!form) {
				input = $('<input data-type=\'search\' id=\'popup_search\'></input>');
				form = $('<form></form>').append(input);
				input.textinput();
				list
					.before(form)
					.jqmData('filter-form', form);
				form.jqmData('listview', list);
			}
			// Instantiate a filterable widget on the newly created selectmenu widget and indicate that
			// the generated input form element is to be used for the filtering.
			selectmenu
				.filterable({
					input: input,
					children: '> option[value]'
				})
				// Rebuild the custom select menu's list items to reflect the results of the filtering done on the select menu.
				.on('filterablefilter', function (e) {
				//get new content by ajax
				//decide what to call by id
					$.ajax({
						method: 'POST',
						url: 'index.php?_operation=getRelatedFieldAjax',
						dataType: 'json',
						data: {
							parentselector: selectmenu.prop('id'),
							searchvalue: input.val(),
							modulename : $('#module').val()
						}
					}).done(function (msg) {
						$('option:not(:selected)', selectmenu).remove();
						$.each(msg, function () {
							var key = this[0];
							var value = this[1];
							selectmenu.append($('<option>', {
								value: key,
								text: value
							}));
						});
						selectmenu.selectmenu('refresh');
						return false;
					}).fail(function () {
						alert('Select related entries error, please contact your CRM Administrator.');
						return false;
					});
				})
				.change('referenceselect', function (e) {
					var wsrecord_selected = e.target.value;
					var modulename = $('#module').val();
					var parentselector = selectmenu.prop('id');

					if (modulename == 'Timecontrol' && parentselector == 'product_id') {
						ExecuteFunctions('detectModulenameFromRecordId', 'wsrecordid='+wsrecord_selected).then(function (response) {
							var obj = JSON.parse(response);
							if (obj.name == 'Products') {
								//hide service fields
								$('#date_start').parent().parent().hide();
								$('#time_start').parent().parent().hide();
								$('#date_end').parent().parent().hide();
								$('#time_end').parent().parent().hide();
								$('#totaltime').val('');
								$('#totaltime').parent().parent().hide();
								$('#tcunits').parent().parent().show();
							} else if (obj.name == 'Services') {
								$('#date_start').parent().parent().show();
								$('#time_start').parent().parent().show();
								$('#date_end').parent().parent().show();
								$('#time_end').parent().parent().show();
								$('#totaltime').parent().parent().show();
								$('#tcunits').val('');
								$('#tcunits').parent().parent().hide();
							}
						}, function (error) {
							$('#date_start').parent().parent().show();
							$('#time_start').parent().parent().show();
							$('#date_end').parent().parent().show();
							$('#time_end').parent().parent().show();
							$('#totaltime').parent().parent().show();
							$('#tcunits').parent().parent().show();
						});
					}
				});
		})
		// The custom select list may show up as either a popup or a dialog, depending on how much
		// vertical room there is on the screen. If it shows up as a dialog, then the form containing
		// the filter input field must be transferred to the dialog so that the user can continue to
		// use it for filtering list items.
		.on('pagecontainerbeforeshow', function (event, data) {
			var listview, form;
			// We only handle the appearance of a dialog generated by a filterable selectmenu
			if ( !pageIsSelectmenuDialog(data.toPage) ) {
				return;
			}
			listview = data.toPage.find('ul');
			form = listview.jqmData('filter-form');
			// Attach a reference to the listview as a data item to the dialog, because during the
			// pagecontainerhide handler below the selectmenu widget will already have returned the
			// listview to the popup, so we won't be able to find it inside the dialog with a selector.
			data.toPage.jqmData('listview', listview);
			// Place the form before the listview in the dialog.
			listview.before(form);
		})
		// After the dialog is closed, the form containing the filter input is returned to the popup.
		.on('pagecontainerhide', function (event, data) {
			var listview, form;
			// We only handle the disappearance of a dialog generated by a filterable selectmenu
			if ( !pageIsSelectmenuDialog(data.prevPage) ) {
				return;
			}
			listview = data.prevPage.jqmData('listview');
			form = listview.jqmData('filter-form');
			// Put the form back in the popup. It goes ahead of the listview.
			listview.before(form);
		});
})(jQuery);

var crmtogo_Index_Js = {

	registerEventsForListView : function () {
		var tmp_src = '';
		var tmp_date = new Date();
		var module = $('#modulename').val();
		var view = $('#view').val();
		if (module != 'cbCalendar') {
			$('#searchInputField').css('display', 'block');
			$('#inputer').css('display', 'block');
			$('#viewname-button').css('display', 'block');
			$('#viewname').css('display', 'block');
		} else {
			//Initialize compact calendar
			$('#fliptoggle').val('on').slider('refresh');
			$('#viewname-button').css('display', 'none');
			var caljson = Array();

			$('#fliptoggle').on('slidestart', function (e) {
				var myswitch = $(this);
				var show = myswitch[0].selectedIndex == 1 ? true:false;
				if (show) {
					//compact calendar
					$('#calendardiv').css('display', 'block');
					$('#searchInputField').css('display', 'none');
					$('#inputer').css('display', 'none');
					$('#viewname-button').css('display', 'none');
					$('#viewname').css('display', 'none');
					$('#eventCalendarNoCache').css('display', 'block');
					$(document.getElementById('#view-calendar')).ready(function () {
						$('#calendarcontainer').jqmCalendar({
							events : caljson,
							months : cal_config_arr.monthNames,
							days : cal_config_arr.dayNamesShort,
							startOfWeek : $('#cal_startday').val()
						});
					});
				} else {
					$('#eventCalendarNoCache').css('display', 'none');
					$('#searchInputField').css('display', 'block');
					$('#calendardiv').css('display', 'none');
					$('#inputer').css('display', 'block');
					$('#viewname-button').css('display', 'block');
					$('#viewname').css('display', 'block');
				}
			});

			$('#scopetoggle').on('change', function (e) {
				var myswitch = $(this);
				var showWeek = myswitch[0].selectedIndex == 1 ? true:false;
				$('#calendarcontainer').trigger('changeScope', showWeek);
			});

			function fillcalendar(data) {
				var calobj = jQuery.parseJSON(data);
				//delete all existing events and provide new events
				caljson.length = 0;
				//loop through data to provide dates as objects
				$.each(calobj, function (index, object) {
					if (index=='result') {
						$.each(object, function ( calinfo, calvalue) {
							if (calinfo=='records') {
								if (!$.isEmptyObject(calvalue)) {
									$.each(calvalue, function ( calname, calcontent) {
										var startdate = new Date(calcontent['begin']);
										var enddate = new Date(calcontent['end']);
										caljson.push({'summary' :calcontent['summary'], 'begin': startdate, 'end':enddate, 'id':calcontent['id']});
									});
								}
							}
						});
					}
				});

				// sort events by begin date
				caljson.sort(function (a, b) {
					return a['begin'] > b['begin'];
				});

				$('#calendarcontainer').jqmCalendar({
					events : caljson,
					months : cal_config_arr.monthNames,
					days : cal_config_arr.dayNamesShort,
					startOfWeek : $('#cal_startday').val()
				});
				$('#calendarcontainer').trigger('refresh');
			}

			$('#calendarcontainer').bind('change', function (event, date, inWeek) {
				//get all calendar entries for the selected month
				//make sure it is called only once
				if (date.getTime() != tmp_date.getTime()) {
					$('#date_selected').val(date);
					var create_link = document.getElementById('create_link').href;
					var create_link_arr = create_link.split('&datetime');
					document.getElementById('create_link').href=create_link_arr[0]+'&datetime='+date;
					$.get('index.php?_operation=listModuleRecords&module=cbCalendar&compact=true&datetime='+date+((inWeek===true)?'&inweek=true':''), fillcalendar);
				}
				tmp_date = date;
			});
			//get all calendar entries for this month
			$.get('index.php?_operation=listModuleRecords&module=cbCalendar&compact=true&datetime='+new Date(), fillcalendar);
		}

		scroller(module, view, '');
		//search if content changes
		$('#inputer').on('input', function () {
			if (tmp_src == $('#inputer').val()) {
				return;
			}
			var tmp_src = $('#inputer').val();
			var tmp_src2 = $('#inputer').val();
			if (tmp_src2 == '') {
				return;
			}
			window.setTimeout(function () {
				doSearch(tmp_src2);
			}, 1000);
		});

		function locker() {
			if (tmp_src == $('#inputer').val()) {
				return;
			}
			var tmp_src = $('#inputer').val();
			var tmp_src2 = $('#inputer').val();
			if (tmp_src2 == '') {
				return;
			}
			window.setTimeout(function () {
				doSearch(tmp_src2);
			}, 5000);
		}
		function doSearch(src) {
			if (src == $('#inputer').val()) {
				$('#content').empty();
				scroller(module, $('#view').val(), document.getElementById('inputer').value);
			}
		}

		function scroller(module, view, search) {
			var pagerlimit = $('#pagerlimit').val();
			var viewName = $('#viewName').val();
			$('#content').scrollPagination({
				nop     : pagerlimit, // The number of posts per scroll to be loaded
				offset  : 0, // Initial offset, begins at 10 like in Config
				delay   : 500, // When you scroll down the posts will load after a delayed amount of time. This is mainly for usability concerns.
				scroll  : true, // The main bit, if set to false posts will not load as the user scrolls. but will still load if the user clicks.
				module	: module, //just as an example
				view	: view,
				viewName: viewName,
				search  : search,
			});
		}

		$('#viewname').change(function () {
			$('#content').empty();
			$('#inputer').val('');
			$('#view').val($(this).val());
			scroller($('#modulename').val(), $(this).val(), '');
		});
	},

	registerEventsForEditView : function () {
		//set size for textarea
		setTimeout(function () {
			$('.textarea').css({
				'height': 'auto'
			});
		}, 100);
		//toggle assigned to
		$('#User').click(function (e) {
			$('#assign_team').hide();
			$('#assign_user').show();
		});
		$('#Group').click(function (e) {
			$('#assign_team').show();
			$('#assign_user').hide();
		});
		//file selection
		$('#chooseFile').click(function (e) {
			e.preventDefault();
			$('input[type=file]').trigger('click');
		});
		$('input[type=file]').change(function () {
			var file = $('input[type=file]')[0].files[0];
			displayAsImage(file, 'preview');
		});
		function displayAsImage(file, containerid) {
			if (typeof FileReader !== 'undefined') {
				$('#'+containerid).empty();
				var container = document.getElementById(containerid),
					img = document.createElement('input'),
					reader;
				img.setAttribute('type', 'image');
				img.setAttribute('src', '');
				img.setAttribute('id', 'image');
				container.appendChild(img);
				reader = new FileReader();
				reader.onload = (function (theImg) {
					return function (evt) {
						theImg.src = evt.target.result;
					};
				}(img));
				reader.readAsDataURL(file);
			}
		}
		//submit function
		$('.ui-icon-check').click(function () {
			var mandatoryvalid = crmtogo_Index_Js.checkmandatory();
			if (mandatoryvalid) {
				if ($('#module').val()=='cbCalendar') {
					var datetimevaild = crmtogo_Index_Js.calendarvalidation();
					if (datetimevaild) {
						$('#EditView').submit();
						return true;
					} else {
						if (datetimevaild =='error_startdatetime') {
							$('#date_start').css('background-color', '#e2e2e2');
							alert(cal_error_arr.ERROR_STARTDATETIME);
						} else if (datetimevaild =='error_enddate') {
							$('#due_date').css('background-color', '#e2e2e2');
							alert(cal_error_arr.ERROR_DUEDATE);
						} else if (datetimevaild =='error_date_format_startdate') {
							$('#date_start').css('background-color', '#e2e2e2');
							alert(cal_error_arr.ERROR_STARTDATE_FORMAT);
						} else if (datetimevaild =='error_date_format_enddate') {
							$('#due_date').css('background-color', '#e2e2e2');
							alert(cal_error_arr.ERROR_DUEDATE_FORMAT);
						} else if (datetimevaild =='error_time_format_starttime') {
							$('#time_start').css('background-color', '#e2e2e2');
							alert(cal_error_arr.ERROR_STARTTIME_FORMAT);
						} else if (datetimevaild =='error_time_format_endtime') {
							$('#time_end').css('background-color', '#e2e2e2');
							alert(cal_error_arr.ERROR_DUETIME_FORMAT);
						}
						return false;
					}
				} else {
					$('#EditView').submit();
				}
			} else {
				return false;
			}
		});
	},

	//function to check the mandatory fields
	checkmandatory: function () {
		// get a collection of all empty fields
		var emptyFields = $(':input.required').filter(function () {
			// $.trim to prevent whitespace-only values being counted as 'filled'
			return !$.trim(this.value).length;
		});
		// if there are one or more empty fields
		if (emptyFields.length) {
			emptyFields.css('background-color', '#e2e2e2');
			emptyFields[0].focus();
			return false;
		}
		return true;
	},

	//function to set hidden calendar entries and calculate the duration of an event
	calendarvalidation: function () {
		//we use time_end for events
		var endtime_arr = $('#time_end').val().split(':');
		var endhour = parseFloat(endtime_arr[0]);
		var endmin  = parseFloat(endtime_arr[1]);
		// check if any variable is NaN
		if (endhour != endhour || endmin != endmin) {
			return 'error_time_format_endtime';
		}

		// if hour is smaller than 0 or greater than 23 then, throw exception
		if (endhour < 0 || endhour > 23) {
			return 'error_time_format_starttime';
		}
		// if min is smaller than 0 or greater than 59; throw exception
		if (endmin < 0 || endmin > 59) {
			return 'error_time_format_starttime';
		}

		var starttime_arr = $('#time_start').val().split(':');
		var starthour = parseFloat(starttime_arr[0]);
		var startmin  = parseFloat(starttime_arr[1]);

		// check if any variable is NaN
		if (starthour != starthour || startmin != startmin) {
			return 'error_time_format_starttime';
		}

		// if hour is smaller than 0 or greater than 23 then, throw exception
		if (starthour < 0 || starthour > 23) {
			return 'error_time_format_starttime';
		}
		// if min is smaller than 0 or greater than 59; throw exception
		if (startmin < 0 || startmin > 59) {
			return 'error_time_format_starttime';
		}

		var dateval1 = $('#date_start').val();
		var dateval2 = $('#due_date').val();

		var dv1_arr = dateval1.split('-');
		var y1 = dv1_arr[0];
		var m1 = dv1_arr[1];
		var d1 = dv1_arr[2];
		var dv2_arr = dateval2.split('-');
		var y2 = dv2_arr[0];
		var m2 = dv2_arr[1];
		var d2 = dv2_arr[2];

		var date1 = new Date(y1, m1, d1, starthour, startmin, 0);

		var date2 = new Date(y1, m1, d1, endhour, endmin, 0);
		if (date1 - date2 == '0') {
			//add 5 minutes for create mode for events
			date2.setMinutes(date2.getMinutes() + 5);
			var fiveminutes = date2.getHours() + ':' + date2.getMinutes();
			$('#time_end').val(fiveminutes);
		}
		//must be in the future
		if (new Date() > date1) {
			if ($('#Status').val() == 'Planned' || $('#Status').val() == 'Not Started') {
				return 'error_startdatetime';
			}
		}

		//end date not before start date
		var firstDate = new Date().setFullYear(y1, (parseInt(m1) - 1), d1);
		var secondDate = new Date().setFullYear(y2, (parseInt(m2) - 1), d2);
		if (secondDate < firstDate) {
			return 'error_enddate';
		}

		//duration for events

		var diff_ms = Math.abs(date2.getTime()-date1.getTime())/(1000*60);
		var hour = Math.floor(diff_ms / 60);
		var minute = Math.floor(diff_ms % 60);
		//set minimum duration
		if (hour == 0 && minute == 0) {
			minute = 5;
		}
		$('#duration_hours').val(hour);
		$('#duration_minutes').val(minute);

		return true;
	},

	isDate: function (Dateval) {
		if (Dateval == '') {
			return false;
		}
		//Declare Regex
		var IsoDateRe = new RegExp('^([0-9]{4})-([0-9]{2})-([0-9]{2})$');
		var matches = IsoDateRe.exec(Dateval);
		if (!matches) {
			return false;
		}
		//Checks for mm/dd/yyyy format.
		var dtYear = matches[1];
		var dtMonth = matches[2];
		var dtDay= matches[3];
		if (dtMonth < 1 || dtMonth > 12) {
			return false;
		} else if (dtDay < 1 || dtDay> 31) {
			return false;
		} else if ((dtMonth==4 || dtMonth==6 || dtMonth==9 || dtMonth==11) && dtDay ==31) {
			return false;
		} else if (dtMonth == 2) {
			var isleap = (dtYear % 4 == 0 && (dtYear % 100 != 0 || dtYear % 400 == 0));
			if (dtDay> 29 || (dtDay ==29 && !isleap)) {
				return false;
			}
		}
		return true;
	},

	registerEventsForDetailView : function (event) {
		//file download
		$('#filedownload').click(function (e) {
			e.preventDefault();
			location.href='index.php?_operation=downloadFile&record='+$('#recordid').val();
		});

		$('#savecomment').click(function (e) {
			e.preventDefault();
			var comment = $('#comment_text').val();
			if ($.trim(comment)!='') {
				addComment();
			}
			return false;

			function addComment() {
				$.ajax({
					method: 'POST',
					url: 'index.php?_operation=addComment',
					dataType: 'json',
					data: {
						parentid: $('#recordid').val(),
						comment: $('#comment_text').val()
					}
				}).done(function ( msg ) {
					$('#comment_content').prepend(msg.html);
					$('#comment_text').val('');
					return false;
				}).fail(function () {
					alert('Comment Save Error, please contact your CRM Administrator.');
					return false;
				});
			}
		});
	},
	registerDetailViewEvents: function () {
		this.registerEventsForDetailView();
	},
	registerEditViewEvents: function () {
		this.registerEventsForEditView();
	},
	registerListViewEvents: function () {
		this.registerEventsForListView();
	},
};

//initialization for submit functions (create + edit view)
$(document).delegate('#edit_page', 'pageinit', function () {
	crmtogo_Index_Js.registerEditViewEvents();
});

$(document).delegate('#list_page', 'pageinit', function () {
	crmtogo_Index_Js.registerListViewEvents();
});

$(document).delegate('#detail_page', 'pageinit', function () {
	crmtogo_Index_Js.registerDetailViewEvents();
});

$(document).delegate('#login_page', 'pageinit', function () {
	(function ($) {
		$.toggleShowPassword = function (options) {
			var settings = $.extend({
				field: '#password',
				control: '#toggle_show_password',
			}, options);
			var control = $(settings.control);
			var field = $(settings.field);
			control.bind('click', function () {
				if (control.is(':checked')) {
					field.prop('type', 'text');
				} else {
					field.prop('type', 'password');
				}
			});
		};
	}(jQuery));
	$.toggleShowPassword({
		field: '#password',
		control: '#showpw'
	});
});
