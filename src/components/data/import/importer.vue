<template>
  <q-page padding>
    <div class="q-headline">Import data</div>
    <div class="subheading">The importer can download historical market data directly from the exchange.</div>
    <div class="row justify-center q-pa-md">
      <q-btn color="amber" label="Start Import" @click.prevent="run"/>
    </div>
    <div>
      <q-tabs v-model="currentTab" align="justify" color="blue-grey-5 text-white full-width">
        <q-tab icon="av timer" slot="title" name="running-imports" label="Running imports"></q-tab>
        <q-tab icon="add" slot="title" name="start-new" label="Start new import"></q-tab>


        <q-tab-pane name="running-imports">
          <div class="row">
          <q-alert v-if="imports.length === 0"
                   type="warning"
                   icon="warning"
          >
            You currently don't have any imports running.
          </q-alert>


            <q-card
              v-for="_import in imports"
              :key="_import.id"
              class="col text-center q-mr-md q-mt-sm"
            >
              <q-card-title class="bg-teal-2">
                {{ _import.watch.exchange }}
                <span slot="subtitle">
                {{ _import.watch.currency }}-{{ _import.watch.asset }}
              </span>
              </q-card-title>
              <q-card-separator></q-card-separator>
              <q-card-main>
                <q-knob
                  :class="{'text-teal': !_import.done, 'text-positive': _import.done}"
                  :min="0"
                  :max="100"
                  :value="+progress(_import)">
                  <q-icon size="64px" v-if="_import.done" color="positive" name="done"></q-icon>
                  <span v-if="!_import.done" class="q-title">{{+progress(_import)}} %</span>
                </q-knob>
              </q-card-main>
              <q-card-separator></q-card-separator>
              <q-card-actions align="center">
                <q-btn color="teal" flat :to="'/data/importer/import/' + _import.id">open import</q-btn>
              </q-card-actions>
            </q-card>
          </div>
        </q-tab-pane>

        <q-tab-pane name="start-new">
          <import-config-builder v-on:config="updateConfig"></import-config-builder>
        </q-tab-pane>

      </q-tabs>
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
    data: function () {
      return {
        config: {},
        currentTab: "running-imports"
      };
    },
    mounted: function () {
      if (!this.imports.length) this.currentTab = "start-new"
    },
    computed: {
      imports: function () {
        return this.$store.state.imports.imports;
      }
    },
    methods: {
      progress: function (imp) {
        if (!imp) return;
        if (imp.done) return 100;

        const current =
          moment.utc(imp.to).diff(moment.utc(imp.from)) -
          moment.utc(imp.to).diff(moment.utc(imp.latest));
        let val = 100 * current;
        val = val / moment.utc(imp.to).diff(moment.utc(imp.from));
        return val ? +val.toFixed(2) : false;
      },
      daysApart: function (range) {
        let to = moment(range.to);
        let from = moment(range.from);

        return to.diff(from, "days");
      },
      updateConfig: function (config) {
        this.config = config;
      },
      run: function () {
        let daysApart = this.daysApart(this.config.importer.daterange);

        if (daysApart < 1) {
          this.$q.dialog({
            title: "Error",
            message: "You can only import at least one day of data."
          });
          return;
        }

        let exchange = this.$store.state.config.exchanges[
          this.config.watch.exchange
          ];
        if ("exchangeMaxHistoryAge" in exchange) {
          if (
            moment(this.config.importer.daterange.from) <
            moment().subtract(exchange.exchangeMaxHistoryAge, "days")
          ) {
            this.$q.dialog({
              title: "Error",
              message:
              "Your date from is too old for " +
              this.config.watch.exchange +
              ". It supports only the last " +
              exchange.exchangeMaxHistoryAge +
              " days.."
            });
            return;
          }
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
