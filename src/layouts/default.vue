<template>
  <q-layout view="lHh Lpr fff">
    <q-header>
      <q-toolbar color="blue-grey-7">
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
        <q-tabs align="justify" color="blue-grey-7">
          <q-route-tab default icon="home" label="Home" to="/" exact></q-route-tab>
          <q-route-tab icon="cast connected" label="Live Gekkos" to="/live-gekkos" exact
                       :count="stratrunners.length"></q-route-tab>
          <q-route-tab icon="timeline" label="Backtest" to="/backtest" exact></q-route-tab>
          <q-route-tab icon="storage" label="Data" to="/data" exact></q-route-tab>
          <q-route-tab icon="import export" label="Importer" to="/data/importer" exact
                       :count="activeImports"></q-route-tab>
          <q-route-tab icon="settings" label="Config" to="/config" exact></q-route-tab>
          <q-route-tab icon="help" label="Documentation" to="/help"></q-route-tab>
        </q-tabs>
      </q-toolbar>
      <q-toolbar v-if="currentWatchers.length > 0" color="blue-grey-8">

        <q-toolbar-title shrink v-if="currentWatchers.length > 0" class="text-right">Prices: <span slot="subtitle">(from Watchers)</span>
        </q-toolbar-title>
        <q-toolbar-title shrink v-for="(w,idx) in currentWatchers" :key="w.id" v-if="w.events.latest.candle">
          {{w.events.latest.candle.close}}
          <img class="crypto-icon-16"
               :src="'statics/crypto_icons/white/' + w.config.watch.currency.toLowerCase() + '.svg'"
               :alt="w.config.watch.currency" :title="w.config.watch.currency">

          <span slot="subtitle">
              <img class="crypto-icon-16 q-icon q-mr-xs"
                   :src="'statics/crypto_icons/white/' + w.config.watch.asset.toLowerCase() + '.svg'"
                   :alt="w.config.watch.asset" :title="w.config.watch.asset">
            {{w.config.watch.exchange}}
            </span>
        </q-toolbar-title>
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
            <q-item-label caption>https://github.com/h256/gekko-quasar-ui</q-item-label>
          </q-item-section>
        </q-item>
        <q-item @click.native="openURL('https://github.com/askmike/gekko')">
          <q-item-section icon="code"/>
          <q-item-label label="Gekko on GitHub" sublabel="github.com/askmike/gekko"/>
        </q-item>
        <q-item @click.native="openURL('https://discord.gg/26wMygt')">
          <q-item-section icon="chat"/>
          <q-item-label label="Gekko Discord Channel" sublabel="https://discord.gg/26wMygt"/>
        </q-item>
        <q-item @click.native="openURL('https://forum.gekko.wizb.it/')">
          <q-item-section icon="record_voice_over"/>
          <q-item-label label="Gekko Forum" sublabel="https://forum.gekko.wizb.it/"/>
        </q-item>
        <q-separator></q-separator>
        <q-item-label header>Unofficial resources (use at own risk!)</q-item-label>
        <q-item @click.native="openURL('https://github.com/gekkowarez/gekkoga')">
          <q-item-section icon="code"/>
          <q-item-label label="Gekko-GA " sublabel="Genetic algorithm for gekko"/>
        </q-item>
        <q-item @click.native="openURL('https://github.com/Gab0/japonicus')">
          <q-item-section icon="code"/>
          <q-item-label label="Japonicus" sublabel="Genetic algorithm backtester for gekko"/>
        </q-item>
        <q-separator/>
        <q-item-label header>Other resources</q-item-label>
        <q-item @click.native="openURL('http://cryptoicons.co/')">
          <q-item-section icon="face"/>
          <q-item-label label="Atomiclabs' Cryptocurrency Icons" sublabel="http://cryptoicons.co/"/>
        </q-item>
        <q-separator/>
        <q-item-label header>Quasar Framework resources</q-item-label>
        <q-item @click.native="openURL('http://quasar-framework.org')">
          <q-item-section icon="school"/>
          <q-item-label label="Quasar Framework" sublabel="quasar-framework.org"/>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view/>
    </q-page-container>

    <q-footer>
      <q-toolbar color="blue-grey-7">
        <q-toolbar-title>
          Gordon UI v {{version.ui}}
          <div slot="subtitle">Running on Quasar v{{ $q.version }}</div>
        </q-toolbar-title>
        <q-toolbar-title>
          <em>Use Gekko and Gordon UI at your own risk!</em>
          <div v-if="version.gekko" slot="subtitle">Using Gekko v {{version.gekko}}</div>
        </q-toolbar-title>
        <q-toolbar-title>
          <div slot="subtitle">Icons by <a href="http://cryptoicons.co/">crypticons.co</a></div>
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
