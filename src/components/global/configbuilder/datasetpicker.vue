<template>
  <div>
    <div class="text-h5 q-mb-md">Select a dataset {{selectedText}}</div>
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
          <q-input
            debounce="300"
            hide-underline
            color="secondary"
            v-model="dsFilter"
            class="col-6"
          >
            <template v-slot:append>
              <q-icon name="search"/>
            </template>
          </q-input>
        </template>
      </q-table>
      <div class="text-center q-pa-sm" v-if="datasets.length">
        <q-btn
          class="q-ma-xs"
          color="primary"
          icon="av_timer"
          @click.prevent="openRange"
          :disabled="!this.selectedRow || this.selectedRow.length === 0">Adjust range
        </q-btn>
        <q-btn class="q-ma-xs" color="amber" icon="refresh" @click.prevent="scan">reload datasets</q-btn>
      </div>
      <div class="row" v-if="rangeVisible">
        <p class="caption">Here you can adjust the range of the dataset.</p>
      </div>
      <div class="row q-col-gutter-md" v-if="rangeVisible">
        <div class="col-6">
          <q-input filled dense v-model="customFrom" label="From" hint="Pick a start date and time">
            <template v-slot:prepend>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy transition-show="scale" transition-hide="scale">
                  <q-date v-model="customFrom" mask="YYYY-MM-DD HH:mm"/>
                </q-popup-proxy>
              </q-icon>
            </template>
            <template v-slot:append>
              <q-icon name="access_time" class="cursor-pointer">
                <q-popup-proxy transition-show="scale" transition-hide="scale">
                  <q-time v-model="customFrom" mask="YYYY-MM-DD HH:mm" format24h/>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>
        <div class="col-6">
          <q-input filled dense v-model="customTo" label="To" hint="Pick an end date and time">
            <template v-slot:prepend>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy transition-show="scale" transition-hide="scale">
                  <q-date v-model="customTo" mask="YYYY-MM-DD HH:mm"/>
                </q-popup-proxy>
              </q-icon>
            </template>
            <template v-slot:append>
              <q-icon name="access_time" class="cursor-pointer">
                <q-popup-proxy transition-show="scale" transition-hide="scale">
                  <q-time v-model="customTo" mask="YYYY-MM-DD HH:mm" format24h/>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>
      </div>
      <div v-if="!datasets.length">
        <em>No Data found
          <router-link to="data/importer">Lets add some</router-link>
        </em>
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
    mixins: [dataset],
    computed: {
      isScanning() {
        return this.datasetScanstate === 'scanning';
      },
      selectedText() {
        if (this.selectedRow) {
          return `(current: ${this.selectedRow.currency} - ${this.selectedRow.asset})`
        }
        return ""
      }
    },
    mounted: function () {
      this.scan();
    },
    methods: {
      fmt: mom => moment(mom).utc().format('YYYY-MM-DD HH:mm'),
      openRange: function () {
        this.updateCustomRange();
        this.rangeVisible = true;
      },
      updateCustomRange: function () {
        this.customTo = this.fmt(this.selectedRow.to);
        this.customFrom = this.fmt(this.selectedRow.from);
      },
      emitSet: function (val) {
        if (!val)
          return;

        let set;

        if (!this.customTo)
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
      selectedRows: function (row) {
        if (row && row.length) {
          this.selectedRow = Vue.util.extend({}, this.selectedRows[0]);
          this.selectedRow.from = this.selectedRow.from.toDate();
          this.selectedRow.to = this.selectedRow.to.toDate();
          this.minSelectableRange = this.selectedRow.from;
          this.maxSelectableRange = this.selectedRow.to;
          this.updateCustomRange();
          this.emitSet(this.selectedRow[0]);
        }
      },

      customTo: function () {
        this.emitSet(this.selectedRow);
      },
      customFrom: function () {
        this.emitSet(this.selectedRow);
      }
    }
  }
</script>
