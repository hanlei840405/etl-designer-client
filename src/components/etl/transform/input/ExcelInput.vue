<template>
  <div style="width: 100%;">
    <q-form class="q-gutter-md">
      <q-tabs v-model="tab" align="left" narrow-indicator>
        <q-tab name="file" :label="$t('tab-file')"/>
        <q-tab name="content" :label="$t('tab-content')"/>
        <q-tab name="field" :label="$t('tab-field')"/>
      </q-tabs>
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="file">
          <q-input outlined v-model="form.name" :label="$t('form-name')" lazy-rules :rules="[ val => val && val.length > 0 || 'Please type something']"/>
          <q-uploader :factory="upload" @removed="removeFile" @uploaded="uploaded" url="http://localhost:30200/attachment/upload" method="post" field-name="file" label="模板：确保服务器上文件内容与模板一致" auto-upload withCredentials style="width: 100%;"/>
          <br/>
          <q-input outlined v-model="form.reg" label="正则表达式"/>
          <br/>
          <q-input outlined v-model="form.regExclude" label="正则表达式(排除)"/>
          <br/>
          <q-input outlined v-model="form.password" label="文件密码"/>
          <q-toolbar class="bg-teal text-white shadow-2">
            <q-toolbar-title>文件相对目录</q-toolbar-title>
          </q-toolbar>
          <q-list bordered padding class="rounded-borders">
            <q-item v-for="filename in form.filenames" v-bind:key="filename" v-ripple>
              <q-item-section>
                {{ '~/' + filename }}
              </q-item-section>
              <q-item-section side>
                <div class="text-grey-8 q-gutter-xs">
                  <q-btn class="gt-xs" size="12px" flat dense round icon="delete" />
                </div>
              </q-item-section>
            </q-item>
          </q-list>
          <q-select outlined v-model="form.sheet" clearable filled use-input :options="sheets" label="选择工作表" @input="selectedSheet"/>
        </q-tab-panel>
        <q-tab-panel name="content">
          <q-checkbox v-model="form.header" label="显示头部" /> <q-checkbox v-model="form.notNull" label="非空记录" /> <q-checkbox v-model="form.pause" label="停在空记录" />
          <br/>
          <q-input outlined type="number" v-model.number="form.limit" label="限制数"/>
          <br/>
          <q-select outlined v-model="form.encoding" clearable filled use-input @filter="filterEncoding" :options="copyEncodings" label="字符集编码"/>
          <q-checkbox v-model="form.withFileName" label="添加文件名" /> <q-checkbox v-model="form.header" label="严格类型" />
          <br/>
          <q-checkbox v-model="form.notNull" label="忽略错误" /> <q-checkbox v-model="form.pause" label="跳过错误行" />
        </q-tab-panel>
        <q-tab-panel name="field">
          <q-table :data="form.parameters" :columns="parameterColumns" :rows-per-page-options="[0]" row-key="name" separator="cell" hide-bottom :title="$t('table-title-field')">
            <template v-slot:top-right>
              <q-btn size="sm" outline text-color="cyan-8" icon="add" @click="addParameter"/>
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
                  <q-popup-edit v-model="props.row.accuracy" :auto-save="true">
                    <q-input autofocus outlined v-model="props.row.accuracy"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="removeBlank" :props="props">
                  {{ props.row.removeBlank }}
                  <q-popup-edit v-model="props.row.removeBlank" :auto-save="true">
                    <q-select autofocus outlined v-model="props.row.removeBlank" :options="removeBlanks"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="distinct" :props="props">
                  {{ props.row.distinct }}
                  <q-popup-edit v-model="props.row.distinct" :auto-save="true">
                    <q-select autofocus outlined v-model="props.row.distinct" :options="yesOrNo"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="formatValue" :props="props">
                  {{ props.row.formatValue }}
                  <q-popup-edit v-model="props.row.formatValue" :auto-save="true">
                    <q-select autofocus outlined v-model="props.row.formatValue" :options="formats"/>
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
              </q-tr>
            </template>
          </q-table>
        </q-tab-panel>
      </q-tab-panels>
  </q-form>
  </div>
</template>

