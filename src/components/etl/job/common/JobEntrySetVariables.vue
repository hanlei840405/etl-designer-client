<template>
  <div style="width: 100%;">
    <q-form class="row q-col-gutter-xs">
      <q-input class="col-12 col-md-6" outlined v-model="form.name" :label="$t('form.jobEntrySetVariables.name')" :rules="[ val => val && val.length > 0 || 'Please type something']" hint=""/>
        <q-select class="col-12 col-md-6" outlined v-model="form.mode" :options="scopes" :label="$t('form.jobEntrySetVariables.variableScope')" emit-value map-options hint=""></q-select>
        <q-table class="col-12" :data="form.parameters" :columns="parameterColumns" :rows-per-page-options="[0]" row-key="name" separator="cell" hide-bottom :title="$t('form.jobEntrySetVariables.tableParameter')">
        <template v-slot:top-right>
          <q-btn size="sm" outline color="primary" icon="add" @click="addParameter"/>
        </template>
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="operate" :props="props">
              <q-btn size="xs" outline round color="negative" icon="remove" @click="deleteParameter(props)"></q-btn>
            </q-td>
            <q-td key="name" :props="props">
              {{ props.row.name }}
              <q-popup-edit v-model="props.row.name" :auto-save="true">
                <q-input autofocus v-model="props.row.name"/>
              </q-popup-edit>
            </q-td>
            <q-td key="value" :props="props">
              {{ props.row.value }}
              <q-popup-edit v-model="props.row.value" :auto-save="true">
                <q-input autofocus v-model="props.row.value"/>
              </q-popup-edit>
            </q-td>
            <q-td key="scope" :props="props">
              {{ getLabel(props.row.scope) }}
              <q-popup-edit v-model="props.row.scope" :auto-save="true">
                <q-select autofocus outlined v-model="props.row.scope" emit-value map-options :options="scopes"/>
              </q-popup-edit>
            </q-td>
          </q-tr>
        </template>
      </q-table>
      <q-checkbox class="col-12 col-md-3" v-model="form.replaceVars" :label="$t('form.jobEntrySetVariables.replaceVariable')"/>
      <q-checkbox class="col-12 col-md-3" v-model="form.parallel" :label="$t('form.jobEntrySetVariables.parallel')"/>
    </q-form>
  </div>
</template>

<script>

export default {
  name: 'JobEntrySetVariables',
  data () {
    return {
      tab: 'main',
      form: {
        name: null,
        parameters: [],
        parallel: false,
        replaceVars: true
      },
      scopeMapping: {
        JVM: 'Valid in the Java Virtual Machine',
        CURRENT_JOB: 'Valid in the current job',
        PARENT_JOB: 'Valid in the parent job',
        ROOT_JOB: 'Valid in the root job'
      },
      scopes: [{
        value: 'JVM',
        label: 'Valid in the Java Virtual Machine'
      }, {
        value: 'CURRENT_JOB',
        label: 'Valid in the current job'
      }, {
        value: 'PARENT_JOB',
        label: 'Valid in the parent job'
      }, {
        value: 'ROOT_JOB',
        label: 'Valid in the root job'
      }],
      parameterColumns: [
        {
          name: 'operate',
          label: this.$t('form.jobEntrySetVariables.columnOperate'),
          filed: 'operate',
          align: 'right',
          headerStyle: 'width: 20px'
        },
        {
          name: 'name',
          label: this.$t('form.jobEntrySetVariables.columnName'),
          field: 'name',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'value',
          label: this.$t('form.jobEntrySetVariables.columnValue'),
          field: 'value',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'scope',
          label: this.$t('form.jobEntrySetVariables.columnScope'),
          field: 'scope',
          align: 'left',
          headerStyle: 'width: 100px;'
        }
      ]
    }
  },
  methods: {
    getLabel (val) {
      return this.scopeMapping[val]
    },
    addParameter () {
      this.form.parameters.push({
        field: null,
        variable: null,
        scope: null,
        defaultValue: null
      })
    },
    deleteParameter (props) {
      this.form.parameters.splice(props.rowIndex, 1)
    },
    submitForm (e) {
      this.$emit('propertiesForm', {
        state: true,
        mxCellProperties: this.form,
        ext: { sourceFields: this.form.parameters.map(ele => ele.name) }
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
