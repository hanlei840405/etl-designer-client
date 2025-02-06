<template>
  <div style="width: 100%;">
    <q-form class="q-gutter-md">
      <q-tabs v-model="tab" active-color="primary" active-bg-color="grey-3" align="left" narrow-indicator>
        <q-tab name="basic" :label="$t('form.dataGrid.tabBasic')"/>
        <q-tab name="parameter" :label="$t('form.dataGrid.tabParameter')" @click="refreshDynamicColumns"/>
      </q-tabs>
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="basic">
          <q-input outlined v-model="form.name" :label="$t('form.dataGrid.name')" :rules="[ val => val && val.length > 0 || 'Please type something']" hint=""/>
          <q-table :data="form.parameters" :columns="parameterColumns" :rows-per-page-options="[0]" row-key="name" separator="cell" hide-bottom :title="$t('form.dataGrid.tableField')">
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
                    <q-input autofocus outlined v-model="props.row.field"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="category" :props="props">
                  {{ props.row.category }}
                  <q-popup-edit v-model="props.row.category" :auto-save="true">
                    <q-select autofocus outlined v-model="props.row.category" :options="categories"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="formatValue" :props="props">
                  {{ props.row.formatValue }}
                  <q-popup-edit v-model="props.row.formatValue" :auto-save="true">
                    <q-select autofocus outlined v-model="props.row.formatValue" :options="formats"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="lengthValue" :props="props">
                  {{ props.row.lengthValue }}
                  <q-popup-edit type="number" v-model.number="props.row.lengthValue" :auto-save="true">
                    <q-input autofocus outlined type="number" v-model.number="props.row.lengthValue"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="accuracy" :props="props">
                  {{ props.row.accuracy }}
                  <q-popup-edit type="number" v-model.number="props.row.accuracy" :auto-save="true">
                    <q-input autofocus outlined type="number" v-model.number="props.row.accuracy"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="currency" :props="props">
                  {{ props.row.currency }}
                  <q-popup-edit v-model="props.row.currency" :auto-save="true">
                    <q-input autofocus outlined v-model="props.row.currency"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="decimal" :props="props">
                  {{ props.row.decimal }}
                  <q-popup-edit v-model="props.row.decimal" :auto-save="true">
                    <q-input autofocus outlined v-model="props.row.decimal"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="groupBy" :props="props">
                  {{ props.row.groupBy }}
                  <q-popup-edit v-model="props.row.groupBy" :auto-save="true">
                    <q-input autofocus outlined v-model="props.row.groupBy"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="emptyValue" :props="props">
                  {{ props.row.emptyValue }}
                  <q-popup-edit v-model="props.row.emptyValue" :auto-save="true">
                    <q-select autofocus outlined v-model="props.row.emptyValue" :options="emptyValues"/>
                  </q-popup-edit>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-tab-panel>
        <q-tab-panel name="parameter">
          <q-table :data="form.dynamicValues" :columns="dynamicColumns" :rows-per-page-options="[0]" row-key="name" separator="cell" hide-bottom :title="$t('form.dataGrid.tableField')">
            <template v-slot:top-right>
              <q-btn size="sm" outline color="primary" icon="add" @click="addDynamicValues"/>
            </template>
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td :key="column.field" :props="props" v-for="column in dynamicColumns">
                  {{ props.row[column.field] }}
                  <q-popup-edit v-model="props.row[column.field]" :auto-save="true" v-if="column.field !== '_operate_'">
                    <q-input autofocus outlined v-model="props.row[column.field]"/>
                  </q-popup-edit>
                  <q-btn size="xs" outline round color="negative" icon="remove" @click="deleteDynamicValues(props)"
                         v-if="column.field === '_operate_'"></q-btn>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-tab-panel>
      </q-tab-panels>
  </q-form>
  </div>
</template>

