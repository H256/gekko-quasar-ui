<template>
  <div class="row justify-around items-top">
    <market-picker v-on:market="updateMarketConfig" :only-importable="true" class="col-3"></market-picker>
    <range-creator v-on:range="updateRange" class="col-3"></range-creator>
  </div>
</template>

<script>
  import marketPicker from '../../global/configbuilder/marketpicker.vue'
  import rangeCreator from '../../global/configbuilder/rangecreator.vue'

  export default {
    data: function () {
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
      config: function () {

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
            candleWriter: {enabled: true}
          }
        );

        return config;
      }
    },
    methods: {
      updateMarketConfig: function (mc) {
        this.market = mc;
        this.emitConfig();
      },
      updateRange: function (range) {
        this.range = range;
        this.emitConfig();
      },
      emitConfig: function () {
        this.$emit('config', this.config);
      }
    }
  }
</script>
