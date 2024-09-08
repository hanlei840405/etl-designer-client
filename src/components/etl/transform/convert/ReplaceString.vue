<template>
  <div style="width: 100%;">
    <q-form class="q-gutter-md">
      <q-tabs v-model="tab" align="left" narrow-indicator>
        <q-tab name="basic" :label="$t('form.replaceString.tabBasic')"/>
        <q-tab name="runningConfig" :label="$t('form.replaceString.tabRunningConfig')"/>
      </q-tabs>
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel class="row q-col-gutter-xs" name="basic">
          <q-input class="col-12" outlined v-model="form.name" :label="$t('form.replaceString.name')" :rules="[ val => val && val.length > 0 || 'Please type something']" hint=""/>
          <q-table class="col-12" :data="form.parameters" :columns="parameterColumns" :rows-per-page-options="[0]" row-key="name" separator="cell" hide-bottom :title="$t('form.replaceString.tableField')">
            <template v-slot:top-right>
              <q-btn-dropdown split outline color="primary" icon="add" @click="addParameter">
                <q-list>
                  <q-item clickable v-close-popup @click="appendDiffParameter">
                    <q-item-section>
                      <q-item-label>{{ $t('button.append') }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click="addAllParameter">
                    <q-item-section>
                      <q-item-label>{{ $t('button.addAll') }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click="clearAndAddParameter">
                    <q-item-section>
                      <q-item-label>{{ $t('button.removeAndAdd') }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-btn-dropdown>
            </template>
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="operate" :props="props">
                  <q-btn size="xs" outline round color="negative" icon="remove"  @click="deleteParameter(props)"></q-btn>
                </q-td>
                <q-td key="source" :props="props">
                  {{ props.row.source }}
                  <q-popup-edit v-model="props.row.source" :auto-save="true">
                    <q-select autofocus outlined v-model="props.row.source" :options="sourceFields" @new-value="createSourceField" use-input/>
                  </q-popup-edit>
                </q-td>
                <q-td key="target" :props="props">
                  {{ props.row.target }}
                  <q-popup-edit v-model="props.row.target" :auto-save="true">
                    <q-input autofocus v-model="props.row.target"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="useReg" :props="props">
                  {{ props.row.useReg }}
                  <q-popup-edit v-model="props.row.useReg" :auto-save="true">
                    <q-select autofocus outlined v-model="props.row.useReg" :options="yesOrNo"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="search" :props="props">
                  {{ props.row.search }}
                  <q-popup-edit v-model="props.row.search" :auto-save="true">
                    <q-input autofocus outlined v-model="props.row.search"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="replace" :props="props">
                  {{ props.row.replace }}
                  <q-popup-edit v-model="props.row.replace" :auto-save="true">
                    <q-input autofocus outlined v-model="props.row.replace"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="emptyValue" :props="props">
                  {{ props.row.emptyValue }}
                  <q-popup-edit v-model="props.row.emptyValue" :auto-save="true">
                    <q-select autofocus outlined v-model="props.row.emptyValue" :options="yesOrNo"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="replaceWithField" :props="props">
                  {{ props.row.replaceWithField }}
                  <q-popup-edit v-model="props.row.replaceWithField" :auto-save="true">
                    <q-select autofocus outlined v-model="props.row.replaceWithField" :options="sourceFields"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="match" :props="props">
                  {{ props.row.match }}
                  <q-popup-edit v-model="props.row.match" :auto-save="true">
                    <q-select autofocus outlined v-model="props.row.match" :options="yesOrNo"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="ignore" :props="props">
                  {{ props.row.ignore }}
                  <q-popup-edit v-model="props.row.ignore" :auto-save="true">
                    <q-select autofocus outlined v-model="props.row.ignore" :options="yesOrNo"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="unicode" :props="props">
                  {{ props.row.unicode }}
                  <q-popup-edit v-model="props.row.unicode" :auto-save="true">
                    <q-select autofocus outlined v-model="props.row.unicode" :options="yesOrNo"/>
                  </q-popup-edit>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-tab-panel>
        <q-tab-panel name="runningConfig">
          <q-input outlined v-model.number="form.parallel" :label="$t('form.replaceString.threads')" type="number" min="1" :disable="forbiddenParallel"/>
        </q-tab-panel>
      </q-tab-panels>
  </q-form>
  </div>
</template>

<script>
const FORBIDDEN_NEXT_STEP_PARALLEL = ['SwitchCaseMeta']
const IGNORE_REPEAT_WARNING_META = ['SortRowsMeta', 'UniqueRowsMeta', 'UniqueRowsByHashSetMeta', 'SetValueFieldMeta']
export default {
  name: 'ReplaceStringMeta',
  data () {
    return {
      tab: 'basic',
      form: {
        name: null,
        parameters: [],
        distribute: true,
        parallel: 1
      },
      sourceFields: [],
      parameterColumns: [
        {
          name: 'operate',
          label: this.$t('form.replaceString.columnOperate'),
          field: 'operate',
          align: 'right',
          headerStyle: 'width: 20px'
        },
        {
          name: 'source',
          label: this.$t('form.replaceString.columnSourceField'),
          field: 'source',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'target',
          label: this.$t('form.replaceString.columnTargetField'),
          field: 'target',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'useReg',
          label: this.$t('form.replaceString.columnUseRegular'),
          field: 'useReg',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'search',
          label: this.$t('form.replaceString.columnSearch'),
          field: 'search',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'replace',
          label: this.$t('form.replaceString.columnReplace'),
          field: 'replace',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'emptyValue',
          label: this.$t('form.replaceString.columnEmpty'),
          field: 'emptyValue',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'replaceWithField',
          label: this.$t('form.replaceString.columnReplaceWithField'),
          field: 'replaceWithField',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'match',
          label: this.$t('form.replaceString.columnMatch'),
          field: 'match',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'ignore',
          label: this.$t('form.replaceString.columnCaseSensitive'),
          field: 'ignore',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'unicode',
          label: this.$t('form.replaceString.columnUnicode'),
          field: 'unicode',
          align: 'left',
          headerStyle: 'width: 100px;'
        }
      ],
      yesOrNo: ['Y', 'N'],
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
      this.$emit('propertiesForm', {
        state: true,
        mxCellProperties: this.form,
        ext: {
          sourceFields: this.form.parameters.map(ele => ele.target)
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
