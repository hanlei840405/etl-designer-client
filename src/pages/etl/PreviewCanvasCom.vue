<template>
  <div>
    <div ref="graphContainer" style="width: 100%; overflow: hidden;"></div>
    <div ref="outlineContainer" style="z-index:1;position:absolute;overflow:hidden;bottom:5px;right:5px;width:120px;height:70px;background:transparent;border-style:solid;border-color:lightgray;"/>
  </div>
</template>

<script>
import Constant from 'src/constant/Constant'
import mxgraph from 'src/mxgraph/index'

export default {
  name: 'PreviewCavasCom',
  props: {
    content: {
      type: String
    }
  },
  data () {
    return {
      graph: null,
      outline: null
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
    // 不以画布中心放大
    vm.graph.centerZoom = false
    const MxOutline = mxgraph.mxOutline
    vm.outline = new MxOutline(vm.graph, vm.$refs.outlineContainer)
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
      for (const key in Constant.ETL_TOOLBAR[type]) {
        Constant.ETL_TOOLBAR[type][key].forEach(bar => {
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
