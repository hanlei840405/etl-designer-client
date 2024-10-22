<template>
  <div style="width: 100%;">
    <q-form class="q-gutter-md">
      <q-input outlined v-model="form.name" :label="$t('form.filterRows.name')"
               :rules="[ val => val && val.length > 0 || 'Please type something']" hint=""/>

      <q-select outlined v-model="form.send_true_to" clearable filled use-input @input="filterStepTrue"
                :options="nextSteps" :label="$t('form.filterRows.stepTrue')"/>
      <q-select outlined v-model="form.send_false_to" clearable filled use-input @input="filterStepFalse"
                :options="nextSteps" :label="$t('form.filterRows.stepFalse')"/>

      <q-table :data="form.fieldMappingData" :columns="parameterColumns" :rows-per-page-options="[0]" row-key="name"
               separator="cell" hide-bottom :title="$t('form.filterRows.condition')">
        <template v-slot:top-right>
          <q-btn size="sm" outline color="primary" icon="add" @click="addParameter"/>
        </template>
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="operate" :props="props">
              <q-btn size="xs" outline round color="negative" icon="remove" @click="deleteParameter(props)"></q-btn>
            </q-td>
            <q-td key="negate" :props="props">
              {{ props.row.negate }}
              <q-popup-edit v-model="props.row.negate" :auto-save="true">
                <q-select autofocus outlined v-model="props.row.negate" :options="negates"/>
              </q-popup-edit>
            </q-td>
            <q-td key="operates" :props="props">
              {{ props.row.operates }}
              <q-popup-edit v-model="props.row.operates" :auto-save="true">
                <q-select autofocus outlined v-model="props.row.operates" :options="operators"/>
              </q-popup-edit>
            </q-td>
            <q-td key="leftValuename" :props="props">
              {{ props.row.leftValuename }}
              <q-popup-edit v-model.number="props.row.leftValuename" :auto-save="true">
                <q-select autofocus outlined v-model.number="props.row.leftValuename" :options="sourceFields"/>
              </q-popup-edit>
            </q-td>
            <q-td key="function" :props="props">
              {{ props.row.function }}
              <q-popup-edit v-model.number="props.row.function" :auto-save="true">
                <q-select autofocus outlined v-model.number="props.row.function" :options="functions"/>
              </q-popup-edit>
            </q-td>
            <q-td key="rightValuename" :props="props">
              {{ props.row.rightValuename }}
              <q-popup-edit v-model.number="props.row.rightValuename" :auto-save="true">
                <q-select autofocus outlined v-model.number="props.row.rightValuename" :options="sourceFields"/>
              </q-popup-edit>
            </q-td>
            <q-td key="value" :props="props">
              {{ props.row.value }}
              <q-popup-edit v-model.number="props.row.value" :auto-save="true">
                <q-input autofocus outlined v-model.number="props.row.value"/>
              </q-popup-edit>
            </q-td>
            <q-td key="type" :props="props">
              {{ props.row.type }}
              <q-popup-edit v-model.number="props.row.type" :auto-save="true">
                <q-input autofocus outlined v-model.number="props.row.type" :options="categories"/>
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
const IGNORE_REPEAT_WARNING_META = ['SortRowsMeta', 'UniqueRowsMeta', 'UniqueRowsByHashSetMeta', 'SetValueFieldMeta']
export default {
  name: 'FilterRowsMeta',
  data() {
    return {
      form: {
        initFlag: true,
        name: "过滤记录",
        type: "FilterRows",
        modelName: "",
        description: [
          "",
          ""
        ],
        fieldMappingData: [],
        distribute: "Y",
        custom_distribution: "",
        copies: 1,
        partitioning: {
          method: "none",
          schema_name: ""
        },
        isBusiness: "Y",
        send_true_to: "",
        send_false_to: "",
        compare: {
          condition: {
            negated: "N",
            conditions: {
              condition: []
            }
          }
        },
        fields: {
          field: []
        },
        attributes: "",
        cluster_schema: "",
        remotesteps: {
          input: "",
          output: ""
        },
        GUI: {
          xloc: 416,
          yloc: 288,
          draw: "Y"
        }
      },
      parameterColumns: [
        {
          name: 'operate',
          label: this.$t('form.filterRows.columnOperate'),
          field: 'operate',
          align: 'right',
          headerStyle: 'width: 20px'
        },
        {
          name: 'negate',
          label: this.$t('form.filterRows.negate'),
          field: 'negate',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'operates',
          label: this.$t('form.filterRows.operateValue'),
          field: 'operates',
          align: 'left',
          headerStyle: 'width: 20px'
        },
        {
          name: 'leftValuename',
          label: this.$t('form.filterRows.columnName'),
          field: 'leftValuename',
          align: 'left',
          headerStyle: 'width: 100px;'
        },

        {
          name: 'function',
          label: this.$t('form.filterRows.function'),
          field: 'function',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'rightValuename',
          label: this.$t('form.filterRows.columnName'),
          field: 'rightValuename',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'value',
          label: this.$t('form.filterRows.value'),
          field: 'value',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'type',
          label: this.$t('form.filterRows.type'),
          field: 'type',
          align: 'left',
          headerStyle: 'width: 100px;'
        }
      ],
      sourceFields: [],
      stepList: [],
      nextSteps: [],
      categories: ['BigNumber', 'Binary', 'Boolean', 'Date', 'Integer', 'Internet Address', 'Number', 'String', 'Timestamp'],
      negates: ["Y", "N"],
      operators: ["AND","OR","OR NOT","AND NOT","XOR"],
      functions: ["=", "<>", "<", "<=", ">", ">=", "REGEXP", "IS NULL", "IS NOT NULL", "IN LIST", "CONTAINS", "STARTS WITH", "ENDS WITH", "LIKE", "TRUE"],
      leftFields: [],
      rightFields: [],
    }
  },
  methods: {
    filterStepTrue(val) {
      const fields = this.stepList.filter(v => v.title === val)
      const ext = JSON.parse(fields[0].ext)
      if (ext.sourceFields) {
        ext.sourceFields.forEach(field => {
          this.rightFields.push(field)
        })
      }
    },
    filterStepFalse(val) {
      const fields = this.stepList.filter(v => v.title === val)
      const ext = JSON.parse(fields[0].ext)
      if (ext.sourceFields) {
        ext.sourceFields.forEach(field => {
          this.leftFields.push(field)
        })
      }
    },
    addParameter() {
      this.form.fieldMappingData.push({
        negate: '',
        operates: '',
        leftValuename: '',
        function: '',
        rightValuename:'',
        value:'',
      })
    },
    deleteParameter(props) {
      this.form.fieldMappingData.splice(props.rowIndex, 1)
    },
    submitForm() {
      this.$emit('propertiesForm', {
        state: true,
        mxCellProperties: this.form,
      })
    }
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
    const nextSteps = vm.$store.getters['etl/getNextNodes']
    vm.nextSteps = []
    if (nextSteps && nextSteps.length > 0) {
      nextSteps.forEach(step => {
        if (step.value&&step.title){
          vm.nextSteps.push({ value: step.value, label: step.title })
        }
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
