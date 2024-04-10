<template>
  <div style="width: 100%;">
    <q-form class="row q-col-gutter-xs">
      <q-input class="col-12 col-md-6" outlined v-model="form.name" :label="$t('form.tableInput.name')" :rules="[ val => val && val.length > 0 || 'Please type something']" hint=""/>
      <q-select class="col-12 col-md-6" outlined v-model.number="form.datasource" emit-value map-options option-value="id" :options="datasourceOptions" :label="$t('form.tableInput.datasource')" clearable :rules="[ val => validate(val) || 'datasource is invalid' ]" hint="">
        <template v-slot:option="scope">
          <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
            <q-item-section>
              <q-item-label>{{ scope.opt.label }}</q-item-label>
              <q-item-label caption v-if="scope.opt.category !== 'jdbc'">host: {{ scope.opt.host }}</q-item-label>
              <q-item-label caption v-if="scope.opt.category !== 'jdbc'">port: {{ scope.opt.port }}</q-item-label>
              <q-item-label caption v-if="scope.opt.category === 'jdbc'">url: {{ scope.opt.url }}</q-item-label>
              <q-item-label caption v-if="scope.opt.category === 'jdbc'">driver: {{ scope.opt.driver }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-badge :label="scope.opt.category" />
            </q-item-section>
          </q-item>
        </template>
      </q-select>
      <q-select class="col-12 col-md-6" clearable outlined v-model="form.lookupFromStepValue" :options="previousSteps" emit-value map-options :label="$t('form.tableInput.previous')" @clear="form.executeEachInputRow = false" @input="setLookupFromStepName" hint=""/>
      <q-input class="col-12 col-md-6" outlined v-model.number="form.rowLimit" :label="$t('form.tableInput.limitSize')" hint=""/>
      <q-input class="col-12 col-md-12" outlined v-model="form.sql" type="textarea" rows="10" label="SQL" placeholder="SELECT <values> FROM <table name> WHERE <conditions>" :rules="[ val => val && val.length > 0 || 'Please type something']" hint="">
        <template v-slot:append>
          <div style="margin-top: 2vh;">
            <q-btn round dense flat icon="search" @click="loadTables"/><br/>
            <q-btn round dense flat icon="visibility" @click="preview" :disable="previewBtnDisable"/>
          </div>
        </template>
      </q-input>
      <q-checkbox class="col-12 col-md-4" v-model="form.lazyConversionActive" :label="$t('form.tableInput.enableLazyConversion')" />
      <q-checkbox class="col-12 col-md-5" v-model="form.variableReplacementActive" :label="$t('form.tableInput.replaceVariables')" />
      <q-checkbox class="col-12 col-md-3" v-model="form.executeEachInputRow" :label="$t('form.tableInput.executeEachRow')" :disable="form.lookupFromStepValue === null"/>
      <q-dialog v-model="previewDataDialog.mode">
        <q-card>
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">{{ $t('form.tableInput.preview') }}</div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>

          <q-card-section>
            <q-chip square text-color="primary" icon="bookmark" style="width: 100%; margin: 0px;">
              {{ $t('form.tableInput.limit', [20]) }}
            </q-chip>
            <q-table
              flat
              dense
              bordered
              :data="previewDataDialog.data"
              :columns="previewDataDialog.columns"
              row-key="index"
              :loading="previewDataDialog.loading"
              separator="cell"
              :rows-per-page-options="[0]"
              hide-bottom
            />
          </q-card-section>
        </q-card>
      </q-dialog>
      <q-dialog v-model="selectTables.mode">
        <q-card style="width: 100vw;">
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">{{ $t('dialog-title-datasource') }}</div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>
          <q-separator/>
          <q-card-section class="row items-center q-pb-none">
            <q-tree :nodes="selectTables.data" node-key="id" @lazy-load="loadColumns" @update:selected="initSql" :selected.sync="selectTables.name"/>
          </q-card-section>
        </q-card>
      </q-dialog>
    </q-form>
  </div>
</template>

<script>
import { fetchDatasourceList } from 'src/service/base/DatasourceService'
import { preview, structure } from 'src/service/kettle/PreviewService'
import { mdiTableLarge, mdiGlasses } from '@quasar/extras/mdi-v5'
export default {
  name: 'TableInputMeta',
  data () {
    return {
      form: {
        name: null,
        datasource: null,
        sql: null,
        lazyConversionActive: false,
        variableReplacementActive: false,
        executeEachInputRow: false,
        lookupFromStepValue: null,
        lookupFromStepName: null,
        rowLimit: 0,
        distribute: true
      },
      datasourceOptions: [],
      previousSteps: [],
      previewDataDialog: {
        mode: false,
        columns: [],
        data: [],
        loading: false
      },
      selectTables: {
        mode: false,
        data: [],
        name: null,
        loading: false
      }
    }
  },
  methods: {
    validate (val) {
      return val != null
    },
    setLookupFromStepName () {
      const vm = this
      vm.previousSteps.forEach(item => {
        if (item.value === vm.form.lookupFromStepValue) {
          vm.form.lookupFromStepName = item.label
        }
      })
    },
    loadTables () {
      const vm = this
      if (!vm.form.datasource) {
        vm.$q.notify({
          position: 'top',
          message: vm.$t('message.noDatasourceSelected'),
          color: 'negative'
        })
      } else {
        vm.selectTables.data = []
        vm.$q.loading.show()
        structure({ datasourceId: vm.form.datasource, category: 'db' }).then(res => {
          vm.$q.loading.hide()
          vm.selectTables.mode = true
          res.data.forEach(ele => {
            vm.selectTables.data.push({
              id: 't_' + ele.name,
              label: ele.name,
              lazy: true,
              icon: ele.type === 'TABLE' ? mdiTableLarge : mdiGlasses
            })
          })
        }).catch(err => {
          vm.$q.loading.hide()
          vm.$q.notify({
            position: 'top',
            message: err.data.error,
            color: 'negative'
          })
        })
      }
    },
    loadColumns ({ node, key, done, fail }) {
      const vm = this
      vm.$q.loading.show()
      structure({ datasourceId: vm.form.datasource, category: 'table', name: key.replace('t_', '') }).then(res => {
        vm.$q.loading.hide()
        const children = []
        res.data.forEach(element => {
          children.push({
            id: 'c_' + element.name,
            label: element.name + '【' + element.info + '】',
            selectable: false
          })
        })
        done(children)
      }).catch(err => {
        vm.$q.loading.hide()
        vm.$q.notify({
          position: 'top',
          message: err.data.error,
          color: 'negative'
        })
      })
    },
    initSql (key) {
      const vm = this
      const tableName = key.replace('t_', '')
      const columns = []
      vm.$q.loading.show()
      structure({ datasourceId: vm.form.datasource, category: 'table', name: tableName }).then(res => {
        vm.$q.loading.hide()
        res.data.forEach(element => {
          columns.push(element.name)
        })
        vm.form.sql = 'SELECT \n  ' + columns.join('\n, ') + '\nFROM\n' + tableName
        vm.selectTables.mode = false
      }).catch(err => {
        vm.$q.loading.hide()
        vm.$q.notify({
          position: 'top',
          message: err.data.error,
          color: 'negative'
        })
      })
    },
    preview () {
      const vm = this
      vm.previewDataDialog.columns = []
      vm.previewDataDialog.data = []
      vm.previewDataDialog.mode = true
      vm.previewDataDialog.loading = true
      preview({
        category: 'sql',
        datasourceId: vm.form.datasource,
        sql: vm.form.sql
      }).then(res => {
        const lineNo = {
          name: 'index',
          label: '#',
          field: 'index'
        }
        vm.previewDataDialog.columns.push(lineNo)
        res.data.headers.forEach(ele => {
          const column = {
            name: ele,
            label: ele.toUpperCase(),
            field: ele
          }
          vm.previewDataDialog.columns.push(column)
        })
        res.data.records.forEach((ele, index) => {
          vm.previewDataDialog.data.push(Object.assign(ele, { index: index + 1 }))
        })
        vm.previewDataDialog.loading = false
      }).catch(() => {
        vm.$q.notify({
          position: 'top',
          message: vm.$t('response.error.grammer'),
          color: 'negative'
        })
      })
    },
    submitForm () {
      const vm = this
      if (vm.form.sql) {
        preview({
          category: 'sql',
          datasourceId: vm.form.datasource,
          sql: vm.form.sql
        }).then(res => {
          this.$emit('propertiesForm', { state: true, mxCellProperties: this.form, ext: { sourceFields: res.data.headers } })
        }).catch(() => {
          this.$emit('propertiesForm', { state: true, mxCellProperties: this.form, ext: { sourceFields: [] } })
        })
      } else {
        this.$emit('propertiesForm', { state: true, mxCellProperties: this.form })
      }
    }
  },
  computed: {
    previewBtnDisable () {
      return this.form.lookupFromStepValue !== null || (this.form.sql === null || (this.form.sql !== null && this.form.sql.trim() === '')) || this.form.datasource === null
    }
  },
  mounted () {
    const vm = this
    const previousSteps = vm.$store.getters['etl/getPreNodes']
    vm.previousSteps = []
    if (previousSteps && previousSteps.length > 0) {
      vm.previousSteps.push({ value: previousSteps[0].value, label: previousSteps[0].title })
    }
    const mxCellValue = vm.$store.getters['etl/getMxCellForm']
    if (mxCellValue) {
      vm.form = Object.assign(vm.form, mxCellValue)
    }
    const root = vm.$store.getters['etl/getRoot']
    fetchDatasourceList({
      id: root.projectId
    }).then(res => {
      res.data.forEach(ele => {
        vm.datasourceOptions.push({
          id: ele.id,
          label: ele.name,
          category: ele.category,
          host: ele.host,
          port: ele.port,
          url: ele.url,
          driver: ele.driver
        })
      })
    })
  }
}
</script>
