<template>
  <div style="width: 100%;">
    <q-form class="q-gutter-md">
      <q-tabs v-model="tab" class="text-grey" active-color="cyan-8" indicator-color="cyan-8" align="left" narrow-indicator>
        <q-tab name="main" :label="$t('tab-basic')"/>
        <q-tab name="field" :label="$t('tab-field')"/>
        <q-tab name="runningConfig" :label="$t('tab-running-config')"/>
      </q-tabs>
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="main">
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.name" :label="$t('form-name')" lazy-rules :rules="[ val => val && val.length > 0 || 'Please type something']"/>
          <q-select outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.targetMode" :options="targetModes" emit-value map-options :label="$t('form-output')" @clear="form.executeEachInputRow = false"/>
          <br/>
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.jsonName" :label="$t('form-json-bloc-name')"/>
          <br/>
          <q-input type="number" min="0" outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model.number="form.rowNumber" :label="$t('form-br-rows-in-bloc')">
            <template v-slot:append>
              <q-icon name="help_outline" >
                <q-tooltip>
                  1、{{ $t('form-zero-save-file') }}<br/>
                  2、{{ $t('form-greater-then-zero-save-file') }}
                </q-tooltip>
              </q-icon>
            </template>
          </q-input>
          <br/>
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.outputValue" :label="$t('form-output-value')" :disable="form.targetMode === '1'"/>
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.filename" :label="$t('form-file-name')" :disable="form.targetMode === '0'"/>
          <br/>
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.suffix" :label="$('form-suffix-name')" :disable="form.targetMode === '0'"/>
          <br/>
          <q-checkbox text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.compatibleMode" :label="$('form-compatible-mode')"/>
          <br/>
          <q-checkbox text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.append" :label="$t('form-append')"/>
          <br/>
          <q-checkbox text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.makeDir" :label="$t('form-not-create')"/>
          <br/>
          <q-checkbox text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.servlet" :label="$t('form-pass-output-servlet')"/>
          <br/>
          <q-checkbox text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.appendDate" :label="$t('form-include-date-filename')"/>
          <br/>
          <q-checkbox text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.addendTime" :label="$t('form-include-time-filename')"/>
        </q-tab-panel>
        <q-tab-panel name="field">
          <q-table :data="form.parameters" :columns="parameterColumns" :rows-per-page-options="[0]" row-key="name"  separator="cell" hide-bottom :title="$t('table-title-field')">
            <template v-slot:top-right>
              <q-btn-dropdown split outline color="cyan-8" icon="add" text-color="cyan-8" @click="addParameter">
                <q-list>
                  <q-item clickable v-close-popup @click="appendDiffParameter">
                    <q-item-section>
                      <q-item-label>{{ $t('btn-append') }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click="addAllParameter">
                    <q-item-section>
                      <q-item-label>{{ $t('btn-add-all') }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click="clearAndAddParameter">
                    <q-item-section>
                      <q-item-label>{{ $t('btn-remove-add') }}</q-item-label>
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
                    <q-select autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.field" :options="sourceFields" @new-value="createSourceField" use-input/>
                  </q-popup-edit>
                </q-td>
                <q-td key="element" :props="props">
                  {{ props.row.element }}
                  <q-popup-edit v-model="props.row.element" :auto-save="true">
                    <q-input autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.element"/>
                  </q-popup-edit>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-tab-panel>
        <q-tab-panel name="runningConfig">
          <q-input autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model.number="form.parallel" :label="$t('form-number-thread-copies')" type="number" min="1" :disable="forbiddenParallel"/>
        </q-tab-panel>
      </q-tab-panels>
  </q-form>
  </div>
</template>

<script>
const FORBIDDEN_NEXT_STEP_PARALLEL = ['SwitchCaseMeta']
const IGNORE_REPEAT_WARNING_META = ['SortRowsMeta']
export default {
  name: 'JsonOutputMeta',
  data () {
    return {
      tab: 'main',
      form: {
        name: null,
        targetMode: '0',
        jsonName: 'data',
        rowNumber: 0,
        outputValue: 'outputValue',
        compatibleMode: false,
        filename: null,
        append: false,
        makeDir: false,
        suffix: 'js',
        servlet: false,
        appendDate: false,
        addendTime: false,
        parameters: [],
        parallel: 1,
        distribute: true
      },
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
          label: this.$t('column-source-field'),
          field: 'field',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'element',
          label: this.$t('form-element-name'),
          field: 'element',
          align: 'left',
          headerStyle: 'width: 100px;'
        }
      ],
      targetModes: [{ value: '0', label: this.$t('form-output-value') }, { value: '1', label: this.$t('form-output-file') }, { value: '2', label: this.$t('form-output-value-file') }],
      sourceFields: [],
      forbiddenParallel: false
    }
  },
  methods: {
    addParameter () {
      this.form.parameters.push({
        field: null,
        element: null
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
          element: field
        })
      })
    },
    addAllParameter () {
      const vm = this
      vm.sourceFields.forEach(field => {
        vm.form.parameters.push({
          field: field,
          element: field
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
        ext: {
          sourceFields: [this.form.outputValue]
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
        title: vm.$t('dialog-title-error'),
        message: this.$t('warning-duplicate-source-field-name')
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
