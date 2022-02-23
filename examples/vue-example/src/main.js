import { createApp } from 'vue'
import App from './App.vue'

import Vuex from 'vuex'
import VuexHistory from 'vuex-history'

const store = new Vuex.Store( {
    state: {
        myWatchingValue: null,
        anotherValue: null,
    },
    actions: {
        updateMyWatchingValue: function ( context, myWatchingValue ) {

            context.commit( 'SET_MY_WATCHING_VALUE', myWatchingValue );

        },
        updateAnotherValue: function ( context, anotherValue ) {

            context.commit( 'SET_ANOTHER_VALUE', anotherValue );

        }
    },
    mutations: {
        SET_MY_WATCHING_VALUE: function ( state, myWatchingValue ) {

            state.myWatchingValue = myWatchingValue;

        },
        SET_ANOTHER_VALUE: function ( state, anotherValue ) {

            state.anotherValue = anotherValue;

        }
    }
} );

const maxHistoryLength = 5;
const watchStateNames = [ 'myWatchingValue' ];
const vuexHistory = VuexHistory.createVuexHistory({store, maxHistoryLength, watchStateNames});



createApp(App)
    .use(store)
    .use(vuexHistory)
    .mount('#app')
