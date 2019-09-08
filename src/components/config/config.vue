<template>
  <div>
    <div class="text-h4 q-mb-md">Configuration</div>
    <p>Configure API Keys and other stuff here.</p>
    <div class="text-h5">API Keys</div>
    <div class="row">
      <div class="col">
        <q-list separator bordered class="q-my-md">
          <q-item-label header>Available API Keys</q-item-label>
          <q-separator></q-separator>
          <q-item v-if="!apiKeySets.length">
            <q-item-label>You do not have any API Keys setup.</q-item-label>
          </q-item>
          <q-item v-else v-for="exchange in apiKeySets" :key="exchange">
            <q-item-section avatar>
              <q-icon color="secondary" name="vpn_key"></q-icon>
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-uppercase">{{exchange}}</q-item-label>
            </q-item-section>
            <q-item-section side right>
              <q-item-section>
                <q-btn flat round color="red" icon="delete_forever" @click.prevent="removeApiKey(exchange)"/>
              </q-item-section>
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </div>
    <div v-if="!addApiToggle" @click.prevent="openAddApi" class="row q-pa-sm">
      <q-btn color="primary" icon="add_circle_outline" label="Add API key"/>
    </div>

    <api-config-builder v-if="addApiToggle"></api-config-builder>

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
    data: function () {
      return {
        addApiToggle: false
      };
    },
    methods: {
      openAddApi: function () {
        this.addApiToggle = true;
      },
      removeApiKey(exchange) {

        this.$q.dialog({
          title: "API Key removal",
          message: `Are you sure you want to delete the API key for ${exchange}?`,
          cancel: true,
          persistent: true
        }).onOk(async () => {
          try {
            await this.deleteApiKey(exchange)
            this.$q.notify({
              message: `API-Key for [${exchange}] has been removed.`,
              color: "positive",
              icon: 'check_circle'
            });
          } catch (error) {
            this.$q.notify({
              message: "An error occured while removing the API Key!",
              color: "negative",
              icon: 'error'
            });
          }
        }).onCancel(() => {
          return;
        })
      }
    },
    computed: {
      apiKeySets: function () {
        return this.$store.state.config.apiKeys;
      }
    },
    watch: {
      apiKeySets: function () {
        this.addApiToggle = false;
      }
    }
  };
</script>
