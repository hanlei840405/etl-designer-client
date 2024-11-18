<template>
  <div style="width: 100%;">
    <q-form class="q-gutter-md">
        <q-tabs v-model="tab" align="left" narrow-indicator>
          <q-tab name="basic" :label="$t('form.concatFields.tabBasic')"/>
          <q-tab name="parameter" :label="$t('form.concatFields.tabField')"/>
          <q-tab name="runningConfig" :label="$t('form.concatFields.tabRunningConfig')"/>
        </q-tabs>
        <q-tab-panels v-model="tab" animated>
          <q-tab-panel class="row q-col-gutter-xs" name="basic">
            <q-input class="col-12 col-md-6" outlined v-model="form.name" :label="$t('form.concatFields.name')" :rules="[ val => val && val.length > 0 || 'Please type something']" hint=""/>
            <q-input class="col-12 col-md-6" outlined v-model="form.target" :label="$t('form.concatFields.targetField')" hint=""/>
            <q-input class="col-12 col-md-6" outlined v-model.number="form.lengthValue" :label="$t('form.concatFields.length')" hint=""/>
            <q-input class="col-12 col-md-6" outlined v-model="form.separator" :label="$t('form.concatFields.separator')" hint=""/>
            <q-input class="col-12 col-md-6" outlined v-model="form.enclosure" :label="$t('form.concatFields.enclosure')" hint=""/>
          </q-tab-panel>
          <q-tab-panel name="parameter">
            <q-table :data="form.parameters" :columns="parameterColumns" :rows-per-page-options="[0]" row-key="name" separator="cell" hide-bottom :title="$t('form.concatFields.tableField')">
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
                  <q-td key="source" :props="props">
                    {{ props.row.source }}
                    <q-popup-edit v-model="props.row.source" :auto-save="true">
                      <q-select autofocus outlined v-model="props.row.source" :options="sourceFields" @new-value="createSourceField" use-input/>
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
                      <q-input autofocus v-model.number="props.row.lengthValue"/>
                    </q-popup-edit>
                  </q-td>
                  <q-td key="accuracy" :props="props">
                    {{ props.row.accuracy }}
                    <q-popup-edit v-model.number="props.row.accuracy" :auto-save="true">
                      <q-input autofocus v-model.number="props.row.accuracy"/>
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
                  <q-td key="removeBlank" :props="props">
                    {{ props.row.removeBlank }}
                    <q-popup-edit v-model="props.row.removeBlank" :auto-save="true">
                      <q-select autofocus outlined v-model="props.row.removeBlank" :options="removeBlanks"/>
                    </q-popup-edit>
                  </q-td>
                  <q-td key="emptyValue" :props="props">
                    {{ props.row.emptyValue }}
                    <q-popup-edit v-model="props.row.emptyValue" :auto-save="true">
                      <q-select autofocus v-model="props.row.emptyValue" :options="emptyValues"/>
                    </q-popup-edit>
                  </q-td>
                </q-tr>
              </template>
            </q-table>
          </q-tab-panel>
          <q-tab-panel name="runningConfig">
            <q-input outlined v-model.number="form.parallel" :label="$t('form.concatFields.threads')" type="number" min="1"
                     :disable="forbiddenParallel"/>
          </q-tab-panel>
        </q-tab-panels>
    </q-form>
  </div>
</template>

<script>
const FORBIDDEN_NEXT_STEP_PARALLEL = ['SwitchCaseMeta']
const IGNORE_REPEAT_WARNING_META = ['SortRowsMeta', 'SetValueFieldMeta']
export default {
  name: 'ConcatFieldsMeta',
  data () {
    return {
      tab: 'basic',
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
          label: this.$t('form.concatFields.columnOperate'),
          field: 'operate',
          align: 'right',
          headerStyle: 'width: 20px'
        },
        {
          name: 'source',
          label: this.$t('form.concatFields.columnSourceField'),
          field: 'source',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'category',
          label: this.$t('form.concatFields.columnType'),
          field: 'category',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'formatValue',
          label: this.$t('form.concatFields.columnFormat'),
          field: 'formatValue',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'lengthValue',
          label: this.$t('form.concatFields.columnLength'),
          field: 'lengthValue',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'accuracy',
          label: this.$t('form.concatFields.columnAccuracy'),
          field: 'accuracy',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'currency',
          label: this.$t('form.concatFields.columnCurrencyFormat'),
          field: 'currency',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'decimal',
          label: this.$t('form.concatFields.columnDecimal'),
          field: 'decimal',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'groupBy',
          label: this.$t('form.concatFields.columnGroup'),
          field: 'groupBy',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'removeBlank',
          label: this.$t('form.concatFields.columnRemoveBlank'),
          field: 'removeBlank',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'emptyValue',
          label: this.$t('form.concatFields.columnEmpty'),
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
    createSourceField (val, done) {
      if (val.length > 0) {
        if (!this.sourceFields.includes(val)) {
          this.sourceFields.push(val)
        }
        done(val, 'toggle')
      }
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
    }
  }
}
</script>
