<template>
  <div class="row q-col-gutter-md justify-around items-baseline">
    <div class="col-lg-6 col-md-12">
      <div class="text-h5">Add an API key</div>
      <div class="text-subtitle1">Make sure that the API key has the permissions to <b>create</b> and <b>cancel
        orders</b> and <b>view balances</b>.
      </div>
    </div>
    <div class="col-lg-6 col-md-12 q-col-gutter-md">
      <div class="row">
        <div class="col">
          <div class="text-h5">API Key data</div>
          <exchange-picker
            v-on:exchange="updateExchange"
            :only-tradeable="true"
          />
          <q-input
            v-for="(cred, idx) in requires"
            :key="idx"
            v-model='credentials[cred]'
            :label="cred"
          />
          <q-btn class="q-mt-md" color="primary" label="Add API Key" @click.prevent="upload" :disable="!fieldsValid"/>
        </div>
      </div>
      <div class="row">

      </div>
    </div>
  </div>
</template>

<script>
  import exchangePicker from "../global/configbuilder/exchangepicker.vue";
  import _ from "lodash";
  import ApiKeyService from "../mixins/ApiKeyService";

  export default {
    mixins: [ApiKeyService],
    data: function () {
      return {
        exchange: false,
        credentials: {}
      };
    },
    components: {
      exchangePicker
    },
    computed: {
      fieldsValid: function () {
        let isValid = true;
        let self = this;
        this.requires.forEach(function (item) {
          if (!self.credentials[item] || self.credentials[item].trim() === "") {
            isValid = false;
          }
        });
        return isValid;
      },
      apiKeySets: function () {
        return this.$store.state.config.apiKeys;
      },
      exchanges: function () {
        return this.$store.state.config.exchanges;
      },
      requires: function () {
        if (!this.exchanges) return [];

        if (!this.exchange) return [];

        return this.exchanges[this.exchange].requires;
      },
      config: function () {
        let config = {
          exchange: this.exchange,
          values: this.credentials
        };

        return config;
      }
    },
    watch: {
      credentials: function () {
        this.emitConfig();
      }
    },
    methods: {
      updateExchange: function (exchange) {
        this.credentials = {};
        this.exchange = exchange;
        this.emitConfig();
      },
      emitConfig: function () {
        this.$emit("config", this.config);
      },
      upload: function () {
        let exchange = this.config.exchange;

        if (this.exchanges && this.apiKeySets.includes(exchange)) {
          this.$q.dialog({
            title: "Confirm Overwrite",
            message: `You already have an API key for [${exchange}] defined, do you want to overwrite them?`,
            cancel: true,
            persistent: true
          }).onOk(() => {
            this.uploadApiKey();
          }).onCancel(() => {
            return;
          });
        } else {
          this.uploadApiKey();
        }
      },
      async uploadApiKey() {
        let exchange = this.config.exchange;
        try {
          await this.newApiKey(this.config)
          this.$q.notify({
            color: "positive",
            message: `API Key for [${exchange}] set.`,
            icon: 'check_circle'
          });
          this.credentials = {};
        } catch (error) {
          this.$q.dialog({
            title: "Error",
            message: `Error setting new API Key: ${error}`,
            color: "negative",
            icon: 'error'
          });
        }
      }
    }
  };
</script>

<style>

</style>
