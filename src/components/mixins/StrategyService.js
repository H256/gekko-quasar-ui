import { restPath } from "../../tools/api";
import _ from "lodash";

export default {
  data: function() {
    return {
      strategies: []
    };
  },
  computed: {
    strategiesForList: function() {
      return _.map(this.strategies, function(item) {
        return { value: item.name, label: item.name };
      });
    }
  },
  methods: {
    getStrategies() {
      this.$axios
        .get(restPath + "strategies")
        .then(response => {
          this.strategies = response.data;

          _.each(this.strategies, function(s) {
            s.empty = s.params === "";
          });

          this.rawStratParams = _.find(this.strategies, {
            name: this.strategy
          }).params;
          this.emptyStrat = _.find(this.strategies, {
            name: this.strategy
          }).empty;
          this.emitConfig();
        })
        .catch(error => {
          this.$q.notify({
            type: "negative",
            message: "Error getting strategies from server."
          });
        });
    }
  }
};
