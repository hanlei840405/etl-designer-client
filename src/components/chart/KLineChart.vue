<template>
  <apexchart type="candlestick" :options="options" :series="series"></apexchart>
</template>

<script>
import VueApexCharts from 'vue-apexcharts'
export default {
  name: 'kLineChart',
  components: {
    apexchart: VueApexCharts
  },
  props: {
    config: {
      name: null,
      indexDimensions: [],
      subjectDimensions: [],
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
    const seriesData = {
      data: []
    }
    vm.config.records.forEach(item => {
      const candle = {
        x: null,
        y: []
      }
      vm.config.indexDimensions.forEach(idx => {
        candle.x = item[idx.code]
      })
      vm.config.amountDimensions.forEach(amount => {
        candle.y.push(parseInt(item[amount.code]))
      })
      seriesData.data.push(candle)
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
      plotOptions: {
        candlestick: {
          colors: {
            upward: '#3C90EB',
            downward: '#DF7D46'
          }
        }
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
        type: 'category'
      },
      yaxis: {
        tooltip: {
          enabled: true
        }
      }
    }
    vm.series = [seriesData]
  }
}
</script>
