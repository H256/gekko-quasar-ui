<template>
  <q-select
    dense
    label="Exchange"
    hint="Pick an exchange"
    v-model="exchange"
    :options="exchangeList"
    emit-value
    map-options
  />
</template>

<script>
  import _ from "lodash";

  export default {
    props: ["onlyTradable", "onlyImportable"],
    data: function () {
      return {
        exchange: "binance"
      };
    },
    created: function () {
      this.emitExchange();
    },
    computed: {
      exchangeList() {
        return _.map(
          Object.keys(this.exchanges),
          (item, idx) => {
            return {value: item, label: item};
          }
        );
      },
      exchanges: function () {
        let exchanges = Object.assign({}, this.$store.state.config.exchanges);

        if (_.isEmpty(exchanges)) return false;

        if (this.onlyTradable) {
          _.each(exchanges, (e, name) => {
            if (!e.tradable) delete exchanges[name];
          });
        }

        if (this.onlyImportable) {
          _.each(exchanges, (e, name) => {
            if (!e.importable) delete exchanges[name];
          });
        }

        return exchanges;
      }
    },

    watch: {
      exchanges: function () {
        this.emitExchange();
      },
      exchange: function () {
        this.emitExchange();
      }
    },

    methods: {
      emitExchange: function () {
        this.$emit("exchange", this.exchange);
      }
    }
  };
</script>