<script>
import { remove } from 'src/service/AttachmentService'
import { sheets, headers } from 'src/service/kettle/PreviewService'
export default {
  name: 'ExcelInputMeta',
  data () {
    return {
      tab: 'file',
      form: {
        name: null,
        filenames: [],
        reg: null,
        regExclude: null,
        password: null,
        header: true,
        sheet: [],
        notNull: true,
        pause: false,
        limit: 0,
        encoding: null,
        withFileName: true,
        parameters: [],
        dynamicValues: [],
        distribute: true
      },
      sheets: [],
      encodings: ['Big5', 'Big5-HKSCS', 'CESU-8', 'EUC-JP', 'EUC-KR', 'GB18030', 'GB2312', 'GBK', 'IBM-Thai', 'IBM00858', 'IBM01140', 'IBM01141', 'IBM01142', 'IBM01143', 'IBM01144', 'IBM01145', 'IBM01146', 'IBM01147', 'IBM01148', 'IBM01149', 'IBM037', 'IBM1026', 'IBM1047', 'IBM273', 'IBM277', 'IBM278', 'IBM280', 'IBM284', 'IBM285', 'IBM290',
        'IBM297', 'IBM420', 'IBM424', 'IBM437', 'IBM500', 'IBM775', 'IBM850', 'IBM852', 'IBM855', 'IBM857', 'IBM860', 'IBM861', 'IBM862', 'IBM863', 'IBM864', 'IBM865', 'IBM866', 'IBM868', 'IBM869', 'IBM870', 'IBM871', 'IBM918', 'ISO-2022-CN', 'ISO-2022-JP', 'ISO-2022-JP-2', 'ISO-2022-KR', 'ISO-8859-1', 'ISO-8859-13', 'ISO-8859-15', 'ISO-8859-2',
        'ISO-8859-3', 'ISO-8859-4', 'ISO-8859-5', 'ISO-8859-6', 'ISO-8859-7', 'ISO-8859-8', 'ISO-8859-9', 'JIS_X0201', 'JIS_X0212-1990', 'KOI8-R', 'KOI8-U', 'Shift_JIS', 'TIS-620', 'US-ASCII', 'UTF-16', 'UTF-16BE', 'UTF-16LE', 'UTF-32', 'UTF-32BE', 'UTF-32LE', 'UTF-8', 'windows-1250', 'windows-1251', 'windows-1252', 'windows-1253', 'windows-1254',
        'windows-1255', 'windows-1256', 'windows-1257', 'windows-1258', 'windows-31j', 'x-Big5-HKSCS-2001', 'x-Big5-Solaris', 'x-COMPOUND_TEXT', 'x-euc-jp-linux', 'x-EUC-TW', 'x-eucJP-Open', 'x-IBM1006', 'x-IBM1025', 'x-IBM1046', 'x-IBM1097', 'x-IBM1098', 'x-IBM1112', 'x-IBM1122', 'x-IBM1123', 'x-IBM1124', 'x-IBM1166', 'x-IBM1364', 'x-IBM1381',
        'x-IBM1383', 'x-IBM300', 'x-IBM33722', 'x-IBM737', 'x-IBM833', 'x-IBM834', 'x-IBM856', 'x-IBM874', 'x-IBM875', 'x-IBM921', 'x-IBM922', 'x-IBM930', 'x-IBM933', 'x-IBM935', 'x-IBM937', 'x-IBM939', 'x-IBM942', 'x-IBM942C', 'x-IBM943', 'x-IBM943C', 'x-IBM948', 'x-IBM949', 'x-IBM949C', 'x-IBM950', 'x-IBM964', 'x-IBM970', 'x-ISCII91',
        'x-ISO-2022-CN-CNS', 'x-ISO-2022-CN-GB', 'x-iso-8859-11', 'x-JIS0208', 'x-JISAutoDetect', 'x-Johab', 'x-MacArabic', 'x-MacCentralEurope', 'x-MacCroatian', 'x-MacCyrillic', 'x-MacDingbat', 'x-MacGreek', 'x-MacHebrew', 'x-MacIceland', 'x-MacRoman', 'x-MacRomania', 'x-MacSymbol', 'x-MacThai', 'x-MacTurkish', 'x-MacUkraine', 'x-MS932_0213',
        'x-MS950-HKSCS', 'x-MS950-HKSCS-XP', 'x-mswin-936', 'x-PCK', 'x-SJIS_0213', 'x-UTF-16LE-BOM', 'X-UTF-32BE-BOM', 'X-UTF-32LE-BOM', 'x-windows-50220', 'x-windows-50221', 'x-windows-874', 'x-windows-949', 'x-windows-950', 'x-windows-iso2022jp'],
      copyEncodings: [],
      parameterColumns: [
        {
          name: 'operate',
          label: this.$t('column-operate'),
          field: 'operate',
          align: 'right',
          headerStyle: 'width: 20px'
        },
        {
          name: 'field',
          label: this.$t('column-name'),
          field: 'field',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'category',
          label: this.$t('column-type'),
          field: 'category',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'lengthValue',
          label: this.$t('column-length'),
          field: 'lengthValue',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'accuracy',
          label: this.$t('column-accuracy'),
          field: 'accuracy',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'removeBlank',
          label: this.$t('column-remove-blank'),
          field: 'removeBlank',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'distinct',
          label: '重复',
          field: 'distinct',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'formatValue',
          label: this.$t('column-format'),
          field: 'formatValue',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'currency',
          label: this.$t('column-currency'),
          field: 'currency',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'decimal',
          label: this.$t('column-decimal'),
          field: 'decimal',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'groupBy',
          label: this.$t('column-group'),
          field: 'groupBy',
          align: 'left',
          headerStyle: 'width: 100px;'
        }
      ],
      removeBlanks: ['none', 'left', 'right', 'both'],
      yesOrNo: ['Y', 'N'],
      categories: ['BigNumber', 'Binary', 'Boolean', 'Date', 'Integer', 'Internet Address', 'Number', 'String', 'Timestamp'],
      formats: ['yyyy/MM/dd HH:mm:ss.SSS', 'yyyy/MM/dd HH:mm:ss.SSS XXX', 'yyyy/MM/dd HH:mm:ss', 'yyyy/MM/dd HH:mm:ss XXX', 'yyyyMMddHHmmss', 'yyyy/MM/dd', 'yyyy-MM-dd', 'yyyy-MM-dd HH:mm:ss', 'yyyy-MM-dd HH:mm:ss XXX',
        'yyyyMMdd', 'MM/dd/yyyy', 'MM/dd/yyyy HH:mm:ss', 'MM-dd-yyyy', 'MM-dd-yyyy HH:mm:ss', 'MM/dd/yy', 'MM-dd-yy', 'dd/MM/yyyy', 'dd-MM-yyyy', 'yyyy-MM-dd\'T\'HH:mm:ss.SSSXXX', 'yyyy-MM-dd HH:mm:ss.SSS']
    }
  },
  methods: {
    upload (files) {
      return {
        headers: [
          { name: 'X-Requested-With', value: 'XMLHttpRequest' },
          { name: 'Authorization', value: 'Bearer ' + localStorage.getItem('token').replace('__q_strn|', '') }
        ]
      }
    },
    removeFile (files) {
      const vm = this
      remove({ filename: files[0].name }).then(() => {
        if (vm.form.filenames.indexOf(files[0].name) >= 0) {
          vm.form.filenames.splice(vm.form.filenames.indexOf(files[0].name), 1)
        }
      }).catch(err => {
        vm.$q.notify({
          position: 'top',
          message: err.data.error,
          color: 'negative'
        })
      })
    },
    uploaded (info) {
      const vm = this
      if (vm.form.filenames.indexOf(info.files[0].name) < 0) {
        vm.form.filenames.push(info.files[0].name)
        sheets({
          category: 'ooxml',
          filenames: vm.form.filenames
        }).then(res => {
          vm.sheets = res.data
        }).catch(err => {
          if (err.data.code === 10010) {
            vm.$q.notify({
              position: 'top',
              message: '多份文档选定的工作表不一致',
              color: 'negative'
            })
          }
        })
      }
    },
    selectedSheet (sheetName) {
      const vm = this
      vm.form.parameters = []
      headers({
        category: 'ooxml',
        filenames: vm.form.filenames,
        sheetName: sheetName
      }).then(res => {
        res.data.forEach(item => {
          vm.form.parameters.push({
            field: item
          })
        })
      }).catch(err => {
        if (err.data.code === 10010) {
          vm.$q.notify({
            position: 'top',
            message: '多份文档选定的工作表不一致',
            color: 'negative'
          })
        }
      })
    },
    addSheet () {
      this.form.sheets.push({
        name: null,
        startRowNo: null,
        startColumnNo: null
      })
    },
    deleteSheet (props) {
      this.form.sheets.splice(props.rowIndex, 1)
    },
    filterEncoding (val, update) {
      if (val === '') {
        update(() => {
          this.copyEncodings = this.encodings
        })
        return
      }
      update(() => {
        const needle = val.toLowerCase()
        this.copyEncodings = this.encodings.filter(v => v.toLowerCase().indexOf(needle) > -1)
      })
    },
    addParameter () {
      this.form.parameters.push({
        field: null,
        category: 'String',
        lengthValue: -1,
        accuracy: -1,
        removeBlank: null,
        distinct: null,
        formatValue: null,
        currency: null,
        decimal: null,
        groupBy: null
      })
    },
    deleteParameter (props) {
      this.form.parameters.splice(props.rowIndex, 1)
    },
    submitForm () {
      const sourceFields = []
      this.form.dynamicValues.map(dv => {
        for (const key in dv) {
          if (key !== '_operate_') {
            sourceFields.push(key)
          }
        }
      })
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
    const mxCellValue = vm.$store.getters['etl/getMxCellForm']
    if (mxCellValue) {
      vm.form = Object.assign(vm.form, mxCellValue)
      if (vm.form.sheet) {
        vm.sheets.push(vm.form.sheet)
      }
    }
  }
}
</script>
