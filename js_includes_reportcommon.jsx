/*! RESOURCE: /reportcommon/module.report-common.js */
angular.module('report.common', [
	'sn.common.util',
]);
;
/*! RESOURCE: /reportcommon/constants/constant.keyCodes.js */
angular
	.module('report.common')
	.constant('keyCodes', {
		SPACE_BAR: 32
	});
;
/*! RESOURCE: /reportcommon/filters/filter.i18n.js */
angular.module('report.common').filter('i18n', function i18nFilter() {
	'use strict';
	var _private = {
		getDictionary: function getDictionary() {
			if (!window.gReport || !window.gReport.i18n)
				return false;
			return angular.copy(window.gReport.i18n);
		},
		getTranslation: function getTranslation(key) {
			var dictionary = this.getDictionary();
			if (!dictionary || !dictionary[key])
				return key;
			return dictionary[key];
		},
		replaceVars: function replaceVars(str, vars) {
			var regex;
			var result = str.toString();
			if (!angular.isArray(vars))
				return result;
			vars.forEach(function eachVar(value, index) {
				regex = new RegExp('\\{' + index + '\\}', 'g');
				result = result.replace(regex, value);
			});
			return result;
		}
	};
	return function i18nFilterResponse(input, vars) {
		var translation = _private.getTranslation(input);
		return _private.replaceVars(translation, vars);
	};
});
;
/*! RESOURCE: /reportcommon/filters/filter.reverse.js */
angular.module('report.common').filter('reverse', function reverseFilter() {
	'use strict';
	return function reverseFilterResponse(items) {
		return items.slice().reverse();
	};
});
;
/*! RESOURCE: /reportcommon/services/service.object-array.js */
angular.module('report.common').factory('objectArray', function objectArrayServ() {
	'use strict';
	return {
		setIndexes: function setIndexes(elements) {
			angular.forEach(elements, function indexesForEach(element, index) {
				element.index = index;
			});
		},
		inArray: function inArray(element, elements, field) {
			return (elements.indexOf(element[field]) >= 0);
		},
		uniqueAddToArray: function uniqueAddToArray(element, elements, field) {
			if (angular.isArray(element))
				angular.forEach(element, function elementsForEach(item) {
					this.uniqueAddToArray(item, elements, field);
				}, this);
			if (!this.inArray(element, elements, field)) {
				element.index = elements.length;
				elements.push(element[field]);
			}
		},
		removeFromArray: function removeFromArray(element, elements, field) {
			var index = elements.indexOf(element[field]);
			if (index < 0)
				return;
			elements.splice(index, 1);
		},
	};
});
;
/*! RESOURCE: /reportcommon/services/service.charts-model.js */
angular.module('report.common').factory('chartsModel', ['$filter', function chartsModelFactory($filter) {
	'use strict';
	var groups = [
		{ type: 'bars' },
		{ type: 'piesDonuts' },
		{ type: 'timeSeries' },
		{ type: 'multidimensional' },
		{ type: 'scores' },
		{ type: 'other' },
	];
	var charts = [
		{ title: 'AREA', type: 'area', group: 'timeSeries' },
		{ title: 'BAR', type: 'bar', group: 'bars' },
		{ title: 'BOX', type: 'box', group: 'other' },
		{ title: 'BUBBLE', type: 'bubble', group: 'multidimensional' },
		{ title: 'CALENDAR', type: 'calendar', group: 'other' },
		{ title: 'COLUMN', type: 'line_bar', group: 'timeSeries' },
		{ title: 'CONTROL', type: 'control', group: 'other' },
		{ title: 'DIAL', type: 'solid_gauge', group: 'scores' },
		{ title: 'DONUT', type: 'donut', group: 'piesDonuts' },
		{ title: 'FUNNEL', type: 'funnel', group: 'other' },
		{ title: 'HEATMAP', type: 'heatmap', group: 'multidimensional' },
		{ title: 'HISTOGRAM', type: 'hist', group: 'bars' },
		{ title: 'HORIZONTAL_BAR', type: 'horizontal_bar', group: 'bars' },
		{ title: 'LINE', type: 'line', group: 'timeSeries' },
		{ title: 'LIST', type: 'list', group: 'other' },
		{ title: 'MAP', type: 'map', group: 'other' },
		{ title: 'MULTIPIVOT', type: 'pivot_v2', group: 'multidimensional' },
		{ title: 'PARETO', type: 'pareto', group: 'bars' },
		{ title: 'PIE', type: 'pie', group: 'piesDonuts' },
		{ title: 'PIVOT', type: 'pivot', group: 'other' },
		{ title: 'PYRAMID', type: 'pyramid', group: 'other' },
		{ title: 'SEMI_DONUT', type: 'semi_donut', group: 'piesDonuts' },
		{ title: 'SINGLE_SCORE', type: 'single_score', group: 'scores' },
		{ title: 'SPEEDOMETER', type: 'angular_gauge', group: 'scores' },
		{ title: 'SPLINE', type: 'spline', group: 'timeSeries' },
		{ title: 'STEP_LINE', type: 'step_line', group: 'timeSeries' },
		{ title: 'TREND', type: 'trend', group: 'other' },
		{ title: 'TRENDBOX', type: 'tbox', group: 'other' }
	];
	function addMetaData(collection) {
		collection.forEach(function addDesc(obj) {
			obj.name = $filter('i18n')(obj.type);
			obj.description = $filter('i18n')(obj.type + 'Desc');
		});
	}
	addMetaData(groups);
	addMetaData(charts);
	return {
		groups: groups,
		charts: charts,
		getChartsFromGroup: function getChartsFromGroup(groupType) {
			return this.charts.filter(function filterCb(chart) {
				return chart.group === groupType;
			});
		},
		getType: function getType(title) {
			var selectedChart = this.charts.filter(function filterCb(chart) {
				return chart.title === title;
			});
			return selectedChart.type;
		}
	};
}]);
;
/*! RESOURCE: /reportcommon/directives/directive.setFocus.js */
angular.module('report.common').directive('setFocus', ['$window', '$timeout', function setFocusDirective($window, $timeout) {
	'use strict';
	function setFocus(target, miliseconds) {
		var timer = parseInt(miliseconds, 10) || 500;
		if (timer === 0) {
			angular.element('#' + target).focus();
		} else {
			$timeout(function delayedFocus() {
				angular.element('#' + target).focus();
			}, timer);
		}
	}
	return {
		restrict: 'C',
		scope: {
			targetEl: '@',
			lastEl: '@',
bothFocus: '@',
			delay: '@'
		},
		link: function link(scope, el, attrs) {
			var isDropdown = attrs.toggle && attrs.toggle === 'dropdown';
if (scope.lastEl || scope.bothFocus) {
				el.on('blur', function blurCb() {
					setFocus(scope.targetEl, scope.delay);
				});
			}
if (!scope.lastEl) {
				el.on('keydown', function keyUpCb(event) {
					var keyCode = event.keyCode || event.which;
if ((isDropdown && keyCode === 40) || keyCode === 13 || keyCode === 32) {
						setFocus(scope.targetEl);
					}
				});
			}
			el.on('click', function clickCb() {
				if (el.hasClass('close-sidebar'))
					setFocus(scope.targetEl);
			});
		},
	};
}]);
;
/*! RESOURCE: /reportcommon/directives/directive.snSetFocus.js */
angular.module('report.common').directive('snSetFocus', ['$timeout', function ($timeout) {
	'use strict';
	return {
		restrict: 'A',
		scope: {
			trigger: '=*snSetFocus',
		},
		link: function link(scope, element) {
			scope.$watch('trigger', function watch(value) {
				if (value === true)
					$timeout(function afterDigest() {
						element.focus();
						scope.trigger = false;
					}, 300);
			});
		},
	};
}]);
;
/*! RESOURCE: /reportcommon/directives/directive.restrict-tabbing.js */
angular.module('report.common').directive('restrictTabbing', ['$timeout', function restrictTabbingDirective($timeout) {
	'use strict';
	return {
		scope: {
			enabled: '=*restrictTabbing',
		},
		controller: ['$element', '$scope', function controller($element, $scope) {
			var timeoutInstance;
			var enabled = false;
			var selector = 'input,select,a,button,[tabindex]';
			var destroyAndCleanup = function destroyAndCleanup() {
				$timeout.cancel(timeoutInstance);
				$element.off('focusin');
				$element.off('focusout');
				enabled = false;
				console.log('destroying', $element);
			};
			$scope.$watch('enabled', function enabledStateChanged(newValue) {
				enabled = newValue;
			});
			$element.on('focusout', function blur() {
				if (!enabled)
					return;
				timeoutInstance = $timeout(function focusOut() {
					$element.find(selector).first().focus();
				}, 30);
			});
			$element.on('focusin', function focus() {
				console.log('enabled', enabled, $element);
				if (!enabled)
					return;
				if (timeoutInstance)
					$timeout.cancel(timeoutInstance);
			});
			$element.on('$destroy', destroyAndCleanup);
		}],
	};
}]);
;
/*! RESOURCE: /reportcommon/directives/directive.user-autocomplete.js */
angular.module('report.common').directive('userAutocomplete', ['$q', '$http', '$timeout', 'getTemplateUrl', 'objectArray', function userAutocompleteDirective($q, $http, $timeout, getTemplateUrl, objectArray) {
	'use strict';
	var _private = {
		getKey: function getKey(keyCode) {
			var keys = {
				37: 'left',
				38: 'up',
				39: 'right',
				40: 'down',
				27: 'esc',
				46: 'delete',
				8: 'backspace',
				9: 'tab',
				13: 'enter',
			};
			return keys[keyCode] || 'other';
		},
	};
	return {
		restrict: 'E',
		templateUrl: getTemplateUrl('common-directive-user-autocomplete.xml'),
		scope: {
			api: '=?',
			httpOptions: '=?',
			elements: '=?',
			options: '=?',
			attachDropdownTo: '=?',
			type: '=?',
			multiple: '=?',
			clearWhenSelected: '=?',
			vertical: '=?',
			closeable: '=?',
			closeableLabel: '@',
			parseResponse: '&',
			onChange: '&',
			onElementAdd: '&',
			onElementClick: '&',
			onElementRemove: '&',
			beforeDropdownShow: '&',
			afterDropdownShow: '&',
			beforeDropdownHide: '&',
			afterDropdownHide: '&',
		},
		link: function link(scope, element, attributes) {
			scope.query = '';
			scope.querySuggestion = '';
			scope.categorizedOptions = [];
			scope.loading = false;
			scope.bypassQueryWatch = false;
			scope.visibleInput = true;
			scope.focus = '';
			scope._promiseReference = false;
			scope._timeoutReference = false;
			scope._selected = [];
			scope.field = attributes.valueField || 'sys_id';
			scope.label = attributes.labelField || 'name';
			scope.pointer = {
				type: 'input',
				index: false,
			};
			if (angular.isUndefined(scope.multiple))
				scope.multiple = false;
			if (angular.isUndefined(scope.vertical))
				scope.vertical = false;
			if (angular.isUndefined(scope.clearWhenSelected))
				scope.clearWhenSelected = true;
			if (angular.isUndefined(scope.elements))
				scope.elements = [];
			else
				scope.select(scope.elements);
			if (angular.isUndefined(scope.options))
				scope.options = [];
			scope.clickableUser = !angular.isUndefined(attributes.onElementClick);
			if (angular.isUndefined(scope.closeable))
				scope.closeable = false;
			if (scope.closeable)
				scope.visibleInput = false;
			scope.httpOptions = angular.merge({
url: '/api/now/reporting/searchidentities',
				params: {
					action: 'SEARCH_IDENTITIES',
					type: 'all',
				},
			}, scope.httpOptions);
			if (!angular.isUndefined(scope.type)) {
				scope.httpOptions.params.type = scope.type;
				scope.$watch('type', function typeChange(newType) {
					scope.httpOptions.params.type = newType;
				});
			}
			if (!attributes.parseResponse)
				scope.parseResponse = function parseResponse(response) {
					return response.data || {};
				};
			if (!angular.isUndefined(scope.attachDropdownTo))
				element.find('.dropdown-wrapper').appendTo(scope.attachDropdownTo);
		},
		controller: ['$scope', '$element', function controller($scope, $element) {
			var setPointer = function setPointer(type, index) {
				if (typeof type === 'number')
					$scope.pointer.index = type;
				else if (typeof type === 'string') {
					$scope.pointer.type = type;
					$scope.pointer.index = index;
				}
				angular.forEach($scope.options, function optionsForEach(element, optionIndex) {
					element.selected = (optionIndex === $scope.pointer.index && $scope.pointer.type === 'options');
				});
				angular.forEach($scope.elements, function elementsForEach(element, elementIndex) {
					element.selected = (elementIndex === $scope.pointer.index && $scope.pointer.type === 'elements');
				});
			};
			var escapeRegExp = function escapeRegExp(str) {
return str.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
			};
			var setCaseSuggestion = function setCaseSuggestion() {
				var re = new RegExp('^' + escapeRegExp($scope.query), 'i');
				if (!re.test($scope.querySuggestion))
					return false;
				$scope.querySuggestion = $scope.querySuggestion.replace(re, $scope.query);
				return true;
			};
			var setOptions = function setOptions(categorizedOptions) {
				$scope.options = [];
				$scope.categorizedOptions = categorizedOptions;
				if (categorizedOptions.length) {
					if ($scope.beforeDropdownShow)
						$scope.beforeDropdownShow();
				} else
					if ($scope.beforeDropdownHide)
						$scope.beforeDropdownHide();
				angular.forEach($scope.categorizedOptions, function categoryEach(category) {
					angular.forEach(category.search_results, function optionsEach(option) {
						option.realIndex = $scope.options.length;
						$scope.options.push(option);
					});
				});
				if (categorizedOptions.length) {
					if ($scope.afterDropdownShow)
						$scope.afterDropdownShow();
				} else
					if ($scope.afterDropdownHide)
						$scope.afterDropdownHide();
			};
			$scope.$watch('query', function watch(newValue) {
				var httpOptions;
				if ($scope.bypassQueryWatch) {
					$scope.bypassQueryWatch = false;
					return;
				}
				httpOptions = angular.copy($scope.httpOptions);
				httpOptions.params.keywords = newValue;
				if ($scope.multiple)
					httpOptions.params.ignore = $scope._selected.join(',');
				if (!setCaseSuggestion())
					$scope.querySuggestion = '';
				if ($scope._timeoutReference)
					$timeout.cancel($scope._timeoutReference);
				if ($scope._promiseReference)
					$scope._promiseReference.resolve('canceled');
				if (!newValue) {
					setOptions([]);
					$scope.querySuggestion = '';
					setPointer('input', false);
					$scope.loading = false;
					return;
				}
				$scope.loading = true;
				$scope._timeoutReference = $timeout(function timeout() {
					if ($scope._promiseReference)
						$scope._promiseReference.resolve('canceled');
					$scope._promiseReference = $q.defer();
					httpOptions.timeout = $scope._promiseReference.promise;
					$http(httpOptions, true).then(function afterGet(response) {
						$scope._promiseReference = false;
						setOptions([]);
						$scope.loading = false;
						return $scope.parseResponse(response);
					}).then(function afterParse(response) {
						var jsonResponse = [];
						if (!response || !response.result || !response.result.search_results) {
							setPointer('input', false);
							return;
						}
						jsonResponse.push(response.result);
						setOptions(jsonResponse);
						$scope.setOptionsIndex(0);
					}, true);
				}, 250);
			});
			$scope.showInput = function showInput() {
				$scope.visibleInput = true;
				$scope.focus = 'input';
			};
			$scope.focusInput = function focusInput() {
				$scope.focus = '';
				$timeout(function afterApply() {
					$scope.focus = 'input';
				});
			};
			$scope.hideInput = function hideInput() {
				$scope.visibleInput = false;
				$scope.query = '';
				$scope.querySuggestion = '';
				$scope.options = [];
				$scope.categorizedOptions = [];
				setPointer('input', false);
			};
			$scope.select = function select(element, event) {
				var addToElements = true;
				if (angular.isArray(element)) {
					angular.forEach(element, function eachElement(single) {
						$scope.select(single);
					});
					return;
				}
				if ($scope.onElementAdd && $scope.onElementAdd({ element: element }) === false)
					addToElements = false;
				if (addToElements) {
					if (!$scope.multiple) {
						$scope.elements = [];
						$scope._selected = [];
					}
					if (!objectArray.inArray(element, $scope._selected, $scope.field))
						$scope.elements.push(element);
				}
				if (event)
					event.stopPropagation();
				if (!addToElements)
					return;
				objectArray.uniqueAddToArray(element, $scope._selected, $scope.field);
				setOptions([]);
				setPointer('input', false);
				if ($scope.multiple || $scope.clearWhenSelected) {
					$scope.query = '';
					$scope.querySuggestion = '';
				} else {
					$scope.query = element[$scope.label];
					$scope.querySuggestion = $scope.query;
					$scope.bypassQueryWatch = true;
				}
				$scope.focus = 'input';
				if ($scope.onChange)
					$scope.onChange({
						users: $scope.elements,
					});
			};
			$scope.remove = function remove(element, event) {
				var removeFromElements = true;
				if (event)
					event.stopPropagation();
				if ($scope.onElementRemove && $scope.onElementRemove({ element: element }) === false) {
					removeFromElements = false;
					return;
				}
				objectArray.removeFromArray(element, $scope._selected, $scope.field);
				if (removeFromElements)
					$scope.elements.splice(element.index, 1);
				objectArray.setIndexes($scope.elements);
				$scope.query = '';
				$scope.querySuggestion = '';
				setPointer('input', false);
				$scope.focus = 'input';
				if ($scope.onChange)
					$scope.onChange({
						users: $scope.elements,
					});
			};
			$scope.userClick = function userClick(element) {
				if (!$scope.onElementClick || !element)
					return;
				$scope.hideInput();
				$scope.onElementClick({
					element: element,
				});
			};
			$scope.setOptionsIndex = function setOptionsIndex(index) {
				var element = $scope.options[index] || {};
				$scope.querySuggestion = element[$scope.label] || '';
				setCaseSuggestion();
				setPointer('options', index);
			};
			$scope.scrollToVerticalIndexElement = function scrollToVerticalIndexElement() {
				var $verticalElements;
				var scrollMax;
				var realIndex = $scope.elements.length - $scope.pointer.index;
				var ratio;
				if ($scope.pointer.index === false)
					return;
				$verticalElements = $element.find('.vertical-elements');
				scrollMax = $verticalElements.prop('scrollHeight') - $verticalElements.innerHeight();
ratio = 1 - (realIndex / ($scope.elements.length - 1));
$verticalElements.scrollTop((scrollMax / $scope.elements.length) * (realIndex - ratio));
			};
			$scope.keydown = function keydown(event) {
				var key = _private.getKey(event.keyCode);
				if ($scope[key + 'Keydown'])
					$scope[key + 'Keydown'](event, $scope.query);
				else
					setPointer('input', false);
			};
			$scope.leftKeydown = function leftKeydown(event) {
				if ($scope.vertical && event)
					return;
				if (!$scope.multiple || $scope.query || !$scope.elements.length)
					return;
				$scope.pointer.type = 'elements';
				if ($scope.pointer.index === false)
					$scope.pointer.index = $scope.elements.length - 1;
				else if ($scope.pointer.index > 0)
					$scope.pointer.index--;
				setPointer();
				if ($scope.vertical)
					$scope.scrollToVerticalIndexElement();
			};
			$scope.rightKeydown = function rightKeydown(event) {
				if ($scope.vertical && event)
					return;
				if ($scope.query) {
					if ($scope.querySuggestion)
						$scope.query = $scope.querySuggestion;
					return;
				}
				if (!$scope.multiple || !$scope.elements.length || $scope.pointer.type !== 'elements') {
					setPointer('input', false);
					return;
				}
				$scope.pointer.type = 'elements';
				if ($scope.pointer.index < $scope.elements.length - 1)
					$scope.pointer.index++;
				else if ($scope.pointer.index === $scope.elements.length - 1) {
					$scope.pointer.type = 'input';
					$scope.pointer.index = false;
				}
				setPointer();
				if ($scope.vertical)
					$scope.scrollToVerticalIndexElement();
			};
			$scope.downKeydown = function downKeydown(event) {
				if (!$scope.options.length) {
					if ($scope.vertical)
						$scope.leftKeydown();
					return;
				}
				if (event)
					event.preventDefault();
				$scope.pointer.type = 'options';
				if ($scope.pointer.index < $scope.options.length - 1)
					$scope.pointer.index++;
				else
					$scope.pointer.index = 0;
				$scope.setOptionsIndex($scope.pointer.index);
			};
			$scope.tabKeydown = $scope.downKeydown;
			$scope.upKeydown = function upKeydown(event) {
				if (!$scope.options.length) {
					if ($scope.vertical)
						$scope.rightKeydown();
					return;
				}
				if (event)
					event.preventDefault();
				$scope.pointer.type = 'options';
				if ($scope.pointer.index > 0)
					$scope.pointer.index--;
				else
					$scope.pointer.index = $scope.options.length - 1;
				$scope.setOptionsIndex($scope.pointer.index);
			};
			$scope.enterKeydown = function enterKeydown(event) {
				if (!$scope.options.length || $scope.pointer.type !== 'options') {
					if ($scope.vertical && $scope.pointer.type === 'elements')
						$scope.userClick($scope.elements[$scope.pointer.index]);
					return;
				}
				if (event)
					event.preventDefault();
				$scope.select($scope.options[$scope.pointer.index]);
			};
			$scope.backspaceKeydown = function backspaceKeydown(event) {
				if (!$scope.multiple || !$scope.elements.length || $scope.query)
					return;
				if ($scope.vertical && $scope.pointer.type !== 'elements')
					return;
				if (event)
					event.preventDefault();
				if ($scope.pointer.type !== 'elements')
					setPointer('elements', $scope.elements.length - 1);
				else
					$scope.remove($scope.elements[$scope.pointer.index]);
			};
			$scope.deleteKeydown = $scope.backspaceKeydown;
			$scope.escKeydown = function escKeydown(event) {
				if (!$scope.closeable)
					return;
				if (event)
					event.preventDefault();
				$scope.hideInput();
			};
			if (angular.isUndefined($scope.api))
				$scope.api = {};
			$scope.api.hideInput = $scope.hideInput;
			$scope.api.clearSelected = function clearSelected() {
				$scope._selected = [];
				$scope.elements = [];
				if ($scope.pointer.type === 'elements')
					setPointer('input', false);
			};
			$scope.api.getSelected = function getSelected() {
				return $scope.elements;
			};
			$scope.api.setSelected = function setSelected(elements) {
				if (!elements || !elements.length)
					return;
				angular.forEach(elements, function eachExistingElement(element) {
					if (element[$scope.field])
						$scope._selected.push(element[$scope.field]);
				});
				$scope.elements = elements;
			};
		}],
	};
}]);
;
/*! RESOURCE: /reportcommon/directives/directive.share-permissions-invite.js */
angular.module('report.common').directive('sharePermissionsInvite', ['getTemplateUrl', function sharePermissionsInviteDirective(getTemplateUrl) {
	'use strict';
	return {
		restrict: 'E',
		templateUrl: getTemplateUrl('common-directive-share-permissions-invite.xml'),
		scope: {
			type: '=?',
			onBack: '&',
			onSubmit: '&',
			inviteHttpOptions: '=',
			autocompleteHttpOptions: '=',
		},
		link: function link(scope) {
			scope.inviteMessage = '';
			scope.users = [];
			scope.autocomplete = {};
			if (angular.isUndefined(scope.type))
				scope.type = 'all';
			scope.showInviteMessage = (scope.inviteHttpOptions !== false);
			scope.showBackButton = !angular.isUndefined(scope.onBack);
		},
		controller: ['$scope', function controller($scope) {
			$scope.goBackToListing = function goBackToListing() {
				$scope.inviteMessage = '';
				$scope.autocomplete.clearSelected();
				if ($scope.onBack)
					$scope.onBack();
			};
			$scope.changeUsers = function changeUsers(users) {
				$scope.users = angular.copy(users);
			};
			$scope.submitUsers = function submitUsers() {
				if ($scope.onSubmit)
					$scope.onSubmit({
						users: $scope.users,
						message: $scope.inviteMessage,
					});
				$scope.inviteMessage = '';
				$scope.users = [];
				$scope.autocomplete.clearSelected();
			};
		}],
	};
}]);
;
/*! RESOURCE: /reportcommon/directives/directive.share-permissions-single-user.js */
angular.module('report.common').directive('sharePermissionsSingleUser', ['getTemplateUrl', 'i18nFilter', function sharePermissionsSingleUserDirective(getTemplateUrl, i18nFilter) {
	'use strict';
	return {
		restrict: 'E',
		templateUrl: getTemplateUrl('common-directive-share-permissions-single-user.xml'),
		scope: {
			user: '=?',
			users: '=?',
			onBack: '&',
			canRemove: '=?',
			onRemove: '&',
		},
		link: function link(scope) {
			if (angular.isUndefined(scope.canRemove))
				scope.canRemove = true;
			if (!angular.isArray(scope.users))
				scope.canRemove = false;
			scope.showBackButton = !angular.isUndefined(scope.onBack);
			scope.types = {
				1: i18nFilter('Role'),
				2: i18nFilter('Group'),
				3: i18nFilter('User'),
			};
		},
		controller: ['$scope', function controller($scope) {
			$scope.goBackToListing = function goBackToListing() {
				if ($scope.onBack)
					$scope.onBack();
			};
			$scope.removeUser = function removeUser(user) {
				var index;
				if (!$scope.canRemove || !angular.isArray($scope.users))
					return;
				index = $scope.users.indexOf(user);
				if (index >= 0)
					$scope.users.splice(index, 1);
				if ($scope.onRemove)
					$scope.onRemove({
						user: user,
					});
				$scope.goBackToListing();
			};
		}],
	};
}]);
;
/*! RESOURCE: /reportcommon/directives/directive.share-permissions-users-listing.js */
angular.module('report.common').directive('sharePermissionsUsersListing', ['getTemplateUrl', 'i18nFilter', function sharePermissionsUsersListing(getTemplateUrl, i18nFilter) {
	'use strict';
	return {
		restrict: 'E',
		templateUrl: getTemplateUrl('common-directive-share-permissions-users-listing.xml'),
		scope: {
			users: '=?',
			filter: '=?',
			canRemove: '=?',
			canClick: '=?',
			onRemove: '&',
			onClick: '&',
		},
		link: function link(scope, element, attributes) {
			if (angular.isUndefined(scope.users))
				scope.users = [];
			if (angular.isUndefined(scope.canRemove))
				scope.canRemove = true;
			if (angular.isUndefined(scope.canClick))
				scope.canClick = true;
			if (angular.isUndefined(scope.filter))
				scope.filter = {};
			scope.labelEmpty = attributes.labelEmpty || i18nFilter('No users');
		},
		controller: ['$scope', function controller($scope) {
			$scope.clickUser = function clickUser(user) {
				if (!$scope.canClick)
					return;
				if ($scope.onClick)
					$scope.onClick({
						user: user,
					});
			};
			$scope.removeUser = function removeUser(user, event) {
				var index;
				event.stopImmediatePropagation();
				if (!$scope.canRemove)
					return;
				index = $scope.users.indexOf(user);
				if (index >= 0)
					$scope.users.splice(index, 1);
				if ($scope.onRemove)
					$scope.onRemove({
						user: user,
					});
			};
		}],
	};
}]);
;
/*! RESOURCE: /reportcommon/directives/directive.share-permissions.js */
angular.module('report.common').directive('sharePermissions', ['getTemplateUrl', function sharePermissionsDirective(getTemplateUrl) {
	'use strict';
	var _private = {
		concat: function concat(a, b, field) {
			angular.forEach(b, function bForEach(item) {
				if (!this.inArray(item, a, field))
					a.push(item);
			}, this);
		},
		inArray: function inArray(value, items, field) {
			return items.some(function someInArray(item) {
				return item[field] === value[field];
			}, this);
		},
		typeToNumber: function typeToNumber(type) {
			var types = {
				roles: 1,
				groups: 2,
				users: 3,
			};
			return types[type] || 0;
		},
		numberToType: function numberToType(type) {
			var types = {
				1: 'roles',
				2: 'groups',
				3: 'users',
			};
			return types[type] || '';
		},
	};
	return {
		restrict: 'E',
		templateUrl: getTemplateUrl('common-directive-share-permissions.xml'),
		scope: {
			api: '=?',
			users: '=?',
			inviteHttpOptions: '=?',
			autocompleteHttpOptions: '=?',
		},
		link: function link(scope) {
			scope.currentPage = 'list';
			scope.listTab = 'users';
			scope.currentUser = false;
			scope.inviteType = 'all';
			scope.focus = '';
			if (angular.isUndefined(scope.users))
				scope.users = [];
			if (angular.isUndefined(scope.inviteHttpOptions))
				scope.inviteHttpOptions = false;
			scope.rolesAutocomplete = {};
			scope.groupsAutocomplete = {};
			scope.usersAutocomplete = {};
			scope.rolesFilter = { type: _private.typeToNumber('roles') };
			scope.groupsFilter = { type: _private.typeToNumber('groups') };
			scope.usersFilter = { type: _private.typeToNumber('users') };
		},
		controller: ['$scope', function controller($scope) {
			$scope.submitUsers = function submitUsers(users) {
				$scope.currentPage = 'list';
				_private.concat($scope.users, users, 'sys_id');
			};
			$scope.showUser = function showUser(element) {
				$scope.currentUser = element;
				$scope.currentPage = 'single';
			};
			$scope.showInvitePage = function showInvitePage(type) {
				$scope.inviteType = type || 'all';
				$scope.currentPage = 'invite';
			};
			$scope.autocompleteChange = function autocompleteChange(newUsers, type) {
				var numericType = _private.typeToNumber(type);
				var index;
				for (index = $scope.users.length - 1; index >= 0; index--)
					if ($scope.users[index].type === numericType)
						$scope.users.splice(index, 1);
				angular.forEach(newUsers, function newForeach(user) {
					$scope.users.push(user);
				});
			};
			$scope.setListTab = function setListTab(tab) {
				$scope.listTab = tab;
				$scope.rolesAutocomplete.hideInput();
				$scope.groupsAutocomplete.hideInput();
				$scope.usersAutocomplete.hideInput();
			};
			if (angular.isUndefined($scope.api))
				$scope.api = {};
			$scope.api.focusOnButtons = function focusOnButtons() {
				$scope.focus = 'buttons';
			};
			$scope.api.clearSelected = function clearSelected() {
				$scope.rolesAutocomplete.clearSelected();
				$scope.groupsAutocomplete.clearSelected();
				$scope.usersAutocomplete.clearSelected();
				$scope.users = [];
			};
			$scope.api.getValue = function getValue() {
				var result = {
					roles: [],
					groups: [],
					users: [],
				};
				angular.forEach($scope.users, function usersForEach(user) {
					var type = _private.numberToType(user.type);
					result[type].push(user.sys_id);
				});
				result.users.join(',');
				result.groups.join(',');
				result.roles.join(',');
				return result;
			};
			$scope.api.getUsers = function getUsers() {
				return $scope.users;
			};
			$scope.api.setUsers = function setUsers(roles, groups, users) {
				$scope.rolesAutocomplete.setSelected(roles);
				$scope.groupsAutocomplete.setSelected(groups);
				$scope.usersAutocomplete.setSelected(users);
				angular.forEach(roles, function newForeach(role) {
					$scope.users.push(role);
				});
				angular.forEach(groups, function newForeach(group) {
					$scope.users.push(group);
				});
				angular.forEach(users, function newForeach(user) {
					$scope.users.push(user);
				});
			};
		}],
	};
}]);
;
/*! RESOURCE: /reportcommon/directives/directive.accessible-menu.js */
angular.module('report.common').directive('accessibleMenu', ['$window', function accessibleMenuFn() {
	'use strict';
	return {
		restrict: 'C',
		scope: {
			elType: '@',
notTabbable: '@',
		},
		link: function linkFn(scope, el) {
			var elType = scope.elType || 'a';
			el.on('keydown', function keyDownCb(ev) {
var $items = el.find(elType + ':not([disabled="disabled"])');
				var $target = angular.element(ev.target);
				var $next;
				var $previous;
if (scope.notTabbable === 'true' && !$target.is('a'))
					$target = angular.element($items[0]);
				if ($target.is(elType))
					switch (ev.which) {
case 40:
case 39:
						ev.preventDefault();
						ev.stopPropagation();
						$next = $items.eq($items.index($target) + 1);
						$next.focus();
						break;
case 38:
case 37:
						ev.preventDefault();
						ev.stopPropagation();
						if (($items.index($target)) > 0) {
							$previous = $items.eq($items.index($target) - 1);
							$previous.focus();
						}
						break;
					}
			});
		},
	};
}]);
;
/*! RESOURCE: /reportcommon/directives/directive.json-text.js */
angular.module('report.common').directive('jsonText', function jsonText() {
	return {
		restrict: 'A',
		require: 'ngModel',
		link: function link(scope, element, attr, ngModel) {
			function into(input) {
				return JSON.parse(input);
			}
			function out(data) {
				return JSON.stringify(data);
			}
			ngModel.$parsers.push(into);
			ngModel.$formatters.push(out);
		}
	};
});
;
/*! RESOURCE: /reportcommon/services/service.gReport.js */
angular
	.module('report.common')
	.factory('$gReport', function ($window) {
		'use strict';
		return $window.gReport;
	});
;
;
/*! RESOURCE: /scripts/reportcommon/js_includes_reportcommon.js */
