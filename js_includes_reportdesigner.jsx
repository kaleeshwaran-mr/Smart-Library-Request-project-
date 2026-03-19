/*! RESOURCE: /reportdesigner/module.reportDesigner.js */
angular
	.module('reportDesigner', [
		'sn.base',
		'ng.common',
		'sn.common',
		'report.common',
		'sn.filter_widget',
		'sn.dot_walk_component',
		'angularFileUpload',
		'ngAria',
		'heisenberg'
	])
	.config(['$locationProvider', function moduleConfig($locationProvider) {
		if (window.history && history.pushState)
			$locationProvider.html5Mode({
				enabled: true,
				requireBase: false,
				rewriteLinks: false,
			});
	}]);
$j.fn.escape = function escape(callback, once) {
	return this.each(function eachCb() {
		$j(document).on('keydown.escape', this, function escapeCb(e) {
			var keycode = ((typeof e.keyCode !== 'undefined' && e.keyCode) ? e.keyCode : e.which);
			if (keycode === 27) {
				callback.call(this, e);
				if (once)
					$j(document).off('keydown.escape');
			}
		});
	});
};
;
/*! RESOURCE: /reportdesigner/constants/constant.chartTypeNames.js */
angular
	.module('reportDesigner')
	.constant('chartTypeNames', {
		AREA: 'area',
		BAR: 'bar',
		BOX: 'box',
		BUBBLE: 'bubble',
		CALENDAR: 'calendar',
		COLUMN: 'line_bar',
		CONTROL: 'control',
		DIAL: 'solid_gauge',
		DONUT: 'donut',
		FUNNEL: 'funnel',
		HEATMAP: 'heatmap',
		HISTOGRAM: 'hist',
		HORIZONTAL_BAR: 'horizontal_bar',
		LINE: 'line',
		LIST: 'list',
		MAP: 'map',
		MULTIPIVOT: 'pivot_v2',
		PARETO: 'pareto',
		PIE: 'pie',
		PIVOT: 'pivot',
		PYRAMID: 'pyramid',
		SEMI_DONUT: 'semi_donut',
		SINGLE_SCORE: 'single_score',
		SPEEDOMETER: 'angular_gauge',
		SPLINE: 'spline',
		TREND: 'trend',
		TRENDBOX: 'tbox',
		STEP_LINE: 'step_line'
	});
;
/*! RESOURCE: /reportdesigner/constants/constant.fieldTypeNames.js */
angular
	.module('reportDesigner')
	.constant('fieldTypeNames', {
		VARIABLES: 'variables',
		VARIABLE: 'variable',
		VARIABLE_CHOICE: 'variable_choice',
		QUESTIONS: 'questions',
		STRING: 'string',
		CHOICE: 'choice',
		GLIDE_DURATION: 'glide_duration',
		CURRENCY: 'currency',
		CURRENCY2: 'currency2',
		REFERENCE: 'reference',
		BOOLEAN: 'boolean',
		PRICE: 'price',
		TIMER: 'timer',
		JOURNAL: 'journal',
		JOURNAL_INPUT: 'journal_input',
		INTEGER: 'integer',
		LONGINT: 'longint',
		DECIMAL: 'decimal',
		NUMERIC: 'numeric',
		FLOAT: 'float',
		DATE: 'date',
		DATETIME: 'datetime',
		DUE_DATE: 'due_date',
		GLIDE_DATE: 'glide_date',
		GLIDE_DATE_TIME: 'glide_date_time',
		GLIDE_TIME: 'glide_time',
		GLIDE_LIST: 'glide_list',
		DOMAIN_NUMBER: 'domain_number',
		DOMAIN_ID: 'domain_id',
		DOCUMENT_ID: 'document_id',
		AUTO_INCREMENT: 'auto_increment',
		PERCENT_COMPLETE: 'percent_complete',
		REF_ELEMENT_PREFIX: 'ref_'
	});
;
/*! RESOURCE: /reportdesigner/constants/constant.sourceTypeNames.js */
angular
	.module('reportDesigner')
	.constant('sourceTypeNames', {
		table: 'table',
		reportSource: 'source',
		externalImport: 'external',
		metricBase: 'metricbase'
	});
;
/*! RESOURCE: /reportdesigner/constants/constant.aliasesErrorCodes.js */
angular
	.module('reportDesigner')
	.constant('aliasesErrorCodes', {
		success: {code: 200, errorKey: 'success'},
		internal_error: {code: 500, errorKey: 'aliases_internal_error'},
		forbidden_error: {code: 403, errorKey: 'aliases_forbidden_error'}
	});
;
/*! RESOURCE: /reportdesigner/constants/constant.keyCodes.js */
angular
	.module('reportDesigner')
	.constant('keyCodes', {
		DOWN: 40,
		UP: 38,
		TAB: 9
	});
;
/*! RESOURCE: /reportdesigner/constants/constant.formatView.js */
angular
	.module('reportDesigner')
	.constant('formatViewConstants', {
		states: {
			LOADING: 'Loading',
			NOT_SUPPORTED: 'NotSupported',
			SHOW: 'Show'
		}
	});
