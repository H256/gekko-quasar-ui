import {restPath} from '../../tools/api'
import moment from 'moment'
import humanizeDuration from 'humanize-duration'

var mixin = {
  data: () => {
    return {
      datasets: [],
      datasetScanstate: 'idle',
      unscannableMakets: [],
      tblColumns:[
        {
          name: 'exchange',
          label: 'Exchange',
          field: 'exchange',
          sortable: true
        },
        {
          name: 'currency',
          label: 'Currency',
          field: 'currency',
          sortable: true
        },
        {
          name: 'asset',
          label: 'Asset',
          field: 'asset',
          sortable: true
        },
        {
          name: 'from',
          label: 'From',
          field: row => moment.utc(row.from).format('YYYY-MM-DD hh:mm'),
          sortable: true
        },
        {
          name: 'to',
          label: 'To',
          field: row => moment.utc(row.to).format('YYYY-MM-DD hh:mm'),
          sortable: true
        },
        {
          name: 'duration',
          label: 'Duration',
          field: row => humanizeDuration(row.to.diff(row.from)),
          sortable: false
        },
      ]
    }    
  },
  methods: {
    scan: function() {
      this.datasetScanstate = 'scanning';

      this.$axios.post(restPath + 'scansets', {})
      .then(r => {
        let response = r.data;
        this.datasetScanstate = 'scanned';

        this.unscannableMakets = response.errors;

        let sets = [];

        response.datasets.forEach(market => {
          market.ranges.forEach((range, i) => {
            sets.push({
              exchange: market.exchange,
              currency: market.currency,
              asset: market.asset,
              from: moment.unix(range.from).utc(),
              to: moment.unix(range.to).utc(),
              id: market.exchange + market.asset + market.currency + i
            });
          });
        });

        // for now, filter out sets smaller than 3 hours..
        sets = sets.filter(set => {
          if(set.to.diff(set.from, 'hours') > 2)
            return true;
        });

        sets = sets.sort((a, b) => {
          let adiff = a.to.diff(a.from);
          let bdiff = b.to.diff(b.from);

          if(adiff < bdiff)
            return -1;

          if(adiff > bdiff)
            return 1;

          return 0;
        }).reverse();

        this.datasets = sets;
      })
      .catch(error=> {
        this.$q.notify({
          type: 'negative',
          message: 'Error getting scan data from API'
        })
      });
    }
  }
}

export default mixin;