<template>
  <div style="width: 100%;">
    <q-form class="q-gutter-md">
      <q-tabs v-model="tab" align="left" narrow-indicator>
        <q-tab name="basic" :label="$t('form.writeToLog.tabBasic')"/>
        <q-tab name="runningConfig" :label="$t('form.writeToLog.tabRunningConfig')"/>
      </q-tabs>
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel class="row q-col-gutter-xs" name="basic">
          <q-input class="col-12 col-md-4" outlined v-model="form.name" :label="$t('form.writeToLog.name')" :rules="[ val => val && val.length > 0 || 'Please type something']" hint=""/>
          <q-select class="col-12 col-md-4" outlined v-model="form.level" emit-value map-options :options="levels" :label="$t('form.writeToLog.logLevel')" hint=""></q-select>
          <q-input class="col-12 col-md-4" type="number" min="0" outlined v-model.number="form.limitRows" :label="$t('form.writeToLog.nrOfRowToPrint')" hint=""/>
          <q-input class="col-12" outlined v-model="form.logs" type="textarea" rows="12" :label="$t('form.writeToLog.writeLog')" hint=""/>
          <div class="col-8">
            <q-table :data="form.parameters" :columns="parameterColumns" :rows-per-page-options="[0]" row-key="name" separator="cell" hide-bottom :title="$t('form.writeToLog.tableField')">
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
                </q-tr>
              </template>
            </q-table>
          </div>
          <div class="col-4 row q-col-gutter-xs">
            <q-checkbox class="col-12" v-model="form.printHeader" :label="$t('form.writeToLog.printHeader')" hint=""/>
            <q-checkbox class="col-12" v-model="form.useLimitRows" :label="$t('form.writeToLog.limitRows')" hint=""/>
          </div>
        </q-tab-panel>
        <q-tab-panel name="runningConfig">
          <q-input outlined v-model.number="form.parallel" :label="$t('form.writeToLog.threads')" type="number" min="1" :disable="forbiddenParallel"/>
        </q-tab-panel>
      </q-tab-panels>
  </q-form>
  </div>
</template>

<script>

const FORBIDDEN_NEXT_STEP_PARALLEL = ['SwitchCaseMeta']
const IGNORE_REPEAT_WARNING_META = ['SortRowsMeta', 'UniqueRowsMeta', 'UniqueRowsByHashSetMeta', 'SetValueFieldMeta']
export default {
  name: 'WriteToLogMeta',
  data () {
    return {
      tab: 'basic',
      form: {
        name: null,
        printHeader: false,
        useLimitRows: false,
        limitRows: 0,
        level: 3,
        logs: null,
        parameters: [],
        parallel: 1
      },
      levels: [{
        value: 0,
        label: this.$t('form.writeToLog.logLevelNoting')
      }, {
        value: 1,
        label: this.$t('form.writeToLog.logLevelError')
      }, {
        value: 2,
        label: this.$t('form.writeToLog.logLevelMinimal')
      }, {
        value: 3,
        label: this.$t('form.writeToLog.logLevelBasic')
      }, {
        value: 4,
        label: this.$t('form.writeToLog.logLevelDetail')
      }, {
        value: 5,
        label: this.$t('form.writeToLog.logLevelDebug')
      }, {
        value: 6,
        label: this.$t('form.writeToLog.logLevelRow')
      }],
      sourceFields: [],
      parameterColumns: [
        {
          name: 'operate',
          label: this.$t('form.writeToLog.columnOperate'),
          filed: 'operate',
          align: 'right',
          headerStyle: 'width: 20px'
        },
        {
          name: 'field',
          label: this.$t('form.writeToLog.columnField'),
          field: 'field',
          align: 'left',
          headerStyle: 'width: 100px;'
        }
      ],
      forbiddenParallel: false
    }
  },
  methods: {
    validate (val) {
      return val != null
    },
    addParameter () {
      this.form.parameters.push({
        field: null
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
          field: field
        })
      })
    },
    addAllParameter () {
      const vm = this
      vm.sourceFields.forEach(field => {
        vm.form.parameters.push({
          field: field
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
    loadHelps () {
      const vm = this
      vm.helpDialog.mode = true
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
        mxCellProperties: this.form
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
    // if (new Set(vm.sourceFields).size !== vm.sourceFields.length) {
    //   vm.$q.dialog({
    //     dark: true,
    //     title: vm.$t('message.error.default'),
    //     message: this.$t('message.error.duplicateSourceField')
    //   }).onOk(() => {
    //     this.$emit('propertiesForm', {
    //       state: true,
    //       mxCellProperties: this.form,
    //       ext: {
    //         sourceFields: []
    //       }
    //     })
    //   })
    // }
    const mxCellValue = vm.$store.getters['etl/getMxCellForm']
    if (mxCellValue) {
      vm.form = Object.assign(vm.form, mxCellValue)
    }
  }
}
</script>
