import {App, computed, ComputedRef, Ref, ref} from "vue";

import {Store} from 'vuex';

import {
    getNestedPropWithString,
    setNestedPropWithString,
    deepCopy,
    deepEqual,
// @ts-ignore
} from './util.js';

export interface VuexHistory {

    historyObj: Ref<{history: object[], historyIndex: number}>
    maxHistoryLength: number
    currentWatchingState: object
    watchStateNames: string[]
    // @ts-ignore
    store: Store

    canUndo: ComputedRef<boolean> | null
    canRedo: ComputedRef<boolean> | null

    saveSnapshot() : void
    clearHistory() : void
    hasDifferenceFromLatest(): void

    undo(): void

    redo(): void

    install(app: App): void
}

export interface Options{
    // @ts-ignore
    store: Store,
    maxHistoryLength: number,
    watchStateNames: string[],

}

export function createVuexHistory<S> ({store, maxHistoryLength, watchStateNames}: Options): VuexHistory{
    const vuexHistory: VuexHistory = {
        historyObj: ref({
            history: [],
            historyIndex: -1,
        }),
        canUndo: null,
        canRedo: null,

        maxHistoryLength: maxHistoryLength,
        watchStateNames: watchStateNames,
        store: store,

        get currentWatchingState(): object {
            const state = deepCopy( this.store.state );
            const currentWatchingState = {};

            this.watchStateNames.forEach( ( stateName ) => {

                const saveProp = getNestedPropWithString( state, stateName );
                setNestedPropWithString( currentWatchingState, stateName, saveProp );

            } );

            return currentWatchingState;
        },

        hasDifferenceFromLatest() {

            const latestHistory = this.historyObj.value.history[ this.historyObj.value.history.length - 1 ];
            return ! deepEqual( this.currentWatchingState, latestHistory );

        },

        saveSnapshot() {
            if ( this.historyObj.value.history.length > this.maxHistoryLength ) {

                this.historyObj.value.history.shift();
                this.historyObj.value.historyIndex = this.historyObj.value.history.length - 1;

            }

            this.historyObj.value.history.push( this.currentWatchingState );
            this.historyObj.value.historyIndex ++;
            /*console.log("saveSnapshot history", this.historyObj.value.history);
            console.log("saveSnapshot historyIndex", this.historyObj.value.historyIndex);*/
        },

        clearHistory(){
            this.historyObj.value.history = [];
            this.historyObj.value.historyIndex = - 1;
            this.saveSnapshot();
        },

        undo() {

            if ( ! this.canUndo ) return;

            this.historyObj.value.historyIndex --;

            const state = deepCopy( this.store.state );
            const savedState = deepCopy( this.historyObj.value.history[ this.historyObj.value.historyIndex ] );

            this.watchStateNames.forEach( ( stateName ) => {

                const savedProp = getNestedPropWithString( savedState, stateName );
                setNestedPropWithString( state, stateName, savedProp );

            } );

            this.store.replaceState( state );

        },

        redo() {

            if ( ! this.canRedo ) return;

            this.historyObj.value.historyIndex ++;

            const state = deepCopy( this.store.state );
            const savedState = deepCopy( this.historyObj.value.history[ this.historyObj.value.historyIndex ] );

            this.watchStateNames.forEach( ( stateName ) => {

                const savedProp = getNestedPropWithString( savedState, stateName );
                setNestedPropWithString( state, stateName, savedProp );

            } );

            this.store.replaceState( state );

        },


        install(app: App) {
            const vuexHistory = this
            app.config.globalProperties.$vuexHistory = vuexHistory;
            this.canUndo = computed(() => this.historyObj.value.historyIndex > 0);
            this.canRedo = computed(() => this.historyObj.value.historyIndex < this.historyObj.value.history.length - 1)
        }
    }
    return vuexHistory;
}




