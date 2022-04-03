<template>
  <apexchart type="line" :options="options" :series="series"></apexchart>
</template>

<script>
import VueApexCharts from 'vue-apexcharts'
export default {
  name: 'mixChart',
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
    const indices = []
    const values = {}
    const yaxis = []
    vm.config.amountDimensions.forEach(amount => {
      let yaxisOpt = {
        axisTicks: {
          show: true
        },
        axisBorder: {
          show: true
        },
        title: {
          text: amount.name
        },
        tooltip: {
          enabled: true
        }
      }
      if (amount.anchor) {
        yaxisOpt = Object.assign(yaxisOpt, {
          opposite: true,
          seriesName: amount.anchor
        })
      }
      yaxis.push(yaxisOpt)
    })
    vm.config.records.forEach(item => {
      for (var i = 0; i < vm.config.indexDimensions.length; i++) {
        var idx = vm.config.indexDimensions[i].code
        if (indices.indexOf(item[idx]) < 0) {
          indices.push(item[idx])
        }
      }
      for (var j = 0; j < vm.config.amountDimensions.length; j++) {
        var amount = vm.config.amountDimensions[j]
        if (!values[amount.code]) {
          values[amount.code] = {
            type: amount.graph,
            data: []
          }
          // current = item[amount.code]
        }
        values[amount.code].data.push(parseFloat(item[amount.code]))
      }
    })
    vm.options = {
      chart: {
        toolbar: {
          show: false
        }
      },
      dataLabels: {
        enabled: true
      },
      title: {
        text: vm.config.name,
        align: 'right'
      },
      legend: {
        position: 'top',
        horizontalAlign: 'left',
        offsetX: 40
      },
      xaxis: {
        categories: indices
      },
      yaxis: yaxis
    }
    const array = []
    for (var key in values) {
      array.push({
        name: key,
        type: values[key].type,
        data: values[key].data
      })
    }
    vm.series = array
  }
}
</script>
