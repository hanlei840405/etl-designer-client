<template>
  <apexchart type="line" :options="options" :series="series"></apexchart>
</template>

<script>
import VueApexCharts from 'vue-apexcharts'
export default {
  name: 'lineChart',
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
    const indices = []
    const values = {}
    let yaxisText = ''
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
            if (key === ('' + item[subject.code])) {
              values[key].push(parseInt(item[amount.code]))
            }
          }
        })
      })
      // for (var i = 0; i < vm.config.indexDimensions.length; i++) {
      //   var idx = vm.config.indexDimensions[i].code
      //   if (indices.indexOf(item[idx]) < 0) {
      //     indices.push(item[idx])
      //   }
      // }
      // for (var i = 0; i < vm.config.subjectDimensions.length; i++) {
      //   var idx = vm.config.indexDimensions[i].code
      //   if (indices.indexOf(item[idx]) < 0) {
      //     indices.push(item[idx])
      //   }
      // }
      // for (var j = 0; j < vm.config.amountDimensions.length; j++) {
      //   var amount = vm.config.amountDimensions[j]
      //   if (amount.subject) {
      //     if (!values[item[amount.code]]) {
      //       values[item[amount.code]] = []
      //       current = item[amount.code]
      //     }
      //   } else {
      //     values[current].push(parseInt(item[amount.code]))
      //   }
      // }
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
        categories: indices
      },
      yaxis: {
        title: {
          text: yaxisText
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
