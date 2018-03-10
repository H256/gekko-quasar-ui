<template>
  <div>
    <h3>Roundtrips</h3>
    <q-table 
      :columns="tblColumns"
      row-key="id"
      :data="roundtrips"
      :pagination="{rowsPerPage: 0}"
      color="primary"
      separator="horizontal"
      hide-bottom
        >
        <q-td slot="body-cell-pAndL" slot-scope="props" :props="props">
            <b v-if="Math.sign(props.value)===-1" class="text-negative">{{Math.sign(props.value)*props.value}}</b>
            <b v-else class="text-positive">{{props.value}}</b>
        </q-td>
        <q-td slot="body-cell-pAndLPercent" slot-scope="props" :props="props">
           <p v-if="Math.sign(props.value)===-1" class="text-negative"><b>{{props.value}} %</b><q-icon name="arrow downward" color="negative" size="1.2em" /></p>
           <p v-else class="text-positive"><b>{{props.value}} %</b><q-icon name="arrow upward" color="positive" size="1.2em" /></p>
        </q-td>
    </q-table>
    <div class="text-center" v-if="!roundtrips.length"><p class="q-title">Not enough data to display!</p></div>
  </div>
</template>

<script>
import moment from 'moment'
import humanizeDuration from 'humanize-duration'
export default {
  props: ['roundtrips'],
  data: () => {
    return {
      tblColumns:[
        {
          name: 'entryAt',
          label: 'Entry at (UTC)',
          field: rt => moment.utc(rt.entryAt).format('YYYY-MM-DD HH:mm'),
          sortable: false
        },
        {
          name: 'exitAt',
          label: 'Exit at (UTC)',
          field: rt => moment.utc(rt.exitAt).format('YYYY-MM-DD HH:mm'),
          sortable: false
        },
        {
          name: 'exposure',
          label: 'Exposure',
          field: rt => moment.duration(rt.duration).humanize(),
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
          field: rt => rt.pnl.toFixed(2),
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
  }
}
</script>
