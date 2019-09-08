<template>
  <q-layout view="lHh Lpr fff">
    <q-header>
      <q-toolbar class="bg-blue-grey-7">
        <q-btn
          flat
          dense
          round
          @click="leftDrawerOpen = !leftDrawerOpen"
        >
          <q-icon name="menu"/>
        </q-btn>
        <q-toolbar-title>
          Gordon UI
        </q-toolbar-title>
        <q-space></q-space>
        <q-tabs shrink stretch>
          <q-route-tab icon="home" default label="Home" to="/" exact></q-route-tab>
          <q-route-tab icon="cast_connected" label="Live Gekkos" to="/live-gekkos" exact>
            <q-badge color="green" floating v-if="stratrunners.length">{{stratrunners.length}}</q-badge>
          </q-route-tab>
          <q-route-tab icon="timeline" label="Backtest" to="/backtest" exact></q-route-tab>
          <q-route-tab icon="storage" label="Data" to="/data" exact></q-route-tab>
          <q-route-tab icon="import_export" label="Importer" to="/data/importer" exact>
            <q-badge color="blue" floating v-if="activeImports > 0">{{activeImports}}</q-badge>
          </q-route-tab>
          <q-route-tab icon="settings" label="Config" to="/config" exact></q-route-tab>
          <q-route-tab icon="help" label="Documentation" to="/help"></q-route-tab>
        </q-tabs>
      </q-toolbar>
      <q-toolbar v-if="currentWatchers.length > 0" class="bg-blue-grey-8">
        <div v-if="currentWatchers.length > 0">
          <div class="text-h6">Prices:</div>
          <div class="text-subtitle">(from Watchers)</div>
        </div>
        <q-space></q-space>
        <div class="q-mx-xs" v-for="(w,idx) in currentWatchers" :key="'prices-' + w.id" v-if="w.events.latest.candle">
          <div class="text-h6">{{w.events.latest.candle.close}}
            <img class="crypto-icon-16"
                 :src="'statics/crypto_icons/white/' + w.config.watch.currency.toLowerCase() + '.svg'"
                 :alt="w.config.watch.currency" :title="w.config.watch.currency">
          </div>
          <div class="text-subtitle">
            <img class="crypto-icon-16 q-icon q-mr-xs"
                 :src="'statics/crypto_icons/white/' + w.config.watch.asset.toLowerCase() + '.svg'"
                 :alt="w.config.watch.asset" :title="w.config.watch.asset">
            {{w.config.watch.exchange}}
          </div>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      content-class="bg-grey-2"
    >
      <q-list>
        <q-item-label header>Essential Links</q-item-label>
        <q-item clickable @click.native="openURL('https://github.com/h256/gekko-quasar-ui')">
          <q-item-section side>
            <q-icon name="fab fa-github-square"></q-icon>
          </q-item-section>
          <q-item-section>
            <q-item-label>Gekko-Quasar-UI on GitHub</q-item-label>
            <q-item-label caption>github.com/h256/gekko-quasar-ui</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable @click.native="openURL('https://github.com/askmike/gekko')">
          <q-item-section side>
            <q-icon name="fab fa-github-square"></q-icon>
          </q-item-section>
          <q-item-section>
            <q-item-label>Gekko on GitHub</q-item-label>
            <q-item-label caption>github.com/askmike/gekko</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable @click.native="openURL('https://discord.gg/26wMygt')">
          <q-item-section side>
            <q-icon name="chat"></q-icon>
          </q-item-section>
          <q-item-section>
            <q-item-label>Gekko Discord Channel</q-item-label>
            <q-item-label caption>https://discord.gg/26wMygt</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable @click.native="openURL('https://forum.gekko.wizb.it/')">
          <q-item-section side>
            <q-icon name="record_voice_over"></q-icon>
          </q-item-section>
          <q-item-section>
            <q-item-label>Gekko Forum</q-item-label>
            <q-item-label caption>https://forum.gekko.wizb.it/</q-item-label>
          </q-item-section>
        </q-item>
        <q-separator></q-separator>
        <q-item-label header>Unofficial resources (use at own risk!)</q-item-label>
        <q-item clickable @click.native="openURL('https://github.com/gekkowarez/gekkoga')">
          <q-item-section side>
            <q-icon name="fab fa-github"></q-icon>
          </q-item-section>
          <q-item-section>
            <q-item-label>Gekko-GA</q-item-label>
            <q-item-label caption>Genetic algorithm for gekko</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable @click.native="openURL('https://github.com/Gab0/japonicus')">
          <q-item-section side>
            <q-icon name="fab fa-github"></q-icon>
          </q-item-section>
          <q-item-section>
            <q-item-label>Japonicus</q-item-label>
            <q-item-label caption>Genetic algorithm backtester for gekko</q-item-label>
          </q-item-section>
        </q-item>
        <q-separator/>
        <q-item-label header>Other resources</q-item-label>
        <q-item clickable @click.native="openURL('http://cryptoicons.co/')">
          <q-item-section side>
            <q-icon name="face"></q-icon>
          </q-item-section>
          <q-item-section>
            <q-item-label>Atomiclabs' Cryptocurrency Icons</q-item-label>
            <q-item-label caption>http://cryptoicons.co/</q-item-label>
          </q-item-section>
        </q-item>
        <q-separator/>
        <q-item-label header>Quasar Framework resources</q-item-label>
        <q-item clickable @click.native="openURL('http://quasar.dev')">
          <q-item-section side>
            <q-icon name="school"></q-icon>
          </q-item-section>
          <q-item-section>
            <q-item-label>Quasar Framework</q-item-label>
            <q-item-label caption>quasar-framework.org</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view/>
    </q-page-container>

    <q-footer reveal>
      <q-toolbar class="bg-blue-grey-7">
        <div>
          <div class="text-h6">Gordon UI v {{version.ui}}</div>
          <div class="text-subtitle">Running on Quasar v{{ $q.version }}</div>
        </div>
        <q-space></q-space>
        <div>
          <div class="text-h6"><em>Use Gekko and Gordon UI at your own risk!</em></div>
          <div class="text-subtitle" v-if="version.gekko">Using Gekko v {{version.gekko}}</div>
        </div>
        <q-space></q-space>
        <q-toolbar-title>
          <div class="text-h6">Crypto-Icons by <a href="http://cryptoicons.co/">crypticons.co</a></div>
        </q-toolbar-title>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script>
  import {openURL} from "quasar";
  import _ from 'lodash'

  const uiPackage = require('../../package.json');

  export default {
    name: "MainLayoutPage",
    data() {
      return {
        leftDrawerOpen: false,
        version: {
          gekko: null,
          ui: uiPackage.version
        }
      };
    },
    created: async function () {
      try {
        let vResp = await this.$axios.get(`${this.$store.state.config.apiBaseUrl}info`);
        if (_.has(vResp.data, 'version')) this.version.gekko = _.get(vResp.data, 'version');
      } catch (ex) {
        console.log("Error while getting gekko's version info.", ex)
      }
    },
    computed: {
      stratrunners() {
        return _.values(this.$store.getters['gekkos/list'])
          .concat(_.values(this.$store.getters['gekkos/archive']))
          .filter(g => {
            if (g.logType === 'papertrader')
              return true;

            if (g.logType === 'tradebot')
              return true;

            return false;
          });
      },
      watchers() {
        return _.values(this.$store.getters['gekkos/list'])
          .concat(_.values(this.$store.getters['gekkos/archive']))
          .filter(g => g.logType === 'watcher')
      },
      activeImports: function () {
        return _.filter(this.$store.state.imports.imports, function (item) {
          return !item.done
        }).length;
      },
      currentWatchers: function () {
        return _.slice(this.watchers, 0, 10);
      }
    },
    methods: {
      openURL
    }
  };
</script>

<style>
</style>
