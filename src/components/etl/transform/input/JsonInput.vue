<template>
  <div style="width: 100%;">
    <q-form class="q-gutter-md">
      <q-tabs v-model="tab" class="text-grey" active-color="cyan-8" indicator-color="cyan-8" align="left" narrow-indicator>
        <q-tab name="file" label="文件"/>
        <q-tab name="content" label="内容"/>
        <q-tab name="field" label="字段"/>
        <q-tab name="parameter" label="运行参数"/>
      </q-tabs>
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="file">
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.name" label="步骤名称" lazy-rules :rules="[ val => val && val.length > 0 || 'Please type something']"/>
          <q-checkbox outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.inFields" label="源定义在一个字段里?" />
          <br/>
          <q-select clearable outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.valueField" :options="sourceFields" label="从步骤插入数据" @clear="form.executeEachInputRow = false" :disable="!form.inFields"/>
          <br/>
          <q-table :data="form.sourceFileData" :columns="sourceFileColumns" :rows-per-page-options="[0]" row-key="name" separator="cell" hide-bottom title="从文件中读取">
            <template v-slot:top-right>
              <q-btn size="sm" outline text-color="cyan-8" icon="add" @click="addSourceFile" :disable="form.inFields"/>
            </template>
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="operate" :props="props">
                  <q-btn size="xs" outline round color="negative" icon="remove"
                         @click="deleteSourceFile(props)"></q-btn>
                </q-td>
                <q-td key="path" :props="props">
                  {{ props.row.path }}
                  <q-popup-edit v-model="props.row.path" :auto-save=true>
                    <q-input autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.path"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="wildcard" :props="props">
                  {{ props.row.wildcard }}
                  <q-popup-edit v-model="props.row.wildcard" :auto-save=true>
                    <q-input autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.wildcard"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="excludeWildcard" :props="props">
                  {{ props.row.excludeWildcard }}
                  <q-popup-edit v-model="props.row.excludeWildcard" :auto-save=true>
                    <q-input autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.excludeWildcard"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="required" :props="props">
                  {{ props.row.required }}
                  <q-popup-edit v-model="props.row.required" :auto-save=true>
                    <q-select autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.required" :options="yesOrNo"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="includeChildrenFolder" :props="props">
                  {{ props.row.includeChildrenFolder }}
                  <q-popup-edit v-model="props.row.includeChildrenFolder" :auto-save=true>
                    <q-select autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.includeChildrenFolder" :options="yesOrNo"/>
                  </q-popup-edit>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-tab-panel>
        <q-tab-panel name="content">
          <q-checkbox outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.ignoreEmptyFile" label="忽略空文件" />
          <br/>
          <q-checkbox outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.notFailIfNoFile" label="如果没有文件不进行报错" />
          <br/>
          <q-checkbox outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.ignoreMissingPath" label="忽略不完整的路径" />
          <br/>
          <q-checkbox outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.defaultPathLeafToNull" label="Default path leaf to null" />
          <br/>
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model.number="form.rowLimit" label="限制"/>
          <br/>
          <q-checkbox outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.includeFilename" label="在输出中包含文件名" /> <q-input outlined v-model="form.filenameField" label="包含文件的字段名"/>
          <br/>
          <q-checkbox outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.includeRowNumber" label="在输出中包含行数" /> <q-input outlined v-model="form.rowNumberField" label="包含行数的字段名"/>
        </q-tab-panel>
        <q-tab-panel name="field">
          <q-table :data="form.parameters" :columns="parameterColumns" :rows-per-page-options="[0]" row-key="field" separator="cell" hide-bottom title="字段">
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
                    <q-input autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.field"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="path" :props="props">
                  {{ props.row.path }}
                  <q-popup-edit v-model="props.row.path" :auto-save="true">
                    <q-input autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.path"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="category" :props="props">
                  {{ props.row.category }}
                  <q-popup-edit v-model="props.row.category" :auto-save="true">
                    <q-select autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.category" :options="categories"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="formatValue" :props="props">
                  {{ props.row.formatValue }}
                  <q-popup-edit v-model="props.row.formatValue" :auto-save="true">
                    <q-select autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.formatValue" :options="formats"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="lengthValue" :props="props">
                  {{ props.row.lengthValue }}
                  <q-popup-edit v-model.number="props.row.lengthValue" :auto-save="true">
                    <q-input autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model.number="props.row.lengthValue"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="accuracy" :props="props">
                  {{ props.row.accuracy }}
                  <q-popup-edit v-model.number="props.row.accuracy" :auto-save="true">
                    <q-input autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model.number="props.row.accuracy"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="currency" :props="props">
                  {{ props.row.currency }}
                  <q-popup-edit v-model="props.row.currency" :auto-save="true">
                    <q-input autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.currency"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="decimal" :props="props">
                  {{ props.row.decimal }}
                  <q-popup-edit v-model="props.row.decimal" :auto-save="true">
                    <q-input autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.decimal"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="groupBy" :props="props">
                  {{ props.row.groupBy }}
                  <q-popup-edit v-model="props.row.groupBy" :auto-save="true">
                    <q-input autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.groupBy"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="removeBlank" :props="props">
                  {{ props.row.removeBlank }}
                  <q-popup-edit v-model="props.row.removeBlank" :auto-save="true">
                    <q-select autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.removeBlank" :options="removeBlanks"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="distinct" :props="props">
                  {{ props.row.distinct }}
                  <q-popup-edit v-model="props.row.distinct" :auto-save="true">
                    <q-select autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.distinct" :options="yesOrNo"/>
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
  name: 'JsonInputMeta',
  data () {
    return {
      tab: 'file',
      form: {
        name: null,
        inFields: false,
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
      sourceFileColumns: [
        {
          name: 'operate',
          label: '操作',
          field: 'operate',
          align: 'right',
          headerStyle: 'width: 20px'
        },
        {
          name: 'path',
          label: '文件路径',
          field: 'path',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'wildcard',
          label: '通配符',
          field: 'wildcard',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'excludeWildcard',
          label: '通配符(排除)',
          field: 'excludeWildcard',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'required',
          label: '要求',
          field: 'required',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'includeChildrenFolder',
          label: '包含子目录',
          field: 'includeChildrenFolder',
          align: 'left',
          headerStyle: 'width: 100px;'
        }
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
          name: 'path',
          label: '路径',
          field: 'path',
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
          name: 'formatValue',
          label: '格式',
          field: 'formatValue',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'lengthValue',
          label: '长度',
          field: 'lengthValue',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'accuracy',
          label: '精度',
          field: 'accuracy',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'currency',
          label: '货币',
          field: 'currency',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'decimal',
          label: '十进制',
          field: 'decimal',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'groupBy',
          label: '组',
          field: 'decimal',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'removeBlank',
          label: '去除空格类型',
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
        distinct: null
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
