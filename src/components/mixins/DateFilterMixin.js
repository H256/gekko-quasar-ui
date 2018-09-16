import moment from 'moment'
import humanizeDuration from 'humanize-duration'

export default {
  filters: {
    formatDate: function (date) {
      if (date === '') return ''
      return moment.utc(date).format('YYYY-MM-DD HH:mm');
    },
    formatFromUnix: function (date) {
      if (date === '') return ''
      // try to parse date - if not int, then it's possibly a utc date
      // sometime it parses to a year-number
      if (parseInt(date).toString() === 'NaN' || parseInt(date) < 10000) {
        return moment.utc(date).format('YYYY-MM-DD HH:mm');
      }
      else {
        return moment.unix(date).utc().format('YYYY-MM-DD HH:mm');
      }
    },
    humanizeMoment: function (duration) {
      return moment.duration(duration).humanize();
    },
    durationHumanized: function (duration) {
      return humanizeDuration(duration, {largest: 4});
    },
    timespan: function (tsA, tsB) {
      return humanizeDuration(moment(tsA).diff(moment(tsB)));
    }
  }
}
