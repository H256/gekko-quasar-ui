<template>
  <q-page padding>
    <div class="text-h4 q-mb-md">Import data</div>
    <div class="subheading">The importer can download historical market data directly from the exchange.</div>
    <div class="row justify-center q-pa-md">
      <q-btn color="blue-grey-7" label="Start Import" @click.prevent="run"/>
    </div>
    <div>
      <q-tabs
        v-model="currentTab"
        class="text-grey"
        active-color="blue-grey"
        indicator-color="blue-grey"
      >
        <q-tab icon="av_timer" name="running-imports" label="Running imports"/>
        <q-tab icon="add" name="start-new" label="Start new import"/>
      </q-tabs>
      <q-separator></q-separator>
      <q-tab-panels v-model="currentTab" animated>
        <q-tab-panel name="running-imports">
          <div class="row justify-center">
            <q-banner
              v-if="imports.length === 0"
              class="bg-warning"
              icon="warning"
            >
              You currently don't have any imports running.
            </q-banner>
            <q-card
              v-for="_import in imports"
              :key="_import.id"
              class="col-lg-1 col-md-12 text-center q-mr-md q-mt-sm"
            >
              <q-card-section class="bg-teal-2">
                <div class="text-h6 text-uppercase">
                  {{ _import.watch.currency }}-{{ _import.watch.asset }}
                </div>
                <div class="text-subtitle-2">
                  {{ _import.watch.exchange }}
                </div>
              </q-card-section>
              <q-separator></q-separator>
              <q-card-section>
                <q-circular-progress
                  :class="{'text-teal': !_import.done, 'text-positive': _import.done}"
                  :min="0"
                  :max="100"
                  :thickness="0.2"
                  size="102px"
                  class="q-ma-md"
                  show-value
                  :value="+progress(_import)">
                  <q-icon size="64px" v-if="_import.done" color="positive" name="done"></q-icon>
                  <span v-if="!_import.done" class="text-h6">{{+progress(_import)}} %</span>
                </q-circular-progress>
              </q-card-section>
              <q-separator></q-separator>
              <q-card-actions align="center">
                <q-btn
                  color="teal"
                  flat
                  @click="$router.push('/data/importer/import/' + _import.id)"
                >
                  open import
                </q-btn>
              </q-card-actions>
            </q-card>
          </div>
        </q-tab-panel>

        <q-tab-panel name="start-new">
          <import-config-builder v-on:config="updateConfig"></import-config-builder>
        </q-tab-panel>
      </q-tab-panels>
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
              color: "negative"
            });
          });
      }
    }
  };
</script>

<style>

</style>
