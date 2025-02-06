<template>
  <div style="width: 100%;">
    <q-form class="q-gutter-md">
      <q-tabs v-model="tab" align="left" narrow-indicator>
        <q-tab name="basic" :label="$t('form.javaScript.tabBasic')"/>
        <q-tab name="runningConfig" :label="$t('form.javaScript.tabRunningConfig')"/>
      </q-tabs>
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel class="row q-col-gutter-xs" name="basic">
          <q-input class="col-12 col-md-5" outlined v-model="form.name" :label="$t('form.javaScript.name')" :rules="[ val => val && val.length > 0 || 'Please type something']" hint=""/>
          <q-input class="col-12 col-md-5" outlined type="number" v-model.number="form.level" :label="$t('form.javaScript.optimizationLevel')" hint=""/>
          <q-checkbox class="col-12 col-md-2" outlined v-model="form.compatible" :label="$t('form.javaScript.compatible')" hint=""/>
          <q-input class="col-12" outlined v-model="form.script" type="textarea" rows="12" :label="$t('form.javaScript.script')" hint="">
            <template v-slot:prepend>
              <q-btn round dense flat icon="search" @click="loadHelps"/>
            </template>
          </q-input>
          <q-table :data="form.parameters" :columns="parameterColumns" :rows-per-page-options="[0]" row-key="name" separator="cell" hide-bottom :title="$t('form.javaScript.tableOututField')">
            <template v-slot:top-right>
              <q-btn size="sm" outline color="primary" icon="add" @click="addParameter"/>
            </template>
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="operate" :props="props">
                  <q-btn size="xs" outline round color="negative" icon="remove" @click="deleteParameter(props)"></q-btn>
                </q-td>
                <q-td key="field" :props="props">
                  {{ props.row.field }}
                  <q-popup-edit v-model="props.row.field" :auto-save="true">
                    <q-input autofocus outlined v-model="props.row.field"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="name" :props="props">
                  {{ props.row.name }}
                  <q-popup-edit v-model="props.row.name" :auto-save="true">
                    <q-input autofocus outlined v-model="props.row.name"/>
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
                  <q-popup-edit type="number" v-model.number="props.row.lengthValue" :auto-save="true">
                    <q-input autofocus outlined type="number" v-model.number="props.row.lengthValue"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="accuracy" :props="props">
                  {{ props.row.accuracy }}
                  <q-popup-edit type="number" v-model.number="props.row.accuracy" :auto-save="true">
                    <q-input autofocus outlined type="number" v-model.number="props.row.accuracy"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="rename" :props="props">
                  {{ props.row.rename }}
                  <q-popup-edit v-model="props.row.rename" :auto-save="true">
                    <q-select autofocus outlined v-model="props.row.rename" :options="renames"/>
                  </q-popup-edit>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-tab-panel>
        <q-tab-panel name="runningConfig">
          <q-input outlined type="number" v-model.number="form.parallel" :label="$t('form.javaScript.threads')" min="1" :disable="forbiddenParallel"/>
        </q-tab-panel>
      </q-tab-panels>
    <q-dialog v-model="helpDialog.mode">
      <q-card style="width: 100vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ $t('form.javaScript.document') }}</div>
          <q-space/>
          <q-btn icon="close" flat round dense v-close-popup/>
        </q-card-section>
        <q-card-section class="items-center q-pb-none">
          <q-tabs v-model="helpDialog.tab" align="left" narrow-indicator>
            <q-tab name="constant" :label="$t('form.javaScript.tabConstant')"/>
            <q-tab name="function" :label="$t('form.javaScript.tabFunction')"/>
            <q-tab name="input" :label="$t('form.javaScript.tabInputParameter')"/>
          </q-tabs>
          <q-separator />
          <q-tab-panels v-model="helpDialog.tab" animated>
            <q-tab-panel name="constant">
              <q-tree :nodes="constants" node-key="label"/>
            </q-tab-panel>
            <q-tab-panel name="function">
              <q-tree :nodes="functions" node-key="label"/>
            </q-tab-panel>
            <q-tab-panel name="input">
              <q-tree :nodes="sourceFields" node-key="label"/>
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
const IGNORE_REPEAT_WARNING_META = ['SortRowsMeta', 'SetValueFieldMeta']
export default {
  name: 'JavaScriptMeta',
  data () {
    return {
      tab: 'basic',
      form: {
        name: null,
        script: null,
        compatible: false,
        level: 9,
        distribute: true,
        parameters: [],
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
      renames: ['Y', 'N'],
      helpDialog: {
        tab: 'input',
        mode: false
      },
      parameterColumns: [
        {
          name: 'operate',
          label: this.$t('form.javaScript.columnOperate'),
          filed: 'operate',
          align: 'right',
          headerStyle: 'width: 20px'
        },
        {
          name: 'field',
          label: this.$t('form.javaScript.columnField'),
          field: 'field',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'name',
          label: this.$t('form.javaScript.columnName'),
          field: 'name',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'category',
          label: this.$t('form.javaScript.columnType'),
          field: 'category',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'lengthValue',
          label: this.$t('form.javaScript.columnLength'),
          field: 'lengthValue',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'accuracy',
          label: this.$t('form.javaScript.columnAccuracy'),
          field: 'accuracy',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'rename',
          label: this.$t('form.javaScript.columnRename'),
          field: 'rename',
          align: 'left',
          headerStyle: 'width: 100px;'
        }
      ],
      constants: [{ label: 'SKIP_TRANSFORMATION' }, { label: 'ERROR_TRANSFORMATION' }, { label: 'CONTINUE_TRANSFORMATION' }],
      functions: [
        {
          label: 'String Functions',
          children: [
            { label: 'date2str(var)' },
            { label: 'date2str(var, var)' },
            { label: 'date2str(var, var, var)' },
            { label: 'date2str(var, var, var, var)' },
            { label: 'escapeHtml(var)' },
            { label: 'escapeSQL(var)' },
            { label: 'escapeXml(var)' },
            { label: 'fillString(var)' },
            { label: 'getOcuranceString' },
            { label: 'indexOf(var, var)' },
            { label: 'indexOf(var, var, var)' },
            { label: 'initCap(var)' },
            { label: 'lower(var)' },
            { label: 'lpad(var, var, var)' },
            { label: 'ltrim(var)' },
            { label: 'num2str(var)' },
            { label: 'num2str(var, var)' },
            { label: 'num2str(var, var, var)' },
            { label: 'protectXMLCDATA(var)' },
            { label: 'removeCRLF(var)' },
            { label: 'replace(var, var, var)' },
            { label: 'rpad(var, var, var)' },
            { label: 'rtrim(var)' },
            { label: 'str2RegExp(var, var)' },
            { label: 'substr(var, var)' },
            { label: 'substr(var, var, var)' },
            { label: 'trim(var)' },
            { label: 'unEscapeHtml(var)' },
            { label: 'unEscapeXml(var)' },
            { label: 'upper(var)' }
          ]
        },
        {
          label: 'Numeric Functions',
          children: [
            { label: 'abs(var)' },
            { label: 'ceil(var)' },
            { label: 'floor(var)' },
            { label: 'str2num(var)' },
            { label: 'str2num(var, var)' },
            { label: 'trunc(var)' }
          ]
        },
        {
          label: 'Date Functions',
          children: [
            { label: 'dateAdd(var, var, var)' },
            { label: 'dateDiff(var, var, var)' },
            { label: 'getDayNumber(var, var)' },
            { label: 'getFiscalDate(var, var)' },
            { label: 'getNextWorkingDay(var)' },
            { label: 'month(var)' },
            { label: 'quarter(var)' },
            { label: 'str2date(var)' },
            { label: 'str2date(var, var)' },
            { label: 'str2date(var, var, var)' },
            { label: 'str2date(var, var, var, var)' },
            { label: 'truncDate(var, var)' },
            { label: 'week(var)' },
            { label: 'year(var)' }
          ]
        },
        {
          label: 'Logic Functions',
          children: [
            { label: 'isCodepage(var, var)' },
            { label: 'isDate(var)' },
            { label: 'isEmpty(var)' },
            { label: 'isMailValid(var)' },
            { label: 'isNum(var)' },
            { label: 'isRegExp(var, var)' },
            { label: 'isWorkingDay(var)' }
          ]
        },
        {
          label: 'Special Functions',
          children: [
            { label: 'Alert(var)' },
            { label: 'LoadScriptFile(var)' },
            { label: 'LoadScriptFromTab(var)' },
            { label: 'LuhnCheck(var)' },
            { label: 'appendToFile(var, var)' },
            { label: 'decode(var, var, var)' },
            { label: 'execProcess(var)' },
            { label: 'fireToDB(var, var)' },
            { label: 'getDigitsOnly(var)' },
            { label: 'getEnvironmentVar(var)' },
            { label: 'getProcessCount(var)' },
            { label: 'getTransformationName()' },
            { label: 'getVariable(var, var)' },
            { label: 'print(var)' },
            { label: 'println(var)' },
            { label: 'removeDigits(var)' },
            { label: 'resolveIP(var)' },
            { label: 'sendMail(var, var, var, var)' },
            { label: 'setEnvironmentVar(var, var)' },
            { label: 'setVariable(var)' },
            { label: 'writeToLog(var)' },
            { label: 'writeToLog(var, var)' }
          ]
        },
        {
          label: 'File Functions',
          children: [
            { label: 'copyFile(var, var, var)' },
            { label: 'createFolder(var)' },
            { label: 'deleteFile(var)' },
            { label: 'fileExists(var)' },
            { label: 'getFileExtension(var)' },
            { label: 'getFileSize(var)' },
            { label: 'getLastModifiedTime(var)' },
            { label: 'getParentFoldername(var)' },
            { label: 'getShortFilename(var)' },
            { label: 'isFIle(var)' },
            { label: 'isFolder(var)' },
            { label: 'loadFileContent(var)' },
            { label: 'loadFileContent(var, var)' },
            { label: 'moveFile(var, var, var)' },
            { label: 'touch(var)' }
          ]
        }
      ],
      sourceFields: [],
      forbiddenParallel: false
    }
  },
  methods: {
    validate (val) {
      return val != null
    },
    addParameter () {
      this.form.parameters.push({
        field: null,
        name: null,
        category: 'String',
        lengthValue: -1,
        accuracy: -1,
        rename: null
      })
    },
    deleteParameter (props) {
      this.form.parameters.splice(props.rowIndex, 1)
    },
    loadHelps () {
      const vm = this
      vm.helpDialog.mode = true
    },
    submitForm (e) {
      this.$emit('propertiesForm', {
        state: true,
        mxCellProperties: this.form,
        ext: { sourceFields: this.form.parameters.map(ele => ele.name ? ele.name : ele.field) }
      })
    }
  },
  mounted () {
    const vm = this
    const previousSteps = vm.$store.getters['etl/getPreNodes']
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
    const mxCellValue = vm.$store.getters['etl/getMxCellForm']
    if (mxCellValue) {
      vm.form = Object.assign(vm.form, mxCellValue)
    }
  }
}
</script>
