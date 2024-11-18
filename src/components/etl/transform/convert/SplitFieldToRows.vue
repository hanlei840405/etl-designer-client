<template>
  <div style="width: 100%;">
    <q-form class="q-gutter-md">
      <q-tabs v-model="tab" align="left" narrow-indicator>
        <q-tab name="basic" :label="$t('form.splitFieldToRows.tabBasic')"/>
        <q-tab name="runningConfig" :label="$t('form.splitFieldToRows.tabRunningConfig')"/>
      </q-tabs>
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel class="row q-col-gutter-xs" name="basic">
          <q-input class="col-12 col-md-6" outlined v-model="form.name" :label="$t('form.splitFieldToRows.name')" :rules="[ val => val && val.length > 0 || 'Please type something']" hint=""/>
          <q-select class="col-12 col-md-6" outlined v-model="form.field" :options="sourceFields" :label="$t('form.splitFieldToRows.fieldSplit')" hint=""></q-select>
          <q-input class="col-12 col-md-6" outlined v-model="form.delimiter" :label="$t('form.splitFieldToRows.delimiter')" hint=""/>
          <q-checkbox class="col-12 col-md-6" v-model="form.splitByReg" :label="$t('form.splitFieldToRows.delimiterIsRegular')"/>
          <q-input class="col-12 col-md-6" outlined v-model="form.target" :label="$t('form.splitFieldToRows.newFieldName')" hint=""/>
          <q-checkbox class="col-12 col-md-6" v-model="form.useLineNo" :label="$t('form.splitFieldToRows.includeRownum')"/>
          <q-input class="col-12 col-md-6" outlined v-model="form.lineName" :label="$t('form.splitFieldToRows.rownumField')" hint=""/>
          <q-checkbox class="col-12 col-md-6" v-model="form.resetLineNo" :label="$t('form.splitFieldToRows.resetRownum')"/>
        </q-tab-panel>
        <q-tab-panel name="runningConfig">
          <q-input outlined v-model.number="form.parallel" :label="$t('form.splitFieldToRows.threads')" type="number" min="1" :disable="forbiddenParallel"/>
        </q-tab-panel>
      </q-tab-panels>
  </q-form>
  </div>
</template>

<script>

const FORBIDDEN_NEXT_STEP_PARALLEL = ['SwitchCaseMeta']
const IGNORE_REPEAT_WARNING_META = ['SortRowsMeta', 'SetValueFieldMeta']
export default {
  name: 'SplitFieldToRowsMeta',
  data () {
    return {
      tab: 'basic',
      form: {
        name: null,
        field: null,
        target: null,
        delimiter: null,
        splitByReg: false,
        useLineNo: false,
        resetLineNo: true,
        lineName: null,
        parallel: 1
      },
      sourceFields: [],
      forbiddenParallel: false
    }
  },
  methods: {
    submitForm () {
      this.$emit('propertiesForm', {
        state: true,
        mxCellProperties: this.form,
        ext: { sourceFields: [this.form.target] }
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
