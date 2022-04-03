<template>
  <div style="width: 100%;">
    <q-form class="q-gutter-md">
    <q-tabs v-model="tab" class="text-grey" active-color="cyan-8" indicator-color="cyan-8" align="left"
            narrow-indicator>
      <q-tab name="main" label="主选项"/>
      <q-tab name="parameter" label="运行参数"/>
    </q-tabs>
    <q-tab-panels v-model="tab" animated>
      <q-tab-panel name="main">
        <q-card-section class="col q-pt-none">
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.name" label="步骤名称" lazy-rules
                   :rules="[ val => val && val.length > 0 || 'Please type something']"/>
        </q-card-section>
      </q-tab-panel>
      <q-tab-panel name="parameter">
        <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model.number="form.parallel" label="执行线程数" type="number" min="1" :disable="forbiddenParallel"/>
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
      tab: 'main',
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
