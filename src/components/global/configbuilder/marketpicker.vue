<template>
  <q-card inline style="width:250px;" class="q-ma-sm">
  <q-card-title>Market</q-card-title>
  <q-card-main>
    <exchange-picker v-on:exchange="setExchange($event)" :onlyTradable="onlyTradable" :onlyImportable="onlyImportable"/>
  </q-card-main>
  <q-card-separator></q-card-separator>
  <q-card-main>
    <q-field v-if="currencies"
      helper="Pick a currency"
      :label-width="3"
    >
    <q-select
        filter
        autofocus-filter
        v-model="currency"
        :options="currencies"
        float-label="Currency"
        radio
        />
    </q-field>
    </q-card-main>
    <q-card-separator></q-card-separator>
    <q-card-main>
    <q-field v-if="currencies"
      helper="Pick an asset"
      :label-width="3"
    >
    <q-select
        filter
        autofocus-filter
        v-model="asset"
        :options="assets"
        float-label="Asset"
        radio
        />
    </q-field>
  </q-card-main>
</q-card>
</template>

<script>

import _ from 'lodash'
import exchangePicker from './exchangepicker'

import { get } from '../../../tools/ajax'

export default {
  props: ['onlyTradable', 'onlyImportable'],
  components: {
    exchangePicker
  },
  data: () => {
    return {
      // defaults:
      exchange: 'poloniex',
      currency: 'USDT',
      asset: 'BTC',
    };
  },
  created: function() {
    this.emitConfig();
  },
  computed: {
    exchanges: function() {

      let exchanges = Object.assign({}, this.$store.state.config.exchanges);

      if(_.isEmpty(exchanges))
        return false;

      if(this.onlyTradable) {
        _.each(exchanges, (e, name) => {
          if(!e.tradable)
            delete exchanges[name];
        });
      }

      if(this.onlyImportable) {
        _.each(exchanges, (e, name) => {
          if(!e.importable)
            delete exchanges[name];
        });
      }

      return exchanges;
    },
    markets: function() {
      return this.exchanges ? this.exchanges[ this.exchange ] : null;
    },
    assets: function() {
      let list = this.exchanges ? this.exchanges[this.exchange].markets[this.currency] : [];
      if(list){
        list = _.map(list, function(item){
          return {value: item, label: item}
        })
        if(list.length)
          this.asset = list[0].value
      }
      return list;
    },
    currencies: function() {
      let list = this.exchanges ? _.keys( this.exchanges[this.exchange].markets ) : [];
      if(list){
        list = _.map(list, function(item){
          return {value: item, label: item}
        })
        if(list.length)
          this.currency = list[0].value;
      }
      return list;
    },
    watchConfig: function() {
      return {
        watch: {
          exchange: this.exchange,
          currency: this.currency,
          asset: this.asset,
        }
      }
    }
  },

  watch: {
    currency: function() { this.emitConfig() },
    asset: function() { this.emitConfig() },
    market: function() { this.emitConfig() },
    exchanges: function() { this.emitConfig() },
    exchange: function() { this.emitConfig() }
  },

  methods: {
    setExchange: function(exchange){
      this.exchange = exchange;
    },
    emitConfig: function() {
      this.$emit('market', this.watchConfig);
    }
  }
}
</script>
