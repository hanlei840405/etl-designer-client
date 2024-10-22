<template>
  <div style="width: 100%;">
    <q-form class="q-gutter-md">
      <q-input outlined v-model="form.name" :label="$t('form.mergeJoin.name')"
               :rules="[ val => val && val.length > 0 || '请填写名称']" hint=""/>

      <q-select outlined v-model="form.step1" clearable filled use-input @input="filterStepFirst"
                :options="sourceFields" :label="$t('form.mergeJoin.stepFirst')"/>
      <q-select outlined v-model="form.step2" clearable filled use-input @input="filterStepSecond"
                :options="sourceFields" :label="$t('form.mergeJoin.stepSecond')"/>
      <q-select outlined v-model="form.join_type" clearable filled use-input
                :options="joinTypes" label="字符集编码"/>
      <q-table :data="form.fieldMappingData" :columns="fieldMappingColumns" :rows-per-page-options="[0]" row-key="name"
               separator="cell" hide-bottom :title="$t('form.mergeJoin.mergeField')">
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
                <q-select autofocus outlined v-model="props.row.target" :options="leftFields"
                          use-input/>
              </q-popup-edit>
            </q-td>
            <q-td key="source" :props="props">
              {{ props.row.source }}
              <q-popup-edit v-model="props.row.source" :auto-save="true">
                <q-select autofocus outlined v-model="props.row.source" :options="rightFields"
                          use-input/>
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
const IGNORE_REPEAT_WARNING_META = [ 'UniqueRowsMeta', 'UniqueRowsByHashSetMeta', 'SetValueFieldMeta']

export default {
  name: 'MergeJoinMeta',
  data() {
    return {
      form: {
        initFlag: true,
        name: "记录集连接",
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
      leftFields: [],
      rightFields: [],
      joinTypes: ['INNER', 'LEFT OUTER', 'RIGHT OUTER', 'FULL OUTER'],
      copyMergeType: [],
      sourceFields: [],
      targetData: {},
      sourceData: {},
      stepList: [],
    }
  },
  methods: {
    submitForm (e) {
      this.$emit('propertiesForm', {
        state: true,
        mxCellProperties: this.form
      })
    },
    filterStepSecond(val) {
      const fields = this.stepList.filter(v => v.title===val)
      const ext = JSON.parse(fields[0].ext)
      if (ext.sourceFields) {
        ext.sourceFields.forEach(field => {
          this.rightFields.push(field)
        })
      }
    },
    filterStepFirst(val) {
      const fields = this.stepList.filter(v => v.title ===val)
      const ext = JSON.parse(fields[0].ext)
      if (ext.sourceFields) {
        ext.sourceFields.forEach(field => {
          this.leftFields.push(field)
        })
      }
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
      const items = vm.form.fieldMappingData.filter(mapping => vm.sourceFields.indexOf(mapping.source) >= 0)
      const array = vm.sourceFields
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
      vm.sourceFields.forEach(field => {
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
    vm.sourceFields = []
    const replaceFields = []
    if (previousSteps && previousSteps.length > 0) {
      previousSteps.forEach((step, i) => {
        if (i === 0 && FORBIDDEN_NEXT_STEP_PARALLEL.indexOf(step.type) >= 0) {
          vm.forbiddenParallel = true
        }
        if (step.ext !== undefined && step.ext !== 'undefined' && IGNORE_REPEAT_WARNING_META.indexOf(step.type) < 0) {
          const ext = JSON.parse(step.ext)
          if (step.depth === 0 && step.title) {
            vm.sourceFields.push(step.title)
            vm.stepList.push(step)
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
    // const root = vm.$store.getters['etl/getRoot']
    // fetchDatasourceList({
    //   id: root.projectId,
    //   ignoreStatus: false
    // }).then(res => {
    //   res.data.forEach(ele => {
    //     vm.datasourceOptions.push({
    //       id: ele.id,
    //       label: ele.name,
    //       category: ele.category,
    //       host: ele.host,
    //       port: ele.port,
    //       url: ele.url,
    //       driver: ele.driver
    //     })
    //   })
    // })
    // this.initTargetFields()
  }
}
</script>