;
/*! RESOURCE: /reportdesigner/controllers/controller.reportDesigner.js */
angular.module('reportDesigner').controller('mainController', ['$scope', '$rootScope', '$filter', '$timeout', 'EndpointsService', 'ServerService', 'PiwikService', 'filterData', 'chartTypes', 'utils', 'defaults', 'mocks', '$sce', 'snCustomEvent', '$window', '$q', 'dotWalkingFilters', 'sourceTypeNames', 'sourceTypes', 'typeLogic', 'chartTypeNames', 'variables', 'cancelation', 'funcFieldService', function mainController($scope, $rootScope, $filter, $timeout, endpoint, server, Piwik, filterData, types, utils, defaults, mocks, $sce, snCustomEvent, $window, $q, dotWalkingFilters, sourceTypeNames, sourceTypes, typeLogic, chartTypeNames, variables, cancelation, funcFieldService) {
	'use strict';
	var self = this;
	var allColorOptions;
	var modals = defaults.modals;
	var lastRanReport;
	this.activeMenuTab = 'data';
	this.activeStyleTab = 'general';
	this.activeOriginPane = sourceTypeNames.reportSource;
	this.activeAxisTab = 'x-axis';
	this.textDirection = 'left';
	this.selectedType = types.currentType;
	this.report = {};
	this.report.sysparm_report_id = gReport.sysId;
	this.types = types;
	this.designerMode = gReport.i18n.loadingReport;
	this.editMode = (gReport.editMode === 'true');
	this.isCustomConfigUIDebug = gReport.isCustomConfigUIDebug;
	this.noneOptionShown = true;
	this.historySidebarObserverBound = false;
	this.sourceType = {
		metric: [],
		tables: []
};
	this.loadAlias = 0;
	this.loadFormatting = 0;
	this.sharing = {};
	this.sharing.user = '';
	this.sharing.roles = [];
	this.sharing.groups = [];
	this.sharing.users = [];
	this.access = defaults.access;
	this.recentSourceType = sourceTypeNames.reportSource;
	this.sharingUtils = {};
	this.sharingUtils.activeGroupTab = 'groups';
	if (this.report.sysparm_report_id)
		this.isNew = false;
	else
		this.isNew = true;
	this.isShared = false;
	this.isPublished = false;
	this.publishStatus = '';
	this.isScheduled = false;
	this.isDrillable = false;
	this.isSavingDrilldown = false;
	this.isSavingDataset = false;
	this.canAddDrill = false;
	this.saveMenuShown = false;
	this.sidebarShown = false;
	this.filtersMenuShown = false;
	this.treeNavShown = false;
	this.isFullWidth = true;
	this.history = {};
	this.mapSources = null;
	this.maps = null;
	this.loadingSources = false;
	this.loadingImportTables = false;
	this.loadingMetricBaseTables = false;
	this.callbackMethod = null;
	this.callbackMethodParms = null;
	this.isDataset = false;
	this.isDrilldown = false;
	this.isImportTable = false;
	this.isMain = true;
	this.beforeChanges = {};
	this.beforeChangesSelectedTableObj = {};
	this.beforeChangesSelectedSourceObj = {};
	this.beforeChangesSelectedImportTableObj = {};
	this.tmpActiveMenuTab = null;
	this.savedMain = {};
	this.datasetSysId = '';
	this.drilldownSysId = '';
	this.breadcrumbsTree = [];
	this.activeTreeItem = '';
	this.importButtonVisible = false;
	this.lang = window.g_lang;
	this.reportHasRun = false;
	this.dataChanged = false;
	this.initConditionBuilderDirective = true;
	this.sourceTypeList = sourceTypes.sourceTypeList;
	this.sourceTypes = sourceTypes;
	this.sourceTypeNames = sourceTypeNames;
	this.chartTypeNames = chartTypeNames;
	this.typeLogic = typeLogic;
	this.dotWalkingFilters = dotWalkingFilters;
	this.Piwik = Piwik;
	this.isPopulatedField = {
		pivotV2: false,
		listColumns: false,
		groupBy: false,
		mapSources: false,
		sysparm_box_field: false,
		sysparm_cal_field: false,
		sysparm_trend_field: false
	};
	this.selectedSourceTypeObj = {};
	this.selectedTableObj = {};
	this.selectedSourceObj = {};
	this.selectedImportTableObj = {};
	this.selectedMetricBaseObj = {};
	this.accessibilityEnabled = (gReport.accessibilityEnabled === 'true');
this.nlqEnabled = gReport.nlqEnabled;
	this.showNlqComponentCB = true;
	this.nlqLoading=false;
	this.nlqShowPrevious = false;
	this.nlqNotUnderstood = false;
	this.nlqRestrictedData = false;
	this.nlqError = false;
	this.nlqNewReport = true;
	this.hasAccessToFunctionField = (gReport.hasAccessToFunctionField === 'true');
	this.isFuncFieldEnabled = false;
	this.canShowFunctionField = this.hasAccessToFunctionField;
	this.isPublishedReportsEnabled = gReport.isPublishedReportsEnabled === 'true';
	this.manualLabor = gReport.report.sysparm_manual_labor;
	this.isPolarisOn = false;
	attachFilterEvents();
	attachFocusTrapEvents();
	self.filterConfig = defaults.filterConfig;
	self.sortConfig = {
		enableDotWalkFieldPicker : true,
		sortFieldFilter : dotWalkingFilters.sortByFilter
	};
filterExpanded = 1;
	this.notify = {
		message: '',
		type: 'success',
		close: function closeNotification() {
			self.notify.message = '';
			self.notify.showLink = false;
		}
	};
	this.isTableAndFieldDescriptionEnabled = gReport.isTableAndFieldDescriptionEnabled;
	this.tableDescription = '';
	this.emptyTableDescription = gReport.i18n.empty_table_description_text;
	this.emptyDataSourceDescription = gReport.i18n.empty_report_source_description_text;
	self.scheduleReportDescription = gReport.i18n.scheduleReport;
	self.Piwik.trackEntry();
	self.Piwik.trackEvent('UI', 'new');
	function canCreateDatasets() {
		return types.isDatasetAvailable(self.getMainProperty('sysparm_type')) && self.access.dataset.create;
	}
	this.getMaxDatasets = function getMaxDatasets() {
		return self.selectedSourceTypeObj.name === sourceTypeNames.metricBase ? gReport.maxMetricBaseDatasetTabs : gReport.maxDatasetTabs;
	};
	this.showAddDataset = function showAddDataset() {
		return canCreateDatasets() && self.breadcrumbsTree.length < self.getMaxDatasets();
	};
	this.showDatasetConnector = function maxDatasetReached() {
		return canCreateDatasets() && self.breadcrumbsTree.length <= self.getMaxDatasets();
	};
	this.showDataset = function showDataset(breadcrumb) {
		return types.isDatasetAvailable(self.getMainProperty('sysparm_type')) && breadcrumb.access.write && breadcrumb.access.read;
	};
	this.showUseDefaultColorCheckbox = function showUseDefaultColorCheckbox() {
		return self.isPolarisOn && ((self.types.isMapType() && !self.isDataset) || self.types.hasColorFields())
	};
	this.showDeleteDataset = function showDeleteDataset(breadcrumb) {
		return breadcrumb.access.delete;
	};
	this.getCalendarIntervals = function(calendar) {
		if (!calendar || !this.choice.trend_calendars.calendars[calendar])
			return this.choice.interval;
		return this.choice.trend_calendars.calendars[calendar];
	};
	this.onChangeTrendByCalendar = function() {
		var self = this;
		self.report.sysparm_trend_interval = self.getCalendarIntervals(self.report.sysparm_calendar)[0].id;
		self.calendarIntervals = self.getCalendarIntervals(self.report.sysparm_calendar);
		utils.resetSelect2();
	};
	this.initTrendByCalendarAndPer = function() {
		self.calendarIntervals = self.getCalendarIntervals(self.report.sysparm_calendar);
		utils.applySelect2();
	};
	setCommonData().then(function setCommonDataCallback() {
		if ((!self.isNew && gReport.sysId) || self.manualLabor === 'true')
			return setModel();
		var forceType = typeLogic.defaultChartTypes[self.selectedSourceTypeObj.name];
		if (gReport.report.sysparm_type)
forceType = gReport.report.sysparm_type;
		return setEmptyModel(forceType);
	}).then(function setColumnsFromTableCb() {
		if (self.report.sysparm_table)
			return setColumnsFromTable();
	}).then(function runReportCb() {
		if (!self.isNew || self.manualLabor)
			self.runReport();
		utils.setPageTitle(self.report.sysparm_title);
		utils.setNavigationTitle(self.report.sysparm_title, self.report.sysparm_report_id);
		copyReportToBeforeChanges();
		self.savedMain = angular.copy(self.report);
	});
	setModalListeners();
	setCustomEventListeners();
	setNLQEventListeners();
	fixScopeChangeButton();
	if (angular.element('html').attr('dir') === 'rtl')
		this.textDirection = 'right';
	if (this.isNew)
		this.designerMode = gReport.i18n.createReport;
	this.openModal = function openModal(name) {
		if (name === 'additionalGroupBy')
			getAdditionalGroupByCols();
		if (name === 'listColumns')
			getListCols();
		if (name === 'configureAliases') {
			this.loadAlias = this.loadAlias + 1;
		}
		$j(modals[name]).modal('show');
	};
	this.closeModal = function closeModal(name) {
		$j(modals[name]).modal('hide');
	};
	this.openColoringModal = function openColoringModal(message) {
		if (!self.isNew) {
			var colorRuleViewName = chartTypeNames.SINGLE_SCORE === types.currentType ? 'single_score_color_rule' : '';
			self.coloringRulesUrl = $sce.trustAsResourceUrl('sys_report_mpivot_rule_list.do?sysparm_query=report_id%3D' + self.report.sysparm_report_id + '&sysparm_view=' + colorRuleViewName + '&sysparm_userpref.sys_report_mpivot_rule_list.view=' + colorRuleViewName + '&sysparm_userpref.sys_report_mpivot_rule.view=' + colorRuleViewName);
			$j(modals.coloringRules).modal('show');
		} else
			$window.alert(message);
	};
function fetchData() {
		var params = '';
		var endPoint = endpoint.getDataUrl;
if (gReport.sysId && self.isMain) {
			params = '&sys_id=' + gReport.sysId;
			if (gReport.recordScope)
				params += '&sysparm_record_scope=' + gReport.recordScope;
} else if (self.isDrilldown) {
			params = '&sys_id=' + self.drilldownSysId + '&sysparm_source_type=' + self.savedMain.sysparm_source_type;
			endPoint = endpoint.getDrilldownUrl;
} else if (self.isDataset) {
			params = '&sysparm_report_layer_id=' + self.datasetSysId + '&sysparm_report_type=' + self.savedMain.sysparm_type + '&sysparm_report_id=' + gReport.sysId + '&sysparm_source_type=' + self.savedMain.sysparm_source_type;
			endPoint = endpoint.getDatasetUrl;
		}
		params += '&loaded_source_type=' + typeLogic.getLoadedSourceType(self.sourceType);
		var url = endPoint + params;
		if (gReport.migrationNotificationMessage !== '') {
			$timeout(function delay() {
			}, 1000).then(function showNotification() {
				self.notify.type = 'info';
				self.notify.message = gReport.migrationNotificationMessage;
				if (gReport.migrationNotificationURL !== '') {
					self.notify.showLink = true;
				}
				self.notify.linkCallbackFunction = function() {
var url = $window.location.protocol + '//' + $window.location.host + '/'+gReport.migrationNotificationURL;
					$window.open(url, '_blank');
				}
			});
		}
		return cancelation.cancelRunReport().then(function(response) {
			return server.get(url).then(function getDataCb(resp) {
				if (resp.status === defaults.statuses.success)
					return resp.data;
				if (resp.message) {
					self.notify.type = 'error';
					self.notify.message = resp.message;
				}
				setMainDatasetState();
				return null;
			});
		});
	}
	function buildEmptyMetricConfig() {
		return {transforms: [{transform: {transform: 'Reference', name: 'chart-subjects'}}]};
	}
	function setModel() {
		return fetchData().then(function fetchDataCallback(data) {
			if (data) {
				if (self.isNew && !gReport.sysId && self.manualLabor && self.report.sysparm_start_time && !gReport.report.sysparm_start_time) {
					data.report.sysparm_start_time = self.report.sysparm_start_time;
					data.report.sysparm_end_time = self.report.sysparm_end_time;
				}
				self.report = data.report;
if (self.report.sysparm_type === 'vertical_bar')
					self.report.sysparm_type = 'bar';
if (self.manualLabor === 'true' && !self.isDataset && !self.isDrilldown) {
					self.report = utils.extendParams(data.report, gReport.report);
if (!self.report.sysparm_title)
						self.report.sysparm_title = getTitleWhemEmpty(self.report);
					self.activeMenuTab = 'configure';
				}
				if (self.report.sysparm_custom_config)
					try {
						self.report.sysparm_custom_config = angular.fromJson(self.report.sysparm_custom_config);
					} catch (e) {
						self.report.sysparm_custom_config = {};
					}
				setReportSourceTypeIncludingDataFromDropdowns(data.source_type, (self.report.sysparm_source_type ? self.report.sysparm_source_type : self.recentSourceType));
				if (self.report.sysparm_report_use_temporary_table)
					utils.showMessage(self.report.sysparm_report_use_temporary_table_msg, utils.msgType.type_info, 10000);
				if (self.isMain) {
					self.access = data.access;
					self.created_by = data.created_by_user;
					self.sharing = data.sharing;
					setSharingSettings();
self.breadcrumbsTree = data.breadcrumbs;
					setDrillableOptions();
					self.isPublished = data.is_published;
					self.isScheduled = data.is_scheduled;
					self.scheduleReportDescription = self.isScheduled ? gReport.i18n.scheduleReportAdded : gReport.i18n.scheduleReport;
				}
				if (self.isDataset) {
self.report.sysparm_calendar = self.beforeChanges.sysparm_calendar;
self.report.sysparm_trend_interval = self.beforeChanges.sysparm_trend_interval;
					self.report.sysparm_start_time = self.savedMain.sysparm_start_time;
					self.report.sysparm_end_time = self.savedMain.sysparm_end_time;
				}
				if (self.isDrilldown) {
					self.report.sysparm_table = self.beforeChanges.sysparm_table;
					self.report.sysparm_table_display_value = self.beforeChanges.sysparm_table_display_value;
					self.report.sysparm_import_table = self.beforeChanges.sysparm_import_table;
					self.report.sysparm_report_source_id = self.beforeChanges.sysparm_report_source_id;
					self.selectedTableObj = angular.copy(self.beforeChangesSelectedTableObj);
					self.selectedSourceObj = angular.copy(self.beforeChangesSelectedSourceObj);
					self.selectedImportTableObj = angular.copy(self.beforeChangesSelectedImportTableObj);
					self.selectedSourceTypeObj = $filter('filter')(self.sourceTypeList, {name: self.beforeChangesSelectedSourceTypeObj.name}, true)[0];
				} else
self.selectedSourceObj = {};
				self.isImportTable = false;
				if (data.report.sysparm_import_table)
					self.isImportTable = true;
				setFieldsFromReportObject();
				if (types.hasColorFields())
					self.report.sysparm_set_color = setColoring(self.report.sysparm_set_color);
if ((self.selectedSourceTypeObj.name === sourceTypeNames.reportSource || (self.isNew && self.recentSourceType === sourceTypeNames.reportSource)) && !self.report.sysparm_manual_labor)
					setSources().then(function setSourcesInSetModel() {
						self.selectedSourceObj = $filter('filter')(self.sourceType.sources, {value: self.report.sysparm_report_source_id}, true)[0];
					});
				else if (self.selectedSourceTypeObj.name === sourceTypeNames.externalImport && self.access.can_import && self.selectedImportTableObj)
					setImportTables().then(function setExternalSourcesInSetModel() {
self.selectedImportTableObj = $filter('filter')(self.sourceType.import, function filter(item) { return item.name === self.report.sysparm_table; })[0];
					});
				else if ((self.selectedSourceTypeObj.name === sourceTypeNames.metricBase || (self.isNew && self.recentSourceType === sourceTypeNames.metricBase && !self.selectedSourceTypeObj.name)))
					setMetricBaseTables().then(function setMetricBaseInSetModel() {
						self.tables = self.sourceType.metric;
						if (self.tables && self.tables.length)
							self.selectedTableObj = $filter('filter')(self.tables, {name: self.report.sysparm_table}, true)[0];
						else if (self.report.sysparm_table)
							self.tables = [{label: self.report.sysparm_table, name: self.report.sysparm_table}];
						if (!self.report.sysparm_custom_config.transforms || !self.report.sysparm_custom_config.transforms.length)
							self.report.sysparm_custom_config = buildEmptyMetricConfig();
if (self.manualLabor === true) {
							var metricField = gReport.report.sysparm_metric_field;
							if (metricField)
								self.report.sysparm_custom_config.transforms[0].metric = metricField;
						}
					});
				else
self.selectedTableObj = {name: self.report.sysparm_table_display_value};
if (!self.isNew) {
					self.designerMode = gReport.i18n.editReport;
					self.activeMenuTab = 'configure';
				}
if (gReport.sysId && !self.report.sysparm_report_id && self.isMain && !self.report.sysparm_manual_labor) {
					self.isNew = true;
					self.activeMenuTab = 'data';
					self.designerMode = gReport.i18n.createReport;
					$timeout(function showInfo() {
						self.notify.type = 'info';
						self.notify.message = gReport.i18n.nonExistingReport;
					}, 100);
				}
resetFieldFlags();
				instantiateConditionBuilder();
				self.dataChanged = false;
				refreshBreadcrumb();
				setReferenceValues();
if (!types.hasGeneralStyleOptions())
self.activeStyleTab = 'title';
				utils.resetSelect2();
				getTableDescription();
				self.toggleFuncFieldButton();
			}
			self.readyToShowSidebarContents = true;
		}).then(function getReportSourceInfoCb() {
			if (self.report.sysparm_report_source_id)
				return onSourceChanged(self.report.sysparm_report_source_id, false, true);
			return undefined;
		});
	}
	function setEmptyModel(type) {
		var params = '&sys_id=';
		params += '&loaded_source_type=' + typeLogic.getLoadedSourceType(self.sourceType);
		return server.get(endpoint.getDataUrl + params).then(function setEmptyModelCb(resp) {
			if (resp.status === defaults.statuses.success) {
				var data = resp.data;
				if (self.isNew && !gReport.sysId && self.report.sysparm_start_time) {
					data.report.sysparm_start_time = self.report.sysparm_start_time;
					data.report.sysparm_end_time = self.report.sysparm_end_time;
				}
				self.report = data.report;
				if (self.selectedSourceTypeObj.name === sourceTypeNames.metricBase)
					self.report.sysparm_set_color = setColoring('color_palette');
				instantiateConditionBuilder();
				self.report.sysparm_table = '';
				if (type) {
					types.setType(type);
					self.report.sysparm_type = type;
				}
				self.report.sysparm_use_default_colors = true;
				setReferenceValues();
				setSharingSettings();
			}
			self.readyToShowSidebarContents = true;
		});
	}
		function setCommonData() {
		var params = '';
		if (gReport.sysId)
			params = '&sys_id=' + gReport.sysId;
		params += '&loaded_source_type=' + typeLogic.getLoadedSourceType(self.sourceType);
		var url = endpoint.getCommonDataUrl + params;
		return server.get(url).then(function setCommonDataCb(resp) {
			if (resp.status === defaults.statuses.success) {
				var data = resp.data;
				var actualSourceType;
				self.choice = data.choice;
				self.access = data.access;
				self.messages = data.messages;
				if (!self.choice.hasOwnProperty("trend_calendars"))
					self.choice.trend_calendars = {
						groups: [],
						calendars: {}
					};
				self.hasBizCalendarEntries = Object.keys(self.choice.trend_calendars.calendars).length > 0;
				if (self.choice.trend_calendars.groups)
					self.choice.interval = self.choice.interval.map(function(item) {
						return {
							text: item.name,
							id: item.value
						};
					});
				if (!self.report.sysparm_calendar)
					self.report.sysparm_calendar = '';
				allColorOptions = angular.copy(self.choice.set_color);
				if (!self.access.write && !self.isNew)
					self.designerMode = gReport.i18n.viewReport;
if (self.manualLabor && gReport.report.sysparm_source_type)
					actualSourceType = gReport.report.sysparm_source_type;
				else
					actualSourceType = data.source_type.recent_source_type;
				if (!gReport.sysId)
					setReportSourceTypeIncludingDataFromDropdowns(data.source_type, actualSourceType);
				if (!self.access.can_import)
					self.sourceTypeList = utils.removeObjectFromArray(self.sourceTypeList, 'name', sourceTypeNames.externalImport);
				if (!self.access.can_metric)
					self.sourceTypeList = utils.removeObjectFromArray(self.sourceTypeList, 'name', sourceTypeNames.metricBase);
				getMaps();
				utils.applySelect2([{id: 'select-source-type', options: {minimumResultsForSearch: -1}}]);
			} else if (resp.message) {
				self.notify.type = 'error';
				self.notify.message = resp.message;
			}
		});
	}
	function setReportSourceTypeIncludingDataFromDropdowns(sourceTypeJson, sourceType) {
self.recentSourceType = sourceType;
self.selectedSourceTypeObj = $filter('filter')(self.sourceTypeList, {name: sourceType}, true)[0];
		if (sourceType === sourceTypeNames.reportSource)
if (sourceTypeJson.sources && sourceTypeJson.sources.length)
				self.sourceType.sources = sourceTypeJson.sources;
else
				return setSources();
		else if (sourceType === sourceTypeNames.table) {
} else if (sourceType === sourceTypeNames.externalImport)
if (sourceTypeJson.tables && sourceTypeJson.tables.length)
				self.sourceType.import = sourceTypeJson.external;
else
				return setImportTables();
		else if (sourceTypeJson.metric && sourceTypeJson.metric.length)
			self.tables = sourceTypeJson.metric;
		else
			return setMetricBaseTables().then(function setTablesFromSourceTypeMetricMap() {
				self.tables = self.sourceType.metric;
			});
	}
	this.processUnsavedChanges = function processUnsavedChanges(save) {
		if (save)
			if (self.isDataset)
				self.saveDataset(true).then(function saveCb() {
					return getBreadcrumbsTree();
				}).then(function getTreeCb() {
					self.callbackMethod.apply(self, self.callbackMethodParms);
				});
			else if (self.isDrilldown)
				self.saveDrilldown(true).then(function saveDdCb() {
					return getBreadcrumbsTree();
				}).then(function cbApply() {
					self.callbackMethod.apply(self, self.callbackMethodParms);
				});
else
				self.saveReport().then(function saveCb() {
					self.callbackMethod.apply(self, self.callbackMethodParms);
				});
else
			self.callbackMethod.apply(self, self.callbackMethodParms);
	};
	function isModelChanged(checkUnsavedChanges) {
		getReferenceValues();
		return checkUnsavedChanges && !utils.areObjectsEqualUsingSourceType(self.report, self.beforeChanges, self.report.sysparm_source_type);
	}
	function getTableDescription() {
self.notify.message = '';
		if (self.isTableAndFieldDescriptionEnabled && self.report.sysparm_table && (self.selectedSourceTypeObj.name === sourceTypeNames.table || self.selectedSourceTypeObj.name === sourceTypeNames.metricBase)) {
			return server.get(endpoint.getTableDescriptionUrl + self.report.sysparm_table).then(function getData(response) {
				if (response.result.description)
					self.tableDescription = response.result.description;
				else
					self.tableDescription = self.emptyTableDescription;
appendAriaLabelledbyAttributes('s2id_autogen1', ['table-selection-label', 'table-description-panel']);
appendAriaLabelledbyAttributes('s2id_autogen3', ['table-selection-label', 'table-description-panel']);
			}, function errorCallback(response) {
				self.notify.type = 'error';
				self.notify.message = response;
			});
		}
		self.tableDescription = '';
		return null;
	}
	this.canSave = function canSave() {
		return self.report.sysparm_table && ((self.access.write && !self.isNew) || (self.access.create && self.isNew));
	};
	this.openDataSet = function openDataSet(datasetSysId, checkUnsavedChanges) {
		self.Piwik.trackEvent('Report Structure', 'open dataset');
		if (isModelChanged(checkUnsavedChanges)) {
			self.callbackMethodParms = [datasetSysId, false];
			self.callbackMethod = self.openDataSet;
			$j(modals.unsavedDialogConfirmation).modal('show');
		} else {
			resetToMainState();
			if (!datasetSysId)
				self.dataChanged = false;
			self.reportHasRun = false;
			cleanCallBack();
types.setAllowedTypesForDatasets(self.savedMain.sysparm_type);
			self.activeTreeItem = datasetSysId;
			setIsDrilldownOrDataset(false, true, datasetSysId);
			togglePanels();
			setModel().then(function modelCb() {
				self.treeNavShown = false;
				self.activeMenuTab = 'data';
				setTitleDesigner();
				self.tables = self.sourceType.tables;
				if (!self.datasetSysId)
					self.report.sysparm_source_type = self.recentSourceType;
if (self.savedMain.sysparm_source_type === sourceTypeNames.metricBase) {
					self.report.sysparm_source_type = sourceTypeNames.metricBase;
					self.tables = self.sourceType.metric;
				}
				updateSourceTypeDependentElements();
				if (!datasetSysId) {
					self.report.sysparm_table = '';
					self.report.sysparm_query = '';
					self.report.sysparm_custom_config = {};
					resetAllDotWalking();
					self.report.sysparm_report_source_id = '';
					self.report.sysparm_metric_table = '';
					self.selectedSourceObj.table = '';
					if (self.report.sysparm_source_type === sourceTypeNames.metricBase) {
						self.setChartType(typeLogic.defaultChartTypes[sourceTypeNames.metricBase]);
						self.report.sysparm_set_color = 'color_palette';
					}
				} else {
					reloadDotWalking();
					self.runReport();
				}
				copyReportToBeforeChanges();
			});
		}
	};
	this.switchToOldBuilder = function switchToOldBuilder(checkUnsavedChanges) {
		self.Piwik.trackEvent('Action', 'switch to classic UI');
		if (isModelChanged(checkUnsavedChanges)) {
			self.callbackMethodParms = [false];
			self.callbackMethod = self.switchToOldBuilder;
			$j(modals.unsavedDialogConfirmation).modal('show');
		} else {
			cleanCallBack();
			setPreference('reporting_new_report_designer', 'false', utils.reloadPage);
		}
	};
	this.openConfigureAliasesModal = function openConfigureAliasesModal(checkUnsavedChanges) {
		if (isModelChanged(checkUnsavedChanges)) {
			self.callbackMethodParms = ['configureAliases'];
			self.callbackMethod = self.openModal;
			$j(modals.unsavedSaveDialogAliases).modal('show');
		} else {
			cleanCallBack();
			self.openModal('configureAliases');
		}
	};
	this.openFunctionFieldModal = function openFunctionFieldModal(checkUnsavedChanges) {
		if (isModelChanged(checkUnsavedChanges)) {
			self.callbackMethodParms = ['configureFunctionField'];
			self.callbackMethod = self.openModal;
			$j(modals.unsavedSaveDialogFuncField).modal('show');
		} else {
			cleanCallBack();
			self.openModal('configureFunctionField');
		}
	};
	this.deleteDataSet = function deleteDataSet(showDialog, datasetSysId) {
		if (showDialog) {
			self.datasetSysId = datasetSysId;
			$j(modals.deleteDatasetDialogConfirmation).modal('show');
		} else
			deleteDataSetAjax(self.datasetSysId).then(function deleteDataSetAjaxCb() {
				self.treeNavShown = false;
				self.openMainSerie();
			});
	};
	this.openDrilldown = function openDrilldown(drilldownSysId, checkUnsavedChanges) {
		self.Piwik.trackEvent('Report Structure', 'open drilldown');
		if (isModelChanged(checkUnsavedChanges)) {
			self.callbackMethodParms = [drilldownSysId, false];
			self.callbackMethod = self.openDrilldown;
$j(modals.unsavedDialogConfirmation).modal('show');
		} else {
			resetToMainState();
			reloadDotWalking();
			utils.resetSelect2();
			if (!drilldownSysId)
				self.dataChanged = false;
			self.reportHasRun = false;
			cleanCallBack();
			setIsDrilldownOrDataset(true, false, drilldownSysId);
			togglePanels();
			utils.clearMultipivotDisplayFields();
			setModel().then(function setModelCb() {
				self.treeNavShown = false;
				self.activeMenuTab = 'data';
				setTitleDesigner();
				setDrillableOptions();
				return setColumnsFromTable();
			}).then(function setModelCb() {
				if (drilldownSysId)
					self.runReport();
copyReportToBeforeChanges();
			});
		}
	};
	this.deleteDrilldown = function deleteDrilldown(showDialog, drilldownSysId) {
		if (showDialog) {
			$j(modals.deleteDrilldownDialogConfirmation).modal('show');
			self.drilldownSysId = drilldownSysId;
		} else
			deleteDrilldownAjax(self.drilldownSysId).then(function afterDd() {
self.treeNavShown = false;
				self.openMainSerie();
			});
	};
	this.openMainSerie = function openMainSerie(checkUnsavedChanges, isMainSerieActive) {
		self.Piwik.trackEvent('Report Structure', 'open main series');
		if (isModelChanged(checkUnsavedChanges)) {
			self.callbackMethodParms = [false];
			self.callbackMethod = self.openMainSerie;
			$j(modals.unsavedDialogConfirmation).modal('show');
		} else {
			self.reportHasRun = false;
			setMainDatasetState();
			getBreadcrumbsTree().then(function getBcTreeCb() {
				setIsDrilldownOrDataset(false, false);
				self.isSavingDrilldown = false;
				self.isSavingDataset = false;
				togglePanels();
				utils.clearMultipivotDisplayFields();
				setModel().then(function setModelCb() {
					self.activeMenuTab = 'data';
self.treeNavShown = false;
					reloadDotWalking();
					if (self.report.sysparm_report_id)
						self.designerMode = gReport.i18n.editReport;
					else
						self.designerMode = gReport.i18n.createReport;
					return setColumnsFromTable();
				}).then(function runCb() {
					self.runReport(isMainSerieActive);
					copyReportToBeforeChanges();
				});
			});
		}
	};
	this.saveDataset = function saveDataset(stay) {
if (!isValid())
			return;
		if (self.isSavingDataset) {
			var deferred = $q.defer();
			deferred.resolve();
			return deferred.promise;
		}
		self.isSavingDataset = true;
		self.notify.close();
		var queryParams = '&sys_id=' + gReport.sysId + '&sysparm_report_layer_id=' + self.datasetSysId;
		if (self.selectedSourceTypeObj.name === sourceTypeNames.metricBase)
			self.report.sysparm_custom_config = utils.buildCustomConfig(self.report);
		return postDrillDownDatasetAjax(endpoint.saveDatasetUrl + queryParams, self.report).then(function postDdCb() {
			if (!stay)
				self.openMainSerie();
			else
				self.isSavingDataset = false;
		});
	};
	this.saveDrilldown = function saveDrilldown(stay) {
		if (self.isSavingDrilldown) {
			var deferred = $q.defer();
			deferred.resolve();
			return deferred.promise;
		}
		self.isSavingDrilldown = true;
		self.notify.close();
		var queryParams = '&sys_id=' + self.drilldownSysId + '&sysparm_report_id=' + gReport.sysId;
		variables.normalizeVariables(self.report);
		var payload = {
			report: self.report,
			sharing: self.sharing
		};
		return postDrillDownDatasetAjax(endpoint.saveDrilldownUrl + queryParams, payload).then(function postDdCb() {
			if (!stay)
				self.openMainSerie();
			else {
				self.isSavingDrilldown = false;
				setIsDrilldownOrDataset(true, false, self.report.sysparm_report_id);
				copyReportToBeforeChanges();
			}
		});
	};
	this.isTabDisabled = function isTabDisabled(tabName) {
		if (!self.report.sysparm_table)
			return true;
		if (tabName === 'type' || tabName === 'configure') {
			if (self.isMain)
				return !self.report.sysparm_title;
return false;
		} else if (tabName === 'style') {
			if (!self.types.isStyleable() || (self.isMain && !self.report.sysparm_title))
				return true;
			return false;
		}
		return null;
	};
	this.openTab = function openTab(currentTab, activeTab, isNext) {
		if (activeTab === 'activeStyleTab')
			self.Piwik.trackEvent('Style Tab', currentTab);
		else if (activeTab === 'activeAxisTab')
			self.Piwik.trackEvent('Axis Tab', currentTab);
		else
			self.Piwik.trackEvent('Menu Tab', currentTab);
		if (currentTab === self[activeTab])
			return;
		if (activeTab === 'activeOriginPane')
			clearSource();
		if (isNext)
			self.runReport();
		self[activeTab] = currentTab;
		switch (currentTab){
			case 'data':
				utils.alertScreenReader(getMessage('Data tab is open'));
				break;
			case 'type':
				utils.alertScreenReader(getMessage('Type tab is open'));
				break;
			case 'configure':
				utils.alertScreenReader(getMessage('Configuration tab is open'));
				break;
			case 'style':
				utils.alertScreenReader(getMessage('Style tab is open'));
				break;
		}
	};
	function clearSource() {
		self.report.sysparm_table = '';
		self.report.sysparm_field_list = '';
		self.report.sysparm_field = '';
		self.report.sysparm_stack_field = '';
		self.report.sysparm_trend_field = '';
		self.report.sysparm_query = '';
		self.report.sysparm_report_source_id = '';
		self.report.sysparm_custom_config = buildEmptyMetricConfig();
		self.selectedTableObj = {};
		self.selectedSourceObj = {};
		self.selectedMetricBaseObj = {};
		self.tableDescription = '';
angular.element('#chart-container').empty();
		utils.resetSelect2();
	}
	function onSourceChanged(source, showMessage, fromUrl) {
		self.dataChanged = true;
		if (!fromUrl) {
			clearSource();
			resetAllDotWalking();
		}
		var dataSource = queryDataSource(source);
		self.selectedSourceObj = $filter('filter')(self.sourceType.sources, {value: source}, true)[0];
		self.report.sysparm_table = dataSource.table;
		self.report.report_source_query = dataSource.filter;
		self.report.sysparm_report_source_id = source;
		getTableDescription();
		if (!fromUrl) {
			setColumnsFromTable().then(function setColumnsFromTableCb() {
				setTable(true);
				getListCols();
			});
		}
		if (showMessage)
			self.toggleFuncFieldButton();
		return getReportSourceInfo(showMessage);
	}
	this.toggleFuncFieldButton = function toggleFuncFieldButton() {
		var self = this;
		if (self.isDataset || self.isDrilldown) {
			self.isFuncFieldEnabled = false;
			self.canShowFunctionField = false;
			return;
		}
		var config = {
			params: {
				sysparm_report_source_id: self.report.sysparm_report_source_id,
				sysparm_source_type: (self.isNew && !self.report.sysparm_source_type) ? self.selectedSourceTypeObj.name : self.report.sysparm_source_type,
				sysparm_table: self.report.sysparm_table,
			}
		};
		if (self.hasAccessToFunctionField && (self.report.sysparm_table || self.report.sysparm_report_source_id)) {
			funcFieldService.isFuncFieldEnabled('', config).then(function onSucess(response) {
				self.isFuncFieldEnabled = response && response.data && response.data.result && response.data.result.canAccess;
				self.canShowFunctionField = true;
			}).catch(function onErr() {
				console.error("Issue while enabling function-field button in RD");
			});
		}
	};
	this.sourceChanged = function sourceChanged(source) {
		onSourceChanged(source, true, false);
	};
	this.sourceTypeChanged = function sourceTypeChanged() {
self.notify.message = '';
		self.Piwik.trackEvent('Action', 'source type changed to ' + self.selectedSourceTypeObj.name);
		if (self.selectedSourceTypeObj.name === sourceTypeNames.reportSource)
			setSources();
		else if (self.selectedSourceTypeObj.name === sourceTypeNames.table) {
		} else if (self.selectedSourceTypeObj.name === sourceTypeNames.metricBase)
			setMetricBaseTables().then(function setTablesFromSourceTypeMetricMap() {
				self.tables = self.sourceType.metric;
			});
		else
			setImportTables();
		if (!self.isDataset)
			if (self.report.sysparm_source_type) {
				if (typeLogic.shouldResetChartType(self.report.sysparm_source_type, self.selectedSourceTypeObj.name))
					this.setChartType(typeLogic.defaultChartTypes[self.selectedSourceTypeObj.name]);
			} else
				this.setChartType(typeLogic.defaultChartTypes[self.selectedSourceTypeObj.name]);
		self.report.sysparm_source_type = self.selectedSourceTypeObj.name;
		self.toggleFuncFieldButton();
		updateSourceTypeDependentElements();
		clearSource();
	};
	function updateSourceTypeDependentElements() {
		setDrillableOptions();
		self.filterConfig.sortFilter = typeLogic.canBeSorted(self.selectedSourceTypeObj.name, self.report.sysparm_type);
	}
	function queryDataSource(source) {
		var gr = new GlideRecord('sys_report_source');
		gr.get(source);
		return gr;
	}
	this.tableChanged = function tableChanged(table) {
		self.dataChanged = true;
		clearSource();
		resetAllDotWalking();
		if (self.selectedSourceTypeObj.name == self.sourceTypeNames.table) {
			self.report.sysparm_table = table.id;
			self.report.sysparm_table_display_value = table.text;
			self.selectedTableObj = {name: table.text};
		} else {
self.selectedTableObj = $filter('filter')(self.tables, function filterTableCb(item) { return item.name === table; })[0];
			self.report.sysparm_table = table;
		}
		setColumnsFromTable().then(function setColsCb() {
			setTable();
			getListCols();
		});
		getTableDescription();
		self.toggleFuncFieldButton();
	};
	this.setChartType = function setChartType(chartType) {
		types.setType(chartType);
		if (types.isTabularType()) {
resetAllDotWalking({sysparm_field: true});
			reloadDotWalking();
		}
		$timeout(function timeoutCb() {
			if (types.shouldResetShowZeroToTrue(chartType))
				self.report.sysparm_show_zero = true;
			if (!types.hasDisplayGrid())
				self.report.sysparm_display_grid = false;
			self.report.sysparm_type = chartType;
			self.activeStyleTab = 'general';
if (!types.hasGeneralStyleOptions())
self.activeStyleTab = 'title';
			return setColumnsFromTable();
		}).then(function setChartTypeCb() {
			setDrillableOptions();
			resetChartTypeOptions();
		});
	};
	function reloadDotWalking() {
		$timeout(function delayEvent() {
$rootScope.$broadcast('sn.dot_walk:removeCache');
			$rootScope.$broadcast('sn.dot_walk:reload');
		}, 1000);
	}
	function resetAllDotWalking(fieldsToOmit) {
		if (!fieldsToOmit) {
			self.report.sysparm_field = '';
			self.report.sysparm_field_name = '';
		}
		self.report.sysparm_stack_field = '';
		self.report.sysparm_stack_field_name = '';
		self.report.sysparm_ct_row = '';
		self.report.sysparm_ct_row_name = '';
		self.report.sysparm_ct_column = '';
		self.report.sysparm_ct_column_name = '';
		self.report.sysparm_trend_field = '';
		self.report.sysparm_trend_field_name = '';
		self.report.sysparm_sumfield = '';
		self.report.sysparm_sumfield_type = '';
		self.report.sysparm_sumfield_name = '';
		self.report.sysparm_cal_field = '';
		self.report.sysparm_cal_field_name = '';
		self.report.sysparm_box_field = '';
		self.report.sysparm_box_field_name = '';
		self.report.sysparm_x_axis_category_fields = '';
		self.report.sysparm_y_axis_category_fields = '';
utils.clearMultipivotDisplayFields();
	}
	function resetChartTypeOptions() {
		if (types.hasColorFields()) {
			var setColorChoice = self.report.sysparm_set_color;
			if (self.selectedSourceTypeObj.name === sourceTypeNames.metricBase && self.recentSourceType !== sourceTypeNames.metricBase)
				setColorChoice = 'color_palette';
			self.report.sysparm_set_color = setColoring(setColorChoice);
		}
		self.report.sysparm_show_zero = types.isScoreType();
		if (types.isMapType()) {
			self.report.sysparm_use_color_heatmap_map = true;
			self.report.sysparm_show_chart_data_label = true;
		} else
			self.report.sysparm_use_color_heatmap_map = false;
		self.filterConfig.sortFilter = typeLogic.canBeSorted(self.selectedSourceTypeObj.name, self.report.sysparm_type);
	}
	this.isTypeVisibleInADataset = types.isTypeVisibleInADataset;
	this.isTimeSeriesTypeVisibleInADataset = types.isTimeSeriesTypeVisibleInADataset;
	this.isBarTypesVisibleInADataset = types.isBarTypesVisibleInADataset;
	this.submitSidebarForm = function submitSidebarForm(sidebarForm) {
		this.sidebarForm = sidebarForm;
	};
	this.waitForFieldsLoaded = function waitForFieldsLoaded() {
		return ((types.requiresGroupByValue() && !self.report.sysparm_field) || (types.isSimpleTabularType() && !self.report.sysparm_ct_row) || (types.isTrendType() && !self.report.sysparm_trend_field)) && !(self.selectedSourceTypeObj.name === sourceTypeNames.metricBase);
	};
	this.afterSavingAliases = function afterSavingAliases(success, message) {
		if (success) {
			if (self.report.sysparm_apply_alias)
				self.runReport(true);
			utils.showMessage(message, utils.msgType.type_info);
		} else
			utils.showMessage(message, utils.msgType.type_error);
	};
	this.afterApplyingFormatting = function afterApplyingFormatting(success, formattingConfiguration, message) {
		if (success) {
			self.report.sysparm_formatting_configuration = formattingConfiguration;
			self.runReport(true);
			utils.showMessage(message, utils.msgType.type_info);
		} else
			utils.showMessage(message, utils.msgType.type_error);
	};
	this.isAliasesConfigurable = function isAliasesConfigurable() {
		var isMultiPivot = self.types.getType() === self.chartTypeNames.MULTIPIVOT;
		var isList = self.types.getType() === self.chartTypeNames.LIST;
		if (isMultiPivot && self.report.sysparm_x_axis_category_fields && self.report.sysparm_y_axis_category_fields)
			return true;
		if (isList && self.report.sysparm_field_list)
			return true;
		return false;
	};
	this.openConfigureFormattingModal = function openConfigureFormattingModal() {
		cleanCallBack();
		var aggregationField = self.report.sysparm_sumfield;
		var aggregationFieldDisplayValue = self.report.sysparm_sumfield_name;
		if (self.report.sysparm_aggregate === 'COUNT') {
			aggregationField = '$COUNT_FIELD$';
			aggregationFieldDisplayValue = $filter('i18n')('format_display_value_for_count_aggregation');
		} else if (self.report.sysparm_aggregate === 'COUNT(DISTINCT')
			aggregationField = '$COUNT_FIELD$';
		self.report.formattingProperties = {
			reportFields: {
				reportType: self.types.getType().toUpperCase(),
				table: self.report.sysparm_table,
				fieldConfigurations: [
					{
						fieldName: aggregationField,
						display: aggregationFieldDisplayValue,
						configurationType: 'AGGREGATION'
					}
				],
			},
			formattingConfiguration: self.report.sysparm_formatting_configuration
		};
		this.loadFormatting = this.loadFormatting + 1;
		self.openModal('formatView');
	};
	function appendAriaLabelledbyAttributes(elementId, attributeList) {
		let ariaLabelledbyAttribute = angular.element('#' + elementId).attr('aria-labelledby');
		if (ariaLabelledbyAttribute) {
			for (let i = 0; i < attributeList.length; i++) {
				if (ariaLabelledbyAttribute.indexOf(attributeList[i]) < 0) {
					ariaLabelledbyAttribute = ariaLabelledbyAttribute + ' ' + attributeList[i];
				}
			}
			angular.element('#' + elementId).attr('aria-labelledby', ariaLabelledbyAttribute);
		}
		ariaLabelledbyAttribute = angular.element('#' + elementId).attr('aria-labelledby');
	}
	this.runReport = function runReport(forceRun, action) {
		if (typeof action !== 'undefined')
			self.Piwik.trackEvent('Action', action);
if (action && action === 'run')
			self.showNlqComponentCB = false
		self.reportHasRun = true;
		self.nlqNotUnderstood = false;
		self.nlqRestrictedData = false;
		self.nlqError = false;
		var isCurrentReportAndLastRunReportEqual = utils.areObjectsEqualUsingSourceType(self.report, lastRanReport, self.report.sysparm_source_type);
		if ((!self.report.sysparm_table || isCurrentReportAndLastRunReportEqual || self.editMode) && !forceRun && !self.report.sysparm_interactive_report){
			if (self.editMode && !isCurrentReportAndLastRunReportEqual)
				$j('#report-container-builder').html('');
			return;
		}
		if (self.waitForFieldsLoaded())
			return;
if (!isValid())
			return;
		if (((types.requiresGroupByValue() && !self.report.sysparm_field) || (types.isSimpleTabularType() && !self.report.sysparm_ct_row) || (types.isTrendType() && !self.report.sysparm_trend_field)) && !(self.selectedSourceTypeObj.name === sourceTypeNames.metricBase)) {
			alert(gReport.i18n.waitForFieldsLoaded);
			return;
		}
		getReferenceValues();
		self.report.sysparm_source_type = self.selectedSourceTypeObj.name;
		var reportToRun = angular.copy(self.report);
		lastRanReport = angular.copy(self.report);
		self.isFullWidth = types.isFullWidth(reportToRun.sysparm_type);
		if (gReport.sysId)
			reportToRun.sysparm_report_id = gReport.sysId;
		if (self.isDataset || self.isDrilldown)
reportToRun.sysparm_report_id = '';
		if (self.isDrilldown && self.drilldownSysId)
			reportToRun.sysparm_report_id = self.drilldownSysId;
		self.notify.close();
		for (var key in reportToRun)
			if (reportToRun[key] === null)
				reportToRun[key] = '';
		filterData.getBreadcrumb(reportToRun.sysparm_table, reportToRun.sysparm_query).then(function filterCb(breadcrumbs) {
			self.breadcrumbs = breadcrumbs;
		});
if (!self.isDataset)
			reportToRun.sysparm_show_y_axis = true;
		variables.normalizeVariables(reportToRun);
		reportToRun.sysparm_refresh = gReport.sysparm_refresh;
		if (chartTypeNames.SINGLE_SCORE === types.currentType) {
			if (window.chartHelpers.systemParams.enableNewVisualization === 'true' && window.paRenderReportingVisual) {
var singleScoreElement = '<pa-react-wrapper type="/widgets/reporting-single-score" sys-id="' + gReport.sysId + '" style="height: 100%" />';
				$j('#report-container-builder').html(singleScoreElement);
				window.paRenderReportingVisual();
} else
				new SingleScore('builder', 'run', utils.setupReportParams(reportToRun));
		} else if (chartTypeNames.MULTIPIVOT === types.currentType)
			new MultilevelPivot('builder', 'run', utils.setupReportParams(reportToRun));
		else if (chartTypeNames.CALENDAR === types.currentType) {
if (reportToRun.sysparm_table)
$j('#report-container').removeClass('ng-hide');
			new Calendar('builder', 'run', utils.setupReportParams(reportToRun));
		} else if (types.isJellyRunType())
			embedReportByParams(angular.element('#report-container-builder'), reportToRun);
else
			runReportFromBuilder('builder', true, utils.setupReportParams(reportToRun), null, forceRun);
	};
	this.publish = function publish(toBePublished) {
		if (gReport.sysId) {
			var action = toBePublished ? 'publish' : 'unpublish';
			var url = endpoint.getUrl + action + '&sys_id=' + gReport.sysId;
			self.Piwik.trackEvent('Action', action);
			return cancelation.cancelRunReport().then(function(response) {
				return server.get(url).then(function getPublishCb(resp) {
					if (resp.status === defaults.statuses.success) {
						self.isPublished = toBePublished;
						self.publishStatus = action;
						if (self.report)
							self.report.sysparm_is_published = toBePublished;
					} else if (resp.status === defaults.statuses.failure) {
						self.isPublished = !toBePublished;
						self.notify.type = 'error';
						self.notify.message = resp.message;
					}
				});
			});
		}
		return null;
	};
	this.copyPublishedURLToClipboard = function copyPublishedURLToClipboard() {
		if (self.isPublished && window.NOW.g_clipboard) {
			self.Piwik.trackEvent('Action', 'copy url');
			window.NOW.g_clipboard.copyToClipboard(gReport.urlOverride + 'sys_report_display.do?sysparm_report_id=' + gReport.sysId);
		}
	};
	this.goBack = function goBack(checkUnsavedChanges) {
		if (isModelChanged(checkUnsavedChanges)) {
self.callbackMethodParms = [false];
			self.callbackMethod = self.goBack;
			$j(modals.unsavedDialogConfirmation).modal('show');
		} else
			utils.goBack();
	};
	function isValid() {
if ($scope.sidebarForm && !$scope.sidebarForm.$valid) {
			self.notify.type = 'error';
			if ($scope.sidebarForm.$error.required)
				self.notify.message = gReport.i18n.mandatoryFieldsError;
else
				self.notify.message = gReport.i18n.invalidInputError;
			return false;
		}
		return true;
	}
	this.invalidateSidebarForm = function() {
		$scope.sidebarForm.$valid = false;
	};
	this.saveReport = function saveReport(insert, redirectBack, redirectHome, callBackSuccess, callBackSuccessArgs) {
		var queryParams;
if (!isValid())
			return;
		self.showNlqComponentCB = false;
		self.Piwik.trackEvent('Action', 'save');
		utils.setPageTitle(self.report.sysparm_title);
		self.report.sysparm_source_type = self.selectedSourceTypeObj.name;
		if (self.selectedSourceTypeObj.name === sourceTypeNames.metricBase)
			self.report.sysparm_custom_config = utils.buildCustomConfig(self.report);
		if (gReport.extraAction)
			redirectBack = true;
		if (self.isPublished)
			self.sharing.roles.push({name: 'public'});
		else
			self.sharing.roles = self.sharing.roles.filter(function filterRolesCb(entry) {
				return entry.name !== 'public';
			});
		if (!self.isDrillable)
self.report.sysparm_set_redirect = {};
		getReferenceValues();
		variables.normalizeVariables(self.report);
		setAggregatePercentForPieReport();
		var payload = {
			report: self.report,
			sharing: self.sharing
		};
		if (self.report.sysparm_source_type === sourceTypeNames.table)
self.report.sysparm_report_source_id = '';
		self.notify.close();
		if (gReport.sysId) {
			queryParams = '&sys_id=' + gReport.sysId;
if (insert) {
				queryParams += '&isInsert=true';
				if (!self.isNew && !self.access.write && self.access.create)
					self.sharing.user = self.access.user_id;
			}
} else
			queryParams = '';
		if (gReport.recordScope)
			queryParams += '&sysparm_record_scope=' + gReport.recordScope;
		queryParams += ('&extraAction=' + gReport.extraAction);
		return cancelation.cancelRunReport().then(function(response) {
			return server.post(endpoint.saveUrl + queryParams, payload).then(function postCb(resp) {
				if (resp.status === defaults.statuses.success) {
					self.report.sysparm_report_id = resp.data.sysparm_report_id;
					gReport.sysId = self.report.sysparm_report_id;
					self.report.sysparm_title = resp.data.sysparm_title;
					self.report.sysparm_report_use_temporary_table = resp.data.sysparm_report_use_temporary_table;
					self.report.sysparm_is_using_database_view = resp.data.sysparm_is_using_database_view;
					self.created_by = resp.data.created_by_user;
					if (resp.data.sysparm_report_drilldown) self.report.sysparm_report_drilldown = resp.data.sysparm_report_drilldown;
					if (self.isNew || insert)
						utils.setSavedUrl(self.report.sysparm_report_id, self.report.sysparm_title);
					self.isNew = false;
					self.access = resp.data.access;
					if (insert) {
						self.isPublished = false;
						self.sharing.groups = [];
						self.sharing.roles = [];
						self.sharing.users = [];
						self.sharing.user = self.access.user_id;
						utils.cleanMultiSelectValues('sys_report_users_groups\\.group_id');
						utils.cleanMultiSelectValues('sys_report_roles\\.role_id');
						utils.cleanMultiSelectValues('sys_report_users_groups\\.user_id');
					}
					setSharingSettings();
					if (resp.data.sysparm_report_use_temporary_table)
						utils.showMessage(resp.data.sysparm_report_use_temporary_table_msg, utils.msgType.type_info, 10000);
					if (resp.data.sysparm_report_msgs)
						utils.showMessages(resp.data.sysparm_report_msgs);
					if (resp.message)
						utils.showMessage(resp.message);
					self.designerMode = gReport.i18n.editReport;
					if (callBackSuccess)
						if (callBackSuccessArgs)
callBackSuccess.apply(self, callBackSuccessArgs);
						else
							callBackSuccess();
					if (redirectBack)
						utils.goBack();
					if (redirectHome)
$window.location.href = '/report_home.do';
					self.saveMenuShown = false;
					copyReportToBeforeChanges();
					self.savedMain = angular.copy(self.report);
					if (insert && !redirectBack && !redirectHome) {
						var $navMessage = $j('#nav_message');
						if ($navMessage)
							$navMessage.remove();
					}
				} else if (resp.message) {
					self.notify.type = 'error';
					self.notify.message = resp.message;
				}
			}).then(function getTreeCb() {
				getBreadcrumbsTree();
			}).then(function runCb() {
				self.runReport();
			});
		});
	};
	this.deleteReport = function deleteReport() {
		self.Piwik.trackEvent('Action', 'delete');
		var queryParams = gReport.sysId;
		if (gReport.recordScope)
			queryParams += '&sysparm_record_scope=' + gReport.recordScope;
		return cancelation.cancelRunReport().then(function(response) {
			return server.get(endpoint.deleteUrl + queryParams).then(function getDeleteCb(resp) {
				if (resp.status === defaults.statuses.success)
					utils.goBack(gReport.i18n.reportDeleted + ' ' + self.report.sysparm_title);
				else {
					self.notify.type = 'error';
					self.notify.message = gReport.i18n.reportNotDeleted;
				}
			});
		});
	};
	this.saveReportSource = function saveReportSource() {
		self.Piwik.trackEvent('Action', 'save as data source');
var d = new GlideModalForm(gReport.i18n.createNewReportSource, 'sys_report_source', function cb() {});
		d.setPreference('focusTrap', true);
		d.setPreference('sys_id', '-1');
		d.setPreference('sysparm_query', 'table=' + self.report.sysparm_table + '^filter=' + utils.encodeFilter(self.report.sysparm_query));
		d.render();
	};
	this.setUrlRedirect = function() {
		self.Piwik.trackEvent('Report Structure', 'set redirect url');
		$j(modals.redirectToUrlDialog).modal('show');
	};
	this.shareReport = function shareReport(showDialog) {
		self.Piwik.trackEvent('Action', 'share');
		if (showDialog)
			$j(modals.shareReportSaveDialog).modal('show');
		else if (self.isNew)
			this.saveReport(false, false, false, self.shareReport);
		else {
			$j(modals.sharing).modal('show');
			$j(modals.sharing).escape(function escapeCb() {
				$j(modals.sharing).modal('hide');
				setTimeout(function timeoutCb() {
					$j('#report-sharing').focus();
}, 50);
			}, true);
			setTimeout(function timeoutCb() {
				if (self.sharing.user === self.access.user_id)
					angular.element('#me-radio').focus();
				else if (self.sharing.user === 'GLOBAL')
					angular.element('#everyone-radio').focus();
				else
					angular.element('#group-radio').focus();
				toggleGlideListIcons('sys_report_roles.role_id', false);
				toggleGlideListIcons('sys_report_users_groups.group_id', false);
				toggleGlideListIcons('sys_report_users_groups.user_id', false);
}, 50);
		}
	};
	this.newSchedule = function newSchedule(showDialog) {
		self.Piwik.trackEvent('Action', 'schedule');
		if (types.getType() === chartTypeNames.MULTIPIVOT && !gReport.isWHTPActive) {
			alert(gReport.i18n.whtpRequired);
			return;
		}
		if (showDialog)
			$j(modals.sheduleReportSaveDialog).modal('show');
		else if (self.isNew)
			this.saveReport(false, false, false, self.newSchedule);
		else {
			var params = ['name=' + gReport.i18n.scheduledExecutionOf + ' ' +
			self.report.sysparm_title, 'report=' + self.report.sysparm_report_id];
			utils.openForm(gReport.i18n.scheduledEmailOfReport, 'sysauto_report', params, self.setIsScheduleTrue, true);
		}
	};
	this.setIsScheduleTrue = function setIsScheduleTrue() {
		self.isScheduled = true;
		self.scheduleReportDescription = self.isScheduled ? gReport.i18n.scheduleReportAdded : gReport.i18n.scheduleReport;
		$scope.$apply();
	};
	this.toggleCheckbox = function toggleCheckbox(param, ev) {
		if (ev && ev.target.nodeName === 'LABEL')
			ev.preventDefault();
		self.report[param] = !self.report[param];
	};
	function bindHistorySidebarDOMChangesObserver() {
		const targetNode = document.getElementById("report-history-sidebar");
		const config = {attributes: true, childList: false, subtree: false};
		function focusOnInfo() {
			if (targetNode.classList.contains("active")) {
				document.querySelector("#info-popout-heading").focus();
			}
		}
		let t;
		const callback = () => {
			clearTimeout(t);
			t = setTimeout(focusOnInfo, 500);
		};
		const observer = new MutationObserver(callback);
		observer.observe(targetNode, config);
		this.historySidebarObserverBound = true;
	}
	this.toggleSidebar = function toggleSidebar(sidebar) {
		var prevState = self.sidebarShown || sidebar;
		if (!this.historySidebarObserverBound)
			bindHistorySidebarDOMChangesObserver.call(this);
		self.sidebarShown = (sidebar && sidebar !== self.sidebarShown) ? sidebar : false;
		var sidebarName = 'sidebar';
		if (typeof sidebar !== 'undefined')
			sidebarName = sidebar + ' sidebar';
		if (self.sidebarShown)
			self.Piwik.trackEvent('Action', 'show ' + sidebarName);
		else
			self.Piwik.trackEvent('Action', 'hide ' + sidebarName);
		if (self.sidebarShown === 'history')
			getReportHistory();
		if (!self.sidebarShown && prevState) {
			self.publishStatus = '';
			angular.element('#' + prevState + '-button').focus();
		}
	};
	this.toggleState = function toggleState(state, ev, name) {
		if (ev)
			ev.stopPropagation();
		cancelation.cancelRunReport().then(function runCancelled() {
			self[state] = !self[state];
			if (typeof name === 'undefined')
				return;
			if (self[state])
				self.Piwik.trackEvent('Action', 'show ' + name);
			else
				self.Piwik.trackEvent('Action', 'hide ' + name);
		});
	};
	this.toggleStateWithoutCancelRun = function toggleState(state, ev, name) {
		if (ev)
			ev.stopPropagation();
		self[state] = !self[state];
		if (typeof name === 'undefined')
			return;
		if (self[state])
			self.Piwik.trackEvent('Action', 'show ' + name);
		else
			self.Piwik.trackEvent('Action', 'hide ' + name);
	};
	this.toggleReportStructure = function toggleReportStructure(ev) {
		self.toggleState('treeNavShown', ev, 'report structure');
		$j('#open-tree-navigation-button').focus();
	};
	this.setModelProperty = function setModelProperty(key, value) {
		if (key === 'group_by')
			self.report.sysparm_field = value;
		else
			self.report[key] = value;
	};
	this.setValuesAndRetrieveHexColor = function setScoreColor(key, value) {
		if (key === 'sysparm_score_color' && value)
			getHexColor('sysparm_score_color', value);
		if (key === 'sysparm_chart_title_color' && value)
			getHexColor('sysparm_chart_title_color', value);
		this.setModelProperty(key, value);
	};
	this.setStartTimeModelProperty = function setStartTimeModelProperty(value) {
		this.setModelProperty('sysparm_start_time', value);
	};
	this.setEndTimeModelProperty = function setStartTimeModelProperty(value) {
		this.setModelProperty('sysparm_end_time', value);
	};
	this.updateAggregate = function updateAggregate() {
		self.report.sysparm_sumfield = '';
		self.report.sysparm_sumfield_type = '';
		self.report.sysparm_aggregation_source = 'no_override';
	};
	this.addReportTo = function addReportTo(showDialog, title) {
		self.Piwik.trackEvent('Action', title.toLowerCase());
		if (showDialog)
			$j(modals.addToDashboardReportSaveDialog).modal('show');
		else if (self.isNew)
this.saveReport(false, false, false, self.addReportTo, [false, title]);
		else {
			var gDialog = new GlideModal('dialog_add_report_widget');
			gDialog.setPreference('report_id', self.report.sysparm_report_id);
			gDialog.setPreference('report_title', self.report.sysparm_title);
			gDialog.setPreference('report_type', self.report.sysparm_type);
			gDialog.setPreference('is_using_database_view', self.report.sysparm_is_using_database_view);
			gDialog.setPreference('focusTrap', true);
			gDialog.setWidth('500');
			gDialog.setTitle(title);
			gDialog.render();
		}
	};
	this.getMainProperty = function getMainProperty(property) {
if (self.isMain)
			return self.report[property];
		return self.savedMain[property];
	};
	this.exportToPdf = function exportToPdf(showDialog) {
		var repParams;
		var dialog;
		var key;
		var exportType;
		var letterPageWidth = 792;
		var letterPageHeight = 612;
if (!isValid())
			return;
		if (types.getType() === chartTypeNames.MULTIPIVOT && !gReport.isWHTPActive) {
			alert(gReport.i18n.whtpRequired);
			return;
		}
		if (showDialog)
			$j(modals.exportToPdfReportSaveDialog).modal('show');
		else if (self.isNew)
			this.saveReport(false, false, false, self.exportToPdf);
		else {
			self.Piwik.trackEvent('Action', 'export to pdf');
			exportType = types.getType() === chartTypeNames.MULTIPIVOT ? 'PDF-whtp' : 'unloadreport_pdf';
			repParams = '';
			for (key in self.report)
				if (self.report.hasOwnProperty(key) && self.report[key] !== null && typeof self.report[key] !== 'undefined' && key.startsWith('sysparm_'))
					if ((key === 'sysparm_custom_chart_height' || key === 'sysparm_custom_chart_width') && exportType === 'PDF-whtp') {
						var pivot = jQuery('#pivot_table');
						if (key === 'sysparm_custom_chart_width')
repParams += ';' + key + '=' + Math.max(letterPageWidth, pivot.width() + 60);
						else
repParams += ';' + key + '=' + Math.max(letterPageHeight, pivot.height() + 150);
					} else if (key === 'sysparm_custom_config')
						repParams += ';' + key + '=' + JSON.stringify(utils.buildCustomConfig(self.report));
					else if (key === 'sysparm_source_type')
						repParams += ';' + key + '=' + self.selectedSourceTypeObj.name;
					else {
						if (key === 'sysparm_compute_percent')
							setAggregatePercentForPieReport();
						var paramValue = self.report[key].toString();
if (exportType === 'PDF-whtp' && (key == 'sysparm_title' || key == 'sysparm_chart_title'))
paramValue = paramValue.replace(/[&<>;]/g, '');
						repParams += ';' + key + '=' + paramValue;
					}
			dialog = new window.GwtReportExportScheduleDialog(self.report.sysparm_report_id, exportType, repParams, 'true');
			dialog.execute();
			$j('#export_schedule_dialog').escape(dialog.close, true);
		}
	};
	this.openImportModal = function openImportModal() {
		self.importButtonVisible = true;
		this.openModal('importModal');
	};
	this.closedImportModal = function closedImportModal() {
		self.importButtonVisible = false;
		if (!$scope.$$phase)
			$scope.$digest();
	};
	this.importTableUploaded = function importTableUploaded(response) {
		if (!self.sourceType.import)
			self.sourceType.import = [];
		if (response.edit)
			angular.forEach(self.sourceType.import, function eachTable(element, index) {
				if (element.name === response.old.tablename)
					self.sourceType.import.splice(index, 1);
			});
		self.sourceType.import.push({
			label: response.result.name,
			name: response.result.table,
		});
		self.sourceType.import.sort(function sort(a, b) {
			return a.label < b.label ? -1 : 1;
		});
		self.report.sysparm_table = response.result.table;
		self.beforeChanges.sysparm_table = response.result.table;
		this.importTableChanged(self.report.sysparm_table);
	};
	this.importTableChanged = function importTableChanged(table) {
		setImportTables().then(function setExternalTablesInImportTableChanged() {
			self.selectedImportTableObj = $filter('filter')(self.sourceType.import, function filter(item) {
				return item.name === table;
			})[0];
		});
		clearSource();
		resetAllDotWalking();
		self.report.sysparm_table = table;
		self.report.sysparm_import_table = true;
		self.isImportTable = true;
		setColumnsFromTable().then(function setExternalColumnsFromTable() {
			setTable();
			getListCols();
			if (!self.isDataset && !self.waitForFieldsLoaded())
				self.runReport();
			$timeout(function afterDigest() {
				angular.element('#select-external').trigger('change');
			});
		});
	};
	this.isLegendTabShown = function() {
		return typeLogic.canShowLegendTab(self.selectedSourceTypeObj.name, self.report, self.isDataset);
	};
	function setDrillableOptions() {
		self.isDrillable = typeLogic.canDrilldown(self.selectedSourceTypeObj.name, self.getMainProperty('sysparm_type'));
		self.canAddDrill = false;
		if (self.isDrillable)
			if (self.isDrilldown && !self.drilldownSysId)
				self.canAddDrill = types.hasDrillDown(self.report.sysparm_type);
			else if (self.breadcrumbsTree.length) {
				var drilldowns = self.breadcrumbsTree[0].drilldowns;
				if (drilldowns.length)
					self.canAddDrill = types.hasDrillDown(drilldowns[drilldowns.length - 1].type);
				else
					self.canAddDrill = true;
			}
	}
	function setFieldsFromReportObject() {
		self.activeTreeItem = self.report.sysparm_report_id;
		self.selectedInterval = self.choice.interval[0];
		types.setType(self.report.sysparm_type);
		if (types.hasColorFields())
			self.report.sysparm_set_color = setColoring(self.report.sysparm_set_color);
		self.filterConfig.sortFilter = typeLogic.canBeSorted(self.selectedSourceTypeObj.name, self.report.sysparm_type);
	}
	function togglePanels() {
		self.filtersMenuShown = false;
		self.toggleSidebar();
	}
	function cleanCallBack() {
		self.callbackMethodParms = null;
		self.callbackMethod = null;
	}
	function setIsDrilldownOrDataset(isDrill, isDataset, sysId) {
		if (isDrill) {
			self.isDrilldown = true;
			self.drilldownSysId = sysId;
		} else {
			self.isDrilldown = false;
			self.drilldownSysId = '';
		}
		if (isDataset) {
			self.isDataset = true;
			self.datasetSysId = sysId;
		} else {
			self.isDataset = false;
			self.datasetSysId = '';
		}
		self.isMain = !isDrill && !isDataset;
	}
	function setTitleDesigner() {
if (self.isDrilldown)
			if (self.drilldownSysId)
				self.designerMode = gReport.i18n.editDrilldown;
			else
				self.designerMode = gReport.i18n.createDrilldown;
		else if (self.isDataset)
if (self.datasetSysId)
				self.designerMode = gReport.i18n.editDataset;
			else
				self.designerMode = gReport.i18n.createDataset;
	}
	function postDrillDownDatasetAjax(url, report) {
		getReferenceValues();
		return cancelation.cancelRunReport().then(function(response) {
			return server.post(url, report).then(function postCb(resp) {
				if (resp.status === defaults.statuses.success) {
					var data = resp.data;
					self.report.sysparm_report_id = data.sysparm_report_id;
					if (resp.message)
						utils.showMessage(resp.message);
				} else if (resp.message)
					utils.showMessage(resp.message, utils.MSG_TYPE_ERROR);
			});
		});
	}
	function setMainDatasetState(datasetSysId) {
		setIsDrilldownOrDataset(false, false);
		if (datasetSysId)
			gReport.sysId = datasetSysId;
	}
	function copyReportToBeforeChanges() {
		self.report.sysparm_query = self.report.sysparm_query.replace('^EQ^', '^');
		self.beforeChanges = angular.copy(self.report);
		self.beforeChangesSelectedTableObj = angular.copy(self.selectedTableObj);
		self.beforeChangesSelectedSourceObj = angular.copy(self.selectedSourceObj);
		self.beforeChangesSelectedImportTableObj = angular.copy(self.selectedImportTableObj);
		self.beforeChangesSelectedSourceTypeObj = angular.copy(self.selectedSourceTypeObj);
		self.tmpActiveMenuTab = self.activeMenuTab;
	}
	function resetToMainState() {
		if (self.isMain) {
			self.mainState = {};
			self.mainState.beforeChangesSelectedTableObj = angular.copy(self.selectedTableObj);
			self.mainState.beforeChangesSelectedSourceObj = angular.copy(self.selectedSourceObj);
			self.mainState.beforeChangesSelectedMetricBaseObj = angular.copy(self.selectedMetricBaseObj);
			self.mainState.beforeChangesSelectedSourceTypeObj = angular.copy(self.selectedSourceTypeObj);
			self.mainState.tmpActiveMenuTab = self.activeMenuTab;
		} else {
			self.beforeChanges = self.savedMain;
			self.beforeChangesSelectedTableObj = self.mainState.beforeChangesSelectedTableObj;
			self.beforeChangesSelectedSourceObj = self.mainState.beforeChangesSelectedSourceObj;
			self.beforeChangesSelectedMetricBaseObj = self.mainState.beforeChangesSelectedMetricBaseObj;
			self.beforeChangesSelectedSourceTypeObj = self.mainState.beforeChangesSelectedSourceTypeObj;
			self.tmpActiveMenuTab = self.mainState.tmpActiveMenuTab;
		}
	}
	function setTable(keepFilters) {
		instantiateConditionBuilder();
		if (!keepFilters)
			self.report.sysparm_query = '';
		refreshBreadcrumb();
	}
	function instantiateConditionBuilder() {
		self.filterConfig = defaults.filterConfig;
		self.initConditionBuilderDirective = false;
		$timeout(function() {
			self.initConditionBuilderDirective = true;
		});
	}
	function refreshBreadcrumb() {
		if (self.report.sysparm_table)
			filterData.getBreadcrumb(self.report.sysparm_table, self.report.sysparm_query).then(function getBcCallback(breadcrumbs) {
				self.breadcrumbs = breadcrumbs;
			});
	}
	function getReportSourceInfo(showMessage) {
		var url = endpoint.getUrl + 'getReportSourceInfo&reportSourceId=' + self.report.sysparm_report_source_id;
		return cancelation.cancelRunReport().then(function(response) {
			return server.get(url).then(function getSourceCb(resp) {
				if (resp.status === defaults.statuses.success) {
					var reportSourceInfo = resp.data;
					self.selectedSourceObj.table = reportSourceInfo.table;
					self.selectedSourceObj.filter = reportSourceInfo.filter;
					self.selectedSourceObj.description = reportSourceInfo.description ? reportSourceInfo.description : gReport.i18n.empty_report_source_description_text;
					if (resp.message && self.isMain && showMessage) {
						self.notify.type = 'info';
						self.notify.message = resp.message;
						self.notify.showLink = reportSourceInfo.show_link;
						self.notify.linkCallbackFunction = utils.openListReportsFromReportSource.bind(this, self.report.sysparm_report_source_id);
					}
				} else if (resp.status === defaults.statuses.failure && resp.message) {
					self.notify.type = 'error';
					self.notify.message = resp.message;
				}
				appendAriaLabelledbyAttributes('s2id_autogen2', ['data-source-label', 'table-description-panel']);
			});
		});
	}
	function setMetricBaseTables() {
		var deferred = $q.defer();
		if (!self.sourceType.metric.length) {
			self.loadingMetricBaseTables = true;
			if (gReport.metricBaseUseMocks === 'true') {
				self.sourceType.metric = mocks.metricBaseTables;
				self.loadingMetricBaseTables = false;
				deferred.resolve(mocks.metricBaseTables);
			} else {
				var url = endpoint.getMetricBaseTablesUrl;
				server.get(url).then(function getMetricCb(resp) {
					if (resp.result) {
						var data = resp.result;
						deferred.resolve(data);
						self.sourceType.metric = [];
						if (data)
							self.sourceType.metric = data;
					} else if (resp.message) {
						deferred.reject(resp.message);
						self.notify.type = 'error';
						self.notify.message = resp.message;
					}
					self.loadingMetricBaseTables = false;
				});
			}
		} else
			deferred.resolve();
		if (self.manualLabor)
			deferred.resolve();
		return deferred.promise;
	}
	function setSources() {
		var deferred = $q.defer();
		if (!self.sourceType.sources) {
			self.loadingSources = true;
			var url = endpoint.getSourcesUrl;
			server.get(url).then(function getSourcesCb(resp) {
				if (resp.status === defaults.statuses.success) {
					var data = resp.data;
					deferred.resolve(data);
					self.sourceType.sources = data.sources;
					utils.applySelect2();
				} else if (resp.message) {
					deferred.reject(resp.message);
					self.notify.type = 'error';
					self.notify.message = resp.message;
				}
				self.loadingSources = false;
			});
		} else
			deferred.resolve();
		return deferred.promise;
	}
	function setImportTables() {
		var deferred = $q.defer();
		if (!self.sourceType.import) {
			self.loadingImportTables = true;
			server.get(endpoint.getImportTablesUrl).then(function getImportTablesUrlDone(resp) {
				var data;
				if (resp.status === defaults.statuses.success) {
					data = resp.data;
					deferred.resolve(data);
					self.sourceType.import = data.tables;
					utils.applySelect2();
				} else if (resp.message) {
					deferred.reject(resp.message);
					self.notify.type = 'error';
					self.notify.message = resp.message;
				}
				self.loadingImportTables = false;
			});
		} else
			deferred.resolve();
		return deferred.promise;
	}
	function getReportHistory() {
		var url = endpoint.getUrl + 'getReportHistory&sysparm_report_id=' + self.report.sysparm_report_id;
		return cancelation.cancelRunReport().then(function(response) {
			return server.get(url).then(function getHistoryCb(resp) {
				if (resp.status === defaults.statuses.success) {
					self.history = resp.data;
					if (resp.message) {
						self.notify.type = 'success';
						self.notify.message = resp.message;
					}
				} else if (resp.message) {
					self.notify.type = 'error';
					self.notify.message = resp.message;
				}
			});
		});
	}
	function getBreadcrumbsTree() {
		var url = endpoint.getBreadcrumbsTreeUrl + '&sys_id=' + gReport.sysId;
		return cancelation.cancelRunReport().then(function(response) {
			return server.get(url).then(function getBreadcrumbsCb(resp) {
				if (resp.status === defaults.statuses.success) {
					self.breadcrumbsTree = resp.data.breadcrumbs;
					setDrillableOptions();
				} else if (resp.message) {
					self.notify.type = 'error';
					self.notify.message = resp.message;
				}
			});
		});
	}
	function deleteDataSetAjax(datasetSysId) {
		var url = endpoint.deleteDatasetUrl + '&report_layer_sys_id=' + datasetSysId;
		return cancelation.cancelRunReport().then(function(response) {
			return server.get(url).then(function getDatasetCb(resp) {
				if (resp.status === defaults.statuses.success) {
					if (resp.message)
						utils.showMessage(resp.message);
					self.datasetSysId = '';
				} else if (resp.message)
					utils.showMessage(resp.message, utils.msgType.type_default);
			});
		});
	}
	function deleteDrilldownAjax(drilldownSysId) {
		var url = endpoint.deleteDrilldownUrl + '&drilldown_sys_id=' + drilldownSysId;
		return cancelation.cancelRunReport().then(function(response) {
			return server.get(url).then(function getDrilldownCb(resp) {
				if (resp.status === defaults.statuses.success) {
					if (resp.message)
						utils.showMessage(resp.message);
					self.drilldownSysId = '';
				} else
					if (resp.message)
					utils.showMessage(resp.message, utils.msgType.type_default);
			});
		});
	}
	function getMapSources(table) {
		var url = endpoint.getUrl + 'getMapSources&table=' + table;
		return cancelation.cancelRunReport().then(function(response) {
			return server.get(url).then(function getMapSourcesCb(resp) {
				if (resp.status === defaults.statuses.success) {
					self.mapSources = resp.data;
					self.isPopulatedField.mapSources = true;
					if (resp.message) {
						self.notify.type = 'success';
						self.notify.message = resp.message;
					}
				} else if (resp.message) {
					self.notify.type = 'error';
					self.notify.message = resp.message;
				}
			});
		});
	}
	function getHexColor(vble, colorId) {
		var url = endpoint.getScoreColor + '?sysparm_query=sys_id=' + colorId;
		return cancelation.cancelRunReport().then(function(response) {
			return server.get(url).then(function getHexColorResponse(resp) {
				if (resp && resp.result)
					self.report[vble + '_hex'] = resp.result[0].color;
				else if (resp.message) {
					self.notify.type = 'error';
					self.notify.message = resp.message;
				}
			});
		});
	}
	function getMaps() {
		var url = endpoint.getUrl + 'getMaps';
		return cancelation.cancelRunReport().then(function(response) {
			return server.get(url).then(function getMapsCb(resp) {
				if (resp.status === defaults.statuses.success) {
					self.maps = resp.data;
					if (resp.message) {
						self.notify.type = 'success';
						self.notify.message = resp.message;
					}
				} else if (resp.message) {
					self.notify.type = 'error';
					self.notify.message = resp.message;
				}
			});
		});
	}
	function setSharingSettings() {
if (!self.sharing.user)
			self.sharing.user = self.access.user_id;
		utils.setMultiSelectValues(self.sharing.groups, 'select_0sys_report_users_groups\\.group_id');
		utils.setMultiSelectValues(self.sharing.roles, 'select_0sys_report_roles\\.role_id');
		utils.setMultiSelectValues(self.sharing.users, 'select_0sys_report_users_groups\\.user_id');
		self.sharingUtils.meAvailable = meAvailable();
	}
	function getSharingSettings() {
		self.sharing.groups = utils.getMultiSelectValues('select_0sys_report_users_groups\\.group_id');
		self.sharing.roles = utils.getMultiSelectValues('select_0sys_report_roles\\.role_id');
		self.sharing.users = utils.getMultiSelectValues('select_0sys_report_users_groups\\.user_id');
	}
	function meAvailable() {
		if ((self.sharing.user !== 'group' && self.sharing.user !== 'GLOBAL') || self.created_by === self.access.user_id || self.isNew)
			return true;
		return false;
	}
	this.sharingUtils.setTab = function setTab(tabName) {
		self.sharingUtils.activeGroupTab = tabName;
	};
	this.adjustFilter = function adjustFilter(breadcrumb, ev) {
		if (!self.breadcrumbs)
			return;
		var remove = ev.target.attributes.remove.value;
		var query = remove === 'true' ? breadcrumb.ifRemoved : breadcrumb.value;
		self.report.sysparm_query = query;
		self.runReport();
		$scope.$broadcast('snfilter:initialize_query', self.report.sysparm_query);
		angular.element('#open-filters-button').focus();
	};
	
	this.getIconPath = function getIconPath(type) {
		if (type === 'sysparm_type')
			type = self.getMainProperty(type);
		
var preFix = 'images/v2/';
		
		if (self.isPolarisOn) 
preFix += 'polaris/';
		
		var path = preFix + type + '.svg';
		return path;
	};
	function initializeFilterQuery() {
		$scope.$broadcast('snfilter:initialize_query', self.report.sysparm_query);
	}
	function attachFilterEvents() {
		snCustomEvent.observe('snfilter:activated', initializeFilterQuery);
		$scope.$on('snfilter:update_query', function updateCb(ev, query) {
			self.report.sysparm_query = query;
		});
		$scope.$root.$on('snfilter:get_meta_data', function conditionBuilderGettingMetaData(ev) {
			cancelation.cancelRunReport();
		});
		$scope.$on('snbreadcrumbs:toggle_filter', function toggleCb() {
			self.filtersMenuShown = false;
			angular.element('#open-filters-button').focus();
		});
	}
	function attachFocusTrapEvents() {
		angular.element('.rd-side-content .focus-reset-node').on('focus', function (event) {
			angular.element(event.target.parentElement).find('.rd-side-content-header .close-sidebar').focus();
		});
	}
	function changeFilters() {
if (self.report.sysparm_table)
			$scope.$broadcast('snfilter:update_table', {
				table: self.report.sysparm_table,
tableLabel: self.report.sysparm_table,
			});
	}
	function initFilters() {
		if (self.filtersInitialized)
			if (self.reinitializeFilters)
				initializeFilterQuery();
			else
				return changeFilters();
self.readyToShowFilters = true;
self.filtersInitialized = true;
self.reinitializeFilters = false;
		return null;
	}
	function setReferenceValues() {
		$j('.lightweight-reference.inline-form input').each(function eachCb() {
			var param = $j(this)[0].id.split('.');
			var sysparm = param[1];
			if (self.report[sysparm]) {
				$j('#' + sysparm).val(self.report[sysparm]);
				$j(this).val(self.report[sysparm + '_name']);
			}
		});
	}
	function getReferenceValues() {
		$j('.lightweight-reference.inline-form input').each(function eachCb() {
			var param = $j(this)[0].id.split('.');
			var sysparm = param[1];
			if ($j(this).val() || self.report[sysparm])
				self.report[sysparm] = $j('#' + param[1]).val();
		});
	}
	function resetChartColors(currentColorChoice, defaultColorChoice, excludedColorChoice) {
		var filterExpression = excludedColorChoice ? '!' + excludedColorChoice : defaultColorChoice;
		self.choice.set_color = $filter('filter')(allColorOptions, {value: filterExpression}, true);
		if (currentColorChoice && excludedColorChoice && currentColorChoice !== excludedColorChoice)
			return currentColorChoice;
		return defaultColorChoice;
	}
	function setColoring(color, defaultColorChoice) {
		if (self.selectedSourceTypeObj.name === sourceTypeNames.metricBase)
			return resetChartColors(color, 'color_palette', 'chart_colors');
		if (types.isLineType() || types.currentType === chartTypeNames.TREND) {
			if (self.report.sysparm_field)
				return resetChartColors(color, 'color_palette', 'one_color');
			return resetChartColors(color, 'one_color');
		}
		if (types.isBarType() || types.currentType === chartTypeNames.PARETO) {
			if (self.report.sysparm_stack_field)
				return resetChartColors(color, 'color_palette', 'one_color');
			var forcedColor = color;
			if (defaultColorChoice && !self.isDrilldown)
				forcedColor = defaultColorChoice;
			return resetChartColors(forcedColor, forcedColor, 'several_colors');
		}
		if (types.isPieType())
			return resetChartColors(color, 'color_palette', 'one_color');
		if (types.currentType === chartTypeNames.DIAL || types.currentType === chartTypeNames.LIST)
			return resetChartColors(color, 'one_color');
		return null;
	}
	$scope.$watchGroup([function groupFieldChange() {
		return self.report.sysparm_field;
	}, function stackFieldChange() {
		return self.report.sysparm_stack_field;
	}], function groupStackChanged(newValues, oldValues) {
self.activeStyleTab = 'general';
if (!types.hasGeneralStyleOptions())
self.activeStyleTab = 'title';
		if (!((newValues[0] && oldValues[0]) && (newValues[1] && oldValues[1])) && types.hasColorFields())
			var defaultColorChoice;
		if (typeof oldValues[0] !== 'undefined' || typeof oldValues[1] !== 'undefined')
			defaultColorChoice = newValues[1] ? 'color_palette' : 'one_color';
		self.report.sysparm_set_color = setColoring(self.report.sysparm_set_color, defaultColorChoice);
		if (self.isDataset && (self.savedMain.sysparm_type === chartTypeNames.BAR || self.savedMain.sysparm_type === chartTypeNames.HORIZONTAL_BAR)) {
			var mainField = self.savedMain.sysparm_field.substring(self.savedMain.sysparm_field.lastIndexOf('.'));
			var reportField = self.report.sysparm_field.substring(self.report.sysparm_field.lastIndexOf('.'));
			var mainFieldWithout_ = mainField.lastIndexOf('u_', 0) === 0 ? mainField.substring(2) : mainField;
			var reportFieldWithout_ = reportField.lastIndexOf('u_', 0) === 0 ? reportField.substring(2) : reportField;
			if (!utils.isFieldEqual(mainField, reportField) && !utils.isFieldEqual(mainFieldWithout_, reportFieldWithout_))
				utils.showMessage(gReport.i18n.checkSameGroupByFieldError + ' ' + self.savedMain.sysparm_field_name, utils.MSG_TYPE_ERROR);
		}
	});
	function setColumnsFromTable() {
		var chartType = self.report.sysparm_type;
		self.isPopulatedField.groupBy = true;
		if (chartTypeNames.MULTIPIVOT === chartType && !self.isPopulatedField.pivotV2)
			getPivotV2Cols();
		if (chartTypeNames.MAP === chartType)
			return getMapSources(self.report.sysparm_table);
		return $q(function resolveCb(resolve) {
			resolve();
		});
	}
	function setModalListeners() {
		$j(modals.sharing).on('hidden.bs.modal', function sharingHiddenCb() {
			getSharingSettings();
		});
		$j(modals.listColumns).on('hidden.bs.modal', function listColsHiddenCb() {
			var selectedValues = [];
			$j('#field_list_select_1 option').each(function pushOptionsCb() {
				selectedValues.push(this.value);
			});
			self.report.sysparm_field_list = selectedValues.join(',');
			$scope.$evalAsync();
		});
		$j(modals.coloringRules).on('hidden.bs.modal', function coloringRulesModalClose() {
self.runReport(true);
		});
	}
	function getPivotV2Cols() {
		var params = 'sysparm_processor=ListColumns&sysparm_expanded=0&sysparm_include_variables=true&sysparm_include_questions=true&sysparm_dot_walk_extended_fields_supported=true&sysparm_name=' + self.report.sysparm_table;
		if (self.report.sysparm_x_axis_category_fields && self.report.sysparm_x_axis_category_fields.length)
			serverRequestPost('xmlhttp.do', params + '&sysparm_col_list=' + self.report.sysparm_x_axis_category_fields, processPivotColsReturnedX, null);
		else
			serverRequestPost('xmlhttp.do', params + '&sysparm_col_list=,', processPivotColsReturnedX, null);
		if (self.report.sysparm_y_axis_category_fields && self.report.sysparm_y_axis_category_fields.length)
			serverRequestPost('xmlhttp.do', params + '&sysparm_col_list=' + self.report.sysparm_y_axis_category_fields, processPivotColsReturnedY, null);
else
			serverRequestPost('xmlhttp.do', params + '&sysparm_col_list=,', processPivotColsReturnedY, null);
	}
	function processPivotColsReturnedX(request) {
		colsReturned(request, $j('#pivot_x_select_0')[0], $j('#pivot_x_select_1')[0], self.report.sysparm_x_axis_category_fields, $j('#sys_display\\.sysparm_x_axis_category_fields'));
	}
	function processPivotColsReturnedY(request) {
		colsReturned(request, $j('#pivot_y_select_0')[0], $j('#pivot_y_select_1')[0], self.report.sysparm_y_axis_category_fields, $j('#sys_display\\.sysparm_y_axis_category_fields'));
	}
	function getAdditionalGroupByCols() {
		var params = 'sysparm_processor=ListColumns&sysparm_expanded=0&sysparm_dot_walk_extended_fields_supported=true&sysparm_include_variables=true&sysparm_name=' + self.report.sysparm_table;
		if (!types.isVariableOrQuestionsNotSupported())
			params += '&sysparm_include_questions=true';
		if (self.report.sysparm_additional_groupby)
			serverRequestPost('xmlhttp.do', params + '&sysparm_col_list=' + self.report.sysparm_additional_groupby, processAdditionalGroupByColsReturned, null);
else
			serverRequestPost('xmlhttp.do', params + '&sysparm_col_list=,', processAdditionalGroupByColsReturned, null);
	}
	function processAdditionalGroupByColsReturned(request) {
		colsReturned(request, $j('#additional_groupby_select_0')[0], $j('#additional_groupby_select_1')[0],
self.report.sysparm_additional_groupby, false);
	}
	function getListCols() {
		var params = 'sysparm_processor=ListColumns&sysparm_expanded=0&sysparm_include_variables=true&sysparm_include_questions=true&sysparm_is_list=true&sysparm_dot_walk_extended_fields_supported=true&sysparm_name=' + self.report.sysparm_table;
		if (self.report.sysparm_field_list)
			params += '&sysparm_col_list=' + self.report.sysparm_field_list;
		var url = endpoint.getXMLHttp + '?' + params;
		return cancelation.cancelRunReport().then(function(response) {
			return server.post(url).then(function postCb(resp) {
				var request = {};
				request.responseXML = $j.parseXML(resp);
				var commaSeparatedColumns = colsReturned(request, $j('#field_list_select_0')[0], $j('#field_list_select_1')[0], self.report.sysparm_field_list, false, self.report.sysparm_table !== 'wf_activity');
				self.report.sysparm_field_list = commaSeparatedColumns;
				self.isPopulatedField.listColumns = true;
			});
		});
	}
	window.checkLengthAndAdd = function checkLengthAndAdd(axis, sep1, sep2, sep3) {
		var maxCategories = axis === 'x' ? 3 : 5;
		var numberOfSelected = $j('#pivot_' + axis + '_select_0 option:selected').length;
		if ($j('#pivot_' + axis + '_select_1 option[value!=""]').length + numberOfSelected <= maxCategories)
			setAndAddOption('pivot_' + axis, 'sysparm_' + axis + '_axis_category_fields', sep1, sep2, sep3);
		else
			$window.alert(axis === 'x' ? self.messages.pivotColumnError : self.messages.pivotRowError);
	};
	window.saveBucketData = function saveBucketData(field, reportField) {
		var array = selectedOptionsToArray('#' + field);
		self.report[reportField] = array.selectedValues.join(',');
		$j('#sys_display\\.' + reportField).val(array.selectedLabels.join(', '));
	};
	function resetFieldFlags() {
		for (var field in self.isPopulatedField)
			if (self.isPopulatedField.hasOwnProperty(field))
				self.isPopulatedField[field] = false;
	}
	this.canShare = function canShare() {
		return !self.isDrilldown && !self.isDataset && (self.access.create || (self.access.write && self.access.roles.report_publisher && !self.isNew));
	};
	function setCustomEventListeners() {
		snCustomEvent.observe('reportDesigner:runInteractiveReport', function interactiveReportCb(interactiveReport) {
			self.report.sysparm_interactive_report = interactiveReport;
			self.runReport();
			self.report.sysparm_interactive_report = '';
		});
		if (self.hasAccessToFunctionField) {
			snCustomEvent.observe('reportDesigner:functionField:onUpdate', function onUpdate(config) {
reloadDotWalking();
				utils.showMessage(config.message,config.type);
			});
		}
	}
	function setNLQEventListeners() {
		snCustomEvent.observe('reportDesigner:input-nlq-callback', function nlqCallBackController(payload) {
			$timeout(function () {
				self.nlqNewReport = false;
				self.nlqNotUnderstood = false;
				self.nlqRestrictedData = false;
				self.nlqError = false;
self.reportHasRun = true;
				var statusCode = payload.apiResult.status_code;
				if (statusCode === 'ok') {
					copyReportToBeforeChanges();
					if (payload.apiResult.data_configurations[0]) {
						self.setModelAndRun(payload).then(function setTitle() {
							if (isModelChanged(true) && self.report.sysparm_title) {
								utils.showMessage(gReport.i18n.nlq_fields_updated, utils.msg_type_info, 10000);
								self.nlqShowPrevious = true && self.beforeChanges.sysparm_title;
							} else
								self.nlqShowPrevious = false;
						});
					} else
						utils.showMessage('Error with the response from NLQ', utils.MSG_TYPE_ERROR);
				} else if (statusCode === 'not_understood') {
					self.nlqNotUnderstood = true;
				} else if (statusCode === 'restricted') {
					self.nlqRestrictedData = true;
} else
					self.nlqError = true;
				self.nlqLoading = false;
			});
		});
		snCustomEvent.observe('reportDesigner:input-nlq-loading', function nlqCallBackLoadingController(payload) {
			$timeout(function () {
				self.nlqLoading = true;
				self.nlqNotUnderstood = false;
				self.nlqRestrictedData = false;
				self.nlqError = false;
			});
		});
	}
	this.setModelAndRun = function(payload){
		return self.setModelNLQ(payload.apiResult.data_configurations[0]).then(function setModelNLQCb() {
			self.report.sysparm_title = payload.userQuestion;
			if (!self.report.sysparm_title)
				self.report.sysparm_title = getTitleWhemEmpty(self.report)
			utils.setPageTitle(self.report.sysparm_title);
			self.activeMenuTab = 'configure';
		}).then(function runReportFromNLQ() {
	        if ((self.report.sysparm_type === chartTypeNames.PIE || self.report.sysparm_type === chartTypeNames.BAR) && !self.report.sysparm_field)
	        	utils.showMessage('Utterance needs a ‘Grouped by’ to display a Bar or a Pie. Selecting the first field by default', utils.MSG_TYPE_ERROR);
			self.runReport(false);
		});
	}
	this.setModelNLQ = function(dataConfig) {
		var deferred = $q.defer();
		self.loadBeforeChangesToModel();
		self.report.sysparm_field = dataConfig.group_by;
		var chartType = dataConfig.type;
if ('column' === chartType)
chartType = chartTypeNames.COLUMN;
		self.report.sysparm_type = chartType;
		self.report.sysparm_query = dataConfig.filter_query;
        self.report.sysparm_aggregate = dataConfig.aggregate_function;
        self.report.sysparm_sumfield = dataConfig.aggregate_field;
        self.report.sysparm_trend_field = dataConfig.trend_field;
        self.report.sysparm_trend_interval = dataConfig.trend_interval;
		types.setType(self.report.sysparm_type);
		self.filterConfig.sortFilter = typeLogic.canBeSorted(self.selectedSourceTypeObj.name, self.report.sysparm_type);
        self.report.sysparm_source_type = 'table';
        self.selectedSourceTypeObj = $filter('filter')(self.sourceTypeList, {name: self.report.sysparm_source_type}, true)[0];
        self.report.sysparm_table = dataConfig.source_id;
        var table = {};
        table.id = self.report.sysparm_table;
        table.text = dataConfig.source_id_label + ' [' + self.report.sysparm_table + ']';
		if (self.selectedSourceTypeObj.name == self.sourceTypeNames.table) {
			self.report.sysparm_table = table.id;
			self.report.sysparm_table_display_value = table.text;
			self.selectedTableObj = {name: table.text};
		} else {
self.selectedTableObj = $filter('filter')(self.tables, function filterTableCb(item) { return item.name === table; })[0];
			self.report.sysparm_table = table;
		}
		setColumnsFromTable().then(function setColsCb() {
			setTable(true);
			getListCols();
		});
        	self.report.sysparm_set_color = setColoring('color_palette');
        if (dataConfig.type === chartTypeNames.BAR)
        	self.report.sysparm_set_color = setColoring('one_color');
        resetFieldFlags();
		instantiateConditionBuilder();
		self.dataChanged = false;
		refreshBreadcrumb();
		setReferenceValues();
		utils.resetSelect2();
		getTableDescription();
		self.readyToShowSidebarContents = true;
		deferred.resolve();
		return deferred.promise;
	}
	this.loadPreviousReport = function() {
		self.nlqShowPrevious = false;
		self.loadBeforeChangesToModel();
		var payload = {};
		payload.userQuestion = self.report.sysparm_title;
		var conf = {};
		conf.group_by = self.report.sysparm_field;
		conf.type = self.report.sysparm_type;
		conf.filter_query = self.report.sysparm_query;
		conf.aggregate_function = self.report.sysparm_aggregate;
		conf.aggregate_field = self.report.sysparm_sumfield;
		conf.trend_field = self.report.sysparm_trend_field;
		conf.trend_interval = self.report.sysparm_trend_interval;
		conf.source_id = self.report.sysparm_table;
		var tableLabel = self.report.sysparm_table_display_value.substring(0, self.report.sysparm_table_display_value.indexOf('['));
		conf.source_id_label = tableLabel.trim();
		payload.apiResult = {};
		payload.apiResult.data_configurations = [];
		payload.apiResult.data_configurations.push(conf);
		self.setModelAndRun(payload);
		self.runReport(false);
	}
	this.loadBeforeChangesToModel = function() {
		self.nlqShowPrevious = false;
		self.report = angular.copy(self.beforeChanges);
		self.selectedTableObj = angular.copy(self.beforeChangesSelectedTableObj);
		self.selectedSourceObj = angular.copy(self.beforeChangesSelectedSourceObj);
		self.selectedMetricBaseObj = angular.copy(self.beforeChangesSelectedMetricBaseObj);
		self.selectedSourceTypeObj = angular.copy(self.beforeChangesSelectedSourceTypeObj);
		self.activeMenuTab = angular.copy(self.tmpActiveMenuTab);
	}
	this.toggleNLQ = function() {
		self.showNlqComponentCB = !self.showNlqComponentCB;
	};
	this.openNlqHelpModal = function openNlqHelpModal() {
		self.Piwik.trackEvent('nlq', 'open help modal');
		cleanCallBack();
		self.openModal('nlqHelpModal');
	};
	function getTitleWhemEmpty(report) {
			var userTimeStamp = (g_user.fullName || '') + ': ' + gReport.nowDateTime;
			var title = userTimeStamp;
			if (report.sysparm_type === chartTypeNames.PIE || report.sysparm_type === chartTypeNames.BAR)
				title = gReport.i18n.chartTypes[report.sysparm_type] + ' ' + gReport.i18n.on + ' ' + (report.sysparm_table_display_value ? report.sysparm_table_display_value : report.sysparm_table) + ' ' + gReport.i18n.table.toLowerCase() + ' ' + gReport.i18n.by + ' ' + (report.sysparm_field_label ? report.sysparm_field_label : report.sysparm_field) + ' ' + gReport.i18n.createdBy.toLowerCase() + ' ' + userTimeStamp;
			return title;
	}
	function fixScopeChangeButton() {
$j('#nav_message a#sysverb_cancel').prop('onclick', null).off('click')
			.on('click', function clickCb() {
				var searchParams = location.search.split('&');
				searchParams = searchParams.filter(function filterCb(value) { return !value.startsWith('sysparm_record_scope='); });
				location.search = searchParams.join('&');
			});
	}
	this.isSharingPanelVisible = function isSharingPanelVisible() {
		return !self.sidebarShown || self.sidebarShown == 'sharing';
	};
	$j('#ng-app').fadeIn();
	this.selectHasOptions = function (selectId) {
		var select = new Select(selectId);
		return select.select.options.length > 0;
	};
	function setAggregatePercentForPieReport() {
		if (types.isPieType() && self.report && self.report.sysparm_compute_percent !== 'aggregate')
			self.report.sysparm_compute_percent = 'aggregate';
	}
}]);
;
/*! RESOURCE: /reportdesigner/directives/directive.clickElsewhere.js */
angular.module('reportDesigner').directive('clickElsewhere', ['$document', function ($document) {
	'use strict';
	return {
        link: function postLink(scope, element, attrs) {
						function closeMenu() {
							scope.$apply(attrs.clickElsewhere);
						}
						var onClick = function onClick(event) {
                var isChild = element.has(event.target).length;
                var isSelf = element[0] == event.target;
								if (!(isChild || isSelf))
									closeMenu();
            };
						var onKeyClose = function onKeyClose(event) {
							var keyCode = event.keyCode || event.which;
							var $triggerEl = element.siblings('[data-toggle="dropdown"]');
							if (keyCode === 27 && $triggerEl.length)
								$triggerEl.focus();
if (keyCode === 27 || keyCode === 9)
								closeMenu();
						};
            scope.$watch(attrs.isActive, function(newValue, oldValue) {
                if (newValue !== oldValue && newValue) {
                    $document.bind('click', onClick);
										$document.bind('keyup', onKeyClose);
                }
                else if (newValue !== oldValue && !newValue) {
                    $document.off('click', onClick);
										$document.off('keyup', onKeyClose);
                }
            });
        }
    };
}]);
;
/*! RESOURCE: /reportdesigner/directives/directive.reportNotification.js */
angular.module('reportDesigner').directive('notification', function notification($compile) {
	'use strict';
	var template = '<div class="notification" ng-class="\'notification-\'+info.type" >' +
'<span ng-bind-html="info.message"></span>' +
'<a tabindex="0" ng-show="info.showLink" ng-click="link()">' + gReport.i18n.here + '</a>' +
						'<button class="btn-icon close icon-cross" ng-click="info.close()">' +
'<span class="sr-only">' + gReport.i18n.close + '</span>' +
'</button>' +
'</div>';
	return {
		restrict: 'E',
		scope: {
			info: '=',
			link: '&'
		},
		link: function link(scope, el) {
			var content = $compile(template)(scope);
			el.append(content);
		}
	};
});
;
/*! RESOURCE: /reportdesigner/directives/directive.checkNumeric.js */
angular.module('reportDesigner').directive('checkNumeric', ['$window', function ($window) {
	'use strict';
	return {
		require: 'ngModel',
		link: function(scope, element, attrs, modelCtrl) {
			modelCtrl.$parsers.push(function (inputValue) {
				if (inputValue == undefined) return '';
var transformedInput = inputValue.replace(/(?!^)-/g, '').replace(/[^-0-9]/g, '');
				if (transformedInput!=inputValue) {
					modelCtrl.$setViewValue(transformedInput);
					modelCtrl.$render();
				}
				return transformedInput;
			});
		}
	}
}]);
;
/*! RESOURCE: /reportdesigner/directives/directive.inlineMessage.js */
angular.module('reportDesigner').directive('inlineMsg', ['$timeout', function inlineMsgFunc($timeout) {
	return {
		scope: {},
		restrict: 'C',
link: function link(scope, element, attrs) {
var $input = element.find('input.form-control');
			element.on('change focusin focusout', function changeCallback() {
				$timeout(function timeoutCb() {
var el = $input[0];
					if (el && el.ac && typeof el.ac.isReferenceValid() !== 'undefined') {
						var fieldMsgId = el.id.split('sys_display.')[1] + '_fieldmsg';
if (el.ac.isReferenceValid())
							element.find('.fieldmsg-container').remove();
						else if (!element.find('.fieldmsg-container').length) {
							var message = attrs.label
								? gReport.i18n.invalidReferenceLookup.format(attrs.label)
								: gReport.i18n.invalidReference
							element.append(
								'<div class="fieldmsg-container" id="' + fieldMsgId + '" aria-live="polite">' +
'<div class="fieldmsg notification notification-error">' + message + '</div>' +
'</div>'
							);
						}
					}
				});
			});
		},
	};
}]);
;
/*! RESOURCE: /reportdesigner/directives/confirm-modal/directive.confirm-modal.js */
angular.module('reportDesigner').directive('confirmModal', function confirmModalDirective() {
	'use strict';
	return {
		restrict: 'E',
templateUrl: 'scripts/reportdesigner/directives/confirm-modal/template.confirm-modal.html',
	};
});
;
/*! RESOURCE: /reportdesigner/directives/directive.setAccessibleTooltips.js */
angular.module('reportDesigner').directive('setAccessibleTooltips', function setAccessibleTooltips() {
	'use strict';
	return {
		restrict: 'A',
		scope: {},
		link: function link(scope, element, attributes) {
			function setFocusListener(accessibilityEnabled) {
				if (!accessibilityEnabled)
					return;
				var $pane = $j(element);
				var CONTAINERS = 'div.form-group div[class *= \'-container\'], div.form-group select[id *= \'select\']';
				var CHECKBOXES = 'div.form-group span.input-group-checkbox';
				var CHECKBOXES_STYLE_PANEL = 'div.input-group-checkbox input.checkbox';
				$pane.on('focus', CONTAINERS + ', ' + CHECKBOXES + ', ' + CHECKBOXES_STYLE_PANEL, function(evt) {
					var $parentDiv = $j(evt.target).closest('div:has(label[title])');
					var $label = $parentDiv.find('label[title]');
					if (!$j(evt.target).attr('aria-describedby')) {
						var dataDescribedby = $parentDiv.find('span.sr-only').attr('id');
						if (dataDescribedby)
							$j(evt.target).attr('aria-describedby', dataDescribedby);
					}
					if ($label.length === 1)
						showTooltip($label);
				});
				$pane.on('blur', CONTAINERS + ', ' + CHECKBOXES + ', ' + CHECKBOXES_STYLE_PANEL, function(evt) {
					var $parentDiv = $j(evt.target).closest('div:has(label[title])');
					var $label = $parentDiv.find('label[title]');
					if ($label.length)
						hideTooltip($label);
				});
			} 
			
			function hideTooltip($el) {
				var hover = $el.data('hover');
				var timer = $el.data('timer');
				if (hover) {
					clearTimeout(hover);
					$el.removeData('hover')
				}
				
				if (timer) {
					clearTimeout(timer);
					$el.removeData('timer');
				}
				
				$el.tooltip('destroy');
				$el.data('bs.tooltip', undefined);
			}
			function showTooltip($el) {
				if (!$el.data('bs.tooltip')) {
					$el.tooltip({
						container: $el.attr('data-container') || 'body'
					});
					$el.on('click', function() {
						$el.tooltip('hide');
					});
				}
				
				$el.data('bs.tooltip').options.placement = 'top';
				
				$el.on('shown.bs.tooltip', function() {
					$el.data('timer', setTimeout(function() {
						$el.tooltip('hide');
					}, 10000));
				});
				$el.data('hover', setTimeout(function() {
					$el.tooltip('show');
				}, 500));
			}
			setFocusListener((gReport.accessibilityEnabled === 'true'));
		}
	};	
});
;
/*! RESOURCE: /reportdesigner/directives/directive.tooltipOnlyOnOverflow.js */
angular.module('reportDesigner').directive('tooltipOnlyOnOverflow', function tooltipOnlyOnOverflow() {
	return {
		restrict: 'A',
		scope: {},
		link: function link(scope, element) {
			var el = element[0];
			scope.$watch(function() {
				return el.scrollWidth;
			}, function() {
				if (el.offsetWidth >= el.scrollWidth) {
					el.removeAttribute('data-original-title');
					el.removeAttribute('title');
				}
			});
		}
	};
});
;
/*! RESOURCE: /reportdesigner/directives/directive.focusTrap.js */
angular.module('reportDesigner').directive('focusTrap', ['$window', function($window) {
	'use strict';
	return {
		restrict: 'AC',
		scope: {},
		link: function postLink(scope, element) {
			scope.enableFocusTrap = function enableFocusTrap() {
				if ($window.focusTrap) {
					scope.focusTrap = $window.focusTrap(element[0], {
						clickOutsideDeactivates: true
					});
				} else {
					$window.console && $window.console.error('Global focustrap.js is not available');
					return;
				}
				if (scope.focusTrap)
					scope.focusTrap.activate();
			};
			scope.disableFocusTrap = function disableFocusTrap() {
				if (!scope.focusTrap)
					return;
				scope.focusTrap.deactivate({returnFocus: true});
				scope.focusTrap = null;
			};
			element.on('shown.bs.modal', function() {
				scope.enableFocusTrap();
			});
			element.on('hidden.bs.modal', function onModalHidden() {
				scope.disableFocusTrap();
			});
		}
	};
}]);
;
/*! RESOURCE: /reportdesigner/directives/directive.checkNumericRange.js */
angular.module('reportDesigner').directive('checkNumericRange', ['$window', function () {
	'use strict';
	return {
		require: 'ngModel',
		restrict: 'A',
		scope: {
			rangeDefault: '@rangeDefault',
			rangeMin: '@rangeMin',
			rangeMax: '@rangeMax'
		},
		link: function (scope, element, attrs, modelCtrl) {
			modelCtrl.$parsers.push(function (inputValue) {
				if (inputValue == null)
					return '';
				var transformedInput = parseInt(inputValue, 10);
				if (isNaN(transformedInput))
					transformedInput = '';
				if (transformedInput > scope.rangeMax || transformedInput < scope.rangeMin)
					transformedInput = scope.rangeDefault;
				if (transformedInput !== inputValue) {
					modelCtrl.$setViewValue(transformedInput);
					modelCtrl.$render();
				}
				return transformedInput;
			});
		}
	};
}]);
;
/*! RESOURCE: /reportdesigner/services/service.piwik.js */
angular.module('reportDesigner').factory('PiwikService', ['$window', function PiwikService($window) {
	'use strict';
	this.trackEvent = function(type, value) {
		if ($window.GlideWebAnalytics) {
			$window.GlideWebAnalytics.trackEvent('com.glideapp.report', 'Report Designer - ' + type, value.toLowerCase(), 0);
		}
	};
	
	this.getEntry = function() {
		var url = document.referrer;
		if (!url || url === "")
			return "Other";
		if (url.indexOf("sys_report_template.do") > -1)
			return "Report Builder";
		if (url.indexOf("pa_dashboard.do") > -1)
			return "Dashboard";
		if (url.indexOf("_list.do") > -1)
			return "Platform List";
		
		if (url.indexOf("nav_to.do") > -1)
			return "Report Module - Create New";
		
		if (url.indexOf("report_home.do") > -1)
return "Report Module - View/Run";
		
		if (url.indexOf("home.do") > -1)
			return "Homepage";
		
		return "Other";	
	};
	
	this.trackEntry = function() {
		this.trackEvent('Entry', this.getEntry());
	};
	
	return {
		trackEvent: this.trackEvent,
		trackEntry: this.trackEntry,
		getEntry: this.getEntry
	};
}]);
;
/*! RESOURCE: /reportdesigner/services/service.endpoints.js */
angular.module('reportDesigner').factory('EndpointsService', [function() {
	'use strict';
	var processorRoot = 'angular.do?sysparm_type=report_designer_processor&type=';
var metricBaseRoot = 'api/now/v1/metric/';
var tableApiRoot = 'api/now/table/';
	return {
		getDataUrl : processorRoot + 'load',
		saveUrl : processorRoot + 'save',
		deleteUrl : processorRoot + 'delete&sys_id=',
		getCommonDataUrl : processorRoot + 'commonDataLoad',
		getDatasetUrl : processorRoot + 'loadDataset',
		saveDatasetUrl : processorRoot + 'saveDataset',
		deleteDatasetUrl : processorRoot + 'deleteDataset',
		getBreadcrumbsTreeUrl : processorRoot + 'getDrilldownsAndDatasets',
		getDrilldownUrl : processorRoot + 'loadDrilldown',
		saveDrilldownUrl : processorRoot + 'saveDrilldown',
		deleteDrilldownUrl : processorRoot + 'deleteDrilldown',
		getTablesUrl : processorRoot + 'loadTables',
		getSourcesUrl : processorRoot + 'loadSources',
		getImportTablesUrl : processorRoot + 'loadImportTables',
		getExpirationOptionsUrl : processorRoot + 'loadExpirationOptions',
getMetricBaseTablesUrl : metricBaseRoot + 'definition/table',
		getXMLHttp : 'xmlhttp.do',
		getScoreColor : tableApiRoot + 'sys_report_color',
		getUrl : processorRoot,
getTableDescriptionUrl : '/api/now/reporting_table_description/',
getFieldDescriptionUrl : '/api/now/reporting_table_description/field_description/'
	}
}]);
;
/*! RESOURCE: /reportdesigner/services/service.server.js */
angular.module('reportDesigner').factory('ServerService', function ServerService($http, $q) {
	'use strict';
	return {
		post: function post(url, params, config) {
			var deferred = $q.defer();
			$http.post(url, params, config).success(function success(data) {
				deferred.resolve(data);
			}).error(function error(response) {
				var message = response && response.message ? response.message : 'An error occured while sending items.';
				deferred.reject(message);
			});
			return deferred.promise;
		},
		get: function get(url, params) {
			var deferred = $q.defer();
			$http.get(url, params).success(function success(data) {
				deferred.resolve(data);
			}).error(function error(response) {
				var message = response && response.message ? response.message : 'An error occured while fetching items.';
				deferred.reject(message);
			});
			return deferred.promise;
		},
		request: function request(settings) {
			var deferred = $q.defer();
			$http(settings).success(function success(data) {
				deferred.resolve(data);
			}).error(function error(response) {
				var message = response && response.message ? response.message : 'An error occured while running your request.';
				deferred.reject(message);
			});
			return deferred.promise;
		},
	};
});
;
/*! RESOURCE: /reportdesigner/services/service.snCustomEvent.js */
angular.module('reportDesigner').factory('snCustomEvent',  function() {
	'use strict';
	if (typeof NOW.CustomEvent === 'undefined')
		throw "CustomEvent not found in NOW global";
	return NOW.CustomEvent;
});
;
/*! RESOURCE: /reportdesigner/services/service.filterData.js */
angular.module('reportDesigner').factory('filterData', function filterData($http, $q) {
	'use strict';
var REST = {
TABLE_LAYOUT: '/api/now/ui/table_layout/',
TABLE_DATA: '/api/now/ui/table/',
TABLE_GROUP: '/api/now/ui/group/',
TABLE_CALCULATIONS: '/api/now/ui/calculations/',
BREADCRUMB: '/api/now/ui/breadcrumbs?table=',
UI_ACTIONS: '/api/now/ui/ui_action/:table/for_list_banner',
RELATED_LIST: '/api/now/ui/related_list/related/',
EMBEDDED_LIST: '/api/now/ui/related_list/embedded/',
INIT_LIST: '/api/now/ui/init_list/',
LIST_EDIT: '/api/now/ui/table_edit/',
CHOICE_LIST: '/api/now/ui/choice_list/',
PARSE_QUERY: '/api/now/ui/query_parse/'
	};
	function getBreadcrumb(table, query) {
		var deferred = $q.defer();
		$http.get(REST.BREADCRUMB + table + '&query=' + encodeURIComponent(query))
			.success(function getSuccess(data){
				deferred.resolve(data.result);
			})
			.error(function errorCb(reason) {
				deferred.reject(reason);
			});
		return deferred.promise;
	}
	return {
		getBreadcrumb: getBreadcrumb
	};
});
;
/*! RESOURCE: /reportdesigner/services/service.chartTypes.js */
angular.module('reportDesigner').factory('chartTypes', ['chartsModel', 'chartTypeNames', '$gReport', function chartTypesFactory(chartsModel, chartTypeNames, $gReport) {
	'use strict';
	var type;
	var allowedDatasetsTypes;
	return {
		model: chartsModel,
		isBarType: function isBarType(passedType) {
			var chartType = passedType || type;
			if (chartType)
				return (chartType === chartTypeNames.BAR || chartType === chartTypeNames.HORIZONTAL_BAR);
			return false;
		},
		isGaugeType: function isGaugeType() {
			return (type === chartTypeNames.SPEEDOMETER || type === chartTypeNames.DIAL);
		},
		isPieType: function isPieType() {
			if (type)
				return type === chartTypeNames.PIE || type === chartTypeNames.FUNNEL || type === chartTypeNames.PYRAMID || this.isDonutType();
			return false;
		},
		isLineType: function isLineType() {
			if (type)
				return (type === chartTypeNames.LINE || type === chartTypeNames.AREA || type === chartTypeNames.SPLINE || type === chartTypeNames.COLUMN || type === chartTypeNames.STEP_LINE);
			return false;
		},
		isBoxType: function isBoxType(chartType) {
			if (chartType)
				return chartType === chartTypeNames.BOX || chartType === chartTypeNames.TRENDBOX;
			return type === chartTypeNames.BOX || type === chartTypeNames.TRENDBOX;
		},
		isDonutType: function isDonutType() {
			return (type === chartTypeNames.DONUT || type === chartTypeNames.SEMI_DONUT);
		},
		isSimpleTabularType: function isSimpleTabularType() {
			return type === chartTypeNames.PIVOT || type === chartTypeNames.HEATMAP || type === chartTypeNames.BUBBLE;
		},
		isTabularType: function isTabularType() {
			return this.isSimpleTabularType() || type === chartTypeNames.MULTIPIVOT;
		},
		isPivotType: function isPivotType() {
			return type === chartTypeNames.PIVOT || type === chartTypeNames.MULTIPIVOT;
		},
		isJellyRunType: function isJellyRunType() {
			return (type === chartTypeNames.LIST || type === chartTypeNames.PIVOT);
		},
		isFullWidth: function isFullWidth() {
			return (type === chartTypeNames.LIST || type === chartTypeNames.CALENDAR || type === chartTypeNames.MULTIPIVOT || type === chartTypeNames.SINGLE_SCORE);
		},
		isTrendType: function isTrendType() {
			if (type)
				return (type === chartTypeNames.TREND || this.isLineType() || type === chartTypeNames.TRENDBOX || type === chartTypeNames.CONTROL);
			return false;
		},
		isScoreType: function isScoreType() {
			return type === chartTypeNames.SINGLE_SCORE;
		},
		isMapType: function isMapType() {
			return type === chartTypeNames.MAP || type === chartTypeNames.HEATMAP;
		},
hasNoneOption: function hasNoneOption() {
			return (type === chartTypeNames.TREND || this.isLineType() || type === chartTypeNames.CONTROL || type === chartTypeNames.LIST || this.isGaugeType() || type === chartTypeNames.BUBBLE);
		},
		hasColorFields: function hasColorFields() {
			return !(type === chartTypeNames.LIST || type === chartTypeNames.SPEEDOMETER || this.isBoxType() || type === chartTypeNames.SINGLE_SCORE || type === chartTypeNames.CONTROL || this.isTabularType() || type === chartTypeNames.CALENDAR || type === chartTypeNames.HISTOGRAM || type === chartTypeNames.MAP);
		},
		isSortable: function isSortable() {
			return !(this.isGaugeType() || type === chartTypeNames.PIVOT || type === chartTypeNames.MULTIPIVOT || type === chartTypeNames.CALENDAR || type === chartTypeNames.SINGLE_SCORE || this.isMapType());
		},
		isStyleable: function isStyleable() {
			return !(type === chartTypeNames.CALENDAR || type === chartTypeNames.HISTOGRAM);
		},
		isMeasured: function isMeasured() {
			return type === chartTypeNames.HISTOGRAM || type === chartTypeNames.BOX;
		},
		isResizable: function isResizable() {
			return !(type === chartTypeNames.PIVOT || type === chartTypeNames.MULTIPIVOT || type === chartTypeNames.SINGLE_SCORE);
		},
		hasTitleOptions: function hasTitleOptions() {
			return this.getType() !== chartTypeNames.PIVOT;
		},
		hasAxisOptions: function hasAxisOptions() {
			return this.isBarType() || type === chartTypeNames.TREND || this.isLineType() || this.isBoxType() || type === chartTypeNames.HISTOGRAM
				|| type === chartTypeNames.PARETO || type === chartTypeNames.CONTROL;
		},
		hasGeneralStyleOptions: function hasGeneralStyleOptions() {
			return type !== chartTypeNames.LIST;
		},
		hasLegendOptions: function hasLegendOptions(report) {
			return !(this.isGaugeType() || this.isBoxType() || type === chartTypeNames.HISTOGRAM || type === chartTypeNames.PARETO || type === chartTypeNames.LIST || type === chartTypeNames.CALENDAR || type === chartTypeNames.PIVOT || type === chartTypeNames.MULTIPIVOT || type === chartTypeNames.SINGLE_SCORE)
				&& (!this.isBarType() || report.sysparm_stack_field)
				&& !(this.isDonutType() && report.sysparm_show_chart_total)
				&& !((this.getType() === chartTypeNames.TREND || this.getType() === chartTypeNames.BUBBLE || this.isLineType()) && !report.sysparm_field)
				&& (!this.isMapType() || report.sysparm_use_color_heatmap_map);
		},
		hasGroupField: function hasGroupField() {
			if (type)
				return (type !== chartTypeNames.HISTOGRAM && type !== chartTypeNames.PIVOT && type !== chartTypeNames.HEATMAP && type !== chartTypeNames.MULTIPIVOT && type !== chartTypeNames.CALENDAR && type !== chartTypeNames.CONTROL && !this.isGaugeType() && type !== chartTypeNames.SINGLE_SCORE && type !== chartTypeNames.MAP);
			return false;
		},
		requiresGroupByValue: function requiresGroupByValue() {
			return !this.hasNoneOption() && type !== chartTypeNames.MULTIPIVOT && type !== chartTypeNames.HISTOGRAM && type !== chartTypeNames.PIVOT && type !== chartTypeNames.CALENDAR && type !== chartTypeNames.SINGLE_SCORE && type !== chartTypeNames.HEATMAP && type !== chartTypeNames.MAP;
		},
		hasStackField: function hasStackField() {
			if (type)
				return this.isBarType();
			return false;
		},
		hasDisplayGrid: function hasDisplayGrid() {
			return !(this.isGaugeType() || type === chartTypeNames.LIST || type === chartTypeNames.CALENDAR || type === chartTypeNames.CONTROL || this.isBoxType() || type === chartTypeNames.HISTOGRAM || this.isTabularType() || type === chartTypeNames.SINGLE_SCORE);
		},
		hasSumPanel: function hasSumPanel() {
			return this.isBarType() || this.isPieType() || this.isGaugeType() || this.isTabularType() || this.isLineType() || this.isTrendType() || type === chartTypeNames.SINGLE_SCORE || type === chartTypeNames.MAP;
		},
		hasPercentages: function hasPercentages() {
			return this.isBarType() || this.isLineType() || type === chartTypeNames.TREND;
		},
		hasDataLabels: function hasDataLabels() {
			return !(type === chartTypeNames.PIVOT || type === chartTypeNames.MULTIPIVOT || this.isGaugeType() || this.isBoxType() || type === chartTypeNames.BUBBLE || type === chartTypeNames.SINGLE_SCORE);
		},
		canDataLabelsBeInMiddle: function canDataLabelsBeInMiddle() {
			return this.isBarType() || type === chartTypeNames.COLUMN || type === chartTypeNames.PARETO || type === chartTypeNames.TREND;
		},
		hasDrillDown: function hasDrillDown(chartType) {
			return !(this.isBoxType(chartType) || chartType === chartTypeNames.LIST || chartType === chartTypeNames.HISTOGRAM || chartType === chartTypeNames.CONTROL || chartType === chartTypeNames.CALENDAR);
		},
		isLastTypeDrillable: function isLastTypeDrillable(breadcrumb, mainType) {
			var lastType;
			if (breadcrumb && breadcrumb.drilldowns.length) {
				lastType = breadcrumb.drilldowns[breadcrumb.drilldowns.length - 1].type;
				return this.hasDrillDown(lastType);
			}
return this.hasDrillDown(mainType);
		},
		hasMarker: function hasMarker() {
			return type === chartTypeNames.LINE || type === chartTypeNames.SPLINE || type === chartTypeNames.AREA || type === chartTypeNames.STEP_LINE;
		},
		hasDecimalPrecision: function hasDecimalPrecision() {
			return !(type === chartTypeNames.PIVOT || type === chartTypeNames.CALENDAR || type === chartTypeNames.PARETO || type === chartTypeNames.HISTOGRAM);
		},
		hasOther: function hasOther() {
			return !this.isLineType() && !this.isBoxType() && type !== chartTypeNames.CONTROL && type !== chartTypeNames.LIST && type !== chartTypeNames.HISTOGRAM && type !== chartTypeNames.CALENDAR && !this.isGaugeType() && type !== chartTypeNames.BUBBLE && type !== chartTypeNames.SINGLE_SCORE && type !== chartTypeNames.MAP;
		},
		canShowZero: function canShowZero() {
			return type === chartTypeNames.MULTIPIVOT || type === chartTypeNames.HEATMAP || type === chartTypeNames.SINGLE_SCORE;
		},
		canUnstack: function canUnstack(groupbyValue, stackbyValue) {
			return (this.isBarType() && stackbyValue) || (type === chartTypeNames.COLUMN && groupbyValue);
		},
		canExportToPdf: function canExportToPdf() {
			return type !== chartTypeNames.MAP && type !== chartTypeNames.CALENDAR && type !== chartTypeNames.SINGLE_SCORE;
		},
		canSchedule: function canSchedule() {
			return type !== chartTypeNames.MAP && type !== chartTypeNames.CALENDAR && type !== chartTypeNames.SINGLE_SCORE;
		},
		canBeSorted: function canBeSorted() {
			if (type === chartTypeNames.CALENDAR)
				return false;
			return true;
		},
		supportsMultipleDataSets: function supportsMultipleDataSets() {
			return this.isBarType() || this.isLineType();
		},
		isDatasetAvailable: function isDatasetAvailable(chartType) {
			return chartType === chartTypeNames.LINE || chartType === chartTypeNames.AREA || chartType === chartTypeNames.COLUMN || chartType === chartTypeNames.SPLINE || chartType === chartTypeNames.BAR || chartType === chartTypeNames.HORIZONTAL_BAR || chartType === chartTypeNames.STEP_LINE;
		},
		canShowCustomChartTitlePosition: function canShowCustomChartTitlePosition(title) {
			return title !== 'never' && type !== chartTypeNames.MULTIPIVOT && type !== chartTypeNames.SINGLE_SCORE && type !== chartTypeNames.LIST && type !== chartTypeNames.CALENDAR;
		},
		canShowTitleVerticalAlignment: function canShowTitleVerticalAlignment() {
			return type !== chartTypeNames.LIST;
		},
		currentType: chartTypeNames.BAR,
		setType: function setType(chartType) {
			this.currentType = chartType;
			type = chartType;
		},
		getType: function getType() {
			return type;
		},
		supportsScVariables: function supportsScVariables() {
			return this.currentType !== chartTypeNames.LIST && this.currentType !== chartTypeNames.BOX && this.currentType !== chartTypeNames.TRENDBOX;
		},
		supportsColorRules: function supportsColorRules() {
			return this.currentType === chartTypeNames.MULTIPIVOT || this.currentType === chartTypeNames.SINGLE_SCORE;
		},
		shouldResetShowZeroToTrue: function shouldResetShowZeroToTrue(chartType) {
			var isTypeSingleScore = chartType === chartTypeNames.SINGLE_SCORE;
			var isCurrentTypeSingleScore = this.currentType === chartTypeNames.SINGLE_SCORE;
			return isTypeSingleScore !== isCurrentTypeSingleScore;
		},
		shouldNotShowYAxisFromAndToFields: function shouldNotShowYAxisFromAndToFields() {
			return type === chartTypeNames.PARETO || type === chartTypeNames.CONTROL;
		},
		isTypeVisibleInADataset: function isTypeVisibleInADataset(chartType) {
			if (allowedDatasetsTypes && allowedDatasetsTypes.length && allowedDatasetsTypes.indexOf(chartType) > -1)
				return true;
			return false;
		},
		isGroupVisibleInADataset: function isGroupVisibleInADataset(typeGroup) {
			if (typeGroup === 'timeSeries')
				return this.isTypeVisibleInADataset(chartTypeNames.LINE) || this.isTypeVisibleInADataset(chartTypeNames.COLUMN) || this.isTypeVisibleInADataset(chartTypeNames.AREA) || this.isTypeVisibleInADataset(chartTypeNames.SPLINE);
			else if (typeGroup === 'bars')
				return this.isTypeVisibleInADataset(chartTypeNames.BAR) || this.isTypeVisibleInADataset(chartTypeNames.HORIZONTAL_BAR);
			return false;
		},
		isValueAliasSupported: function isValueAliasSupported() {
			if (this.currentType === chartTypeNames.MULTIPIVOT)
				return true;
			return false;
		},
		setAllowedTypesForDatasets: function setAllowedTypesForDatasets(passedType) {
			var allowedTypes;
			if (this.isLineType(passedType))
				allowedTypes = [chartTypeNames.LINE, chartTypeNames.COLUMN, chartTypeNames.AREA, chartTypeNames.SPLINE, chartTypeNames.STEP_LINE];
			else if (passedType === chartTypeNames.BAR)
				allowedTypes = [chartTypeNames.BAR];
			else if (passedType === chartTypeNames.HORIZONTAL_BAR)
				allowedTypes = [chartTypeNames.HORIZONTAL_BAR];
			allowedDatasetsTypes = allowedTypes;
		},
		isMetricbaseChartType: function isMetricbaseChartType(passedType) {
			return (passedType === chartTypeNames.LINE || passedType === chartTypeNames.AREA || passedType === chartTypeNames.SPLINE || passedType === chartTypeNames.STEP_LINE);
		},
		getTypeSpecificMultidimensionalFields: function getTypeSpecificMultidimensionalFields(passedType) {
			switch (passedType) {
			case chartTypeNames.MULTIPIVOT:
				return ['sysparm_x_axis_category_fields', 'sysparm_y_axis_category_fields'];
			case chartTypeNames.HEATMAP:
			case chartTypeNames.PIVOT:
				return ['sysparm_ct_row', 'sysparm_ct_column'];
			}
			return [];
		},
		showAliasesConfiguration: function showAliasesConfiguration() {
			return this.getType() === chartTypeNames.MULTIPIVOT || this.getType() === chartTypeNames.LIST;
		},
		showFormattingConfiguration: function showFormattingConfiguration() {
			if (!$gReport.isFormattingEnabled)
				return false;
			var supportedTypes = [
				chartTypeNames.BAR,
				chartTypeNames.HORIZONTAL_BAR,
				chartTypeNames.DONUT,
				chartTypeNames.PIE,
				chartTypeNames.SEMI_DONUT,
				chartTypeNames.AREA,
				chartTypeNames.LINE,
				chartTypeNames.SPLINE,
				chartTypeNames.STEP_LINE,
				chartTypeNames.MULTIPIVOT,
				chartTypeNames.PYRAMID,
				chartTypeNames.FUNNEL,
				chartTypeNames.SINGLE_SCORE,
				chartTypeNames.TREND,
				chartTypeNames.COLUMN
			];
			return supportedTypes.includes(this.getType());
		},
hideDecimalPrecision: function hideDecimalPrecision() {
			var supportedTypes = [
				chartTypeNames.SINGLE_SCORE,
				chartTypeNames.MULTIPIVOT,
			];
			return supportedTypes.includes(this.getType());
		},
		isVariableOrQuestionsNotSupported: function isVariableOrQuestionsNotSupported() {
			var unsupportedTypes = [chartTypeNames.HISTOGRAM, chartTypeNames.BOX, chartTypeNames.CALENDAR,
				chartTypeNames.CONTROL, chartTypeNames.MAP, chartTypeNames.PIVOT, chartTypeNames.TRENDBOX,
				chartTypeNames.DIAL, chartTypeNames.SINGLE_SCORE, chartTypeNames.SPEEDOMETER];
			return unsupportedTypes.indexOf(this.currentType) > -1;
		},
	};
}]);
;
/*! RESOURCE: /reportdesigner/services/service.sourceTypes.js */
angular.module('reportDesigner').factory('sourceTypes', ['sourceTypeNames', function sourceTypesFactory(sourceTypeNames) {
	'use strict';
	return {
		sourceTypeList: [
			{
				label: gReport.i18n.reportSource,
				name: sourceTypeNames.reportSource
			},
			{
				label: gReport.i18n.table,
				name: sourceTypeNames.table
			},
			{
				label: gReport.i18n.externalImport,
				name: sourceTypeNames.externalImport
			},
			{
				label: gReport.i18n.metricBase.label,
				name: sourceTypeNames.metricBase
			}
		],
		isNotMetricBase: function (sourceType) {
			return !(sourceType === sourceTypeNames.metricBase);
		},
		isSourceTypeSelectable: function (isDataset, mainReportSourceType, sourceType) {
			if (isDataset) {
				return (!this.isNotMetricBase(mainReportSourceType) && !this.isNotMetricBase(sourceType))
					|| (this.isNotMetricBase(mainReportSourceType) && this.isNotMetricBase(sourceType));
			}
			return true;
		},
		supportsTables: function (sourceType) {
			return (sourceType === sourceTypeNames.metricBase) || (sourceType === sourceTypeNames.table);
		}
	};
}]);
;
/*! RESOURCE: /reportdesigner/services/service.utils.js */
angular.module('reportDesigner').factory('utils', ['$window', '$timeout', '$filter', '$location', 'chartTypes', 'sourceTypeNames', function utilsFactory($window, $timeout, $filter, $location, chartTypes, sourceTypeNames) {
	'use strict';
	return {
		msgType: {
			type_info: 'info',
			type_error: 'error',
			type_default: 'info'
		},
		entityMap: {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			'"': '&quot;',
			"'": '&#39;',
'/': '&#x2F;'
		},
		encodeFilter: function encodeFilter(filter) {
			var encoded = this.replaceAll(filter, '^OR', '~OR~');
			encoded = this.replaceAll(encoded, '^', '~AND~');
			return encoded;
		},
		showMessage: function showMessage(message, type, timeInMiliSeconds) {
if (message) {
				var span = document.createElement('span');
				span.setAttribute('data-type', (type ? type : this.msgType.type_default));
				span.setAttribute('data-text', this.escapeHtml(message));
				span.setAttribute('data-duration', (timeInMiliSeconds ? timeInMiliSeconds: '5000'));
				if (typeof GlideUI !== 'undefined')
					GlideUI.get().fire(new GlideUINotification({ xml: span }));
			}
		},
		showMessages: function showMessages(messages) {
if (messages) {
				var msgsArray = JSON.parse(messages);
				if (Object.keys(messages).length)
					this.showMessage(msgsArray.msg, this.msgType['type_' + msgsArray.type], msgsArray.show_time_ms);
				else
					msgsArray.forEach(function eachMsg(msgJson) {
						this.showMessage(msgJson.msg, this.msgType['type_' + msgJson.type], msgJson.show_time_ms);
					});
			}
		},
		alertScreenReader: function(message) {
			var a11yElt = top.document.createElement('div');
			a11yElt.setAttribute('id', 'a11y-sr-par-container-' + Math.random().toString(16).substr(2));
			a11yElt.setAttribute('class', 'sr-only');
			a11yElt.setAttribute("style", "position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip: rect(0, 0, 0, 0); border: 0;");
			a11yElt.setAttribute('role', 'status');
			a11yElt.setAttribute('aria-live', 'assertive');
			a11yElt.innerText = message;
			top.document.body.appendChild(a11yElt);
			setTimeout(function() {
				a11yElt.parentNode.removeChild(a11yElt);
			}, 5000);
		},
		openForm: function openForm(name, tableName, params, callbackFunc, shouldTrapModalFocus) {
			var d = new GlideModalForm(name, tableName, callbackFunc);
			d.setPreference('sysparm_query', params.join('^'));
			if (shouldTrapModalFocus)
				d.setPreference('focusTrap', true);
			d.render();
		},
		openListReportsFromReportSource: function openListReportsFromReportSource(id) {
var url = $window.location.protocol + '//' + $window.location.host + '/nav_to.do?uri=%2Fsys_report_list.do?sysparm_query=report_source%3D' + id;
			$window.open(url, '_blank');
		},
		setSavedUrl: function setSavedUrl(id, title) {
			if ($window.history.replaceState) {
				if($location.search()["sysparm_stack"]){
$location.url('/sys_report_template.do?jvar_report_id=' + id+"&sysparm_stack="+$location.search()["sysparm_stack"]).replace();
				}else{
$window.top.history.replaceState(null, title, '/nav_to.do?uri=%2Fsys_report_template.do%3Fjvar_report_id%3D' + id);
$location.url('/sys_report_template.do?jvar_report_id=' + id).replace();
				}
			}
if (!gel('printURL')) {
				var input = document.createElement('input');
				input.value = $location.url();
				input.type = 'hidden';
				input.id = 'printURL';
				document.body.appendChild(input);
			} else
				gel('printURL').value = $location.url();
		},
		goBack: function goBack(message) {
var redirectUrl = $location.search().sysparm_stack;
			var isSamePageRedirect =
				document.referrer.indexOf('sys_report_template.do') !== -1
				&& $location.url().indexOf('sys_report_template.do') !== -1;
			if (typeof redirectUrl === 'string')
				$window.location.href = redirectUrl;
			else if (document.referrer
					&& document.referrer.indexOf('nav_to.do') === -1
					&& document.referrer.indexOf('navpage.do') === -1
					&& document.referrer !== $window.location.href
					&& !decodeURIComponent(document.referrer).endsWith($location.url())
					&& !isSamePageRedirect)
				$window.location.href = document.referrer;
			else
$window.location.href = '/report_home.do';
			this.showMessage(message);
		},
		reloadPage: function reloadPage() {
			$window.location.reload(true);
		},
		replaceAll: function replaceAll(source, search, replace) {
			if (!replace)
				return source.toString();
			return source.split(search).join(replace);
		},
		setPageTitle: function setPageTitle(title) {
			if (title)
				document.title = title;
			else
				document.title = gReport.i18n.createReport;
		},
		setNavigationTitle: function setPageTitle(title, sysId) {
			CustomEvent.fireTop('magellanNavigator.permalink.set', { title, relativePath: "sys_report_template.do?jvar_report_id="+sysId });
		},
		applySelect2: function applySelect2(options) {
			$timeout(function timeoutApply() {
				angular.forEach(angular.element('.sel2:not(.select2-container)'), function eachCb(obj) {
					var $select = angular.element(obj);
					var selectId = $select.attr('id');
					var option = {};
					if (options) {
						var sel2Json = options.filter(function filterOption(entry) {
							return entry.id === selectId;
						}, {});
						option = sel2Json.length ? sel2Json[0].options : {};
					}
					if (!$select.data('select2'))
						$select.select2(option);
				});
			}, 500);
		},
		resetIndividualSelect2: function resetIndividualSelect2(elementId) {
			var $select = angular.element('#' + elementId);
			$select.select2('val', $select.val());
		},
		resetSelect2: function resetSelect2() {
			$timeout(function timeoutReset() {
				angular.forEach(angular.element('.sel2:not(.select2-container)'), function eachObj(obj) {
					var $select = angular.element(obj);
					$select.select2('val', $select.val());
				});
			}, 500);
		},
		isFieldEqual: function isFieldEqual(field1, field2) {
			var lastField1;
			var lastField2;
			var field1Split = field1.split('.');
			if (field1Split && field1Split.length)
				lastField1 = field1Split[field1Split.length - 1];
			var field2Split = field2.split('.');
			if (field2Split && field2Split.length)
				lastField2 = field2Split[field2Split.length - 1];
			if (lastField1 && lastField2)
				return lastField1 === lastField2;
			return false;
		},
		areObjectsEqualUsingSourceType: function areObjectsEqualUsingSourceType(reportAfterChanges, reportBeforeChanges, sourceType) {
			var ignoredProperties = [];
			ignoredProperties.push('sysparm_field_name');
			ignoredProperties.push('sysparm_stack_field_name');
			ignoredProperties.push('sysparm_trend_field_name');
			ignoredProperties.push('sysparm_sumfield_name');
			ignoredProperties.push('sysparm_sumfield_type');
			ignoredProperties.push('sysparm_box_field_name');
			ignoredProperties.push('sysparm_cal_field_name');
			if (!chartTypes.hasColorFields(reportAfterChanges.sysparm_type))
				ignoredProperties.push('sysparm_set_color');
			if (sourceType && sourceType === sourceTypeNames.metricBase) {
				ignoredProperties.push('sysparm_custom_config.table');
				ignoredProperties.push('sysparm_custom_config.query_condition');
				ignoredProperties.push('sysparm_custom_config.group_by');
			}
			var reportAfterChangesCopy = this.clone(reportAfterChanges, ignoredProperties);
			var reportBeforeChangesCopy = this.clone(reportBeforeChanges, ignoredProperties);
			return this.areObjectsEqual(reportAfterChangesCopy, reportBeforeChangesCopy);
		},
		areObjectsEqual: function areObjectsEqual(obj1, obj2) {
return (JSON.stringify(obj1) === JSON.stringify(obj2));
		},
		clone: function clone(obj, ignoredProperties) {
			var self = this;
			var objCopy = angular.copy(obj);
			ignoredProperties.forEach(function resetPropertyCb(propertyToBeIgnored) {
				self.setValue(objCopy, propertyToBeIgnored, '');
			});
			var ordered = {};
			if (objCopy) {
				Object.keys(objCopy).sort().forEach(function(key) {
				  ordered[key] = objCopy[key];
				});
			}
			return ordered;
		},
		setValue: function setValue(object, path, value) {
			var a = path.split('.');
			var o = object;
			for (var i = 0; i < a.length - 1; i++) {
				var n = a[i];
				if (o && n in o)
					o = o[n];
				else
					return;
			}
			if (o && typeof o === 'object')
				o[a[a.length - 1]] = value;
		},
extendParams: function extendParams(dest, source) {
			for (var key in source) {
				if (source[key] === 'true')
					source[key] = true;
				if (source[key] === 'false')
					source[key] = false;
if (source[key] === false || source[key])
					dest[key] = source[key];
			}
			return dest;
		},
		escapeHtml: function escapeHtml(text) {
			var self = this;
return String(text).replace(/[&<>"'\/]/g, function replaceCb(char) {
				return self.entityMap[char];
			});
		},
		cleanMultiSelectValues: function cleanMultiSelectValues(glideListId) {
			angular.element('#select_0' + glideListId).html('');
			angular.element('#remove\\.' + glideListId).get(0).disabled = true;
			angular.element('#view2link\\.' + glideListId).get(0).disabled = true;
		},
		setMultiSelectValues: function setMultiSelectValues(array, selectId) {
			if (array.length) {
				var selectElt = angular.element('#' + selectId);
				selectElt.empty();
				angular.forEach(array, function eachEl(obj) {
var optionElt = angular.element('<option />');
					optionElt.attr('value', obj.value);
					optionElt.text(obj.name);
					selectElt.append(optionElt);
				});
			}
		},
		getMultiSelectValues: function getMultiSelectValues(selectId) {
			if (selectId) {
				var selected = [];
				angular.forEach(angular.element('#' + selectId + ' option'), function eachEl(option, i) {
					selected[i] = {};
					selected[i].name = angular.element(option).text();
					selected[i].value = angular.element(option).val();
				});
				return selected;
			}
			return null;
		},
		clearMultipivotDisplayFields: function clearMultipivotDisplayFields() {
			$j('#sys_display\\.sysparm_x_axis_category_fields, #sys_display\\.sysparm_y_axis_category_fields').val('');
		},
		buildCustomConfig: function buildCustomConfig(report) {
			var customConfig = angular.copy(report.sysparm_custom_config) || {};
			customConfig.table = report.sysparm_table;
			customConfig.query_condition = report.sysparm_query;
			return customConfig;
		},
		setupReportParams: function setupReportParams(report) {
			var params = {};
			params.table = report.sysparm_table;
			params.report_id = report.sysparm_report_id;
			params.title = report.sysparm_title || report.sysparm_series_name_text;
			params.display_grid = report.sysparm_display_grid;
			params.other_threshold = report.sysparm_others;
			params.compute_percent = chartTypes.isPieType() ? 'aggregate' : report.sysparm_compute_percent;
			params.chart_size = report.sysparm_chart_size;
			params.custom_chart_size = report.sysparm_custom_chart_size ? 'true' : 'false';
			params.chart_height = report.sysparm_custom_chart_height;
			params.chart_width = report.sysparm_custom_chart_width;
			params.show_other = report.sysparm_show_other;
			params.apply_alias = report.sysparm_apply_alias;
			params.chart_type = report.sysparm_type;
			params.group_by = report.sysparm_field;
			params.filter = report.sysparm_query;
			params.aggregate = report.sysparm_aggregate;
			params.aggregation_source = report.sysparm_aggregation_source;
			params.agg_field = report.sysparm_sumfield;
			params.stack_field = report.sysparm_stack_field;
			params.box_field = report.sysparm_box_field;
			params.trend_field = report.sysparm_trend_field;
			params.trend_interval = report.sysparm_trend_interval;
			params.funnel_neck_percent = report.sysparm_funnel_neck_percent;
			params.calendar = report.sysparm_calendar;
			params.donut_width_percent = report.sysparm_donut_width_percent;
			params.gauge_autoscale = report.sysparm_gauge_autoscale;
			params.from = report.sysparm_from;
			params.to = report.sysparm_to;
			params.upper_limit = report.sysparm_upper_limit;
			params.lower_limit = report.sysparm_lower_limit;
			params.direction = report.sysparm_direction;
			params.chart_title = report.sysparm_chart_title;
			params.show_chart_title = report.sysparm_show_chart_title;
			params.chart_title_size = report.sysparm_chart_title_size;
			params.chart_title_color = report.sysparm_chart_title_color;
			params.custom_chart_title_position = report.sysparm_custom_chart_title_position;
			params.chart_title_x_position = report.sysparm_chart_title_x_position;
			params.chart_title_y_position = report.sysparm_chart_title_y_position;
			params.show_chart_border = report.sysparm_show_chart_border;
			params.title_horizontal_alignment = report.sysparm_title_horizontal_alignment;
			params.title_vertical_alignment = report.sysparm_title_vertical_alignment;
			params.legend_horizontal_alignment = report.sysparm_legend_horizontal_alignment;
			params.legend_vertical_alignment = report.sysparm_legend_vertical_alignment;
			params.chart_border_width = report.sysparm_chart_border_width;
			params.chart_border_radius = report.sysparm_chart_border_radius;
			params.chart_border_color = report.sysparm_chart_border_color;
			params.score_color = report.sysparm_score_color;
			params.chart_background_color = report.sysparm_chart_background_color;
			params.legend_border_width = report.sysparm_legend_border_width;
			params.legend_border_radius = report.sysparm_legend_border_radius;
			params.legend_border_color = report.sysparm_legend_border_color;
			params.legend_background_color = report.sysparm_legend_background_color;
			params.legend_items_left_align = report.sysparm_legend_items_left_align;
			params.show_legend = report.sysparm_show_legend;
			params.show_legend_border = report.sysparm_show_legend_border;
			params.show_chart_data_label = report.sysparm_show_chart_data_label;
			params.show_data_label_position_middle = report.sysparm_show_data_label_position_middle;
			params.allow_data_label_overlap = report.sysparm_allow_data_label_overlap;
			params.show_geographical_label = report.sysparm_show_geographical_label;
			params.show_zero = report.sysparm_show_zero;
			params.show_marker = report.sysparm_show_marker;
			params.bar_unstack = report.sysparm_bar_unstack;
			params.x_axis_title = report.sysparm_x_axis_title;
			params.x_axis_title_size = report.sysparm_x_axis_title_size;
			params.x_axis_title_color = report.sysparm_x_axis_title_color;
			params.x_axis_title_bold = report.sysparm_x_axis_title_bold;
			params.x_axis_opposite = report.sysparm_x_axis_opposite;
			params.x_axis_grid_width = report.sysparm_x_axis_grid_width;
			params.x_axis_grid_color = report.sysparm_x_axis_grid_color;
			params.x_axis_display_grid = report.sysparm_x_axis_display_grid;
			params.x_axis_grid_dotted = report.sysparm_x_axis_grid_dotted;
			params.x_axis_label_size = report.sysparm_x_axis_label_size;
			params.x_axis_label_color = report.sysparm_x_axis_label_color;
			params.x_axis_label_bold = report.sysparm_x_axis_label_bold;
			params.show_y_axis = report.sysparm_show_y_axis;
			params.y_axis_title = report.sysparm_y_axis_title;
			params.y_axis_title_size = report.sysparm_y_axis_title_size;
			params.y_axis_title_color = report.sysparm_y_axis_title_color;
			params.y_axis_title_bold = report.sysparm_y_axis_title_bold;
			params.y_axis_opposite = report.sysparm_y_axis_opposite;
			params.y_axis_grid_width = report.sysparm_y_axis_grid_width;
			params.y_axis_grid_color = report.sysparm_y_axis_grid_color;
			params.y_axis_display_grid = report.sysparm_y_axis_display_grid;
			params.y_axis_grid_dotted = report.sysparm_y_axis_grid_dotted;
			params.y_axis_from = report.sysparm_y_axis_from;
			params.y_axis_to = report.sysparm_y_axis_to;
			params.y_axis_label_size = report.sysparm_y_axis_label_size;
			params.y_axis_label_color = report.sysparm_y_axis_label_color;
			params.y_axis_label_bold = report.sysparm_y_axis_label_bold;
			params.report_source_id = report.sysparm_report_source_id;
			params.sc_groupby_item_id = report.sysparm_sc_groupby_item_id;
			params.sc_groupby_variable_id = report.sysparm_sc_groupby_variable_id;
			params.sc_stackby_item_id = report.sysparm_sc_stackby_item_id;
			params.sc_stackby_variable_id = report.sysparm_sc_stackby_variable_id;
			params.list_ui_view = report.sysparm_list_ui_view;
			params.report_drilldown = report.sysparm_report_drilldown;
			params.show_chart_total = report.sysparm_show_chart_total;
			params.use_color_heatmap = report.sysparm_use_color_heatmap_map;
			params.axis_max_color = report.sysparm_axis_max_color;
			params.axis_min_color = report.sysparm_axis_min_color;
			params.ct_column = report.sysparm_ct_column;
			params.ct_row = report.sysparm_ct_row;
			params.interactive_report = report.sysparm_interactive_report;
			params.use_default_colors = report.sysparm_use_default_colors;
			params.set_color = report.sysparm_set_color;
			params.color = report.sysparm_chart_color;
			params.colors = report.sysparm_chart_colors;
			params.color_palette = report.sysparm_color_palette;
			params.decimal_precision = report.sysparm_decimal_precision;
			params.show_empty = true;
			params.other_series = '';
			params.report_map = report.sysparm_report_map;
			params.report_map_source = report.sysparm_report_map_source;
			params.additional_groupby = report.sysparm_additional_groupby;
			params.original_groupby = report.sysparm_field;
			params.original_stackby = report.sysparm_stack_field;
			params.pivot_expanded = report.sysparm_pivot_expanded;
			params.display_row_lines = report.sysparm_display_row_lines;
			params.display_column_lines = report.sysparm_display_column_lines;
			params.series_name_text = report.sysparm_series_name_text;
			params.use_null_in_trend = report.sysparm_use_null_in_trend;
			params.source_type = report.sysparm_source_type;
			if (params.source_type === sourceTypeNames.metricBase) {
				params.custom_config = this.buildCustomConfig(report);
				params.start_time = report.sysparm_start_time;
				params.end_time = report.sysparm_end_time;
			}
			params.is_published = report.sysparm_is_published;
			params.x_axis_category_fields = report.sysparm_x_axis_category_fields;
			params.y_axis_category_fields = report.sysparm_y_axis_category_fields;
			params.cal_field = report.sysparm_cal_field;
params.sysparm_report_designer_builder = 'true';
			params.set_redirect = report.sysparm_set_redirect;
			params.formatting_configuration = report.sysparm_formatting_configuration;
			params.datasets_formatting_configuration = report.sysparm_datasets_formatting_configuration;
			setupSeries(params);
			return params;
		},
		removeObjectFromArray: function removeObjectFromArray(jsonArray, key, value) {
			var index = jsonArray.map(function mapEl(el) { return el[key]; }).indexOf(value);
			jsonArray.splice(index, 1);
			return jsonArray;
		},
		isInteger: function(value) {
			return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
		},
		arraysEqual: function arraysEqual(a, b) {
			if (a === b)
				return true;
			if (a === null || b === null)
				return false;
			if (a.length !== b.length)
				return false;
			return a.sort().toString() === b.sort().toString();
		},
		isVariables: function isVariables(fieldName){
			return fieldName && fieldName.startsWith('variables.');
		},
	};
}]);
;
/*! RESOURCE: /reportdesigner/services/service.defaults.js */
angular.module('reportDesigner').factory('defaults', [function defaultsFactory() {
	'use strict';
	return {
		access: {
			write: false,
			read: false,
			delete: false,
			create: false,
			dataset: {
				create: false
			},
			roles: {
				report_admin: false,
				report_global: false,
				report_group: false,
				report_publisher: false,
				report_scheduler: false
			}
		},
		statuses: {
			success: 'SUCCESS',
			failure: 'FAILURE'
		},
		modals: {
			coloringRules: '#coloring-rules-modal',
			sharing: '#security-settings-modal',
			listColumns: '#field-list-modal',
			xPivot: '#x-pivot-modal',
			yPivot: '#y-pivot-modal',
			additionalGroupBy: '#additional-groupby-modal',
			deleteDialogConfirmation: '#delete-report-modal',
			exportToPdf: '#export-to-pdf-modal',
			sheduleReportSaveDialog: '#schedule-report-save-dialog',
			shareReportSaveDialog: '#share-report-save-dialog',
			exportToPdfReportSaveDialog: '#export-to-pdf-report-save-dialog',
			addToDashboardReportSaveDialog: '#add-to-dashboard-report-save-dialog',
			deleteDatasetDialogConfirmation: '#delete-dataset-modal',
			deleteDrilldownDialogConfirmation: '#delete-drilldown-modal',
			unsavedDialogConfirmation: '#unsaved-save-dialog',
			importModal: '#import-modal',
			redirectToUrlDialog: '#redirect-to-url-dialog',
			configureAliases: '#alias-modal',
			configureFunctionField: '#function-field-modal',
			formatView: '#format-view',
			unsavedSaveDialogAliases: '#unsaved-save-dialog-aliases',
			unsavedSaveDialogFuncField: '#unsaved-save-dialog-func-field',
			nlqHelpModal: '#nlq-help-modal',
		},
		filterConfig: {
			saveFilter: false,
			loadFilter: false,
			runFilter: false,
			clearFilter: true,
			outputType: 'encoded_query',
			watchConfig: true,
			sortFilter: true,
			relatedListQueryConditions: true,
		}
	};
}]);
;
/*! RESOURCE: /reportdesigner/services/service.mocks.js */
angular.module('reportDesigner').factory('mocks', function() {
	'use strict';
	return {
		metricBaseTables : [
			{"label":"Metric Base System Series","name":"v_clotho_series"}
		]
		
	}
});
;
/*! RESOURCE: /reportdesigner/services/service.typeLogic.js */
angular.module('reportDesigner').factory('typeLogic', ['sourceTypeNames', 'chartTypeNames', 'sourceTypes', 'chartTypes', function sourceTypesFactory(sourceTypeNames, chartTypeNames, sourceTypes, chartTypes) {
	'use strict';
	var defaultChartTypes = {};
	defaultChartTypes[sourceTypeNames.table] = chartTypeNames.LIST;
	defaultChartTypes[sourceTypeNames.metricBase] = chartTypeNames.STEP_LINE;
	defaultChartTypes[sourceTypeNames.externalImport] = chartTypeNames.LIST;
	defaultChartTypes[sourceTypeNames.reportSource] = chartTypeNames.LIST;
	return {
		defaultChartTypes: defaultChartTypes,
		canBeSorted: function (sourceType, chartType) {
			return (chartType !== chartTypeNames.CALENDAR) && sourceTypes.isNotMetricBase(sourceType);
		},
		canDrilldown: function (sourceType, chartType) {
			return chartTypes.hasDrillDown(chartType) && sourceTypes.isNotMetricBase(sourceType);
		},
		hasDecimalPrecision: function (sourceType, chartType, isDataset) {
			return !(chartType === chartTypeNames.PIVOT || chartType === chartTypeNames.CALENDAR || chartType === chartTypeNames.PARETO || chartType === chartTypeNames.HISTOGRAM)
			&& sourceTypes.isNotMetricBase(sourceType)
			&& !isDataset;
		},
		shouldResetChartType: function(fromSourceType, toSourceType) {
			 if (fromSourceType !== sourceTypeNames.metricBase && toSourceType !== sourceTypeNames.metricBase)
			 	return false
			return true;
		},
		canShowLegendTab: function(reportSourceType,report,isDataset) {
			if(isDataset)
				return false;
			if(reportSourceType === sourceTypeNames.metricBase)
				return true;
			return chartTypes.hasLegendOptions(report);
		},
		
		getLoadedSourceType: function(sourceType) {
			var whatIsLoaded = '';
			
			if (sourceType.tables && sourceType.tables.length)
				whatIsLoaded = 'tables'; 	
			if (sourceType.sources && sourceType.sources.length)
				whatIsLoaded += ',sources';
			if (sourceType.import && sourceType.import.length)
				whatIsLoaded += ',import';
			if (sourceType.metric && sourceType.metric.length)
				whatIsLoaded += ',metricbase';
				
			if (whatIsLoaded.startsWith(','))
				whatIsLoaded = whatIsLoaded.substring(1);
			
			return whatIsLoaded;
		}
	};
}]);
;
/*! RESOURCE: /reportdesigner/services/service.dotWalkingFilters.js */
angular.module('reportDesigner').factory('dotWalkingFilters', ['fieldTypeNames', 'chartTypes', 'chartTypeNames', function dotWalkingFilters(fieldTypeNames, chartTypes, chartTypeNames) {
	'use strict';
	var numericTypes = [
		fieldTypeNames.INTEGER,
		fieldTypeNames.LONGINT,
		fieldTypeNames.DECIMAL,
		fieldTypeNames.NUMERIC,
		fieldTypeNames.FLOAT,
		fieldTypeNames.DOMAIN_NUMBER,
		fieldTypeNames.AUTO_INCREMENT,
		fieldTypeNames.PERCENT_COMPLETE
	];
	var numbers = [
		fieldTypeNames.INTEGER,
		fieldTypeNames.LONGINT,
		fieldTypeNames.DECIMAL,
		fieldTypeNames.NUMERIC,
		fieldTypeNames.FLOAT,
		fieldTypeNames.PERCENT_COMPLETE
	];
	var dateTypes = [
		fieldTypeNames.DATE,
		fieldTypeNames.DATETIME,
		fieldTypeNames.DUE_DATE,
		fieldTypeNames.GLIDE_DATE,
		fieldTypeNames.GLIDE_DATE_TIME
	];
	function isNumeric(type) {
		return (numericTypes.indexOf(type) > -1);
	}
	function isDate(type) {
		return (dateTypes.indexOf(type) > -1);
	}
	function isNumber(type) {
		return (numbers.indexOf(type) > -1);
	}
	function isArray(item) {
		return (item.array && item.array === 'yes');
	}
	function isChoice(type) {
		return (type === fieldTypeNames.CHOICE);
	}
	function getChoice(item) {
		return item.choice_type;
	}
	function setNamedAttributes(attributes) {
		var namedAttributes = {};
		var pairs = attributes.split(',');
		for (var i = 0; i < pairs.length; i++) {
			var parts = pairs[i].split('=');
			if (parts.length === 2)
				namedAttributes[parts[0]] = parts[1];
		}
		return namedAttributes;
	}
	function canSort(item) {
		if (!item.cansort || item.name.indexOf('password') > -1 || item.name === 'sys_id' || item.internal_type === fieldTypeNames.JOURNAL || item.internal_type === fieldTypeNames.JOURNAL_INPUT || isArray(item))
			return false;
		return true;
	}
	function isEdgeEncryptedField(item) {
		return (["fixed"].indexOf(item.edge_encryption_type) > -1);
	}
	function isVariableType(item) {
		if (!item)
			return false;
		return item.internal_type === fieldTypeNames.VARIABLE || item.internal_type === fieldTypeNames.VARIABLES ||
			item.base_type === fieldTypeNames.VARIABLE;
	}
	function canGroup(item) {
		var namedAttributes = {};
		if (item.attributes && item.attributes.length)
			namedAttributes = setNamedAttributes(item.attributes);
		if ((namedAttributes.can_group && namedAttributes.can_group === 'true') 
|| (item.cangroup && item.internal_type === fieldTypeNames.REFERENCE ))
			return true;
		if (item.edge_encrypted && item.canmatch)
			return true;
		if (item.extended_table)
			return true;
		if (item.multitext || item.internal_type === fieldTypeNames.GLIDE_LIST || !canSort(item))
			return false;
		if (item.internal_type === fieldTypeNames.GLIDE_DURATION)
			return true;
		if (item.internal_type === fieldTypeNames.GLIDE_DATE_TIME || item.internal_type === fieldTypeNames.GLIDE_DATE || item.internal_type === fieldTypeNames.GLIDE_TIME || item.internal_type === fieldTypeNames.DUE_DATE)
			return false;
		return true;
	}
	function nonChoiceNumericFilter(item) {
		if (isNumeric(item.internal_type)) {
			if (isChoice(item.internal_type))
				return false;
			return true;
		}
		return false;
	}
	function distinctFilter(item) {
		if (item.internal_type === fieldTypeNames.REFERENCE || item.internal_type === fieldTypeNames.DOMAIN_ID || isChoice(item.internal_type) || item.name.endsWith('sys_id') || item.internal_type === fieldTypeNames.DOCUMENT_ID)
			return true;
		return false;
	}
	function sumFilterWithDuration(item) {
		if (chartTypes.getType() === chartTypeNames.PIVOT && item.type === fieldTypeNames.CURRENCY2)
			return false;
		if (isNumeric(item.internal_type) || item.internal_type === fieldTypeNames.REFERENCE || item.internal_type === fieldTypeNames.DOMAIN_ID || item.internal_type === fieldTypeNames.GLIDE_DURATION || item.internal_type === fieldTypeNames.TIMER || item.internal_type === fieldTypeNames.CURRENCY || item.internal_type === fieldTypeNames.PRICE || item.type === fieldTypeNames.CURRENCY2)
			return true;
		return false;
	}
	function sumFilterNoDuration(item) {
		if (isNumeric(item.internal_type) || item.internal_type === fieldTypeNames.REFERENCE || item.internal_type === fieldTypeNames.DOMAIN_ID || item.internal_type === fieldTypeNames.CURRENCY || item.internal_type === fieldTypeNames.PRICE || item.internal_type === fieldTypeNames.CURRENCY2)
			return true;
		return false;
	}
	function sumFilter(item) {
		var chartType = chartTypes.getType();
		if (item.internal_type === fieldTypeNames.REFERENCE || item.internal_type === fieldTypeNames.DOMAIN_ID)
			item.non_selectable = true;
		if (chartType === fieldTypeNames.HEATMAP || chartType === fieldTypeNames.BUBBLE || chartTypes.isGaugeType())
			return sumFilterNoDuration(item);
		return sumFilterWithDuration(item);
	}
	return {
		sortByFilter: function(item, config) {
			if (isVariableType(item))
				return !chartTypes.isVariableOrQuestionsNotSupported();
			
			var baseCondition = !isEdgeEncryptedField(item) && canSort(item);
			if (baseCondition && ((config.currentLevel === 1 && isDate(item.internal_type)) || config.currentLevel === 0))
				return true;
			return false;
		},
		groupByFilter: function groupByFilter(item) {
			var chartType = chartTypes.getType();
			if (item.internal_type === fieldTypeNames.VARIABLE || item.internal_type === fieldTypeNames.VARIABLES || item.base_type === fieldTypeNames.VARIABLE) {
				if (chartType !== chartTypeNames.PIVOT && chartType !== chartTypeNames.BOX && chartType !== chartTypeNames.TRENDBOX)
					return true;
				return false;
			}
			if (chartType === chartTypeNames.PIVOT && item.type === fieldTypeNames.CURRENCY2)
				return false;
			if (item.type === fieldTypeNames.VARIABLE_CHOICE)
				return true;
			if (isDate(item.internal_type) || canGroup(item))
				return true;
			return false;
		},
		groupByFilterMetric: function groupByFilterMetric(item) {
			if (item.name === fieldTypeNames.VARIABLES || item.internal_type === fieldTypeNames.VARIABLES || item.internal_type === fieldTypeNames.VARIABLE)
				return false;
			if (item.internal_type === fieldTypeNames.QUESTIONS || isDate(item.internal_type))
				return false;
			if (isNumeric(item.internal_type) && !isChoice(item.internal_type))
				return false;
			if (canGroup(item))
				return true;
			return false;
		},
		stackByFilter: function stackByFilter(item) {
			var namedAttributes = {};
			if (item.internal_type === fieldTypeNames.VARIABLE || item.internal_type === fieldTypeNames.VARIABLES || item.base_type === fieldTypeNames.VARIABLE) {
				var chartType = chartTypes.getType();
				if (chartType !== chartTypeNames.PIVOT && chartType !== chartTypeNames.LIST && chartType !== chartTypeNames.BOX && chartType !== chartTypeNames.TRENDBOX)
					return true;
				return false;
			}
			if (item.type === fieldTypeNames.VARIABLE_CHOICE)
				return true;
			if (item.attributes && item.attributes.length)
				namedAttributes = setNamedAttributes(item.attributes);
			if (item.internal_type === fieldTypeNames.REFERENCE || item.internal_type === fieldTypeNames.DOMAIN_ID || item.internal_type === fieldTypeNames.BOOLEAN)
				return true;
			var choice = getChoice(item);
			if (choice === 1 || choice === 3)
				return true;
			if (namedAttributes.can_stack && namedAttributes.can_stack === 'true')
				return true;
			if (item.internal_type === fieldTypeNames.VARIABLES)
				return true;
			return false;
		},
		trendByFilter: function trendByFilter(item) {
			if (item.internal_type === fieldTypeNames.REFERENCE || item.internal_type === fieldTypeNames.DOMAIN_ID)
				item.non_selectable = true;
			if (isDate(item.internal_type) || item.internal_type === fieldTypeNames.REFERENCE || item.internal_type === fieldTypeNames.DOMAIN_ID)
				return true;
			return false;
		},
		calendarFilter: function calendarFilter(item) {
			if (isDate(item.internal_type))
				return true;
			return false;
		},
		boxFilter: function boxFilter(item) {
			var chartType = chartTypes.getType();
			if (chartType === chartTypeNames.HISTOGRAM)
				return nonChoiceNumericFilter(item);
			if (item.internal_type === fieldTypeNames.GLIDE_DURATION || item.internal_type === fieldTypeNames.CURRENCY)
				return true;
			var choice = getChoice(item);
			if (choice === 1 || choice === 3)
				return false;
			if (isNumber(item.internal_type))
				return true;
			return false;
		},
		rowFilter: function rowFilter(item) {
			if (item.internal_type === fieldTypeNames.VARIABLES)
				return false;
			var chartType = chartTypes.getType();
			if (chartType === chartTypeNames.PIVOT || chartType === chartTypeNames.HEATMAP)
				return this.groupByFilter(item);
			if (chartType === chartTypeNames.BUBBLE) {
				if (item.internal_type === fieldTypeNames.REFERENCE || item.internal_type === fieldTypeNames.DOMAIN_ID || item.type === fieldTypeNames.CURRENCY2)
					item.non_selectable = true;
				return sumFilterNoDuration(item);
			}
			return false;
		},
		columnFilter: function columnFilter(item) {
			return this.rowFilter(item);
		},
		sumFilter: sumFilter,
		distinctFilter: distinctFilter
	};
}]);
;
/*! RESOURCE: /reportdesigner/services/service.variables.js */
angular.module('reportDesigner').factory('variables', function variablesFactory() {
	'use strict';
	var fields = {
		groupBy: ['sysparm_field','sysparm_sc_groupby_item_id','sysparm_sc_groupby_variable_id'],
		stackBy: ['sysparm_stack_field','sysparm_sc_stackby_item_id','sysparm_sc_stackby_variable_id'],
		query: 'sysparm_query'
	};
	function normalize(report, columns){
		if (columns && columns.length<3)
			return;
		if (report[columns[0]] && report[columns[0]].indexOf('variables.') !== -1){
			var x = report[columns[0]];
var re = /^(?:[\da-zA-Z_]+\.)*variables\.([\da-z]+)\.([\da-z]+)$/;
			var match = re.exec(x);
		 	if (match) {
		 		report[columns[0]] = x.substring(0,x.indexOf('variables')+9);
				if (match[1])
report[columns[1]] = match[1];
				if (match[2]) {
report[columns[2]] = match[2];
					report[columns[0]] = report[columns[0]] + '.' + match[2];
				}
			}
		}
	}
	function normalizeVariableField(variableField) {
		var parts = variableField.split(".");
		if (parts.length === 3)
			parts.splice(1, 1);
		return parts.join(".");
	}
	function extractAndNormalizeOrderByConditions(report, field) {
		var filter = report[field];
		if (filter && filter.indexOf("ORDERBYvariables.") === -1 && filter.indexOf("ORDERBYDESCvariables.") === -1)
			return;
		var _isMatched = function (value, validExpressions) {
			for (var j = 0; j < validExpressions.length; j++) {
				if (validExpressions[j].test(value))
					return true;
			}
			return false;
		};
var validOrderByExpressions = [/^ORDERBYvariables/, /^ORDERBYDESCvariables/];
		var terms = filter.split('^');
		var validTerms = [];
		for (var i = 0; i < terms.length; i++) {
			if (_isMatched(terms[i], validOrderByExpressions))
				terms[i] = normalizeVariableField(terms[i]);
			validTerms.push(terms[i]);
		}
		var validFilter = validTerms.join('^');
		if (validFilter && validFilter.endsWith('^EQ'))
validFilter = validFilter.substring(0, validFilter.length - 3);
		report[field] = validFilter;
	}
	function normalizeVariables(report) {
		normalize(report, fields.groupBy);
		normalize(report, fields.stackBy);
		extractAndNormalizeOrderByConditions(report, fields.query);
	}
	return {
		normalizeVariables : normalizeVariables
	};
});
;
/*! RESOURCE: /reportdesigner/services/service.cancelation.js */
angular.module('reportDesigner').factory('cancelation', ['$http', function cancelationFactory($http) {
	'use strict';
	return {
		
		cancelRunReport: function cancelRunReport() {
			var params = {};
			params.sysparm_request_params = JSON.stringify({sysparm_report_designer_builder : 'true'});
params.sysparm_timer = new Date().getTime();
			params.sysparm_cancel_transaction = true;
			params.sysparm_chartonform = false;
			params.sysparm_processor = 'ChartDataProcessor';
			params.sysparm_scope = 'global';
			params.sysparm_want_session_messages = true;		
			
			var config = { method: 'POST',
						   url: 'xmlhttp.do',
						   data: $j.param(params),
headers: {'Content-Type': 'application/x-www-form-urlencoded'}
						  };
			return $http(config);
		}
	
	};
}]);
;
/*! RESOURCE: /reportdesigner/services/service.format-commons.js */
angular.module('reportDesigner').factory('format-commons', ['chartTypeNames', function formatFactory(chartTypeNames) {
	'use strict';
	return {
		showElement: {
			hideTooltipsCheckbox: [
				chartTypeNames.MULTIPIVOT,
				chartTypeNames.SINGLE_SCORE,
			],
			reportTypesAddValueInTooltip: [
				chartTypeNames.MULTIPIVOT,
			]
		},
		formatTypes: {
			DURATION: {
				name: 'duration',
				types: {
					AGGREGATION: 'AGGREGATION',
					GROUP_BY: 'GROUP_BY',
					STACK_BY: 'STACK_BY',
					ROWS: 'ROWS',
					COLS: 'COLUMNS',
					TREND: 'TREND_BY',
					MEASURED_BY: 'MEASURED_BY'
				}
			}
		},
		duration: {
			timeUnits: {
				DAY: {
					value: 'DAY',
					display: 'format_duration_day',
					order: 1
				},
				HOUR: {
					value: 'HOUR',
					display: 'format_duration_hour',
					order: 2
				},
				MINUTE: {
					value: 'MINUTE',
					display: 'format_duration_minute',
					order: 3
				},
				SECOND: {
					value: 'SECOND',
					display: 'format_duration_second',
					order: 4
				},
			},
			unit: [
				{
					value: true,
					display: 'format_unit_short',
					selected: false
				},
				{
					value: false,
					display: 'format_unit_long',
					selected: true
				},
			],
			timeUnitsArray: function () {
				return [this.timeUnits.DAY, this.timeUnits.HOUR, this.timeUnits.MINUTE, this.timeUnits.SECOND];
			},
			rounding: [
				{
					value: 'UP',
					display: 'format_rounding_up',
					helpMessage: gReport.i18n.format_rounding_info_up
				},
				{
					value: 'DOWN',
					display: 'format_rounding_down',
					helpMessage: gReport.i18n.format_rounding_info_down
				},
				{
					value: 'HALF_UP',
					display: 'format_rounding_half_up',
					helpMessage: gReport.i18n.format_rounding_info_half_up
				},
				{
					value: 'HALF_DOWN',
					display: 'format_rounding_half_down',
					helpMessage: gReport.i18n.format_rounding_info_half_down
				},
				{
					value: 'HALF_EVEN',
					display: 'format_rounding_half_even',
					helpMessage: gReport.i18n.format_rounding_info_half_even
				},
			],
			hideSeconds: [
				{
					value: 'true',
					display: 'format_duration_hide_second'
				},
				{
					value: 'false',
					display: 'format_duration_show_second'
				}],
		},
		number: {
			rounding: [
				{
					value: 'UP',
					display: 'format_rounding_up',
					helpMessage: gReport.i18n.format_rounding_info_up
				},
				{
					value: 'DOWN',
					display: 'format_rounding_down',
					helpMessage: gReport.i18n.format_rounding_info_down
				},
				{
					value: 'CEILING',
					display: 'format_rounding_ceiling',
					helpMessage: gReport.i18n.format_rounding_info_ceiling
				},
				{
					value: 'FLOOR',
					display: 'format_rounding_floor',
					helpMessage: gReport.i18n.format_rounding_info_floor
				},
				{
					value: 'HALF_UP',
					display: 'format_rounding_half_up',
					helpMessage: gReport.i18n.format_rounding_info_half_up
				},
				{
					value: 'HALF_DOWN',
					display: 'format_rounding_half_down',
					helpMessage: gReport.i18n.format_rounding_info_half_down
				},
				{
					value: 'HALF_EVEN',
					display: 'format_rounding_half_even',
					helpMessage: gReport.i18n.format_rounding_info_half_even
				},
			]
		}
	};
}]);
;
/*! RESOURCE: /reportdesigner/services/service.funcFieldService.js */
angular.module('reportDesigner').factory('funcFieldService', ['$http', function funcFieldServiceFactory($http) {
	'use strict';
	var DEFAULT_URLS = {
VALIDATE_FF_ACCESS : 'api/now/reporting/fn_fields/is_supported',
	};
	return {
		isFuncFieldEnabled: function isFuncFieldEnabled(url, config) {
			if (!url)
				url = DEFAULT_URLS.VALIDATE_FF_ACCESS;
			return $http.get(url, config);
		},
	};
}]);
;
/*! RESOURCE: /reportdesigner/services/service.feedback.js */
angular.module('reportDesigner').factory('handleFeedback', ['$http', function feedbackFactory($http) {
	'use strict';
	return {
		positive: function positive(sysId) {
			var config = {
				method: 'POST',
url: 'api/now/nlq/nlq_query_log',
				data: {
					sysId: sysId,
					feedbackSentiment: 'Positive'
				}
			};
			return $http(config);
		},
		negative: function negative(sysId, feedbackProblemCategory) {
			var data = {
				sysId: sysId,
				feedbackSentiment: 'Negative'
			};
			if (feedbackProblemCategory) data.feedbackProblemCategory = feedbackProblemCategory;
			var config = {
				method: 'POST',
url: 'api/now/nlq/nlq_query_log',
				data: data
			};
			return $http(config);
		},
	};
}]);
;
/*! RESOURCE: /reportdesigner/filters/filter.newLineQueryFilter.js */
angular.module('reportDesigner').filter('newLineQueryFilter', ['$sce', function newLineQueryFilter($sce) {
	return function filterCb(query, newLineFlag) {
		var newQuery;
var newLine = newLineFlag ? '<br/>' : '';
		if (query) {
newQuery = query.replace(/\.and\./g, newLine + 'AND ').replace(/\.or\./g, newLine + 'OR ');
			return $sce.trustAsHtml(newQuery);
		}
		return query;
	};
}]);
;
/*! RESOURCE: /reportdesigner/filters/filter.arrayToCSV.js */
angular.module('reportDesigner').filter('arrayToCSV', function arrayToCSV() {
	return function filterCb(inputValue, returnedFormat) {
		var values;
		var input;
if (returnedFormat === 'CSV') {
			input = inputValue || [];
			values = [];
			for (var i = 0; i < input.length; i++)
				values.push(input[i]);
return values.join(',');
}
		input = inputValue || '';
		return input.split(',').map(function mapNumber(stringValue) {
			return Number(stringValue);
		});
	};
});
;
/*! RESOURCE: /reportdesigner/temp_old_global_functions.js */
function reportViewSelectedGrpUserItem(id, tableName) {
    var view2Link = gel('view2link.' + id);
    if (view2Link.disabled)
        return;
    var sysid = glideListGetSelected(gel('select_0' + id));
    var url = new GlideURL(tableName + '.do');
    url.addParam('sys_id', sysid);
    window.location.href = url.getURL();
}
function colsReturned(request, availableSel, selectedSel, colsList, pivotFieldDisplay, showVariables) {
	var tcols = request.responseXML;
	var acols = availableSel;
	var scols = selectedSel;
	var colist = colsList;
	scols.options.length = 0;
	acols.options.length = 0;
	var mfields = [];
	var useSpecFields = false;
	if (colist) {
		mfields = colist.split(',');
		if (mfields.length)
			useSpecFields = true;
	}
	var root = tcols.getElementsByTagName('xml')[0];
	var items = tcols.getElementsByTagName('item');
	var commaSeparatedColumns = '';
	for (var i = 0; i !== items.length; i++) {
		var item = items[i];
		var value = item.getAttribute('value');
		var label = item.getAttribute('label');
		var status = item.getAttribute('status');
		var ref = item.getAttribute('reference');
		if (pivotFieldDisplay && value === 'sys_tags')
			continue;
		if (showVariables === false && value === 'vars')
			continue;
		if (ref === '')
			ref = null;
		var o = enhanceOption(item, value, label, root, status);
		if (useSpecFields) {
			if (valueExistsInArray(value, mfields)) {
				scols.options[scols.options.length] = o;
				if (ref)
					acols.options[acols.options.length] = enhanceOption(item,
							value, label, root, 'available');
			} else {
				acols.options[acols.options.length] = o;
			}
		} else {
			if (status === 'selected') {
				scols.options[scols.options.length] = o;
				if (i>0)
					commaSeparatedColumns += ',';
				commaSeparatedColumns += value;
				if (ref)
					acols.options[acols.options.length] = enhanceOption(item,
							value, label, root, 'available');
			} else {
				acols.options[acols.options.length] = o;
			}
		}
	}
	if (useSpecFields) {
		var newOptions = [];
		for (i = 0; i !== mfields.length; i++) {
			var s = mfields[i];
			for (var z = 0; z !== scols.options.length; z++) {
				if (scols.options[z].value === s) {
					newOptions[newOptions.length] = scols.options[z];
					break;
				}
			}
		}
		scols.options.length = 0;
		for (i = 0; i !== newOptions.length; i++) {
			scols.options.add(newOptions[i]);
		}
	}
	if (pivotFieldDisplay) {
		if (!colsList)
			$j(scols).find('option').remove();
		else
			pivotFieldDisplay.val(
					selectedOptionsToArray(scols).selectedLabels.join(', '));
	}
	return commaSeparatedColumns;
}
function enhanceOption(item, value, label, root, status) {
	var ref = null;
	var xlabel = label;
	if (status !== 'selected') {
		ref = item.getAttribute('reference');
		if (ref) {
			if (ref !== '') {
				xlabel += ' [+]';
			} else
				ref = null;
		}
	}
	var o = new Option(xlabel, value);
	o.cv = value;
	o.cl = label;
	o.title = label;
	var extension = item.getAttribute('extended_field');
	if (ref) {
		o.tl = item.getAttribute('reflabel');
		o.style.color = 'green';
		o.reference = ref;
		o.doNotDelete = 'true';
		if (root) {
			o.bt = root.getAttribute('name');
			o.btl = root.getAttribute('label');
		}
	}
	if (extension === 'true')
		o.style.color = 'darkred';
	return o;
}
function selectedOptionsToArray(selectField) {
	var selectedValues = [];
	var selectedLabels = [];
	$j(selectField).find('option').each(function(i, option) {
		selectedValues[i] = $j(option).val();
		selectedLabels[i] = $j(option).text();
	});
	return {
		selectedValues : selectedValues,
		selectedLabels : selectedLabels
	};
}
function setAndAddOption (field, reportField, sep1, sep2, sep3) {
	moveOption(document.getElementById(field + '_select_0'), document.getElementById(field + '_select_1'), sep1, sep2, sep3);
	saveBucketData(field + '_select_1', reportField);
}
function setAndRemoveOption (field, reportField, sep1, sep2, sep3) {
	moveOption(document.getElementById(field + '_select_1'), document.getElementById(field + '_select_0'), sep1, sep2, sep3);
	saveBucketData(field + '_select_1', reportField);
}
function setAndMoveUp (field, reportField) {
	moveUp(document.getElementById(field));
	saveBucketData(field, reportField);
}
function setAndMoveDown (field, reportField) {
	moveDown(document.getElementById(field));
	saveBucketData(field, reportField);
}
function wantsNoneOption(type) {
    return (type === 'trend' || isLineType(type) || type === 'availability' || type === 'control' || type === 'list' || isGaugeType(type) || type === 'bubble');
}
function resetVariables(variable_field) {
    $j('#' + variable_field).val('');
    $j('#sys_display\\.' + variable_field).val('');
}
function updateReferenceFieldIfEmpty(displayField) {
    if (displayField.value === '') {
        var referenceFieldId = displayField.id.replace('sys_display.','');
        $j('#' + referenceFieldId).val('');
        $j(referenceFieldId).trigger('change');
    }
}
function getAngularScope() {
	return angular.element(document.getElementById("ng-app")).scope();
}
function updateModel(fieldName, value) {
	var $scope = getAngularScope();
	$scope.main.report[fieldName] = value;
	$scope.$apply();
	return $scope.main;
}
function updateModelAndRun(fieldName, value) {
	var main = updateModel(fieldName, value);
	main.runReport();
}
function displayVariablesFields(variablesDivId) {
    $j('#' + variablesDivId).show();
}
function itemsListOpen(referenceFieldId) {
    reflistOpen(referenceFieldId, 'cat_item', 'sc_cat_item');
    return false;
}
function variablesListOpen(referenceFieldId, catalogItemFieldId) {
    var catalogItemId = $j('#' + catalogItemFieldId).val();
    if (catalogItemId) {
    	var query = 'cat_item=' + catalogItemId;
		var sets = new GlideRecord('io_set_item');
		sets.query('sc_cat_item', catalogItemId, function(gr) {
			var setList = new Array();
			while (gr.next())
				setList.push(gr.variable_set + '');
			if (setList.length)
				query += "^ORvariable_setIN" + setList.join(",");
			query += "^question_textISNOTEMPTY";
			reflistOpen(referenceFieldId, 'variables', 'item_option_new', '', false, '', query);
		});
    } else
        reflistOpen(referenceFieldId, 'variables', 'item_option_new');
    return false;
}
function usersGroupsLookup(event) {
	mousePositionSave(event);
	reflistOpen( 'sys_report_users_groups.group_id', 'not', $j('#sys_report_users_groups\\.group_idTABLE').val(), '', 'false', '');
}
function usersGroupsAjaxCompleter(element) {
	if (!element.ac)
		new AJAXReferenceCompleter(element, 'sys_report_users_groups.group_id', '', '', 'sys_user_group');
}
;
/*! RESOURCE: /reportcommon/GwtReportExportScheduleDialog.js */
var GwtReportExportScheduleDialog = Class.create(GlideDialogWindow, {
	initialize: function (reportId, exportType, reportParams,doctype) {
		GlideDialogWindow.prototype.initialize.call(this, 'export_schedule_dialog', false, 350);
		var keys = ["Export to PDF", "Please specify an email address", "Exported report will be emailed to", "The email address specified is not valid"];
		this.msgs = getMessages(keys);
		this.reportId = reportId;
		this.reportParams = reportParams;
		if(exportType == 'PDF-whtp')
			this.whtpParams = this.buildWhtpParams(reportParams);
		this.deliveryPref = 'wait';
		this.exportType = exportType;
		if (doctype === 'true') {
			this.setPreference('table', 'report_export_schedule');
this.setTitle("<div id='export-to-pdf-title' style='padding-top: 15px; padding-left:15px; font-size: 20px; font-weight: normal'>"+ this.msgs["Export to PDF"] +"</div>");
			this.setAriaLabelledBy('export-to-pdf-title');
		} else {
			this.setPreference('table', 'report_export_schedule_non_doctype');
			this.setTitle(this.msgs["Export to PDF"]);
			this.setAriaLabel(this.msgs["Export to PDF"]);
		}
		this.setPreference('sysparm_query', this.reportParams);
		this.setPreference('sysparm_target', exportType == 'PDF-whtp' ? this.whtpParams.url : this.reportId);
		this.setPreference('sysparm_export', this.exportType);
		this.setPreference('sysparm_deliv', this.deliveryPref);
		this.setPreference('focusTrap', true);
		g_export_schedule_dialog = this;
	},
	execute : function() {
		this.render();
		this.on("bodyrendered", function() {
			if(this.exportType == 'PDF-whtp')
				hideObject(jQuery('.export-section')[0], false);
			document.getElementById('export_p').focus();
		});
	},
	close : function() {
		if (g_export_schedule_dialog && typeof g_export_schedule_dialog.destroy == 'function')
			g_export_schedule_dialog.destroy();
		g_export_schedule_dialog = null;
		setTimeout(function() { document.getElementById('export-to-pdf-button').focus(); }, 50);
	},
	ok: function() {
		if(this.deliveryPref == 'email')
			this.emailMe();
		else
			this.waitForIt();
	},
	emailMe : function() {
		var address = gel('display_address');
		if (!address)
			return;
		if (address.value  == '') {
			alert(this.msgs["Please specify an email address"]);
			return;
		}
		if (!isEmailValid(address.value)) {
			alert(this.msgs["The email address specified is not valid"]);
			return;
		}
		var real_address = gel('email_address');
		real_address.value = address.value;
		var fName = 'sys_confirm_report_export.do';
		var confirm_form = gel(fName);
		confirm_form.sys_action.value="email";
		if(this.exportType == 'PDF-whtp')
			confirm_form.sysparm_query.value=this.whtpParams.options;
		var serial = Form.serialize(confirm_form);
		var args = this.msgs["Exported report will be emailed to"] + ' ' + address.value;
		serverRequestPost(fName,  serial, this.ack, args);
		this.close();
	},
	setExportType : function(expType) {
		this.exportType = expType;
	},
	setDeliveryPref : function(pref) {
		this.deliveryPref = pref;
		var emailAddr = gel('emailAddr');
		if(pref == 'email')
			showObject(emailAddr, false);
		else
			hideObject(emailAddr, false);
	},
	waitForIt : function() {
		var dialog;
		if(this.exportType == 'PDF-whtp')
			dialog = new GwtPollDialog(this.whtpParams.url, this.whtpParams.options, 0, '', 'whtpexport');
		else
			dialog = new GwtPollDialog(this.reportId, this.reportParams, this.rows, this.view,  this.exportType);
		dialog.execute();
		this.close();
	},
	ack : function(request, message) {
		alert(message);
	},
	buildWhtpParams: function(reportParams) {
		var chartWidth = "0";
		var chartHeight = "0";
		var chartType = "";
var url = "/report_export_viewer.do?";
var params = reportParams.split(/;(?=sysparm)/g);
		for (var i = 0; i < params.length; i++) {
			var param = params[i];
			if (param && param.indexOf('=') > -1) {
				var index = param.indexOf('=');
				var paramNameValue = [param.substr(0, index), param.substr(index + 1)];
				if ("sysparm_custom_chart_width" == paramNameValue[0])
					chartWidth = paramNameValue[1];
				else if ("sysparm_custom_chart_height" == paramNameValue[0])
					chartHeight = paramNameValue[1];
				url += paramNameValue[0] + "=" + encodeURIComponent(paramNameValue[1]);
				if (i < params.length - 1)
					url += '&';
				if (paramNameValue[0] === "sysparm_type") {
					chartType = paramNameValue[1];
				}
			}
		}
		if (this.reportId)
			url += '&sysparm_report_id=' + this.reportId;
		var options = "{paperSize: {width: " + chartWidth + ", height: " + chartHeight + "}, chartType: "+ chartType +"}";
		return {
			url: url,
			options: options
		};
	}
});
var previousOrientation;
var previousDeliveryValue;
function saveFormatChange() {
	var sel_format = document.getElementById('sysparm_export');
	var rb = document.getElementById('export_l');
	var orientationPortrait = document.getElementById('export_p');
	sel_format.value = 'unloadreport_pdf';
	rb.tabIndex = '-1';
	orientationPortrait.tabIndex = '0';
	var orientation = 'portrait';
	if (rb.checked) {
		orientation = 'landscape';
		sel_format.value = 'unloadreport_pdflandscape';
		rb.tabIndex = '0';
		orientationPortrait.tabIndex = '-1';
	}
	if (window.GlideWebAnalytics && orientation !== previousOrientation) {
		window.GlideWebAnalytics.trackEvent('com.glideapp.report', 'Report Designer - PDF Orientation', orientation, 0);
		previousOrientation = orientation;
	}
	g_export_schedule_dialog.setExportType(sel_format.value);
}
function saveDeliveryPref() {
	var deliv = document.getElementById('sysparm_delivery');
	var generateNow = document.getElementById('wait');
	var rb = document.getElementById('email');
	rb.tabIndex = '-1';
	generateNow.tabIndex = '0';
	deliv.value = 'wait';
	if (rb.checked) {
		deliv.value = 'email';
		rb.tabIndex = '0';
		generateNow.tabIndex = '-1';
	}
	if (window.GlideWebAnalytics && deliv.value !== previousDeliveryValue) {
		window.GlideWebAnalytics.trackEvent('com.glideapp.report', 'Report Designer - PDF Delivery', deliv.value, 0);
		previousDeliveryValue = deliv.value;
	}
	g_export_schedule_dialog.setDeliveryPref(deliv.value);
}
;
/*! RESOURCE: /angularjs-1.4/thirdparty/angular-file-upload/angular-file-upload-all.js */
(function() {
	
function patchXHR(fnName, newFn) {
	window.XMLHttpRequest.prototype[fnName] = newFn(window.XMLHttpRequest.prototype[fnName]);
}
if (window.XMLHttpRequest && !window.XMLHttpRequest.__isFileAPIShim) {
	patchXHR('setRequestHeader', function(orig) {
		return function(header, value) {
			if (header === '__setXHR_') {
				var val = value(this);
				if (val instanceof Function) {
					val(this);
				}
			} else {
				orig.apply(this, arguments);
			}
		}
	});
}
	
var angularFileUpload = angular.module('angularFileUpload', []);
angularFileUpload.version = '3.1.2';
angularFileUpload.service('$upload', ['$http', '$q', '$timeout', function($http, $q, $timeout) {
	function sendHttp(config) {
		config.method = config.method || 'POST';
		config.headers = config.headers || {};
		config.transformRequest = config.transformRequest || function(data, headersGetter) {
			if (window.ArrayBuffer && data instanceof window.ArrayBuffer) {
				return data;
			}
			return $http.defaults.transformRequest[0](data, headersGetter);
		};
		var deferred = $q.defer();
		var promise = deferred.promise;
		config.headers['__setXHR_'] = function() {
			return function(xhr) {
				if (!xhr) return;
				config.__XHR = xhr;
				config.xhrFn && config.xhrFn(xhr);
				xhr.upload.addEventListener('progress', function(e) {
					e.config = config;
					deferred.notify ? deferred.notify(e) : promise.progress_fn && $timeout(function(){promise.progress_fn(e)});
				}, false);
				xhr.upload.addEventListener('load', function(e) {
					if (e.lengthComputable) {
						e.config = config;
						deferred.notify ? deferred.notify(e) : promise.progress_fn && $timeout(function(){promise.progress_fn(e)});
					}
				}, false);
			};
		};
		$http(config).then(function(r){deferred.resolve(r)}, function(e){deferred.reject(e)}, function(n){deferred.notify(n)});
		
		promise.success = function(fn) {
			promise.then(function(response) {
				fn(response.data, response.status, response.headers, config);
			});
			return promise;
		};
		promise.error = function(fn) {
			promise.then(null, function(response) {
				fn(response.data, response.status, response.headers, config);
			});
			return promise;
		};
		promise.progress = function(fn) {
			promise.progress_fn = fn;
			promise.then(null, null, function(update) {
				fn(update);
			});
			return promise;
		};
		promise.abort = function() {
			if (config.__XHR) {
				$timeout(function() {
					config.__XHR.abort();
				});
			}
			return promise;
		};
		promise.xhr = function(fn) {
			config.xhrFn = (function(origXhrFn) {
				return function() {
					origXhrFn && origXhrFn.apply(promise, arguments);
					fn.apply(promise, arguments);
				}
			})(config.xhrFn);
			return promise;
		};
		
		return promise;
	}
	this.upload = function(config) {
		config.headers = config.headers || {};
		config.headers['Content-Type'] = undefined;
		var origTransformRequest = config.transformRequest;
		config.transformRequest = config.transformRequest ? 
				(Object.prototype.toString.call(config.transformRequest) === '[object Array]' ? 
						config.transformRequest : [config.transformRequest]) : [];
		config.transformRequest.push(function(data, headerGetter) {
			var formData = new FormData();
			var allFields = {};
			for (var key in config.fields) allFields[key] = config.fields[key];
			if (data) allFields['data'] = data;
			
			if (config.formDataAppender) {
				for (var key in allFields) {
					config.formDataAppender(formData, key, allFields[key]);
				}
			} else {
				for (var key in allFields) {
					var val = allFields[key];
					if (val !== undefined) {
						if (Object.prototype.toString.call(val) === '[object String]') {
							formData.append(key, val);
						} else {
							if (config.sendObjectsAsJsonBlob && typeof val === 'object') {
formData.append(key, new Blob([val], { type: 'application/json' }));
							} else {
								formData.append(key, JSON.stringify(val));
							}
						}
					}
				}
			}
			if (config.file != null) {
				var fileFormName = config.fileFormDataName || 'file';
				if (Object.prototype.toString.call(config.file) === '[object Array]') {
					var isFileFormNameString = Object.prototype.toString.call(fileFormName) === '[object String]';
					for (var i = 0; i < config.file.length; i++) {
						formData.append(isFileFormNameString ? fileFormName : fileFormName[i], config.file[i], 
								(config.fileName && config.fileName[i]) || config.file[i].name);
					}
				} else {
					formData.append(fileFormName, config.file, config.fileName || config.file.name);
				}
			}
			return formData;
		});
		return sendHttp(config);
	};
	this.http = function(config) {
		return sendHttp(config);
	};
}]);
angularFileUpload.directive('ngFileSelect', [ '$parse', '$timeout', '$compile', 
                                              function($parse, $timeout, $compile) { return {
	restrict: 'AEC',
	require:'?ngModel',
	link: function(scope, elem, attr, ngModel) {
		handleFileSelect(scope, elem, attr, ngModel, $parse, $timeout, $compile);
	}
}}]);
function handleFileSelect(scope, elem, attr, ngModel, $parse, $timeout, $compile) {
	function isInputTypeFile() {
		return elem[0].tagName.toLowerCase() === 'input' && elem.attr('type') && elem.attr('type').toLowerCase() === 'file'; 
	}
	
	var watchers = [];
	function watchForRecompile(attrVal) {
		$timeout(function() {
			if (elem.parent().length) {
				watchers.push(scope.$watch(attrVal, function(val, oldVal) {
					if (val != oldVal) {
						recompileElem();
					}
				}));
			}
		});
	}
	function recompileElem() {
		var clone = elem.clone();
		if (elem.attr('__afu_gen__')) {
			angular.element(document.getElementById(elem.attr('id').substring(1))).remove();
		}
		if (elem.parent().length) {
			for (var i = 0; i < watchers.length; i++) {
				watchers[i]();
			}
			elem.replaceWith(clone);
			$compile(clone)(scope);
		}
		return clone;
	}
	
	function bindAttr(bindAttr, attrName) {
		if (bindAttr) {
			watchForRecompile(bindAttr);
			var val = $parse(bindAttr)(scope);
			if (val) {
				elem.attr(attrName, val);
				attr[attrName] = val;
			} else {
				elem.attr(attrName, null);
				delete attr[attrName];				
			}
		}
	}
	
	bindAttr(attr.ngMultiple, 'multiple');
	bindAttr(attr.ngAccept, 'ng-accept');
	bindAttr(attr.ngCapture, 'capture');
	
	if (attr['ngFileSelect'] != '') {
		attr.ngFileChange = attr.ngFileSelect;
	}
	
	function onChangeFn(evt) {
		var files = [], fileList, i;
		fileList = evt.__files_ || (evt.target && evt.target.files);
		updateModel(fileList, attr, ngModel, scope, evt);
	};
	
	var fileElem = elem;
	if (!isInputTypeFile()) {
		fileElem = angular.element('<input type="file">')
		if (elem.attr('multiple')) fileElem.attr('multiple', elem.attr('multiple'));
		if (elem.attr('accept')) fileElem.attr('accept', elem.attr('accept'));
		if (elem.attr('capture')) fileElem.attr('capture', elem.attr('capture'));
		for (var key in attr) {
			if (key.indexOf('inputFile') == 0) {
				var name = key.substring('inputFile'.length);
				name = name[0].toLowerCase() + name.substring(1);
				fileElem.attr(name, attr[key]);
			}
		}
		fileElem.css('width', '0px').css('height', '0px').css('position', 'absolute').css('padding', 0).css('margin', 0)
				.css('overflow', 'hidden').attr('tabindex', '-1').css('opacity', 0).attr('__afu_gen__', true);
		elem.attr('__refElem__', true);
		fileElem[0].__refElem__ = elem[0];
		elem.parent()[0].insertBefore(fileElem[0], elem[0])
		elem.css('overflow', 'hidden');
		elem.bind('click', function(e) {
			if (!resetAndClick(e)) {
				fileElem[0].click();
			}
		});
	} else {
		elem.bind('click', resetAndClick);
	}
	
	function resetAndClick(evt) {
		if (fileElem[0].value != null && fileElem[0].value != '') {
			fileElem[0].value = null;
if (navigator.userAgent.indexOf("Trident/7") === -1) {
				onChangeFn({target: {files: []}});
			}
		}
		if (!elem.attr('__afu_clone__')) {
if (navigator.appVersion.indexOf("MSIE 10") !== -1 || navigator.userAgent.indexOf("Trident/7") !== -1) {
				var clone = recompileElem();
				clone.attr('__afu_clone__', true);
				clone[0].click();
				evt.preventDefault();
				evt.stopPropagation();
				return true;
			}
		} else {
			elem.attr('__afu_clone__', null);
		}
	}
	
	fileElem.bind('change', onChangeFn);
	
    elem.on('$destroy', function() {
		for (var i = 0; i < watchers.length; i++) {
			watchers[i]();
		}
		if (elem[0] != fileElem[0]) fileElem.remove();
    });
	
	watchers.push(scope.$watch(attr.ngModel, function(val, oldVal) {
		if (val != oldVal && (val == null || !val.length)) {
			if (navigator.appVersion.indexOf("MSIE 10") !== -1) {
				recompileElem();
			} else {
				fileElem[0].value = null;
			}
		}
	}));
	
	function updateModel(fileList, attr, ngModel, scope, evt) {
		var files = [], rejFiles = [];
		var accept = $parse(attr.ngAccept)(scope);
		var regexp = angular.isString(accept) && accept ? new RegExp(globStringToRegex(accept), 'gi') : null;
		var acceptFn = regexp ? null : attr.ngAccept;
		for (var i = 0; i < fileList.length; i++) {
			var file = fileList.item(i);
			if ((!regexp || file.type.match(regexp) || (file.name != null && file.name.match(regexp))) &&
					(!acceptFn || $parse(acceptFn)(scope, {$file: file, $event: evt}))) {
				files.push(file);
			} else {
				rejFiles.push(file);
			}
		}
		$timeout(function() {
			if (ngModel) {
				$parse(attr.ngModel).assign(scope, files);
				ngModel && ngModel.$setViewValue(files != null && files.length == 0 ? '' : files);
				if (attr.ngModelRejected) {
					$parse(attr.ngModelRejected).assign(scope, rejFiles);
				}
			}
			if (attr.ngFileChange && attr.ngFileChange != "") {
				$parse(attr.ngFileChange)(scope, {
					$files: files,
					$rejectedFiles: rejFiles,
					$event: evt
				});
			}
		});
	}
}
angularFileUpload.directive('ngFileDrop', [ '$parse', '$timeout', '$location', function($parse, $timeout, $location) { return {
	restrict: 'AEC',
	require:'?ngModel',
	link: function(scope, elem, attr, ngModel) {
		handleDrop(scope, elem, attr, ngModel, $parse, $timeout, $location);
	}
}}]);
angularFileUpload.directive('ngNoFileDrop', function() { 
	return function(scope, elem, attr) {
		if (dropAvailable()) elem.css('display', 'none')
	}
});
angularFileUpload.directive('ngFileDropAvailable', [ '$parse', '$timeout', function($parse, $timeout) { 
	return function(scope, elem, attr) {
		if (dropAvailable()) {
			var fn = $parse(attr['ngFileDropAvailable']);
			$timeout(function() {
				fn(scope);
			});
		}
	}
}]);
function handleDrop(scope, elem, attr, ngModel, $parse, $timeout, $location) {
	var available = dropAvailable();
	if (attr['dropAvailable']) {
		$timeout(function() {
			scope.dropAvailable ? scope.dropAvailable.value = available : scope.dropAvailable = available;
		});
	}
	if (!available) {
		if ($parse(attr.hideOnDropNotAvailable)(scope) != false) {
			elem.css('display', 'none');
		}
		return;
	}
	var leaveTimeout = null;
	var stopPropagation = $parse(attr.stopPropagation)(scope);
	var dragOverDelay = 1;
	var accept = $parse(attr.ngAccept)(scope) || attr.accept;
	var regexp = angular.isString(accept) && accept ? new RegExp(globStringToRegex(accept), 'gi') : null;
	var acceptFn = regexp ? null : attr.ngAccept;
	var actualDragOverClass;
	elem[0].addEventListener('dragover', function(evt) {
		evt.preventDefault();
		if (stopPropagation) evt.stopPropagation();
		if (navigator.userAgent.indexOf("Chrome") > -1) {
			var b = evt.dataTransfer.effectAllowed;
			evt.dataTransfer.dropEffect = ('move' === b || 'linkMove' === b) ? 'move' : 'copy';
		}
		$timeout.cancel(leaveTimeout);
		if (!scope.actualDragOverClass) {
			actualDragOverClass = calculateDragOverClass(scope, attr, evt);
		}
		elem.addClass(actualDragOverClass);
	}, false);
	elem[0].addEventListener('dragenter', function(evt) {
		evt.preventDefault();
		if (stopPropagation) evt.stopPropagation();
	}, false);
	elem[0].addEventListener('dragleave', function(evt) {
		leaveTimeout = $timeout(function() {
			elem.removeClass(actualDragOverClass);
			actualDragOverClass = null;
		}, dragOverDelay || 1);
	}, false);
	if (attr['ngFileDrop'] != '') {
		attr.ngFileChange = attr['ngFileDrop'];
	}
	elem[0].addEventListener('drop', function(evt) {
		evt.preventDefault();
		if (stopPropagation) evt.stopPropagation();
		elem.removeClass(actualDragOverClass);
		actualDragOverClass = null;
		extractFiles(evt, function(files, rejFiles) {
			$timeout(function() {
				if (ngModel) {
					$parse(attr.ngModel).assign(scope, files);
					ngModel && ngModel.$setViewValue(files != null && files.length == 0 ? '' : files);
				}
				if (attr['ngModelRejected']) {
					if (scope[attr.ngModelRejected]) {
						$parse(attr.ngModelRejected).assign(scope, rejFiles);
					}
				}
			});
			$timeout(function() {
				$parse(attr.ngFileChange)(scope, {
					$files: files,
					$rejectedFiles: rejFiles,
					$event: evt
				});
			});
		}, $parse(attr.allowDir)(scope) != false, attr.multiple || $parse(attr.ngMultiple)(scope));
	}, false);
	
	function calculateDragOverClass(scope, attr, evt) {
		var valid = true;
		if (regexp || acceptFn) {
			var items = evt.dataTransfer.items;
			if (items != null) {
				for (var i = 0 ; i < items.length && valid; i++) {
					valid = valid && (items[i].kind == 'file' || items[i].kind == '') && 
						((acceptFn && $parse(acceptFn)(scope, {$file: items[i], $event: evt})) || 
						(regexp && (items[i].type != null && items[i].type.match(regexp)) || 
								(items[i].name != null && items[i].name.match(regexp))));
				}
			}
		}
		var clazz = $parse(attr.dragOverClass)(scope, {$event : evt});
		if (clazz) {
			if (clazz.delay) dragOverDelay = clazz.delay; 
			if (clazz.accept) clazz = valid ? clazz.accept : clazz.reject;
		}
		return clazz || attr['dragOverClass'] || 'dragover';
	}
				
	function extractFiles(evt, callback, allowDir, multiple) {
		var files = [], rejFiles = [], items = evt.dataTransfer.items, processing = 0;
		
		function addFile(file) {
			if ((!regexp || file.type.match(regexp) || (file.name != null && file.name.match(regexp))) && 
					(!acceptFn || $parse(acceptFn)(scope, {$file: file, $event: evt}))) {
				files.push(file);
			} else {
				rejFiles.push(file);
			}
		}
		
		if (items && items.length > 0 && $location.protocol() != 'file') {
			for (var i = 0; i < items.length; i++) {
				if (items[i].webkitGetAsEntry && items[i].webkitGetAsEntry() && items[i].webkitGetAsEntry().isDirectory) {
					var entry = items[i].webkitGetAsEntry();
					if (entry.isDirectory && !allowDir) {
						continue;
					}
					if (entry != null) {
						traverseFileTree(files, entry);
					}
				} else {
					var f = items[i].getAsFile();
					if (f != null) addFile(f);
				}
				if (!multiple && files.length > 0) break;
			}
		} else {
			var fileList = evt.dataTransfer.files;
			if (fileList != null) {
				for (var i = 0; i < fileList.length; i++) {
					addFile(fileList.item(i));
					if (!multiple && files.length > 0) break;
				}
			}
		}
		var delays = 0;
		(function waitForProcess(delay) {
			$timeout(function() {
				if (!processing) {
					if (!multiple && files.length > 1) {
						var i = 0;
						while (files[i].type == 'directory') i++;
						files = [files[i]];
					}
					callback(files, rejFiles);
				} else {
					if (delays++ * 10 < 20 * 1000) {
						waitForProcess(10);
					}
				}
			}, delay || 0)
		})();
		
		function traverseFileTree(files, entry, path) {
			if (entry != null) {
				if (entry.isDirectory) {
					var filePath = (path || '') + entry.name;
					addFile({name: entry.name, type: 'directory', path: filePath});
					var dirReader = entry.createReader();
					var entries = [];
					processing++;
					var readEntries = function() {
						dirReader.readEntries(function(results) {
							try {
								if (!results.length) {
									for (var i = 0; i < entries.length; i++) {
traverseFileTree(files, entries[i], (path ? path : '') + entry.name + '/');
									}
									processing--;
								} else {
									entries = entries.concat(Array.prototype.slice.call(results || [], 0));
									readEntries();
								}
							} catch (e) {
								processing--;
								console.error(e);
							}
						}, function() {
							processing--;
						});
					};
					readEntries();
				} else {
					processing++;
					entry.file(function(file) {
						try {
							processing--;
							file.path = (path ? path : '') + file.name;
							addFile(file);
						} catch (e) {
							processing--;
							console.error(e);
						}
					}, function(e) {
						processing--;
					});
				}
			}
		}
	}
}
function dropAvailable() {
    var div = document.createElement('div');
    return ('draggable' in div) && ('ondrop' in div);
}
function globStringToRegex(str) {
if (str.length > 2 && str[0] === '/' && str[str.length -1] === '/') {
		return str.substring(1, str.length - 1);
	}
	var split = str.split(','), result = '';
	if (split.length > 1) {
		for (var i = 0; i < split.length; i++) {
			result += '(' + globStringToRegex(split[i]) + ')';
			if (i < split.length - 1) {
				result += '|'
			}
		}
	} else {
		if (str.indexOf('.') == 0) {
			str= '*' + str;
		}
		result = '^' + str.replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\' + '-]', 'g'), '\\$&') + '$';
result = result.replace(/\\\*/g, '.*').replace(/\\\?/g, '.');
	}
	return result;
}
var ngFileUpload = angular.module('ngFileUpload', []);
for (var key in angularFileUpload) {
	ngFileUpload[key] = angularFileUpload[key];
}
})();
(function() {
var hasFlash = function() {
	try {
	  var fo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
	  if (fo) return true;
	} catch(e) {
if (navigator.mimeTypes['application/x-shockwave-flash'] != undefined) return true;
	}
	return false;
}
function patchXHR(fnName, newFn) {
	window.XMLHttpRequest.prototype[fnName] = newFn(window.XMLHttpRequest.prototype[fnName]);
};
if ((window.XMLHttpRequest && !window.FormData) || (window.FileAPI && FileAPI.forceLoad)) {
	var initializeUploadListener = function(xhr) {
		if (!xhr.__listeners) {
			if (!xhr.upload) xhr.upload = {};
			xhr.__listeners = [];
			var origAddEventListener = xhr.upload.addEventListener;
			xhr.upload.addEventListener = function(t, fn, b) {
				xhr.__listeners[t] = fn;
				origAddEventListener && origAddEventListener.apply(this, arguments);
			};
		}
	}
	
	patchXHR('open', function(orig) {
		return function(m, url, b) {
			initializeUploadListener(this);
			this.__url = url;
			try {
				orig.apply(this, [m, url, b]);
			} catch (e) {
				if (e.message.indexOf('Access is denied') > -1) {
					this.__origError = e;
					orig.apply(this, [m, '_fix_for_ie_crossdomain__', b]);
				}
			}
		}
	});
	patchXHR('getResponseHeader', function(orig) {
		return function(h) {
			return this.__fileApiXHR && this.__fileApiXHR.getResponseHeader ? this.__fileApiXHR.getResponseHeader(h) : (orig == null ? null : orig.apply(this, [h]));
		};
	});
	patchXHR('getAllResponseHeaders', function(orig) {
		return function() {
			return this.__fileApiXHR && this.__fileApiXHR.getAllResponseHeaders ? this.__fileApiXHR.getAllResponseHeaders() : (orig == null ? null : orig.apply(this));
		}
	});
	patchXHR('abort', function(orig) {
		return function() {
			return this.__fileApiXHR && this.__fileApiXHR.abort ? this.__fileApiXHR.abort() : (orig == null ? null : orig.apply(this));
		}
	});
	patchXHR('setRequestHeader', function(orig) {
		return function(header, value) {
			if (header === '__setXHR_') {
				initializeUploadListener(this);
				var val = value(this);
				if (val instanceof Function) {
					val(this);
				}
			} else {
				this.__requestHeaders = this.__requestHeaders || {};
				this.__requestHeaders[header] = value;
				orig.apply(this, arguments);
			}
		}
	});
	
	function redefineProp(xhr, prop, fn) {
		try {
			Object.defineProperty(xhr, prop, {get: fn});
} catch (e) {}
	}
	patchXHR('send', function(orig) {
		return function() {
			var xhr = this;
			if (arguments[0] && arguments[0].__isFileAPIShim) {
				var formData = arguments[0];
				var config = {
					url: xhr.__url,
jsonp: false,
cache: true,
					complete: function(err, fileApiXHR) {
						xhr.__completed = true;
						if (!err && xhr.__listeners['load']) 
							xhr.__listeners['load']({type: 'load', loaded: xhr.__loaded, total: xhr.__total, target: xhr, lengthComputable: true});
						if (!err && xhr.__listeners['loadend']) 
							xhr.__listeners['loadend']({type: 'loadend', loaded: xhr.__loaded, total: xhr.__total, target: xhr, lengthComputable: true});
						if (err === 'abort' && xhr.__listeners['abort']) 
							xhr.__listeners['abort']({type: 'abort', loaded: xhr.__loaded, total: xhr.__total, target: xhr, lengthComputable: true});
						if (fileApiXHR.status !== undefined) redefineProp(xhr, 'status', function() {return (fileApiXHR.status == 0 && err && err !== 'abort') ? 500 : fileApiXHR.status});
						if (fileApiXHR.statusText !== undefined) redefineProp(xhr, 'statusText', function() {return fileApiXHR.statusText});
						redefineProp(xhr, 'readyState', function() {return 4});
						if (fileApiXHR.response !== undefined) redefineProp(xhr, 'response', function() {return fileApiXHR.response});
						var resp = fileApiXHR.responseText || (err && fileApiXHR.status == 0 && err !== 'abort' ? err : undefined);
						redefineProp(xhr, 'responseText', function() {return resp});
						redefineProp(xhr, 'response', function() {return resp});
						if (err) redefineProp(xhr, 'err', function() {return err});
						xhr.__fileApiXHR = fileApiXHR;
						if (xhr.onreadystatechange) xhr.onreadystatechange();
						if (xhr.onload) xhr.onload();
					},
					fileprogress: function(e) {
						e.target = xhr;
						xhr.__listeners['progress'] && xhr.__listeners['progress'](e);
						xhr.__total = e.total;
						xhr.__loaded = e.loaded;
						if (e.total === e.loaded) {
							var _this = this
							setTimeout(function() {
								if (!xhr.__completed) {
									xhr.getAllResponseHeaders = function(){};
									_this.complete(null, {status: 204, statusText: 'No Content'});
								}
							}, FileAPI.noContentTimeout || 10000);
						}
					},
					headers: xhr.__requestHeaders
				}
				config.data = {};
				config.files = {}
				for (var i = 0; i < formData.data.length; i++) {
					var item = formData.data[i];
					if (item.val != null && item.val.name != null && item.val.size != null && item.val.type != null) {
						config.files[item.key] = item.val;
					} else {
						config.data[item.key] = item.val;
					}
				}
				setTimeout(function() {
					if (!hasFlash()) {
						throw 'Adode Flash Player need to be installed. To check ahead use "FileAPI.hasFlash"';
					}
					xhr.__fileApiXHR = FileAPI.upload(config);
				}, 1);
			} else {
				if (this.__origError) {
					throw this.__origError;
				}
				orig.apply(xhr, arguments);
			}
		}
	});
	window.XMLHttpRequest.__isFileAPIShim = true;
	var addFlash = function(elem) {
		if (!hasFlash()) {
			throw 'Adode Flash Player need to be installed. To check ahead use "FileAPI.hasFlash"';
		}
		var el = angular.element(elem);
		if (!el.attr('disabled')) {
			var hasFileSelect = false;
			for (var i = 0; i < el[0].attributes.length; i++) {
				var attrib = el[0].attributes[i];
				if (attrib.name.indexOf('file-select') !== -1) {
					hasFileSelect = true;
					break;
				}
			}
			if (!el.hasClass('js-fileapi-wrapper') && (hasFileSelect || el.attr('__afu_gen__') != null)) {
				
				el.addClass('js-fileapi-wrapper');
				if (el.attr('__afu_gen__') != null) {
					var ref = (el[0].__refElem__ && angular.element(el[0].__refElem__)) || el;
					while (ref && !ref.attr('__refElem__')) {
						ref = angular.element(ref[0].nextSibling);
					}
					ref.bind('mouseover', function() {
						if (el.parent().css('position') === '' || el.parent().css('position') === 'static') {
							el.parent().css('position', 'relative');
						}
						el.css('position', 'absolute').css('top', ref[0].offsetTop + 'px').css('left', ref[0].offsetLeft + 'px')
							.css('width', ref[0].offsetWidth + 'px').css('height', ref[0].offsetHeight + 'px')
							.css('padding', ref.css('padding')).css('margin', ref.css('margin')).css('filter', 'alpha(opacity=0)');
						ref.attr('onclick', '');
						el.css('z-index', '1000');
					});
				}
			}
		}
	};
	var changeFnWrapper = function(fn) {
		return function(evt) {
			var files = FileAPI.getFiles(evt);
			for (var i = 0; i < files.length; i++) {
				if (files[i].size === undefined) files[i].size = 0;
				if (files[i].name === undefined) files[i].name = 'file';
				if (files[i].type === undefined) files[i].type = 'undefined';
			}
			if (!evt.target) {
				evt.target = {};
			}
			evt.target.files = files;
			if (evt.target.files != files) {
				evt.__files_ = files;
			}
			(evt.__files_ || evt.target.files).item = function(i) {
				return (evt.__files_ || evt.target.files)[i] || null;
			}
			if (fn) fn.apply(this, [evt]);
		};
	};
	var isFileChange = function(elem, e) {
		return (e.toLowerCase() === 'change' || e.toLowerCase() === 'onchange') && elem.getAttribute('type') == 'file';
	}
	if (HTMLInputElement.prototype.addEventListener) {
		HTMLInputElement.prototype.addEventListener = (function(origAddEventListener) {
			return function(e, fn, b, d) {
				if (isFileChange(this, e)) {
					addFlash(this);
					origAddEventListener.apply(this, [e, changeFnWrapper(fn), b, d]);
				} else {
					origAddEventListener.apply(this, [e, fn, b, d]);
				}
			}
		})(HTMLInputElement.prototype.addEventListener);
	}
	if (HTMLInputElement.prototype.attachEvent) {
		HTMLInputElement.prototype.attachEvent = (function(origAttachEvent) {
			return function(e, fn) {
				if (isFileChange(this, e)) {
					addFlash(this);
					if (window.jQuery) {
						angular.element(this).bind('change', changeFnWrapper(null));
					} else {
						origAttachEvent.apply(this, [e, changeFnWrapper(fn)]);
					}
				} else {
					origAttachEvent.apply(this, [e, fn]);
				}
			}
		})(HTMLInputElement.prototype.attachEvent);
	}
	window.FormData = FormData = function() {
		return {
			append: function(key, val, name) {
				if (val.__isFileAPIBlobShim) {
					val = val.data[0];
				}
				this.data.push({
					key: key,
					val: val,
					name: name
				});
			},
			data: [],
			__isFileAPIShim: true
		};
	};
	window.Blob = Blob = function(b) {
		return {
			data: b,
			__isFileAPIBlobShim: true
		};
	};
	(function () {
		if (!window.FileAPI) {
			window.FileAPI = {};
		}
		if (FileAPI.forceLoad) {
			FileAPI.html5 = false;
		}
		
		if (!FileAPI.upload) {
			var jsUrl, basePath, script = document.createElement('script'), allScripts = document.getElementsByTagName('script'), i, index, src;
			if (window.FileAPI.jsUrl) {
				jsUrl = window.FileAPI.jsUrl;
			} else if (window.FileAPI.jsPath) {
				basePath = window.FileAPI.jsPath;
			} else {
				for (i = 0; i < allScripts.length; i++) {
					src = allScripts[i].src;
index = src.search(/\/angular\-file\-upload[\-a-zA-z0-9\.]*\.js/)
					if (index > -1) {
						basePath = src.substring(0, index + 1);
						break;
					}
				}
			}
			if (FileAPI.staticPath == null) FileAPI.staticPath = basePath;
			script.setAttribute('src', jsUrl || basePath + 'FileAPI.min.js');
			document.getElementsByTagName('head')[0].appendChild(script);
			FileAPI.hasFlash = hasFlash();
		}
	})();
	FileAPI.disableFileInput = function(elem, disable) {
		if (disable) {
			elem.removeClass('js-fileapi-wrapper')
		} else {
			elem.addClass('js-fileapi-wrapper');
		}
	}
}
if (!window.FileReader) {
	window.FileReader = function() {
		var _this = this, loadStarted = false;
		this.listeners = {};
		this.addEventListener = function(type, fn) {
			_this.listeners[type] = _this.listeners[type] || [];
			_this.listeners[type].push(fn);
		};
		this.removeEventListener = function(type, fn) {
			_this.listeners[type] && _this.listeners[type].splice(_this.listeners[type].indexOf(fn), 1);
		};
		this.dispatchEvent = function(evt) {
			var list = _this.listeners[evt.type];
			if (list) {
				for (var i = 0; i < list.length; i++) {
					list[i].call(_this, evt);
				}
			}
		};
		this.onabort = this.onerror = this.onload = this.onloadstart = this.onloadend = this.onprogress = null;
		var constructEvent = function(type, evt) {
			var e = {type: type, target: _this, loaded: evt.loaded, total: evt.total, error: evt.error};
			if (evt.result != null) e.target.result = evt.result;
			return e;
		};
		var listener = function(evt) {
			if (!loadStarted) {
				loadStarted = true;
				_this.onloadstart && _this.onloadstart(constructEvent('loadstart', evt));
			}
			if (evt.type === 'load') {
				_this.onloadend && _this.onloadend(constructEvent('loadend', evt));
				var e = constructEvent('load', evt);
				_this.onload && _this.onload(e);
				_this.dispatchEvent(e);
			} else if (evt.type === 'progress') {
				var e = constructEvent('progress', evt);
				_this.onprogress && _this.onprogress(e);
				_this.dispatchEvent(e);
			} else {
				var e = constructEvent('error', evt);
				_this.onerror && _this.onerror(e);
				_this.dispatchEvent(e);
			}
		};
		this.readAsArrayBuffer = function(file) {
			FileAPI.readAsBinaryString(file, listener);
		}
		this.readAsBinaryString = function(file) {
			FileAPI.readAsBinaryString(file, listener);
		}
		this.readAsDataURL = function(file) {
			FileAPI.readAsDataURL(file, listener);
		}
		this.readAsText = function(file) {
			FileAPI.readAsText(file, listener);
		}
	}
}
})();
;
/*! RESOURCE: /reportdesigner/services/service.xlsxUploader.js */
angular.module('reportDesigner').factory('XlsxUploader', ['ServerService', 'EndpointsService', '$timeout', '$upload', '$q', function XlsxUploader(server, endpoint, $timeout, $upload, $q) {
	'use strict';
	return {
		uploadReference: null,
		canceled: false,
		jobId: '',
		paramName: 'file',
		expirationOptions: [],
		uploadSettings: {
			fields: {},
		},
		urls: {
			importUrl: {
				method: 'POST',
url: '/api/now/reporting/xlsx_file_import',
			},
			confirmUrl: {
				method: 'PUT',
url: '/api/now/reporting/xlsx_file_import/confirm',
			},
			listenerUrl: {
				method: 'GET',
url: '/api/now/reporting/xlsx_file_import/job',
			},
			cancelUrl: {
				method: 'DELETE',
url: '/api/now/reporting/xlsx_file_import/job',
			},
			editUrl: {
				method: 'GET',
url: '/api/now/reporting/xlsx_file_import',
			},
			submitEditUrl: {
				method: 'PUT',
url: '/api/now/reporting/xlsx_file_import',
			},
		},
		expirationDayFormat: 'dddd, MMMM Do YYYY',
		setUrls: function setUrls(urls) {
			if (typeof urls !== 'object')
				return;
			angular.merge(this.urls, urls);
		},
		setParamName: function setParamName(paramName) {
			this.paramName = paramName || 'file';
		},
		getExpirationOptions: function getExpirationOptions() {
			return server.get(endpoint.getExpirationOptionsUrl)
			.then(function afterExpirationOptionsGot(response) {
				if (!response.data || response.data.length === 0)
					throw new Error('Could not fetch expiration options');
				this.expirationOptions = response.data;
				return this.expirationOptions;
			}.bind(this));
		},
		waitForListenerStatus: function waitForListenerStatus() {
			var url = angular.merge({}, this.urls.listenerUrl);
url.url = url.url + '/' + this.jobId;
			return server.request(url).then(function serverResponse(response) {
				var realResult;
				if (response.result.state !== 'complete')
					return $timeout(this.waitForListenerStatus.bind(this), 2500, false);
				realResult = JSON.parse(response.result.message);
				return this.sendConfirm(realResult.import_table_sys_id);
			}.bind(this));
		},
		sendConfirm: function sendConfirm(tableSysId) {
			var url = angular.merge({}, this.urls.confirmUrl);
url.url = url.url + '/' + tableSysId;
			return server.request(url);
		},
		startUpload: function startUpload(file) {
			this.uploadSettings.fields = {};
			this.uploadSettings.fields.name = file.name;
			this.uploadSettings.fields.expiration_days = file.expiration.value;
			if (file.permissions === 'only-me')
				this.uploadSettings.fields.sec_me = true;
			else if (file.permissions === 'everyone')
				this.uploadSettings.fields.sec_everyone = true;
			else if (file.permissions === 'custom') {
				this.uploadSettings.fields.sec_users = file.users;
				this.uploadSettings.fields.sec_groups = file.groups;
				this.uploadSettings.fields.sec_roles = file.roles;
			}
			this.canceled = false;
			angular.merge(this.uploadSettings, file.edit ? this.urls.submitEditUrl : this.urls.importUrl);
			if (file.edit) {
this.uploadSettings.url += '/' + file.sysID;
				this.uploadSettings.fields.active = true;
			}
			this.uploadReference = $upload.upload(this.uploadSettings);
			return this.uploadReference;
		},
		cancelUpload: function cancelUpload(callback) {
			var url = angular.merge({}, this.urls.cancelUrl);
url.url = url.url + '/' + this.jobId;
			if (this.uploadReference) {
				this.canceled = true;
				if (callback)
					callback({
						status: 'uploading',
					});
				return this.uploadReference.abort();
			}
			return server.request(url).then(function cancelRequest() {
				if (callback)
					callback({
						status: 'processing',
					});
			});
		},
		selectFile: function selectFile(file) {
			var xlsxFile;
			var unparsedPromise;
			this.uploadSettings.file = file;
			this.uploadSettings.fileFormDataName = this.paramName;
			xlsxFile = {
				filename: file.name,
				name: '',
size: (file.size / (1000 * 1000)).toFixed(2) + ' Mb',
				extension: file.name.split('.').pop(),
				permissions: 'only-me',
			};
			this.setExpirationDayFor(xlsxFile, this.expirationOptions[0]);
			unparsedPromise = $q.defer();
			unparsedPromise.resolve(xlsxFile);
			return unparsedPromise.promise;
		},
		editFile: function editFile(table) {
			var url = angular.merge({}, this.urls.editUrl);
url.url = url.url + '/' + table;
			return server.request(url).then(function afterEditLoad(response) {
				var parsedExpirationDay = window.moment(response.result.expire_on_date).format(this.expirationDayFormat);
				var permissions = 'custom';
				if (response.result.security.sec_me)
					permissions = 'only-me';
				else if (response.result.security.sec_everyone)
					permissions = 'everyone';
				return {
					sysID: response.result.sys_id,
					filename: response.result.filename,
					name: response.result.name,
					expiration: {
						value: response.result.expiration_days,
					},
					expirationDay: parsedExpirationDay,
					tablename: response.result.table,
					permissions: permissions,
					users: response.result.security.users,
					groups: response.result.security.groups,
					roles: response.result.security.roles,
				};
			}.bind(this));
		},
		setExpirationDayFor: function setExpirationDayFor(file, option) {
			if (typeof option === 'undefined')
				return;
			var date = window.moment().add(option.value, 'days');
			file.expirationDay = date.format(this.expirationDayFormat);
			file.expiration = option;
		},
		clearReference: function clearReference() {
			this.uploadReference = false;
		},
	};
}]);
;
/*! RESOURCE: /reportdesigner/directives/directive.importModal.js */
angular.module('reportDesigner').directive('importModal', ['i18nFilter', 'XlsxUploader', 'getTemplateUrl', function importModalDirective(i18nFilter, xlsxUploader, getTemplateUrl) {
	'use strict';
	return {
		restrict: 'E',
		templateUrl: getTemplateUrl('directive-import-modal.xml'),
		scope: {
			urls: '=?',
			edit: '=?',
			onSuccess: '&',
			onClose: '&',
			onOpen: '&',
			onCancel: '&',
			onAfterUpload: '&',
		},
		link: function link(scope, element, attributes) {
			scope.error = false;
			scope.file = false;
			scope.status = 'empty';
			scope.uploading = false;
			scope.sharePermissionsApi = {};
			scope.focus = '';
			scope.accept = window.isMSIE11 ? 'xlsx' : '.xlsx';
			xlsxUploader.setUrls(scope.urls);
			xlsxUploader.setParamName(attributes.paramName);
			xlsxUploader.getExpirationOptions()
				.then(function afterGetExpirationOptions(options) {
					scope.expirationOptions = options;
				})
				.catch(function couldNotGetExpirationOptions() {
					scope.showError('Could not retrieve expire options from the server.');
				});
		},
		controller: ['$scope', '$element', '$attrs', function controller($scope, $element, $attrs) {
			$scope.fileSelected = function fileSelected(files, event, rejectedFiles) {
				if (!$scope.edit)
					$scope.file = false;
				if (rejectedFiles && rejectedFiles.length)
					return $scope.showError('The file type you are trying to upload is invalid');
				if (!files.length)
					return $scope.hideError();
if (files[0].size / 1000 > $attrs.maxFilesize * 1000)
					return $scope.showError('File is too big ({0}Mb). Max filesize: {1}Mb.', [
(files[0].size / (1000 * 1000)).toFixed(2),
						Number($attrs.maxFilesize).toFixed(2),
					]);
				return xlsxUploader.selectFile(files[0])
					.then(function xlsxParsed(file) {
						if ($scope.edit) {
							delete file.name;
							delete file.permissions;
							delete file.expiration;
							delete file.expirationDay;
							angular.merge($scope.file, file);
						} else
							$scope.file = file;
						$scope.status = 'file';
						$scope.hideError();
						$scope.focus = 'filename-input';
					})
					.catch(function errorParsingXLSX(error) {
						$scope.showError(error);
					});
			};
			$scope.submit = function submit(afterSubmit) {
				var value;
				$scope.status = 'progress';
				$scope.error = false;
				$scope.uploading = true;
				$scope.focus = '';
				if ($scope.file.permissions === 'custom') {
					value = $scope.sharePermissionsApi.getValue();
					$scope.file.users = value.users;
					$scope.file.groups = value.groups;
					$scope.file.roles = value.roles;
				}
				$scope.file.edit = Boolean($scope.edit);
				return xlsxUploader.startUpload($scope.file)
					.error(function error(data, status) {
						var errorMessage = data && data.error && data.error.message ? data.error.message : 'Server responded with {0} code';
						$scope.uploading = false;
						if (status < 0)
							errorMessage = 'The server appears to be offline.';
						$scope.showError(errorMessage, [status]);
						$scope.status = 'file';
						$scope.focus = 'form';
					})
					.success(function success(response) {
						if (xlsxUploader.canceled) {
							$scope.clearFile();
							$scope.status = 'file';
							return;
						}
						xlsxUploader.clearReference();
						if (!response.result) {
							$scope.showError('Could not fetch the data response');
							$scope.status = 'file';
							return;
						}
						xlsxUploader.jobId = response.result.job_id;
						if ($scope.onAfterUpload)
							$scope.onAfterUpload({
								jobId: xlsxUploader.jobId,
							});
						function confirmedCallback(confirmResponse) {
							confirmResponse.edit = Boolean($scope.file.edit);
							confirmResponse.old = $scope.oldFile;
							if ($scope.onSuccess)
								$scope.onSuccess({
									response: confirmResponse,
								});
							$scope.clearFile();
							$scope.status = 'done';
							if (afterSubmit)
								afterSubmit();
						}
						if (response.result.transaction_confirmed)
							confirmedCallback(response);
						else
							xlsxUploader.waitForListenerStatus().then(confirmedCallback).catch(function confirmError(errorMessage) {
								$scope.showError(errorMessage);
								$scope.status = 'file';
							});
					});
			};
			$scope.showError = function showError(message, vars) {
				var errorMessage = message || 'Server responded with {{statusCode}} code';
				$scope.error = {
					message: i18nFilter(errorMessage, vars),
				};
			};
			$scope.hideError = function hideError() {
				$scope.error = false;
			};
			$scope.showPermissionsStep = function showPermissionsStep() {
				$scope.status = 'permissions';
				$scope.hideError();
				$scope.sharePermissionsApi.focusOnButtons();
			};
			$scope.formatExpirationDate = function formatExpirationDate() {
				if (!$scope.file)
					return;
				xlsxUploader.setExpirationDayFor($scope.file, $scope.file.expiration);
			};
			$scope.clearFile = function clearFile(needsConfirm) {
				if (needsConfirm && !window.confirm(i18nFilter('You have selected a file. You will lose it, are you sure you want to go back?')))
					return false;
				$scope.error = false;
				$scope.uploading = false;
				$scope.status = 'empty';
				if ($scope.sharePermissionsApi.clearSelected)
					$scope.sharePermissionsApi.clearSelected();
				return true;
			};
			$scope.cancelUpload = function cancelUpload() {
				xlsxUploader.cancelUpload($scope.onCancel);
			};
			$element.on('show.bs.modal', function modalShows(e) {
				if ($scope.onOpen)
					$scope.onOpen({
						event: e,
					});
				if ($scope.edit) {
					$scope.status = 'loading';
					xlsxUploader.editFile($scope.edit)
						.then(function afterEditLoad(file) {
							$scope.file = file;
							$scope.oldFile = angular.copy(file);
							$scope.status = 'file';
							$scope.focus = 'change-button';
							$scope.sharePermissionsApi.setUsers(file.roles, file.groups, file.users);
						})
						.catch(function editLoadError(error) {
							$scope.error = {
								message: error,
							};
							$scope.status = 'failure';
						});
				}
				if ($scope.status === 'empty')
					$scope.focus = 'upload-button';
			});
			$element.on('hide.bs.modal', function modalCloses(e) {
				var allowedToExit = ['empty', 'done'];
				if (!$scope.edit && allowedToExit.indexOf($scope.status) < 0) {
					if (!window.confirm(i18nFilter('You already selected a file. You will lose it, are you sure you want to close the modal and cancel?'))) {
						e.preventDefault();
						return false;
					}
					if ($scope.uploading)
						$scope.cancelUpload();
					$scope.clearFile();
				} else if ($scope.status === 'done')
					$scope.clearFile();
				if ($scope.onClose)
					$scope.onClose({
						event: e,
					});
				$scope.hideError();
				$scope.focus = '';
				if ($scope.edit)
					$scope.clearFile();
				return true;
			});
		}],
	};
}]);
;
/*! RESOURCE: /reportdesigner/components/type-selection/component.type-selection.js */
angular.module('reportDesigner').component('typeSelection', {
templateUrl: 'scripts/reportdesigner/components/type-selection/template.type-selection.html',
	bindings: {
		isDataset: '<',
		sourceType: '<',
		chartSelected: '&',
	},
	controller: function controller(chartTypes, $timeout, $window, sourceTypeNames, PiwikService, $filter) {
		this.chartTypes = chartTypes;
		this.datasetIntroMsg = gReport.i18n.datasetIntroMsg;
		this.typeSelectionIntroMsg = gReport.i18n.typeSelectionIntroMsg;
		this.reportTypeSearchNoResult = gReport.i18n.reportTypeSearchNoResult;
		this.Piwik = PiwikService;
		this.searchResultsText = '';
				
this.imagePath="images/v2/";
		if ($window.NOW.isPolarisEnabled === "true")
this.imagePath += "polaris/";
		this.isVisible = function isVisible(type, isGroup) {
			if (this.sourceType === sourceTypeNames.metricBase) {
				if (isGroup)
					return type === 'timeSeries';
				return chartTypes.isMetricbaseChartType(type);
			}
			if (this.isDataset) {
				if (isGroup)
					return chartTypes.isGroupVisibleInADataset(type);
				return chartTypes.isTypeVisibleInADataset(type);
			}
			return true;
		};
		this.selectChartType = function(type) {
			this.chartSelected({ type: type.type });
			this.Piwik.trackEvent('Chart Types - ' + type.group.name, type.name);
		};
		this.clickChartType = function clickChartType(ev, type, name, group) {
			if (ev.which === 32 || ev.keyCode === 32 || ev.charCode === 32) {
				ev.preventDefault();
				this.selectChartType({ type: type, name: name, group: group });
			}
		};
		this.clearFilter = function clearFilter() {
			this.filterChartTypes = '';
			this.searchResultsText = '';
		};
		this.$postLink = function postLink() {
			$timeout(function applyTooltip() {
				angular.element('.sidebar-thumbs a').tooltip().hideFix();
			});
		};
		this.convertCamelCaseToSnakeCase = function convertCamelCaseToSnakeCase (myStr) {
return myStr.replace(/([A-Z])/g, function($1) { return "-" + $1.toLowerCase(); });
		};
		this.onTextInput = function onTextInput() {
			var ctrl = this;
			if (ctrl.searchResultsText && !ctrl.filterChartTypes.trim().length) {
				ctrl.searchResultsText = '';
				return;
			}
			var total = 0;
			ctrl.chartTypes.model.groups.forEach(function (group) {
				var data = $filter('filter')(ctrl.chartTypes.model.getChartsFromGroup(group.type), ctrl.filterChartTypes);
				if (data.length)
				   total+= data.length;
			});
			ctrl.searchResultsText = (total === 0) ? ctrl.reportTypeSearchNoResult : (gReport.i18n.reportTypeSearchResultText.format(total));
		};
	}
});
;
/*! RESOURCE: /reportdesigner/services/service.transformService.js */
angular.module('reportDesigner').factory('transformService', [function transformFunctionsFactory() {
	'use strict';
	var i18n = gReport.i18n.metricBase;
	var aggregatorTransformMetadataArray =
		[
			{	name: 'Avg',
				label: i18n.transform_Avg
			},
			{	name: 'Min',
				label: i18n.transform_Min
			},
			{	name: 'Max',
				label: i18n.transform_Max
			},
			{   name: "Sum",
				label: i18n.transform_Sum
			}
		];
	var aggregatorMetadataArray = aggregatorTransformMetadataArray.concat(
		[{	name: 'Last',
			label: i18n.transform_Last
		}]);
	var transformMetadataArray =
		[{
name: 'Label',
			label: i18n.transform_Label,
			arguments: [{ name: 'label', label: i18n.arg_label, type: 'string', default: '' }]
		}]
		.concat(aggregatorTransformMetadataArray)
		.concat(
			[
				{	name: 'Count',
					label: i18n.transform_Count
				},
				{	name: 'Sum',
					label: i18n.transform_Sum
				},
				{	name: 'Log',
					label: i18n.transform_Log
				},
				{	name: 'Median',
					label: i18n.transform_Median
				},
				{	name: 'StdDev',
					label: i18n.transform_StdDev
				},
				{	name: 'Envelope',
					label: i18n.transform_Envelope,
				},
				{	name: 'Predict',
					label: i18n.transform_Predict,
					arguments: [{ name: 'model', label: i18n.arg_model, type: 'model'}]
				},
				{	name: 'Top',
					label: i18n.transform_Top,
					arguments: [{ name: 'count', label: i18n.arg_count, type: 'int', default: 5, pattern: '-?\\d+' }]
				},
				{	name: 'Bottom',
					label: i18n.transform_Bottom,
					arguments: [{ name: 'count', label: i18n.arg_count, type: 'int', default: 5, pattern: '-?\\d+' }]
				},
				{	name: 'Add',
					label: i18n.transform_Add,
arguments: [{ name: 'summand', label: i18n.arg_summand, type: 'float', default: null }]
				},
				{	name: 'Sub',
					label: i18n.transform_Sub,
					arguments: [{ name: 'summand', label: i18n.arg_subtrahend, type: 'float', default: null }]
				},
				{ name: 'Mul',
					label: i18n.transform_Mul,
					arguments: [{ name: 'factor', label: i18n.arg_factor, type: 'float', default: null }]
				},
				{ name: 'Div',
					label: i18n.transform_Div,
					arguments: [{ name: 'divisor', label: i18n.arg_divisor, type: 'float', default: null }]
				},
				{	name: 'Interpolate',
					label: i18n.transform_Interpolate,
arguments: [{ name: 'duration', label: i18n.arg_duration, type: 'iso_duration', default: 'PT1H' }]
				},
				{	name: 'Fractiles',
					label: i18n.transform_Fractiles,
					arguments: [{ name: 'fractions', label: i18n.arg_fractions, type: 'csv_float', default: '0.25,0.50,0.75,1', pattern: '^(\\s*-?\\d+(\\.\\d+)?)(\\s*,\\s*-?\\d+(\\.\\d+)?)*$' }]
				},
				{	name: 'Resample',
					label: i18n.transform_Resample,
					arguments: [
					{ name: 'function', label: i18n.arg_aggregator_function, type: 'aggregator_functions', options: aggregatorMetadataArray, default: 'Avg' },
{ name: 'period', label: i18n.arg_period, type: 'iso_duration', default: 'PT1H' }
					]
				},
				{	name: 'Filter',
					label: i18n.transform_Filter,
					arguments: [
					{ name: 'function', label: i18n.arg_aggregator_function, type: 'aggregator_functions', options: aggregatorMetadataArray, default: 'Avg' },
{ name: 'window', label: i18n.arg_window, type: 'iso_duration', default: 'PT1H' }
					]
				},
				{	name: 'Partition',
					label: i18n.transform_Partition,
					arguments: [
					{ name: 'base', label: i18n.arg_base, type: 'iso_timestamp', default: moment([moment().year(), moment().month()]).utc().toISOString() },
					{ name: 'function', label: i18n.arg_aggregator_function, type: 'aggregator_functions', options: aggregatorMetadataArray, default: 'Avg' },
{ name: 'window', label: i18n.arg_window, type: 'iso_duration', default: 'PT1H' }
					]
				}
			]);
function findTransform(name) {
		var meta =  transformMetadataArray.filter(function matchName(transformMetadata) {
			return name === transformMetadata.name;
		})[0];
		return JSON.parse(JSON.stringify(meta));
	}
	return {
		getTransforms: function getTransforms() {
			return transformMetadataArray
					.map(function clone(transformMetadata) {
						return {
							name: transformMetadata.name,
							label: transformMetadata.label
						};
					});
		},
		mapToUserSelectedTransform: function mapToUserSelectedTransform(transformFunction) {
			var decoratedTransformFunction = angular.copy(transformFunction);
			if (typeof transformFunction.display !== 'undefined' && transformFunction.display) {
				decoratedTransformFunction.transform = transformFunction.display;
				if (transformFunction.transform === 'Top') {
					if (transformFunction.display === 'Bottom')
						decoratedTransformFunction.count = -transformFunction.count;
					if (transformFunction.display === 'Max')
						decoratedTransformFunction.count = 1;
					if (transformFunction.display === 'Min')
						decoratedTransformFunction.count = -1;
				}
if (transformFunction.transform === 'Add')
					decoratedTransformFunction.summand = -transformFunction.summand;
if (transformFunction.transform === 'Fractiles')
					delete decoratedTransformFunction.fractions;
			}
			return decoratedTransformFunction;
		},
		mapToMetricBaseTransform: function mapToMetricBaseTransform(transformFunction) {
			if (['Bottom', 'Sub', 'Max', 'Min', 'Envelope', 'Top'].indexOf(transformFunction.transform) > -1) {
				var serializedTransformFunction = angular.copy(transformFunction);
				serializedTransformFunction.display = transformFunction.transform;
				switch (transformFunction.transform) {
				case 'Bottom':
					serializedTransformFunction.transform = 'Top';
					serializedTransformFunction.count = -transformFunction.count;
					serializedTransformFunction.function = 'Avg';
					return serializedTransformFunction;
				case 'Top':
					serializedTransformFunction.function = 'Avg';
					return serializedTransformFunction;
				case 'Sub':
					serializedTransformFunction.transform = 'Add';
					serializedTransformFunction.summand = -transformFunction.summand;
					return serializedTransformFunction;
				case 'Max':
					serializedTransformFunction.transform = 'Top';
					serializedTransformFunction.function = 'Avg';
					serializedTransformFunction.count = 1;
					return serializedTransformFunction;
				case 'Min':
					serializedTransformFunction.transform = 'Top';
					serializedTransformFunction.function = 'Avg';
					serializedTransformFunction.count = -1;
					return serializedTransformFunction;
				case 'Envelope':
					serializedTransformFunction.transform = 'Fractiles';
					serializedTransformFunction.fractions = '0,1';
					return serializedTransformFunction;
				}
			}
			return transformFunction;
		},
		getArgumentsMetadata: function getArgumentsMetadata(transformFunctionName) {
			return findTransform(transformFunctionName).arguments;
		}
	};
}]);
;
/*! RESOURCE: /reportdesigner/services/service.transformConfig.js */
angular.module('reportDesigner').factory('transformConfig', [function transformConfigFactory() {
	'use strict';
	var REFERENCE_LABEL = 'Reference';
	var CHART_SUBJECT_LABEL = 'chart-subjects';
	var ENDING_TRANSFORM = { transform: REFERENCE_LABEL, name: CHART_SUBJECT_LABEL };
	function getTransformProperties(currentTransform) {
		var transform = {};
		for (var key in currentTransform)
			if (currentTransform.hasOwnProperty(key) && key !== 'input')
				transform[key] = currentTransform[key];
		return transform;
	}
	return {
		ENDING_TRANSFORM: ENDING_TRANSFORM,
		flattenTransformChain: function flattenTransformChain(transformChain) {
			var transformsArray = [];
			function getNextTransform(currentTransform) {
				if (currentTransform.input)
					getNextTransform(currentTransform.input);
				if (currentTransform.transform !== "Decompose")
					transformsArray.push(getTransformProperties(currentTransform));
			}
			getNextTransform(transformChain);
			return transformsArray;
		},
		unflattenTransformChain: function unflattenTransformChain(transformArray) {
			var transformChain = {};
			var sentArray = angular.copy(transformArray);
			var lastIndex = sentArray.length - 1;
angular.forEach(sentArray, function eachTransform(transformObj, index) {
				if (transformObj.transform === '') {
					sentArray.splice(index, 1);
					lastIndex --;
				}
				if (transformObj.transform === 'Predict') {
					sentArray.splice(index+1, 0, {transform: "Decompose", tags: []});
					lastIndex ++;
				}
			});
if (sentArray.length === 1 && sentArray[0].transform === REFERENCE_LABEL)
				return sentArray[0];
			function createNode(node, transformIndex) {
				var index = transformIndex;
				if (index >= 0 && node && node.transform !== REFERENCE_LABEL) {
					node.input = sentArray[index - 1];
					index--;
					createNode(node.input, index);
				}
			}
			transformChain = sentArray[lastIndex];
			createNode(transformChain, lastIndex);
			return transformChain;
		},
		resetTransformsArray: function resetTransformsArray() {
			return [ENDING_TRANSFORM, { transform: '' }];
		}
	};
}]);
;
/*! RESOURCE: /reportdesigner/components/metric-config/component.metric-config.js */
angular.module('reportDesigner').component('metricConfig', {
	bindings: {
		table: '<',
config: '<',
		setProperty: '&',
		hasError: '&',
isDataset: '<',
		startTime: '<',
		endTime: '<',
	},
templateUrl: 'scripts/reportdesigner/components/metric-config/template.metric-config.html',
	controller: function controller(ServerService, transformConfig, dotWalkingFilters) {
this.metrics = [];
this.metricsTransformsArray = [];
		this.dotWalkingFilters = dotWalkingFilters;
		this.hasNone = true;
		this.includeTime = true;
		this.startTimeKey = 'sysparm_start_time';
		this.endTimeKey = 'sysparm_end_time';
		this.timeRanges = [
			{ name: 'relative', label: gReport.i18n.Relative },
			{ name: 'absolute', label: gReport.i18n.Absolute },
		];
var METRICS_ENDPOINT = '/api/now/v1/metric/definition/table/';
		var METRICS_LIMIT = 50;
		this.$onChanges = function onChanges() {
			if (this.table) {
				var self = this;
				ServerService.get(METRICS_ENDPOINT + this.table).then(function getDataCb(resp) {
					self.metrics = resp.result;
				});
				if (this.config.transforms)
					this.config.transforms.forEach(function createMetricTransformArrayCb(pair, pairIndex) {
if (pair.transform)
							self.metricsTransformsArray[pairIndex] = transformConfig.flattenTransformChain(pair.transform);
if (pair && pair.transform && !pair.transform.input)
							self.metricsTransformsArray[pairIndex] = transformConfig.resetTransformsArray();
					});
			}
		};
		this.$onInit = function onInit() {
			if (this.startTime)
				this.timeRangeType = this.startTime.indexOf('P') !== -1 ? 'relative' : 'absolute';
			else
				this.timeRangeType = 'relative';
		};
this.addMetricPair = function addMetricPair() {
			if (this.config.transforms.length < METRICS_LIMIT) {
				this.config.transforms.push({ metric: '', transform: transformConfig.ENDING_TRANSFORM });
				this.metricsTransformsArray[this.config.transforms.length - 1] = transformConfig.resetTransformsArray();
			} else
				alert(gReport.i18n.metricBase.metricsLimitReached);
		};
		this.getMetric = function getMetric(index) {
			return this.config.transforms[index].metric;
		};
		this.removeMetricPair = function removeMetricPair(index) {
			if (this.config.transforms.length > 1) {
				this.config.transforms.splice(index, 1);
				this.metricsTransformsArray.splice(index, 1);
} else {
				this.config.transforms[0].metric = '';
				this.config.transforms[index].transform = transformConfig.ENDING_TRANSFORM;
				this.metricsTransformsArray[index] = transformConfig.resetTransformsArray();
			}
		};
		this.addTransform = function addTransform(pairIndex, transformIndex) {
			this.metricsTransformsArray[pairIndex].splice(transformIndex + 1, 0, { transform: '' });
			this.setTransformChain(pairIndex);
		};
		this.removeTransform = function removeTransform(pairIndex, transformIndex) {
if (this.metricsTransformsArray[pairIndex].length > 2)
				this.metricsTransformsArray[pairIndex].splice(transformIndex, 1);
			else
				this.metricsTransformsArray[pairIndex] = transformConfig.resetTransformsArray();
			this.setTransformChain(pairIndex);
		};
		this.setMetric = function setMetric(metricData) {
			this.config.transforms[metricData.index].metric = metricData.selectedMetric || '';
if (!metricData.selectedMetric || !this.config.transforms[metricData.index].transform.input) {
				this.config.transforms[metricData.index].transform = transformConfig.ENDING_TRANSFORM;
				this.metricsTransformsArray[metricData.index] = transformConfig.resetTransformsArray();
			}
		};
		this.setTransformChain = function setTransformChain(pairIndex) {
			this.config.transforms[pairIndex].transform = transformConfig.unflattenTransformChain(this.metricsTransformsArray[pairIndex]);
		};
		this.setTransformError = function setTransformError() {
			this.hasError();
		};
		this.timeRangeChanged = function timeRangeChanged() {
			this.setProperty({ key: this.startTimeKey, value: '' });
			this.setProperty({ key: this.endTimeKey, value: '' });
		};
	}
});
;
/*! RESOURCE: /reportdesigner/components/groupby/component.groupby.js */
angular.module('reportDesigner').component('groupby', {
	bindings: {
		table: '<',
		groupBy: '<',
		setProperty: '&',
		sourceType: '@'
	},
templateUrl: 'scripts/reportdesigner/components/groupby/template.groupby.html',
	controller: function controller($timeout, sourceTypeNames) {
		function applyMetricGroupBy(table, groupBy, setProperty) {
			var groupBySelect = 'metricbase-group-by-select';
			var groupByWrap = 'metricbase-group-by-wrap';
			$timeout(function renderGroupby() {
				angular.element('#' + groupByWrap + ' .group-by-container').html(
					angular.element(getGroupFields(table, groupBy, true, true)).attr({ id: groupBySelect, class: 'form-control sel2' })
				);
angular.element('#' + groupBySelect).prepend('<option value="">' + gReport.i18n.noneOption + '</option>').val('');
				if (groupBy)
					angular.element('#' + groupBySelect + ' option[value="' + groupBy + '"]').prop('selected', true);
				angular.element('#' + groupByWrap + ' select').on('change', function changeGroupCb() {
					groupMetricFieldSelected(table, angular.element('#' + groupByWrap + ' select')[0]);
					if (this.value.indexOf('...') > -1)
						return;
					setProperty({ key: 'group_by', value: this.value });
				});
			});
		}
		this.$onChanges = function onChanges() {
			if (this.sourceType === sourceTypeNames.metricBase)
				applyMetricGroupBy(this.table, this.groupBy, this.setProperty);
		};
	}
});
;
/*! RESOURCE: /reportdesigner/components/metric-select/component.metric-select.js */
angular.module('reportDesigner').component('metricSelect', {
	bindings: {
		selectedMetric: '<',
		metrics: '<',
		index: '<',
		setMetric: '&'
	},
templateUrl: 'scripts/reportdesigner/components/metric-select/template.metric-select.html',
	controller: function controller() {
		this.metricChanged = function metricChanged() {
			this.setMetric({ index: this.index, selectedMetric: this.selectedMetric });
		};
		this.$onChanges = function onChanges() {
			if (this.metrics.length && !this.selectedMetric) {
				this.selectedMetric = this.metrics[0].name;
				this.metricChanged();
			}
		};
	}
});
;
/*! RESOURCE: /reportdesigner/components/metric-transform/component.metric-transform.js */
angular.module('reportDesigner').component('metricTransform', {
	bindings: {
		currentTransform: '<',
		pairIndex: '<',
		transformIndex: '<',
		setTransformChain: '&',
		setTransformError: '&',
		getMetric: '&',
	},
templateUrl: 'scripts/reportdesigner/components/metric-transform/template.metric-transform.html',
	controller: function controller(transformService, ServerService, $filter) {
		this.transforms = transformService.getTransforms();
		this.argumentsModel = [];
		this.baseKey = 'base';
		this.includeTime = true;
		var self = this;
		var angularScope = getAngularScope();
		function setArgumentValues(transformArguments, currentTransform) {
			var query = "mb_model.metric_table=" + angularScope.main.report.sysparm_table +
				"^mb_model.metric.element=" + self.getMetric() + "^ORDERBYname";
var MODELS_ENDPOINT = '/api/now/table/mb_model_instance';
			var MODELS_QUERY = { sysparm_query: query };
			var hasModel = transformArguments.find(function hasModel(arg) { return arg.type === 'model'});
			if (hasModel) {
				ServerService.get(MODELS_ENDPOINT, {params: MODELS_QUERY}).then(function getModelsCb(response) {
					transformArguments.forEach(function eachArgument(argument) {
						if (argument.type === 'model' && response.result.length > 0) {
							argument.options = response.result;
							var selectedModel = typeof currentTransform[argument.name] === 'undefined'
								? response.result[0].sys_id : currentTransform[argument.name].sys_id;
							self.argumentsModel[argument.name] = selectedModel;
} else if (argument.type === 'csv_float')
							self.argumentsModel[argument.name] = $filter('arrayToCSV')(currentTransform[argument.name], 'CSV');
else
							self.argumentsModel[argument.name] = currentTransform[argument.name];
					});
				}).catch(function getModelsError(error) {
					console.log('Error while fetching metricbase models: ', error);
				});
			} else {
				transformArguments.forEach(function eachArgument(argument) {
if (argument.type === 'csv_float')
						self.argumentsModel[argument.name] = $filter('arrayToCSV')(currentTransform[argument.name], 'CSV');
else
						self.argumentsModel[argument.name] = currentTransform[argument.name];
				});
			}
		}
		function removeOldArguments(currentTransform) {
			var allowedProperties = ['transform'];
angular.forEach(currentTransform, function deleteTransformProperty(value, key) {
				if (allowedProperties.indexOf(key) < 0)
					delete currentTransform[key];
			});
		}
		function copyTransformProperties(transform, transformCopy) {
			for (var key in transformCopy)
				if (transformCopy.hasOwnProperty(key))
					if (key === 'fractions')
						transform[key] = $filter('arrayToCSV')(transformCopy[key]);
					else
						transform[key] = transformCopy[key];
		}
		this.transformChanged = function transformChanged() {
			removeOldArguments(this.currentTransform);
			removeOldArguments(this.displayedTransform);
			this.argumentsModel = [];
			this.displayedTransform.transform = this.selectedTransform || '';
			var metric = this.getMetric();
			if (this.selectedTransform)
				this.transformArguments = transformService.getArgumentsMetadata(this.selectedTransform);
			var setAsync = false;
			if (this.transformArguments) {
this.transformArguments.forEach(function addArgumentProperty(argument) {
					self.argumentsModel[argument.name] = argument.default;
					self.displayedTransform[argument.name] = argument.default;
					if (self.selectedTransform === 'Predict') {
						setAsync = true;
						var angularScope = getAngularScope();
						var query = "mb_model.metric_table=" + angularScope.main.report.sysparm_table +
							"^mb_model.metric.element=" + metric + "^ORDERBYname";
var MODELS_ENDPOINT = '/api/now/table/mb_model_instance';
						var MODELS_QUERY = {sysparm_query: query};
						ServerService.get(MODELS_ENDPOINT, {params: MODELS_QUERY}).then(function getModelsCb(response) {
							if (response.result.length > 0) {
								argument.options = response.result;
								argument.default = response.result[0].name;
								self.argumentsModel[argument.name] = response.result[0].sys_id;
								self.displayedTransform[argument.name] = {sys_id: response.result[0].sys_id};
							} else {
								argument.options = [];
							}
							return true;
						}).then(function setTransform(success) {
							if (success) {
								copyTransformProperties(self.currentTransform, transformService.mapToMetricBaseTransform(self.displayedTransform));
								self.setTransformChain({pairIndex: self.pairIndex});
							}
						}).catch(function getModelsError(error) {
							console.log('Error while fetching metricbase models: ', error);
						});
					}
				});
			}
			if (!setAsync) {
				copyTransformProperties(this.currentTransform, transformService.mapToMetricBaseTransform(this.displayedTransform));
				this.setTransformChain({pairIndex: this.pairIndex});
			}
		};
		this.setProperty = function setProperty(propertyName, propertyValue) {
			this.argumentsModel[propertyName] = propertyValue;
			this.argumentChanged(propertyName);
		};
		this.setBaseTimestampProperty = function setBaseTimestampProperty(newValue) {
			this.setProperty(newValue.key, newValue.value);
		};
		this.argumentChanged = function argumentChanged(argumentName) {
			if (this.currentTransform.display)
				this.displayedTransform.transform = this.currentTransform.display;
			if (argumentName === "model") {
				this.displayedTransform[argumentName] = {sys_id: this.argumentsModel[argumentName]};
			} else {
				this.displayedTransform[argumentName] = this.argumentsModel[argumentName];
			}
			copyTransformProperties(this.currentTransform, transformService.mapToMetricBaseTransform(this.displayedTransform));
			this.setTransformChain({ pairIndex: this.pairIndex });
		};
		this.$onChanges = function onChanges() {
this.displayedTransform = transformService.mapToUserSelectedTransform(this.currentTransform);
			this.selectedTransform = this.displayedTransform.transform;
			if (this.displayedTransform.transform)
				this.transformArguments = transformService.getArgumentsMetadata(this.selectedTransform);
			if (this.transformArguments)
				setArgumentValues(this.transformArguments, this.displayedTransform, this.table);
		};
		this.signalTransformError = function transformErrorCb() {
			this.setTransformError();
		};
	}
});
;
/*! RESOURCE: /reportdesigner/components/time-range/component.time-range.js */
angular.module('reportDesigner').component('timeRange', {
	bindings: {
		setProperty: '&',
		isDisabled: '<',
		timestamp: '<',
		includeTime: '<?',
		startKey: '@?',
		endKey: '@?'
	},
templateUrl: 'scripts/reportdesigner/components/time-range/template.time-range.html',
	controller: function controller($scope) {
		$scope.invalidTimeInput = false;
		var ctrl = this;
		this.startKey = 'sysparm_start_time';
		this.endKey = 'sysparm_end_time';
		this.defaultIsoInterval = gReport.defaultIsoInterval || 'P7D';
		this.includeTime = angular.isDefined(this.includeTime) ? this.includeTime : true;
var relativeIntervalTypes = [
			{ name: 'Minutes', value: 'M' },
			{ name: 'Hours', value: 'H' },
			{ name: 'Days', value: 'D' },
			{ name: 'Months', value: 'm' },
			{ name: 'Years', value: 'Y' }
		];
var relativeIntervalTypesNoTime = relativeIntervalTypes.slice(2);
		function isoUnitToIntervalType(isoIntervalString) {
			if (!isoIntervalString)
return { name: 'Days', value: 'D' };
			var isoUnitChar = isoIntervalString[isoIntervalString.length - 1];
			return relativeIntervalTypes.filter(
				function filterIntervals(interval) {
					return interval.value === isoUnitChar;
				}
			)[0];
		}
		function parseIsoInterval(isoIntervalString) {
var value = isoIntervalString.replace(/\D/g, '');
			if (!value)
				value = '7';
			return {
				intervalType: isoUnitToIntervalType(isoIntervalString),
				value: parseInt(value, 10),
			};
		}
		function setRelativeInterval(startTime) {
			var parsedInterval = parseIsoInterval(startTime);
			$scope.selectedIntervalType = parsedInterval.intervalType;
			$scope.relativeInterval = parsedInterval.value;
		}
		function isTimeDuration(value) {
			return value === 'H' || value === 'M';
		}
		function relativeIntervalToIsoUnit(interval, type) {
			if (isTimeDuration(type))
				return 'PT' + interval + type;
			return 'P' + interval + type;
		}
		function initializeDuration() {
if (!ctrl.defaultIsoInterval || !ctrl.defaultIsoInterval.match(/\d+/g))
				ctrl.defaultIsoInterval = 'P7D';
			var defaultInterval = parseIsoInterval(ctrl.defaultIsoInterval);
			$scope.selectedIntervalType = defaultInterval.intervalType;
			$scope.relativeInterval = defaultInterval.value;
			ctrl.setProperty({ key: ctrl.startKey, value: ctrl.defaultIsoInterval });
			ctrl.setProperty({ key: ctrl.endKey, value: ctrl.defaultIsoInterval });
		}
		function init() {
			$scope.relativeIntervalTypes = ctrl.includeTime ? relativeIntervalTypes : relativeIntervalTypesNoTime;
			if (ctrl.timestamp)
				$scope.setStartTime();
			else
				initializeDuration();
		}
		$scope.setStartTime = function setIntervalCb() {
			setRelativeInterval(ctrl.timestamp);
		};
		$scope.updateParentModel = function updateParentModelCb() {
			$scope.invalidTimeInput = typeof $scope.relativeInterval === 'undefined' || $scope.relativeInterval < 1;
			var durationISO = relativeIntervalToIsoUnit($scope.relativeInterval, $scope.selectedIntervalType.value);
			ctrl.setProperty({ key: ctrl.startKey, value: durationISO });
			ctrl.setProperty({ key: ctrl.endKey, value: durationISO });
		};
		this.$onInit = function onInit() {
			init();
		};
	}
});
;
/*! RESOURCE: /reportdesigner/components/time-picker/component.time-picker.js */
angular.module('reportDesigner').component('timePicker', {
	bindings: {
		setProperty: '&',
		isDisabled: '<',
		timestamp: '<?',
		isoInterval: '@?',
		includeTime: '<?',
		key: '<',
	},
templateUrl: 'scripts/reportdesigner/components/time-picker/template.time-picker.html',
	controller: function controller($scope, utils) {
		var self = this;
		var milisecondsInHour = 3600000;
		var timeOffset;
		var timeFormat = 'YYYY-MM-DD HH:mm:ss';
		$scope.closeEvent = 'close_date_choice';
		$scope.data = {};
		$scope.data.dateModel = '';
		$scope.popoverConfig = {
			placement: 'right',
template: '<div class="popover date-choice-popover" role="tooltip"><div class="popover-content"></div></div>'
		};
		this.timeEdit = true;
		this.timeZoneOffset = (window.gReport && gReport.tzOffset) || 0;
		this.timepickerConfig = {
			startView: 'day',
			minView: 'day'
		};
		this.includeTime = angular.isDefined(this.includeTime) ? this.includeTime : true;
		function _getSystemTimeFormat() {
			var _timeFormat = 'HH:mm:ss';
			if (window.NOW && window.NOW.dateFormat && window.NOW.dateFormat.timeStringFormat)
				_timeFormat = window.NOW.dateFormat.timeStringFormat;
			return _timeFormat;
		}
		function _setTimeModels(array) {
			$scope.data.hours = parseInt(array[0], 10);
			$scope.data.minutes = parseInt(array[1], 10);
			$scope.data.seconds = parseInt(array[2], 10);
		}
		function _updateTimeModel(momentObject) {
			var timeParts = momentObject.format(_getSystemTimeFormat()).split(':');
			if (typeof timeParts === 'undefined' || timeParts.length !== 3)
				timeParts = [0, 0, 0];
			_setTimeModels(timeParts);
		}
		function _sanitizeTimeValues(data) {
			if (typeof data.hours === 'undefined' || data.hours > 23)
				data.hours = 23;
			if (typeof data.minutes === 'undefined' || data.minutes > 59)
				data.minutes = 59;
			if (typeof data.seconds === 'undefined' || data.seconds > 59)
				data.seconds = 59;
		}
function _initializeTime(initTime) {
			var newDate = moment(initTime).utcOffset(timeOffset);
			_updateTimeModel(newDate);
			$scope.data.dateAsPicker = newDate.format(timeFormat);
		}
		function init() {
timeOffset = parseInt(self.timeZoneOffset, 10) / milisecondsInHour;
			if (!self.includeTime)
				timeFormat = 'YYYY-MM-DD';
			if (self.timestamp)
				_initializeTime(self.timestamp);
			else {
				var initTime = moment().subtract(moment.duration(self.isoInterval)).utc().toISOString();
				_initializeTime(initTime);
				self.setProperty({ key: self.key, value: initTime });
			}
		}
		$scope.clickPopover = function clickPopover(event, togglePopover) {
			if (!self.isDisabled)
				togglePopover(event);
		};
		$scope.getTimestamp = function getTimestamp(initTime) {
			if (!initTime)
				return '';
			var newDate = moment(initTime).utcOffset(timeOffset);
			_updateTimeModel(newDate);
			$scope.data.dateAsPicker = newDate.format(timeFormat);
			return newDate.format(timeFormat);
		};
		this.onCalendarTimeSet = function onCalendarTimeSet(passedDate) {
var newDate = moment(passedDate);
newDate = moment.utc([newDate.year(), newDate.month(), newDate.date()]).utcOffset(timeOffset, true);
			$scope.data.dateAsPicker = newDate.format(timeFormat);
			_updateTimeModel(newDate);
			self.setProperty({ key: self.key, value: newDate.toISOString() });
		};
		this.onInputTimeSet = function onInputTimeSet(data) {
			if (!data.hours || !utils.isInteger(data.hours))
				data.hours = 12;
			if (!data.minutes || !utils.isInteger(data.minutes))
				data.minutes = 0;
			if (!data.seconds || !utils.isInteger(data.seconds))
				data.seconds = 0;
			_sanitizeTimeValues(data);
			var newDate = moment(self.timestamp).utcOffset(timeOffset)
				.hour(data.hours)
				.minute(data.minutes)
				.second(data.seconds);
			self.setProperty({ key: self.key, value: newDate.toISOString() });
		};
		this.$onInit = function onInit() {
			init();
		};
	}
});
;
/*! RESOURCE: /reportdesigner/components/iso-duration/component.iso-duration.js */
angular.module('reportDesigner').component('isoDuration', {
	bindings: {
		duration: '<',
		durationTransformFunction: '<',
		setProperty: '&',
		hasError: '&'
	},
templateUrl: 'scripts/reportdesigner/components/iso-duration/template.iso-duration.html',
	controller: function controller() {
		function _parseIsoToDuration(isoString) {
var trimmedIsoDuration = isoString.replace(/\s/g, '');
			var dIndex = trimmedIsoDuration.indexOf('D');
			var tIndex = trimmedIsoDuration.indexOf('T');
			var hIndex = trimmedIsoDuration.indexOf('H');
			var mIndex = trimmedIsoDuration.indexOf('M');
			var parsedDays;
			var parsedHours;
			var parsedMins;
			if (dIndex !== -1)
parsedDays = parseInt(trimmedIsoDuration.substring(0, dIndex).replace(/P/g, ''), 10);
			if (tIndex !== -1 && hIndex !== -1) {
				parsedHours = parseInt(trimmedIsoDuration.substring(tIndex + 1, hIndex), 10);
				if (mIndex !== -1)
					parsedMins = parseInt(trimmedIsoDuration.substring(hIndex + 1, mIndex), 10);
				return {
					days: parsedDays,
					hours: parsedHours,
					minutes: parsedMins
				};
			}
			if (tIndex !== -1 && mIndex !== -1)
				parsedMins = parseInt(trimmedIsoDuration.substring(tIndex + 1, mIndex), 10);
			return {
				days: parsedDays,
				hours: parsedHours,
				minutes: parsedMins
			};
		}
		function _parseDurationToIso(durationObj) {
			var isoString = 'P';
			var days = durationObj.days;
			var hours = durationObj.hours;
			var mins = durationObj.minutes;
			if (days || days === 0)
				isoString = isoString + days + 'D';
			if (hours || hours === 0) {
				isoString = isoString + 'T' + hours + 'H';
				if (mins || mins === 0) {
					isoString = isoString + mins + 'M';
					return isoString;
				}
			}
			if (mins || mins === 0)
				isoString = isoString + 'T' + mins + 'M';
			return isoString;
		}
		function _isEquivalentToZero(val) {
			return val <= 0 || val == null || typeof val === 'undefined';
		}
		function _testDurationValue(durationObj) {
			return _isEquivalentToZero(durationObj.days) && _isEquivalentToZero(durationObj.hours) && _isEquivalentToZero(durationObj.minutes);
		}
		this.isZeroDuration = false;
		this.$onInit = function updateModelOnInitCb() {
			this.durationModel = _parseIsoToDuration(this.duration);
			this.isZeroDuration = _testDurationValue(this.durationModel);
			if (this.isZeroDuration)
				this.hasError();
		};
		this.$onChanges = function updateModelOnChangesCb() {
			this.durationModel = _parseIsoToDuration(this.duration);
			this.isZeroDuration = _testDurationValue(this.durationModel);
			if (this.isZeroDuration)
				this.hasError();
		};
		this.onDurationChange = function setPropertyCb() {
			this.isZeroDuration = _testDurationValue(this.durationModel);
			if (this.isZeroDuration)
				this.hasError();
			var newIsoDuration = _parseDurationToIso(this.durationModel);
			this.setProperty({ propertyName: this.durationTransformFunction, propertyValue: newIsoDuration });
		};
	}
});
;
/*! RESOURCE: /reportdesigner/components/table-loader/component.table-loader.js */
angular.module('reportDesigner').component('tableLoader', {
	bindings: {
		table: '<',
		tableChanged: '&',
		tableDisplayValue: '<',
		isDisabled: '<'
	},
templateUrl: 'scripts/reportdesigner/components/table-loader/template.table-loader.html',
	controller: function controller(EndpointsService, utils) {
		var self = this;
		self.tablePageSize = 50;
		self.tablePageIndex = 0;
		self.quietMillis = Number(gReport.tableLoaderQuietMilis) >= 0
			? Number(gReport.tableLoaderQuietMilis) : 1000;
		self.$onInit = function onInit() {
			angular.element('#select-table-ajax').select2({
				ajax: {
					url: EndpointsService.getTablesUrl,
					dataType: 'json',
					data: function data(term, page) {
						if (page === 1)
							self.tablePageIndex = 0;
						return {
							name_contains: term,
							page: page,
							page_size: self.tablePageSize,
							starting_index: self.tablePageIndex
						};
					},
					results: function results(data, page, query) {
						var tables = data.data.tables;
						self.tablePageIndex = tables.ending_index;
						return {
							results: tables.table_array,
							more: tables.has_more
						};
					},
					quietMillis: self.quietMillis
				},
				placeholder: gReport.i18n.noTableSelected,
				formatSearching: gReport.i18n.searching,
				minimumInputLength: 0,
				initSelection: function initSelection(element, callback) {
					var displayValue = element.val();
					if (self.tableDisplayValue)
						displayValue = self.tableDisplayValue;
					callback({ id: element.val(), text: displayValue });
				}
			});
			angular.element('#select-table-ajax').on('change', function selectTableChanged() {
				self.tableChanged({ table: $j(this).select2('data') });
			});
		};
		self.$onChanges = function onChanges(changes) {
			if (changes.isDisabled && changes.isDisabled.currentValue !== changes.isDisabled.previousValue)
				angular.element('#select-table-ajax')[0].disabled = self.isDisabled;
			if (changes.table && changes.table.currentValue !== changes.table.previousValue)
				angular.element('#select-table-ajax').select2('val', self.table);
		};
	}
});
;
/*! RESOURCE: /reportdesigner/components/reference-lookup/component.reference-lookup.js */
angular.module('reportDesigner').component('referenceLookup', {
	bindings: {
fieldName: '<',
fieldValue: '<',
fieldLabel: '@',
fieldId: '@',
onChange: '&'
	},
	templateUrl: function templateUrl(getTemplateUrl, $attrs) {
		return getTemplateUrl($attrs.templateUrl);
	},
	controller: function controller($timeout, $element) {
		function setInitialValues(element, fieldId, fieldName, fieldValue) {
			$element.find('#' + fieldId).val(fieldValue);
			$element.find('#sys_display\\.' + fieldId).val(fieldName);
		}
		function initializeChangeListeners(element, fieldId, onChange, fieldLabel) {
			var $input = element.find('#sys_display\\.' + fieldId);
			var errorClass = 'fieldmsg-container';
element.on('change focusin focusout', function changeCallback(event) {
				$timeout(function timeoutCb() {
var el = $input[0];
					if (el && el.ac && typeof el.ac.isReferenceValid() !== 'undefined') {
if (el.ac.isReferenceValid())
							element.find('.' + errorClass).remove();
						if (!el.ac.isReferenceValid() && !element.find('.' + errorClass).length) {
							var message = fieldLabel
								? gReport.i18n.invalidReferenceLookup.format(fieldLabel)
								: gReport.i18n.invalidReference
							element.append(
								'<div class="' + errorClass + '" aria-live="polite">' +
'<div class="fieldmsg notification notification-error">' + message + ' </div>' +
'</div>'
							);
						}
					}
if (event.type !== 'focusin') {
						var value = element.find('#' + fieldId).val();
						var name = $input.val();
						if (name && value) {
onChange({ key: fieldId, value: value });
onChange({ key: fieldId + '_name', value: name });
						}
					}
				});
			});
		}
		this.$onChanges = function onChanges() {
			if (this.fieldName && this.fieldValue)
				setInitialValues($element, this.fieldId, this.fieldName, this.fieldValue);
		};
		this.$onInit = function onInit() {
			initializeChangeListeners($element, this.fieldId, this.onChange, this.fieldLabel);
		};
	}
});
;
/*! RESOURCE: /reportdesigner/components/aliases-config/component.aliases-config.js */
angular.module('reportDesigner').component('aliasesConfig', {
	bindings: {
		load: '<',
		onSave: '&',
		canWrite: '<',
		reportSysId: '<',
	},
templateUrl: 'scripts/reportdesigner/components/aliases-config/template.aliases-config.html?v=' + window.g_builddate,
	controller: ['$element', 'chartTypes', 'aliasesErrorCodes', '$http', function controller($element, types, aliasesErrorCodes, $http) {
		this.aliasFields = [];
		this.types = types;
		this.isLoaded = false;
var ALIASES_URI = '/api/now/reporting_alias/';
		this.$onChanges = function onChanges() {
			var self = this;
			if (self.load)
				self.loadAliases();
		};
		this.selectedIndex = 0;
		this.changeSelectedField = function changeSelectedField(index) {
			this.selectedIndex = index;
		};
		this.close = function close() {
			angular.element('#alias-modal').modal('hide');
		};
		this.submit = function submit() {
			this.saveAliases();
		};
		function hasError(response) {
			return response.result.overallErrorCode && response.result.overallErrorCode !== aliasesErrorCodes.success.code;
		}
		function getFirstErrorFieldIndex(aliasFields, errorFields) {
			for (var i = 0; i < aliasFields.length; i++)
				if (errorFields[0].fieldLabel && aliasFields[i].fieldLabel === errorFields[0].fieldLabel)
					return i;
			return 0;
		}
		this.findFieldAliasByLabel = function findFieldAliasByLabel(fieldLabel) {
			var self = this;
			for (var i = 0; i < self.aliasFields.length; i++)
				if (self.aliasFields[i].fieldLabel === fieldLabel)
					return self.aliasFields[i];
			return null;
		};
		this.findValueAliasByLabel = function findValueAliasByLabel(fieldAlias, valueLabel) {
			for (var i = 0; i < fieldAlias.valueAliases.length; i++)
				if (fieldAlias.valueAliases[i].valueLabel === valueLabel)
					return fieldAlias.valueAliases[i];
			return null;
		};
		this.applyErrors = function applyErrors(errorFieldAliases) {
			var self = this;
			for (var i = 0; i < errorFieldAliases.length; i++) {
				var errorFieldAlias = errorFieldAliases[i];
				var fieldAlias = self.findFieldAliasByLabel(errorFieldAlias.fieldLabel);
				if (fieldAlias) {
					fieldAlias.errorCode = errorFieldAlias.errorCode || '';
					for (var j = 0; j < errorFieldAlias.valueAliases.length; j++) {
						var valueAlias = self.findValueAliasByLabel(fieldAlias, errorFieldAlias.valueAliases[j].valueLabel);
						if (valueAlias)
							valueAlias.errorCode = errorFieldAlias.valueAliases[j].errorCode || '';
					}
				}
			}
		};
		this.saveAliases = function saveAliases() {
			var self = this;
			if (self.reportSysId) {
				var saveAliasesURL = ALIASES_URI + self.reportSysId;
				if (gReport.recordScope)
					saveAliasesURL += '?sysparm_record_scope=' + gReport.recordScope;
				$http.post(saveAliasesURL, angular.toJson(self.aliasFields)).success(function postData(response) {
					if (hasError(response)) {
						self.applyErrors(response.result.fieldAliases);
						self.selectedIndex = getFirstErrorFieldIndex(self.aliasFields, response.result.fieldAliases);
					} else {
						var messageString = gReport.report.sysparm_apply_alias ? gReport.i18n.aliases_applied_message : gReport.i18n.aliases_saved_message;
						self.onSave({success: true, message: messageString});
						self.close();
					}
				}).error(function() {
					self.onSave({success: false, message: gReport.i18n.aliases_save_error_message});
				});
			}
		};
		this.getErrorMessage = function getErrorMessage(errorCode) {
			if (!errorCode)
				return '';
			var errorMessage = '';
			angular.forEach(aliasesErrorCodes, function(value) {
				if (value.code === errorCode)
					errorMessage = value.errorKey;
			});
			return errorMessage;
		};
		this.getAliasConfigFieldDescription = function getAliasConfigFieldDescription() {
			var self = this;
			if (!isModalVisible() || self.aliasFields.length === 0)
				return;
			var fieldLabel = self.aliasFields[self.selectedIndex].fieldLabel;
			return gReport.i18n.aliases_config_field_description.format(fieldLabel);
		}
		this.isDuplicatedValue = function isDuplicatedValue(currentValueIndex) {
			var self = this;
			if (!isModalVisible() || !self.canWrite || self.aliasFields.length === 0)
				return false;
			var valueAliases = self.aliasFields[self.selectedIndex].valueAliases;
			var currentValueAlias = valueAliases[currentValueIndex].valueAlias;
			for (var valueIndex = 0; valueIndex < valueAliases.length; valueIndex++) {
				var valueAlias = valueAliases[valueIndex].valueAlias;
				if (currentValueAlias && valueAlias &&
					currentValueIndex !== valueIndex &&
					currentValueAlias.toUpperCase() === valueAlias.toUpperCase())
					return true;
			}
			return false;
		};
		this.isDuplicatedField = function isDuplicatedField(currentFieldIndex) {
			var self = this;
			if (!isModalVisible() || !self.canWrite || self.aliasFields.length === 0)
				return false;
			var fieldAliases = self.aliasFields;
			var currentFieldAlias = fieldAliases[currentFieldIndex].fieldAlias;
			for (var fieldIndex = 0; fieldIndex < fieldAliases.length; fieldIndex++) {
				var fieldAlias = fieldAliases[fieldIndex].fieldAlias;
				if (currentFieldAlias && fieldAlias &&
					currentFieldIndex !== fieldIndex &&
					currentFieldAlias.toUpperCase() === fieldAlias.toUpperCase())
					return true;
			}
			return false;
		};
		function isModalVisible() {
			return angular.element('#alias-modal').hasClass('in');
		}
		this.loadAliases = function loadAliases() {
			if (!isModalVisible()) {
				return;
			}
			var self = this;
			self.isLoaded = false;
			self.aliasFields = [];
			if (self.reportSysId) {
				$http.get(ALIASES_URI + self.reportSysId).success(function getData(response) {
					self.aliasFields = response.result;
					self.selectedIndex = 0;
					self.isLoaded = true;
				}).error(function() {
					self.onSave({success: false, message: gReport.i18n.aliases_get_error_message});
					self.close();
				});
			}
		};
		this.getFieldLabel = function getFieldLabel() {
			var self = this;
			if (self.aliasFields[self.selectedIndex]) {
				var currentFieldLabel = self.aliasFields[self.selectedIndex].fieldLabel;
				return currentFieldLabel.split('.').reverse()[0];
			}
			return '';
		};
		$element.on('keydown', '#save-configure-aliases', function keydown(e) {
			if (e.keyCode === 9 && !e.shiftKey) {
				angular.element('#close-configure-aliases').focus();
				e.preventDefault();
			}
		});
		
		$element.on('keydown', '#cancel-configure-aliases', function keydown(e) {
			if (angular.element("#save-configure-aliases").prop('disabled') && e.keyCode === 9 && !e.shiftKey) {
				angular.element('#close-configure-aliases').focus();
				e.preventDefault();
			}
		});
		this.handleUpDownOnFieldTabs = function handleUpDownOnFieldTabs($event) {
			var self = this;
			var keyCode = $event.keyCode;
if (keyCode === 40) {
				$event.preventDefault();
				if (self.selectedIndex !== self.aliasFields.length - 1) {
					self.selectedIndex++;
					this.setFocusOnSelectedFieldTab(self.selectedIndex);
				}
} else if (keyCode === 38) {
				$event.preventDefault();
				if (self.selectedIndex !== 0) {
					self.selectedIndex--;
					self.setFocusOnSelectedFieldTab(self.selectedIndex);
				}
			}
		};
		this.setFocusOnSelectedFieldTab = function setFocusOnSelectedFieldTab(index) {
			angular.element('#field-tab-value-' + index).focus();
		};
	}],
});
;
/*! RESOURCE: /reportdesigner/components/format/component.format-view.js */
angular.module('reportDesigner').component('formatView', {
	bindings: {
		load: '<',
		formattingProperties: '<',
		onComplete: '&'
	},
templateUrl: 'scripts/reportdesigner/components/format/template.format-view.html',
	controller: ['$element', '$http', 'keyCodes', 'format-commons', 'formatViewConstants', function controller($element, $http, keyCodes, formatCommons, formatViewConstants) {
		this.formatTypes = formatCommons.formatTypes;
		this.selectedIndex = 0;
		this.canWrite = true;
		this.isValid = true;
		this.state = formatViewConstants.states.LOADING;
var SANITIZER_URI = '/api/now/reporting/formatting/sanitize';
		function isModalVisible() {
			return angular.element('#format-view').hasClass('in');
		}
		function isJsonString(str) {
			try {
				JSON.parse(str);
			} catch (e) {
				return false;
			}
			return true;
		}
		function isConfigurationEmpty(formattingConfiguration) {
			if (Object.keys(formattingConfiguration.durationFormattingProperties).length !== 0)
				return false;
			if (Object.keys(formattingConfiguration.numberFormattingProperties).length !== 0)
				return false;
			return true;
		}
		this.applyDurationProperties = function applyDurationProperties(durationProperties, isValid) {
			if (isValid) {
				this.isValid = true;
				this.formattingProperties.formattingConfiguration.durationFormattingProperties[this.getSelectedFieldConfiguration().fieldName + ',' + this.getSelectedFieldConfiguration().configurationType] = durationProperties;
			} else
				this.isValid = false;
		};
		this.$onChanges = function onChanges() {
			this.state = formatViewConstants.states.LOADING;
			if (this.load && isModalVisible()) {
				this.sanitizeFormattingConfiguration();
				this.isValid = true;
			}
		};
		this.applyNumberProperties = function applyNumberProperties(numberProperties) {
			this.formattingProperties.formattingConfiguration.numberFormattingProperties[this.getSelectedFieldConfiguration().fieldName + ',' + this.getSelectedFieldConfiguration().configurationType] = numberProperties;
		};
		this.changeSelectedField = function changeSelectedField(index) {
			this.selectedIndex = index;
		};
		this.sanitizeFormattingConfiguration = function sanitizeFormattingConfiguration() {
			var self = this;
			var clonedFormattingProperties = JSON.parse(JSON.stringify(self.formattingProperties));
			for (var i = 0; i < clonedFormattingProperties.reportFields.fieldConfigurations.length; i++)
				delete clonedFormattingProperties.reportFields.fieldConfigurations[i].display;
			if (isJsonString(clonedFormattingProperties.formattingConfiguration))
				clonedFormattingProperties.formattingConfiguration = JSON.parse(clonedFormattingProperties.formattingConfiguration);
			$http.post(SANITIZER_URI, angular.toJson(clonedFormattingProperties)).success(function postData(response) {
				self.formattingProperties.formattingConfiguration = JSON.parse(response.result);
				if(isConfigurationEmpty(self.formattingProperties.formattingConfiguration))
					self.state = formatViewConstants.states.NOT_SUPPORTED;
				else
					self.state = formatViewConstants.states.SHOW;
			}).error(function () {
				self.formattingProperties.formattingConfiguration = '';
				self.onComplete({
					success: false,
					formattingConfiguration: '',
					message: gReport.i18n.generic_server_error
				});
				self.close();
			});
		};
		this.getSelectedDisplayName = function getSelectedDisplayName() {
			if (this.formattingProperties && this.formattingProperties.reportFields)
				return this.formattingProperties.reportFields.fieldConfigurations[this.selectedIndex].display;
			return '';
		};
		this.getSelectedFieldConfiguration = function getSelectedFieldConfiguration() {
			if (this.formattingProperties && this.formattingProperties.reportFields)
				return this.formattingProperties.reportFields.fieldConfigurations[this.selectedIndex];
			return '';
		};
		this.getSelectedDurationConfiguration = function getSelectedDurationConfiguration() {
			if (this.formattingProperties &&
				this.formattingProperties.formattingConfiguration &&
				this.formattingProperties.formattingConfiguration.durationFormattingProperties &&
				this.formattingProperties.formattingConfiguration.durationFormattingProperties[this.getSelectedFieldConfiguration().fieldName + ',' + this.getSelectedFieldConfiguration().configurationType])
				return this.formattingProperties.formattingConfiguration.durationFormattingProperties[this.getSelectedFieldConfiguration().fieldName + ',' + this.getSelectedFieldConfiguration().configurationType];
			return '';
		};
		this.getSelectedNumberConfiguration = function getSelectedNumberConfiguration() {
			if (this.formattingProperties &&
				this.formattingProperties.formattingConfiguration &&
				this.formattingProperties.formattingConfiguration.numberFormattingProperties &&
				this.formattingProperties.formattingConfiguration.numberFormattingProperties[this.getSelectedFieldConfiguration().fieldName + ',' + this.getSelectedFieldConfiguration().configurationType])
				return this.formattingProperties.formattingConfiguration.numberFormattingProperties[this.getSelectedFieldConfiguration().fieldName + ',' + this.getSelectedFieldConfiguration().configurationType];
			return '';
		};
		this.close = function close() {
			angular.element('#format-view').modal('hide');
		};
		this.submit = function submit() {
			if (this.isValid) {
				this.onComplete({
					success: true,
					formattingConfiguration: this.formattingProperties.formattingConfiguration,
					message: gReport.i18n.format_message_on_success
				});
				this.close();
			}
		};
		this.preventDefaultForTabKey = function (event) {
			if (event.keyCode === keyCodes.TAB)
				event.preventDefault();
		};
		$element.on('keydown', '#save-configure-formatting', function keydown(e) {
			if (e.keyCode === keyCodes.TAB && !e.shiftKey) {
				angular.element('#close-configure-formatting').focus();
				e.preventDefault();
			}
		});
		$element.on('keydown', '#cancel-configure-formatting', function keydown(e) {
			if (angular.element("#save-configure-formatting").prop('disabled') && e.keyCode === 9 && !e.shiftKey) {
				angular.element('#close-configure-formatting').focus();
				e.preventDefault();
			}
		});
		this.handleUpDownOnFieldTabs = function handleUpDownOnFieldTabs($event) {
			var keyCode = $event.keyCode;
			if (keyCode === keyCodes.DOWN) {
				$event.preventDefault();
				if (this.selectedIndex !== this.formattingProperties.reportFields.fieldConfigurations.length - 1) {
					this.selectedIndex++;
					this.setFocusOnSelectedFieldTab(this.selectedIndex);
				}
			} else if (keyCode === keyCodes.UP) {
				$event.preventDefault();
				if (this.selectedIndex !== 0) {
					this.selectedIndex--;
					this.setFocusOnSelectedFieldTab(this.selectedIndex);
				}
			}
		};
		this.setFocusOnSelectedFieldTab = function setFocusOnSelectedFieldTab(index) {
			angular.element('#field-tab-value-' + index).focus();
		};
		this.isLoading = function(){
			return this.state === formatViewConstants.states.LOADING;
		}
		this.isNotSuppoted = function(){
			return this.state === formatViewConstants.states.NOT_SUPPORTED;
		}
		this.isShowing = function() {
			return this.state === formatViewConstants.states.SHOW;
		}
	}],
});
;
/*! RESOURCE: /reportdesigner/components/format/components/duration/aggregation/component.format.duration.aggregation.js */
angular.module('reportDesigner').component('formatDurationAggregation', {
	bindings: {
		displayName: '<',
		durationProperties: '<',
		applyDurationProperties: '&',
		chartType: '<'
	},
templateUrl: 'scripts/reportdesigner/components/format/components/duration/aggregation/template.format.duration.aggregation.html',
	controller: ['$element', '$scope', '$http', 'format-commons', function controller($element, $scope, $http, formatCommons) {
		var vm = this;
		this.maxDuration = [];
		this.minDuration = [];
		this.rounding = {};
		this.units = [];
		this.hideSeconds = {};
		this.isEnableAddValueInTooltip = function isEnableAddValueInTooltip() {
			return formatCommons.showElement.reportTypesAddValueInTooltip.includes(this.chartType);
		};
		this.showHideTooltipBox = function showHideTooltipBox() {
			return formatCommons.showElement.hideTooltipsCheckbox.includes(this.chartType);
		};
		this.getDurationHint = function getDurationHint() {
			return gReport.i18n.format_duration_aggregation_hint.format(this.displayName);
		};
		this.isValidMinimum = function isValidMinimum() {
			if (this.durationProperties && this.durationProperties.minimumUnit && this.durationProperties.maximumUnit) {
				var orderOfMaximum = this.timeUnits[this.durationProperties.maximumUnit].order;
				var orderOfMinimum = this.timeUnits[this.durationProperties.minimumUnit].order;
				return orderOfMinimum >= orderOfMaximum;
			}
			return false;
		};
		this.getRoundingHelpMessage = function getRoundingHelpMessage() {
			for (var i = 0; i < this.rounding.length; i++) {
				var item = this.rounding[i];
				if (item.value === this.durationProperties.roundingMode)
					return item.helpMessage;
			}
			return '';
		};
		this.showPopover = function showPopover() {
			var showRoundingDesc = angular.element('#show-rounding-description');
			showRoundingDesc.popover('toggle');
showRoundingDesc.focus();
		};
		this.hidePopover = function hidePopover() {
			setTimeout(function() {
				angular.element('#show-rounding-description').popover('hide');
			}, 300);
		};
		angular.element('#show-rounding-description').popover({
			html: true,
			placement: 'bottom',
			container: '#duration-format-component',
			trigger: 'manual',
			selector: true,
			content: function() {
				return vm.getRoundingHelpMessage();
			},
		});
		this.applyChanges = function applyChanges() {
			if (this.durationProperties.minimumUnit !== 'SECOND')
				this.durationProperties.hideSecondsAfter1Minute = false;
			if (this.isEnableAddValueInTooltip())
				this.durationProperties.addValueInTooltip = this.durationProperties.showOriginalValueInTooltip;
			else
				this.durationProperties.addValueInTooltip = true;
			this.generatePreview();
			this.applyDurationProperties({
				durationProperties: this.durationProperties,
				isValid: this.isValidMinimum()
			});
		};
		this.generatePreview = function generatePreview() {
			if (!this.durationProperties)
				return;
			var preview = '';
			var days = (this.durationProperties.shortNotation ? gReport.i18n.format_duration_preview_days_short : gReport.i18n.format_duration_preview_days);
			var hours = (this.durationProperties.shortNotation ? gReport.i18n.format_duration_preview_hours_short : gReport.i18n.format_duration_preview_hours);
			var minutes = (this.durationProperties.shortNotation ? gReport.i18n.format_duration_preview_minutes_short : gReport.i18n.format_duration_preview_minutes);
			var seconds = (this.durationProperties.shortNotation ? gReport.i18n.format_duration_preview_seconds_short : gReport.i18n.format_duration_preview_seconds);
			var orderOfMinimum = this.timeUnits[this.durationProperties.minimumUnit].order;
			var orderOfMaximum = this.timeUnits[this.durationProperties.maximumUnit].order;
			if (this.timeUnits.DAY.order <= orderOfMinimum && this.timeUnits.DAY.order >= orderOfMaximum)
				preview += '4 ' + days + ' ';
			if (this.timeUnits.HOUR.order <= orderOfMinimum && this.timeUnits.HOUR.order >= orderOfMaximum)
				preview += '3 ' + hours + ' ';
			if (this.timeUnits.MINUTE.order <= orderOfMinimum && this.timeUnits.MINUTE.order >= orderOfMaximum)
				preview += '42 ' + minutes + ' ';
			if (this.timeUnits.SECOND.order <= orderOfMinimum && this.timeUnits.SECOND.order >= orderOfMaximum)
				preview += '24 ' + seconds + ' ';
			return preview;
		};
		this.$onInit = function init() {
			this.timeUnits = formatCommons.duration.timeUnits;
			this.timeUnitsArray = formatCommons.duration.timeUnitsArray();
			this.rounding = formatCommons.duration.rounding;
			this.hideSeconds = formatCommons.duration.hideSeconds;
			this.units = [];
			for (var i = 0; i < formatCommons.duration.unit.length; i++) {
				var item = formatCommons.duration.unit[i];
				this.units.push({
					value: item.value,
					display: (item.value ? gReport.i18n.format_unit_short : gReport.i18n.format_unit_long),
					selected: item.selected
				});
			}
		};
	}],
});
;
/*! RESOURCE: /reportdesigner/components/format/components/number/aggregation/component.format.number.aggregation.js */
angular.module('reportDesigner').component('formatNumberAggregation', {
	bindings: {
		displayName: '<',
		numberProperties: '<',
		applyNumberProperties: '&',
		chartType: '<'
	},
templateUrl: 'scripts/reportdesigner/components/format/components/number/aggregation/template.format.number.aggregation.html',
	controller: ['$element', '$scope', '$http', 'format-commons', '$compile', function controller($element, $scope, $http, formatCommons, $compile) {
		var vm = this;
		this.rounding = {};
		this.abbreviation = {};
		this.getNumberFormattingDescription = function getNumberFormattingDescription() {
			return gReport.i18n.format_duration_aggregation_hint.format(this.displayName);
		};
		this.generatePreview = function generatePreview() {
			var decimalSeparator = gReport.l10n.decimal_separator;
			var groupingSeparator = gReport.l10n.grouping_separator;
			var decimalSeparated = this.numberProperties.metricPrefixSymbolUsed ? '10' : '10' + groupingSeparator + '000' + groupingSeparator + '200';
			var decimalNonSeparated = this.numberProperties.metricPrefixSymbolUsed ? '10' : '10000200';
			var preview = '';
			if (this.numberProperties.groupingUsed)
				preview = decimalSeparated;
			else
				preview = decimalNonSeparated;
			if (this.numberProperties.decimalPrecision > 0) {
				preview += decimalSeparator;
				for (var i = 0; i < this.numberProperties.decimalPrecision - 1; i++)
					preview += '0';
				preview += '1';
			}
			if (this.numberProperties.metricPrefixSymbolUsed)
				preview += 'M';
			return preview;
		};
		this.applyChanges = function applyChanges() {
			this.generatePreview();
			if (this.isEnableAddValueInTooltip())
				this.numberProperties.addValueInTooltip = this.numberProperties.showOriginalNumberInTooltip;
			else
				this.numberProperties.addValueInTooltip = true;
			this.applyNumberProperties({numberProperties:this.numberProperties})
		};
		this.$onInit = function init() {
			this.rounding = formatCommons.number.rounding;
		};
		this.getRoundingHelpMessage = function getRoundingHelpMessage() {
			for (var i = 0; i < this.rounding.length; i++) {
				var item = this.rounding[i];
				if (item.value === this.numberProperties.roundingMode)
					return item.helpMessage;
			}
			return '';
		};
		this.isEnableAddValueInTooltip = function isEnableAddValueInTooltip() {
			return formatCommons.showElement.reportTypesAddValueInTooltip.includes(this.chartType);
		};
		this.showPopover = function showPopover() {
			var showRoundingDesc = angular.element('#show-rounding-description');
			showRoundingDesc.popover('toggle');
showRoundingDesc.focus();
		};
		this.hidePopover = function hidePopover() {
			setTimeout(function () {
				angular.element('#show-rounding-description').popover('hide');
			}, 300);
		};
		angular.element('#show-rounding-description').popover({
			html: true,
			placement: 'bottom',
			container: '#rounding-parent',
			trigger: 'manual',
			selector: true,
			content: function () {
				return vm.getRoundingHelpMessage();
			},
		});
	}],
});
;
/*! RESOURCE: /reportdesigner/components/report-field-description/component.report-field-description.js */
angular.module('reportDesigner').component('reportFieldDescription', {
    bindings: {
fields: '<',
table: '<',
        container: '<',
        checkDisable: '<',
    },
templateUrl: 'scripts/reportdesigner/components/report-field-description/template.report-field-description.html',
    controller: ['ServerService', 'EndpointsService', 'utils', '$element', '$compile', '$scope', '$attrs', function controller(ServerService, EndpointsService, utils, $element, $compile, $scope, $attrs) {
        this.fieldDescriptions = [];
        var getFieldNames = function getFieldNames(fieldDescriptions) {
            var fieldNames = [];
            if (!fieldDescriptions)
                return fieldNames;
            for (var i = 0; i < fieldDescriptions.length; i++)
                fieldNames.push(fieldDescriptions[i].fieldName);
            return fieldNames;
        };
        this.hidePopover = function hidePopover() {
            $element.popover('hide');
            var id = this.btnGuuid + '-popover-description-button';
            angular.element('#' + id).focus();
        };
        this.getFieldDescriptions = function getFieldDescriptions() {
            var self = this;
            if (self.table && self.fields && gReport.isTableAndFieldDescriptionEnabled) {
                var fieldNames = self.fields.split(',');
                for (var i = fieldNames.length-1; i>=0; i--) {
                    if (utils.isVariables(fieldNames[i]))
                       fieldNames.splice(i, 1);
                }
                var params = {
                    fieldNames: fieldNames
                };
                if (utils.arraysEqual(fieldNames, getFieldNames(self.fieldDescriptions))) {
                    $element.popover('toggle');
                    return;
                }
                return ServerService.get(EndpointsService.getFieldDescriptionUrl + self.table, {params: params})
                    .then(function getData(response) {
                        self.fieldDescriptions = response.result;
                        $element.popover('toggle');
                    });
            }
            return null;
        };
        this.btnGuuid = 'rep-fields-desc-'+ $attrs.id + '-' + new Date().getTime();
        angular.element(document).find('body').on('click', function (e) {
            var allFieldDescriptions = angular.element('report-field-description');
            for (var i = 0; i < allFieldDescriptions.length; i++)
                if (angular.element('#' + allFieldDescriptions[i].id).data()['bs.popover'].tip().hasClass('in') &&
                    !isInPopoverContent(e.target) &&
                    (angular.element(e.target).data('toggle') !== 'popover' || e.target.parentElement.parentElement.id !== allFieldDescriptions[i].id))
                    hidePopoverById(allFieldDescriptions[i].id);
        });
        function isInPopoverContent(element) {
            return angular.element("#field-description-content")[0].contains(element);
        }
        function hidePopoverById(elementId) {
            angular.element('#' + elementId).popover('hide');
        }
        $element.popover({
            html: true,
            content: function () {
return $compile('<field-description-content class="field-description-content" field-descriptions="$ctrl.fieldDescriptions" />')($scope);
            },
            placement: 'bottom',
            container: '.main-content',
            trigger: 'manual'
        }).data('bs.popover')
            .tip()
            .addClass('field-description-content');
        this.isDisabledForVariables = function isDisabledForVariables() {
            var self = this;
            if (self.checkDisable && self.fields) {
                var fieldNames = self.fields.split(',');
                for (var i = 0; i < fieldNames.length; i++) {
                    if (!utils.isVariables(fieldNames[i])) {
                       return false;
                    }
                }
                return true;
            }
            return false;
        };
    }],
});
;
/*! RESOURCE: /reportdesigner/components/field-description-content/component.field-description-content.js */
angular.module('reportDesigner').component('fieldDescriptionContent', {
	bindings: {
		fieldDescriptions: '<',
	},
templateUrl: 'scripts/reportdesigner/components/field-description-content/template.field-description-content.html',
	controller: ['ServerService', 'EndpointsService', 'utils', '$element', '$compile', '$scope', function controller(ServerService, EndpointsService, utils, $element, $compile, $scope) {
		this.$onChanges = function onChanges() {
			setTimeout(function () {
				angular.element('#field-label-0').focus();
			}, 500);
		};
		this.onKeyDown = function onKeyDown(e) {
if (e.keyCode === 27) {
				e.preventDefault();
				$scope.$parent.$ctrl.hidePopover();
				return;
			}
			var firstFocusableElementId = 'field-label-0';
			var lastFocusableElementId = 'field-desc-' + (this.fieldDescriptions.length - 1);
if (e.keyCode === 9) {
				if (e.shiftKey) {
					if (document.activeElement.id === firstFocusableElementId) {
						e.preventDefault();
						angular.element('#' + lastFocusableElementId).focus();
					}
				} else {
					if (document.activeElement.id === lastFocusableElementId) {
						e.preventDefault();
						angular.element('#' + firstFocusableElementId).focus();
					}
				}
			}
		};
	}],
});
;
/*! RESOURCE: /reportdesigner/components/nlq-help-modal/component.nlq-help-modal.js */
angular.module('reportDesigner').component('nlqHelpModal', {
templateUrl: 'scripts/reportdesigner/components/nlq-help-modal/template.nlq-help-modal.html',
	controller: ['$element', function controller($element) {
		$element.on('keydown', '#nlq-help-modal-apply', function keydown(e) {
			if (e.keyCode === 9 && !e.shiftKey) {
				angular.element('#nlq-help-modal-close').focus();
				e.preventDefault();
			}
		});
	}]
});
;
/*! RESOURCE: /reportdesigner/components/iframe-loader/component.iframe-loader.js */
angular.module('reportDesigner').component('iframeLoader', {
	bindings: {
		table: '<',
		source: '<',
	},
templateUrl: 'scripts/reportdesigner/components/iframe-loader/function-field-iframe-loader.html?v=' + window.g_builddate,
	controller: ['$element', '$scope', 'snCustomEvent', '$timeout',
		function controller($element, $scope, snCustomEvent, $timeout) {
			var self = this;
			self.isIframeLoaading = true;
			angular.element($element).children().find('#main-iframe').on('load', function onLoad(event) {
				var iframe = event && event.target;
				var currentUrl = iframe.contentWindow.location.href;
				if (currentUrl === "about:blank") return;
			});
			self.close = function close() {
				angular.element($element).find('#function-field-modal').modal('hide');
self.isIframeLoaading = true;
			};
			self.resetIframeHeight = function() {
				var iframe = angular.element($element).children().find('#main-iframe');
				var iFrameHeight = iframe.get(0) && iframe.get(0).contentWindow.document.body.scrollHeight;
				iframe.height(iFrameHeight || 500);
			};
			self.$onInit = function init() {
				snCustomEvent.observe('iframeLoader::hideModal', self.close);
				snCustomEvent.observe('iframeLoader::notify', function onSave(config) {
					self.close();
					snCustomEvent.fireAll('reportDesigner:functionField:onUpdate', config);
				});
				snCustomEvent.observe('iframeLoader::delete', function onSave(config) {
					self.close();
					snCustomEvent.fireAll('reportDesigner:functionField:onUpdate', config);
				});
				snCustomEvent.observe('iframeLoader::contentReady', function contentReady() {
					self.isIframeLoaading = false;
					$scope.$apply();
					$timeout(function() {
						self.resetIframeHeight();
angular.element($element).find('#close-configure-func-field').focus();
						snCustomEvent.fireAll('iframeLoader::iframeLoaded');
					}, 50);
				});
				snCustomEvent.observe('iframeLoader::focusFirstItem', function focusFirstItem() {
angular.element($element).find('#close-configure-func-field').focus();
				});
				angular.element($element).find('#close-configure-func-field').on('keydown', function($event) {
					if ($event.keyCode === 13 || $event.keyCode === 32) {
						return;
					}
					if ($event.keyCode == 9)
						snCustomEvent.fireAll('ffController::focusFirstItem');
					$event.preventDefault();
					return;
				});
				angular.element($element).find('#function-field-modal').on('show.bs.modal', function onModalShow() {
					angular.element($element).children().find('#main-iframe').attr('src',
'/function_field_builder.do?sysparm_source=' + self.source + '&sysparm_table=' + self.table + '&v=' + window.g_builddate);
				});
			};
		}],
});
;
/*! RESOURCE: /reportdesigner/components/nlq-feedback/component.nlq-feedback.js */
angular.module('reportDesigner').component('nlqFeedback', {
templateUrl: 'scripts/reportdesigner/components/nlq-feedback/template.nlq-feedback.html',
	controller: ['$timeout', 'handleFeedback', 'snCustomEvent', function controller($timeout, feedback, snCustomEvent) {
		var ctrl = this;
		var feedbackCategory = null;
		ctrl.feedbackProvided = false;
		ctrl.nlqLog = null;
		ctrl.feedbackProblemCategory = null;
		function openModal() {
			$j('#nlq-feedback-modal').modal('show');
			$j('#nlq-feedback-modal').on('hide.bs.modal', function sendNegativeFeedBack() {
				$timeout(function timeout() {
					if (ctrl.nlqLog) feedback.negative(ctrl.nlqLog, feedbackCategory).then(function successCallback() {
						ctrl.feedbackProvided = true;
					}, function errorCallback() {
						console.error(
							'ERROR: Feedback sentiment update failed for sys_id: ' + ctrl.nlqLog
						);
					});
					ctrl.feedbackProblemCategory = null;
					feedbackCategory = null;
					$j('#nlq-feedback-modal').unbind('hide.bs.modal');
				});
			});
		}
		ctrl.submitProblemCategory = function submitProblemCategory(e) {
			e.preventDefault();
			feedbackCategory = ctrl.feedbackProblemCategory;
		};
		ctrl.positiveFeedback = function positiveFeedback(e) {
			e.preventDefault();
			if (ctrl.nlqLog) feedback.positive(ctrl.nlqLog).then(function successCallback() {
				ctrl.feedbackProvided = true;
			}, function errorCallback() {
				console.error(
					'ERROR: Feedback sentiment update failed for sys_id: '+ ctrl.nlqLog
				);
			});
		};
		ctrl.negativeFeedback = function negativeFeedback(e) {
			e.preventDefault();
			openModal();
		};
		snCustomEvent.observe('reportDesigner:input-nlq-callback', function nlqCallBackController(payload) {
			$timeout(function timeout() {
				ctrl.nlqLog = null;
				ctrl.feedbackProvided = false;
				var statusCode = payload.apiResult.status_code;
				if (statusCode === 'ok') ctrl.nlqLog = payload.apiResult.nlq_log;
			});
		});
	}]
});
;
;
/*! RESOURCE: /scripts/reportdesigner/js_includes_reportdesigner.js */
