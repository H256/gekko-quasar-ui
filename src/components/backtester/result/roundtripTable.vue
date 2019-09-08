<template>
  <div>
    <h4>Roundtrips</h4>
    <div class="row" v-if="roundtrips && roundtrips.length">
      <div class="col">Percent Wins: <b>{{getPercentWinning().toFixed(2)}} %</b></div>
      <div class="col">Best Win: <b class="text-positive">{{getMostLeastProfitable().toFixed(2)}} %</b></div>
      <div class="col">Worst Loss: <b class="text-negative">{{getMostLeastProfitable(true).toFixed(2)}} %</b></div>
    </div>
    <div class="row q-mb-md" v-if="roundtrips && roundtrips.length">
      <div class="col">Profit/Loss: <b>{{(getSum() + getSum(true)).toFixed(8)}} {{currency}}</b></div>
      <div class="col">Sum profits: <b class="text-positive">{{getSum().toFixed(8)}} {{currency}}</b></div>
      <div class="col">Sum losses: <b class="text-negative"> {{getSum(true).toFixed(8)}} {{currency}}</b></div>
    </div>

    <q-table
      :columns="tblColumns"
      row-key="id"
      :data="roundtrips"
      :pagination="{rowsPerPage: 0}"
      color="primary"
      separator="horizontal"
      no-data-label="Not enough data to display."
        >
        <q-td slot="body-cell-pAndL" slot-scope="props" :props="props">
            <b v-if="Math.sign(props.value)===-1" class="text-negative">{{Math.sign(props.value)*props.value}} {{currency}}</b>
            <b v-else class="text-positive">{{props.value}} {{currency}}</b>
        </q-td>
        <q-td slot="body-cell-pAndLPercent" slot-scope="props" :props="props">
           <p v-if="Math.sign(props.value)===-1" class="text-negative"><b>{{props.value}} %</b><q-icon name="arrow downward" color="negative" size="1.2em" /></p>
           <p v-else class="text-positive"><b>{{props.value}} %</b><q-icon name="arrow upward" color="positive" size="1.2em" /></p>
        </q-td>
    </q-table>
    <!--<div class="text-center" v-if="!roundtrips.length"><p class="text-h6">Not enough data to display!</p></div>-->
  </div>
</template>

<script>
import DateFilters from '../../mixins/DateFilterMixin'
import _ from 'lodash'

export default {
  props: ['roundtrips', 'currency', 'asset'],
  mixins:[DateFilters],
  data: function() {
    return {}
    },
  computed: {
    tblColumns: function() {
      return [
        {
          name: 'entryAt',
          label: 'Entry at (UTC)',
          field: rt => this.$options.filters.formatFromUnix(rt.entryAt), //moment.utc(rt.entryAt).format('YYYY-MM-DD HH:mm'),
          sortable: false
        },
        {
          name: 'exitAt',
          label: 'Exit at (UTC)',
          field: rt => this.$options.filters.formatFromUnix(rt.exitAt),
          sortable: false
        },
        {
          name: 'exposure',
          label: 'Exposure',
          field: rt => this.$options.filters.humanizeMoment(rt.duration),
          sortable: false
        },
        {
          name: 'entryBalance',
          label: 'Entry balance',
          field: rt => (+rt.entryBalance).toFixed(3),
          sortable: false
        },
        {
          name: 'exitBalance',
          label: 'Exit balance',
          field: rt => (+rt.exitBalance).toFixed(3),
          sortable: false
        },
        {
          name: 'pAndL',
          label: 'P&L',
          field: rt => rt.pnl.toFixed(8),
          sortable: false
        },
        {
          name: 'pAndLPercent',
          label: '%',
          field: rt => rt.profit.toFixed(2),
          sortable: false
        }
      ]
    }
  },
  methods: {
    getMostLeastProfitable(least){
      if(this.roundtrips && this.roundtrips.length){
        let pVal = 0;
        if(least) {
          pVal = _.get(_.minBy(this.roundtrips, 'profit'), 'profit');
          if (pVal > 0) return 0;
        } else {
          pVal = _.get(_.maxBy(this.roundtrips, 'profit'),'profit');
          if(pVal < 0) return 0;
        }
        return pVal;
      }
      return 0
    },
    getPercentWinning(){
      let win = 0;
      if(this.roundtrips && this.roundtrips.length){
        _.each(this.roundtrips, function(item){
          if(item.profit > 0) win++;
        });
        return (100 * win / this.roundtrips.length);
      }
      return 0
    },
    getSum(losses){
      if(this.roundtrips && this.roundtrips.length) {
        return losses === true ? _.sumBy(this.roundtrips, o => o.profit < 0 ? o.pnl : 0) : _.sumBy(this.roundtrips, o => o.profit > 0 ? o.pnl : 0);
      }
      return 0;
    }
  }
}
</script>
