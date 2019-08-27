// import something here
import axios from 'axios'
import _ from "lodash";
import {restPath} from "../tools/api";
import {wsPath} from '../tools/api'
//import initializeState from '../store/init'

let socket = null;

// leave the export, even if you don't use it
export default ({app, router, Vue, store}) => {
  // AXIOS to prototype
  Vue.prototype.$axios = axios;

  const bus = new Vue();
  //bus.$on('gekko_update', data => console.log(data));
  bus.$on('gekko_error', data => {
    alert('GEKKO ERROR: ' + data.error);
  });

  //bus.$on('import_update', data => console.log(data));
  bus.$on('import_error', data => {
    alert('IMPORT ERROR: ' + data.error);
  });

  const info = {
    connected: false
  };

  const connect = () => {
    socket = new ReconnectingWebSocket(wsPath);
    setTimeout(() => {
      // in case we cannot connect
      if (!info.connected) {
        bus.$emit('WS_STATUS_CHANGE', info);
      }
    }, 500);
    socket.onopen = () => {
      if (info.connected)
        return;
      info.connected = true;
      bus.$emit('WS_STATUS_CHANGE', info);
    };
    socket.onclose = () => {
      if (!info.connected)
        return;
      info.connected = false;
      bus.$emit('WS_STATUS_CHANGE', info);
    };
    socket.onerror = () => {
      if (!info.connected)
        return;
      info.connected = false;
      bus.$emit('WS_STATUS_CHANGE', info);
    };
    socket.onmessage = function (message) {
      let payload = JSON.parse(message.data);
      //console.log("Event from WebSocket:", payload.type, payload)
      bus.$emit(payload.type, payload);
    };
  };

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
    store.commit('gekkos/syncGekkos', resp.data);
  });

  // Hook in Watcher Websocket events
  bus.$on("new_gekko", data => {
    if (data.gekko.type === "watcher")
      store.dispatch("watchers/addWatcher", data.gekko);
  });

  bus.$on("update", updateFunc);
  bus.$on("startAt", updateFunc);
  bus.$on("lastCandle", updateFunc);
  bus.$on("firstCandle", updateFunc);

  bus.$on('gekko_new', data => store.commit('gekkos/addGekko', data.state));
  bus.$on('gekko_event', data => store.commit('gekkos/updateGekko', data));
  bus.$on('gekko_archived', data => store.commit('gekkos/archiveGekko', data.id));
  bus.$on('gekko_error', data => store.commit('gekkos/errorGekko', data));
  bus.$on('gekko_deleted', data => store.commit('gekkos/deleteGekko', data.id));

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

  Vue.prototype.$eventbus = bus;
  connect();
}
