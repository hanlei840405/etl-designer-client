<template>
  <div style="width: 100%;">
    <q-form class="q-gutter-md">
      <q-tabs v-model="tab" align="left" narrow-indicator>
        <q-tab name="basic" :label="$t('form.excelOutput.tabBasic')"/>
        <q-tab name="sheet" :label="$t('form.excelOutput.tabSheet')"/>
        <q-tab name="content" :label="$t('form.excelOutput.tabContent')"/>
        <q-tab name="field" :label="$t('form.excelOutput.tabField')"/>
        <q-tab name="runningConfig" :label="$t('form.excelOutput.tabRunningConfig')"/>
      </q-tabs>
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel class="row q-col-gutter-xs" name="basic">
          <q-input class="col-12 col-md-6" outlined v-model="form.name" :label="$t('form.excelOutput.name')" lazy-rules :rules="[ val => val && val.length > 0 || 'Please type something']" hint=""/>
          <q-input class="col-12 col-md-6" outlined v-model="form.filename" :label="$t('form.excelOutput.filename')" hint=""/>
          <q-select class="col-12 col-md-6" outlined v-model="form.suffix" :options="suffixes" emit-value map-options :label="$t('form.excelOutput.suffix')" hint=""/>
          <q-input class="col-12 col-md-6" outlined type="number" v-model.number="form.rowNumber" :label="$t('form.excelOutput.splitEveryDataRows')" hint=""/>
          <q-select class="col-12 col-md-6" outlined v-model="form.fileOutputMode" :options="outputModes" emit-value map-options :label="$t('form.excelOutput.existOutputFile')" hint=""/>
          <q-select class="col-12 col-md-6" outlined v-model="form.dateFormat" :options="formats" emit-value map-options :label="$t('form.excelOutput.dateFormat')" :disable="!form.useDateFormat" hint=""/>
          <q-checkbox class="col-12 col-md-4" v-model="form.useDateFormat" :label="$t('form.excelOutput.specifyDateFormat')"/>
          <q-checkbox class="col-12 col-md-4" v-model="form.useStream" :label="$t('form.excelOutput.streamXlsxData')"/>
          <q-checkbox class="col-12 col-md-4" v-model="form.useStepInfoSuffix" :label="$t('form.excelOutput.includeStepnrInFilename')"/>
          <q-checkbox class="col-12 col-md-4" v-model="form.useDateSuffix" :label="$t('form.excelOutput.includeDateInFilename')"/>
          <q-checkbox class="col-12 col-md-4" v-model="form.useTimeSuffix" :label="$t('form.excelOutput.includeTimeInFilename')"/>
          <q-checkbox class="col-12 col-md-4" v-model="form.generateMode" :label="$t('form.excelOutput.waitForFirstRowBeforeCreatingFile')"/>
          <q-checkbox class="col-12 col-md-12" v-model="form.nameInResult" :label="$t('form.excelOutput.addFilenameToResult')"/>
        </q-tab-panel>
        <q-tab-panel class="row q-col-gutter-xs" name="sheet">
          <q-input class="col-12 col-md-6" outlined v-model="form.sheetName" :label="$t('form.excelOutput.sheetName')" hint=""/>
          <q-select class="col-12 col-md-6" outlined v-model="form.sheetOutputMode" :options="outputModes" emit-value map-options :label="$t('form.excelOutput.sheetExist')" hint=""/>
          <q-checkbox class="col-12 col-md-6" v-model="form.asActiveSheet" :label="$t('form.excelOutput.makeActive')"/>
        </q-tab-panel>
        <q-tab-panel class="row q-col-gutter-xs" name="content">
          <q-input class="col-12 col-md-6" outlined v-model="form.startPoint" :label="$t('form.excelOutput.startCell')" hint=""/>
          <q-select class="col-12 col-md-6" outlined v-model="form.cellOutputMode" :options="outputModes" emit-value map-options :label="$t('form.excelOutput.whenWritingRows')" hint=""/>
          <q-input class="col-12 col-md-6" outlined type="number" v-model.number="form.deleteLines" :label="$t('form.excelOutput.skipRows')" hint=""/>
          <q-input class="col-12 col-md-6" outlined type="number" v-model.number="form.emptyLines" :label="$t('form.excelOutput.beginWritingEmptyLines')" hint=""/>
          <q-checkbox class="col-12 col-md-6" v-model="form.useHeader" :label="$t('form.excelOutput.writeHeader')"/>
          <q-checkbox class="col-12 col-md-6" v-model="form.useFooter" :label="$t('form.excelOutput.writeFooter')"/>
          <q-checkbox class="col-12 col-md-6" v-model="form.autoSize" :label="$t('form.excelOutput.autoSizeColumns')"/>
          <q-checkbox class="col-12 col-md-6" v-model="form.recalculate" :label="$t('form.excelOutput.forceFormulaRecaluculation')"/>
          <q-checkbox class="col-12 col-md-6" v-model="form.keepStyle" :label="$t('form.excelOutput.leaveStyleExisting')"/>
          <q-checkbox class="col-12 col-md-6" v-model="form.append" :label="$t('form.excelOutput.appendLines')"/>
          <q-checkbox class="col-12 col-md-6" v-model="form.deleteHeader" :label="$t('form.excelOutput.removeHeader')"/>
        </q-tab-panel>
        <q-tab-panel name="field">
          <q-table :data="form.parameters" :columns="parameterColumns" :rows-per-page-options="[0]" row-key="name" separator="cell" hide-bottom :title="$t('form.excelOutput.tableField')">
            <template v-slot:top-right>
              <q-btn-dropdown split outline color="primary" icon="add" @click="addParameter">
                <q-list>
                  <q-item clickable v-close-popup @click="appendDiffParameter">
                    <q-item-section>
                      <q-item-label>{{ $t('button.append') }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click="addAllParameter">
                    <q-item-section>
                      <q-item-label>{{ $t('button.addAll') }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click="clearAndAddParameter">
                    <q-item-section>
                      <q-item-label>{{ $t('button.removeAndAdd') }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-btn-dropdown>
            </template>
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="operate" :props="props">
                  <q-btn size="xs" outline round color="negative" icon="remove" @click="deleteParameter(props)"></q-btn>
                </q-td>
                <q-td key="field" :props="props">
                  {{ props.row.field }}
                  <q-popup-edit v-model="props.row.field" :auto-save="true">
                    <q-select autofocus outlined v-model="props.row.field" :options="sourceFields" @new-value="createSourceField" use-input/>
                  </q-popup-edit>
                </q-td>
                <q-td key="category" :props="props">
                  {{ props.row.category }}
                  <q-popup-edit v-model="props.row.category" :auto-save="true">
                    <q-select autofocus outlined v-model="props.row.category" :options="categories"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="format" :props="props">
                  {{ props.row.format }}
                  <q-popup-edit v-model="props.row.format" :auto-save="true">
                    <q-select autofocus outlined v-model="props.row.format" :options="fieldFormats"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="style" :props="props">
                  {{ props.row.style }}
                  <q-popup-edit v-model="props.row.style" :auto-save="true">
                    <q-input autofocus outlined v-model="props.row.style"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="title" :props="props">
                  {{ props.row.title }}
                  <q-popup-edit v-model="props.row.title" :auto-save="true">
                    <q-input autofocus outlined v-model="props.row.title"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="headerStyle" :props="props">
                  {{ props.row.headerStyle }}
                  <q-popup-edit v-model="props.row.headerStyle" :auto-save="true">
                    <q-input autofocus outlined v-model="props.row.headerStyle"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="formula" :props="props">
                  {{ props.row.formula }}
                  <q-popup-edit v-model="props.row.formula" :auto-save="true">
                    <q-select autofocus outlined v-model="props.row.formula" :options="formulas"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="link" :props="props">
                  {{ props.row.link }}
                  <q-popup-edit v-model="props.row.link" :auto-save="true">
                    <q-input autofocus outlined v-model="props.row.link"/>
                  </q-popup-edit>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-tab-panel>
        <q-tab-panel name="runningConfig">
          <q-input autofocus outlined type="number" v-model.number="form.parallel" :label="$t('form.excelOutput.threads')" min="1" :disable="forbiddenParallel"/>
        </q-tab-panel>
      </q-tab-panels>
  </q-form>
  </div>
</template>

<script>
const FORBIDDEN_NEXT_STEP_PARALLEL = ['SwitchCaseMeta']
const IGNORE_REPEAT_WARNING_META = ['SortRowsMeta', 'SetValueFieldMeta']
export default {
  name: 'ExcelWriterStepMeta',
  data () {
    return {
      tab: 'basic',
      form: {
        name: null,
        rowNumber: 0,
        suffix: 'xls',
        filename: null,
        dateFormat: null,
        fileOutputMode: 'new',
        useDateFormat: false,
        useStream: false,
        useStepInfoSuffix: false,
        useDateSuffix: false,
        useTimeSuffix: false,
        generateMode: false,
        nameInResult: false,
        sheetName: 'Sheet1',
        sheetOutputMode: 'new',
        asActiveSheet: true,
        startPoint: 'A1',
        cellOutputMode: 'new',
        deleteLines: 0,
        emptyLines: 0,
        useHeader: true,
        useFooter: false,
        autoSize: false,
        recalculate: false,
        keepStyle: false,
        append: false,
        deleteHeader: false,
        parameters: [],
        parallel: 1,
        distribute: true
      },
      categories: ['BigNumber', 'Binary', 'Boolean', 'Date', 'Integer', 'Internet Address', 'Number', 'String', 'Timestamp'],
      formats: ['yyyy/MM/dd HH:mm:ss.SSS', 'yyyy/MM/dd HH:mm:ss.SSS XXX', 'yyyy/MM/dd HH:mm:ss', 'yyyy/MM/dd HH:mm:ss XXX', 'yyyyMMddHHmmss', 'yyyy/MM/dd', 'yyyy-MM-dd', 'yyyy-MM-dd HH:mm:ss', 'yyyy-MM-dd HH:mm:ss XXX',
        'yyyyMMdd', 'MM/dd/yyyy', 'MM/dd/yyyy HH:mm:ss', 'MM-dd-yyyy', 'MM-dd-yyyy HH:mm:ss', 'MM/dd/yy', 'MM-dd-yy', 'dd/MM/yyyy', 'dd-MM-yyyy', 'yyyy-MM-dd\'T\'HH:mm:ss.SSSXXX', 'yyyy-MM-dd HH:mm:ss.SSS'],
      suffixes: [
        { value: 'xls', label: 'xls [Excel 97 and above]' },
        { value: 'xlsx', label: 'xlsx [Excel 2007 and above]' }
      ],
      outputModes: [
        { value: 'new', label: this.$t('form.excelOutput.overwrite') },
        { value: 'reuse', label: this.$t('form.excelOutput.append') }
      ],
      parameterColumns: [
        {
          name: 'operate',
          label: this.$t('form.excelOutput.columnOperate'),
          field: 'operate',
          align: 'right',
          headerStyle: 'width: 20px'
        },
        {
          name: 'field',
          label: this.$t('form.excelOutput.columnName'),
          field: 'field',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'category',
          label: this.$t('form.excelOutput.columnType'),
          field: 'category',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'format',
          label: this.$t('form.excelOutput.columnFormat'),
          field: 'format',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'style',
          label: this.$t('form.excelOutput.columnStyle'),
          field: 'style',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'title',
          label: this.$t('form.excelOutput.columnTitle'),
          field: 'title',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'headerStyle',
          label: this.$t('form.excelOutput.columnHeaderStyle'),
          field: 'headerStyle',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'formula',
          label: this.$t('form.excelOutput.columnFormula'),
          field: 'formula',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'link',
          label: this.$t('form.excelOutput.columnLink'),
          field: 'link',
          align: 'left',
          headerStyle: 'width: 100px;'
        }
      ],
      fieldFormats: ['General', '0', '0.00', '#,##0', '#,##0.00', '\'$\'#,##0_);(\'$\'#,##0)', '\'$\'#,##0_);[Red](\'$\'#,##0)', '\'$\'#,##0.00_);(\'$\'#,##0.00)', '\'$\'#,##0.00_);[Red](\'$\'#,##0.00)', '0%', '0.00%', '0.00E+00', '# ?/?', '# ??/??', 'm/d/yy', 'd-mmm-yy', 'd-mmm', 'mmm-yy', 'h:mm AM/PM', 'h:mm:ss AM/PM', 'h:mm', 'h:mm:ss', 'm/d/yy h:mm', 'reserved-0x17', 'reserved-0x18', 'reserved-0x19', 'reserved-0x1A', 'reserved-0x1B', 'reserved-0x1C', 'reserved-0x1D', 'reserved-0x1E', 'reserved-0x1F', 'reserved-0x20', 'reserved-0x21', 'reserved-0x22', 'reserved-0x23', 'reserved-0x24', '#,##0_);(#,##0)', '#,##0_);[Red](#,##0)', '#,##0.00_);(#,##0.00)', '#,##0.00_);[Red](#,##0.00)', '_(* #,##0_);_(* (#,##0);_(* \'-\'_);_(@_)', '_(\'$\'* #,##0_);_(\'$\'* (#,##0);_(\'$\'* \'-\'_);_(@_)', '_(* #,##0.00_);_(* (#,##0.00);_(* \'-\'??_);_(@_)', '_(\'$\'* #,##0.00_);_(\'$\'* (#,##0.00);_(\'$\'* \'-\'??_);_(@_)', 'mm:ss', '[h]:mm:ss', 'mm:ss.0', '##0.0E+0', '@'],
      formulas: ['Y', 'N'],
      sourceFields: [],
      forbiddenParallel: false
    }
  },
  methods: {
    addParameter () {
      this.form.parameters.push({
        field: null,
        category: null,
        format: null,
        style: null,
        title: null,
        headerStyle: null,
        formula: null,
        link: null
      })
    },
    appendDiffParameter () {
      const vm = this
      const items = vm.form.parameters.filter(parameter => vm.sourceFields.indexOf(parameter.field) >= 0)
      const array = vm.sourceFields
      items.forEach(item => {
        array.splice(array.findIndex(i => i === item.field), 1)
      })
      array.forEach(field => {
        this.form.parameters.push({
          field: field,
          category: null,
          format: null,
          style: null,
          title: field,
          headerStyle: null,
          formula: null,
          link: null
        })
      })
    },
    addAllParameter () {
      const vm = this
      vm.sourceFields.forEach(field => {
        vm.form.parameters.push({
          field: field,
          category: null,
          format: null,
          style: null,
          title: field,
          headerStyle: null,
          formula: null,
          link: null
        })
      })
    },
    clearAndAddParameter () {
      this.form.parameters = []
      this.addAllParameter()
    },
    deleteParameter (props) {
      this.form.parameters.splice(props.rowIndex, 1)
    },
    createSourceField (val, done) {
      if (val.length > 0) {
        if (!this.sourceFields.includes(val)) {
          this.sourceFields.push(val)
        }
        done(val, 'toggle')
      }
    },
    submitForm (e) {
      const sourceFields = []
      this.$emit('propertiesForm', {
        state: true,
        mxCellProperties: this.form,
        ext: {
          sourceFields: sourceFields
        }
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
