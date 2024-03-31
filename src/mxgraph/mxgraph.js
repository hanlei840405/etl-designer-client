import mxgraph from './index'
import _ from 'lodash'

const {
  mxGraph,
  mxVertexHandler,
  mxConstants,
  mxPerimeter,
  mxCellEditor,
  mxGraphHandler,
  mxEvent,
  mxEdgeHandler,
  mxShape,
  mxUtils,
  mxClient,
  mxGraphView
} = mxgraph

Object.assign(mxEvent, {
  DEFINITION_DOUBLE_CLICK: 'DEFINITION_DOUBLE_CLICK'
})

export class Graph extends mxGraph {
  constructor (container) {
    super(container)
    this._init()
  }

  _init () {
    this._setDefaultConfig()
    this._setBackgroundDefault()
    this._canvasPaddingConfig()
    this._setCanvasConfig()
    this._updateCanvas()
    this._configConstituent()
    this._putVertexStyle()
    this._setDefaultEdgeStyle()
    this._setSelectableConfig()
    this._setAnchors()
    this._configCustomEvent()
    this._restoreModel()
  }

  _canvasPaddingConfig () {
    const graph = this
    var MxRectangle = mxgraph.mxRectangle
    graph.scrollTileSize = new MxRectangle(0, 0, 400, 400)
    graph.getPagePadding = function () {
      window.console.log('container width: ' + graph.container.offsetWidth)
      window.console.log('container height: ' + graph.container.offsetHeight)
      var MxPoint = mxgraph.mxPoint
      return new MxPoint(Math.max(0, 20), Math.max(0, 20))
    }

    graph.getPageSize = function () {
      var MxRectangle = mxgraph.mxRectangle
      return (this.pageVisible) ? new MxRectangle(0, 0, this.pageFormat.width * this.pageScale, this.pageFormat.height * this.pageScale) : this.scrollTileSize
    }

    graph.getPageLayout = function () {
      var size = (this.pageVisible) ? this.getPageSize() : this.scrollTileSize
      var bounds = this.getGraphBounds()
      window.console.log(bounds)
      var MxRectangle = mxgraph.mxRectangle
      if (bounds.width === 0 || bounds.height === 0) {
        return new MxRectangle(0, 0, 1, 1)
      } else {
        window.console.log('the graph bounds x ' + bounds.x)
        window.console.log('the view translate x ' + this.view.translate.x)
        var x = Math.ceil(bounds.x / this.view.scale - this.view.translate.x)
        var y = Math.ceil(bounds.y / this.view.scale - this.view.translate.y)
        var w = Math.floor(bounds.width / this.view.scale)
        var h = Math.floor(bounds.height / this.view.scale)

        var x0 = Math.floor(x / size.width)
        var y0 = Math.floor(y / size.height)
        var w0 = Math.ceil((x + w) / size.width) - x0
        var h0 = Math.ceil((y + h) / size.height) - y0
        return new MxRectangle(x0, y0, w0, h0)
      }
    }

    graph.view.getBackgroundPageBounds = function () {
      var layout = this.graph.getPageLayout()
      var page = this.graph.getPageSize()
      return new MxRectangle(this.scale * (this.translate.x + layout.x * page.width), this.scale * (this.translate.y + layout.y * page.height), this.scale * layout.width * page.width, this.scale * layout.height * page.height)
    }

    graph.getPreferredPageSize = function (bounds, width, height) {
      var pages = this.getPageLayout()
      var size = this.getPageSize()
      return new MxRectangle(0, 0, pages.width * size.width, pages.height * size.height)
    }

    var graphSizeDidChange = graph.sizeDidChange
    graph.sizeDidChange = function () {
      if (this.container !== null && mxUtils.hasScrollbars(this.container)) {
        var pages = this.getPageLayout()
        var pad = this.getPagePadding()
        var size = this.getPageSize()
        var minw = Math.ceil(2 * pad.x / this.view.scale + pages.width * size.width)
        var minh = Math.ceil(2 * pad.y / this.view.scale + pages.height * size.height)
        var min = graph.minimumGraphSize
        if (min === null || min.width !== minw || min.height !== minh) {
          graph.minimumGraphSize = new MxRectangle(0, 0, minw, minh)
        }

        var dx = pad.x / this.view.scale - pages.x * size.width
        var dy = pad.y / this.view.scale - pages.y * size.height

        if (!this.autoTranslate && (this.view.translate.x !== dx || this.view.translate.y !== dy)) {
          window.console.log('test in the auto Translate false')
          this.autoTranslate = true
          this.view.x0 = pages.x
          this.view.y0 = pages.y
          var tx = graph.view.translate.x
          var ty = graph.view.translate.y

          graph.view.setTranslate(dx, dy)
          graph.container.scrollLeft += (dx - tx) * graph.view.scale
          graph.container.scrollTop += (dy - ty) * graph.view.scale

          this.autoTranslate = false
          return
        }
        graphSizeDidChange.apply(this, arguments)
      }
    }
  }

