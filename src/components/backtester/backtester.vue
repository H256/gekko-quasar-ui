<template>
  <div>
    <h3 class="text-h4 q-mb-md">Backtest</h3>
    <p>Backtest you strategies against historical data here.</p>
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
    <!--<div class="row justify-center" v-if="backtestable">-->
      <!--<q-btn color="red" class="q-mr-xs" :disabled="backtestState === 'fetching'" @click.prevent="startLiveGekko(false)" icon="flash on" label="Start Tradebot" />-->
      <!--<q-btn color="amber-8" class="q-ml-xs" :disabled="backtestState === 'fetching'" @click.prevent="startLiveGekko(true)" icon="remove red eye" label="Start Paper Trader" />-->
    <!--</div>-->
    <result v-if="backtestResult && backtestState === 'fetched'" :result="backtestResult" />
  </div>
</template>

<script>
import configBuilder from "./backtestConfigBuilder.vue";
import result from "./result/result.vue";
import liveMixin from '../mixins/LiveGekkoSharedMixin'

export default {
  mixins:[liveMixin],
  data: function() {
    return {
      backtestable: false,
      backtestState: "idle",
     // backtestResult: false,
      config: false,
      candleWriter: null
    };
  },
  created: function(){
    // load candleWriter config - in case, the user wants to start a live gekko from here...
    this.$axios.get(this.$store.state.config.apiBaseUrl + 'configPart/candleWriter')
      .then(response=>{
        this.candleWriter = toml.parse(response.data.part);
      })
      .catch(error => {
        console.log("error getting candlewriter-config", error);
      });

  },
  computed: {
    backtestResult() {
      return this.$store.getters['backtest/result']
    }
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
      let ctx = this; // promise inside promise can't keep context...

      this.$axios
        .post(this.$store.state.config.apiBaseUrl + "backtest", this.config)
        .then(response => {
          this.backtestState = "fetched";
          //this.backtestResult = response.data;
          // save results to store
          this.$store.dispatch('backtest/setBacktestResult', response.data);
        })
        .catch(error => {
          console.error(error);
          this.$q.notify({
            type: "negative",
            message: "Error during backtest-fetching of data."
          });
          this.backtestState = "error";
        });
    },
    startLiveGekko(isPaperTrader){
      if(this.candleWriter){
        this.config["candleWriter"] = this.candleWriter;
        this.config["watch"]["candleWriter"] = this.candleWriter;
      }

      this.config.type = isPaperTrader ? "paper trader" : "tradebot";
      if(!isPaperTrader) _.set(this.config, 'paperTrader.enabled', false); // disable paper trader, when we want to start a live bot
      this.$q.dialog({
        title: 'Start live ' + this.config.type + "?",
        message: 'Do you really want to start a live ' + this.config.type + ' for ' + this.config.watch.currency + '-' + this.config.watch.asset + ' on ' + this.config.watch.exchange + ' with the current backtest settings?',
        ok: 'Yes',
        cancel: 'No'
      }).then(() => {
        if(!isPaperTrader) _.set(this.config, "trader.enabled", true);
        this.start();
      })

    }
  },
  components: {
    configBuilder,
    result
  }
};
</script>
