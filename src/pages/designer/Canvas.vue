<template>
  <div ref="graphContainer" style="width: 100%; overflow-x: scroll;"></div>
</template>

<script>
import mxgraph from '../../graph/index'

export default {
  name: 'MxGraphCanvas',
  props: {
    content: {
      type: String
    }
  },
  data () {
    return {
      graph: null,
      toolbar: {
        transform: {
          stepInput: [{
            img: '/images/etl/TIP.svg',
            name: '表输入',
            type: 'TableInputMeta'
          }, {
            img: '/images/etl/GNR.svg',
            name: '自定义常量数据',
            type: 'DataGridMeta'
          }, {
            img: '/images/etl/GEN.svg',
            name: '生成记录',
            type: 'RowGeneratorMeta'
          }, {
            img: '/images/etl/JSI.svg',
            name: 'JSON输入',
            type: 'JsonInputMeta'
          }],
          stepOutput: [{
            img: '/images/etl/Delete.svg',
            name: '删除',
            type: 'DeleteMeta'
          }, {
            img: '/images/etl/INU.svg',
            name: '插入/更新',
            type: 'InsertUpdateMeta'
          }, {
            img: '/images/etl/UPD.svg',
            name: '更新',
            type: 'UpdateMeta'
          }, {
            img: '/images/etl/TOP.svg',
            name: '表输出',
            type: 'TableOutputMeta'
          }, {
            img: '/images/etl/JSO.svg',
            name: 'JSON输出',
            type: 'JsonOutputMeta'
          }, {
            img: '/images/etl/ESB.svg',
            name: 'elastic search写入',
            type: 'ElasticSearchBulkMeta'
          }],
          streaming: [{
            img: '/images/etl/get-records-from-stream.svg',
            name: '读取流',
            type: 'RecordsFromStreamMeta'
          }, {
            img: '/images/etl/KafkaProducerOutput.svg',
            name: 'Kafka producer',
            type: 'KafkaProducerOutputMeta'
          }, {
            img: '/images/etl/KafkaConsumerInput.svg',
            name: 'Kafka consumer',
            type: 'KafkaConsumerInputMeta'
          }],
          stepConvert: [{
            img: '/images/etl/VMAP.svg',
            name: '值映射',
            type: 'ValueMapperMeta'
          }, {
            img: '/images/etl/SFtR.svg',
            name: '列拆分为多行',
            type: 'SplitFieldToRowsMeta'
          }, {
            img: '/images/etl/UNP.svg',
            name: '列转行',
            type: 'DenormaliserMeta'
          }, {
            img: '/images/etl/SRC.svg',
            name: '剪切字符串',
            type: 'StringCutMeta'
          }, {
            img: '/images/etl/UNQ.svg',
            name: '去除重复记录',
            type: 'UniqueRowsMeta'
          }, {
            img: '/images/etl/URH.svg',
            name: '唯一行(哈希值)',
            type: 'UniqueRowsByHashSetMeta'
          }, {
            img: '/images/etl/CST.svg',
            name: '增加常量',
            type: 'ConstantMeta'
          }, {
            img: '/images/etl/SEL.svg',
            name: '字段选择',
            type: 'SelectValuesMeta'
          }, {
            img: '/images/etl/RST.svg',
            name: '字符串替换',
            type: 'ReplaceStringMeta'
          }, {
            img: '/images/etl/SPL.svg',
            name: '拆分字段',
            type: 'FieldSplitterMeta'
          }, {
            img: '/images/etl/FLA.svg',
            name: '行扁平化',
            type: 'FlattenerMeta'
          }, {
            img: '/images/etl/NRM.svg',
            name: '行转列',
            type: 'NormaliserMeta'
          }],
          stepShell: [{
            img: '/images/etl/janino.svg',
            name: 'Java代码',
            type: 'UserDefinedJavaClassMeta'
          }, {
            img: '/images/etl/SCR_mod.svg',
            name: 'JavaScript代码',
            type: 'ScriptMeta'
          }, {
            img: '/images/etl/SQL.svg',
            name: '执行SQL脚本',
            type: 'ExecSQLMeta'
          }, {
            img: '/images/etl/SVA.svg',
            name: '设置变量',
            type: 'SetVariableMeta'
          }, {
            img: '/images/etl/GVA.svg',
            name: '获取变量',
            type: 'GetVariableMeta'
          }],
          stepLookup: [{
            img: '/images/etl/DLU.svg',
            name: '数据库查询',
            type: 'DatabaseLookupMeta'
          }, {
            img: '/images/etl/DBJ.svg',
            name: '数据库连接',
            type: 'DatabaseJoinMeta'
          }, {
            img: '/images/etl/REST.svg',
            name: 'Rest请求',
            type: 'RestMeta'
          }],
          stepProcess: [{
            img: '/images/etl/SWC.svg',
            name: 'Switch / case',
            type: 'SwitchCaseMeta'
          }, {
            img: '/images/etl/DUM.svg',
            name: '空操作',
            type: 'DummyTransMeta'
          }, {
            img: '/images/etl/MAIL.svg',
            name: '邮件',
            type: 'MailMeta'
          }, {
            img: '/images/etl/EMS.svg',
            name: '检测空流',
            type: 'DetectEmptyStreamMeta'
          }, {
            img: '/images/etl/DLR.svg',
            name: '识别流的最后一行',
            type: 'DetectLastRowMeta'
          }, {
            img: '/images/etl/WTL.svg',
            name: '写日志',
            type: 'WriteToLogMeta'
          }]
        },
        job: {
          entryCommon: [{
            img: '/images/etl/STR.svg',
            name: '开始',
            type: 'JobEntrySpecial'
          }, {
            img: '/images/etl/TRN.svg',
            name: '转换',
            type: 'JobEntryTrans'
          }, {
            img: '/images/etl/SUC.svg',
            name: '成功',
            type: 'JobEntrySuccess'
          }, {
            img: '/images/etl/DUM.svg',
            name: '空操作',
            type: 'JobEntryDummy'
          }, {
            img: '/images/etl/SVA.svg',
            name: '设置变量',
            type: 'JobEntrySetVariables'
          }, {
            img: '/images/etl/JOB.svg',
            name: '作业',
            type: 'JobEntryJob'
          }],
          entryShell: [
            {
              img: '/images/etl/SCR_mod.svg',
              name: 'JavaScript代码',
              type: 'JobEntryEval'
            }
          ],
          conditionShell: [
            {
              img: '/images/etl/SEV.svg',
              name: '检查字段值',
              type: 'JobEntrySimpleEval'
            }
          ]
        }
      }
    }
  },
  methods: {
    paint (val) {
      const vm = this
      const xmlDocument = mxgraph.mxUtils.parseXml(val)
      if (xmlDocument.documentElement != null && xmlDocument.documentElement.nodeName === 'mxGraphModel') {
        const MxCodec = mxgraph.mxCodec
        const decoder = new MxCodec(xmlDocument)
        const node = xmlDocument.documentElement
        decoder.decode(node, vm.graph.getModel())
        vm.graph.refresh()
      }
    }
  },
  watch: {
    content: {
      immediate: true,
      handler (val) {
        if (val && this.graph) {
          this.paint(val)
        }
      }
    }
  },
  mounted () {
    mxgraph.mxConstants.VERTEX_SELECTION_COLOR = '#009688'
    mxgraph.mxConstants.EDGE_SELECTION_COLOR = '#009688'
    mxgraph.mxConstants.VERTEX_SELECTION_STROKEWIDTH = '3'
    mxgraph.mxConstants.EDGE_SELECTION_STROKEWIDTH = '3'
    mxgraph.mxConstants.HANDLE_FILLCOLOR = '#009688'
    mxgraph.mxConstants.HANDLE_STROKECOLOR = '#009688'
    mxgraph.mxConstants.VERTEX_SELECTION_DASHED = false
    mxgraph.mxConstants.EDGE_SELECTION_DASHED = false
    mxgraph.mxConstants.STYLE_FONTSIZE = '16'
    const vm = this
    const MxGraph = mxgraph.mxGraph
    vm.graph = new MxGraph(vm.$refs.graphContainer)
    vm.graph.setEnabled(false)
    vm.graph.convertValueToString = function (cell) {
      if (cell.edge) {
        return cell.value
      } else if (cell.vertex) {
        return cell.getAttribute('title', '')
      }
      return cell.value
    }
    const redrawShape = vm.graph.cellRenderer.redrawShape
    vm.graph.cellRenderer.redrawShape = function (state, force, rendering) {
      let form = state.cell.getAttribute('form')
      if (state.secondLabel) {
        state.secondLabel.destroy()
        state.secondLabel = null
      }
      if (form) {
        form = JSON.parse(form)
        const parallel = form.parallel || 1
        const MxRectangle = mxgraph.mxRectangle
        if (parallel && parallel > 1) {
          const MxText = mxgraph.mxText
          state.secondLabel = new MxText(parallel, new MxRectangle(), mxgraph.mxConstants.ALIGN_LEFT, mxgraph.mxConstants.ALIGN_BOTTOM)
          state.secondLabel.color = 'black'
          vm.graph.cellRenderer.initializeLabel(state, state.secondLabel)
        }
        if (state.secondLabel != null) {
          const bounds = new MxRectangle(state.x - 10, state.y, 35, 0)
          state.secondLabel.state = state
          state.secondLabel.value = 'x' + parallel
          state.secondLabel.bounds = bounds
          state.secondLabel.redraw()
        }
      }
      return redrawShape.apply(this, arguments)
    }
    const types = ['job', 'transform']
    types.forEach(type => {
      for (const key in vm.toolbar[type]) {
        vm.toolbar[type][key].forEach(bar => {
          const style = {}
          style[mxgraph.mxConstants.STYLE_PERIMETER] = mxgraph.mxPerimeter.RectanglePerimeter
          style[mxgraph.mxConstants.STYLE_SHAPE] = mxgraph.mxConstants.SHAPE_LABEL
          style[mxgraph.mxConstants.STYLE_STROKECOLOR] = '#009688'
          style[mxgraph.mxConstants.STYLE_ALIGN] = mxgraph.mxConstants.ALIGN_CENTER
          style[mxgraph.mxConstants.STYLE_VERTICAL_ALIGN] = mxgraph.mxConstants.ALIGN_TOP
          style[mxgraph.mxConstants.STYLE_IMAGE_ALIGN] = mxgraph.mxConstants.ALIGN_CENTER
          style[mxgraph.mxConstants.STYLE_IMAGE_VERTICAL_ALIGN] = mxgraph.mxConstants.ALIGN_CENTER
          style[mxgraph.mxConstants.STYLE_IMAGE_WIDTH] = '45'
          style[mxgraph.mxConstants.STYLE_IMAGE_HEIGHT] = '45'
          style[mxgraph.mxConstants.STYLE_SPACING_TOP] = '45'
          style[mxgraph.mxConstants.STYLE_SPACING] = '6'
          style[mxgraph.mxConstants.STYLE_FILLCOLOR] = '#FFFFFF'
          style[mxgraph.mxConstants.STYLE_FONTCOLOR] = '#000000'
          style[mxgraph.mxConstants.STYLE_FONTSIZE] = '14'
          style[mxgraph.mxConstants.STYLE_ROUNDED] = true
          style[mxgraph.mxConstants.STYLE_IMAGE] = bar.img
          vm.graph.getStylesheet().putCellStyle(bar.type, style)
        })
      }
    })
    if (vm.content) {
      vm.paint(vm.content)
    }
  }
}
</script>
