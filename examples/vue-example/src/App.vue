<template>
  <div>

    <button type="button" @click="this.$vuexHistory.undo" :disabled="!this.$vuexHistory.canUndo.value">undo</button>
    <button type="button" @click="this.$vuexHistory.redo" :disabled="!this.$vuexHistory.canRedo.value">redo</button>

    <hr>

    <table>
      <tr>
        <th>myWatchingValue<br>will be saved on the end of input stream</th>
        <td><input type="range" v-model="tmpMyWatchingValue" @blur="this.$vuexHistory.saveSnapshot"></td>
      </tr>
      <tr>
        <th>anotherValue<br>(no history managed)</th>
        <td><input type="range" v-model="tmpAnotherValue"></td>
      </tr>
    </table>

    <hr>

    The store

    <table>
      <tr>
        <th>myWatchingValue</th>
        <td>{{ myWatchingValue }}</td>
      </tr>
      <tr>
        <th>anotherValue</th>
        <td>{{ anotherValue }}</td>
      </tr>
    </table>
  </div>
</template>

<script>

import Vuex from 'vuex'

export default {
  name: 'App',
  data() {
    return {
      tmpMyWatchingValue: null,
      tmpAnotherValue: null
    }
  },
  computed: Object.assign(
      Vuex.mapState( [
        'myWatchingValue',
        'anotherValue'
      ] )
  ),

  watch: {
    tmpMyWatchingValue: function () {
      this.updateMyWatchingValue( this.tmpMyWatchingValue );
    },
    tmpAnotherValue: function () {
      this.updateAnotherValue( this.tmpAnotherValue );
    },

    myWatchingValue: function () {
      this.tmpMyWatchingValue = this.myWatchingValue;
    },
    anotherValue: function () {
      this.tmpAnotherValue = this.anotherValue;
    }
  },

  methods: Object.assign(
      Vuex.mapActions( [
        'updateMyWatchingValue',
        'updateAnotherValue',
      ] )
  ),

  mounted() {
    this.updateMyWatchingValue(50);
    this.updateAnotherValue(50);
    console.log("$vuexHistory", this.$vuexHistory);
    console.log("$vuexHistory.saveSnapshot", this.$vuexHistory.saveSnapshot);
    this.$vuexHistory.saveSnapshot()
  }
}
</script>

<style>
body{
  font-family: sans-serif;
}
button{
  color: #1ecd97;
  font-size: 20px;
  line-height: 30px;
  cursor: pointer;
  box-sizing: content-box;
  width: 120px;
  height: 30px;
  padding: 0;
  margin: 0 auto;
  border: 2px solid #1ecd97;
  border-radius: 100px;
}
button:hover:not(:disabled){
  color: #fff;
  background: #1ecd97;
}
button:disabled{
  color: #ccc;
  border-color: #ccc;
  cursor: not-allowed;
}
table{
  border-collapse: collapse;
}
table tr:nth-child(even){
  background: #26A69A;
}
table tr:nth-child(odd){
  background: #80CBC4;
}
table th,
table td{
  text-align: left;
  padding: 10px;
}
</style>
