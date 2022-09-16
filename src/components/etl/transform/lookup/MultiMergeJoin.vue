<template>
  <div style="width: 100%;">
    <q-form class="q-gutter-md">
      <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.stepName" :label="$t('form-step-name')" lazy-rules :rules="[ val => val && val.length > 0 || 'Please type something']"/>
      <div v-for="(step, i) in previousSteps" :key="step.value">
        <q-select clearable outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.inputStep[step.value]" :options="previousSteps" emit-value map-options :label="$t('form-input-step') + (i + 1)" @input="setLookupFromStepName"/>
        <q-select clearable outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.joinKey[step.value]" :options="sourceFields[step.value]" emit-value map-options :label="$t('form-join-key') + (i + 1)"/>
      </div>
      <q-select clearable outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.joinType" :options="joinTypes" :label="$t('form-join-type')"/>
  </q-form>
  </div>
</template>

<script>

const FORBIDDEN_NEXT_STEP_PARALLEL = ['SwitchCaseMeta']
export default {
  name: 'MultiMergeJoinMeta',
  data () {
    return {
      tab: 'main',
      form: {
        stepName: null,
        inputStep: {},
        joinKey: {},
        joinType: 'join'
      },
      forbiddenParallel: false,
      previousSteps: [],
      sourceFields: {},
      joinTypes: ['INNER', 'FULL OUTER']
    }
  },
  methods: {
    setLookupFromStepName () {
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
    vm.previousSteps = []
    vm.sourceFields = []
    if (previousSteps && previousSteps.length > 0) {
      previousSteps.forEach((step, i) => {
        vm.previousSteps.push({ value: step.value, label: step.title })
        vm.sourceFields[step.value] = []
        if (i === 0 && FORBIDDEN_NEXT_STEP_PARALLEL.indexOf(step.type) >= 0) {
          vm.forbiddenParallel = true
        }
        if (step.ext !== undefined && step.ext !== 'undefined') {
          const ext = JSON.parse(step.ext)
          if (ext.sourceFields) {
            ext.sourceFields.forEach(field => {
              vm.sourceFields[step.value].push(field)
            })
          }
        }
      })
    }
    const mxCellValue = vm.$store.getters['etl/getMxCellForm']
    if (mxCellValue) {
      vm.form = Object.assign(vm.form, mxCellValue)
    }
  }
}
</script>
