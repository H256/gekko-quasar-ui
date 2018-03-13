import Vue from "vue";
import Vuex from "vuex";
import axios from "axios";
import store from "./index";
import _ from "lodash";
import { restPath } from "../tools/api";
import {bus} from '../components/global/ws'

const unregisterEvents = () => {
    // Detacht events first!
  bus.$off("update");
  bus.$off("startAt");
  bus.$off("lastCandle");
  bus.$off("firstCandle");
  bus.$off("apiKeys");
  bus.$off("new_gekko");
  bus.$off("WS_STATUS_CHANGE");
  bus.$off("import_update");
  bus.$off("report");
  bus.$off("trade");
  bus.$off("update");
  bus.$off("startAt");
  bus.$off("lastCandle");
  bus.$off("firstCandle");
  bus.$off("roundtrip");
}

const initAndSyncAll = () => {
  unregisterEvents();
  // API-Keys init
  axios.get(restPath + "apiKeys").then(resp => {
    store.dispatch("config/initApiKeys", resp.data);
  }); // TODO: CATCH ERROR with Nofification
  // Exchanges Init
  axios.get(restPath + "exchanges").then(resp => {
    store.dispatch("config/initExchanges", resp.data);
  }); // TODO: CATCH ERROR with Nofification
  // Hook in events from WebSocket...
  bus.$on("apiKeys", data => {
    // in original it syncs exchanges to apiKey function? correct or BUG?
    store.dispatch("config/initApiKeys", data.exchanges);
  });
  // Watchers init
  let updateFunc = data => {
    store.dispatch("watchers/updateWatcher", data);
  };

  axios.get(restPath + "gekkos").then(resp => {
    let watchers = _.filter(resp.data, { type: "watcher" });
    let runners = _.filter(resp.data, { type: "leech" });
    store.dispatch("watchers/initWatchers", watchers);
    store.dispatch("stratrunners/syncStratrunners", runners);
  }); // TODO: CATCH ERROR with Nofification

  // Hook in Watcher Websocket events
  bus.$on("new_gekko", data => {
    if (data.gekko.type === "watcher")
      store.dispatch("watchers/addWatcher", data.gekko);
  });

  bus.$on("update", updateFunc);
  bus.$on("startAt", updateFunc);
  bus.$on("lastCandle", updateFunc);
  bus.$on("firstCandle", updateFunc);

  // Imports
  axios.get(restPath + "imports").then(resp => {
    store.dispatch("imports/syncImports", resp.data);
  }); // TODO: CATCH ERROR with Nofification
  // Websocket hooks
  bus.$on("import_update", data => {
    store.dispatch("imports/updateImport", data);
  });

  // Notifications
  bus.$on("WS_STATUS_CHANGE", ws => {
    return store.dispatch("warnings/setGlobalWarning", {
      key: "connected",
      value: ws.connected
    });
  });

  // Strat-Runners
  bus.$on("new_gekko", data => {
    if (data.gekko.type === "leech")
      store.dispatch("stratrunners/addStratrunner", data.gekko);
  });

  let update = data => {
    store.dispatch("stratrunners/updateStratrunner", data);
  };

  let trade = data => {
    store.dispatch("stratrunners/addTradeToStratrunner", data);
  };

  let roundtrip = data => {
    store.dispatch("stratrunners/addRoundtripToStratrunner", data);
  };

  bus.$on("report", update);
  bus.$on("trade", trade);
  bus.$on("update", update);
  bus.$on("startAt", update);
  bus.$on("lastCandle", update);
  bus.$on("firstCandle", update);
  bus.$on("roundtrip", roundtrip);
};

export default function() {
  initAndSyncAll();
}
