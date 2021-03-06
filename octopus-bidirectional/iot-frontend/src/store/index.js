/*
 *                                            Bosch SI Example Code License
 *                                              Version 1.0, January 2016
 *
 * Copyright 2018 Bosch Software Innovations GmbH ("Bosch SI"). All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided that the
 * following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following
 * disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the
 * following disclaimer in the documentation and/or other materials provided with the distribution.
 *
 * BOSCH SI PROVIDES THE PROGRAM "AS IS" WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE. THE ENTIRE RISK AS TO
 * THE QUALITY AND PERFORMANCE OF THE PROGRAM IS WITH YOU. SHOULD THE PROGRAM PROVE DEFECTIVE, YOU ASSUME THE COST OF
 * ALL NECESSARY SERVICING, REPAIR OR CORRECTION. THIS SHALL NOT APPLY TO MATERIAL DEFECTS AND DEFECTS OF TITLE WHICH
 * BOSCH SI HAS FRAUDULENTLY CONCEALED. APART FROM THE CASES STIPULATED ABOVE, BOSCH SI SHALL BE LIABLE WITHOUT
 * LIMITATION FOR INTENT OR GROSS NEGLIGENCE, FOR INJURIES TO LIFE, BODY OR HEALTH AND ACCORDING TO THE PROVISIONS OF
 * THE GERMAN PRODUCT LIABILITY ACT (PRODUKTHAFTUNGSGESETZ). THE SCOPE OF A GUARANTEE GRANTED BY BOSCH SI SHALL REMAIN
 * UNAFFECTED BY LIMITATIONS OF LIABILITY. IN ALL OTHER CASES, LIABILITY OF BOSCH SI IS EXCLUDED. THESE LIMITATIONS OF
 * LIABILITY ALSO APPLY IN REGARD TO THE FAULT OF VICARIOUS AGENTS OF BOSCH SI AND THE PERSONAL LIABILITY OF BOSCH SI'S
 * EMPLOYEES, REPRESENTATIVES AND ORGANS.
 */

/* eslint-disable */

import Vue from "vue";
import Vuex from "vuex";
import deepmerge from "deepmerge";

Vue.use(Vuex);

const AWS = "https://things.eu-1.bosch-iot-suite.com";
const BIC = "https://things.s-apps.de1.bosch-iot-cloud.com";

const store = new Vuex.Store({
  state: {
    connection: {
      http_endpoint: "",
      api_token: "",
      username: "",
      password: ""
    },
    items: {},
    selected: "No thing selected",
    connectionStatus: false,
    telemetryCount: 0
  },

  getters: {
    getConnection: state => {
      return state.connection;
    },
    getSelected: state => {
      return state.selected;
    },
    getItems: state => {
      return state.items;
    },
    getConnectionStatus: state => {
      return state.connectionStatus;
    },
    getTelemetryCount: state => {
      return state.telemetryCount;
    }
  },

  mutations: {
    setSelected(state, thing) {
      state.selected = thing;
    },
    setItems(state, items) {
      state.items = items;
    },
    setItem(state, item) {
      let thing = JSON.parse(item);
      state.items[thing.thingId] = deepmerge(state.items[thing.thingId], thing);
    },
    setConnectionData(state, value) {
      state.connection = Object.assign({}, state.connection, value);
    },
    setConnectionStatus(state, status) {
      state.connectionStatus = status;
    },
    incrementTelemetryCount(state) {
      state.telemetryCount += 1;
    },
    setDisconnected(state) {
      state.connectionStatus = false;
      state.selected = "No thing selected.";
      state.items = {};
    },
    updatePlatform(state, value) {
      state.connection.http_endpoint = value;
    }
  },

  actions: {
    /*
     * API action calls
     */
    getAllThings({ commit }) {
      return new Promise((resolve, reject) => {
        Api.getAllThings()
          .then(res => {
            this.commit(
              "setItems",
              res.data.items.reduce(function(map, item) {
                map[item.thingId] = item;
                return map;
              }, {})
            );
            this.commit("setConnectionStatus", true);
            resolve(res);
          })
          .catch(err => resolve(err));
      });
    },
    saveChanges({ state }, thing) {
      return new Promise((resolve, reject) => {
        Api.saveChanges(thing)
          .then(res => resolve(res))
          .catch(err => reject(err));
      });
    },
    sendMessage({ state }, payload) {
      return new Promise((resolve, reject) => {
        Api.sendMessage(payload.message, payload.topic, payload.corrId)
          .then(res => resolve(res))
          .catch(err => reject(err));
      });
    },

    /*
     * Internal state mutation actions
     */
    handleSelected({ commit }, thing) {
      return new Promise((resolve, reject) => {
        if (thing.thingId === undefined) reject({ err: "ThingId undefined!" });
        this.commit("setSelected", thing);
        resolve({ status: 200 });
      });
    },
    disconnect({ commit }) {
      this.commit("setDisconnected");
    },
    telemetryUpdate({ commit }, thing) {
      this.commit("setItem", thing);
    },
    setPlatform({ commit }, platformIndex) {
      switch (platformIndex) {
        case "1":
          this.commit("updatePlatform", AWS);
          break;
        case "2":
          this.commit("updatePlatform", BIC);
          break;
        default:
          break;
      }
    }
  }
});

export default store;
