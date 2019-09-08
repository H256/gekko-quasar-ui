<template>
  <div>
    <div class="row">
      <div class="text-h5 q-mb-md">Paper Trader</div>
    </div>
    <div class="row q-col-gutter-md">
      <div class="col">
        <q-btn @click.prevent="switchToggle" color="primary">Change paper trader settings</q-btn>
      </div>
      <div class="col">
        <q-input
          v-if="toggle === 'open'"
          label="Settings"
          v-model="rawPaperTraderParams"
          :filled="!!rawPaperTraderParamsError"
          :error="!!rawPaperTraderParamsError"
          :error-label="rawPaperTraderParamsError.message"
          type="textarea"
          rows="8"
          :max-height="80"
          :inverted="!!rawPaperTraderParamsError"
        />
      </div>
    </div>
  </div>

</template>

<script>
  export default {
    async created() {
      try {
        let response = await this.$axios.get(this.$store.state.config.apiBaseUrl + "configPart/paperTrader")
        this.rawPaperTraderParams = response.data.part;
      } catch (error) {
        this.$q.notify({
          type: "negative",
          message: "Error getting Perfomance-Analyser config from server."
        });
      }
    },
    data: function () {
      return {
        rawPaperTraderParams: "",
        rawPaperTraderParamsError: false,
        paperTraderParams: {},
        toggle: "closed"
      };
    },
    watch: {
      rawPaperTraderParams: function () {
        this.emitConfig();
      }
    },
    methods: {
      switchToggle: function () {
        if (this.toggle === "open") this.toggle = "closed";
        else this.toggle = "open";
      },
      emitConfig: function () {
        this.parseParams();
        this.$emit("settings", this.paperTraderParams);
      },
      parseParams: function () {
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
