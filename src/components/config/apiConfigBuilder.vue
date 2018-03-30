<template >
<div class="col-12">
  <div class="row">
    <h4>Add an API key</h4>
    <p>Make sure that the API key has the permissions to <b>create</b> and <b>cancel orders</b> and <b>view balances</b>.</p>
  </div>
  <div class="row">
    <div class="col-4 q-pa-sm">
      <h4>Exchange</h4>
      <exchange-picker
      v-on:exchange="updateExchange"
      :only-tradeable="true"
      />
    </div>

    <div class="col-8 q-pa-sm">
      <h4>Credentials</h4>
      <q-input
      v-for="(cred, idx) in requires"
      :key="idx"
      v-model='credentials[cred]'
      :stack-label="cred"
      />
    </div>
  </div>
  <div class="row justify-center">
    <q-btn color="primary" label="Add API Key" @click.prevent="upload" :disable="!fieldsValid" />
  </div>
</div>
</template>

<script>
import exchangePicker from "../global/configbuilder/exchangepicker.vue";
import _ from "lodash";
import ApiKeyService from "../mixins/ApiKeyService";

export default {
  mixins: [ApiKeyService],
  data: function() {
    return {
      exchange: false,
      credentials: {}
    };
  },
  components: {
    exchangePicker
  },
  computed: {
    fieldsValid: function() {
      let isValid = true;
      let self = this;
      this.requires.forEach(function(item) {
        if (!self.credentials[item] || self.credentials[item].trim() === "") {
          isValid = false;
        }
      });
      return isValid;
    },
    apiKeySets: function() {
      return this.$store.state.config.apiKeys;
    },
    exchanges: function() {
      return this.$store.state.config.exchanges;
    },
    requires: function() {
      if (!this.exchanges) return [];

      if (!this.exchange) return [];

      return this.exchanges[this.exchange].requires;
    },
    config: function() {
      let config = {
        exchange: this.exchange,
        values: this.credentials
      };

      return config;
    }
  },
  watch: {
    credentials: function() {
      this.emitConfig();
    }
  },
  methods: {
    updateExchange: function(exchange) {
      this.credentials = {};
      this.exchange = exchange;
      this.emitConfig();
    },
    emitConfig: function() {
      this.$emit("config", this.config);
    },
    upload: function() {
      let exchange = this.config.exchange;

      if (this.exchanges && this.apiKeySets.includes(exchange)) {
        this.$q
          .dialog({
            title: "Confirm Overwrite",
            message: `You already have an API key for [${exchange}] defined, do you want to overwrite them?`,
            ok: "Yes",
            cancel: "no"
          })
          .then(() => {
            this.uploadApiKey();
          })
          .catch(() => {
            return;
          });
      } else {
        this.uploadApiKey();
      }
    },
    uploadApiKey: function() {
      let exchange = this.config.exchange;
      this.newApiKey(this.config)
        .then(() => {
          this.$q.notify({
            type: "positive",
            message: `API Key for [${exchange}] set.`
          });
          this.credentials = {};
        })
        .catch(error => {
          this.$q.dialog({
            title: "Error",
            message: `Error setting new API Key: ${error}`,
            color: "negative"
          });
        });
    },
  }
};
</script>

<style>

</style>
