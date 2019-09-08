<template>
  <q-card class="q-ma-sm">
    <q-card-section class="bg-blue-grey-8 text-white">
      <div class="text-h6">Daterange</div>
    </q-card-section>
    <q-separator/>
    <q-card-section>
      <q-input filled dense v-model="from" label="From" hint="Pick a start date and time">
        <template v-slot:prepend>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy transition-show="scale" transition-hide="scale">
              <q-date v-model="from" mask="YYYY-MM-DD HH:mm" />
            </q-popup-proxy>
          </q-icon>
        </template>
        <template v-slot:append>
          <q-icon name="access_time" class="cursor-pointer">
            <q-popup-proxy transition-show="scale" transition-hide="scale">
              <q-time v-model="from" mask="YYYY-MM-DD HH:mm" format24h />
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
    </q-card-section>
    <q-separator></q-separator>
    <q-card-section>
        <q-input filled dense v-model="to" label="To" hint="Pick an end date and time">
          <template v-slot:prepend>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy transition-show="scale" transition-hide="scale">
                <q-date v-model="to" mask="YYYY-MM-DD HH:mm" />
              </q-popup-proxy>
            </q-icon>
          </template>
          <template v-slot:append>
            <q-icon name="access_time" class="cursor-pointer">
              <q-popup-proxy transition-show="scale" transition-hide="scale">
                <q-time v-model="to" mask="YYYY-MM-DD HH:mm" format24h />
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
    </q-card-section>
  </q-card>
</template>

<script>
  import moment from 'moment'

  export default {
    data: function () {
      return {
        from: '',
        to: ''
      }
    },
    created: function () {
      let now = moment().startOf('minute');
      let then = now.clone().subtract(3, 'months');

      this.to = this.fmt(now);
      this.from = this.fmt(then);
      this.emitRange();
    },
    methods: {
      fmtTs: (mom) => moment.unix(mom).utc(),
      fmt: (mom) => mom.utc().format('YYYY-MM-DD HH:mm'),
      emitRange: function () {
        this.$emit('range', {
          from: this.fmtTs(this.from),
          to: this.fmtTs(this.to)
        });
      },
      emitManualEntry: function () {
        if (this.from.length < '4' || this.from.length < '4')
          return this.$emit('range', {})

        let from = moment.utc(this.from);
        let to = moment.utc(this.to);

        if (from.isValid() && to.isValid()) {
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
      from: function () {
        this.emitManualEntry();
      },
      to: function () {
        this.emitManualEntry();
      },
      config: function () {
        this.scanned = false;
      },
      tab: function () {
        this.scanned = false;
        this.$emit('range', {})
      },
      selectedRangeIndex: function () {
        let selectedRange = this.ranges[this.selectedRangeIndex];
        if (selectedRange)
          this.emitRange(selectedRange);
      }
    }
  }
</script>
