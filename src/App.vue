<template>
  <div id="q-app">
    <router-view />
    <q-modal v-model="connected" minimized no-route-dismiss no-esc-dismiss no-backdrop-dismiss>
      <div class="q-pa-md">
        <h3>Disconnected</h3>
        <p>Something happened to either Gekko or the connection. 
          Please check the terminals where Gekko is running or you network connection.</p>
      </div>
    </q-modal>
  </div>
</template>

<script>
//import UiConfig from "./UiConfig";
import { connect as connectWs, bus } from "./components/global/ws";
import { restPath } from "./tools/api";

export default {
  name: "App",
  created: function() {
    this.initStore();
  },
  computed: {
    connected(){
      return !this.$store.state.warnings.warnings.connected;
    }
  },
  methods: {
    initStore: function() {
      // connect to websocket
      connectWs();
      // init store module (move from store to app-vue for better separation of concerns...)

      // API-Keys init
      this.$axios.get(restPath + "apiKeys").then(resp => {
        this.$store.dispatch("config/initApiKeys", resp.data);
      }); // TODO: CATCH ERROR with Nofification
      // Exchanges Init
      this.$axios.get(restPath + "exchanges").then(resp => {
        this.$store.dispatch("config/initExchanges", resp.data);
      }); // TODO: CATCH ERROR with Nofification
      // Hook in events from WebSocket...
      bus.$on("apiKeys", data => {
        // in original it syncs exchanges to apiKey function? correct or BUG?
        this.$store.dispatch("config/initApiKeys", data.exchanges);
      });
      // Watchers init
      let updateFunc = data => {
        this.$store.dispatch("watchers/updateWatcher", data);
      };
      this.$axios.get(restPath + "gekkos").then(resp => {
        this.$store.dispatch("watchers/initWatchers", resp.data);
      }); // TODO: CATCH ERROR with Nofification

      // Hook in Watcher Websocket events
      bus.$on("new_gekko", data => {
        this.$store.dispatch("watchers/addWatcher", data);
      });
      bus.$on("update", updateFunc);
      bus.$on("startAt", updateFunc);
      bus.$on("lastCandle", updateFunc);
      bus.$on("firstCandle", updateFunc);

      // Imports
      this.$axios.get(restPath + "imports").then(resp => {
        this.$store.dispatch("imports/syncImports", resp.data);
      }); // TODO: CATCH ERROR with Nofification
      // Websocket hooks
      bus.$on("import_update", data => {
        this.$store.dispatch("imports/updateImport", data);
      });

      // Notifications
      bus.$on("WS_STATUS_CHANGE", ws => {
        return this.$store.dispatch("warnings/setGlobalWarning", {
          key: "connected",
          value: ws.connected
        });
      });

      // Strat-Runners
      this.$axios.get(restPath + "gekkos").then(resp => {
        this.$store.dispatch("stratrunners/syncStratrunners", resp.data);
      }); // TODO: Catch error here with Notification...
      bus.$on("new_gekko", data => {
        if (data.gekko.type === "leech")
          this.$store.dispatch("stratrunners/addStratrunner", data.gekko);
      });
      let update = data => {
        this.$store.dispatch("stratrunners/updateStratrunner", data);
      };
      let trade = data => {
        this.$store.dispatch("stratrunners/addTradeToStratrunner", data);
      };
      let roundtrip = data => {
        this.$store.dispatch("stratrunners/addRoundtripToStratrunner", data);
      };
      bus.$on("report", update);
      bus.$on("trade", trade);
      bus.$on("update", update);
      bus.$on("startAt", update);
      bus.$on("lastCandle", update);
      bus.$on("firstCandle", update);
      bus.$on("roundtrip", roundtrip);
    }
  }
};
</script>

<style>

</style>
