import Vue from "vue";
import Vuex from "vuex";
import axios from "axios";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {},
  mutations: {},
  actions: {
    async fetchData(_, data) {
      return await axios.get("http://35.158.139.236:3000/analyze", {
        params: data
      });
    }
  },
  modules: {}
});
