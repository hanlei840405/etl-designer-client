<template>
  <div style="width: 100%;">
    <q-form class="q-gutter-md">
      <q-tabs v-model="tab" active-color="primary" active-bg-color="grey-3" align="left" narrow-indicator>
        <q-tab name="basic" :label="$t('form.excelInput.tab.basic')"/>
        <q-tab name="sheet" :label="$t('form.excelInput.tab.sheet')"/>
        <q-tab name="field" :label="$t('form.excelInput.tab.field')"/>
      </q-tabs>
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel class="row q-col-gutter-xs" name="basic">
          <q-input class="col-12 col-md-4" outlined v-model="form.name" :label="$t('form.excelInput.name')" :rules="[ val => val && val.length > 0 || 'Please type something']" hint=""/>
          <q-select class="col-12 col-md-4" outlined v-model="form.spreadSheetType" :options="spreadSheetTypeOptions" emit-value map-options :label="$t('form.excelInput.spreadSheetType')" hint=""/>
          <q-select class="col-12 col-md-4" clearable outlined emit-value map-options v-model="form.downloadDir" :options="downloadDirOptions" :label="$t('form.jsonInput.downloadDir')" :disable="form.sourceFrom === 'stream'" hint="">
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                <q-item-section>
                  <q-item-label>{{ scope.opt.label }}</q-item-label>
                  <q-item-label caption>{{ $t('form.excelInput.relativePath') }}: ${attachment.dir}{{ scope.opt.description }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
          <q-input class="col-12 col-md-4" outlined v-model="form.filename" :label="$t('form.excelInput.filename')" hint=""/>
          <q-input class="col-12 col-md-4" outlined v-model="form.wildcard" :label="$t('form.excelInput.wildcard')" hint=""/>
          <q-input class="col-12 col-md-4" outlined v-model="form.limit" :label="$t('form.excelInput.limit')" hint=""/>
          <q-select class="col-12 col-md-4" outlined v-model="form.encoding" :options="encodingOptions" emit-value map-options :label="$t('form.excelInput.encoding')" hint=""/>
          <q-checkbox class="col-12 col-md-2" outlined v-model="form.header" :label="$t('form.parGzipCsvInput.header')"/>
          <q-checkbox class="col-12 col-md-2" outlined v-model="form.noEmpty" :label="$t('form.excelInput.noEmpty')"/>
          <q-checkbox class="col-12 col-md-2" outlined v-model="form.stopOnEmpty" :label="$t('form.excelInput.stopOnEmpty')"/>
        </q-tab-panel>
        <q-tab-panel name="sheet">
          <q-table :data="form.sheetInfos" :columns="sheetInfoColumns" :rows-per-page-options="[0]" row-key="name" separator="cell" hide-bottom :title="$t('form.excelInput.tableSheet')">
            <template v-slot:top-right>
              <q-btn size="sm" outline color="primary" icon="add" @click="addSheetInfo"/>
            </template>
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="operate" :props="props">
                  <q-btn size="xs" outline round color="negative" icon="remove" @click="deleteSheet(props)"></q-btn>
                </q-td>
                <q-td key="sheetName" :props="props">
                  {{ props.row.sheetName }}
                  <q-popup-edit v-model="props.row.sheetName" :auto-save="true">
                    <q-input autofocus v-model="props.row.sheetName"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="startRow" :props="props">
                  {{ props.row.startRow }}
                  <q-popup-edit v-model="props.row.startRow" :auto-save="true">
                    <q-input autofocus v-model="props.row.startRow"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="startColumn" :props="props">
                  {{ props.row.startColumn }}
                  <q-popup-edit v-model="props.row.startColumn" :auto-save="true">
                    <q-input autofocus v-model="props.row.startColumn"/>
                  </q-popup-edit>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-tab-panel>
        <q-tab-panel name="field">
          <q-table :data="form.parameters" :columns="parameterColumns" :rows-per-page-options="[0]" row-key="name" separator="cell" hide-bottom :title="$t('form.excelInput.tableField')">
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
                    <q-input autofocus v-model="props.row.field"/>
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
                  <q-popup-edit type="number" v-model="props.row.lengthValue" :auto-save="true">
                    <q-input autofocus type="number" v-model="props.row.lengthValue"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="accuracy" :props="props">
                  {{ props.row.accuracy }}
                  <q-popup-edit type="number" v-model="props.row.accuracy" :auto-save="true">
                    <q-input autofocus type="number" v-model="props.row.accuracy"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="currency" :props="props">
                  {{ props.row.currency }}
                  <q-popup-edit v-model="props.row.currency" :auto-save="true">
                    <q-input autofocus v-model="props.row.currency"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="decimal" :props="props">
                  {{ props.row.decimal }}
                  <q-popup-edit v-model="props.row.decimal" :auto-save="true">
                    <q-input autofocus v-model="props.row.decimal"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="groupBy" :props="props">
                  {{ props.row.groupBy }}
                  <q-popup-edit v-model="props.row.groupBy" :auto-save="true">
                    <q-input autofocus v-model="props.row.groupBy"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="trimType" :props="props">
                  {{ props.row.trimType }}
                  <q-popup-edit v-model="props.row.trimType" :auto-save="true">
                    <q-select autofocus outlined v-model="props.row.trimType" :options="trimTypeOptions"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="repeated" :props="props">
                  {{ translate(props.row.repeated) }}
                  <q-popup-edit v-model="props.row.repeated" :auto-save="true">
                    <q-select autofocus outlined v-model="props.row.repeated" emit-value map-options :options="repeatedOptions"/>
                  </q-popup-edit>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-tab-panel>
      </q-tab-panels>
    </q-form>
  </div>
</template>

<script>
import { fetchAttamentStorageDir } from 'src/service/kettle/AttachmentStorageService'
export default {
  name: 'ExcelInputMeta',
  data () {
    return {
      tab: 'basic',
      form: {
        name: null,
        spreadSheetType: 'JXL',
        downloadDir: null,
        filename: null,
        wildcard: null,
        limit: null,
        header: true,
        noEmpty: true,
        runningInParallel: false,
        encoding: 'UTF-8',
        sheetInfos: [],
        parameters: [],
        distribute: true
      },
      sheetInfoColumns: [
        {
          name: 'operate',
          label: this.$t('form.excelInput.columnOperate'),
          field: 'operate',
          align: 'right',
          headerStyle: 'width: 20px'
        },
        {
          name: 'sheetName',
          label: this.$t('form.excelInput.columnSheetName'),
          field: 'sheetName',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'startRow',
          label: this.$t('form.excelInput.columnStartRow'),
          field: 'startRow',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'startColumn',
          label: this.$t('form.excelInput.columnStartColumn'),
          field: 'startColumn',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
      ],
      parameterColumns: [
        {
          name: 'operate',
          label: this.$t('form.excelInput.columnOperate'),
          field: 'operate',
          align: 'right',
          headerStyle: 'width: 20px'
        },
        {
          name: 'field',
          label: this.$t('form.excelInput.columnName'),
          field: 'field',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'category',
          label: this.$t('form.excelInput.columnType'),
          field: 'category',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'formatValue',
          label: this.$t('form.excelInput.columnFormat'),
          field: 'formatValue',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'lengthValue',
          label: this.$t('form.excelInput.columnLength'),
          field: 'lengthValue',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'accuracy',
          label: this.$t('form.excelInput.columnAccuracy'),
          field: 'accuracy',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'currency',
          label: this.$t('form.excelInput.columnCurrencyFormat'),
          field: 'currency',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'decimal',
          label: this.$t('form.excelInput.columnDecimal'),
          field: 'decimal',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'groupBy',
          label: this.$t('form.excelInput.columnGroup'),
          field: 'groupBy',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'trimType',
          label: this.$t('form.excelInput.columnTrimType.default'),
          field: 'trimType',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'repeated',
          label: this.$t('form.excelInput.columnRepeated.default'),
          field: 'repeated',
          align: 'left',
          headerStyle: 'width: 100px;'
        }
      ],
      spreadSheetTypeOptions: [
      { value: 'JXL', label: 'Excel 97-2003 XLS (JXL)' },
      { value: 'POI', label: 'Excel 2007 XLSX (Apache POI)' },
        { value: 'SAX_POI', label: 'Excel 2007 XLSX (Apache POI Streaming)' },
        { value: 'ODS', label: 'Open Office ODS (ODFDOM)' }
      ],
      categories: ['BigNumber', 'Binary', 'Boolean', 'Date', 'Integer', 'Internet Address', 'Number', 'String', 'Timestamp'],
      formats: ['yyyy/MM/dd HH:mm:ss.SSS', 'yyyy/MM/dd HH:mm:ss.SSS XXX', 'yyyy/MM/dd HH:mm:ss', 'yyyy/MM/dd HH:mm:ss XXX', 'yyyyMMddHHmmss', 'yyyy/MM/dd', 'yyyy-MM-dd', 'yyyy-MM-dd HH:mm:ss', 'yyyy-MM-dd HH:mm:ss XXX',
        'yyyyMMdd', 'MM/dd/yyyy', 'MM/dd/yyyy HH:mm:ss', 'MM-dd-yyyy', 'MM-dd-yyyy HH:mm:ss', 'MM/dd/yy', 'MM-dd-yy', 'dd/MM/yyyy', 'dd-MM-yyyy', 'yyyy-MM-dd\'T\'HH:mm:ss.SSSXXX', 'yyyy-MM-dd HH:mm:ss.SSS'],
      trimTypeOptions: [
        { value: 'none', label: this.$t('form.excelInput.columnTrimType.none') },
        { value: 'left', label: this.$t('form.excelInput.columnTrimType.left') },
        { value: 'right', label: this.$t('form.excelInput.columnTrimType.right') },
        { value: 'both', label: this.$t('form.excelInput.columnTrimType.both') }
      ],
      downloadDirOptions: [],
      encodingOptions: ['Big5', 'Big5-HKSCS', 'CESU-8', 'EUC-JP', 'EUC-KR', 'GB18030', 'GB2312', 'GBK', 'IBM-Thai', 'IBM00858', 'IBM01140', 'IBM01141', 'IBM01142', 'IBM01143', 'IBM01144', 'IBM01145', 'IBM01146', 'IBM01147', 'IBM01148', 'IBM01149', 'IBM037', 'IBM1026', 'IBM1047', 'IBM273', 'IBM277', 'IBM278', 'IBM280', 'IBM284', 'IBM285', 'IBM290',
        'IBM297', 'IBM420', 'IBM424', 'IBM437', 'IBM500', 'IBM775', 'IBM850', 'IBM852', 'IBM855', 'IBM857', 'IBM860', 'IBM861', 'IBM862', 'IBM863', 'IBM864', 'IBM865', 'IBM866', 'IBM868', 'IBM869', 'IBM870', 'IBM871', 'IBM918', 'ISO-2022-CN', 'ISO-2022-JP', 'ISO-2022-JP-2', 'ISO-2022-KR', 'ISO-8859-1', 'ISO-8859-13', 'ISO-8859-15', 'ISO-8859-2',
        'ISO-8859-3', 'ISO-8859-4', 'ISO-8859-5', 'ISO-8859-6', 'ISO-8859-7', 'ISO-8859-8', 'ISO-8859-9', 'JIS_X0201', 'JIS_X0212-1990', 'KOI8-R', 'KOI8-U', 'Shift_JIS', 'TIS-620', 'US-ASCII', 'UTF-16', 'UTF-16BE', 'UTF-16LE', 'UTF-32', 'UTF-32BE', 'UTF-32LE', 'UTF-8', 'windows-1250', 'windows-1251', 'windows-1252', 'windows-1253', 'windows-1254',
        'windows-1255', 'windows-1256', 'windows-1257', 'windows-1258', 'windows-31j', 'x-Big5-HKSCS-2001', 'x-Big5-Solaris', 'x-COMPOUND_TEXT', 'x-euc-jp-linux', 'x-EUC-TW', 'x-eucJP-Open', 'x-IBM1006', 'x-IBM1025', 'x-IBM1046', 'x-IBM1097', 'x-IBM1098', 'x-IBM1112', 'x-IBM1122', 'x-IBM1123', 'x-IBM1124', 'x-IBM1166', 'x-IBM1364', 'x-IBM1381',
        'x-IBM1383', 'x-IBM300', 'x-IBM33722', 'x-IBM737', 'x-IBM833', 'x-IBM834', 'x-IBM856', 'x-IBM874', 'x-IBM875', 'x-IBM921', 'x-IBM922', 'x-IBM930', 'x-IBM933', 'x-IBM935', 'x-IBM937', 'x-IBM939', 'x-IBM942', 'x-IBM942C', 'x-IBM943', 'x-IBM943C', 'x-IBM948', 'x-IBM949', 'x-IBM949C', 'x-IBM950', 'x-IBM964', 'x-IBM970', 'x-ISCII91',
        'x-ISO-2022-CN-CNS', 'x-ISO-2022-CN-GB', 'x-iso-8859-11', 'x-JIS0208', 'x-JISAutoDetect', 'x-Johab', 'x-MacArabic', 'x-MacCentralEurope', 'x-MacCroatian', 'x-MacCyrillic', 'x-MacDingbat', 'x-MacGreek', 'x-MacHebrew', 'x-MacIceland', 'x-MacRoman', 'x-MacRomania', 'x-MacSymbol', 'x-MacThai', 'x-MacTurkish', 'x-MacUkraine', 'x-MS932_0213',
        'x-MS950-HKSCS', 'x-MS950-HKSCS-XP', 'x-mswin-936', 'x-PCK', 'x-SJIS_0213', 'x-UTF-16LE-BOM', 'X-UTF-32BE-BOM', 'X-UTF-32LE-BOM', 'x-windows-50220', 'x-windows-50221', 'x-windows-874', 'x-windows-949', 'x-windows-950', 'x-windows-iso2022jp'],
      repeatedOptions: [
        { value: 'true', label: this.$t('form.excelInput.columnRepeated.true') },
        { value: 'false', label: this.$t('form.excelInput.columnRepeated.false') },
      ]
    }
  },
  methods: {
    addSheetInfo () {
      this.form.sheetInfos.push({
        sheetName: null,
        startRow: null,
        startColumn: null
      })
    },
    deleteSheet (props) {
      this.form.sheetInfos.splice(props.rowIndex, 1)
    },
    addParameter () {
      this.form.parameters.push({
        field: null,
        category: 'String',
        formatValue: null,
        lengthValue: -1,
        accuracy: -1,
        currency: null,
        decimal: null,
        groupBy: null,
        value: null,
        trimType: null,
        repeated: 'false'
      })
    },
    deleteParameter (props) {
      this.form.parameters.splice(props.rowIndex, 1)
    },
    translate (value) {
      return this.$t('form.excelInput.columnRepeated.' + value)
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
    const mxCellValue = vm.$store.getters['etl/getMxCellForm']
    if (mxCellValue) {
      vm.form = Object.assign(vm.form, mxCellValue)
    }
    const root = vm.$store.getters['etl/getRoot']
    fetchAttamentStorageDir({
      projectId: root.projectId,
      shellParentId: root.parentId
    }).then(res => {
      vm.downloadDirOptions = res.data.map(ele => {
        return { description: ele.storageDirRelative, label: ele.shellName, value: ele.storageDir }
      })
    })
  }
}
</script>
