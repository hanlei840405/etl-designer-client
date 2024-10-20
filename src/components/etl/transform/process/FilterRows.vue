<template>
  <div style="width: 100%;">
    <q-form class="q-gutter-md">
      <q-input outlined v-model="form.name" :label="$t('form.filterRows.name')"
               :rules="[ val => val && val.length > 0 || 'Please type something']" hint=""/>

      <q-select outlined v-model="form.send_true_to" clearable filled use-input @input="filterStepTrue"
                :options="stepNameList" :label="$t('form.filterRows.stepTrue')"/>
      <q-select outlined v-model="form.send_false_to" clearable filled use-input @input="filterStepFalse"
                :options="stepNameList" :label="$t('form.filterRows.stepFalse')"/>

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
            <q-td key="operate" :props="props">
              {{ props.row.operate }}
              <q-popup-edit v-model="props.row.operate" :auto-save="true">
                <q-select autofocus outlined v-model="props.row.operate" :options="operators"/>
              </q-popup-edit>
            </q-td>
            <q-td key="leftValuename" :props="props">
              {{ props.row.leftValuename }}
              <q-popup-edit v-model.number="props.row.leftValuename" :auto-save="true">
                <q-select autofocus outlined v-model.number="props.row.leftValuename"/>
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
                <q-select autofocus outlined v-model.number="props.row.rightValuename" />
              </q-popup-edit>
            </q-td>
            <q-td key="value" :props="props">
              {{ props.row.value }}
              <q-popup-edit v-model.number="props.row.value" :auto-save="true">
                <q-input autofocus outlined v-model.number="props.row.value"/>
              </q-popup-edit>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </q-form>
  </div>
</template>

<script>
export default {
  name: 'FilterRowsMeta',
  data() {
    return {
      form: {
        initFlag: true,
        name: "过滤插件",
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
          name: 'operate',
          label: this.$t('form.filterRows.operateValue'),
          field: 'operate',
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
          field: 'accuracy',
          align: 'left',
          headerStyle: 'width: 100px;'
        }
      ],
      stepNameList: [],
      stepList: [],
      categories: ['BigNumber', 'Binary', 'Boolean', 'Date', 'Integer', 'Internet Address', 'Number', 'String', 'Timestamp'],
      negates: ["Y", "N"],
      operators: ["AND","OR","OR NOT","AND NOT","XOR"],
      functions: ["=", "<>", "<", "<=", ">", ">=", "REGEXP", "IS NULL", "IS NOT NULL", "IN LIST", "CONTAINS", "STARTS WITH", "ENDS WITH", "LIKE", "TRUE"],
    }
  },
  methods: {
    filterStepTrue(val) {
      const fields = this.stepList.filter(v => v.title === val)
      const ext = JSON.parse(fields[0].ext)
      if (ext.sourceFields) {
        ext.sourceFields.forEach(field => {
          this.leftFields.push(field)
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
        operate: '',
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
        ext: {sourceFields: this.form.parameters.map(ele => ele.field)}
      })
    }
  },
  mounted() {
    const vm = this
    const mxCellValue = vm.$store.getters['etl/getMxCellForm']
    if (mxCellValue) {
      vm.form = Object.assign(vm.form, mxCellValue)
    }
  }
}
</script>
