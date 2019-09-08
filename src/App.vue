<template>
  <div id="q-app">
    <router-view/>
    <q-dialog
      :value="!connected"
      persistent
    >
      <q-card class="bg-white q-pa-md">
        <div class="text-h3 text-negative">Disconnected</div>
        <p>Something happened to either Gekko or the connection. <br>
          Please check the terminals where Gekko is running <em>or</em> your network connection.
        </p>
        <q-separator />
        <p class="text-secondary text-center">I'm trying to re-establish the connection...</p>
        <div class="row justify-center">
          <q-spinner-radio color="secondary" size="48px"/>
        </div>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
  import _ from 'lodash'
  import {mapGetters} from 'vuex'

  export default {
    name: "App",
    computed: {
      ...mapGetters('warnings',['connected']),
    },
    created: function () {
      this.$eventbus.$on('import_update', this.updateEvent)
    },
    methods: {
      updateEvent(data) {
        if(data.updates && data.updates.done){
          let imp = _.find(this.$store.state.imports.imports, function(o){return o.id === data.import_id});
          let market = imp && imp.watch ? (imp.watch.exchange + ' ' + imp.watch.currency + '-' + imp.watch.asset) : 'unknown';
          this.$q.notify({
            message: "Import for " + market + " done.",
            type: 'positive'
          });
        }
      }
    },
    beforeDestroy() {
      this.$eventbus.$off('import_update', this.updateEvent);
    }
  };
</script>
