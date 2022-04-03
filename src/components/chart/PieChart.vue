<template>
  <apexchart type="pie" :options="options" :series="series"></apexchart>
</template>

<script>
import VueApexCharts from 'vue-apexcharts'
export default {
  name: 'pieChart',
  components: {
    apexchart: VueApexCharts
  },
  props: {
    config: {
      name: null,
      indexDimensions: [],
      amountDimensions: [],
      records: []
    }
  },
  data () {
    return {
      options: {},
      series: []
    }
  },
  mounted () {
    const vm = this
    const labels = []
    const values = []
    vm.config.records.forEach(item => {
      for (var i = 0; i < vm.config.indexDimensions.length; i++) {
        var idx = vm.config.indexDimensions[i].code
        labels.push(item[idx])
      }
      for (var j = 0; j < vm.config.amountDimensions.length; j++) {
        var amount = vm.config.amountDimensions[j]
        if (isNaN(item[amount.code])) {
          vm.$q.notify({
            position: 'top',
            message: '统计数据必须为数字',
            color: 'negative'
          })
          return
        }
        values.push(parseInt(item[amount.code]))
      }
    })
    vm.options = {
      chart: {
        toolbar: {
          show: false
        }
      },
      title: {
        text: vm.config.name,
        align: 'right'
      },
      labels: labels
    }
    vm.series = values
  }
}
</script>
