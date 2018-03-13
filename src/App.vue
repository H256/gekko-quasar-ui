<template>
  <div id="q-app">
    <router-view />
    <q-modal 
      v-model="connected" 
      no-route-dismiss 
      no-esc-dismiss 
      no-backdrop-dismiss
    >
      <div class="q-pa-md">
        <h2 class="text-negative">Disconnected</h2>        
        <p>Something happened to either Gekko or the connection. <br>
          Please check the terminals where Gekko is running <em>or</em> your network connection.
        </p>
        <hr>        
        <p class="text-secondary text-center">I'm trying to re-establish the connection...</p>
        <div class="row justify-center">
          <q-spinner-radio color="secondary" size="48px" />
        </div>
      </div>
    </q-modal>
  </div>
</template>

<script>
import { connect as connectWs } from "./components/global/ws";
import { restPath } from "./tools/api";
import _ from "lodash";

export default {
  name: "App",
  created: function() {
    this.initStore();
  },
  computed: {
    connected() {
      return !this.$store.state.warnings.warnings.connected;
    }
  },
  methods: {
    initStore: function() {
      // connect to websocket and init store...
      connectWs();
    }
  }
};
</script>

<style>

</style>
