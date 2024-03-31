<template>
  <div style="width: 100%;">
    <q-form class="q-gutter-md">
      <q-tabs v-model="tab" align="left" narrow-indicator>
        <q-tab name="basic" :label="$t('form.switchcase.tabBasic')"/>
        <q-tab name="runningConfig" :label="$t('form.switchcase.tabRunningConfig')"/>
      </q-tabs>
      <q-separator/>
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel class="row q-col-gutter-xs" name="basic">
          <q-input class="col-12 col-md-6" outlined v-model="form.name" :label="$t('form.switchcase.name')" :rules="[ val => val && val.length > 0 || 'Please type something']" hint=""/>
          <q-select class="col-12 col-md-6" outlined v-model="form.field" :options="sourceFields" :label="$t('form.switchcase.switchField')" clearable @new-value="createSourceField" use-input hint=""></q-select>
          <q-select class="col-12 col-md-6" outlined v-model="form.category" :options="categories" :label="$t('form.switchcase.caseValueDataType')" hint=""></q-select>
          <q-input class="col-12 col-md-6" outlined v-model="form.mask" :label="$t('form.switchcase.caseValueConversionMask')" hint=""/>
          <q-input class="col-12 col-md-6" outlined v-model="form.decimalSymbol" :label="$t('form.switchcase.caseValueDecimalSymbol')" hint=""/>
          <q-input class="col-12 col-md-6" outlined v-model="form.groupBy" :label="$t('form.switchcase.caseValueGroupSymbol')" hint=""/>
          <div class="col-12 col-md-6">
            <q-select class="col-12" outlined v-model="form.nextStep" :options="nextSteps" :label="$t('form.switchcase.targetStep')" map-options emit-value clearable :rules="[ val => validate(val) || 'field is invalid' ]" hint=""></q-select>
            <q-checkbox class="col-12" v-model="form.useStringIn" :label="$t('form.switchcase.compareStringContain')"/>
          </div>
          <div class="col-12 col-md-6">
            <q-table :data="form.cases" :columns="caseColumns" :rows-per-page-options="[0]" row-key="name" separator="cell" hide-bottom :title="$t('form.switchcase.tableCondition')">
              <template v-slot:top-right>
                <q-btn size="sm" outline color="primary" icon="add" @click="addCase"/>
              </template>
              <template v-slot:body="props">
                <q-tr :props="props">
                  <q-td key="operate" :props="props">
                    <q-btn size="xs" outline round color="negative" icon="remove" @click="deleteCase(props)"></q-btn>
                  </q-td>
                  <q-td key="value" :props="props">
                    {{ props.row.value }}
                    <q-popup-edit v-model="props.row.value" :auto-save="true">
                      <q-input autofocus outlined v-model="props.row.value"/>
                    </q-popup-edit>
                  </q-td>
                  <q-td key="step" :props="props">
                    {{ showLabel(props.row.step) }}
                    <q-popup-edit v-model="props.row.step" :auto-save="true">
                      <q-select autofocus outlined v-model="props.row.step" :options="nextSteps" emit-value map-options/>
                    </q-popup-edit>
                  </q-td>
                </q-tr>
              </template>
            </q-table>
          </div>
        </q-tab-panel>
        <q-tab-panel name="runningConfig">
          <q-input outlined v-model.number="form.parallel" :label="$t('form.switchcase.threads')" type="number" min="1" :disable="forbiddenParallel"/>
        </q-tab-panel>
      </q-tab-panels>
  </q-form>
  </div>
</template>

<script>
const FORBIDDEN_NEXT_STEP_PARALLEL = ['SwitchCaseMeta']
const IGNORE_REPEAT_WARNING_META = ['SortRowsMeta']
export default {
  name: 'SwitchCaseMeta',
  data () {
    return {
      tab: 'basic',
      form: {
        name: null,
        field: null,
        useStringIn: false,
        category: null,
        mask: null,
        decimalSymbol: null,
        groupBy: null,
        nextStep: null,
        cases: [],
        parallel: 1,
        distribute: true
      },
      caseColumns: [
        {
          name: 'operate',
          label: this.$t('form.switchcase.columnOperate'),
          filed: 'operate',
          align: 'right',
          headerStyle: 'width: 20px'
        },
        {
          name: 'value',
          label: this.$t('form.switchcase.columnValue'),
          field: 'value',
          align: 'left',
          headerStyle: 'width: 150px;'
        },
        {
          name: 'step',
          label: this.$t('form.switchcase.columnStep'),
          field: 'step',
          align: 'left',
          headerStyle: 'width: 150px;'
        }
      ],
      sourceFields: [],
      categories: ['BigNumber', 'Binary', 'Boolean', 'Date', 'Integer', 'Internet Address', 'Number', 'String', 'Timestamp'],
      nextSteps: [],
      forbiddenParallel: false
    }
  },
  methods: {
    validate (val) {
      return val != null
    },
    addCase () {
      this.form.cases.push({
        value: null,
        step: null
      })
    },
    deleteCase (props) {
      this.form.cases.splice(props.rowIndex, 1)
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
        mxCellProperties: this.form
      })
    },
    showLabel (val) {
      const steps = this.nextSteps.filter(step => step.value === val)
      if (steps.length > 0) {
        return steps[0].label
      }
      return null
    }
  },
  computed: {
    truncateDisable () {
      return this.form.isPartitioningEnabled
    },
    partitionDisable () {
      return this.form.truncateTable
    },
    partitionItemDisable () {
      return !this.form.isPartitioningEnabled
    },
    ignoreErrorDisable () {
      return this.form.useBatchUpdate
    },
    batchDisable () {
      return this.form.ignoreError
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
    const nextSteps = vm.$store.getters['etl/getNextNodes']
    vm.nextSteps = []
    if (nextSteps && nextSteps.length > 0) {
      nextSteps.forEach(step => {
        vm.nextSteps.push({ value: step.value, label: step.title })
      })
    }
    const mxCellValue = vm.$store.getters['etl/getMxCellForm']
    if (mxCellValue) {
      if (vm.form.name !== mxCellValue.name) {
        vm.form = Object.assign(vm.form, mxCellValue)
      }
    }
  }
}
</script>
