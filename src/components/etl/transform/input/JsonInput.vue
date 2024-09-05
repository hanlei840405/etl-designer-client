<template>
  <div style="width: 100%;">
    <q-form class="q-gutter-md">
      <q-tabs v-model="tab" active-color="primary" active-bg-color="grey-3" align="left" narrow-indicator>
        <q-tab name="basic" :label="$t('form.jsonInput.tabBasic')"/>
        <!-- <q-tab name="content" :label="$t('form.jsonInput.tabContent')"/> -->
        <q-tab name="runningConfig" :label="$t('form.jsonInput.tabRunningConfig')"/>
      </q-tabs>
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel class="row q-col-gutter-xs" name="basic">
          <q-input class="col-12 col-md-6" outlined v-model="form.name" :label="$t('form.jsonInput.name')" :rules="[ val => val && val.length > 0 || 'Please type something']" hint=""/>
          <q-select class="col-12 col-md-6" clearable outlined v-model="form.valueField" :options="sourceFields" :label="$t('form.jsonInput.sourceFromField')" @clear="form.executeEachInputRow = false" hint=""/>
          <q-table :data="form.parameters" :columns="parameterColumns" :rows-per-page-options="[0]" row-key="field" separator="cell" hide-bottom :title="$t('form.jsonInput.tableField')">
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
                <q-td key="path" :props="props">
                  {{ props.row.path }}
                  <q-popup-edit v-model="props.row.path" :auto-save="true">
                    <q-input autofocus outlined v-model="props.row.path"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="category" :props="props">
                  {{ props.row.category }}
                  <q-popup-edit v-model="props.row.category" :auto-save="true">
                    <q-select autofocus outlined v-model="props.row.category" :options="categories"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="formatValue" :props="props">
                  {{ props.row.formatValue }}
                  <q-popup-edit v-model="props.row.formatValue" :auto-save="true">
                    <q-select autofocus outlined v-model="props.row.formatValue" :options="formats"/>
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
                <q-td key="currency" :props="props">
                  {{ props.row.currency }}
                  <q-popup-edit v-model="props.row.currency" :auto-save="true">
                    <q-input autofocus outlined v-model="props.row.currency"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="decimal" :props="props">
                  {{ props.row.decimal }}
                  <q-popup-edit v-model="props.row.decimal" :auto-save="true">
                    <q-input autofocus outlined v-model="props.row.decimal"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="groupBy" :props="props">
                  {{ props.row.groupBy }}
                  <q-popup-edit v-model="props.row.groupBy" :auto-save="true">
                    <q-input autofocus outlined v-model="props.row.groupBy"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="removeBlank" :props="props">
                  {{ props.row.removeBlank }}
                  <q-popup-edit v-model="props.row.removeBlank" :auto-save="true">
                    <q-select autofocus outlined v-model="props.row.removeBlank" :options="removeBlanks"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="repeat" :props="props">
                  {{ props.row.repeat }}
                  <q-popup-edit v-model="props.row.repeat" :auto-save="true">
                    <q-select autofocus outlined v-model="props.row.repeat" :options="yesOrNo"/>
                  </q-popup-edit>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-tab-panel>
        <!-- <q-tab-panel name="content">
          <q-checkbox outlined v-model="form.ignoreEmptyFile" :label="$t('form.jsonInput.ignoreEmptyFile')" />
          <q-checkbox outlined v-model="form.notFailIfNoFile" :label="$t('form.jsonInput.noFileNoError')" />
          <q-checkbox outlined v-model="form.ignoreMissingPath" :label="$t('form.jsonInput.ignoreMissingPath')" />
          <q-checkbox outlined v-model="form.defaultPathLeafToNull" label="Default path leaf to null" />
          <q-input outlined v-model.number="form.rowLimit" :label="$t('form.jsonInput.limit')"/>
          <q-checkbox outlined v-model="form.includeFilename" :label="$t('form.jsonInput.includeFilenameOutput')" />
          <q-input outlined v-model="form.filenameField" :label="$t('form.jsonInput.filenameField')"/>
          <q-checkbox outlined v-model="form.includeRowNumber" :label="$t('form.jsonInput.rownumInOutput')" />
          <q-input outlined v-model="form.rowNumberField" :label="$t('form.jsonInput.rownumField')"/>
        </q-tab-panel> -->
        <q-tab-panel name="runningConfig">
          <q-input outlined color="primary" v-model.number="form.parallel" :label="$t('form.jsonInput.threads')" type="number" min="1" :disable="forbiddenParallel"/>
        </q-tab-panel>
      </q-tab-panels>
  </q-form>
  </div>
</template>

