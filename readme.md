# vuex-history

undo/redo functionality for Vuex store.

# Features

- Vue friendly implements
- Take states-snapshots manually(You can save a history at desired timing)
- Watch specific states in the store
- You can have multiple history-lists(e.g. for main view + side view )


## examples

- [basic](https://yomotsu.github.io/vuex-history/examples/basic.html)
- [vuex-modules(nested store)](https://yomotsu.github.io/vuex-history/examples/vuex-modules.html)

## Usage

Sorry, still in progress. See the code of examples in meantime🙇

import `vuex-history`, then

```
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
const maxHistoryLength = 50;
const watchStateNames = [ 'stateA' ];
const vuexHistory = new VuexHistory( store, watchStateNames, maxHistoryLength );

// save snapshots, and undo, redo in your component
// You can make a mixin as well. See the examples.

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
- `watchStateNames` — State names in an array. use '/' for state in namespaced(nested) modules.
- `maxHistoryLength` — Optional. Default is 20.

## Properties

- `.canUndo` — Read only. Whether undo-able or not.
- `.canRedo` — Read only. Whether redo-able or not.

## Methods

- `.undo()`
- `.redo()`
- `.saveSnapshot()`
- `.clearHistory()`
- `.hasDifferenceFromLatest()` — return a boolean.
