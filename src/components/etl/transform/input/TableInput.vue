<template>
  <div style="width: 100%;">
    <q-form class="q-gutter-md">
      <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.name" label="步骤名称" lazy-rules :rules="[ val => val && val.length > 0 || 'Please type something']"/>
      <q-select outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model.number="form.datasource" emit-value map-options option-value="id" :options="datasource" label="数据库连接" clearable lazy-rules :rules="[ val => validate(val) || 'datasource is invalid' ]">
        <template v-slot:option="scope">
          <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
            <q-item-section>
              <q-item-label v-html="scope.opt.label" />
              <q-item-label caption>host: {{ scope.opt.host }}</q-item-label>
              <q-item-label caption>port: {{ scope.opt.port }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-badge :label="scope.opt.category" color="cyan-8" />
            </q-item-section>
          </q-item>
        </template>
      </q-select>
      <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.sql" type="textarea" rows="10" label="SQL" placeholder="SELECT <values> FROM <table name> WHERE <conditions>" lazy-rules :rules="[ val => val && val.length > 0 || 'Please type something']">
        <template v-slot:append>
          <div style="margin-top: 2vh;">
            <q-btn round dense flat icon="search" text-color="cyan-8" @click="loadTables"/><br/>
            <q-btn round dense flat text-color="cyan-8" icon="visibility" @click="preview" :disable="previewBtnDisable"/>
          </div>
        </template>
      </q-input>
      <q-select clearable outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.lookupFromStepValue" :options="previousSteps" emit-value map-options label="从步骤插入数据" @clear="form.executeEachInputRow = false" @input="setLookupFromStepName"/>
      <q-checkbox text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.lazyConversionActive" label="允许简易转换" />
      <q-checkbox text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.variableReplacementActive" label="替换SQL语句里的变量" />
      <q-checkbox text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.executeEachInputRow" label="执行每一行" :disable="form.lookupFromStepValue === null"/>
      <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model.number="form.rowLimit" label="记录数量限制"/>
      <q-dialog v-model="previewDataDialog.mode">
        <q-card>
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">预览</div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>

          <q-card-section>
            <q-chip square text-color="cyan-8" icon="bookmark" style="width: 100%; margin: 0px;">
              预览数据最多显示10条
            </q-chip>
            <q-table
              color="cyan-8"
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
            <div class="text-h6">数据库信息</div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>
          <q-separator/>
          <q-card-section class="row items-center q-pb-none">
            <q-tree :nodes="selectTables.data" node-key="id" @lazy-load="loadColumns" selected-color="cyan-8" @update:selected="initSql" :selected.sync="selectTables.name"/>
          </q-card-section>
        </q-card>
      </q-dialog>
    </q-form>
  </div>
</template>

<script>
import { fetchAllDatasource } from 'src/service/DatasourceService'
import { preview, structure } from 'src/service/PreviewService'
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
      datasource: [],
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
          message: '请先选择数据源',
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
          message: 'SQL语法错误或存在特殊字符等，请仔细检查',
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
          // res.data.headers.forEach(ele => {
          //   const column = {
          //     name: ele,
          //     label: ele,
          //     field: ele
          //   }
          //   vm.previewDataDialog.columns.push(column)
          // })
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
    fetchAllDatasource({
      id: root.projectId,
      ignoreStatus: false
    }).then(res => {
      res.data.forEach(ele => {
        vm.datasource.push({
          id: ele.id,
          label: ele.name,
          category: ele.category,
          host: ele.host,
          port: ele.port
        })
      })
    })
  }
}
</script>
