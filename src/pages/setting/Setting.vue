<template>
  <div>
    <q-table grid :pagination.sync="table.pagination" :data="table.data" :loading="table.loading"
             :columns="table.columns" row-key="id" :filter="table.filter" @request="searchUsers" hide-header>
      <template v-slot:top-right>
        <q-input borderless dense debounce="300" v-model="table.filter" placeholder="Search">
          <template v-slot:append>
            <q-icon name="search"/>
            <q-btn outline text-color="cyan-8" label="新建" @click="newUser"/>
          </template>
        </q-input>
      </template>
      <template v-slot:item="props">
        <div
          class="q-pa-xs col-xs-12 col-sm-4 col-md-3 col-lg-2 grid-style-transition"
        >
          <q-separator color="cyan-8" size="2px"/>
          <q-card :class="[props.row.status === '1' ? '' : 'bg-grey-5']" @click="loadUser(props)">
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
    <q-dialog v-model="editUserDialog.state" :position="editUserDialog.position" full-height>
      <q-card style="width: 100vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ editUserDialog.title }}</div>
          <q-space/>
          <q-btn icon="close" flat round dense v-close-popup/>
        </q-card-section>
        <q-separator/>
        <q-tabs
          v-model="editUserDialog.tab"
          dense class="text-grey"
          active-color="cyan-8"
          indicator-color="cyan-8"
          align="left"
          narrow-indicator
        >
          <q-tab name="basic" label="基础信息"/>
          <q-tab name="privilege" label="权限授予" :disable="editUserDialog.tabDisable"/>
        </q-tabs>
        <q-tab-panels v-model="editUserDialog.tab" animated>
          <q-tab-panel name="basic">
            <div class="text-h6">基础信息</div>
            <q-card-section>
              <q-form @submit="saveUser" class="q-gutter-md">
                <q-input
                  outlined
                  color="cyan-8"
                  v-model="editUserDialog.user.name"
                  label="姓名 *"
                  hint="姓名"
                  lazy-rules
                  :rules="[ val => val && val.length > 0 || 'Please type something']"
                />
                <q-input
                  outlined
                  color="cyan-8"
                  v-model="editUserDialog.user.email"
                  label="邮箱 *"
                  hint="邮箱"
                  lazy-rules
                  :rules="[ val => val && val.length > 0 || 'Please type something']"
                />
                <div>
                </div>
              </q-form>
            </q-card-section>
            <q-card-actions align="right">
              <q-btn label="保存" outline text-color="cyan-8" @click="saveUser"/>
              <q-btn label="删除" outline text-color="negative" @click="deleteUser"/>
            </q-card-actions>
          </q-tab-panel>

          <q-tab-panel name="privilege">
            <div class="text-h6">权限授予</div>
            <q-card-section>
              <template v-for="(v, k) in editUserDialog.resources">
                <q-chip :key="k">
                  <q-avatar icon="bookmark" color="orange" text-color="white" />
                  {{k}}
                </q-chip>
                <br :key="k"/>
                <q-checkbox v-for="resource in v" color="cyan-8" :key="resource.id" :val="resource.id"
                            :label="resource.name" v-model="editUserDialog.grantedResources"/>
                <br :key="k"/>
              </template>
            </q-card-section>
            <q-card-actions align="right">
              <q-btn label="授权" outline text-color="cyan-8" @click="grant"/>
            </q-card-actions>
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import {
  deleteUser,
  fetchAllPrivileges,
  fetchAllUsers,
  fetchGrantedPrivileges,
  fetchUser,
  grantPrivileges,
  saveUser
} from 'src/service/AuthService'

