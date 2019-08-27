<template>
<div>
  <div class="row"><h4>Paper Trader</h4></div>
  <div class="row q-guttermd">
    <div class="col">
      <q-btn @click.prevent="switchToggle" color="primary">Change paper trader settings</q-btn>
    </div>
    <div class="col">
      <q-field v-if="toggle === 'open'"
        label="Settings"
        orientation="vertical"
        :error="!!rawPaperTraderParamsError"
        :error-label="rawPaperTraderParamsError.message"
        class="q-mt-md"
        helper="adjust you paper trader settings here...">
          <q-input
            v-model="rawPaperTraderParams"
            type="textarea"
            rows="8"
            :max-height="80"
            :inverted="!!rawPaperTraderParamsError"
            />
      </q-field>
    </div>
  </div>
</div>

</template>

<script>
import _ from "lodash";

export default {
  created: function() {
    this.$axios
      .get(this.$store.state.config.apiBaseUrl + "configPart/paperTrader")
      .then(response => {
        this.rawPaperTraderParams = response.data.part;
      })
      .catch(error => {
        this.$q.notify({
          type: "negative",
          message: "Error getting Perfomance-Analyser config from server."
        });
      });
  },
  data: function() {
    return {
      rawPaperTraderParams: "",
      rawPaperTraderParamsError: false,
      paperTraderParams: {},
      toggle: "closed"
    };
  },
  watch: {
    rawPaperTraderParams: function() {
      this.emitConfig();
    }
  },
  methods: {
    switchToggle: function() {
      if (this.toggle === "open") this.toggle = "closed";
      else this.toggle = "open";
    },
    emitConfig: function() {
      this.parseParams();
      this.$emit("settings", this.paperTraderParams);
    },
    parseParams: function() {
      try {
        this.paperTraderParams = toml.parse(this.rawPaperTraderParams);
        this.paperTraderParams.reportRoundtrips = true;
        this.rawPaperTraderParamsError = false;
      } catch (e) {
        this.rawPaperTraderParamsError = e;
        this.paperTraderParams = {};
      }
    }
  }
};
</script>
