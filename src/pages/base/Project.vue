<template>
  <div>
    <q-table grid :data="table.data" :loading="table.loading" :columns="table.columns" row-key="id" :filter="table.filter" @request="searchProjects" hide-header
             :no-data-label="$t('table.empty')" :rows-per-page-options="[0]" hide-bottom selection="multiple" :selected.sync="table.selected">
      <template v-slot:top-right>
        <q-input round flat dense v-model="table.filter" placeholder="Search">
          <template v-slot:append>
            <q-icon name="las la-search" color="primary"/>
          </template>
        </q-input>
        <q-btn outline :label="$t('button.create')" color="primary" @click="newProject"/>
        <q-btn v-if="table.selected.length > 0" outline color="accent" :label="$t('button.grant')" @click="openGrant"/>
      </template>
      <template v-slot:item="props">
        <div class="q-pa-xs col-xs-12 col-sm-6 col-md-3 grid-style-transition">
          <q-card>
            <q-separator color="primary" size="2px"/>
            <q-card-section>
              <q-list dense>
                <q-item v-for="col in props.cols" :key="col.name">
                  <q-item-section>
                    <q-item-label caption lines="1" class="text-primary">{{ col.label }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-item-label caption lines="1">{{ col.value }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
            <q-separator color="primary" size="2px"/>
            <q-card-actions align="right" class="q-gutter-sm">
              <q-checkbox dense v-model="props.selected" />
              <q-btn outline dense color="primary" @click="loadProject(props)">{{ $t('button.modify') }}</q-btn>
              <q-btn outline dense color="accent" @click="openGrant(props)" :label="$t('button.grant')"/>
              <q-btn outline dense color="positive" @click="bindMember(props)">{{ $t('button.member') }}</q-btn>
              <q-btn outline dense color="negative" @click="deleteProject(props)">{{ $t('button.delete') }}</q-btn>
              <q-btn outline dense color="warning" @click="quit(props)">{{ $t('button.quit') }}</q-btn>
            </q-card-actions>
          </q-card>
        </div>
      </template>
    </q-table>
    <q-dialog v-model="editProjectDialog.state">
      <q-card style="width: 400px; max-width: 80vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ $t('form.project.default') }}</div>
          <q-space/>
          <q-btn icon="close" flat round dense v-close-popup/>
        </q-card-section>
        <q-form @submit="submitForm">
          <q-card-section class="q-col-gutter-xs">
            <q-input outlined v-model="project.name" :label="$t('form.project.name')" hint="" :rules="[ val => val && val.length > 0 || $t('validation.notEmpty') + $t('form.project.name')]"/>
            <q-input outlined type="textarea" v-model="project.description" :label="$t('form.project.description')" hint=""/>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn type="submit" :label="$t('button.save')" outline color="primary" icon="las la-save"/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
    <q-dialog v-model="addMemberDialog.state">
      <q-card style="width: 550px; max-width: 80vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ $t('form.project.member') }}</div>
          <q-space/>
          <q-btn icon="close" flat round dense v-close-popup/>
        </q-card-section>
        <q-card-section class="q-col-gutter-xs">
          <q-select
            filled
            clearable
            v-model="addMemberDialog.user"
            hide-selected
            use-input
            fill-input
            :label="$t('form.project.select.member')"
            :options="addMemberDialog.memberOption"
            option-label="name"
            @filter="filterManager"
            @input="addMember"
          >
          </q-select>
          <q-table
            :data="members"
            :columns="memberColumns"
            row-key="id"
          >
          <template v-slot:body="props">
            <tr :props="props">
              <q-td key="name" :props="props" class="q-gutter-sm">{{ props.row.name }}</q-td>
              <q-td key="email" :props="props" class="q-gutter-sm">{{ props.row.email }}</q-td>
              <q-td key="rw" :props="props" class="q-gutter-sm">
                <q-radio dense v-model="props.row.rw" val="R" :label="$t('form.privilege.r')"/>
                <q-radio dense v-model="props.row.rw" val="RW" :label="$t('form.privilege.rw')"/>
              </q-td>
              <q-td key="action" :props="props" class="q-gutter-sm">
                <a href="javascript:;" style="text-decoration: none; color: orange;" @click="members.splice(props.rowIndex, 1)">{{ $t('button.delete') }}</a>
              </q-td>
            </tr>
          </template>
          </q-table>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn :label="$t('button.grant')" outline color="primary" icon="las la-save" @click="grant"/>
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="viewMembertDialog.state">
      <q-card style="width: 500px; max-width: 80vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ $t('form.project.member') }}</div>
          <q-space/>
          <q-btn icon="close" flat round dense v-close-popup/>
        </q-card-section>
        <q-card-section class="q-col-gutter-xs">
          <q-table
            :data="members"
            :columns="memberColumns"
            row-key="id"
            hide-bottom
          >
          <template #body-cell-action="props">
            <q-td :props="props" color="primary" class="q-gutter-sm">
              <a v-if="props.row.rw==='RW'" href="javascript:;" @click="assignManager(props)" style="text-decoration: none; color: teal;">{{ $t('button.assignManager') }}</a>
              <a href="javascript:;" @click="deleteMember(props)" style="text-decoration: none; color: orange;">{{ $t('button.delete') }}</a>
            </q-td>
          </template>
          </q-table>
        </q-card-section>
      </q-card>
    </q-dialog>
    <q-dialog v-model="successDialog.state" position="top">
      <q-card>
        <q-linear-progress :value="0.6" color="pink" />
        <q-card-section class="row items-center no-wrap">
          <div>
            <span class="text-weight-bold">{{ $t('response.success.save') }}</span>,<a href="javascript:;" class="text-primary" @click="goProject" style="text-decoration: none;">{{ $t('message.confirm.route', [$t('menu.basic.datasource')]) }}</a>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>
<script>
import {
  deleteProject,
  fetchProjects,
  fetchProject,
  saveProject,
  transferProject,
  quitProject
} from 'src/service/base/ProjectService'
import {fetchUsers} from 'src/service/auth/UserService'
import {grantByResource, fetchGrantUsersByResource, deleteGrantUsers} from 'src/service/auth/PrivilegeService'
export default {
  name: 'Project',
  data () {
    return {
      table: {
        filter: null,
        loading: false,
        data: [],
        columns: [
          {
            name: 'name',
            label: this.$t('table.project.name'),
            field: 'name',
            align: 'left'
          },
          {
            name: 'manager',
            label: this.$t('table.project.manager'),
            field: 'manager',
            align: 'left'
          },
          {
            name: 'description',
            label: this.$t('table.project.description'),
            field: 'description',
            align: 'left'
          }
        ],
        selected: []
      },
      editProjectDialog: {
        state: false
      },
      addMemberDialog: {
        state: false,
        user: null,
        memberOption: []
      },
      viewMembertDialog: {
        state: false,
      },
      project: {
        id: null,
        name: null,
        description: null,
        userId: null
      },
      successDialog: {
        state: false,
        targetUrl: null
      },
      members: [],
      memberColumns: [
        {
          name: 'name',
          label: this.$t('table.user.name'),
          field: 'name',
          align: 'left'
        },
        {
          name: 'email',
          label: this.$t('table.user.email'),
          field: 'email',
          align: 'left'
        },
        {
          name: 'rw',
          label: this.$t('table.privilege.category'),
          field: 'rw',
          align: 'left'
        },
        {
          name: 'action',
          label: this.$t('table.privilege.action')
        }
      ]
    }
  },
  methods: {
    searchProjects () {
      this.table.loading = true
      const query = {
        payload: this.table.filter
      }
      fetchProjects(query).then(res => {
        this.table.data = res.data
        this.table.loading = false
      })
    },
    loadProject (props) {
      fetchProject(props.key).then(res => {
        this.editProjectDialog.state = true
        this.project = res.data
      })
    },
    bindMember (props) {
      this.viewMembertDialog.state = true
      this.members = []
      this.project.id=props.key
      this.fetchProjectMembers(props.key)
    },
    newProject () {
      this.editProjectDialog.state = true
      Object.assign(this.project, this.$options.data.call(this).project)
    },
    openGrant (props) {
      if (props) {
        this.table.selected = [props.row]
      } else {
        this.table.selected = []  
      }
      this.addMemberDialog.state = true
      this.addMemberDialog.user = null
      this.members = []
    },
    submitForm () {
      saveProject(this.project).then(res => {
        this.searchProjects()
        this.editProjectDialog.state = false
        Object.assign(this.project, this.$options.data.call(this).project)
        this.successDialog = {
          state: true,
          targetUrl: '/basic-datasource?projectId=' + res.data.id
        }
      })
    },
    grant () {
      const grantArray = []
      const userPrivileges = []
      this.members.forEach(item => {
        userPrivileges.push({
          userId: item.id,
          rw: item.rw
        })
      })
      this.table.selected.forEach(item => {
        grantArray.push({
          resourceCode: item.id + '',
          resourceCategory: 'PROJECT',
          resourceLevel: '2',
          userPrivileges: userPrivileges
        })
      })
      grantByResource(grantArray).then(res => {
        this.members=[]
        this.addMemberDialog.state = false
        this.$q.notify({
          message: this.$t('response.success.grant'),
          position: 'top',
          color: 'teal'
        })
      })
    },
    deleteProject (props) {
      this.$q.dialog({
        title: this.$t('message.confirm.default'),
        message: this.$t('message.confirm.delete'),
        cancel: {
          textColor: 'primary',
          outline: true
        },
        ok: {
          textColor: 'negative',
          outline: true
        },
        persistent: true
      }).onOk(() => {
        deleteProject(props.key).then(() => {
          this.searchProjects()
          this.$q.notify({
            message: this.$t('response.success.delete'),
            position: 'top',
            color: 'teal'
          })
        })
      })
    },
    quit (props) {
      this.$q.dialog({
        title: this.$t('message.confirm.default'),
        message: this.$t('message.confirm.quit'),
        cancel: {
          textColor: 'primary',
          outline: true
        },
        ok: {
          textColor: 'negative',
          outline: true
        },
        persistent: true
      }).onOk(() => {
        quitProject(props.key).then(() => {
          this.searchProjects()
          this.$q.notify({
            message: this.$t('response.success.delete'),
            position: 'top',
            color: 'teal'
          })
        })
      })
    },
    filterManager (val, update) {
      update(() => {
        const needle = val.toLowerCase()
        fetchUsers({
          payload: needle,
          pageNo: 1,
          pageSize: 10
          }).then((res) => {
            this.addMemberDialog.memberOption = res.data.items
        })
      })
    },
    addMember (value) {
      if (value) {
        value = Object.assign(value, {
          rw: 'R'
        })
        if (this.members.map(item => item.id).indexOf(value.id) < 0) {
          this.members.push(value)
        }
      }
    },
    assignManager (props) {
      transferProject(this.project.id, props.key).then(() => {
        this.searchProjects()
        this.$q.notify({
          message: this.$t('response.success.transfer'),
          position: 'top',
          color: 'teal'
        })
        this.viewMemberDialog.state = false
      })
    },
    deleteMember (props) {
      this.$q.dialog({
        title: this.$t('message.confirm.default'),
        message: this.$t('message.confirm.delete'),
        cancel: {
          textColor: 'primary',
          outline: true
        },
        ok: {
          textColor: 'negative',
          outline: true
        },
        persistent: true
      }).onOk(() => {
        const userId = props.key.split('-')[0]
        const rw = props.key.split('-')[1]
        deleteGrantUsers('PROJECT', '2', this.project.id, userId, rw).then(() => {
          this.fetchProjectMembers(this.project.id)
          this.$q.notify({
            message: this.$t('response.success.delete'),
            position: 'top',
            color: 'teal'
          })
        })
      })
    },
    fetchProjectMembers (id) {
      fetchGrantUsersByResource('PROJECT', '2', id).then(res => {
        this.members = res.data.map(item => {
          return {
            id: item.id + '-' + item.rw,
            name: item.name,
            email: item.email,
            rw: item.rw
          }
        })
      })
    },
    goProject () {
      this.$emit('addRouteTab', {to: '/basic-datasource', url: this.successDialog.targetUrl})
      this.$router.push({path: this.successDialog.targetUrl})
    },
  },
  mounted () {
    this.searchProjects()
  }
}
</script>