<script>
export default {
  name: 'DataGridMeta',
  data () {
    return {
      tab: 'basic',
      form: {
        name: null,
        parameters: [],
        dynamicValues: [],
        distribute: true
      },
      parameterColumns: [
        {
          name: 'operate',
          label: this.$t('form.dataGrid.columnOperate'),
          field: 'operate',
          align: 'right',
          headerStyle: 'width: 20px'
        },
        {
          name: 'field',
          label: this.$t('form.dataGrid.columnField'),
          field: 'field',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'category',
          label: this.$t('form.dataGrid.columnType'),
          field: 'category',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'formatValue',
          label: this.$t('form.dataGrid.columnFormat'),
          field: 'formatValue',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'lengthValue',
          label: this.$t('form.dataGrid.columnLength'),
          field: 'lengthValue',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'accuracy',
          label: this.$t('form.dataGrid.columnAccuracy'),
          field: 'accuracy',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'currency',
          label: this.$t('form.dataGrid.columnCurrencyFormat'),
          field: 'currency',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'decimal',
          label: this.$t('form.dataGrid.columnDecimal'),
          field: 'decimal',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'groupBy',
          label: this.$t('form.dataGrid.columnGroup'),
          field: 'groupBy',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'emptyValue',
          label: this.$t('form.dataGrid.columnEmpty'),
          field: 'emptyValue',
          align: 'left',
          headerStyle: 'width: 100px;'
        }
      ],
      dynamicColumns: [],
      categories: ['BigNumber', 'Binary', 'Boolean', 'Date', 'Integer', 'Internet Address', 'Number', 'String', 'Timestamp'],
      emptyValues: ['Y', 'N'],
      formats: ['yyyy/MM/dd HH:mm:ss.SSS', 'yyyy/MM/dd HH:mm:ss.SSS XXX', 'yyyy/MM/dd HH:mm:ss', 'yyyy/MM/dd HH:mm:ss XXX', 'yyyyMMddHHmmss', 'yyyy/MM/dd', 'yyyy-MM-dd', 'yyyy-MM-dd HH:mm:ss', 'yyyy-MM-dd HH:mm:ss XXX',
        'yyyyMMdd', 'MM/dd/yyyy', 'MM/dd/yyyy HH:mm:ss', 'MM-dd-yyyy', 'MM-dd-yyyy HH:mm:ss', 'MM/dd/yy', 'MM-dd-yy', 'dd/MM/yyyy', 'dd-MM-yyyy', 'yyyy-MM-dd\'T\'HH:mm:ss.SSSXXX', 'yyyy-MM-dd HH:mm:ss.SSS']
    }
  },
  methods: {
    addParameter () {
      this.form.parameters.push({
        field: null,
        category: 'String',
        formatValue: null,
        lengthValue: -1,
        accuracy: -1,
        currency: null,
        decimal: null,
        groupBy: null,
        emptyValue: null
      })
    },
    deleteParameter (props) {
      this.form.parameters.splice(props.rowIndex, 1)
    },
    addDynamicValues () {
      const value = {}
      this.dynamicColumns.forEach(column => {
        value[column.field] = null
      })
      this.form.dynamicValues.push(value)
    },
    deleteDynamicValues (props) {
      this.form.dynamicValues.splice(props.rowIndex, 1)
    },
    refreshDynamicColumns () {
      const vm = this
      vm.dynamicColumns = []
      vm.dynamicColumns.push({
        name: '_operate_',
        label: this.$t('form.dataGrid.columnOperate'),
        field: '_operate_',
        align: 'right',
        headerStyle: 'width: 20px'
      })
      vm.form.parameters.forEach(parameter => {
        vm.dynamicColumns.push({
          name: parameter.field,
          label: parameter.field,
          field: parameter.field,
          align: 'left',
          headerStyle: 'width: 100px;'
        })
      })
    },
    submitForm () {
      const sourceFields = []
      this.form.dynamicValues.map((dv, index) => {
        for (const key in dv) {
          if (key !== '_operate_') {
            sourceFields.push(key)
          } else {
            delete dv[key]
          }
        }
      })
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
    const mxCellValue = vm.$store.getters['etl/getMxCellForm']
    if (mxCellValue) {
      vm.form = Object.assign(vm.form, mxCellValue)
    }
  }
}
</script>