  _updateCanvas () {
    const graph = this
    if (graph.container !== null) {
      graph.view.validateBackground()
      graph.sizeDidChange()
    }
  }

  _configConstituent () {
    this.selectCellForEvent = (...args) => {
      const [cell] = args
      if (this.isPart(cell)) {
        args[0] = this.model.getParent(cell)
        mxGraph.prototype.selectCellForEvent.call(this, args)
        return
      }
      mxGraph.prototype.selectCellForEvent.apply(this, args)
    }

    const graphHandlerGetInitialCellForEvent = mxGraphHandler.prototype.getInitialCellForEvent
    mxGraphHandler.prototype.getInitialCellForEvent = function getInitialCellForEvent (...args) {
      let cell = graphHandlerGetInitialCellForEvent.apply(this, args)
      if (this.graph.isPart(cell)) {
        cell = this.graph.getModel().getParent(cell)
      }
      return cell
    }
  }

  _setBackgroundDefault () {
    this.transparentBackground = false
    this.pageVisible = true
    this.pageScale = 1
    this.preferPageSize = false
  }

  _setCanvasConfig () {
    mxGraphView.prototype.validateBackgroundPage = function () {
      var graph = this.graph

      if (graph.container !== null && !graph.transparentBackground) {
        if (graph.pageVisible) {
          window.console.log('validate background page && is page visible')
          currentPageBounds = this.getBackgroundPageBounds()

          if (!this.backgroundPageShape) {
            window.console.log('in the null')
            var firstChild = graph.container.firstChild
            window.console.log(firstChild)

            while (firstChild !== null && firstChild.nodeType !== mxConstants.NODETYPE_ELEMENT) {
              window.console.log('in the not null child1')
              firstChild = firstChild.nextSibling
            }

            if (firstChild !== null) {
              window.console.log('in the not null child2')
              this.backgroundPageShape = this.createBackgroundPageShape(currentPageBounds)
              this.backgroundPageShape.scale = 1

              this.backgroundPageShape.isShadow = !mxClient.IS_QUIRKS
              this.backgroundPageShape.dialect = mxConstants.DIALECT_STRICTHTML
              this.backgroundPageShape.init(graph.container)

              firstChild.style.position = 'absolute'
              graph.container.insertBefore(this.backgroundPageShape.node, firstChild)
              this.backgroundPageShape.redraw()
              this.backgroundPageShape.node.className = 'geBackgroundPage'
            }
          } else {
            window.console.log('in the not null')
            const graphBounds = this.getGraphBounds()
            const gw = graphBounds.width
            const gh = graphBounds.height
            const gx = graphBounds.x
            const gy = graphBounds.y

            const pw = currentPageBounds.width
            const ph = currentPageBounds.height
            const dx = Math.ceil(gw + gx)
            const dy = Math.ceil(gh + gy)
            var MxRectangle = mxgraph.mxRectangle
            if (dx >= pw || dy >= ph) {
              if (dx >= pw && dy < ph) {
                currentPageBounds = new MxRectangle(0, 0, dx + 20, ph)
              } else if (dx < pw && dy >= ph) {
                currentPageBounds = new MxRectangle(0, 0, pw, dy + 20)
              } else {
                currentPageBounds = new MxRectangle(0, 0, dx + 20, dy + 20)
              }
            }

            this.backgroundPageShape.scale = 1
            this.backgroundPageShape.bounds = currentPageBounds
            graph.pageFormat = currentPageBounds
            this.backgroundPageShape.redraw()
          }
        } else if (this.backgroundPageShape !== null) {
          this.backgroundPageShape.destroy()
          this.backgroundPageShape = null
        }

        if (graph.container !== null && mxUtils.hasScrollbars(this.graph.container)) {
          var pad = graph.getPagePadding()
          var size = graph.getPageSize()

          this.translate.x = pad.x / this.scale - (this.x0 || 0) * size.width
          this.translate.y = pad.y / this.scale - (this.y0 || 0) * size.height
        }

        this.backgroundPageShape.node.style.boxShadow = '0px 2px 8px 0px #dcdcdc'
        this.backgroundPageShape.node.style.border = 'none'
        this.backgroundPageShape.node.style.backgroundColor = '#ffffff'
      }
    }
    this.view.validateBackgroundPage()
  }

