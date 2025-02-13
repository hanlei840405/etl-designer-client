<template>
  <div style="width: 100%;">
    <q-form class="q-gutter-md">
      <q-tabs v-model="tab" align="left" narrow-indicator>
        <q-tab name="basic" :label="$t('form.jsonOutput.tabBasic')"/>
        <q-tab name="field" :label="$t('form.jsonOutput.tabField')"/>
        <q-tab name="runningConfig" :label="$t('form.jsonOutput.tabRunningConfig')"/>
      </q-tabs>
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel class="row q-col-gutter-xs" name="basic">
          <q-input class="col-12 col-md-6" outlined v-model="form.name" :label="$t('form.jsonOutput.name')" :rules="[ val => val && val.length > 0 || 'Please type something']" hint=""/>
          <q-select class="col-12 col-md-6" outlined v-model="form.targetMode" :options="targetModes" emit-value map-options :label="$t('form.jsonOutput.output')" @clear="form.executeEachInputRow = false" hint=""/>
          <q-input class="col-12 col-md-6" outlined v-model="form.jsonName" :label="$t('form.jsonOutput.jsonBlocName')" hint=""/>
          <q-input class="col-12 col-md-6" min="0" outlined type="number" v-model.number="form.rowNumber" :label="$t('form.jsonOutput.brRowsInBloc')" hint="">
            <template v-slot:append>
              <q-icon name="help_outline" >
                <q-tooltip>
                  1、{{ $t('form.jsonOutput.zeroSaveFile') }}<br/>
                  2、{{ $t('form.jsonOutput.greaterThenZeroSaveFile') }}
                </q-tooltip>
              </q-icon>
            </template>
          </q-input>
          <q-input class="col-12 col-md-6" outlined v-model="form.outputValue" :label="$t('form.jsonOutput.outputValue')" :disable="form.targetMode === '1'" hint=""/>
          <q-input class="col-12 col-md-6" outlined v-model="form.filename" :label="$t('form.jsonOutput.fileName')" :disable="form.targetMode === '0'" hint=""/>
          <q-input class="col-12 col-md-6" outlined v-model="form.suffix" :label="$t('form.jsonOutput.suffixName')" :disable="form.targetMode === '0'" hint=""/>
          <q-checkbox class="col-12 col-md-3" v-model="form.compatibleMode" :label="$t('form.jsonOutput.compatibleMode')" hint=""/>
          <q-checkbox class="col-12 col-md-3" v-model="form.append" :label="$t('form.jsonOutput.append')" hint=""/>
          <q-checkbox class="col-12 col-md-3" v-model="form.makeDir" :label="$t('form.jsonOutput.notCreate')" hint=""/>
          <q-checkbox class="col-12 col-md-3" v-model="form.servlet" :label="$t('form.jsonOutput.passOutputServlet')" hint=""/>
          <q-checkbox class="col-12 col-md-3" v-model="form.appendDate" :label="$t('form.jsonOutput.includeDateFilename')" hint=""/>
          <q-checkbox class="col-12 col-md-3" v-model="form.addendTime" :label="$t('form.jsonOutput.includeTimeFilename')" hint=""/>
        </q-tab-panel>
        <q-tab-panel name="field">
          <q-table :data="form.parameters" :columns="parameterColumns" :rows-per-page-options="[0]" row-key="name"  separator="cell" hide-bottom :title="$t('form.jsonOutput.tableField')">
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
                <q-td key="element" :props="props">
                  {{ props.row.element }}
                  <q-popup-edit v-model="props.row.element" :auto-save="true">
                    <q-input autofocus outlined v-model="props.row.element"/>
                  </q-popup-edit>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-tab-panel>
        <q-tab-panel name="runningConfig">
          <q-input autofocus outlined type="number" v-model.number="form.parallel" :label="$t('form.jsonOutput.threads')" min="1" :disable="forbiddenParallel"/>
        </q-tab-panel>
      </q-tab-panels>
  </q-form>
  </div>
</template>

<script>
const FORBIDDEN_NEXT_STEP_PARALLEL = ['SwitchCaseMeta']
const IGNORE_REPEAT_WARNING_META = ['SortRowsMeta', 'SetValueFieldMeta']
export default {
  name: 'JsonOutputMeta',
  data () {
    return {
      tab: 'basic',
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
        distribute: true,
        shellId: null,
      },
      parameterColumns: [
        {
          name: 'operate',
          label: this.$t('form.jsonOutput.columnOperate'),
          field: 'operate',
          align: 'right',
          headerStyle: 'width: 20px'
        },
        {
          name: 'field',
          label: this.$t('form.jsonOutput.columnSourceField'),
          field: 'field',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'element',
          label: this.$t('form.jsonOutput.columnElement'),
          field: 'element',
          align: 'left',
          headerStyle: 'width: 100px;'
        }
      ],
      targetModes: [{ value: '0', label: this.$t('form.jsonOutput.outputValue') }, { value: '1', label: this.$t('form.jsonOutput.outputFile') }, { value: '2', label: this.$t('form.jsonOutput.outputValueFile') }],
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
    vm.form.shellId = root.id
  }
}
</script>