export default {
  data () {
    return {
      table: {
        filter: null,
        loading: false,
        data: [],
        pagination: {
          page: 1,
          rowsNumber: 0,
          rowsPerPage: 20
        },
        columns: [
          {
            name: 'name',
            label: '姓名',
            field: 'name',
            align: 'left'
          },
          {
            name: 'email',
            label: '邮箱',
            field: 'email',
            align: 'left'
          },
          {
            name: 'status',
            label: '状态',
            field: 'status',
            align: 'left',
            format: (val, row) => {
              return val === '1' ? '有效' : '无效'
            }
          }
        ]
      },
      editUserDialog: {
        state: false,
        position: 'right',
        title: '编辑',
        tab: 'basic',
        tabDisable: true,
        user: {
          id: null,
          name: null,
          email: null,
          status: null
        },
        resources: {},
        grantedResources: []
      }
    }
  },
  methods: {
    searchUsers (props) {
      const vm = this
      vm.table.loading = true
      vm.table.pagination = props.pagination
      const query = {
        payload: vm.table.filter,
        pageNo: props.pagination.page,
        pageSize: props.pagination.rowsPerPage
      }
      fetchAllUsers(query).then(res => {
        vm.table.data = res.data.items
        vm.table.pagination.rowsNumber = res.data.total
        this.table.loading = false
      })
    },
    loadUser (props) {
      const vm = this
      fetchUser(props.key).then(res => {
        vm.editUserDialog = Object.assign(vm.editUserDialog, {
          state: true,
          tab: 'basic',
          user: {
            id: res.data.id,
            name: res.data.name,
            email: res.data.email,
            status: res.data.status
          },
          tabDisable: false
        })
      })
      fetchGrantedPrivileges(props.key).then(res => {
        vm.editUserDialog.grantedResources = []
        res.data.forEach(item => {
          vm.editUserDialog.grantedResources.push(item.privilege.resource.id)
        })
      })
    },
    newUser () {
      const vm = this
      vm.editUserDialog = Object.assign(vm.editUserDialog, {
        state: true,
        tab: 'basic',
        user: {
          id: null,
          name: null,
          email: null,
          status: null
        },
        tabDisable: true,
        grantedResources: []
      })
    },
    saveUser () {
      const vm = this
      saveUser(vm.editUserDialog.user).then(res => {
        vm.searchUsers({
          pagination: vm.table.pagination,
          filter: vm.table.filter
        })
        vm.editUserDialog = Object.assign(vm.editUserDialog, {
          user: {
            id: res.data.id,
            name: res.data.name,
            email: res.data.email,
            status: res.data.status
          },
          tabDisable: false
        })
        vm.$q.notify({
          message: '保存成功!',
          position: 'top',
          color: 'teal'
        })
      }).catch(err => {
        if (err.status === 10006) {
          vm.$q.notify({
            position: 'top',
            message: '该邮箱已存在',
            color: 'negative'
          })
        } else {
          vm.$q.notify({
            position: 'top',
            message: err.data.error,
            color: 'negative'
          })
        }
      })
    },
    deleteUser () {
      const vm = this
      this.$q.dialog({
        title: 'Confirm',
        message: '确定删除用户?',
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
        deleteUser(vm.editUserDialog.user.id).then(res => {
          vm.searchUsers({
            pagination: vm.table.pagination,
            filter: vm.table.filter
          })
          vm.editUserDialog = Object.assign(vm.editUserDialog, {
            state: false,
            tab: 'basic',
            user: {
              id: null,
              name: null,
              email: null,
              status: null
            },
            tabDisable: true,
            grantedResources: []
          })
        }).catch(err => {
          this.$q.notify({
            message: err.data.error,
            position: 'top',
            color: 'negative'
          })
        })
      })
    },
    grant () {
      const vm = this
      grantPrivileges({
        username: vm.editUserDialog.user.email,
        resources: vm.editUserDialog.grantedResources
      }).then(res => {
        vm.$q.notify({
          message: '授权成功!',
          position: 'top',
          color: 'teal'
        })
      })
    }
  },
  mounted () {
    const vm = this
    this.searchUsers({
      pagination: vm.table.pagination
    })
    fetchAllPrivileges().then(res => {
      vm.editUserDialog.resources = res.data
    })
  }
}
</script>
