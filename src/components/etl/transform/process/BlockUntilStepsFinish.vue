<template>
  <div style="width: 100%;">
    <q-form class="q-gutter-md">
      <q-tabs v-model="tab" align="left" narrow-indicator>
        <q-tab name="basic" :label="$t('form.blockUntilStepsFinish.tabBasic')"/>
        <q-tab name="runningConfig" :label="$t('form.blockUntilStepsFinish.tabRunningConfig')"/>
      </q-tabs>
      <q-separator/>
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel class="row q-col-gutter-xs" name="basic">
          <q-input class="col-12" outlined v-model="form.name" :label="$t('form.blockUntilStepsFinish.name')" :rules="[ val => val && val.length > 0 || 'Please type something']" hint=""/>
          <q-table class="col-12" :data="form.steps" :columns="stepColumns" :rows-per-page-options="[0]" row-key="name" separator="cell" hide-bottom :title="$t('form.blockUntilStepsFinish.monitor')">
              <template v-slot:top-right>
                <q-btn size="sm" outline color="primary" icon="add" @click="addStep"/>
              </template>
              <template v-slot:body="props">
                <q-tr :props="props">
                  <q-td key="operate" :props="props">
                    <q-btn size="xs" outline round color="negative" icon="remove" @click="deleteStep(props)"></q-btn>
                  </q-td>
                  <q-td key="step" :props="props">
                    {{ showLabel(props.row.step) }}
                    <q-popup-edit v-model="props.row.step" :auto-save="true">
                      <q-select autofocus outlined v-model="props.row.step" :options="previousSteps" emit-value map-options/>
                    </q-popup-edit>
                  </q-td>
                  <q-td key="copyNr" :props="props">
                    {{ props.row.copyNr }}
                    <q-popup-edit v-model="props.row.copyNr" :auto-save="true">
                      <q-input autofocus outlined v-model="props.row.copyNr"/>
                    </q-popup-edit>
                  </q-td>
                </q-tr>
              </template>
            </q-table>
        </q-tab-panel>
        <q-tab-panel name="runningConfig">
          <q-input outlined type="number" v-model.number="form.parallel" :label="$t('form.blockUntilStepsFinish.threads')" min="1" :disable="forbiddenParallel"/>
        </q-tab-panel>
      </q-tab-panels>
  </q-form>
  </div>
</template>

<script>
const FORBIDDEN_NEXT_STEP_PARALLEL = ['SwitchCaseMeta']
const IGNORE_REPEAT_WARNING_META = ['SortRowsMeta', 'SetValueFieldMeta']
export default {
  name: 'BlockUntilStepsFinishMeta',
  data () {
    return {
      tab: 'basic',
      form: {
        name: null,
        steps: [],
        parallel: 1,
        distribute: true
      },
      stepColumns: [
        {
          name: 'operate',
          label: this.$t('form.blockUntilStepsFinish.columnOperate'),
          filed: 'operate',
          align: 'right',
          headerStyle: 'width: 20px'
        },
        {
          name: 'step',
          label: this.$t('form.blockUntilStepsFinish.stepName'),
          field: 'step',
          align: 'left',
          headerStyle: 'width: 150px;'
        },
        {
          name: 'copyNr',
          label: this.$t('form.blockUntilStepsFinish.copyNr'),
          field: 'copyNr',
          align: 'left',
          headerStyle: 'width: 150px;'
        }
      ],
      previousSteps: [],
      forbiddenParallel: false
    }
  },
  methods: {
    addStep () {
      this.form.steps.push({
        step: null,
        copyNr: 0
      })
    },
    deleteStep (props) {
      this.form.steps.splice(props.rowIndex, 1)
    },
    submitForm (e) {
      this.$emit('propertiesForm', {
        state: true,
        mxCellProperties: this.form
      })
    },
    showLabel (val) {
      const steps = this.previousSteps.filter(step => step.value === val)
      if (steps.length > 0) {
        return steps[0].label
      }
      return null
    }
  },
  mounted () {
    const vm = this
    const previousSteps = vm.$store.getters['etl/getPreNodes']
    vm.previousSteps = []
    if (previousSteps && previousSteps.length > 0) {
      previousSteps.forEach(step => {
        vm.previousSteps.push({ value: step.value, label: step.title })
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
