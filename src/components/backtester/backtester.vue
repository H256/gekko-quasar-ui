<template>
  <div>
    <h2 class="q-mb-xs">Backtest</h2>
    <div class="row">
      <div class="col-12">
         <config-builder v-on:config="check" />
      </div>
    </div>
    <div class="row justify-center q-mt-md" v-if="backtestable">
      <q-btn color="primary" :loading="backtestState === 'fetching'" :disabled="backtestState === 'fetching'" @click.prevent="run">Backtest</q-btn>
    </div>
    <div class="row justify-center q-mt-md" v-if="backtestable">
        <div v-if="backtestState === 'fetching'" class="text-center">
            <h4>Running backtest...</h4>
            <q-spinner-bars color="secondary" size="48px"></q-spinner-bars>
        </div>
    </div>
    <result v-if="backtestResult && backtestState === 'fetched'" :result="backtestResult" />
  </div>
</template>

<script>
import configBuilder from "./backtestConfigBuilder.vue";
import result from "./result/result.vue";

export default {
  data: () => {
    return {
      backtestable: false,
      backtestState: "idle",
      backtestResult: false,
      config: false
    };
  },
  methods: {
    check: function(config) {
      // console.log('CHECK', config);
      this.config = config;

      if (!config.valid) return (this.backtestable = false);

      this.backtestable = true;
    },
    run: function() {
      this.backtestState = "fetching";

      const req = {
        gekkoConfig: this.config,
        data: {
          candleProps: ["open", "close", "high", "low", "start"],
          indicatorResults: true,
          report: true,
          roundtrips: true,
          trades: true
        }
      };

      this.$axios
        .post(this.$store.state.config.apiBaseUrl + "backtest", req)
        .then(response => {
          this.backtestState = "fetched";
          this.backtestResult = response.data;
        })
        .catch(error => {
          this.$q.notify({
            type: "negative",
            message: "Error during backtest-fetching of data."
          });
        });
    }
  },
  components: {
    configBuilder,
    result
  }
};
</script>
