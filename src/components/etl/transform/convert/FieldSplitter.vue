<template>
  <div style="width: 100%;">
    <q-form class="q-gutter-md">
      <q-tabs v-model="tab" class="text-grey" active-color="cyan-8" indicator-color="cyan-8" align="left"
              narrow-indicator>
        <q-tab name="main" label="主选项"/>
        <q-tab name="field" label="字段"/>
        <q-tab name="parameter" label="运行参数"/>
      </q-tabs>
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="main">
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.name" label="步骤名称" lazy-rules
                   :rules="[ val => val && val.length > 0 || 'Please type something']"/>
          <q-select outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.field" :options="sourceFields" label="需要拆分的字段"></q-select>
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.delimiter" label="分隔符"/>
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.enclosure" label="Enclosure"/>
        </q-tab-panel>
        <q-tab-panel name="field">
          <q-table :data="form.parameters" :columns="parameterColumns" :rows-per-page-options="[0]" row-key="name"
                   separator="cell" hide-bottom title="新字段">
            <template v-slot:top-right>
              <q-btn size="sm" outline text-color="cyan-8" icon="add" @click="addParameter"/>
            </template>
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="operate" :props="props">
                  <q-btn size="xs" outline round color="negative" icon="remove"
                         @click="deleteParameter(props)"></q-btn>
                </q-td>
                <q-td key="field" :props="props">
                  {{ props.row.field }}
                  <q-popup-edit v-model="props.row.field" :auto-save=true>
                    <q-input autofocus text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.field"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="newId" :props="props">
                  {{ props.row.newId }}
                  <q-popup-edit v-model="props.row.newId" :auto-save=true>
                    <q-input autofocus text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.newId"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="removeId" :props="props">
                  {{ props.row.removeId }}
                  <q-popup-edit v-model="props.row.removeId" :auto-save=true>
                    <q-select autofocus text-color="cyan-8" color="cyan-8" label-color="cyan-8" outlined v-model="props.row.removeId" :options="removeIds"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="category" :props="props">
                  {{ props.row.category }}
                  <q-popup-edit v-model="props.row.category" :auto-save=true>
                    <q-select autofocus text-color="cyan-8" color="cyan-8" label-color="cyan-8" outlined v-model="props.row.category" :options="categories"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="lengthValue" :props="props">
                  {{ props.row.lengthValue }}
                  <q-popup-edit v-model.number="props.row.lengthValue" :auto-save=true>
                    <q-input autofocus text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model.number="props.row.lengthValue"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="accuracy" :props="props">
                  {{ props.row.accuracy }}
                  <q-popup-edit v-model.number="props.row.accuracy" :auto-save=true>
                    <q-input autofocus text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model.number="props.row.accuracy"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="formatValue" :props="props">
                  {{ props.row.formatValue }}
                  <q-popup-edit v-model="props.row.formatValue" :auto-save=true>
                    <q-input autofocus text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.formatValue"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="groupBy" :props="props">
                  {{ props.row.groupBy }}
                  <q-popup-edit v-model="props.row.groupBy" :auto-save=true>
                    <q-input autofocus text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.groupBy"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="decimal" :props="props">
                  {{ props.row.decimal }}
                  <q-popup-edit v-model="props.row.decimal" :auto-save=true>
                    <q-input autofocus text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.decimal"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="currency" :props="props">
                  {{ props.row.currency }}
                  <q-popup-edit v-model="props.row.currency" :auto-save=true>
                    <q-input autofocus text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.currency"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="nullIf" :props="props">
                  {{ props.row.nullIf }}
                  <q-popup-edit v-model="props.row.nullIf" :auto-save=true>
                    <q-input autofocus text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.nullIf"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="emptyValue" :props="props">
                  {{ props.row.emptyValue }}
                  <q-popup-edit v-model="props.row.emptyValue" :auto-save=true>
                    <q-input autofocus text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.emptyValue"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="removeBlank" :props="props">
                  {{ props.row.removeBlank }}
                  <q-popup-edit v-model="props.row.removeBlank" :auto-save=true>
                    <q-select autofocus text-color="cyan-8" color="cyan-8" label-color="cyan-8" outlined v-model="props.row.removeBlank" :options="removeBlanks"/>
                  </q-popup-edit>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-tab-panel>
        <q-tab-panel name="parameter">
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model.number="form.parallel" label="执行线程数" type="number" min="1"
                   :disable="forbiddenParallel"/>
        </q-tab-panel>
      </q-tab-panels>
  </q-form>
  </div>
</template>

<script>
const FORBIDDEN_NEXT_STEP_PARALLEL = ['SwitchCaseMeta']
export default {
  name: 'FieldSplitterMeta',
  data () {
    return {
      tab: 'main',
      form: {
        name: null,
        field: null,
        delimiter: ',',
        enclosure: null,
        parameters: [],
        distribute: true,
        parallel: 1
      },
      sourceFields: [],
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
          name: 'newId',
          label: 'ID',
          field: 'newId',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'removeId',
          label: '去除ID',
          field: 'removeId',
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
          name: 'formatValue',
          label: '格式',
          field: 'formatValue',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'groupBy',
          label: '组',
          field: 'groupBy',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'decimal',
          label: '小数点符号',
          field: 'decimal',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'currency',
          label: '货币符号',
          field: 'currency',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'nullIf',
          label: 'nullIf',
          field: 'nullIf',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'emptyValue',
          label: '缺省',
          field: 'emptyValue',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'removeBlank',
          label: '去除空格类型',
          field: 'removeBlank',
          align: 'left',
          headerStyle: 'width: 100px;'
        }
      ],
      categories: ['BigNumber', 'Binary', 'Boolean', 'Date', 'Integer', 'Internet Address', 'Number', 'String', 'Timestamp'],
      removeIds: ['Y', 'N'],
      removeBlanks: ['none', 'left', 'right', 'both'],
      forbiddenParallel: false
    }
  },
  methods: {
    addParameter () {
      this.form.parameters.push({
        field: null,
        newId: null,
        removeId: null,
        category: 'String',
        lengthValue: -1,
        accuracy: -1,
        formatValue: null,
        groupBy: null,
        decimal: null,
        currency: null,
        nullIf: null,
        emptyValue: null,
        removeBlank: null
      })
    },
    deleteParameter (props) {
      this.form.parameters.splice(props.rowIndex, 1)
    },
    submitForm (e) {
      this.$emit('propertiesForm', {
        state: true,
        mxCellProperties: this.form,
        ext: {
          sourceFields: this.form.parameters.map(ele => ele.field)
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
    }
  }
}
</script>
