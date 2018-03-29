<template>
  <div>
    <div>
      <h2>Live Gekko</h2>
      <p>Run your strategy against a live market!</p>
    </div>
    <div>
      <h3>Market watchers</h3>
      <p v-if="!watchers.length">You are currently not watching any markets.</p>
      <q-table v-if="watchers.length"
               :columns="watchColumns"
               row-key="id"
               :data="watchers"
               :pagination="{rowsPerPage: 0}"
               color="primary"
               separator="horizontal"
               hide-bottom
      >
        <q-tr slot="body" slot-scope="props" :props="props">
          <q-td key="exchange" :props="props">
            {{props.row.watch.exchange}}
          </q-td>
          <q-td key="pair" :props="props">
            {{props.row.watch.currency}} - {{props.row.watch.asset}}
          </q-td>
          <q-td key="startedat" :props="props">
            {{props.row.firstCandle ? props.row.firstCandle.start : '' | formatDate}}
          </q-td>
          <q-td key="lastupdate" :props="props">
            {{props.row.lastCandle ? props.row.lastCandle.start : '' | formatDate}}
          </q-td>
          <q-td key="duration" :props="props">
            {{props.row.firstCandle && props.row.lastCandle ? timespan(props.row.lastCandle.start,
            props.row.firstCandle.start) : ''}}
          </q-td>
          <q-td key="price" :props="props">
            {{props.row.lastCandle ? props.row.lastCandle.close + ' ' + props.row.watch.currency : ''}}
          </q-td>
          <q-td key="actions" :props="props">
            <q-btn size="sm" color="secondary" @click="$router.push(`live-gekkos/watcher/${props.row.id}`)"
                   icon="visibility" label="view"/>
          </q-td>
        </q-tr>
      </q-table>
    </div>
    <div>
      <h3>Strategy Runners</h3>
      <p v-if="!stratrunners.length">You are currently not running any strategies.</p>
      <q-table v-if="stratrunners.length"
               :columns="stratColumns"
               row-key="id"
               :data="stratrunners"
               :pagination="{rowsPerPage: 0}"
               color="primary"
               separator="horizontal"
               hide-bottom
      >
        <q-tr slot="body" slot-scope="props" :props="props"
              :class="{'bg-green-11': (props.row.report && props.row.report.profit > 0), 'bg-red-11': (props.row.report && props.row.report.profit < 0)}">
          <q-td key="exchange" :props="props">
            {{props.row.watch.exchange}}
          </q-td>
          <q-td key="pair" :props="props">
            {{props.row.watch.currency}} - {{props.row.watch.asset}}
          </q-td>
          <q-td key="lastupdate" :props="props">
            {{props.row.lastCandle ? props.row.lastCandle.start : '' | formatDate}}
          </q-td>
          <q-td key="duration" :props="props">
            {{props.row.firstCandle && props.row.lastCandle ? timespan(props.row.lastCandle.start,
            props.row.firstCandle.start) : ''}}
          </q-td>
          <q-td key="strategy" :props="props">
            {{props.row.strat ? props.row.strat.name : ''}}
          </q-td>
          <q-td key="trades_rt" :props="props">
            {{(props.row.trades.length || 0) + ' / ' + (props.row.roundtrips.length || 0)}}
          </q-td>
          <q-td key="success" :props="props">
            {{props.row.roundtrips ? successRate(props.row.roundtrips) : '0.00 %'}}
          </q-td>
          <q-td
            key="profit" :props="props">{{props.row.report ? round(props.row.report.profit) : 'N/A' }}
            {{ props.row.report ? props.row.watch.currency : ''}}
          </q-td>
          <q-td class="bg-white" key="actions" :props="props">
            <q-btn size="sm" color="secondary" @click="$router.push(`live-gekkos/stratrunner/${props.row.id}`)"
                   icon="visibility" label="view"/>
          </q-td>
        </q-tr>
      </q-table>
    </div>
    <div>
      <h2>Start a new live Gekko</h2>
      <q-btn color="amber-8" @click.prevent="$router.push('/live-gekkos/new')">Start a new live Gekko!</q-btn>
    </div>
  </div>
</template>

<script>
  import moment from "moment";
  import humanizeDuration from "humanize-duration";
  import DateFilters from '../mixins/DateFilterMixin'

  export default {
    mixins: [DateFilters],
    data: () => {
      return {
        timer: false,
        now: moment(),
        watchColumns: [
          {
            name: "exchange",
            label: "Exchange"
          },
          {
            name: "pair",
            label: "Pair"
          },
          {
            name: "startedat",
            label: "Started at"
          },
          {
            name: "lastupdate",
            label: "Last update"
          },
          {
            name: "duration",
            label: "Duration"
          },
          {
            name: "price",
            label: "Price"
          },
          {
            name: "actions",
            label: "Actions"
          }
        ],
        stratColumns: [
          {
            name: "exchange",
            label: "Exchange"
          },
          {
            name: "pair",
            label: "Pair"
          },
          {
            name: "lastupdate",
            label: "Last update"
          },
          {
            name: "duration",
            label: "Duration"
          },
          {
            name: "strategy",
            label: "Strategy"
          },
          {
            name: "trades_rt",
            label: "Trades/RT"
          },
          {
            name: "success",
            label: "Successful"
          },
          {
            name: "profit",
            label: "Profit"
          },
          {
            name: "actions",
            label: "Actions"
          }
        ]
      };
    },
    created: function () {
      this.timer = setInterval(() => {
        this.now = moment();
      }, 1000);
    },
    destroyed: function () {
      clearTimeout(this.timer);
    },
    computed: {
      stratrunners: function () {
        return this.$store.state.stratrunners.stratrunners;
      },
      watchers: function () {
        return this.$store.state.watchers.watchers;
      }
    },
    methods: {
      moment: mom => moment.utc(mom),
      round: n => (+n).toFixed(3),
      timespan: function (a, b) {
        return humanizeDuration(this.moment(a).diff(this.moment(b)));
      },
      successRate: rt => {
        if (!rt || !rt.length) return (0).toFixed(2) + " %"

        let successful = rt.filter(function (item) {
          return item.pnl > 0
        })
        return ((+successful.length / rt.length) * 100).toFixed(2) + " %"
      }
    }
  };
</script>
