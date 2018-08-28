import moment from 'moment'
import humanizeDuration from 'humanize-duration'
export default {
  filters: {
    formatDate: function(date){
      if(date === '') return ''
      return moment.utc(date).format('YYYY-MM-DD HH:mm');
    },
    formatFromUnix: function(date){
      if(date === '') return ''
      return moment.unix(date).utc().format('YYYY-MM-DD HH:mm');
    },
    humanizeMoment: function(duration) {
      return moment.duration(duration).humanize();
    },
    durationHumanized: function(duration){
      return humanizeDuration(duration, {largest: 4});
    },
    timespan: function(tsA, tsB) {
        return humanizeDuration(moment(a).diff(moment(b)));
    }
  }
}
