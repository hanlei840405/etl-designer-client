<template>
  <div style="width: 100%;">
    <q-form class="q-gutter-md">
      <q-tabs v-model="tab" class="text-grey" active-color="cyan-8" indicator-color="cyan-8" align="left"
              narrow-indicator>
        <q-tab name="main" :label="$t('tab-main')"/>
        <q-tab name="runningConfig" :label="$t('tab-running-config')"/>
      </q-tabs>
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="main">
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.name" :label="$t('form-name')" lazy-rules
                   :rules="[ val => val && val.length > 0 || 'Please type something']"/>
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.field" :label="$t('column-key-field')"/>
          <q-table :data="form.parameters" :columns="parameterColumns" :rows-per-page-options="[0]" row-key="name"
                   separator="cell" hide-bottom :title="$t('table-title-select-field')">
            <template v-slot:top-right>
              <q-btn-dropdown split outline color="cyan-8" icon="add" text-color="cyan-8" @click="addParameter">
                <q-list>
                  <q-item clickable v-close-popup @click="appendDiffParameter">
                    <q-item-section>
                      <q-item-label>{{ $t('btn-append') }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click="addAllParameter">
                    <q-item-section>
                      <q-item-label>{{ $t('btn-add-all') }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click="clearAndAddParameter">
                    <q-item-section>
                      <q-item-label>{{ $t('btn-remove-add') }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-btn-dropdown>
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
                <q-td key="keyField" :props="props">
                  {{ props.row.keyField }}
                  <q-popup-edit v-model="props.row.keyField" :auto-save=true>
                    <q-input autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.keyField"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="valueField" :props="props">
                  {{ props.row.valueField }}
                  <q-popup-edit v-model="props.row.valueField" :auto-save=true>
                    <q-input autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.valueField"/>
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
export default {
  name: 'NormaliserMeta',
  data () {
    return {
      tab: 'main',
      form: {
        name: null,
        field: null,
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
          name: 'keyField',
          label: "$t('column-type')",
          field: 'keyField',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'valueField',
          label: "$t('column-new-field')",
          field: 'valueField',
          align: 'left',
          headerStyle: 'width: 100px;'
        }
      ],
      forbiddenParallel: false
    }
  },
  methods: {
    addParameter () {
      this.form.parameters.push({
        source: null,
        target: null,
        useReg: null,
        search: null,
        replace: null,
        emptyValue: null,
        match: null,
        ignore: null,
        unicode: null
      })
    },
    appendDiffParameter () {
      const vm = this
      const items = vm.form.parameters.filter(parameter => vm.sourceFields.indexOf(parameter.source) >= 0)
      const array = vm.sourceFields
      items.forEach(item => {
        array.splice(array.findIndex(i => i === item.source), 1)
      })
      array.forEach(field => {
        this.form.parameters.push({
          source: field,
          target: null,
          useReg: null,
          search: null,
          replace: null,
          emptyValue: null,
          match: null,
          ignore: null,
          unicode: null
        })
      })
    },
    addAllParameter () {
      const vm = this
      vm.sourceFields.forEach(field => {
        vm.form.parameters.push({
          source: field,
          target: null,
          useReg: null,
          search: null,
          replace: null,
          emptyValue: null,
          match: null,
          ignore: null,
          unicode: null
        })
      })
    },
    clearAndAddParameter () {
      this.form.parameters = []
      this.addAllParameter()
    },
    deleteParameter (props) {
      this.form.parameters.splice(props.rowIndex, 1)
    },
    createSourceField (val, done) {
      if (val.length > 0) {
        if (!this.sourceFields.includes(val)) {
          this.sourceFields.push(val)
        }
        done(val, 'toggle')
      }
    },
    submitForm () {
      const array = Array.from(new Set(this.form.parameters.map(ele => ele.valueField)))
      array.push(this.form.field)
      const replaceFields = []
      this.form.parameters.forEach(item => {
        replaceFields.push(item.field)
      })
      this.$emit('propertiesForm', {
        state: true,
        mxCellProperties: this.form,
        ext: {
          sourceFields: array,
          replaceFields: replaceFields
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
        if (step.ext !== undefined && step.ext !== 'undefined') {
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
