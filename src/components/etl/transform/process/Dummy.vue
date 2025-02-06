<template>
  <div style="width: 100%;">
    <q-form class="q-gutter-md">
    <q-tabs v-model="tab" align="left" narrow-indicator>
      <q-tab name="basic" :label="$t('form.dummy.tabBasic')"/>
      <q-tab name="runningConfig" :label="$t('form.dummy.tabRunningConfig')"/>
    </q-tabs>
    <q-tab-panels v-model="tab" animated>
      <q-tab-panel name="basic">
        <q-card-section class="col q-pt-none">
          <q-input outlined v-model="form.name" :label="$t('form.dummy.name')" :rules="[ val => val && val.length > 0 || 'Please type something']" hint=""/>
        </q-card-section>
      </q-tab-panel>
      <q-tab-panel name="runningConfig">
        <q-input outlined type="number" v-model.number="form.parallel" :label="$t('form.dummy.threads')" min="1" :disable="forbiddenParallel"/>
      </q-tab-panel>
    </q-tab-panels>
  </q-form>
  </div>
</template>

<script>

const FORBIDDEN_NEXT_STEP_PARALLEL = ['SwitchCaseMeta']
export default {
  name: 'DummyTransMeta',
  data () {
    return {
      tab: 'basic',
      form: {
        name: null,
        distribute: true,
        parallel: 1
      },
      forbiddenParallel: false
    }
  },
  methods: {
    submitForm (e) {
      this.$emit('propertiesForm', {
        state: true,
        mxCellProperties: this.form
      })
    }
  },
  mounted () {
    const vm = this
    const previousSteps = vm.$store.getters['etl/getPreNodes']
    if (previousSteps && previousSteps.length > 0) {
      previousSteps.forEach((step, i) => {
        if (i === 0 && FORBIDDEN_NEXT_STEP_PARALLEL.indexOf(step.type) >= 0) {
          vm.forbiddenParallel = true
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
