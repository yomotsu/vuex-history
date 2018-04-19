/*!
 * vuex-history
 * https://github.com/yomotsu/vuex-history
 * (c) 2018 @yomotsu
 * Released under the MIT License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.VuexHistory = factory());
}(this, (function () { 'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	function getNestedPropWithString(object, keyString) {

		var nomalizedKeyString = keyString.replace(/\//g, '.') // slash to dot (arrow both slash and dot for separation)
		.replace(/\[(\w+)\]/g, '.$1') // convert indexes to properties
		.replace(/^\./, ''); // strip a leading dot

		var keyArray = nomalizedKeyString.split('.');

		var current = object;

		for (var i = 0, l = keyArray.length; i < l; ++i) {

			var key = keyArray[i];

			if (key in current) {

				current = current[key];
			} else {

				return;
			}
		}

		return current;
	}

	function setNestedPropWithString(object, keyString, value) {

		var nomalizedKeyString = keyString.replace(/\//g, '.') // slash to dot (arrow both slash and dot for separation)
		.replace(/\[(\w+)\]/g, '.$1') // convert indexes to properties
		.replace(/^\./, ''); // strip a leading dot

		var keyArray = nomalizedKeyString.split('.');

		var current = object;

		for (var i = 0, l = keyArray.length; i < l; ++i) {

			var key = keyArray[i];

			if (i === l - 1) {

				current[key] = value;
				return;
			}

			if (!(key in current)) {

				current[key] = {};
			}

			current = current[key];
		}
	}

	// same one as vuex
	function deepCopy(obj) {
		var cache = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];


		// just return if obj is immutable value
		if (obj === null || (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) !== 'object') return obj;

		// if obj is hit, it is in circular structure
		var hit = find(cache, function (c) {
			return c.original === obj;
		});

		if (hit) return hit.copy;

		var copy = Array.isArray(obj) ? [] : {};
		// put the copy into cache at first
		// because we want to refer it in recursive deepCopy
		cache.push({
			original: obj,
			copy: copy
		});

		Object.keys(obj).forEach(function (key) {

			copy[key] = deepCopy(obj[key], cache);
		});

		return copy;
	}

	// https://stackoverflow.com/a/25456134/1512272
	function deepEqual(obj1, obj2) {

		if (obj1 === obj2) return true;

		//compare primitives
		if (isPrimitive(obj1) && isPrimitive(obj2)) return obj1 === obj2;

		if (Object.keys(obj1).length !== Object.keys(obj2).length) return false;

		//compare objects with same number of keys
		for (var key in obj1) {

			if (!(key in obj2)) return false; //other object doesn't have this prop
			if (!deepEqual(obj1[key], obj2[key])) return false;
		}

		return true;
	}

	//check if value is primitive
	function isPrimitive(obj) {

		return obj !== Object(obj);
	}

	function assert(condition, msg) {

		if (!condition) throw new Error('[VueUndoRedo] ' + msg);
	}

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Vue = void 0; // bind on install

	var VuexHistory = function () {
		_createClass(VuexHistory, null, [{
			key: 'install',
			value: function install(_Vue) {

				if (Vue && _Vue === Vue) {

					if (process.env.NODE_ENV !== 'production') {

						console.error('[VuexHistory] already installed. Vue.use(VuexHistory) should be called only once.');
					}

					return;
				}

				Vue = _Vue;
			}
		}]);

		function VuexHistory(store, watchStateNames) {
			var maxHistoryLength = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 20;

			_classCallCheck(this, VuexHistory);

			if (!Vue && typeof window !== 'undefined' && window.Vue) {

				VuexHistory.install(window.Vue);
			}

			if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {

				assert(Vue, 'must call Vue.use(VuexHistory) before creating a `history` instance.');
				assert(this instanceof VuexHistory, '`history` must be called with the new operator.');
			}

			this._vm = new Vue({
				data: {
					history: [],
					historyIndex: 0
				}
			});

			this.maxHistoryLength = maxHistoryLength;

			// read only
			Object.defineProperty(this, 'watchStateNames', { value: watchStateNames });
			Object.defineProperty(this, 'store', { value: store });

			this.clearHistory();
		}

		_createClass(VuexHistory, [{
			key: 'clearHistory',
			value: function clearHistory() {

				this._vm.history.length = 0;
				this._vm.historyIndex = -1;
				this.saveSnapshot();
			}
		}, {
			key: 'hasDifferenceFromLatest',
			value: function hasDifferenceFromLatest() {

				var latestHistory = this._vm.history[this._vm.history.length - 1];
				return !deepEqual(this.currentWatchingState, latestHistory);
			}
		}, {
			key: 'saveSnapshot',
			value: function saveSnapshot() {

				if (this._vm.history.length > this.maxHistoryLength) {

					this._vm.history.shift();
					this._vm.historyIndex = this._vm.history.length - 1;
				}

				// undoした後（redo可能状態）にsnapshoptを保存すると
				// redo可能な履歴を削除
				this._vm.history.length = this._vm.historyIndex + 1;

				this._vm.history.push(this.currentWatchingState);
				this._vm.historyIndex++;

				// console.log( 'saved', this._vm.history );
			}
		}, {
			key: 'undo',
			value: function undo() {

				if (!this.canUndo) return;

				this._vm.historyIndex--;

				var state = deepCopy(this.store.state);
				var savedState = deepCopy(this._vm.history[this._vm.historyIndex]);

				this.watchStateNames.forEach(function (stateName) {

					var savedProp = getNestedPropWithString(savedState, stateName);
					setNestedPropWithString(state, stateName, savedProp);
				});

				this.store.replaceState(state);
			}
		}, {
			key: 'redo',
			value: function redo() {

				if (!this.canRedo) return;

				this._vm.historyIndex++;

				var state = deepCopy(this.store.state);
				var savedState = deepCopy(this._vm.history[this._vm.historyIndex]);

				this.watchStateNames.forEach(function (stateName) {

					var savedProp = getNestedPropWithString(savedState, stateName);
					setNestedPropWithString(state, stateName, savedProp);
				});

				this.store.replaceState(state);
			}
		}, {
			key: 'currentWatchingState',
			get: function get() {

				var state = deepCopy(this.store.state);
				var currentWatchingState = {};

				this.watchStateNames.forEach(function (stateName) {

					var saveProp = getNestedPropWithString(state, stateName);
					setNestedPropWithString(currentWatchingState, stateName, saveProp);
				});

				return currentWatchingState;
			}
		}, {
			key: 'history',
			get: function get() {

				return this._vm.$data.history;
			}

			// 歴史を改変したい時
			,
			set: function set(history) {

				this._vm.$data.history = history;
			}
		}, {
			key: 'canUndo',
			get: function get() {

				return this._vm.historyIndex > 0;
			}
		}, {
			key: 'canRedo',
			get: function get() {

				return this._vm.historyIndex < this._vm.history.length - 1;
			}
		}]);

		return VuexHistory;
	}();

	return VuexHistory;

})));
