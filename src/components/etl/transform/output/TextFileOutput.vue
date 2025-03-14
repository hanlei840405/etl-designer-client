<template>
  <div style="width: 100%;">
    <q-form class="q-gutter-md">
      <q-tabs v-model="tab" align="left" narrow-indicator>
        <q-tab name="basic" :label="$t('form.textFileOutput.tabBasic')"/>
        <q-tab name="content" :label="$t('form.textFileOutput.tabContent')"/>
        <q-tab name="field" :label="$t('form.textFileOutput.tabField')"/>
        <q-tab name="runningConfig" :label="$t('form.textFileOutput.tabRunningConfig')"/>
      </q-tabs>
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel class="row q-col-gutter-xs" name="basic">
          <q-input class="col-12 col-md-6" outlined v-model="form.name" :label="$t('form.textFileOutput.name')" lazy-rules :rules="[ val => val && val.length > 0 || 'Please type something']" hint=""/>
            <q-input class="col-12 col-md-6" outlined v-model="form.endedLine" :label="$t('form.textFileOutput.endedLine')" hint=""/>
          <q-input class="col-12 col-md-6" outlined v-model="form.filename" :label="$t('form.textFileOutput.filename')" :hint="hintStorageDir+form.filename+'.'+form.suffix"/>
          <q-input class="col-12 col-md-6" outlined v-model="form.suffix" :label="$t('form.textFileOutput.suffix')" hint=""/>
          <q-checkbox class="col-12 col-md-3" v-model="form.addStepNr" :label="$t('form.textFileOutput.addStepNr')"/>
          <q-checkbox class="col-12 col-md-3" v-model="form.addPartNr" :label="$t('form.textFileOutput.addPartNr')"/>
          <q-checkbox class="col-12 col-md-3" v-model="form.addDate" :label="$t('form.textFileOutput.addDate')"/>
          <q-checkbox class="col-12 col-md-3" v-model="form.addTime" :label="$t('form.textFileOutput.addTime')"/>
          <q-checkbox class="col-12 col-md-3" v-model="form.addFileToResult" :label="$t('form.textFileOutput.addFileToResult')"/>
        </q-tab-panel>
        <q-tab-panel class="row q-col-gutter-xs" name="content">
          <q-select class="col-12 col-md-6" outlined v-model="form.encoding" :options="encodingOptions" emit-value map-options :label="$t('form.textFileOutput.encoding')" hint=""/>
          <q-select class="col-12 col-md-6" outlined v-model="form.compression" :options="compressionOptions" emit-value map-options :label="$t('form.textFileOutput.compression')" hint=""/>
          <q-input class="col-12 col-md-6" outlined v-model="form.separator" :label="$t('form.textFileOutput.separator')" hint="">
            <template v-slot:append>
              <q-btn dense flat color="primary" @click="insertTab" :label="$t('button.insert') + 'TAB'"/>
            </template>
          </q-input>
          <q-input class="col-12 col-md-6" outlined v-model="form.enclosure" :label="$t('form.textFileOutput.enclosure')" hint=""/>
          <q-checkbox class="col-12 col-md-3" v-model="form.enclForced" :label="$t('form.textFileOutput.enclForced')"/>
          <q-checkbox class="col-12 col-md-3" v-model="form.disableEnclosureFix" :label="$t('form.textFileOutput.disableEnclosureFix')"/>
          <q-checkbox class="col-12 col-md-3" v-model="form.append" :label="$t('form.textFileOutput.append')"/>
          <q-checkbox class="col-12 col-md-3" v-model="form.pad" :label="$t('form.textFileOutput.pad')"/>
          <q-checkbox class="col-12 col-md-3" v-model="form.header" :label="$t('form.textFileOutput.header')"/>
          <q-checkbox class="col-12 col-md-3" v-model="form.footer" :label="$t('form.textFileOutput.footer')"/>
          <q-checkbox class="col-12 col-md-3" v-model="form.fastDump" :label="$t('form.textFileOutput.fastDump')"/>
        </q-tab-panel>
        <q-tab-panel name="field">
          <q-table :data="form.parameters" :columns="parameterColumns" :rows-per-page-options="[0]" row-key="name" separator="cell" hide-bottom :title="$t('form.textFileOutput.tableField')">
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
                <q-td key="lengthValue" :props="props">
                  {{ props.row.lengthValue }}
                  <q-popup-edit v-model="props.row.lengthValue" :auto-save="true">
                    <q-input autofocus outlined v-model="props.row.lengthValue"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="accuracy" :props="props">
                  {{ props.row.accuracy }}
                  <q-popup-edit v-model="props.row.accuracy" :auto-save="true">
                    <q-input autofocus outlined v-model="props.row.accuracy"/>
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
                    <q-input autofocus outlined v-model="props.row.currency"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="groupBy" :props="props">
                  {{ props.row.groupBy }}
                  <q-popup-edit v-model="props.row.groupBy" :auto-save="true">
                    <q-input autofocus outlined v-model="props.row.groupBy"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="trimType" :props="props">
                  {{ props.row.trimType }}
                  <q-popup-edit v-model="props.row.trimType" :auto-save="true">
                    <q-select autofocus outlined v-model="props.row.trimType" :options="trimTypeOptions"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="emptyValue" :props="props">
                  {{ props.row.emptyValue }}
                  <q-popup-edit v-model="props.row.emptyValue" :auto-save="true">
                    <q-input autofocus outlined v-model="props.row.emptyValue"/>
                  </q-popup-edit>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-tab-panel>
        <q-tab-panel name="runningConfig">
          <q-input autofocus outlined type="number" v-model.number="form.parallel" :label="$t('form.textFileOutput.threads')" min="1" :disable="forbiddenParallel"/>
        </q-tab-panel>
      </q-tab-panels>
  </q-form>
  </div>
