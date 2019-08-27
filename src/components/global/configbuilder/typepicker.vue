<template>
  <div class="group">
    <div class="row">
      <p>What type of gekko do you want?</p>
    </div>
    <div class="row">
      <q-option-group
        color="accent"
        type="radio"
        inline
        v-model="selectedTypeIndex"
        :options="types"
      ></q-option-group>
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
