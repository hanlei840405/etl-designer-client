<template>
  <div id="layoutGrid" class="col-12 grid-stack bg-grey-2">
  </div>
</template>

<script>
import {
  fetchLayout
} from 'src/service/bi/LayoutService'
import 'gridstack/dist/gridstack.min.css'
import { GridStack } from 'gridstack'
import 'gridstack/dist/h5/gridstack-dd-native'
import * as echarts from 'echarts'
import { paintReportByGet } from 'src/service/bi/ReportService'
export default {
  data () {
    return {
      layoutGrid: null,
      reports: []
    }
  },
  mounted () {
    fetchLayout(this.$route.params.id).then(res => {
      const layoutReportList = res.data.layoutReportList || []
      this.$nextTick(() => {
        this.layoutGrid = GridStack.init({
          column: 12,
          minRow: 8,
          cellHeight: window.innerHeight / 8,
          margin: 5,
          acceptWidgets: true,
          dragIn: '.newWidget',
          dragInOptions: { revert: 'invalid', scroll: false, appendTo: '#layoutGrid', helper: 'clone' },
        }, '#layoutGrid')
        this.layoutGrid.on('resize', function(event, element) {
        debugger
          const node = element.gridstackNode
          const parser = new DOMParser()
          const content = parser.parseFromString(node.content, 'text/html')
          echarts.getInstanceByDom(document.getElementById(content.body.firstChild.id)).resize()
        })
        layoutReportList.forEach(item => {
          this.reports.push(item)
          this.layoutGrid.addWidget({
            w: item.w,
            h: item.h,
            x: item.x,
            y: item.y,
            id: item.reportId,
            originId: item.id,
            frequency: item.frequency,
            content: '<div class="bg-white" id="reportChart_' + item.reportId + '" style="width: 100%; height: ' + (item.h * window.innerHeight / 8 - 10) + 'px;"></div>'
          })
          paintReportByGet(item.reportId).then(res => {
            const reportChart = echarts.init(document.getElementById('reportChart_' + item.reportId));
            reportChart.setOption(res.data)
            window.addEventListener('resize', function() {
              reportChart.resize();
            })
          })
        })
      })
    })
    window.onresize = () => {
      this.layoutGrid.cellHeight(window.innerHeight / 8, true)
      this.layoutGrid.batchUpdate()
      this.layoutGrid.commit()
      this.reports.forEach(report => {
        const reportChartDom = document.getElementById('reportChart_' + report.reportId)
        if (!reportChartDom) return;
        reportChartDom.style.height = (report.h * window.innerHeight / 8 - 10) + 'px';
        reportChartDom.style.width = '100%';
        const reportChart = echarts.getInstanceByDom(reportChartDom)
        if (reportChart) {
          reportChart.resize();
        }
      })
    }
  }
}
</script>
