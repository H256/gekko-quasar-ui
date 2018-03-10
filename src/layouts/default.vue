<template>
  <q-layout view="lHh Lpr lFf">
    <q-layout-header>
      <q-toolbar color="primary">
        <q-btn
          flat
          dense
          round
          @click="leftDrawerOpen = !leftDrawerOpen"
        >
          <q-icon name="menu" />
        </q-btn>

        <q-toolbar-title>
          Gekko UI
        </q-toolbar-title>
        
        
      </q-toolbar>
        <q-tabs>
          <q-route-tab slot="title" default icon="home" label="Home" to="/" exact></q-route-tab>
          <q-route-tab slot="title" icon="cast connected" label="Live Gekkos" to="/live-gekkos" exact></q-route-tab>
          <q-route-tab slot="title" icon="timeline" label="Backtest" to="/backtest" exact></q-route-tab>
          <q-route-tab slot="title" icon="storage" label="Data" to="/data" exact></q-route-tab>
          <q-route-tab slot="title" icon="settings" label="Config" to="/config" exact></q-route-tab>
          <q-route-tab slot="title" icon="help" label="Documentation" to="/help"></q-route-tab>
        </q-tabs>
    </q-layout-header>

    <q-layout-drawer
      v-model="leftDrawerOpen"
      content-class="bg-grey-2"
    >
      <q-list
        no-border
        link
        inset-delimiter
      >
        <q-list-header>Essential Links</q-list-header>
        <q-item @click.native="openURL('https://github.com/askmike/gekko')">
          <q-item-side icon="code" />
          <q-item-main label="GitHub (original)" sublabel="github.com/askmike/gekko" />
        </q-item>
        <q-item @click.native="openURL('https://discord.gg/26wMygt')">
          <q-item-side icon="chat" />
          <q-item-main label="Gekko Discord Channel" sublabel="https://discord.gg/26wMygt" />
        </q-item>
        <q-item @click.native="openURL('https://forum.gekko.wizb.it/')">
          <q-item-side icon="record_voice_over" />
          <q-item-main label="Gekko Forum" sublabel="https://forum.gekko.wizb.it/" />
        </q-item>
        <q-item-separator></q-item-separator>
        <q-list-header>Unofficial resources (use at own risk!)</q-list-header>
        <q-item @click.native="openURL('https://github.com/h256/gekko')">
          <q-item-side icon="code" />
          <q-item-main label="GitHub (H256's fork)" sublabel="github.com/h256/gekko" />
        </q-item>
        <q-item @click.native="openURL('https://github.com/gekkowarez/gekkoga')">
          <q-item-side icon="code" />
          <q-item-main label="Gekko-GA " sublabel="Genetic algorithm for gekko" />
        </q-item>
        <q-item @click.native="openURL('https://github.com/Gab0/japonicus')">
          <q-item-side icon="code" />
          <q-item-main label="Japonicus" sublabel="Genetic algorithm backtester for gekko" />
        </q-item>
        <q-item-separator />
        <q-list-header>Quasar Framework resources</q-list-header>
        <q-item @click.native="openURL('http://quasar-framework.org')">
          <q-item-side icon="school" />
          <q-item-main label="Quasar Framework" sublabel="quasar-framework.org" />
        </q-item>
      </q-list>
    </q-layout-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-layout-footer>
      <q-toolbar color="primary">
        <q-toolbar-title>
          Gekko Material v {{version.ui}}
          <div slot="subtitle">Running on Quasar v{{ $q.version }}</div>
        </q-toolbar-title>
        <q-toolbar-title>
          <em>Use Gekko at your own risk!</em>
          <div slot="subtitle">Using Gekko v {{version.gekko}}</div>
        </q-toolbar-title>
      </q-toolbar>
    </q-layout-footer>
  </q-layout>
</template>

<script>
import { openURL } from "quasar";
//TODO: Get Real Version from API or from Folder...
const gekkoPackage = {version:'0.5.13'};//require('../../../../../package.json');
const uiPackage = require('../../package.json');

export default {
  name: "LayoutDefault",
  data() {
    return {
      leftDrawerOpen: this.$q.platform.desktop,
      version: {
        gekko: gekkoPackage.version,
        ui: uiPackage.version
      }
    };
  },
  methods: {
    openURL
  }
};
</script>

<style>

</style>
