<template>
<div>
  <market-picker v-on:market="updateMarketConfig" :only-importable="true"></market-picker>
  <range-creator v-on:range="updateRange"></range-creator>
</div>
</template>

<script>
import marketPicker from '../../global/configbuilder/marketpicker.vue'
import rangeCreator from '../../global/configbuilder/rangecreator.vue'
import _ from 'lodash'

export default {
  data: () => {
    return {
      market: {},
      range: {}
    }
  },
  components: {
    marketPicker,
    rangeCreator
  },
  computed: {
    config: function() {

      let config = {};
      Object.assign(
        config,
        this.market,
        {
          importer: {
            daterange: this.range
          }
        },
        {
          candleWriter: { enabled: true }
        }
      );

      return config;
    }
  },
  methods: {
    updateMarketConfig: function(mc) {
      this.market = mc;
      this.emitConfig();
    },
    updateRange: function(range) {
      this.range = range;
      this.emitConfig();
    },
    emitConfig: function() {
      this.$emit('config', this.config);
    }
  }
}
</script>

<style>
</style>