  _setDefaultConfig () {
    this.setConnectable(true)
    mxEvent.disableContextMenu(this.container)
    this.setCellsResizable(false)
    this.setEnterStopsCellEditing(true)
    mxCellEditor.prototype.escapeCancelsEditing = false
    mxCellEditor.prototype.blurEnabled = true
    this.foldingEnabled = true
    this.setHtmlLabels(true)
    mxGraphHandler.prototype.guidesEnabled = true
    this.setDisconnectOnMove(false)
    this.setAllowDanglingEdges(false)
    mxGraph.prototype.isCellMovable = cell => !cell.edge
    this.setCellsBendable(false)
    mxGraph.prototype.edgeLabelsMovable = false
  }

  _setSelectableConfig () {
    mxGraph.prototype.isCellSelectable = function (cell) {
      var state = this.view.getState(cell)
      var style = (state !== null) ? state.style : this.getCellStyle(cell)

      return this.isCellsSelectable() && !this.isCellLocked(cell) && style.selectable !== 0
    }
  }

  _putVertexStyle () {
    const normalTypeStyle = { [mxConstants.STYLE_SHAPE]: mxConstants.SHAPE_IMAGE, [mxConstants.STYLE_PERIMETER]: mxPerimeter.RectanglePerimeter }
    this.getStylesheet().putCellStyle('normalType', normalTypeStyle)

    const functionNodeStyle = {
      [mxConstants.STYLE_SHAPE]: mxConstants.SHAPE_LABEL,
      [mxConstants.STYLE_PERIMETER]: mxPerimeter.RectanglePerimeter,
      [mxConstants.STYLE_ROUNDED]: true,
      [mxConstants.STYLE_ARCSIZE]: 8,
      [mxConstants.STYLE_STROKECOLOR]: '#42b982',
      [mxConstants.STYLE_FONTCOLOR]: '#ffffff',
      [mxConstants.STYLE_FILLCOLOR]: '#42b982',
      [mxConstants.STYLE_FONTSTYLE]: mxConstants.FONT_BOLD,
      [mxConstants.STYLE_LABEL_BACKGROUNDCOLOR]: '#42b982',
      [mxConstants.STYLE_FONTSIZE]: 20,
      [mxConstants.STYLE_ALIGN]: mxConstants.ALIGN_CENTER,
      [mxConstants.STYLE_WHITE_SPACE]: 'wrap',
      [mxConstants.WORD_WRAP]: 'break-word'
    }
    this.getStylesheet().putCellStyle('function_node', functionNodeStyle)
    const endPointNodeStyle = {
      [mxConstants.STYLE_SHAPE]: mxConstants.SHAPE_LABEL,
      [mxConstants.STYLE_PERIMETER]: mxPerimeter.RectanglePerimeter,
      [mxConstants.STYLE_ROUNDED]: true,
      [mxConstants.STYLE_ARCSIZE]: 8,
      [mxConstants.STYLE_STROKECOLOR]: '#34495d',
      [mxConstants.STYLE_FONTCOLOR]: '#ffffff',
      [mxConstants.STYLE_FILLCOLOR]: '#34495d',
      [mxConstants.STYLE_FONTSTYLE]: mxConstants.FONT_BOLD,
      [mxConstants.STYLE_LABEL_BACKGROUNDCOLOR]: '#34495d',
      [mxConstants.STYLE_FONTSIZE]: 20,
      [mxConstants.STYLE_ALIGN]: mxConstants.ALIGN_CENTER,
      [mxConstants.STYLE_WHITE_SPACE]: 'wrap',
      [mxConstants.WORD_WRAP]: 'break-word'
    }
    this.getStylesheet().putCellStyle('endpoint_node', endPointNodeStyle)
    const resourceNodeStyle = {
      [mxConstants.STYLE_SHAPE]: mxConstants.SHAPE_LABEL,
      [mxConstants.STYLE_PERIMETER]: mxPerimeter.RectanglePerimeter,
      [mxConstants.STYLE_ROUNDED]: true,
      [mxConstants.STYLE_ARCSIZE]: 8,
      [mxConstants.STYLE_STROKECOLOR]: '#34495d',
      [mxConstants.STYLE_FONTCOLOR]: '#ffffff',
      [mxConstants.STYLE_FILLCOLOR]: '#34495d',
      [mxConstants.STYLE_FONTSTYLE]: mxConstants.FONT_BOLD,
      [mxConstants.STYLE_LABEL_BACKGROUNDCOLOR]: '#34495d',
      [mxConstants.STYLE_FONTSIZE]: 20,
      [mxConstants.STYLE_ALIGN]: mxConstants.ALIGN_CENTER,
      [mxConstants.STYLE_WHITE_SPACE]: 'wrap',
      [mxConstants.WORD_WRAP]: 'break-word'
    }
    this.getStylesheet().putCellStyle('resource_node', resourceNodeStyle)

    const inOutNodeStyle = {
      [mxConstants.STYLE_SHAPE]: mxConstants.SHAPE_LABEL,
      [mxConstants.STYLE_PERIMETER]: mxPerimeter.RectanglePerimeter,
      [mxConstants.STYLE_ROUNDED]: true,
      [mxConstants.STYLE_ARCSIZE]: 8,
      [mxConstants.STYLE_STROKECOLOR]: '#ffdc34',
      [mxConstants.STYLE_FONTCOLOR]: '#ffffff',
      [mxConstants.STYLE_FILLCOLOR]: '#f7be16',
      [mxConstants.STYLE_FONTSIZE]: 12,
      [mxConstants.STYLE_FONTSTYLE]: mxConstants.FONT_BOLD,
      [mxConstants.STYLE_ALIGN]: mxConstants.ALIGN_CENTER
    }
    this.getStylesheet().putCellStyle('inout_node', inOutNodeStyle)

    const exceptOutNodeStyle = {
      [mxConstants.STYLE_SHAPE]: mxConstants.SHAPE_LABEL,
      [mxConstants.STYLE_PERIMETER]: mxPerimeter.RectanglePerimeter,
      [mxConstants.STYLE_ROUNDED]: true,
      [mxConstants.STYLE_ARCSIZE]: 8,
      [mxConstants.STYLE_STROKECOLOR]: '#EA5E5E',
      [mxConstants.STYLE_FONTCOLOR]: '#ffffff',
      [mxConstants.STYLE_FILLCOLOR]: '#EA5E5E',
      [mxConstants.STYLE_FONTSIZE]: 12,
      [mxConstants.STYLE_FONTSTYLE]: mxConstants.FONT_BOLD,
      [mxConstants.STYLE_ALIGN]: mxConstants.ALIGN_CENTER
    }
    this.getStylesheet().putCellStyle('exceptout_node', exceptOutNodeStyle)

    const alterOutNodeStyle = {
      [mxConstants.STYLE_SHAPE]: mxConstants.SHAPE_LABEL,
      [mxConstants.STYLE_PERIMETER]: mxPerimeter.RectanglePerimeter,
      [mxConstants.STYLE_ROUNDED]: true,
      [mxConstants.STYLE_ARCSIZE]: 8,
      [mxConstants.STYLE_STROKECOLOR]: '#F58B54',
      [mxConstants.STYLE_FONTCOLOR]: '#ffffff',
      [mxConstants.STYLE_FILLCOLOR]: '#F58B54',
      [mxConstants.STYLE_FONTSIZE]: 12,
      [mxConstants.STYLE_FONTSTYLE]: mxConstants.FONT_BOLD,
      [mxConstants.STYLE_ALIGN]: mxConstants.ALIGN_CENTER
    }
    this.getStylesheet().putCellStyle('alterout_node', alterOutNodeStyle)

    const defiTypeNodeStyle = {
      [mxConstants.STYLE_STROKECOLOR]: 'none',
      [mxConstants.STYLE_FILLCOLOR]: 'none',
      [mxConstants.STYLE_FONTCOLOR]: '#beebe9',
      [mxConstants.STYLE_FONTSIZE]: '12',
      [mxConstants.STYLE_FONTSTYLE]: '1',
      [mxConstants.STYLE_SPACING_TOP]: '2'
    }
    this.getStylesheet().putCellStyle('defitype_node', defiTypeNodeStyle)

    const oldCreateSelectionShape = mxVertexHandler.prototype.createSelectionShape
    mxVertexHandler.prototype.createSelectionShape = function createSelectionShape (...args) {
      const res = oldCreateSelectionShape.apply(this, args)
      res.isRounded = true
      res.style = {
        arcSize: 6
      }
      return res
    }
  }

