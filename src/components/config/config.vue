<template>
<div>
  <h4>Config</h4>
  <h4>API keys</h4>
  <div class="row">
    <q-list striped class="col-12">
      <q-list-header>Available API Keys</q-list-header>
      <q-item-separator></q-item-separator>
      <q-item v-if="!apiKeySets.length">
        <q-item-main>You do not have any API Keys setup.</q-item-main>
      </q-item>
      <q-item v-else v-for="exchange in apiKeySets" :key="exchange">
        <q-item-side>
          <q-item-tile>
            <q-icon name="vpn key"></q-icon>
          </q-item-tile>
        </q-item-side>
        <q-item-main>
          <q-item-tile label>{{exchange}}</q-item-tile>
        </q-item-main>
        <q-item-side right>
          <q-item-tile>
            <q-btn round size="sm" color="red" icon="delete forever" @click.prevent="removeApiKey(exchange)" />
          </q-item-tile>
        </q-item-side>
      </q-item>
    </q-list>
  </div>
  <div v-if="!addApiToggle" @click.prevent="openAddApi" class="row q-pa-sm">
    <q-btn color="primary" icon="add circle outline" label="Add API key" />
  </div>
  <div v-if="addApiToggle" class="row q-pa-sm">
   <api-config-builder></api-config-builder>
  </div>
</div>
</template>

<script>
import ApiKeyService from "../mixins/ApiKeyService";
import apiConfigBuilder from "./apiConfigBuilder.vue";

export default {
  mixins: [ApiKeyService],
  components: {
    apiConfigBuilder
  },
  data: function() {
    return {
      addApiToggle: false
    };
  },
  methods: {
    openAddApi: function() {
      this.addApiToggle = true;
    },
    removeApiKey: function(exchange) {
      this.$q
        .dialog({
          title: "API Key removal",
          message: `Are you sure you want to delete the API key for ${exchange}?`,
          ok: "Yes",
          cancel: "No"
        })
        .then(() => {
          this.deleteApiKey(exchange)
            .then(() => {
              this.$q.notify({
                message: `API-Key for ${exchange} has been removed.`,
                type: "positive"
              });
            })
            .catch(error => {
              this.$q.notify({
                message: "An error occured while removing the API Key!",
                type: "negative"
              });
            });
        });
    }
  },
  computed: {
    apiKeySets: function() {
      return this.$store.state.config.apiKeys;
    }
  },
  watch: {
    apiKeySets: function() {
      this.addApiToggle = false;
    }
  }
};
</script>
