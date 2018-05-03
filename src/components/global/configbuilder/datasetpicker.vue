<template>
  <div>
    <h3>Select a dataset {{selectedText}}</h3>
    <div class="text-center" v-if="datasetScanstate === 'idle'">
      <q-btn color="primary" @click.prevent="scan">Scan available data</q-btn>
    </div>
    <div class="text-center">
      <q-spinner-bars color="secondary" v-if="datasetScanstate === 'scanning'" size="48px"></q-spinner-bars>
    </div>
    <div v-if="datasetScanstate === 'scanned'">
    <q-table
      v-if="datasets.length"
      title="Local Datasets"
      row-key="id"
      :data="datasets"
      :columns="tblColumns"
      dense
      :filter="dsFilter"
      selection="single"
      :selected.sync="selectedRows"
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
      <div class="text-center q-pa-sm" v-if="datasets.length">
        <q-btn
          color="primary"
          icon="av timer"
          @click.prevent="openRange"
          :disabled="!this.selectedRow || this.selectedRow.length === 0">Adjust range</q-btn>
        <q-btn color="amber" icon="refresh" @click.prevent="scan">reload datasets</q-btn>
      </div>
      <div class="row" v-if="rangeVisible"><p class="caption">Adjust the dataset range to your liking</p></div>
      <div class="row gutter-md" v-if="rangeVisible">
        <div class="col-6">
          <q-field class="col-6" label="From:" :label-width="1" orientation="vertical">
            <q-datetime v-model="customFrom" :min="minSelectableRange" :max="maxSelectableRange" type="datetime" format-model="auto"></q-datetime>
          </q-field>
        </div>
        <div class="col-6"><q-field label="To:" :label-width="1" orientation="vertical">
          <q-datetime v-model="customTo" :min="minSelectableRange" :max="maxSelectableRange" type="datetime"></q-datetime>
        </q-field>
       </div>
      </div>
      <div v-if="!datasets.length">
        <em>No Data found <router-link to="data/importer">Lets add some</router-link></em>
      </div>
    </div>

  </div>
</template>

<script>
import moment from 'moment'

import Vue from 'vue'
import dataset from '../../mixins/DatasetService'

export default {
  data: () => {
    return {
      customTo: false,
      customFrom: false,
      rangeVisible: false,
      selectedRows: [],
      selectedRow: null,
      minSelectableRange: null,
      maxSelectableRange: null,
      dsFilter: ""
    };
  },
  mixins: [ dataset ],
  computed: {
    isScanning(){
      return this.datasetScanstate === 'scanning';
    },
    selectedText(){
      if(this.selectedRow){
        return `(current: ${this.selectedRow.currency} - ${this.selectedRow.asset})`
      }
      return ""
    }
  },
  mounted: function(){
    this.scan();
  },
  methods: {
    fmt: mom => moment(mom).utc().format('YYYY-MM-DD HH:mm'),
    openRange: function() {
      this.updateCustomRange();
      this.rangeVisible = true;
    },
    updateCustomRange: function() {
      this.customTo = this.fmt(this.selectedRow.to);
      this.customFrom = this.fmt(this.selectedRow.from);
    },
    emitSet: function(val) {
      if(!val)
        return;

      let set;

      if(!this.customTo)
        set = val;
      else {
        set = Vue.util.extend({}, val);
        set.to = moment.utc(this.customTo, 'YYYY-MM-DD HH:mm').format();
        set.from = moment.utc(this.customFrom, 'YYYY-MM-DD HH:mm').format();
      }

      this.$emit('dataset', set);
    }
  },
  watch: {
    selectedRows: function(row) {
        if(row && row.length) {
          this.selectedRow = Vue.util.extend({}, this.selectedRows[0]);
          this.selectedRow.from = this.selectedRow.from.toDate();
          this.selectedRow.to = this.selectedRow.to.toDate();
          this.minSelectableRange = this.selectedRow.from;
          this.maxSelectableRange = this.selectedRow.to;
          this.updateCustomRange();
          this.emitSet(this.selectedRow[0]);
        }
    },

    customTo: function() { this.emitSet(this.selectedRow); },
    customFrom: function() { this.emitSet(this.selectedRow); }
  }
}
</script>
