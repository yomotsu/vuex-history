'use strict';

var vue = require('vue');

function getNestedPropWithString( object, keyString ) {

	const nomalizedKeyString = keyString
		.replace( /\//g, '.' )          // slash to dot (arrow both slash and dot for separation)
		.replace( /\[(\w+)\]/g, '.$1' ) // convert indexes to properties
		.replace( /^\./, '' );          // strip a leading dot

	const keyArray = nomalizedKeyString.split( '.' );

	let current = object;

	for ( let i = 0, l = keyArray.length; i < l; ++ i ) {

		const key = keyArray[ i ];

		if ( key in current ) {

			current = current[ key ];

		} else {

			return;

		}

	}

	return current;

}

function setNestedPropWithString( object, keyString, value ) {

	const nomalizedKeyString = keyString
		.replace( /\//g, '.' )          // slash to dot (arrow both slash and dot for separation)
		.replace( /\[(\w+)\]/g, '.$1' ) // convert indexes to properties
		.replace( /^\./, '' );          // strip a leading dot

	const keyArray = nomalizedKeyString.split( '.' );

	let current = object;

	for ( let i = 0, l = keyArray.length; i < l; ++ i ) {

		const key = keyArray[ i ];

		if ( i === l - 1 ) {

			current[ key ] = value;
			return;

		}

		if ( ! ( key in current ) ) {

			current[ key ] = {};

		}

		current = current[ key ];

	}

}

// same one as vuex
function find ( list, f ) {

	const { length } = list;
	let index = 0;
	let value;

	while ( ++ index < length ) {

		value = list[ index ];

		if ( f( value, index, list ) ) {

			return value;

		}

	}

}

function deepCopy( obj, cache = [] ) {

	// just return if obj is immutable value
	if ( obj === null || typeof obj !== 'object' ) return obj;

	// if obj is hit, it is in circular structure
	const hit = find( cache, c => c.original === obj );

	if ( hit ) return hit.copy;

	const copy = Array.isArray( obj ) ? [] : {};
	// put the copy into cache at first
	// because we want to refer it in recursive deepCopy
	cache.push( {
		original: obj,
		copy,
	} );

	Object.keys( obj ).forEach( key => {

	  copy[ key ] = deepCopy( obj[ key ], cache );

	} );

	return copy;

}

// https://stackoverflow.com/a/25456134/1512272
function deepEqual( obj1, obj2 ) {

	if ( obj1 === obj2 ) return true;

	//compare primitives
	if ( isPrimitive( obj1 ) && isPrimitive( obj2 ) ) return obj1 === obj2;

	if ( Object.keys( obj1 ).length !== Object.keys( obj2 ).length ) return false;

	//compare objects with same number of keys
	for ( let key in obj1 ) {

		if ( ! ( key in obj2 ) ) return false; //other object doesn't have this prop
		if ( ! deepEqual( obj1[ key ], obj2[ key ] ) ) return false;

	}

	return true;

}

//check if value is primitive
function isPrimitive( obj ) {

	return ( obj !== Object( obj ) );

}

function createVuexHistory({ store, maxHistoryLength, watchStateNames }) {
    const vuexHistory = {
        historyObj: vue.ref({
            history: [],
            historyIndex: -1,
        }),
        canUndo: null,
        canRedo: null,
        maxHistoryLength: maxHistoryLength,
        watchStateNames: watchStateNames,
        store: store,
        get currentWatchingState() {
            const state = deepCopy(this.store.state);
            const currentWatchingState = {};
            this.watchStateNames.forEach((stateName) => {
                const saveProp = getNestedPropWithString(state, stateName);
                setNestedPropWithString(currentWatchingState, stateName, saveProp);
            });
            return currentWatchingState;
        },
        hasDifferenceFromLatest() {
            const latestHistory = this.historyObj.value.history[this.historyObj.value.history.length - 1];
            return !deepEqual(this.currentWatchingState, latestHistory);
        },
        saveSnapshot() {
            if (this.historyObj.value.history.length > this.maxHistoryLength) {
                this.historyObj.value.history.shift();
                this.historyObj.value.historyIndex = this.historyObj.value.history.length - 1;
            }
            this.historyObj.value.history.push(this.currentWatchingState);
            this.historyObj.value.historyIndex++;
            /*console.log("saveSnapshot history", this.historyObj.value.history);
            console.log("saveSnapshot historyIndex", this.historyObj.value.historyIndex);*/
        },
        clearHistory() {
            this.historyObj.value.history = [];
            this.historyObj.value.historyIndex = -1;
            this.saveSnapshot();
        },
        undo() {
            if (!this.canUndo)
                return;
            this.historyObj.value.historyIndex--;
            const state = deepCopy(this.store.state);
            const savedState = deepCopy(this.historyObj.value.history[this.historyObj.value.historyIndex]);
            this.watchStateNames.forEach((stateName) => {
                const savedProp = getNestedPropWithString(savedState, stateName);
                setNestedPropWithString(state, stateName, savedProp);
            });
            this.store.replaceState(state);
        },
        redo() {
            if (!this.canRedo)
                return;
            this.historyObj.value.historyIndex++;
            const state = deepCopy(this.store.state);
            const savedState = deepCopy(this.historyObj.value.history[this.historyObj.value.historyIndex]);
            this.watchStateNames.forEach((stateName) => {
                const savedProp = getNestedPropWithString(savedState, stateName);
                setNestedPropWithString(state, stateName, savedProp);
            });
            this.store.replaceState(state);
        },
        install(app) {
            const vuexHistory = this;
            app.config.globalProperties.$vuexHistory = vuexHistory;
            this.canUndo = vue.computed(() => this.historyObj.value.historyIndex > 0);
            this.canRedo = vue.computed(() => this.historyObj.value.historyIndex < this.historyObj.value.history.length - 1);
        }
    };
    return vuexHistory;
}

var index = {
    createVuexHistory
};

module.exports = index;
