import {
	getNestedPropWithString,
	setNestedPropWithString,
	deepCopy,
	deepEqual,
	assert,
} from './util.js';


export default class VuexHistory {

	static install( app, options ) {

	}

	constructor( store, watchStateNames, maxHistoryLength = 20 ) {
		const myapp = Vue.createApp({
			data() {
				return {
					history: [],
					historyIndex: 0,
				}
			},
		} );
		this._vm = myapp.mount('#app')

		this.maxHistoryLength = maxHistoryLength;

		// read only
		Object.defineProperty( this, 'store', { value: store } );
		Object.defineProperty( this, 'watchStateNames', { value: watchStateNames } );

		this.clearHistory();

	}

	clearHistory() {

		this._vm.history.length = 0;
		this._vm.historyIndex = - 1;
		this.saveSnapshot();

	}

	hasDifferenceFromLatest() {

		const latestHistory = this._vm.history[ this._vm.history.length - 1 ];
		return ! deepEqual( this._currentWatchingState, latestHistory );

	}

	saveSnapshot() {

		if ( this._vm.history.length > this.maxHistoryLength ) {

			this._vm.history.shift();
			this._vm.historyIndex = this._vm.history.length - 1;

		}

		// undoした後（redo可能状態）にsnapshoptを保存すると
		// redo可能な履歴を削除
		this._vm.history.length = this._vm.historyIndex + 1;

		this._vm.history.push( this._currentWatchingState );
		this._vm.historyIndex ++;

		// console.log( 'saved', this._vm.history );

	}

	get _currentWatchingState() {

		const state = deepCopy( this.store.state );
		const currentWatchingState = {};

		this.watchStateNames.forEach( ( stateName ) => {

			const saveProp = getNestedPropWithString( state, stateName );
			setNestedPropWithString( currentWatchingState, stateName, saveProp );

		} );

		return currentWatchingState;

	}

	// get history() {

	// 	return this._vm.$data.history;

	// }

	// 歴史を改変したい時
	set history( history ) {

		this._vm.$data.history = history;

	}

	get canUndo() {

		return this._vm.historyIndex > 0;

	}

	get canRedo() {

		return this._vm.historyIndex < this._vm.history.length - 1;

	}

	undo() {

		if ( ! this.canUndo ) return;

		this._vm.historyIndex --;

		const state = deepCopy( this.store.state );
		const savedState = deepCopy( this._vm.history[ this._vm.historyIndex ] );

		this.watchStateNames.forEach( ( stateName ) => {

			const savedProp = getNestedPropWithString( savedState, stateName );
			setNestedPropWithString( state, stateName, savedProp );

		} );

		this.store.replaceState( state );

	}

	redo() {

		if ( ! this.canRedo ) return;

		this._vm.historyIndex ++;

		const state = deepCopy( this.store.state );
		const savedState = deepCopy( this._vm.history[ this._vm.historyIndex ] );

		this.watchStateNames.forEach( ( stateName ) => {

			const savedProp = getNestedPropWithString( savedState, stateName );
			setNestedPropWithString( state, stateName, savedProp );

		} );

		this.store.replaceState( state );

	}

}