  _setDefaultEdgeStyle () {
    const style = this.getStylesheet().getDefaultEdgeStyle()
    Object.assign(style, {
      [mxConstants.STYLE_ROUNDED]: true,
      [mxConstants.STYLE_STROKEWIDTH]: '2',
      [mxConstants.STYLE_STROKECOLOR]: '#333333',
      [mxConstants.STYLE_EDGE]: mxConstants.EDGESTYLE_TOPTOBOTTOM,
      [mxConstants.STYLE_FONTCOLOR]: '#33333',
      [mxConstants.STYLE_LABEL_BACKGROUNDCOLOR]: '#ffa94d'
    })
    this.connectionHandler.createEdgeState = () => {
      const edge = this.createEdge()
      var MxCellState = mxgraph.mxCellState
      return new MxCellState(this.view, edge, this.getCellStyle(edge))
    }
  }

  _setAnchors () {
    this.connectionHandler.isConnectableCell = () => false
    mxGraph.prototype.getAllConnectionConstraints = (terminal) => {
      if (terminal !== null && terminal.shape !== null) {
        if (terminal.shape.stencil !== null) {
          if (terminal.shape.stencil !== null) {
            return terminal.shape.stencil.constraints
          }
        } else if (terminal.shape.constraints !== null) {
          return terminal.shape.constraints
        }
      }
      return null
    }
    var MxConnectionConstraint = mxgraph.mxConnectionConstraint
    var MxPoint = mxgraph.mxPoint
    mxShape.prototype.constraints = [
      new MxConnectionConstraint(new MxPoint(0.5, 0), true),
      new MxConnectionConstraint(new MxPoint(0.5, 1), true)]
  }

