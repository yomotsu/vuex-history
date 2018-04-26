# vuex-history

undo/redo functionality for Vuex store.

## Features

- Vue friendly implements.
- Take states-snapshots manually (You can save a history at desired timing)
- Watch specific states in the store.
- You can have multiple history-lists (e.g. history list for main view + history list for side view )


## Examples

- [basic](https://yomotsu.github.io/vuex-history/examples/basic.html)
- [vuex-modules(nested store)](https://yomotsu.github.io/vuex-history/examples/vuex-modules.html)

## Usage

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

- `.undo()`
- `.redo()`
- `.saveSnapshot()`
- `.clearHistory()`
- `.hasDifferenceFromLatest()` — return a boolean.
