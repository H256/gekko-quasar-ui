<template>
  <div class="group">
    <h4>Type</h4>
    <p>What do you want to do with gekko?</p>
    <div class="row">
      <q-option-group
        color="tertiary"
        type="radio"
        v-model="selectedTypeIndex"
        :options="types"
        @input="emitType"
      />
    </div>
  </div>
</template>

<script>
  import _ from 'lodash';
export default {
  created: function() {
    this.types = [
      { label: "Market watcher", value: 0, color: "green" },
      { label: "Paper trader", value: 1, color: "blue" },
      { label: "Tradebot", value: 2, color: "red" }
    ];
    this.emitType();
  },
  data: function() {
    return {
      selectedTypeIndex: 0,
      types: [],
      radio: 1
    };
  },
  methods: {
    emitType: function() {
      this.$emit("type", this.type.value);
    }
  },
  watch: {
    type: function() {
      this.emitType();
    }
  },
  computed: {
    type: function() {
      let idx = _.indexOf(this.types, {val: this.selectedTypeIndex});
      return this.types[idx === -1 ? 0 : idx];
    }
  }
};
</script>