  _configCustomEvent () {
    const graph = this
    const oldStart = mxEdgeHandler.prototype.start
    var MxEventObject = mxgraph.mxEventObject
    mxEdgeHandler.prototype.start = function start (...args) {
      oldStart.apply(this, args)
      graph.fireEvent(new MxEventObject(mxEvent.EDGE_START_MOVE, 'edge', this.state.cell, 'source', this.isSource))
    }
    const oldCreatePreviewShape = mxGraphHandler.prototype.createPreviewShape
    mxGraphHandler.prototype.createPreviewShape = function createPreviewShape (...args) {
      graph.fireEvent(new MxEventObject(mxEvent.VERTEX_START_MOVE))
      return oldCreatePreviewShape.apply(this, args)
    }
  }

  _restoreModel () {
    Object.values(this.getModel().cells).forEach(cell => {
      if (cell.vertex && cell.data) {
        cell.data = JSON.parse(cell.data)
      }
    })
  }

  _getExportModel () {
    const model = _.cloneDeep(this.getModel())
    Object.values(model.cells).forEach(cell => {
      if (cell.vertex && cell.data) {
        cell.data = JSON.stringify(cell.data)
      }
    })
    return model
  }

  isPart (cell) {
    const state = this.view.getState(cell)
    const style = (state !== null) ? state.style : this.getCellStyle(cell)
    return style.constituent === 1
  }

  exportModelXML () {
    var MxCodec = mxgraph.mxCodec
    var encoder = new MxCodec(mxUtils.createXmlDocument())
    var node = encoder.encode(this._getExportModel())
    return mxUtils.getPrettyXml(node)
  }

  exportPicXML () {
    const xmlDoc = mxUtils.createXmlDocument()
    const root = xmlDoc.createElement('output')
    xmlDoc.appendChild(root)

    const { scale } = this.view
    const border = 10

    const bounds = this.getGraphBounds()
    var MxXmlCanvas2D = mxgraph.mxXmlCanvas2D
    const xmlCanvas = new MxXmlCanvas2D(root)
    xmlCanvas.translate(Math.floor((border / scale - bounds.x) / scale), Math.floor((border / scale - bounds.y) / scale))
    xmlCanvas.scale(1)
    var MxImageExport = mxgraph.mxImageExport
    const imgExport = new MxImageExport()
    imgExport.drawState(this.getView().getState(this.model.root), xmlCanvas)
    const w = Math.ceil(bounds.width * scale / scale + 2 * border)
    const h = Math.ceil(bounds.height * scale / scale + 2 * border)
    const xml = mxUtils.getPrettyXml(root)
    return { xml: xml, width: w, height: h }
  }

