<template>
  <div style="width: 100%;">
    <q-form class="row q-col-gutter-xs">
      <q-input class="col-12 col-md-6" outlined v-model="form.name" :label="$t('form.mergeJoin.name')" :rules="[ val => val && val.length > 0 || 'Please type something']" hint=""/>
      <q-select class="col-12 col-md-6" clearable outlined v-model="form.join_type" :options="joinTypes" :label="$t('form.mergeJoin.join')"/>
      <q-select class="col-12 col-md-6" clearable outlined v-model="form.step1" :options="previousSteps" emit-value map-options :label="$t('form.mergeJoin.step1')" hint="" @input="selectStep1($event)"/>
      <q-select class="col-12 col-md-6" clearable outlined v-model="form.step2" :options="previousSteps" emit-value map-options :label="$t('form.mergeJoin.step2')" hint="" @input="selectStep2($event)"/>
      <q-table class="col-12" :data="form.fieldMappingData" :columns="fieldMappingColumns" :rows-per-page-options="[0]" row-key="name" separator="cell" hide-bottom :title="$t('form.mergeJoin.mergeField')">
        <template v-slot:top-right>
          <q-btn-dropdown split outline color="primary" icon="add" @click="addFieldMapping">
            <q-list>
              <q-item clickable v-close-popup @click="appendDiffFieldMapping">
                <q-item-section>
                  <q-item-label>{{ $t('button.append') }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="addAllFieldMapping">
                <q-item-section>
                  <q-item-label>{{ $t('button.addAll') }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="clearAndAddFieldMapping">
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
              <q-btn size="xs" outline round color="negative" icon="remove" @click="deleteFieldMapping(props)"></q-btn>
            </q-td>
            <q-td key="target" :props="props">
              {{ props.row.target }}
              <q-popup-edit v-model="props.row.target" :auto-save="true" >
                <q-select autofocus outlined v-model="props.row.target" :options="step1Field"/>
              </q-popup-edit>
            </q-td>
            <q-td key="source" :props="props">
              {{ props.row.source }}
              <q-popup-edit v-model="props.row.source" :auto-save="true">
                <q-select autofocus outlined v-model="props.row.source" :options="step2Field"/>
              </q-popup-edit>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </q-form>
  </div>
</template>

<script>


const FORBIDDEN_NEXT_STEP_PARALLEL = ['SwitchCaseMeta']

export default {
  name: 'MergeJoinMeta',
  data() {
    return {
      form: {
        initFlag: true,
        type: "MergeJoin",
        description: [],
        limit: 1,
        parameters: [],
        distribute: true,
        fieldMappingData: [],
        join_type: "INNER",
        step1: "",
        step2: "",
      },
      fieldMappingColumns: [
        {
          name: 'operate',
          label: this.$t('form.mergeJoin.operate'),
          filed: 'operate',
          align: 'left',
          headerStyle: 'width: 20px'
        },
        {
          name: 'target',
          label: this.$t('form.mergeJoin.mergeFieldFirst'),
          field: 'target',
          align: 'left',
          headerStyle: 'width: 150px;'
        },
        {
          name: 'source',
          label: this.$t('form.mergeJoin.mergeFieldSecond'),
          field: 'source',
          align: 'left',
          headerStyle: 'width: 150px;'
        }
      ],
      stepFields: {},
      joinTypes: ['INNER', 'LEFT OUTER', 'RIGHT OUTER', 'FULL OUTER'],
      step1Field: [],
      step2Field: [],
      targetData: {},
      sourceData: {},
      previousSteps: [],
    }
  },
  methods: {
    selectStep1(e) {
      debugger
      this.step1Field = this.stepFields[e]
    },
    selectStep2(e) {
      this.step2Field = this.stepFields[e]
    },
    submitForm () {
      this.$emit('propertiesForm', {
        state: true,
        mxCellProperties: this.form
      })
    },
    deleteFieldMapping(props) {
      this.form.fieldMappingData.splice(props.rowIndex, 1)
    },
    addFieldMapping() {
      this.form.fieldMappingData.push({
        target: null,
        source: null
      })
    },
    appendDiffFieldMapping() {
      const vm = this
      const items = vm.form.fieldMappingData.filter(mapping => vm.stepFields.indexOf(mapping.source) >= 0)
      const array = vm.stepFields
      items.forEach(item => {
        array.splice(array.findIndex(i => i === item.source), 1)
      })
      array.forEach(field => {
        this.form.fieldMappingData.push({
          target: null,
          source: field
        })
      })
    },
    addAllFieldMapping() {
      const vm = this
      vm.stepFields.forEach(field => {
        vm.form.fieldMappingData.push({
          target: null,
          source: field
        })
      })
    },
    clearAndAddFieldMapping() {
      this.form.fieldMappingData = []
      this.addAllFieldMapping()
    },

  },
  mounted() {
    const vm = this
    const previousSteps = vm.$store.getters['etl/getPreNodes']
    vm.previousSteps = []
    vm.stepFields = {}
    const replaceFields = []
    if (previousSteps && previousSteps.length > 0) {
      previousSteps.forEach((step, i) => {
        if (i === 0 && FORBIDDEN_NEXT_STEP_PARALLEL.indexOf(step.type) >= 0) {
          vm.forbiddenParallel = true
        }
        if (step.depth === 0) {
          const ext = JSON.parse(step.ext)
          if (ext.sourceFields && ext.sourceFields.length > 0) {
            vm.previousSteps.push({ value: step.value, label: step.title })
            vm.stepFields[step.value] = []
            ext.sourceFields.forEach(field => {
              vm.stepFields[step.value].push(field)
            })
          }
          if (ext.replaceFields && ext.replaceFields.length > 0) {
            ext.replaceFields.forEach(field => {
              replaceFields.push(field)
            })
          }
        }
      })
    }
    let duplicated = false
    for (const step in vm.stepFields) {
      const temp = [...vm.stepFields[step]]
      replaceFields.forEach(field => {
        if (temp.indexOf(field) > -1) {
          temp.splice(temp.indexOf(field), 1)
        }
      })
      if (new Set(temp).size !== temp.length) {
        duplicated = true
        break
      }
    }
    if (duplicated) {
      vm.$q.dialog({
        dark: true,
        title: vm.$t('message.error.default'),
        message: this.$t('message.error.duplicateSourceField')
      }).onOk(() => {
        this.$emit('propertiesForm', {
          state: true,
          mxCellProperties: this.form,
          ext: {
            stepFields: []
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
