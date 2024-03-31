<template>
  <div style="width: 100%;">
    <q-form class="q-gutter-md">
      <q-tabs v-model="tab" align="left"
              narrow-indicator>
        <q-tab name="basic" :label="$t('form.setVariable.tabBasic')"/>
        <q-tab name="runningConfig" :label="$t('form.setVariable.tabRunningConfig')"/>
      </q-tabs>
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="basic">
          <q-input outlined v-model="form.name" :label="$t('form.setVariable.name')" :rules="[ val => val && val.length > 0 || 'Please type something']" hint=""/>
          <q-table :data="form.parameters" :columns="parameterColumns" :rows-per-page-options="[0]" row-key="name" separator="cell" hide-bottom :title="$t('form.setVariable.argument')">
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
                <q-td key="variable" :props="props">
                  {{ props.row.variable }}
                  <q-popup-edit v-model="props.row.variable" :auto-save="true">
                    <q-input autofocus v-model="props.row.variable"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="scope" :props="props">
                  {{ getLabel(props.row.scope) }}
                  <q-popup-edit v-model="props.row.scope" :auto-save="true">
                    <q-select autofocus outlined v-model="props.row.scope" emit-value map-options :options="scopes"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="defaultValue" :props="props">
                  {{ props.row.defaultValue }}
                  <q-popup-edit v-model="props.row.defaultValue" :auto-save="true">
                    <q-input autofocus v-model="props.row.defaultValue"/>
                  </q-popup-edit>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-tab-panel>
        <q-tab-panel name="runningConfig">
          <q-input outlined v-model.number="form.parallel" :label="$t('form.setVariable.threads')" type="number" min="1" :disable="forbiddenParallel"/>
        </q-tab-panel>
      </q-tab-panels>
  </q-form>
  </div>
</template>

<script>

const FORBIDDEN_NEXT_STEP_PARALLEL = ['SwitchCaseMeta']
const IGNORE_REPEAT_WARNING_META = ['SortRowsMeta']
export default {
  name: 'SetVariableMeta',
  data () {
    return {
      tab: 'basic',
      form: {
        name: null,
        distribute: true,
        parameters: [],
        parallel: 1
      },
      scopeMapping: {
        JVM: 'Valid in the Java Virtual Machine',
        PARENT_JOB: 'Valid in the parent job',
        GP_JOB: 'Valid in the grand-parent job',
        ROOT_JOB: 'Valid in the root job'
      },
      scopes: [{
        value: 'JVM',
        label: 'Valid in the Java Virtual Machine'
      }, {
        value: 'PARENT_JOB',
        label: 'Valid in the parent job'
      }, {
        value: 'GP_JOB',
        label: 'Valid in the grand-parent job'
      }, {
        value: 'ROOT_JOB',
        label: 'Valid in the root job'
      }],
      parameterColumns: [
        {
          name: 'operate',
          label: this.$t('form.setVariable.columnOperate'),
          filed: 'operate',
          align: 'right',
          headerStyle: 'width: 20px'
        },
        {
          name: 'field',
          label: this.$t('form.setVariable.columnField'),
          field: 'field',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'variable',
          label: this.$t('form.setVariable.columnVariable'),
          field: 'variable',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'scope',
          label: this.$t('form.setVariable.columnScope'),
          field: 'scope',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'defaultValue',
          label: this.$t('form.setVariable.columnDefaultValue'),
          field: 'defaultValue',
          align: 'left',
          headerStyle: 'width: 100px;'
        }
      ],
      sourceFields: [],
      forbiddenParallel: false
    }
  },
  methods: {
    getLabel (val) {
      return this.scopeMapping[val]
    },
    addParameter () {
      this.form.parameters.push({
        field: null,
        variable: null,
        scope: null,
        defaultValue: null
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
          variable: null,
          scope: null,
          defaultValue: null
        })
      })
    },
    addAllParameter () {
      const vm = this
      vm.sourceFields.forEach(field => {
        vm.form.parameters.push({
          field: field,
          variable: null,
          scope: null,
          defaultValue: null
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
      this.$emit('propertiesForm', {
        state: true,
        mxCellProperties: this.form,
        ext: { sourceFields: this.form.parameters.map(ele => ele.variable) }
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
