<template>
  <div style="width: 100%;">
    <q-form class="q-gutter-md">
      <q-tabs v-model="tab" class="text-grey" active-color="cyan-8" indicator-color="cyan-8" align="left" narrow-indicator>
        <q-tab name="main" label="文件"/>
        <q-tab name="sheet" label="工作表"/>
        <q-tab name="content" label="内容"/>
        <q-tab name="field" label="字段"/>
        <q-tab name="parameter" label="运行参数"/>
      </q-tabs>
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="main">
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.name" label="步骤名称" lazy-rules :rules="[ val => val && val.length > 0 || 'Please type something']"/>
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.filename" label="文件名">
            <template v-slot:append>
              <q-icon name="help_outline" >
                <q-tooltip>
                  文件名：相对路径，系统会根据主体信息动态分配存储位置
                </q-tooltip>
              </q-icon>
            </template>
          </q-input>
          <br/>
          <q-select outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.suffix" :options="suffixes" emit-value map-options label="扩展名"/>
          <br/>
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.rowNumber" label="每...行分隔"/>
          <q-checkbox text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.useDateFormat" label="指定日期时间格式"/>
          <q-select outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.dateFormat" :options="formats" emit-value map-options label="指定日期格式" :disable="!form.useDateFormat"/>
          <br/>
          <q-select outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.fileOutputMode" :options="outputModes" emit-value map-options label="文件已存在的处理方式"/>
          <br/>
          <q-checkbox text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.useStream" label="以流模式处理超大数据"/>
          <q-checkbox text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.useStepInfoSuffix" label="文件名包含步骤数据"/>
          <q-checkbox text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.useDateSuffix" label="文件名包含日期"/>
          <q-checkbox text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.useTimeSuffix" label="文件名包含时间"/>
          <q-checkbox text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.generateMode" label="在接收到数据前不创建文件"/>
          <q-checkbox text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.nameInResult" label="结果中添加文件名"/>
        </q-tab-panel>
        <q-tab-panel name="sheet">
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.sheetName" label="Sheet页名称"/>
          <br/>
          <q-select outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.sheetOutputMode" :options="outputModes" emit-value map-options label="Sheet已存在的处理方式"/>
          <br/>
          <q-checkbox text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.asActiveSheet" label="设为活动Sheet页"/>
        </q-tab-panel>
        <q-tab-panel name="content">
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.startPoint" label="开始输出的单元格坐标"/>
          <br/>
          <q-select outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.cellOutputMode" :options="outputModes" emit-value map-options label="单元格被占用时的处理方式"/>
          <br/>
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model.number="form.deleteLines" label="抵消行数"/>
          <br/>
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model.number="form.emptyLines" label="在写入文件前添加的空行数"/>
          <br/>
          <q-checkbox text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.useHeader" label="输出表头"/>
          <q-checkbox text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.useFooter" label="输出表尾"/>
          <q-checkbox text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.autoSize" label="自动调整列大小"/>
          <q-checkbox text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.recalculate" label="强制公式重新计算"/>
          <q-checkbox text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.keepStyle" label="不改变现有单元格格式"/>
          <q-checkbox text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.append" label="在b表格末尾开始写（追加行）"/>
          <q-checkbox text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.deleteHeader" label="删除表头"/>
        </q-tab-panel>
        <q-tab-panel name="field">
          <q-table :data="form.parameters" :columns="parameterColumns" :rows-per-page-options="[0]" row-key="name" separator="cell" hide-bottom title="字段">
            <template v-slot:top-right>
              <q-btn-dropdown split outline color="cyan-8" icon="add" text-color="cyan-8" @click="addParameter">
                <q-list>
                  <q-item clickable v-close-popup @click="appendDiffParameter">
                    <q-item-section>
                      <q-item-label>增加新的</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click="addAllParameter">
                    <q-item-section>
                      <q-item-label>增加所有</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click="clearAndAddParameter">
                    <q-item-section>
                      <q-item-label>清除并增加所有</q-item-label>
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
                    <q-select autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.field" :options="sourceFields" @input="props.row.title = props.row.field" v-if="sourceFields.length > 0"/>
                    <q-input autofocus text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.field" @input="props.row.title = props.row.field" v-if="sourceFields.length === 0"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="category" :props="props">
                  {{ props.row.category }}
                  <q-popup-edit v-model="props.row.category" :auto-save=true>
                    <q-select autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.category" :options="categories"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="format" :props="props">
                  {{ props.row.format }}
                  <q-popup-edit v-model="props.row.format" :auto-save=true>
                    <q-select autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.format" :options="fieldFormats"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="style" :props="props">
                  {{ props.row.style }}
                  <q-popup-edit v-model="props.row.style" :auto-save="true">
                    <q-input autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.style"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="title" :props="props">
                  {{ props.row.title }}
                  <q-popup-edit v-model="props.row.title" :auto-save="true">
                    <q-input autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.title"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="headerStyle" :props="props">
                  {{ props.row.headerStyle }}
                  <q-popup-edit v-model="props.row.headerStyle" :auto-save="true">
                    <q-input autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.headerStyle"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="formula" :props="props">
                  {{ props.row.formula }}
                  <q-popup-edit v-model="props.row.formula" :auto-save=true>
                    <q-select autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.formula" :options="formulas"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="link" :props="props">
                  {{ props.row.link }}
                  <q-popup-edit v-model="props.row.link" :auto-save="true">
                    <q-input autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.link"/>
                  </q-popup-edit>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-tab-panel>
        <q-tab-panel name="parameter">
          <q-input outlined text-color="cyan-8" color="cyan-8" v-model.number="form.parallel" label="执行线程数" type="number" min="1" :disable="forbiddenParallel"/>
        </q-tab-panel>
      </q-tab-panels>
  </q-form>
  </div>
</template>

<script>
const FORBIDDEN_NEXT_STEP_PARALLEL = ['SwitchCaseMeta']
export default {
  name: 'ExcelWriterStepMeta',
  data () {
    return {
      tab: 'main',
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
        { value: 'new', label: '覆盖' },
        { value: 'reuse', label: '追加' }
      ],
      parameterColumns: [
        {
          name: 'operate',
          label: '操作',
          field: 'operate',
          align: 'right',
          headerStyle: 'width: 20px'
        },
        {
          name: 'field',
          label: '名称',
          field: 'field',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'category',
          label: '类型',
          field: 'category',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'format',
          label: '格式',
          field: 'format',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'style',
          label: '样式',
          field: 'style',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'title',
          label: '标题',
          field: 'title',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'headerStyle',
          label: '表头样式',
          field: 'headerStyle',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'formula',
          label: '包含公式',
          field: 'formula',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'link',
          label: '超链接',
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
        if (step.ext !== undefined && step.ext !== 'undefined') {
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
        title: '错误',
        message: '来源字段中存在重复名称，组件禁止使用'
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
