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
          <q-td key="currency" :props="props">
            {{props.row.watch.currency}}
          </q-td>
          <q-td key="asset" :props="props">
            {{props.row.watch.asset}}
          </q-td>
          <q-td key="startedat" :props="props">
            {{props.row.firstCandle ?  fmt(props.row.firstCandle.start) : ''}}
          </q-td>
          <q-td key="lastupdate" :props="props">
            {{props.row.lastCandle ? fmt(props.row.lastCandle.start): ''}}
          </q-td>
          <q-td key="duration" :props="props">
            {{props.row.firstCandle && props.row.lastCandle ?  timespan(props.row.lastCandle.start, props.row.firstCandle.start) : ''}}
          </q-td>
          <q-td key="actions" :props="props">
            <q-btn size="sm" color="secondary" @click="$router.push(`live-gekkos/watcher/${props.row.id}`)" icon="visibility" label="view" />
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
        <q-tr slot="body" slot-scope="props" :props="props">
          <q-td key="exchange" :props="props">
            {{props.row.watch.exchange}}
          </q-td>
          <q-td key="currency" :props="props">
            {{props.row.watch.currency}}
          </q-td>
          <q-td key="asset" :props="props">
            {{props.row.watch.asset}}
          </q-td>
          <q-td key="lastupdate" :props="props">
            {{props.row.lastCandle ? fmt(props.row.lastCandle.start): ''}}
          </q-td>
          <q-td key="duration" :props="props">
            {{props.row.firstCandle && props.row.lastCandle ?  timespan(props.row.lastCandle.start, props.row.firstCandle.start) : ''}}
          </q-td>
          <q-td key="strategy" :props="props">
            {{props.row.strat ? props.row.strat.name : ''}}
          </q-td>
          <q-td key="profit" :props="props">{ {props.row.report ? round(props.row.report.profit) : 0 }} {{ props.row.watch.curreny }}</q-td>
          <q-td key="actions" :props="props">
            <q-btn size="sm" color="secondary" @click="$router.push(`live-gekkos/stratrunner/${props.row.id}`)" icon="visibility" label="view" />
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

export default {
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
          name: "currency",
          label: "Currency"
        },
        {
          name: "asset",
          label: "Asset"
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
          name: "actions",
          label: "Actions"
        },
      ],
      stratColumns: [
        {
          name: "exchange",
          label: "Exchange"
        },
        {
          name: "currency",
          label: "Currency"
        },
        {
          name: "asset",
          label: "Asset"
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
          name: "profit",
          label: "Profit"
        }
      ]
    };
  },
  created: function() {
    this.timer = setInterval(() => {
      this.now = moment();
    }, 1000);
  },
  destroyed: function() {
    clearTimeout(this.timer);
  },
  computed: {
    stratrunners: function() {
      return this.$store.state.stratrunners.stratrunners;
    },
    watchers: function() {
      return this.$store.state.watchers.watchers;
    }
  },
  methods: {
    humanizeDuration: n => humanizeDuration(n),
    moment: mom => moment.utc(mom),
    fmt: mom => moment.utc(mom).format("YYYY-MM-DD HH:mm"),
    round: n => (+n).toFixed(3),
    timespan: function(a, b) {
      return this.humanizeDuration(this.moment(a).diff(this.moment(b)));
    }
  }
};
</script>