<script>
const FORBIDDEN_NEXT_STEP_PARALLEL = ['SwitchCaseMeta']
const IGNORE_REPEAT_WARNING_META = ['SortRowsMeta', 'UniqueRowsMeta', 'UniqueRowsByHashSetMeta']
export default {
  name: 'JsonInputMeta',
  data () {
    return {
      tab: 'basic',
      form: {
        name: null,
        inFields: true,
        valueField: null,
        sourceFileData: [],
        ignoreEmptyFile: false,
        notFailIfNoFile: true,
        ignoreMissingPath: true,
        defaultPathLeafToNull: true,
        rowLimit: 0,
        includeFilename: false,
        filenameField: null,
        includeRowNumber: false,
        rowNumberField: null,
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
        errorMinRows: 0,
        distribute: true
      },
      parameterColumns: [
        {
          name: 'operate',
          label: this.$t('form.jsonInput.columnOperate'),
          field: 'operate',
          align: 'right',
          headerStyle: 'width: 20px'
        },
        {
          name: 'field',
          label: this.$t('form.jsonInput.columnName'),
          field: 'field',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'path',
          label: this.$t('form.jsonInput.columnFilePath'),
          field: 'path',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'category',
          label: this.$t('form.jsonInput.columnType'),
          field: 'category',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'formatValue',
          label: this.$t('form.jsonInput.columnFormat'),
          field: 'formatValue',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'lengthValue',
          label: this.$t('form.jsonInput.columnLength'),
          field: 'lengthValue',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'accuracy',
          label: this.$t('form.jsonInput.columnAccuracy'),
          field: 'accuracy',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'currency',
          label: this.$t('form.jsonInput.columnCurrency'),
          field: 'currency',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'decimal',
          label: this.$t('form.jsonInput.columnDecimalSystem'),
          field: 'decimal',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'groupBy',
          label: this.$t('form.jsonInput.columnGroup'),
          field: 'decimal',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'removeBlank',
          label: this.$t('form.jsonInput.columnRemoveBlank'),
          field: 'removeBlank',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'repeat',
          label: this.$t('form.jsonInput.columnRepeat'),
          field: 'repeat',
          align: 'left',
          headerStyle: 'width: 100px;'
        }
      ],
      removeBlanks: ['none', 'left', 'right', 'both'],
      yesOrNo: ['Y', 'N'],
      categories: ['BigNumber', 'Binary', 'Boolean', 'Date', 'Integer', 'Internet Address', 'Number', 'String', 'Timestamp'],
      formats: ['yyyy/MM/dd HH:mm:ss.SSS', 'yyyy/MM/dd HH:mm:ss.SSS XXX', 'yyyy/MM/dd HH:mm:ss', 'yyyy/MM/dd HH:mm:ss XXX', 'yyyyMMddHHmmss', 'yyyy/MM/dd', 'yyyy-MM-dd', 'yyyy-MM-dd HH:mm:ss', 'yyyy-MM-dd HH:mm:ss XXX',
        'yyyyMMdd', 'MM/dd/yyyy', 'MM/dd/yyyy HH:mm:ss', 'MM-dd-yyyy', 'MM-dd-yyyy HH:mm:ss', 'MM/dd/yy', 'MM-dd-yy', 'dd/MM/yyyy', 'dd-MM-yyyy', 'yyyy-MM-dd\'T\'HH:mm:ss.SSSXXX', 'yyyy-MM-dd HH:mm:ss.SSS', '#,##0.###', '0.00', '0000000000000',
        '#.#', '#', '###,###,###.#', '#######.###', '#####.###%'],
      sourceFields: [],
      forbiddenParallel: false
    }
  },
  methods: {
    addSourceFile () {
      this.form.sourceFileData.push({
        path: null,
        wildcard: null,
        excludeWildcard: null,
        required: null,
        includeChildrenFolder: null
      })
    },
    deleteSourceFile (props) {
      this.form.sourceFileData.splice(props.rowIndex, 1)
    },
    addParameter () {
      this.form.parameters.push({
        field: null,
        path: null,
        category: 'String',
        lengthValue: -1,
        accuracy: -1,
        formatValue: null,
        currency: null,
        decimal: null,
        removeBlank: null,
        repeat: null
      })
    },
    deleteParameter (props) {
      this.form.parameters.splice(props.rowIndex, 1)
    },
    submitForm () {
      this.$emit('propertiesForm', {
        state: true,
        mxCellProperties: this.form,
        ext: { sourceFields: this.form.parameters.map(ele => ele.field) }
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
              vm.sourceFields.push(field)
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
      if (vm.form.sheet) {
        vm.sheets.push(vm.form.sheet)
      }
    }
    const root = vm.$store.getters['etl/getRoot']
    vm.auto = root.auto
  }
}
</script>
