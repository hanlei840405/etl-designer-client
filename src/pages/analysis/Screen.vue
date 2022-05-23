<template>
  <div id="layoutGrid" class="col-sm-12 col-md-11 grid-stack"></div>
</template>

<script>
import Vue from 'vue'
import LineChart from 'components/chart/LineChart.vue'
import AreaChart from 'components/chart/AreaChart.vue'
import HorizontalBarChart from 'components/chart/HorizontalBarChart.vue'
import VerticalBarChart from 'components/chart/VerticalBarChart.vue'
import VerticalStackedBarChart from 'components/chart/VerticalStackedBarChart.vue'
import HorizontalStackedBarChart from 'components/chart/HorizontalStackedBarChart.vue'
import VerticalStackedPercentBarChart from 'components/chart/VerticalStackedPercentBarChart.vue'
import HorizontalStackedPercentBarChart from 'components/chart/HorizontalStackedPercentBarChart.vue'
import MixChart from 'components/chart/MixChart.vue'
import PieChart from 'components/chart/PieChart.vue'
import KLineChart from 'components/chart/KLineChart.vue'
import 'gridstack/dist/gridstack.min.css'
import { GridStack } from 'gridstack'
import 'gridstack/dist/h5/gridstack-dd-native'
import { fetchLayout } from 'src/service/LayoutService'
import { fetchReport, deploy } from 'src/service/ReportService'

export default {
  data () {
    return {
      components: {
        lineChart: LineChart,
        areaChart: AreaChart,
        horizontalBarChart: HorizontalBarChart,
        verticalBarChart: VerticalBarChart,
        horizontalStackedBarChart: HorizontalStackedBarChart,
        verticalStackedBarChart: VerticalStackedBarChart,
        horizontalStackedPercentBarChart: HorizontalStackedPercentBarChart,
        verticalStackedPercentBarChart: VerticalStackedPercentBarChart,
        pieChart: PieChart,
        mixChart: MixChart,
        kLineChart: KLineChart
      },
      grid: null,
      config: {
        name: '',
        indexDimensions: [],
        subjectDimensions: [],
        amountDimensions: [],
        records: []
      }
    }
  },
  mounted () {
    const vm = this
    fetchLayout(vm.$route.params.id).then(res => {
      vm.grid = GridStack.init({
        margin: 1,
        acceptWidgets: true,
        dragIn: '.newWidget',
        dragInOptions: { revert: 'invalid', scroll: false, appendTo: 'body', helper: 'clone' },
        removable: '#trash'
      }, '#layoutGrid')
      if (res.data.arrange) {
        const cells = JSON.parse(res.data.arrange)
        cells.forEach(cell => {
          cell.content = '<div class="bg-indigo-1" style="height: 100%; width: width: 95%;"><div id="cell_' + cell.report.cellId + '"/></div></div>'
        })
        vm.grid.load(cells)
        for (let i = 0; i < cells.length; i++) {
          vm.$nextTick(() => {
            const cell = cells[i]
            fetchReport(cell.report.id).then(res => {
              const report = Object.assign(res.data, {
                indexDimensions: [],
                subjectDimensions: [],
                amountDimensions: []
              })
              res.data.reportDimensions.forEach(item => {
                if (item.category === 'index') {
                  report.indexDimensions.push(item)
                } else if (item.category === 'subject') {
                  report.subjectDimensions.push(item)
                } else {
                  report.amountDimensions.push(item)
                }
              })
              deploy({
                id: report.id
              }).then(res => {
                vm.config = {
                  name: report.name,
                  indexDimensions: report.indexDimensions,
                  subjectDimensions: report.subjectDimensions,
                  amountDimensions: report.amountDimensions,
                  records: res.data.records
                }
                new Vue({
                  render (h) {
                    return h(vm.components[report.chart], { props: { config: vm.config } })
                  }
                }).$mount('#cell_' + cell.report.cellId)
              })
            })
          })
        }
      }
    }).catch(err => {
      if (err.status === 10002) {
        vm.$q.notify({
          message: vm.$t('response-error-10002'),
          position: 'top',
          color: 'negative'
        })
      } else {
        vm.$q.notify({
          message: err.data.error,
          position: 'top',
          color: 'negative'
        })
      }
    })
  }
}
</script>
<style scoped>
</style>
