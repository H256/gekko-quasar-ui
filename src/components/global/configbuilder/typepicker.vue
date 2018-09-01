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
      />
    </div>
  </div>
</template>

<script>
export default {
  created: function() {
    this.types = [
      { label: "Paper trader", value: 0, color: "blue" },
      { label: "Market watcher", value: 1, color: "green" },
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
      this.$emit("type", this.type);
    }
  },
  watch: {
    type: function() {
      this.emitType();
    }
  },
  computed: {
    type: function() {
      return this.types[this.selectedTypeIndex];
    }
  }
};
</script>