</template>

<script>
const FORBIDDEN_NEXT_STEP_PARALLEL = ['SwitchCaseMeta']
const IGNORE_REPEAT_WARNING_META = ['SortRowsMeta', 'SetValueFieldMeta']
export default {
  name: 'TextFileOutputMeta',
  data () {
    return {
      tab: 'basic',
      form: {
        name: null,
        filename: null,
        suffix: 'txt',
        separator: ';',
        enclosure: '"',
        endedLine: null,
        compression: 'None',
        encoding: 'UTF-8',
        addStepNr: false,
        addPartNr: false,
        addDate: false,
        addTime: false,
        addFileToResult: false,
        append: false,
        enclForced: false,
        disableEnclosureFix: false,
        header: false,
        footer: false,
        pad: false,
        fastDump: false,
        parameters: [],
        parallel: 1,
        distribute: true,
      },
      compressionOptions: ['None', 'GZip', 'Hadoop-snappy', 'Snappy', 'Zip'],
      encodingOptions: ['Big5', 'Big5-HKSCS', 'CESU-8', 'EUC-JP', 'EUC-KR', 'GB18030', 'GB2312', 'GBK', 'IBM-Thai', 'IBM00858', 'IBM01140', 'IBM01141', 'IBM01142', 'IBM01143', 'IBM01144', 'IBM01145', 'IBM01146', 'IBM01147', 'IBM01148', 'IBM01149', 'IBM037', 'IBM1026', 'IBM1047', 'IBM273', 'IBM277', 'IBM278', 'IBM280', 'IBM284', 'IBM285', 'IBM290',
        'IBM297', 'IBM420', 'IBM424', 'IBM437', 'IBM500', 'IBM775', 'IBM850', 'IBM852', 'IBM855', 'IBM857', 'IBM860', 'IBM861', 'IBM862', 'IBM863', 'IBM864', 'IBM865', 'IBM866', 'IBM868', 'IBM869', 'IBM870', 'IBM871', 'IBM918', 'ISO-2022-CN', 'ISO-2022-JP', 'ISO-2022-JP-2', 'ISO-2022-KR', 'ISO-8859-1', 'ISO-8859-13', 'ISO-8859-15', 'ISO-8859-2',
        'ISO-8859-3', 'ISO-8859-4', 'ISO-8859-5', 'ISO-8859-6', 'ISO-8859-7', 'ISO-8859-8', 'ISO-8859-9', 'JIS_X0201', 'JIS_X0212-1990', 'KOI8-R', 'KOI8-U', 'Shift_JIS', 'TIS-620', 'US-ASCII', 'UTF-16', 'UTF-16BE', 'UTF-16LE', 'UTF-32', 'UTF-32BE', 'UTF-32LE', 'UTF-8', 'windows-1250', 'windows-1251', 'windows-1252', 'windows-1253', 'windows-1254',
        'windows-1255', 'windows-1256', 'windows-1257', 'windows-1258', 'windows-31j', 'x-Big5-HKSCS-2001', 'x-Big5-Solaris', 'x-COMPOUND_TEXT', 'x-euc-jp-linux', 'x-EUC-TW', 'x-eucJP-Open', 'x-IBM1006', 'x-IBM1025', 'x-IBM1046', 'x-IBM1097', 'x-IBM1098', 'x-IBM1112', 'x-IBM1122', 'x-IBM1123', 'x-IBM1124', 'x-IBM1166', 'x-IBM1364', 'x-IBM1381',
        'x-IBM1383', 'x-IBM300', 'x-IBM33722', 'x-IBM737', 'x-IBM833', 'x-IBM834', 'x-IBM856', 'x-IBM874', 'x-IBM875', 'x-IBM921', 'x-IBM922', 'x-IBM930', 'x-IBM933', 'x-IBM935', 'x-IBM937', 'x-IBM939', 'x-IBM942', 'x-IBM942C', 'x-IBM943', 'x-IBM943C', 'x-IBM948', 'x-IBM949', 'x-IBM949C', 'x-IBM950', 'x-IBM964', 'x-IBM970', 'x-ISCII91',
        'x-ISO-2022-CN-CNS', 'x-ISO-2022-CN-GB', 'x-iso-8859-11', 'x-JIS0208', 'x-JISAutoDetect', 'x-Johab', 'x-MacArabic', 'x-MacCentralEurope', 'x-MacCroatian', 'x-MacCyrillic', 'x-MacDingbat', 'x-MacGreek', 'x-MacHebrew', 'x-MacIceland', 'x-MacRoman', 'x-MacRomania', 'x-MacSymbol', 'x-MacThai', 'x-MacTurkish', 'x-MacUkraine', 'x-MS932_0213',
        'x-MS950-HKSCS', 'x-MS950-HKSCS-XP', 'x-mswin-936', 'x-PCK', 'x-SJIS_0213', 'x-UTF-16LE-BOM', 'X-UTF-32BE-BOM', 'X-UTF-32LE-BOM', 'x-windows-50220', 'x-windows-50221', 'x-windows-874', 'x-windows-949', 'x-windows-950', 'x-windows-iso2022jp'],
      categories: ['BigNumber', 'Binary', 'Boolean', 'Date', 'Integer', 'Internet Address', 'Number', 'String', 'Timestamp'],
      trimTypeOptions: [
        { value: 'none', label: this.$t('form.textFileOutput.none') },
        { value: 'left', label: this.$t('form.textFileOutput.left') },
        { value: 'right', label: this.$t('form.textFileOutput.right') },
        { value: 'both', label: this.$t('form.textFileOutput.both') }
      ],
      parameterColumns: [
        {
          name: 'operate',
          label: this.$t('form.textFileOutput.columnOperate'),
          field: 'operate',
          align: 'right',
          headerStyle: 'width: 20px'
        },
        {
          name: 'field',
          label: this.$t('form.textFileOutput.columField'),
          field: 'field',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'category',
          label: this.$t('form.textFileOutput.columCategory'),
          field: 'category',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'format',
          label: this.$t('form.textFileOutput.columFormat'),
          field: 'format',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'lengthValue',
          label: this.$t('form.textFileOutput.columLengthValue'),
          field: 'lengthValue',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'accuracy',
          label: this.$t('form.textFileOutput.columAccuracy'),
          field: 'accuracy',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'currency',
          label: this.$t('form.textFileOutput.columCurrency'),
          field: 'currency',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'decimal',
          label: this.$t('form.textFileOutput.columDecimal'),
          field: 'decimal',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'groupBy',
          label: this.$t('form.textFileOutput.columGroupBy'),
          field: 'groupBy',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'trimType',
          label: this.$t('form.textFileOutput.columTrimType'),
          field: 'trimType',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'emptyValue',
          label: this.$t('form.textFileOutput.columEmptyValue'),
          field: 'emptyValue',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
      ],
      fieldFormats: ['General', '0', '0.00', '#,##0', '#,##0.00', '\'$\'#,##0_);(\'$\'#,##0)', '\'$\'#,##0_);[Red](\'$\'#,##0)', '\'$\'#,##0.00_);(\'$\'#,##0.00)', '\'$\'#,##0.00_);[Red](\'$\'#,##0.00)', '0%', '0.00%', '0.00E+00', '# ?/?', '# ??/??', 'm/d/yy', 'd-mmm-yy', 'd-mmm', 'mmm-yy', 'h:mm AM/PM', 'h:mm:ss AM/PM', 'h:mm', 'h:mm:ss', 'm/d/yy h:mm', 'reserved-0x17', 'reserved-0x18', 'reserved-0x19', 'reserved-0x1A', 'reserved-0x1B', 'reserved-0x1C', 'reserved-0x1D', 'reserved-0x1E', 'reserved-0x1F', 'reserved-0x20', 'reserved-0x21', 'reserved-0x22', 'reserved-0x23', 'reserved-0x24', '#,##0_);(#,##0)', '#,##0_);[Red](#,##0)', '#,##0.00_);(#,##0.00)', '#,##0.00_);[Red](#,##0.00)', '_(* #,##0_);_(* (#,##0);_(* \'-\'_);_(@_)', '_(\'$\'* #,##0_);_(\'$\'* (#,##0);_(\'$\'* \'-\'_);_(@_)', '_(* #,##0.00_);_(* (#,##0.00);_(* \'-\'??_);_(@_)', '_(\'$\'* #,##0.00_);_(\'$\'* (#,##0.00);_(\'$\'* \'-\'??_);_(@_)', 'mm:ss', '[h]:mm:ss', 'mm:ss.0', '##0.0E+0', '@'],
      sourceFields: [],
      hintStorageDir: '',
      forbiddenParallel: false
    }
  },
  methods: {
    insertTab () {
      this.form.separator += '\t'
    },
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
    vm.hintStorageDir = "${attachment.dir}" + `/${root.projectId}/${root.parentId}/${root.componentId}/`
  }
}
</script>
