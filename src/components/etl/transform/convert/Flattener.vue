<template>
  <div style="width: 100%;">
    <q-form class="q-gutter-md">
      <q-tabs v-model="tab" align="left" narrow-indicator>
        <q-tab name="basic" :label="$t('form.flattener.tabBasic')"/>
        <q-tab name="runningConfig" :label="$t('form.flattener.tabRunningConfig')"/>
      </q-tabs>
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel class="row q-col-gutter-xs" name="basic">
          <q-input class="col-12 col-md-6" outlined v-model="form.name" :label="$t('form.flattener.name')" :rules="[ val => val && val.length > 0 || 'Please type something']" hint=""/>
          <q-select class="col-12 col-md-6" outlined v-model="form.field" :options="sourceFields" :label="$t('form.flattener.fieldFlattened')" hint=""></q-select>
          <q-table class="col-12" :data="form.parameters" :columns="parameterColumns" :rows-per-page-options="[0]" row-key="name" separator="cell" hide-bottom :title="$t('form.flattener.tableField')">
            <template v-slot:top-right>
              <q-btn size="sm" outline text-color="primary" icon="add" @click="addParameter"/>
            </template>
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="operate" :props="props">
                  <q-btn size="xs" outline round color="negative" icon="remove"  @click="deleteParameter(props)"></q-btn>
                </q-td>
                <q-td key="target" :props="props">
                  {{ props.row.target }}
                  <q-popup-edit v-model="props.row.target" :auto-save="true">
                    <q-input autofocus v-model="props.row.target"/>
                  </q-popup-edit>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-tab-panel>
        <q-tab-panel name="runningConfig">
          <q-input outlined v-model.number="form.parallel" :label="$t('form.flattener.threads')" type="number" min="1"
                   :disable="forbiddenParallel"/>
        </q-tab-panel>
      </q-tab-panels>
  </q-form>
  </div>
</template>

<script>
const FORBIDDEN_NEXT_STEP_PARALLEL = ['SwitchCaseMeta']
const IGNORE_REPEAT_WARNING_META = ['SortRowsMeta', 'UniqueRowsMeta', 'UniqueRowsByHashSetMeta']
export default {
  name: 'FlattenerMeta',
  data () {
    return {
      tab: 'basic',
      form: {
        name: null,
        parameters: [],
        distribute: true,
        parallel: 1
      },
      parameterColumns: [
        {
          name: 'operate',
          label: this.$t('form.flattener.columnOperate'),
          field: 'operate',
          align: 'right',
          headerStyle: 'width: 20px'
        },
        {
          name: 'target',
          label: this.$t('form.flattener.columnTargetField'),
          field: 'target',
          align: 'left',
          headerStyle: 'width: 100px;'
        }
      ],
      sourceFields: [],
      forbiddenParallel: false
    }
  },
  methods: {
    addParameter () {
      this.form.parameters.push({
        target: null
      })
    },
    deleteParameter (props) {
      this.form.parameters.splice(props.rowIndex, 1)
    },
    submitForm (e) {
      this.$emit('propertiesForm', {
        state: true,
        mxCellProperties: this.form,
        ext: { sourceFields: this.form.parameters.map(ele => ele.target) }
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
