<template>
  <apexchart type="area" :options="options" :series="series"></apexchart>
</template>

<script>
import VueApexCharts from 'vue-apexcharts'
export default {
  name: 'areaChart',
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
    let xaxisText = ''
    let yaxisText = ''
    vm.config.indexDimensions.forEach(idx => {
      xaxisText = idx.name
    })
    if (vm.config.subjectDimensions.length <= 0) {
      vm.$q.notify({
        position: 'top',
        message: '请为统计集合设置指标对象',
        color: 'negative'
      })
      return
    }
    vm.config.amountDimensions.forEach(amount => {
      yaxisText = amount.name
    })
    vm.config.records.forEach(item => {
      vm.config.indexDimensions.forEach(idx => {
        if (indices.indexOf(item[idx.code]) < 0) {
          indices.push(item[idx.code])
        }
      })
      vm.config.subjectDimensions.forEach(subject => {
        if (!values[item[subject.code]]) {
          values[item[subject.code]] = []
        }
      })
      vm.config.amountDimensions.forEach(amount => {
        vm.config.subjectDimensions.forEach(subject => {
          for (var key in values) {
            if (key === item[subject.code]) {
              values[key].push(parseInt(item[amount.code]))
            }
          }
        })
      })
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
      yaxis: {
        title: {
          text: yaxisText,
          rotate: 0
        }
      }
    }
    const array = []
    for (var key in values) {
      array.push({
        name: key,
        data: values[key]
      })
    }
    vm.series = array
  }
}
</script>
