<template>
<q-page padding>
  <div>
    <h2>Local Data</h2>
    <p>
      Gekko needs local market data in order to backtest strategies. The local
      data can also be used in a warmup period when running a strategy against a
      live market.
    </p>
  </div>
  <div>
    <h2>Available datasets</h2>
    <div v-if="datasetScanstate === 'idle'">
      <q-btn color="primary" label="Scan available data" @click.prevent="scan" />
    </div>
    <div v-else-if="datasetScanstate === 'scanning'">
      <q-spinner-bars color="secondary" class="full-width" style="height:48px;" />
      <p class="text-center q-pa-sm">Searching for available Datasets...</p>
    </div>
    <div v-else-if="datasetScanstate === 'scanned'">
      <q-alert v-if="unscannableMakets.length"
      type="warning"
      :actions="[{label: viewUnscannable ? 'Hide Details' : 'Show Details', handler: ()=>{ toggleUnscannable(); }}]"
      >
        <b class="text-weight-bold">Some markets were unscannable</b>
        <div v-if="viewUnscannable">
          <p class="text-red-10 text-weight-medium">Unable to find datasets in the following markets:</p>
          <ol>
            <li v-for="market in unscannableMakets" :key="market">
              <ul class="unscannable-item">
                <li><b class="text-blue">{{ market.exchange }}</b></li> 
                <li>{{ market.currency }}</li>
                <li>{{ market.asset }}</li>
              </ul>
            </li>
          </ol>
        </div>
      </q-alert>
      <br>
      <q-table v-if="datasets.length"
      title="Local Datasets" 
      row-key="id" 
      :data="datasets" 
      :columns="tblColumns"
      dense
      :filter="dsFilter"
      separator="vertical"
      >
        <template slot="top-right" slot-scope="props">
          <q-search
            hide-underline
            color="secondary"
            v-model="dsFilter"
            class="col-6"
          />
        </template>
      </q-table> 
      <p v-if="!datasets.length">
        It looks like you don't have any local data yet.
      </p>
    </div>
    <div>
      <h2>Import more Data</h2>
      <p>You can easily import more market data directly from exchanges using the importer.</p>
      <q-btn color="primary" label="Go to the importer!" @click.prevent="$router.push('data/importer')" />
    </div>
  </div>
</q-page>
</template>

<script>
import dataset from "../mixins/DatasetService";

export default {
  mixins: [dataset],
  data: () => {
    return {
      viewUnscannable: false,
      dsFilter: ''
    };
  },
  methods: {
    toggleUnscannable: function() {
      this.viewUnscannable = !this.viewUnscannable;
    },
  }
};
</script>

<style scoped>
.unscannable-item li {
  display: inline-flex;
  list-style-type: none;
}

</style>
