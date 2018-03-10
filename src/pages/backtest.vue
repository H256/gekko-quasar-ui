<template>
  <q-page padding>
    <backtester></backtester>
  </q-page>
</template>

<script>
import Backtester from '../components/backtester/backtester'
export default {
   name: 'BacktesterPage',
   components: {
     Backtester
   }
}
</script>

<style>
</style>
