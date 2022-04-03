<template>
  <apexchart type="line" :options="options" :series="series"></apexchart>
</template>

<script>
import VueApexCharts from 'vue-apexcharts'
export default {
  name: 'mixLineColumnChart',
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
    // var current
    let xaxisText = ''
    const yaxis = []
    vm.config.indexDimensions.forEach(idx => {
      xaxisText = idx.name
    })
    vm.config.amountDimensions.forEach(amount => {
      yaxis.push({
        opposite: true,
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
      })
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
        values[amount.code].data.push(parseInt(item[amount.code]))
      }
    })
    vm.options = {
      chart: {
        toolbar: {
          show: false
        },
        dropShadow: {
          enabled: true,
          color: '#000',
          top: 18,
          left: 7,
          blur: 10,
          opacity: 0.2
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
        categories: indices,
        title: {
          text: xaxisText
        }
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
