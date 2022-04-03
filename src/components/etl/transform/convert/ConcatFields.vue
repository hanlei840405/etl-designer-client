<template>
  <div style="width: 100%;">
    <q-form class="q-gutter-md">
        <q-tabs v-model="tab" class="text-grey" active-color="cyan-8" indicator-color="cyan-8" align="left"
                narrow-indicator>
          <q-tab name="main" label="主选项"/>
          <q-tab name="parameter" label="字段"/>
          <q-tab name="setting" label="运行参数"/>
        </q-tabs>
        <q-tab-panels v-model="tab" animated>
          <q-tab-panel name="main">
            <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.name" label="步骤名称" lazy-rules
                     :rules="[ val => val && val.length > 0 || 'Please type something']"/>
            <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.target" label="目标字段"/>
            <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model.number="form.lengthValue" label="长度"/>
            <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.separator" label="分隔符"/>
            <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.enclosure" label="包围符"/>
          </q-tab-panel>
          <q-tab-panel name="parameter">
            <q-table :data="form.parameters" :columns="parameterColumns" :rows-per-page-options="[0]" row-key="name"
                     separator="cell" hide-bottom title="字段选择">
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
                    <q-btn size="xs" outline round color="negative" icon="remove"
                           @click="deleteParameter(props)"></q-btn>
                  </q-td>
                  <q-td key="source" :props="props">
                    {{ props.row.source }}
                    <q-popup-edit v-model="props.row.source" :auto-save=true>
                      <q-select autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.source" :options="sourceFields" v-if="sourceFields.length > 0"/>
                      <q-input autofocus text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.source" v-if="sourceFields.length === 0"/>
                    </q-popup-edit>
                  </q-td>
                  <q-td key="category" :props="props">
                    {{ props.row.category }}
                    <q-popup-edit v-model="props.row.category" :auto-save=true>
                      <q-select autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.category" :options="categories"/>
                    </q-popup-edit>
                  </q-td>
                  <q-td key="formatValue" :props="props">
                    {{ props.row.formatValue }}
                    <q-popup-edit v-model="props.row.formatValue" :auto-save=true>
                      <q-select autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.formatValue" :options="formats"/>
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
                  <q-td key="currency" :props="props">
                    {{ props.row.currency }}
                    <q-popup-edit v-model="props.row.currency" :auto-save=true>
                      <q-input autofocus text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.currency"/>
                    </q-popup-edit>
                  </q-td>
                  <q-td key="decimal" :props="props">
                    {{ props.row.decimal }}
                    <q-popup-edit v-model="props.row.decimal" :auto-save=true>
                      <q-input autofocus text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.decimal"/>
                    </q-popup-edit>
                  </q-td>
                  <q-td key="groupBy" :props="props">
                    {{ props.row.groupBy }}
                    <q-popup-edit v-model="props.row.groupBy" :auto-save=true>
                      <q-input autofocus text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.groupBy"/>
                    </q-popup-edit>
                  </q-td>
                  <q-td key="removeBlank" :props="props">
                    {{ props.row.removeBlank }}
                    <q-popup-edit v-model="props.row.removeBlank" :auto-save=true>
                      <q-select autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.removeBlank" :options="removeBlanks"/>
                    </q-popup-edit>
                  </q-td>
                  <q-td key="emptyValue" :props="props">
                    {{ props.row.emptyValue }}
                    <q-popup-edit v-model="props.row.emptyValue" :auto-save=true>
                      <q-select autofocus text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.emptyValue" :options="emptyValues"/>
                    </q-popup-edit>
                  </q-td>
                </q-tr>
              </template>
            </q-table>
          </q-tab-panel>
          <q-tab-panel name="setting">
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
  name: 'ConcatFieldsMeta',
  data () {
    return {
      tab: 'main',
      form: {
        name: null,
        target: null,
        lengthValue: 0,
        separator: '.',
        enclosure: '"',
        parameters: [],
        distribute: true,
        parallel: 1
      },
      parameterColumns: [
        {
          name: 'operate',
          label: '操作',
          field: 'operate',
          align: 'right',
          headerStyle: 'width: 20px'
        },
        {
          name: 'source',
          label: '字段',
          field: 'source',
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
          label: '货币格式',
          field: 'currency',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'decimal',
          label: '小数',
          field: 'decimal',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'groupBy',
          label: '分组',
          field: 'groupBy',
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
          name: 'emptyValue',
          label: '设为空串',
          field: 'emptyValue',
          align: 'left',
          headerStyle: 'width: 100px;'
        }
      ],
      dynamicColumns: [],
      categories: ['BigNumber', 'Binary', 'Boolean', 'Date', 'Integer', 'Internet Address', 'Number', 'String', 'Timestamp'],
      emptyValues: ['Y', 'N'],
      removeBlanks: ['none', 'left', 'right', 'both'],
      formats: ['yyyy/MM/dd HH:mm:ss.SSS', 'yyyy/MM/dd HH:mm:ss.SSS XXX', 'yyyy/MM/dd HH:mm:ss', 'yyyy/MM/dd HH:mm:ss XXX', 'yyyyMMddHHmmss', 'yyyy/MM/dd', 'yyyy-MM-dd', 'yyyy-MM-dd HH:mm:ss', 'yyyy-MM-dd HH:mm:ss XXX',
        'yyyyMMdd', 'MM/dd/yyyy', 'MM/dd/yyyy HH:mm:ss', 'MM-dd-yyyy', 'MM-dd-yyyy HH:mm:ss', 'MM/dd/yy', 'MM-dd-yy', 'dd/MM/yyyy', 'dd-MM-yyyy', 'yyyy-MM-dd\'T\'HH:mm:ss.SSSXXX', 'yyyy-MM-dd HH:mm:ss.SSS'],
      sourceFields: [],
      forbiddenParallel: false
    }
  },
  methods: {
    addParameter () {
      this.form.parameters.push({
        source: null,
        category: 'String',
        formatValue: null,
        lengthValue: -1,
        accuracy: -1,
        currency: null,
        decimal: null,
        groupBy: null,
        emptyValue: null
      })
    },
    appendDiffParameter () {
      const vm = this
      const items = vm.form.parameters.filter(parameter => vm.sourceFields.indexOf(parameter.source) >= 0)
      const array = vm.sourceFields
      items.forEach(item => {
        array.splice(array.findIndex(i => i === item.source), 1)
      })
      array.forEach(field => {
        this.form.parameters.push({
          source: field,
          category: 'String',
          formatValue: null,
          lengthValue: -1,
          accuracy: -1,
          currency: null,
          decimal: null,
          groupBy: null,
          emptyValue: null
        })
      })
    },
    addAllParameter () {
      const vm = this
      vm.sourceFields.forEach(field => {
        vm.form.parameters.push({
          source: field,
          category: 'String',
          formatValue: null,
          lengthValue: -1,
          accuracy: -1,
          currency: null,
          decimal: null,
          groupBy: null,
          emptyValue: null
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
    submitForm () {
      this.$emit('propertiesForm', {
        state: true,
        mxCellProperties: this.form,
        ext: {
          sourceFields: [this.form.target]
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
