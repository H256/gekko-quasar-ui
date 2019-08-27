<template>
  <q-page padding>
    <div v-if='data && !data.done'>
      <div class="text-h4 q-mb-md">Importing data</div>
      <div class="row">
        <div class="col-2">
          <strong>Market:</strong>
        </div>
        <div class="col-10">{{data.watch.exchange}}</div>
      </div>
      <div class="row">
        <div class="col-2">
          <strong>Currency/Asset:</strong>
        </div>
        <div class="col-10">{{data.watch.currency}}/{{data.watch.asset}}</div>
      </div>
      <div class="row">
        <div class="col-2">
          <strong>From:</strong>
        </div>
        <div class="col-10">{{fmt(from)}}</div>
      </div>
      <div class="row">
        <div class="col-2">
          <strong>To:</strong>
        </div>
        <div class="col-10">{{fmt(to)}}</div>
      </div>
      <div class="row" v-if="initialized">
        <div class="col-2">
          <strong>Remaining:</strong>
        </div>
        <div class="col-10">{{fromEnd}}</div>
      </div>
      <div v-else class="row justify-center">
        <q-spinner-dots color="secondary" :size="66"></q-spinner-dots>
      </div>
      <div class="row justify-center q-pa-sm" v-if="data && !data.done && progress">
        <p class="text-h4">{{progress}} %</p>
        <q-linear-progress
          rounded
          style="height: 20px"
          :value="progress/100"
          :color="colorString"
          stripe
          animate
          height="24px"
        >
        </q-linear-progress>
      </div>
      <div class="row q-pa-xs">
        <p>
          <em> you don't have to wait until the import is done, you can already start
            <router-link to="/backtest">backtesting</router-link>
            .
          </em>
        </p>
      </div>
    </div>
    <div v-if="data && data.done">
      <h4>Import done!</h4>
      <p>The import
        for <strong>{{data.watch.exchange}}: {{data.watch.currency}}-{{data.watch.asset}}</strong>
        is complete! <br>
        Go and
        <router-link to="/backtest">backtest</router-link>
        with your new data!
      </p>
    </div>
    <div v-if="!data">
      <h3 class="text-negative">ERROR: Unknown import</h3>
      <p>The import could not be found!</p>
    </div>
  </q-page>
</template>

<script>
  import humanizeDuration from 'humanize-duration'
  import moment from 'moment'
  import _ from 'lodash';

  export default {
    computed: {
      colorString: function () {
        let p = this.progress;
        if (p < 25) {
          return 'negative';
        } else if (p >= 25 && p < 95) {
          return 'warning';
        } else {
          return 'positive';
        }
      },
      data: function () {
        return _.find(
          this.$store.state.imports.imports,
          {id: this.$route.params.id}
        );
      },
      done: function () {
        let o = _.find(
          this.$store.state.imports.imports,
          {id: this.$route.params.id}
        );
        return o.done;
      },
      initialized: function () {
        if (this.data && this.latest.isValid())
          return true
      },
      latest: function () {
        if (this.data)
          return this.mom(this.data.latest);
      },
      fromEndMs: function () {
        if (this.data)
          return this.to.diff(this.latest);
      },
      fromEnd: function () {
        if (!this.latest)
          return 'LOADING'

        return humanizeDuration(this.fromEndMs);
      },
      from: function () {
        if (this.data)
          return this.mom(this.data.from)
      },
      to: function () {
        if (this.data)
          return this.mom(this.data.to)
      },
      timespan: function () {
        if (this.data)
          return this.to.diff(this.from)
      },
      progress: function () {
        if (!this.data)
          return;
        if (this.data.done)
          return (100).toFixed(2);

        const current = this.timespan - this.fromEndMs;
        let val = +(100 * current / this.timespan).toFixed(2);
        return val ? val : false;
      }
    },
    methods: {
      fmt: mom => {
        return mom.format('YYYY-MM-DD HH:mm:ss')
      },
      mom: str => moment.utc(str)
    }
  }
</script>
