<template>
  <div style="width: 100%;">
    <q-form class="q-gutter-md">
      <q-tabs v-model="tab" align="left" narrow-indicator>
        <q-tab name="basic" :label="$t('form.userDefinedJavaClass.tabBasic')"/>
        <q-tab name="field" :label="$t('form.userDefinedJavaClass.tabOutputFiled')"/>
        <q-tab name="javaParams" :label="$t('form.userDefinedJavaClass.tabParameter')"/>
        <q-tab name="infoStep" :label="$t('form.userDefinedJavaClass.tabInfoStep')"/>
        <q-tab name="targetStep" :label="$t('form.userDefinedJavaClass.tabTargetStep')"/>
        <q-tab name="runningConfig" :label="$t('form.userDefinedJavaClass.tabRunningConfig')"/>
      </q-tabs>
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="basic">
          <q-input outlined v-model="form.name" :label="$t('form.userDefinedJavaClass.name')" :rules="[ val => val && val.length > 0 || 'Please type something']" hint=""/>
          <q-input outlined v-model="form.script" type="textarea" rows="12" :label="$t('form.userDefinedJavaClass.script')" hint="">
            <template v-slot:prepend>
              <q-btn round dense flat icon="search" @click="loadHelps"/>
            </template>
          </q-input>
        </q-tab-panel>
        <q-tab-panel name="field">
          <q-table :data="form.outputFields" :columns="outputFieldColumns" :rows-per-page-options="[0]" row-key="name" separator="cell" hide-bottom :title="$t('form.userDefinedJavaClass.tableField')">
            <template v-slot:top-right>
              <q-btn size="sm" outline color="primary" icon="add" @click="addOutputField"/>
            </template>
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="operate" :props="props">
                  <q-btn size="xs" outline round color="negative" icon="remove" @click="deleteOutputField(props)"></q-btn>
                </q-td>
                <q-td key="field" :props="props">
                  {{ props.row.field }}
                  <q-popup-edit v-model="props.row.field" :auto-save="true">
                    <q-input autofocus outlined v-model="props.row.field"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="category" :props="props">
                  {{ props.row.category }}
                  <q-popup-edit v-model="props.row.category" :auto-save="true">
                    <q-select autofocus outlined v-model="props.row.category" :options="categories"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="lengthValue" :props="props">
                  {{ props.row.lengthValue }}
                  <q-popup-edit v-model.number="props.row.lengthValue" :auto-save="true">
                    <q-input autofocus outlined v-model.number="props.row.lengthValue"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="accuracy" :props="props">
                  {{ props.row.accuracy }}
                  <q-popup-edit v-model.number="props.row.accuracy" :auto-save="true">
                    <q-input autofocus outlined v-model.number="props.row.accuracy"/>
                  </q-popup-edit>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-tab-panel>
        <q-tab-panel name="javaParams">
          <q-table :data="form.javaParams" :columns="javaParamColumns" :rows-per-page-options="[0]" row-key="name" separator="cell" hide-bottom :title="$t('form.userDefinedJavaClass.argument')">
            <template v-slot:top-right>
              <q-btn size="sm" outline text-color="primary" icon="add" @click="addJavaParam"/>
            </template>
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="operate" :props="props">
                  <q-btn size="xs" round color="negative" icon="remove" @click="deleteJavaParam(props)"></q-btn>
                </q-td>
                <q-td key="tag" :props="props">
                  {{ props.row.tag }}
                  <q-popup-edit v-model="props.row.tag" :auto-save="true">
                    <q-input autofocus outlined v-model="props.row.tag"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="value" :props="props">
                  {{ props.row.value }}
                  <q-popup-edit v-model="props.row.value" :auto-save="true">
                    <q-input autofocus outlined v-model="props.row.value"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="description" :props="props">
                  {{ props.row.description }}
                  <q-popup-edit v-model="props.row.description" :auto-save="true">
                    <q-input autofocus outlined v-model="props.row.description"/>
                  </q-popup-edit>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-tab-panel>
        <q-tab-panel name="infoStep">
          <q-table :data="form.infoSteps" :columns="infoStepColumns" :rows-per-page-options="[0]" row-key="name" separator="cell" hide-bottom :title="$t('form.userDefinedJavaClass.tableInfoStep')">
            <template v-slot:top-right>
              <q-btn size="sm" outline text-color="primary" icon="add" @click="addInfoStep"/>
            </template>
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="operate" :props="props">
                  <q-btn size="xs" round color="negative" icon="remove"
                         @click="deleteInfoStep(props)"></q-btn>
                </q-td>
                <q-td key="tag" :props="props">
                  {{ props.row.tag }}
                  <q-popup-edit v-model="props.row.tag" :auto-save="true">
                    <q-input autofocus outlined v-model="props.row.tag"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="step" :props="props">
                  {{ showLabel(props.row.step) }}
                  <q-popup-edit v-model="props.row.step" :auto-save="true">
                    <q-select autofocus outlined v-model="props.row.step" :options="previousSteps" emit-value map-options/>
                  </q-popup-edit>
                </q-td>
                <q-td key="description" :props="props">
                  {{ props.row.description }}
                  <q-popup-edit v-model="props.row.description" :auto-save="true">
                    <q-input autofocus outlined v-model="props.row.description"/>
                  </q-popup-edit>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-tab-panel>
        <q-tab-panel name="targetStep">
          <q-table :data="form.targetSteps" :columns="targetStepColumns" :rows-per-page-options="[0]" row-key="name" separator="cell" hide-bottom :title="$t('form.userDefinedJavaClass.tableTargetStep')">
            <template v-slot:top-right>
              <q-btn size="sm" outline text-color="primary" icon="add" @click="addTargetStep"/>
            </template>
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="operate" :props="props">
                  <q-btn size="xs" round color="negative" icon="remove"
                         @click="deleteTargetStep(props)"></q-btn>
                </q-td>
                <q-td key="tag" :props="props">
                  {{ props.row.tag }}
                  <q-popup-edit v-model="props.row.tag" :auto-save="true">
                    <q-input autofocus outlined v-model="props.row.tag"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="step" :props="props">
                  {{ showLabel(props.row.step) }}
                  <q-popup-edit v-model="props.row.step" :auto-save="true">
                    <q-select autofocus outlined v-model="props.row.step" :options="nextSteps" emit-value map-options/>
                  </q-popup-edit>
                </q-td>
                <q-td key="description" :props="props">
                  {{ props.row.description }}
                  <q-popup-edit v-model="props.row.description" :auto-save="true">
                    <q-input autofocus outlined v-model="props.row.description"/>
                  </q-popup-edit>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-tab-panel>
        <q-tab-panel name="runningConfig">
          <q-input outlined v-model.number="form.parallel" :label="$t('form.userDefinedJavaClass.threads')" type="number" min="1" :disable="forbiddenParallel"/>
        </q-tab-panel>
      </q-tab-panels>
    <q-dialog v-model="helpDialog.mode" >
      <q-card style="width: 100vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ $t('form.userDefinedJavaClass.document') }}</div>
          <q-space/>
          <q-btn icon="close" flat round dense v-close-popup/>
        </q-card-section>
        <q-card-section class="items-center q-pb-none">
          <q-tabs v-model="helpDialog.tab" align="left" narrow-indicator>
            <q-tab name="function" :label="$t('form.userDefinedJavaClass.tabConstant')"/>
            <q-tab name="input" :label="$t('form.userDefinedJavaClass.tabInputParameter')"/>
          </q-tabs>
          <q-tab-panels v-model="helpDialog.tab" animated>
            <q-tab-panel name="function" class="row q-pa-md q-col-gutter-sm">
              <q-tree class="col-12 col-sm-5" :nodes="functions" node-key="label" :selected.sync="helpDialog.selected"/>
              <div class="col-12 col-sm-7 q-gutter-sm">
                <pre>{{getCode(helpDialog.selected)}}</pre>
              </div>
            </q-tab-panel>
            <q-tab-panel name="input">
              <q-tree :nodes="sourceFields" node-key="label" selected-color="primary"/>
            </q-tab-panel>
          </q-tab-panels>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-form>
  </div>
