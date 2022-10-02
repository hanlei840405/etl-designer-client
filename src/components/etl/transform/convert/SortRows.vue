<template>
  <div style="width: 100%;">
    <q-form class="q-gutter-md">
      <q-tabs v-model="tab" class="text-grey" active-color="cyan-8" indicator-color="cyan-8" align="left"
              narrow-indicator>
        <q-tab name="main" :label="$t('tab-main')"/>
        <q-tab name="field" :label="$t('tab-field')"/>
        <q-tab name="runningConfig" :label="$t('tab-running-config')"/>
      </q-tabs>
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="main">
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.name" :label="$t('form-name')" lazy-rules
                   :rules="[ val => val && val.length > 0 || 'Please type something']"/>
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.cacheSize" :label="$t('form-cache-size')"/>
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.freeMemory" :label="$t('form-free-memory')"/>
          <q-checkbox text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.compressTempFile" :label="$t('form-compress-temp-file')"/>
          <br/>
          <q-checkbox text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.passUniqueRow" :label="$t('form-pass-unique-row')"/>
        </q-tab-panel>
        <q-tab-panel name="field">
          <q-table :data="form.parameters" :columns="parameterColumns" :rows-per-page-options="[0]" row-key="name"
                   separator="cell" hide-bottom :title="$t('table-title-new-field')">
            <template v-slot:top-right>
              <q-btn size="sm" outline text-color="cyan-8" icon="add" @click="addParameter"/>
            </template>
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="operate" :props="props">
                  <q-btn size="xs" outline round color="negative" icon="remove"
                         @click="deleteParameter(props)"></q-btn>
                </q-td>
                <q-td key="field" :props="props">
                  {{ props.row.field }}
                  <q-popup-edit v-model="props.row.field" :auto-save=true>
                    <q-select autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.field" :options="sourceFields" @new-value="createSourceField" use-input/>
                  </q-popup-edit>
                </q-td>
                <q-td key="asc" :props="props">
                  {{ props.row.asc }}
                  <q-popup-edit v-model="props.row.asc" :auto-save=true>
                    <q-select autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.asc" :options="yesOrNo"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="caseSensitive" :props="props">
                  {{ props.row.caseSensitive }}
                  <q-popup-edit v-model="props.row.caseSensitive" :auto-save=true>
                    <q-select autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.caseSensitive" :options="yesOrNo"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="sortBasedOnLocale" :props="props">
                  {{ props.row.sortBasedOnLocale }}
                  <q-popup-edit v-model="props.row.sortBasedOnLocale" :auto-save=true>
                    <q-select autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.sortBasedOnLocale" :options="yesOrNo"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="collatorStrength" :props="props">
                  {{ props.row.collatorStrength }}
                  <q-popup-edit v-model="props.row.collatorStrength" :auto-save=true>
                    <q-select autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.collatorStrength" :options="collatorStrengthOptions"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="preSorted" :props="props">
                  {{ props.row.preSorted }}
                  <q-popup-edit v-model="props.row.preSorted" :auto-save=true>
                    <q-select autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.preSorted" :options="yesOrNo"/>
                  </q-popup-edit>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-tab-panel>
        <q-tab-panel name="runningConfig">
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model.number="form.parallel" :label="$t('form-number-thread-copies')" type="number" min="1"
                   :disable="forbiddenParallel"/>
        </q-tab-panel>
      </q-tab-panels>
  </q-form>
  </div>
</template>

<script>
const FORBIDDEN_NEXT_STEP_PARALLEL = ['SwitchCaseMeta']
const IGNORE_REPEAT_WARNING_META = ['SortRowsMeta']
export default {
  name: 'SortRowsMeta',
  data () {
    return {
      tab: 'main',
      form: {
        name: null,
        cacheSize: '1000000',
        freeMemory: '50',
        compressTempFile: false,
        passUniqueRow: false,
        parameters: [],
        distribute: true,
        parallel: 1
      },
      sourceFields: [],
      parameterColumns: [
        {
          name: 'operate',
          label: this.$t('column-operate'),
          field: 'operate',
          align: 'right',
          headerStyle: 'width: 20px'
        },
        {
          name: 'field',
          label: "$t('column-source-field')",
          field: 'field',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'asc',
          label: this.$t('column-sort-asc'),
          field: 'asc',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'caseSensitive',
          label: this.$t('column-case-sensitive'),
          field: 'caseSensitive',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'sortBasedOnLocale',
          label: this.$t('column-sort-based-on-locale'),
          field: 'sortBasedOnLocale',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'collatorStrength',
          label: this.$t('column-collator-strength'),
          field: 'collatorStrength',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'preSorted',
          label: this.$t('column-pre-sort'),
          field: 'preSorted',
          align: 'left',
          headerStyle: 'width: 100px;'
        }
      ],
      yesOrNo: ['Y', 'N'],
      collatorStrengthOptions: [0, 1, 2, 3],
      forbiddenParallel: false
    }
  },
  methods: {
    addParameter () {
      this.form.parameters.push({
        field: null,
        asc: null,
        caseSensitive: null,
        sortBasedOnLocale: null,
        collatorStrength: null,
        preSorted: null
      })
    },
    deleteParameter (props) {
      this.form.parameters.splice(props.rowIndex, 1)
    },
    submitForm (e) {
      this.$emit('propertiesForm', {
        state: true,
        mxCellProperties: this.form,
        ext: {
          sourceFields: this.form.parameters.map(ele => ele.field)
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
        title: vm.$t('dialog-title-error'),
        message: this.$t('warning-duplicate-source-field-name')
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