  exportModelSvg () {
    var scale = this.view.scale
    var bounds = this.getGraphBounds()
    var border = 10

    var svgDoc = mxUtils.createXmlDocument()
    var root = (svgDoc.createElementNS !== null) ? svgDoc.createElementNS(mxConstants.NS_SVG, 'svg') : svgDoc.createElement('svg')

    if (root.style !== null) {
      root.style.backgroundColor = '#FFFFFF'
    } else {
      root.setAttribute('style', 'background-color:#FFFFFF')
    }

    if (svgDoc.createElementNS === null) {
      root.setAttribute('xmlns', mxConstants.NS_SVG)
    }
    var width = Math.ceil(bounds.width * scale / scale + 2 * border)
    var height = Math.ceil(bounds.height * scale / scale + 2 * border)
    root.setAttribute('class', 'svg-container')
    root.setAttribute('width', width + 'px')
    root.setAttribute('height', height + 'px')
    root.setAttribute('viewBox', '0 0 ' + width + ' ' + height)
    root.setAttribute('xmlns:xlink', mxConstants.NS_XLINK)
    root.setAttribute('version', '1.1')

    var group = (svgDoc.createElementNS !== null) ? svgDoc.createElementNS(mxConstants.NS_SVG, 'g') : svgDoc.createElement('g')
    group.setAttribute('transform', 'translate(0.5,0.5)')
    root.appendChild(group)
    svgDoc.appendChild(root)
    var MxSvgCanvas2D = mxgraph.mxSvgCanvas2D
    var svgCanvas = new MxSvgCanvas2D(group)
    svgCanvas.translate(Math.floor(border / scale - bounds.x), Math.floor(border / scale - bounds.y))
    svgCanvas.scale(scale)
    var MxImageExport = mxgraph.mxImageExport
    var imgExport = new MxImageExport()
    imgExport.drawState(this.getView().getState(this.model.root), svgCanvas)
    var xml = mxUtils.getXml(root)
    return xml
  }

  importModelFromXML (xml) {
    graph.getModel().beginUpdate()
    try {
      var doc = mxUtils.parseXml(xml)
      var MxCodec = mxgraph.mxCodec
      var codec = new MxCodec(doc)
      codec.decode(doc.documentElement, graph.getModel())
    } finally {
      graph.getModel().endUpdate()
    }
    this._restoreModel()
    this._updateCanvas()
  }

  isGraphEmpty () {
    const count = graph.getModel().getChildCount(graph.getDefaultParent())
    if (count <= 0) {
      return true
    }
    return false
  }

  updateBackgroundPage (selected) {
    window.console.log('in the update')
    var MxRectangle = mxgraph.mxRectangle
    var newBounds
    if (selected.includes('a4')) {
      newBounds = new MxRectangle(0, 0, 827, 1169)
    } else if (selected.includes('a5')) {
      newBounds = new MxRectangle(0, 0, 583, 827)
    } else if (selected.includes('106')) {
      newBounds = new MxRectangle(0, 0, 400, 400)
    }
    this.refreshBackgroundPage(newBounds)
  }

  updateCustomBackgroundPage (width, height) {
    window.console.log('in the custom page update')
    window.console.log('the width and height: ' + width + ' ' + height)
    var MxRectangle = mxgraph.mxRectangle
    const newBounds = new MxRectangle(0, 0, width, height)
    this.refreshBackgroundPage(newBounds)
  }

  refreshBackgroundPage (newBounds) {
    graph.view.backgroundPageShape.bounds = newBounds
    graph.view.backgroundPageShape.scale = 1
    graph.pageFormat = newBounds
    currentPageBounds = newBounds
    graph.view.backgroundPageShape.redraw()
    graph._updateCanvas()
  }
}

let graph = {}
let currentPageBounds = mxConstants.PAGE_FORMAT_A4_PORTRAIT

export const destroyGraph = () => {
  graph.destroy()
  graph = {}
}

export const genGraph = (container) => {
  graph = new Graph(container)
  graph.centerZoom = true
  return graph
}

export const getGraph = () => graph