</template>

<script>

const FORBIDDEN_NEXT_STEP_PARALLEL = ['SwitchCaseMeta']
const IGNORE_REPEAT_WARNING_META = ['SortRowsMeta', 'UniqueRowsMeta', 'UniqueRowsByHashSetMeta']
export default {
  name: 'UserDefinedJavaClassMeta',
  data () {
    return {
      tab: 'basic',
      form: {
        name: null,
        script: null,
        outputFields: [],
        javaParams: [],
        infoSteps: [],
        targetSteps: [],
        parallel: 1,
        errorNext: null,
        errorEnable: false,
        errorCountName: null,
        errorColumnDescription: null,
        errorColumnName: null,
        errorColumnCode: null,
        errorMaxCount: 0,
        errorRate: 0,
        errorMinRows: 0
      },
      categories: ['BigNumber', 'Binary', 'Boolean', 'Date', 'Integer', 'Internet Address', 'Number', 'String', 'Timestamp'],
      helpDialog: {
        tab: 'function',
        mode: false,
        selected: null
      },
      outputFieldColumns: [
        {
          name: 'operate',
          label: this.$t('form.userDefinedJavaClass.columnOperate'),
          filed: 'operate',
          align: 'right',
          headerStyle: 'width: 20px'
        },
        {
          name: 'field',
          label: this.$t('form.userDefinedJavaClass.columnSourceField'),
          field: 'field',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'category',
          label: this.$t('form.userDefinedJavaClass.columnType'),
          field: 'category',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'lengthValue',
          label: this.$t('form.userDefinedJavaClass.columnLength'),
          field: 'lengthValue',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'accuracy',
          label: this.$t('form.userDefinedJavaClass.columnAccuracy'),
          field: 'accuracy',
          align: 'left',
          headerStyle: 'width: 100px;'
        }
      ],
      javaParamColumns: [
        {
          name: 'operate',
          label: this.$t('form.userDefinedJavaClass.columnOperate'),
          filed: 'operate',
          align: 'right',
          headerStyle: 'width: 20px'
        },
        {
          name: 'tag',
          label: this.$t('form.userDefinedJavaClass.columnTag'),
          field: 'tag',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'value',
          label: this.$t('form.userDefinedJavaClass.columnValue'),
          field: 'value',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'description',
          label: this.$t('form.userDefinedJavaClass.columnDescription'),
          field: 'description',
          align: 'left',
          headerStyle: 'width: 100px;'
        }
      ],
      infoStepColumns: [
        {
          name: 'operate',
          label: this.$t('form.userDefinedJavaClass.columnOperate'),
          filed: 'operate',
          align: 'right',
          headerStyle: 'width: 20px'
        },
        {
          name: 'tag',
          label: this.$t('form.userDefinedJavaClass.columnTag'),
          field: 'tag',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'step',
          label: this.$t('form.userDefinedJavaClass.columnStep'),
          field: 'step',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'description',
          label: this.$t('form.userDefinedJavaClass.columnDescription'),
          field: 'description',
          align: 'left',
          headerStyle: 'width: 100px;'
        }
      ],
      targetStepColumns: [
        {
          name: 'operate',
          label: this.$t('form.userDefinedJavaClass.columnOperate'),
          filed: 'operate',
          align: 'right',
          headerStyle: 'width: 20px'
        },
        {
          name: 'tag',
          label: this.$t('form.userDefinedJavaClass.columnTag'),
          field: 'tag',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'step',
          label: this.$t('form.userDefinedJavaClass.columnStep'),
          field: 'step',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'description',
          label: this.$t('form.userDefinedJavaClass.columnDescription'),
          field: 'description',
          align: 'left',
          headerStyle: 'width: 100px;'
        }
      ],
      functions: [
        {
          label: 'Common use',
          children: [
            { label: 'Main' },
            { label: 'Implement init' },
            { label: 'Implement dispose' },
            { label: 'getRow' },
            { label: 'getRowFrom' },
            { label: 'putRow' },
            { label: 'putRowTo' },
            { label: 'putError' },
            { label: 'setErrors' },
            { label: 'stopAll' },
            { label: 'setOutputDone' },
            { label: 'getVariable' },
            { label: 'checkFeedback' },
            { label: 'addResultFile' },
            { label: 'getResultFiles' }
          ]
        },
        {
          label: 'Step status',
          children: [
            { label: 'incrementLinesInput' },
            { label: 'incrementLinesOutput' },
            { label: 'incrementLinesRead' },
            { label: 'incrementLinesRejected' },
            { label: 'incrementLinesSkipped' },
            { label: 'incrementLinesWritten' },
            { label: 'getLinesInput' },
            { label: 'getLinesOutput' },
            { label: 'getLinesRead' },
            { label: 'getLinesRejected' },
            { label: 'getLinesSkipped' },
            { label: 'getLinesUpdated' },
            { label: 'getLinesWritten' },
            { label: 'getProcessed' },
            { label: 'getStatus' },
            { label: 'getStatusDescription' },
            { label: 'decrementLinesRead' },
            { label: 'decrementLinesWritten' },
            { label: 'setLinesInput' },
            { label: 'setLinesOutput' },
            { label: 'setLinesRead' },
            { label: 'setLinesRejected' },
            { label: 'setLinesSkipped' },
            { label: 'setLinesUpdated' },
            { label: 'setLinesWritten' }
          ]
        },
        {
          label: 'Step logging',
          children: [
            { label: 'logBasic' },
            { label: 'logDebug' },
            { label: 'logDetailed' },
            { label: 'logError(msg)' },
            { label: 'logError(msg,e)' },
            { label: 'logMinimal' },
            { label: 'logRowlevel' },
            { label: 'logSummary' }
          ]
        },
        {
          label: 'Step/Row listeners',
          children: [
            { label: 'addRowListener' },
            { label: 'addStepListener' },
            { label: 'getRowListeners' },
            { label: 'getStepListeners' },
            { label: 'removeRowListener' }
          ]
        },
        {
          label: 'Row manipulation',
          children: [
            { label: 'getInputRowMeta' },
            { label: 'getErrorRowMeta' },
            { label: 'getInputRowSets' },
            { label: 'getOutputRowSets' },
            { label: 'findInputRowSet(sourceStep)' },
            { label: 'findInputRowSet(from, fromcopy, to tocopy)' },
            { label: 'findOutputRowSet(targetStep)' },
            { label: 'findOutputRowSet(from, fromcopy, to tocopy)' }
          ]
        },
        {
          label: 'Uncommon use',
          children: [
            { label: 'getStepMeta' },
            { label: 'getTrans' },
            { label: 'getTransMeta' },
            { label: 'getStepDataInterface' },
            { label: 'getPartitionID' },
            { label: 'getPartitionTargets' },
            { label: 'getRepartitioning' },
            { label: 'isPartitioned' },
            { label: 'getClusterSize' },
            { label: 'getCopy' },
            { label: 'getErrors' },
            { label: 'getRuntime' },
            { label: 'getSlaveNr' },
            { label: 'getSocketRepository' },
            { label: 'getStepname' },
            { label: 'getTypeId' },
            { label: 'getUniqueStepCountAcrossSlaves' },
            { label: 'getUniqueStepNrAcrossSlaves' },
            { label: 'isDistributed' },
            { label: 'setVariable' }
          ]
        }
      ],
      mappings: [
        { label: 'Main', code: 'public boolean processRow(StepMetaInterface smi, StepDataInterface sdi) throws KettleException {\n  if (first) {\n    first = false;\n\n    /* TODO: Your code here. (Using info fields)\n\n    FieldHelper infoField = get(Fields.Info, "info_field_name");\n\n    RowSet infoStream = findInfoRowSet("info_stream_tag");\n\n    Object[] infoRow = null;\n\n    int infoRowCount = 0;\n\n    // Read all rows from info step before calling getRow() method, which returns first row from any\n    // input rowset. As rowMeta for info and input steps varies getRow() can lead to errors.\n    while((infoRow = getRowFrom(infoStream)) != null){\n\n      // do something with info data\n      infoRowCount++;\n    }\n    */\n  }\n\n  Object[] r = getRow();\n\n  if (r == null) {\n    setOutputDone();\n    return false;\n  }\n\n  // It is always safest to call createOutputRow() to ensure that your output row\'s Object[] is large\n  // enough to handle any new fields you are creating in this step.\n  r = createOutputRow(r, data.outputRowMeta.size());\n\n  /* TODO: Your code here. (See Sample)\n\n  // Get the value from an input field\n  String foobar = get(Fields.In, "a_fieldname").getString(r);\n\n  foobar += "bar";\n    \n  // Set a value in a new output field\n  get(Fields.Out, "output_fieldname").setValue(r, foobar);\n\n  */\n  // Send the row on to the next step.\n  putRow(data.outputRowMeta, r);\n\n  return true;\n}' },
        { label: 'Implement init', code: 'public boolean init(StepMetaInterface smi, StepDataInterface sdi) {\n  parent.initImpl(smi, sdi);\n}' },
        { label: 'Implement dispose', code: 'public void dispose(StepMetaInterface smi, StepDataInterface sdi) {\n  parent.disposeImpl(smi, sdi);\n}' },
        { label: 'getRow', code: 'Object[] r = getRow();' },
        { label: 'getRowFrom', code: 'Object[] row = getRowFrom(rowSet);' },
        { label: 'putRow', code: 'putRow(row, data);' },
        { label: 'putRowTo', code: 'putRowTo(rowMeta, row, rowSet);' },
        { label: 'putError', code: 'putError(rowMeta, row, nrErrors, errorDescriptions, fieldNames, errorCodes);' },
        { label: 'setErrors', code: 'setErrors(1);' },
        { label: 'stopAll', code: 'stopAll();' },
        { label: 'setOutputDone', code: 'setOutputDone();' },
        { label: 'getVariable', code: 'String getVariable = getVariable(variableName, defaultValue);' },
        { label: 'checkFeedback', code: 'boolean checkFeedback = checkFeedback(lines);' },
        { label: 'addResultFile', code: 'addResultFile(resultFile);' },
        { label: 'getResultFiles', code: 'Map getResultFiles = getResultFiles();' },
        { label: 'getStepMeta', code: 'StepMeta getStepMeta = getStepMeta();' },
        { label: 'getTrans', code: 'Trans getTrans = getTrans();' },
        { label: 'getTransMeta', code: 'TransMeta getTransMeta = getTransMeta();' },
        { label: 'getStepDataInterface', code: 'StepDataInterface getStepDataInterface = getStepDataInterface();' },
        { label: 'getPartitionID', code: 'String getPartitionID = getPartitionID();' },
        { label: 'getPartitionTargets', code: 'Map getPartitionTargets = getPartitionTargets();' },
        { label: 'getRepartitioning', code: 'int getRepartitioning = getRepartitioning();' },
        { label: 'isPartitioned', code: 'boolean isPartitioned = isPartitioned();' },
        { label: 'getClusterSize', code: 'int getClusterSize = getClusterSize();' },
        { label: 'getCopy', code: 'int getCopy = getCopy();' },
        { label: 'getErrors', code: 'long getErrors = getErrors();' },
        { label: 'getRuntime', code: 'long getRuntime = getRuntime();' },
        { label: 'getSlaveNr', code: 'int getSlaveNr = getSlaveNr();' },
        { label: 'getSocketRepository', code: 'SocketRepository getSocketRepository = getSocketRepository();' },
        { label: 'getStepname', code: 'String getStepname = getStepname();' },
        { label: 'getTypeId', code: 'String getTypeId = getTypeId();' },
        { label: 'getUniqueStepCountAcrossSlaves', code: 'int getUniqueStepCountAcrossSlaves = getUniqueStepCountAcrossSlaves();' },
        { label: 'getUniqueStepNrAcrossSlaves', code: 'int getUniqueStepNrAcrossSlaves = getUniqueStepNrAcrossSlaves();' },
        { label: 'isDistributed', code: 'boolean isDistributed = isDistributed();' },
        { label: 'setVariable', code: 'setVariable(variableName, variableValue);' },
        { label: 'getInputRowMeta', code: 'RowMetaInterface getInputRowMeta = getInputRowMeta();' },
        { label: 'getErrorRowMeta', code: 'RowMetaInterface getErrorRowMeta = getErrorRowMeta();' },
        { label: 'getInputRowSets', code: 'List getInputRowSets = getInputRowSets();' },
        { label: 'getOutputRowSets', code: 'List getOutputRowSets = getOutputRowSets();' },
        { label: 'findInputRowSet(sourceStep)', code: 'RowSet findInputRowSet = findInputRowSet(sourceStep);' },
        { label: 'findInputRowSet(from, fromcopy, to tocopy)', code: 'RowSet findInputRowSet = findInputRowSet(from, fromcopy, to, tocopy);' },
        { label: 'findOutputRowSet(targetStep)', code: 'RowSet findOutputRowSet = findOutputRowSet(targetStep);' },
        { label: 'findOutputRowSet(from, fromcopy, to tocopy)', code: 'RowSet findOutputRowSet = findOutputRowSet(from, fromcopy, to, tocopy);' },
        { label: 'addRowListener', code: 'addRowListener(rowListener);' },
        { label: 'addStepListener', code: 'addStepListener(stepListener);' },
        { label: 'getRowListeners', code: 'List getRowListeners = getRowListeners();' },
        { label: 'getStepListeners', code: 'List getStepListeners = getStepListeners();' },
        { label: 'removeRowListener', code: 'removeRowListener(rowListener);' },
        { label: 'logBasic', code: 'logBasic(msg);' },
        { label: 'logDebug', code: 'logDebug(msg);' },
        { label: 'logDetailed', code: 'logDetailed(msg);' },
        { label: 'logError(msg)', code: 'logError(msg);' },
        { label: 'logError(msg,e)', code: 'logError(msg, e);' },
        { label: 'logMinimal', code: 'logMinimal(msg);' },
        { label: 'logRowlevel', code: 'logRowlevel(msg);' },
        { label: 'logSummary', code: 'logSummary(msg);' },
        { label: 'incrementLinesInput', code: 'long incrementLinesInput = incrementLinesInput();' },
        { label: 'incrementLinesOutput', code: 'long incrementLinesOutput = incrementLinesOutput();' },
        { label: 'incrementLinesRead', code: 'long incrementLinesRead = incrementLinesRead();' },
        { label: 'incrementLinesRejected', code: 'long incrementLinesRejected = incrementLinesRejected();' },
        { label: 'incrementLinesSkipped', code: 'long incrementLinesSkipped = incrementLinesSkipped();' },
        { label: 'incrementLinesWritten', code: 'long incrementLinesUpdated = incrementLinesUpdated();' },
        { label: 'getLinesInput', code: 'long incrementLinesWritten = incrementLinesWritten();' },
        { label: 'getLinesOutput', code: 'long getLinesInput = getLinesInput();' },
        { label: 'getLinesRead', code: 'long getLinesOutput = getLinesOutput();' },
        { label: 'getLinesRejected', code: 'long getLinesRead = getLinesRead();' },
        { label: 'getLinesSkipped', code: 'long getLinesRejected = getLinesRejected();' },
        { label: 'getLinesUpdated', code: 'long getLinesSkipped = getLinesSkipped();' },
        { label: 'getLinesWritten', code: 'long getLinesWritten = getLinesWritten();;' },
        { label: 'getProcessed', code: 'long getProcessed = getProcessed();' },
        { label: 'getStatus', code: 'StepExecutionStatus getStatus = getStatus();' },
        { label: 'getStatusDescription', code: 'String getStatusDescription = getStatusDescription();' },
        { label: 'decrementLinesRead', code: 'long decrementLinesRead = decrementLinesRead();' },
        { label: 'decrementLinesWritten', code: 'long decrementLinesWritten = decrementLinesWritten();' },
        { label: 'setLinesInput', code: 'setLinesInput(newLinesInputValue);' },
        { label: 'setLinesOutput', code: 'setLinesOutput(newLinesOutputValue);' },
        { label: 'setLinesRead', code: 'setLinesRead(newLinesReadValue);' },
        { label: 'setLinesRejected', code: 'setLinesRejected(linesRejected);' },
        { label: 'setLinesSkipped', code: 'setLinesSkipped(newLinesSkippedValue);' },
        { label: 'setLinesUpdated', code: 'setLinesUpdated(newLinesUpdatedValue);' },
        { label: 'setLinesWritten', code: 'setLinesWritten(newLinesWrittenValue);' }
      ],
      previousSteps: [],
      nextSteps: [],
      sourceFields: [],
      forbiddenParallel: false
    }
  },
  methods: {
    getCode (key) {
      const value = this.mappings.filter(mapping => mapping.label === key)
      if (value.length > 0) {
        return value[0].code
      }
      return null
    },
    validate (val) {
      return val != null
    },
    addOutputField () {
      this.form.outputFields.push({
        field: null,
        category: 'String',
        lengthValue: -1,
        accuracy: -1
      })
    },
    deleteOutputField (props) {
      this.form.outputFields.splice(props.rowIndex, 1)
    },
    addJavaParam () {
      this.form.javaParams.push({
        tag: null,
        value: null,
        description: null
      })
    },
    deleteJavaParam (props) {
      this.form.javaParams.splice(props.rowIndex, 1)
    },
    addInfoStep () {
      this.form.infoSteps.push({
        tag: null,
        step: null,
        description: null
      })
    },
    deleteInfoStep (props) {
      this.form.infoSteps.splice(props.rowIndex, 1)
    },
    addTargetStep () {
      this.form.targetSteps.push({
        tag: null,
        step: null,
        description: null
      })
    },
    deleteTargetStep (props) {
      this.form.targetSteps.splice(props.rowIndex, 1)
    },
    loadHelps () {
      const vm = this
      vm.helpDialog.mode = true
    },
    createSourceField (val, done) {
      if (val.length > 0) {
        if (!this.sourceFields.includes(val)) {
          this.sourceFields.push(val)
        }
        done(val, 'toggle')
      }
    },
    submitForm () {
      this.$emit('propertiesForm', {
        state: true,
        mxCellProperties: this.form,
        ext: { sourceFields: this.form.outputFields.map(ele => ele.name ? ele.name.toUpperCase() : ele.field.toUpperCase()) }
      })
    },
    showLabel (val) {
      const steps = this.nextSteps.filter(step => step.value === val)
      if (steps.length > 0) {
        return steps[0].label
      }
      return null
    }
  },
  mounted () {
    const vm = this
    const previousSteps = vm.$store.getters['etl/getPreNodes']
    vm.previousSteps = []
    if (previousSteps && previousSteps.length > 0) {
      previousSteps.forEach(step => {
        if (step.depth === 0) {
          vm.previousSteps.push({ value: step.value, label: step.title })
        }
      })
    }
    vm.sourceFields = []
    const replaceFields = []
    if (previousSteps && previousSteps.length > 0) {
      previousSteps.forEach((step, i) => {
        if (i === 0 && FORBIDDEN_NEXT_STEP_PARALLEL.indexOf(step.type) >= 0) {
          vm.forbiddenParallel = true
        }
        if (step.ext !== undefined && step.ext !== 'undefined' && IGNORE_REPEAT_WARNING_META.indexOf(step.type) < 0) {
          const ext = JSON.parse(step.ext)
          if (ext.sourceFields) {
            ext.sourceFields.forEach(field => {
              vm.sourceFields.push({
                label: field
              })
            })
          }
          if (ext.replaceFields) {
            ext.replaceFields.forEach(field => {
              replaceFields.push(field)
            })
          }
        }
      })
    }
    replaceFields.forEach(field => {
      vm.sourceFields.splice(vm.sourceFields.indexOf(field), 1)
    })
    if (new Set(vm.sourceFields).size !== vm.sourceFields.length) {
      vm.$q.dialog({
        dark: true,
        title: vm.$t('message.error.default'),
        message: this.$t('message.error.duplicateSourceField')
      }).onOk(() => {
        this.$emit('propertiesForm', {
          state: true,
          mxCellProperties: this.form,
          ext: {
            sourceFields: []
          }
        })
      })
    }
    const nextSteps = vm.$store.getters['etl/getNextNodes']
    vm.nextSteps = []
    if (nextSteps && nextSteps.length > 0) {
      nextSteps.forEach(step => {
        vm.nextSteps.push({ value: step.value, label: step.title })
      })
    }
    const mxCellValue = vm.$store.getters['etl/getMxCellForm']
    if (mxCellValue) {
      vm.form = Object.assign(vm.form, mxCellValue)
    }
  }
}
</script>
