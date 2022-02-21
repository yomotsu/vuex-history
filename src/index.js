import {
	getNestedPropWithString,
	setNestedPropWithString,
	deepCopy,
	deepEqual,
	assert,
} from './util.js';

let Vue;

export default class VuexHistory {

	static install( _Vue ) {

		if ( Vue && _Vue === Vue ) {

			if ( process.env.NODE_ENV !== 'production' ) {

				console.error( '[VuexHistory] already installed. Vue.use(VuexHistory) should be called only once.' );

			}

			return;

		}

		Vue = _Vue;

	}

	constructor( store, watchStateNames, maxHistoryLength = 20 ) {

		if ( ! Vue && typeof window !== 'undefined' && window.Vue ) {

			VuexHistory.install( window.Vue );

		}

		if ( typeof process !== 'undefined' && process.env.NODE_ENV !== 'production' ) {

			assert( Vue, `must call Vue.use(VuexHistory) before creating a \`history\` instance.` );
			assert( this instanceof VuexHistory, `\`history\` must be called with the new operator.` );

		}

		this._history = Vue.ref( [] );
		this._historyIndex = Vue.ref( 0 );
		this.maxHistoryLength = maxHistoryLength;

		// read only
		Object.defineProperty( this, 'store', { value: store } );
		Object.defineProperty( this, 'watchStateNames', { value: watchStateNames } );

		this.clearHistory();

	}

	clearHistory() {

		this._history.value.length = 0;
		this._historyIndex.value = - 1;
		this.saveSnapshot();

	}

	hasDifferenceFromLatest() {

		const latestHistory = this._history.value[ this._history.value.length - 1 ];
		return ! deepEqual( this._currentWatchingState, latestHistory );

	}

	saveSnapshot() {

		if ( this._history.value.length > this.maxHistoryLength ) {

			this._history.value.shift();
			this._historyIndex.value = this._history.value.length - 1;

		}

		// undoした後（redo可能状態）にsnapshoptを保存すると
		// redo可能な履歴を削除
		this._history.value.length = this._historyIndex.value + 1;

		this._history.value.push( this._currentWatchingState );
		this._historyIndex.value ++;

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

		return this._historyIndex.value > 0;

	}

	get canRedo() {

		return this._historyIndex.value < this._history.value.length - 1;

	}

	undo() {

		if ( ! this.canUndo ) return;

		this._historyIndex.value --;

		const state = deepCopy( this.store.state );
		const savedState = deepCopy( this._history.value[ this._historyIndex.value ] );

		this.watchStateNames.forEach( ( stateName ) => {

			const savedProp = getNestedPropWithString( savedState, stateName );
			setNestedPropWithString( state, stateName, savedProp );

		} );

		this.store.replaceState( state );

	}

	redo() {

		if ( ! this.canRedo ) return;

		this._historyIndex.value ++;

		const state = deepCopy( this.store.state );
		const savedState = deepCopy( this._history.value[ this._historyIndex.value ] );

		this.watchStateNames.forEach( ( stateName ) => {

			const savedProp = getNestedPropWithString( savedState, stateName );
			setNestedPropWithString( state, stateName, savedProp );

		} );

		this.store.replaceState( state );

	}

}
