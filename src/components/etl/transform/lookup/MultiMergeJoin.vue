<template>
  <div style="width: 100%;">
    <q-form class="q-gutter-md">
      <q-input outlined v-model="form.name" :label="$t('form.multiMergeJoin.name')" lazy-rules :rules="[ val => val && val.length > 0 || 'Please type something']"/>
      <div v-for="(step, i) in previousSteps" :key="step.value">
        <q-select clearable outlined v-model="form.inputStep[step.value]" :options="previousSteps" emit-value map-options :label="$t('form-input-step') + (i + 1)"/>
        <q-select clearable outlined multiple v-model="form.joinKey[step.value]" :options="sourceFields[step.value]" emit-value map-options :label="$t('form-join-key') + (i + 1)"/>
      </div>
      <q-select clearable outlined v-model="form.joinType" :options="joinTypes" :label="$t('form-join-type')"/>
  </q-form>
  </div>
</template>

<script>

const FORBIDDEN_NEXT_STEP_PARALLEL = ['SwitchCaseMeta']
const IGNORE_REPEAT_WARNING_META = ['SortRowsMeta', 'UniqueRowsMeta', 'UniqueRowsByHashSetMeta']
export default {
  name: 'MultiMergeJoinMeta',
  data () {
    return {
      tab: 'main',
      form: {
        name: null,
        inputStep: {},
        inputStepLabel: {},
        joinKey: {},
        joinType: 'INNER'
      },
      forbiddenParallel: false,
      previousSteps: [],
      sourceFields: {},
      joinTypes: ['INNER', 'FULL OUTER']
    }
  },
  methods: {
    submitForm () {
      const vm = this
      vm.previousSteps.forEach(step => {
        if (vm.form.inputStep[step.value]) {
          vm.form.inputStepLabel[step.value] = step.label
        }
      })
      this.$emit('propertiesForm', {
        state: true,
        mxCellProperties: vm.form
      })
    }
  },
  mounted () {
    const vm = this
    const previousSteps = vm.$store.getters['etl/getPreNodes']
    vm.previousSteps = []
    vm.sourceFields = []
    const replaceFields = {}
    if (previousSteps && previousSteps.length > 0) {
      previousSteps.forEach((step, i) => {
        if (i === 0 && FORBIDDEN_NEXT_STEP_PARALLEL.indexOf(step.type) >= 0) {
          vm.forbiddenParallel = true
        }
        if (step.depth === 0) {
          vm.previousSteps.push({ value: step.value, label: step.title })
          vm.sourceFields[step.value] = []
          if (step.ext !== undefined && step.ext !== 'undefined' && IGNORE_REPEAT_WARNING_META.indexOf(step.type) < 0) {
            const ext = JSON.parse(step.ext)
            if (ext.sourceFields) {
              ext.sourceFields.forEach(field => vm.sourceFields[step.value].push(field))
            }
            if (ext.replaceFields) {
              replaceFields[step.value] = []
              ext.replaceFields.forEach(field => {
                replaceFields[step.value].push(field)
              })
            }
          }
          step.linkNodes.forEach(linkNode => {
            if (linkNode.ext !== 'undefined') {
              JSON.parse(linkNode.ext).sourceFields.forEach(field => {
                if (vm.sourceFields[step.value].indexOf(field) < 0) {
                  vm.sourceFields[step.value].push(field)
                }
              })
            }
          })
        }
      })
    }
    for (const k in replaceFields) {
      replaceFields[k].forEach(field => {
        vm.sourceFields[k].splice(vm.sourceFields[k].indexOf(field), 1)
      })
    }
    const mxCellValue = vm.$store.getters['etl/getMxCellForm']
    if (mxCellValue) {
      const inputStep = {}
      vm.previousSteps.forEach(step => {
        if (mxCellValue.inputStep[step.value]) {
          inputStep[step.value] = mxCellValue.inputStep[step.value]
        }
      })
      mxCellValue.inputStep = inputStep
      vm.form = Object.assign(vm.form, mxCellValue)
    }
  }
}
</script>
