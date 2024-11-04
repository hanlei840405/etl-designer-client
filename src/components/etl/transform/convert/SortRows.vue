<template>
  <div style="width: 100%;">
    <q-form class="q-gutter-md">
      <q-tabs v-model="tab" align="left" narrow-indicator>
        <q-tab name="basic" :label="$t('form.sortRows.tabBasic')"/>
        <q-tab name="field" :label="$t('form.sortRows.tabField')"/>
        <q-tab name="runningConfig" :label="$t('form.sortRows.tabRunningConfig')"/>
      </q-tabs>
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel class="row q-col-gutter-xs" name="basic">
          <q-input class="col-12 col-md-6" outlined v-model="form.name" :label="$t('form.sortRows.name')" :rules="[ val => val && val.length > 0 || 'Please type something']" hint=""/>
          <q-input class="col-12 col-md-6" outlined v-model="form.cacheSize" :label="$t('form.sortRows.cacheSize')" hint=""/>
          <q-input class="col-12 col-md-6" outlined v-model="form.freeMemory" :label="$t('form.sortRows.freeMemory')" hint=""/>
          <q-checkbox class="col-12 col-md-2" v-model="form.compressTempFile" :label="$t('form.sortRows.compressTempFile')" hint=""/>
          <q-checkbox class="col-12 col-md-4" v-model="form.passUniqueRow" :label="$t('form.sortRows.passUniqueRow')"/>
        </q-tab-panel>
        <q-tab-panel name="field">
          <q-table :data="form.parameters" :columns="parameterColumns" :rows-per-page-options="[0]" row-key="name" separator="cell" hide-bottom :title="$t('form.sortRows.tableField')">
            <template v-slot:top-right>
              <q-btn size="sm" outline color="primary" icon="add" @click="addParameter"/>
            </template>
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="operate" :props="props">
                  <q-btn size="xs" outline round color="negative" icon="remove" @click="deleteParameter(props)"></q-btn>
                </q-td>
                <q-td key="field" :props="props">
                  {{ props.row.field }}
                  <q-popup-edit v-model="props.row.field" :auto-save="true">
                    <q-select autofocus outlined v-model="props.row.field" :options="sourceFields" use-input/>
                  </q-popup-edit>
                </q-td>
                <q-td key="asc" :props="props">
                  {{ props.row.asc }}
                  <q-popup-edit v-model="props.row.asc" :auto-save="true">
                    <q-select autofocus outlined v-model="props.row.asc" :options="yesOrNo"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="caseSensitive" :props="props">
                  {{ props.row.caseSensitive }}
                  <q-popup-edit v-model="props.row.caseSensitive" :auto-save="true">
                    <q-select autofocus outlined v-model="props.row.caseSensitive" :options="yesOrNo"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="sortBasedOnLocale" :props="props">
                  {{ props.row.sortBasedOnLocale }}
                  <q-popup-edit v-model="props.row.sortBasedOnLocale" :auto-save="true">
                    <q-select autofocus outlined v-model="props.row.sortBasedOnLocale" :options="yesOrNo"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="collatorStrength" :props="props">
                  {{ props.row.collatorStrength }}
                  <q-popup-edit v-model="props.row.collatorStrength" :auto-save="true">
                    <q-select autofocus outlined v-model="props.row.collatorStrength" :options="collatorStrengthOptions"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="preSorted" :props="props">
                  {{ props.row.preSorted }}
                  <q-popup-edit v-model="props.row.preSorted" :auto-save="true">
                    <q-select autofocus outlined v-model="props.row.preSorted" :options="yesOrNo"/>
                  </q-popup-edit>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-tab-panel>
        <q-tab-panel name="runningConfig">
          <q-input outlined v-model.number="form.parallel" :label="$t('form.sortRows.number-thread-copies')" type="number" min="1"
                   :disable="forbiddenParallel"/>
        </q-tab-panel>
      </q-tab-panels>
  </q-form>
  </div>
</template>

<script>
const FORBIDDEN_NEXT_STEP_PARALLEL = ['SwitchCaseMeta']
const IGNORE_REPEAT_WARNING_META = ['SortRowsMeta', 'UniqueRowsMeta', 'UniqueRowsByHashSetMeta', 'SetValueFieldMeta']
export default {
  name: 'SortRowsMeta',
  data () {
    return {
      tab: 'basic',
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
          label: this.$t('form.sortRows.columnOperate'),
          field: 'operate',
          align: 'right',
          headerStyle: 'width: 20px'
        },
        {
          name: 'field',
          label: this.$t('form.sortRows.columnSourceField'),
          field: 'field',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'asc',
          label: this.$t('form.sortRows.columnSortAsc'),
          field: 'asc',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'caseSensitive',
          label: this.$t('form.sortRows.columnCaseSensitive'),
          field: 'caseSensitive',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'sortBasedOnLocale',
          label: this.$t('form.sortRows.columnSortBasedOnLocale'),
          field: 'sortBasedOnLocale',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'collatorStrength',
          label: this.$t('form.sortRows.columnCollatorStrength'),
          field: 'collatorStrength',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'preSorted',
          label: this.$t('form.sortRows.columnPreSort'),
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
    submitForm () {

      this.$emit('propertiesForm', {
        state: true,
        mxCellProperties: this.form,
        ext: {
          // sourceFields: this.form.parameters.map(ele => ele.field)
          sourceFields: this.sourceFields
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
      if (vm.sourceFields.indexOf(field) > -1) {
        vm.sourceFields.splice(vm.sourceFields.indexOf(field), 1)
      }
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
