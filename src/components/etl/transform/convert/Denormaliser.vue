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
            <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.name" :label="$t('form-name')" lazy-rules :rules="[ val => val && val.length > 0 || 'Please type something']"/>
            <q-select autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.field" :options="sourceFields" :label="$t('form-key-field')"/>
            <q-table :data="form.groups" :columns="groupColumns" :rows-per-page-options="[0]" row-key="name"
                     separator="cell" hide-bottom :title="$t('table-title-grouping-field')">
              <template v-slot:top-right>
                <q-btn-dropdown split outline color="cyan-8" icon="add" text-color="cyan-8" @click="addGroup">
                  <q-list>
                    <q-item clickable v-close-popup @click="appendDiffGroup">
                      <q-item-section>
                        <q-item-label>{{ $t('btn-append') }}</q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup @click="addAllGroup">
                      <q-item-section>
                        <q-item-label>{{ $t('btn-add-all') }}</q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup @click="clearAndAddGroup">
                      <q-item-section>
                        <q-item-label>{{ $t('btn-clear-add') }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-btn-dropdown>
              </template>
              <template v-slot:body="props">
                <q-tr :props="props">
                  <q-td key="operate" :props="props">
                    <q-btn size="xs" outline round color="negative" icon="remove"
                           @click="deleteGroup(props)"></q-btn>
                  </q-td>
                  <q-td key="field" :props="props">
                    {{ props.row.field }}
                    <q-popup-edit v-model="props.row.field" :auto-save=true>
                      <q-select autofocus text-color="cyan-8" color="cyan-8" label-color="cyan-8" outlined v-model="props.row.field" :options="sourceFields"/>
                    </q-popup-edit>
                  </q-td>
                </q-tr>
              </template>
            </q-table>
          </q-tab-panel>
          <q-tab-panel name="field">
            <q-table :data="form.parameters" :columns="parameterColumns" :rows-per-page-options="[0]" row-key="name"
                     separator="cell" hide-bottom :title="$t('table-title-target-field')">
              <template v-slot:top-right>
                <q-btn-dropdown split outline color="cyan-8" icon="add" text-color="cyan-8" @click="addTarget">
                  <q-list>
                    <q-item clickable v-close-popup @click="appendDiffTarget">
                      <q-item-section>
                        <q-item-label>{{ $t('btn-append') }}</q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup @click="addAllTarget">
                      <q-item-section>
                        <q-item-label>{{ $t('btn-add-all') }}</q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup @click="clearAndAddTarget">
                      <q-item-section>
                        <q-item-label>{{ $t('btn-clear-add') }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-btn-dropdown>
              </template>
              <template v-slot:body="props">
                <q-tr :props="props">
                  <q-td key="operate" :props="props">
                    <q-btn size="xs" outline round color="negative" icon="remove"
                           @click="deleteTarget(props)"></q-btn>
                  </q-td>
                  <q-td key="target" :props="props">
                    {{ props.row.target }}
                    <q-popup-edit v-model="props.row.target" :auto-save=true>
                      <q-input autofocus text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.target"/>
                    </q-popup-edit>
                  </q-td>
                  <q-td key="source" :props="props">
                    {{ props.row.source }}
                    <q-popup-edit v-model="props.row.source" :auto-save=true>
                      <q-select autofocus text-color="cyan-8" color="cyan-8" label-color="cyan-8" outlined v-model="props.row.source" :options="sourceFields" v-if="sourceFields.length > 0"/>
                      <q-input autofocus text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.source" v-if="sourceFields.length === 0"/>
                    </q-popup-edit>
                  </q-td>
                  <q-td key="keyValue" :props="props">
                    {{ props.row.keyValue }}
                    <q-popup-edit v-model="props.row.keyValue" :auto-save=true>
                      <q-input autofocus text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.keyValue"/>
                    </q-popup-edit>
                  </q-td>
                  <q-td key="category" :props="props">
                    {{ props.row.category }}
                    <q-popup-edit v-model="props.row.category" :auto-save=true>
                      <q-select autofocus text-color="cyan-8" color="cyan-8" label-color="cyan-8" outlined v-model="props.row.category" :options="categories"/>
                    </q-popup-edit>
                  </q-td>
                  <q-td key="formatValue" :props="props">
                    {{ props.row.formatValue }}
                    <q-popup-edit v-model="props.row.formatValue" :auto-save=true>
                      <q-input autofocus text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.formatValue"/>
                    </q-popup-edit>
                  </q-td>
                  <q-td key="lengthValue" :props="props">
                    {{ props.row.lengthValue }}
                    <q-popup-edit v-model.number="props.row.lengthValue" :auto-save=true>
                      <q-input autofocus text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model.number="props.row.lengthValue"/>
                    </q-popup-edit>
                  </q-td>
                  <q-td key="accuracy" :props="props">
                    {{ props.row.accuracy }}
                    <q-popup-edit v-model.number="props.row.accuracy" :auto-save=true>
                      <q-input autofocus text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model.number="props.row.accuracy"/>
                    </q-popup-edit>
                  </q-td>
                  <q-td key="currency" :props="props">
                    {{ props.row.currency }}
                    <q-popup-edit v-model="props.row.currency" :auto-save=true>
                      <q-input autofocus text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.currency"/>
                    </q-popup-edit>
                  </q-td>
                  <q-td key="groupBy" :props="props">
                    {{ props.row.groupBy }}
                    <q-popup-edit v-model="props.row.groupBy" :auto-save=true>
                      <q-input autofocus text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.groupBy"/>
                    </q-popup-edit>
                  </q-td>
                  <q-td key="nullIf" :props="props">
                    {{ props.row.nullIf }}
                    <q-popup-edit v-model="props.row.nullIf" :auto-save=true>
                      <q-input autofocus text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.nullIf"/>
                    </q-popup-edit>
                  </q-td>
                  <q-td key="agg" :props="props">
                    {{ props.row.agg }}
                    <q-popup-edit v-model="props.row.agg" :auto-save=true>
                      <q-select autofocus text-color="cyan-8" color="cyan-8" label-color="cyan-8" outlined v-model="props.row.agg" :options="aggs"/>
                    </q-popup-edit>
                  </q-td>
                </q-tr>
              </template>
            </q-table>
          </q-tab-panel>
          <q-tab-panel name="runningConfig">
            <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model.number="form.parallel" :label="$t('form-number-thread-copies')" type="number" min="1" :disable="forbiddenParallel"/>
          </q-tab-panel>
        </q-tab-panels>
    </q-form>
  </div>
</template>

<script>

const FORBIDDEN_NEXT_STEP_PARALLEL = ['SwitchCaseMeta']
export default {
  name: 'DenormaliserMeta',
  data () {
    return {
      tab: 'main',
      form: {
        name: null,
        field: null,
        distribute: true,
        groups: [],
        parameters: [],
        parallel: 1
      },
      categories: ['BigNumber', 'Binary', 'Boolean', 'Date', 'Integer', 'Internet Address', 'Number', 'String', 'Timestamp'],
      groupColumns: [
        {
          name: 'operate',
          label: this.$t('column-operate'),
          filed: 'operate',
          align: 'right',
          headerStyle: 'width: 20px'
        },
        {
          name: 'field',
          label: this.$t('column-group-field'),
          field: 'field',
          align: 'left',
          headerStyle: 'width: 100px;'
        }
      ],
      parameterColumns: [
        {
          name: 'operate',
          label: this.$t('column-operate'),
          filed: 'operate',
          align: 'right',
          headerStyle: 'width: 20px'
        },
        {
          name: 'target',
          label: this.$t('column-target-field'),
          field: 'target',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'source',
          label: this.$t('column-source-field'),
          field: 'source',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'keyValue',
          label: this.$t('column-key-field'),
          field: 'keyValue',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'category',
          label: this.$t('column-type'),
          field: 'category',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'formatValue',
          label: this.$t('column-format'),
          field: 'formatValue',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'lengthValue',
          label: this.$t('column-length'),
          field: 'lengthValue',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'accuracy',
          label: this.$t('column-accuracy'),
          field: 'accuracy',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'currency',
          label: this.$t('column-currency'),
          field: 'currency',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'groupBy',
          label: this.$t('column-group'),
          field: 'groupBy',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'nullIf',
          label: 'nullIf',
          field: 'nullIf',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'agg',
          label: this.$t('column-agg'),
          field: 'agg',
          align: 'left',
          headerStyle: 'width: 100px;'
        }
      ],
      sourceFields: [],
      aggs: ['-', 'SUM', 'AVERAGE', 'MIN', 'MAX', 'COUNT_ALL', 'CONCAT_COMMA'],
      forbiddenParallel: false
    }
  },
  methods: {
    validate (val) {
      return val != null
    },
    addGroup () {
      this.form.groups.push({
        field: null
      })
    },
    appendDiffGroup () {
      const vm = this
      const items = vm.form.group.filter(parameter => vm.sourceFields.indexOf(parameter.field) >= 0)
      const array = vm.sourceFields
      items.forEach(item => {
        array.splice(array.findIndex(i => i === item.field), 1)
      })
      array.forEach(field => {
        this.form.group.push({
          field: field
        })
      })
    },
    addAllGroup () {
      const vm = this
      vm.sourceFields.forEach(field => {
        vm.form.group.push({
          field: field
        })
      })
    },
    clearAndAddGroup () {
      this.form.group = []
      this.addAllGroup()
    },
    deleteGroup (props) {
      this.form.groups.splice(props.rowIndex, 1)
    },
    addTarget () {
      this.form.parameters.push({
        target: null,
        source: null,
        keyValue: null,
        category: 'String',
        formatValue: null,
        lengthValue: -1,
        accuracy: -1,
        currency: null,
        groupBy: null,
        nullIf: null,
        agg: null
      })
    },
    appendDiffTarget () {
      const vm = this
      const items = vm.form.parameters.filter(parameter => vm.sourceFields.indexOf(parameter.field) >= 0)
      const array = vm.sourceFields
      items.forEach(item => {
        array.splice(array.findIndex(i => i === item.field), 1)
      })
      array.forEach(field => {
        this.form.parameters.push({
          field: field,
          category: null,
          format: null,
          style: null,
          title: field,
          headerStyle: null,
          formula: null,
          link: null
        })
      })
    },
    addAllTarget () {
      const vm = this
      vm.sourceFields.forEach(field => {
        vm.form.parameters.push({
          field: field,
          category: null,
          format: null,
          style: null,
          title: field,
          headerStyle: null,
          formula: null,
          link: null
        })
      })
    },
    clearAndAddTarget () {
      this.form.parameters = []
      this.addAllTarget()
    },
    deleteTarget (props) {
      this.form.parameters.splice(props.rowIndex, 1)
    },
    submitForm () {
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
