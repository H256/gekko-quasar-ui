<template>
  <q-page padding>
    <h2>Import data</h2>
    <p>The importer can download historical market data directly from the exchange.</p>
    <div>
      <h3>Currently running imports</h3>
      <p v-if="imports.length === 0">You currently don't have any imports running.</p>
      <q-list highlight v-if="imports.length">
        <q-list-header>The following imports are currently running:</q-list-header>
        <q-item 
          v-for="_import in imports" 
          :key="_import.id" 
          :link="true"
          :to="'/data/importer/import/' + _import.id"
        >
          <q-item-side :class="_import.done ? 'text-green' : 'text-black'" :icon="_import.done ? 'done' : 'fast forward'"></q-item-side>
          <q-item-main>
            <b>{{ _import.watch.exchange }}</b>:{{ _import.watch.currency }}/{{ _import.watch.asset }}
            <q-progress v-if="progress(_import)" animated height="10px" :percentage="+progress(_import)" color="primary"></q-progress>
          </q-item-main>
          <q-item-side v-if="progress(_import)">
            {{progress(_import)}} %
          </q-item-side>
        </q-item> 
      </q-list>
    </div>
    <div>
      <h3>Start new import</h3>
      <import-config-builder v-on:config="updateConfig"></import-config-builder>
    </div>
    <div class="row justify-center q-pa-md">
        <q-btn color="primary" label="Import" @click.prevent="run" />
    </div>
  </q-page>

</template>

<script>
import importConfigBuilder from "./importConfigBuilder.vue";
import ImportService from "../../mixins/ImportService";
import moment from "moment";

export default {
  mixins: [ImportService],
  components: {
    importConfigBuilder
  },
  data: () => {
    return {
      config: {}
    };
  },
  computed: {
    imports: function() {
      return this.$store.state.imports.imports;
    }
  },
  methods: {
     progress: function(imp) {
      if(!imp)
        return;
      if(imp.done)
        return 100;

      const current = moment.utc(imp.to).diff(moment.utc(imp.from)) - moment.utc(imp.to).diff(moment.utc(imp.latest));
      let val = 100 * current;
      val = val / moment.utc(imp.to).diff(moment.utc(imp.from))
     return val ? +val.toFixed(2) : false;
    },
    daysApart: function(range) {
      let to = moment(range.to);
      let from = moment(range.from);

      return to.diff(from, "days");
    },
    updateConfig: function(config) {
      this.config = config;
    },
    run: function() {
      let daysApart = this.daysApart(this.config.importer.daterange);

      if (daysApart < 1) {
        this.$q.dialog({
          title: "Error",
          message: "You can only import at least one day of data."
        });
        return;
      }

      this.startImport(this.config)
        .then(response => {
          this.$store.dispatch("imports/addImport", response.data);
          this.$router.push({
            path: `/data/importer/import/${response.data.id}`
          });
        })
        .catch(error => {
          console.error(error);
          this.$q.notify({
            message: "An error occured while trying to start the import!",
            type: "negative"
          });
        });
    }
  }
};
</script>

<style>

</style>
