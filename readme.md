# vuex-history

undo/redo functionality for Vuex store.

## Features

- Vue friendly.
- You can take state-snapshots manually at desired timings
- vuex-history watches specific params in the state of the store.
- You can have multiple history-lists (e.g. history list for main view + history list for side panel )


## Examples

- [basic](https://yomotsu.github.io/vuex-history/examples/basic.html)
- [vuex-modules(nested store)](https://yomotsu.github.io/vuex-history/examples/vuex-modules.html)

## Usage

```
import Vue from 'vue';
import VuexHistory from 'vuex-history';

Vue.use( VuexHistory );

// make your store with Vuex.
const store = new Vuex.Store( {
	state: {
		stateA: 0,
		stateB: 'abc',
		...
	},
	...
} );

// make a history instance with specific state.
const watchStateNames = [ 'stateA' ];
const maxHistoryLength = 50;
const vuexHistory = new VuexHistory( store, watchStateNames, maxHistoryLength );

// save snapshots, undo and redo in your component
// You can also make a mixin. See the examples ↑.

	...
	methods: {

		onValueChangeEnd() {

			vuexHistory.saveSnapshot();

		},

		onPressUndoButton() {

			if ( vuexHistory.canUndo ) vuexHistory.undo();

		},

		onPressRedoButton() {

			if ( vuexHistory.canRedo ) vuexHistory.redo();

		},

		...
	},
	...
```

## Constructor

```
VuexHistory( store, watchStateNames, maxHistoryLength );
```

- `store` — Vuex store instance.
- `watchStateNames` — State names in an array. use `'/'` for state in namespaced(nested) modules.
  e.g. : `[ 'rootParam1' ,'moduleName/paramA' ]`
- `maxHistoryLength` — Optional. Default is `20`.

## Properties

- `.canUndo` — Read only. Whether undo-able or not in a boolean.
- `.canRedo` — Read only. Whether redo-able or not in a boolean.

## Methods

- `.undo()` — undo.
- `.redo()` — redo.
- `.saveSnapshot()` — save snapshot of params of the state.
- `.clearHistory()` — Clear history list.
- `.hasDifferenceFromLatest()` — Returns a boolean. Whether there are diff from the latest snapshot or not.
