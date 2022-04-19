<template>
  <div>
    <q-table grid :data="table.data" :loading="table.loading" :columns="table.columns" row-key="id" :filter="table.filter" @request="searchProjects" hide-header
             :no-data-label="$t('table-empty')" :rows-per-page-options="[0]" hide-bottom>
      <template v-slot:top-right>
        <q-input borderless dense debounce="300" v-model="table.filter" placeholder="Search">
          <template v-slot:append>
            <q-icon name="search"/>
            <q-btn text-color="cyan-8" outline :label="$t('btn-new')" @click="newProject"/>
          </template>
        </q-input>
      </template>
      <template v-slot:item="props">
        <div
          class="q-pa-xs col-xs-12 col-sm-4 col-md-3 col-lg-2 grid-style-transition"
        >
          <q-separator color="cyan-8" size="2px"/>
          <q-card :class="[props.row.status === '1' ? '' : 'bg-grey-5']" @click="loadProject(props)">
            <q-list dense>
              <q-item v-for="col in props.cols.filter(col => col.name !== 'desc')" :key="col.name">
                <q-item-section>
                  <q-item-label>{{ col.label }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label caption lines="1">{{ col.value }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card>
        </div>
      </template>
    </q-table>
    <q-dialog v-model="editProjectDialog.state" :position="editProjectDialog.position" full-height>
      <q-card style="width: 100vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ editProjectDialog.title }}</div>
          <q-space/>
          <q-btn icon="close" flat round dense v-close-popup/>
        </q-card-section>
        <q-card-section>
          <q-form class="q-gutter-md">
            <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="editProjectDialog.project.name" :label="$t('form-name-require')" lazy-rules :rules="[ val => val && val.length > 0 || 'Please type something']"/>
            <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" type="textarea" v-model="editProjectDialog.project.description" :label="$t('form-description')"/>
          </q-form>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn :label="$t('btn-save')" outline text-color="cyan-8" :icon="table.saveIcon" @click="saveProject"/>
          <q-btn :label="$t('btn-delete')" outline text-color="negative" :icon="table.deleteIcon" @click="deleteProject"/>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import {
  deleteProject,
  fetchAllProjects,
  fetchProject,
  saveProject
} from 'src/service/ProjectService'
import { mdiContentSaveOutline, mdiTrashCanOutline } from '@quasar/extras/mdi-v5'

export default {
  data () {
    return {
      table: {
        saveIcon: mdiContentSaveOutline,
        deleteIcon: mdiTrashCanOutline,
        filter: null,
        loading: false,
        data: [],
        columns: [
          {
            name: 'name',
            label: this.$t('column-name'),
            field: 'name',
            align: 'left'
          },
          {
            name: 'status',
            label: this.$t('column-status'),
            field: 'status',
            align: 'left',
            format: (val, row) => {
              return val === '1' ? this.$t('column-status-active') : this.$t('column-status-inactive')
            }
          },
          {
            name: 'description',
            label: this.$t('column-description'),
            field: 'description',
            align: 'left'
          }
        ]
      },
      editProjectDialog: {
        state: false,
        position: 'right',
        title: this.$t('form-title-edit'),
        project: {
          id: null,
          name: null,
          description: null,
          scope: null,
          status: null
        },
        share: false
      }
    }
  },
  methods: {
    searchProjects () {
      const vm = this
      vm.table.loading = true
      const query = {
        payload: vm.table.filter
      }
      fetchAllProjects(query).then(res => {
        vm.table.data = res.data
        this.table.loading = false
      })
    },
    loadProject (props) {
      if (props.row.status === '0') {
        return
      }
      const vm = this
      fetchProject(props.key).then(res => {
        vm.editProjectDialog = Object.assign(vm.editProjectDialog, {
          state: true,
          share: res.data.scope === '0',
          project: {
            id: res.data.id,
            name: res.data.name,
            description: res.data.description,
            scope: res.data.scope,
            status: res.data.status
          }
        })
      }).catch(err => {
        if (err.status === 10002) {
          vm.$q.notify({
            message: this.$t('response-error-10002'),
            position: 'top',
            color: 'negative'
          })
        } else {
          vm.$q.notify({
            message: err.data.error,
            position: 'top',
            color: 'negative'
          })
        }
      })
    },
    newProject () {
      const vm = this
      vm.editProjectDialog = Object.assign(vm.editProjectDialog, {
        state: true,
        share: false,
        project: {
          id: null,
          name: null,
          description: null,
          scope: null,
          status: null
        }
      })
    },
    saveProject () {
      const vm = this
      vm.editProjectDialog.project.scope = vm.editProjectDialog.share ? '0' : '1'
      saveProject(vm.editProjectDialog.project).then(res => {
        vm.searchProjects()
        vm.editProjectDialog = Object.assign(vm.editProjectDialog, {
          state: false,
          share: false,
          project: {
            id: res.data.id,
            name: res.data.name,
            description: res.data.description,
            scope: res.data.scope,
            status: res.data.status
          }
        })
        vm.$q.notify({
          message: this.$t('response-save-success'),
          position: 'top',
          color: 'teal'
        })
      })
    },
    deleteProject () {
      const vm = this
      this.$q.dialog({
        title: 'Confirm',
        message: this.$t('confirm-delete'),
        cancel: {
          textColor: 'orange',
          outline: true,
          color: ''
        },
        ok: {
          textColor: 'teal',
          outline: true,
          color: ''
        },
        persistent: true
      }).onOk(() => {
        deleteProject(vm.editProjectDialog.project.id).then(res => {
          vm.searchProjects()
          vm.editProjectDialog = Object.assign(vm.editProjectDialog, {
            state: false,
            share: false,
            project: {
              id: null,
              name: null,
              description: null,
              scope: null,
              status: null
            }
          })
        })
      })
    }
  },
  mounted () {
    const vm = this
    vm.searchProjects()
  }
}
</script>
