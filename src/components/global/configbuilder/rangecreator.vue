<template>
  <q-card inline style="width:250px" class="q-ma-sm">
    <q-card-title>
      Daterange
    </q-card-title>
    <q-card-main>
      <q-field
        label="From"
        helper="Pick a start date and time"
        :label-width="3"
      >
        <q-datetime type="datetime" class="no-margin" v-model="from"></q-datetime>
      </q-field>
    </q-card-main>
    <q-card-separator></q-card-separator>
    <q-card-main>
      <q-field
        label="To"
        helper="Pick an end date and time"
        :label-width="3"
      >
        <q-datetime type="datetime" class="no-margin" v-model="to"></q-datetime>
      </q-field>
    </q-card-main>
  </q-card>
</template>

<script>
import moment from 'moment'

export default {
  data: function() {
    return {
      from: '',
      to: ''
    }
  },
  created: function() {
    let now = moment().startOf('minute');
    let then = now.clone().subtract(3, 'months');

    this.to = this.fmt(now);
    this.from = this.fmt(then);
    this.emitRange();
  },
  methods: {
    fmtTs: (mom) => moment.unix(mom).utc(),
    fmt: (mom) => mom.utc().format('YYYY-MM-DD HH:mm'),
    emitRange: function() {
      this.$emit('range', {
        from: this.fmtTs(this.from),
        to: this.fmtTs(this.to)
      });
    },
    emitManualEntry: function() {
      if(this.from.length < '4' || this.from.length < '4')
        return this.$emit('range', {})

      let from = moment.utc(this.from);
      let to = moment.utc(this.to);

      if(from.isValid() && to.isValid()) {
        this.$emit('range', {
          from: this.fmt(from),
          to: this.fmt(to)
        })
      } else {
        this.$emit('range', {})
      }
    }
  },
  watch: {
    from: function() {
      this.emitManualEntry();
    },
    to: function() {
      this.emitManualEntry();
    },
    config: function() {
      this.scanned = false;
    },
    tab: function() {
      this.scanned = false;
      this.$emit('range', {})
    },
    selectedRangeIndex: function() {
      let selectedRange = this.ranges[this.selectedRangeIndex];
      if(selectedRange)
        this.emitRange(selectedRange);
    }
  }
}
</script>
