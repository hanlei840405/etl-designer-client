import mx from 'mxgraph'
const mxgraph = mx({
  mxBasePath: '/mxgraph'
})
window.mxGraph = mxgraph.mxGraph
window.mxGraphModel = mxgraph.mxGraphModel
window.mxEditor = mxgraph.mxEditor
window.mxGeometry = mxgraph.mxGeometry
window.mxDefaultKeyHandler = mxgraph.mxDefaultKeyHandler
window.mxDefaultPopupMenu = mxgraph.mxDefaultPopupMenu
window.mxStylesheet = mxgraph.mxStylesheet
window.mxDefaultToolbar = mxgraph.mxDefaultToolbar
window.mxToolbar = mxgraph.mxToolbar
window.mxCell = mxgraph.mxCell
window.mxCodec = mxgraph.mxCodec
window.mxEvent = mxgraph.mxEvent
window.mxUtils = mxgraph.mxUtils
window.mxConstants = mxgraph.mxConstants

export default mxgraph