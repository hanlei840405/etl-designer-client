<template>
  <div>
    <q-table grid :data="table.data" :loading="table.loading" :columns="table.columns" row-key="id" hide-header
             no-data-label="无数据" :rows-per-page-options="[0]" hide-bottom>
      <template v-slot:top-left>
        <q-select
          v-model="table.project"
          outlined
          dense
          label="选择工作区信息"
          :options="table.projectsCopy"
          option-value="id"
          option-label="name"
          use-input
          clearable
          label-color="cyan-8"
          color="cyan-8"
          @input="selectedProject"
          @filter="filterProject"
        >
          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
              <q-item-section>
                <q-item-label>{{ scope.opt.name }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-badge :color="scope.opt.status === '1' ? 'teal' : 'grey-5'" :label="scope.opt.status === '1' ? '有效' : '无效'" />
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </template>
      <template v-if="table.project && table.project.status === '1'" v-slot:top-right>
        <q-btn text-color="cyan-8" outline label="新建" @click="newMember"/>
      </template>
      <template v-slot:item="props">
        <div
          class="q-pa-xs col-xs-12 col-sm-4 col-md-3 col-lg-2 grid-style-transition"
        >
          <q-card :class="[props.row.status === '1' ? '' : 'bg-grey-5']" @click="deleteMember(props)">
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
    <q-dialog v-model="editMemberDialog.state" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">添加成员</div>
          <q-space/>
          <q-btn icon="close" flat round dense v-close-popup/>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-select
            v-model="editMemberDialog.userId"
            filled
            label="选择用户信息"
            emit-value
            map-options
            :options="editMemberDialog.users"
            option-value="id"
            option-label="name"
            label-color="cyan-8"
            color="cyan-8"
          >
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                <q-item-section>
                  <q-item-label>{{ scope.opt.name }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-badge :label="scope.opt.name" color="cyan-8"/>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn label="保存" outline text-color="cyan-8" @click="saveMember"/>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { deleteMember, fetchAllProjects, fetchMembers, saveMember } from 'src/service/ProjectService'
import { fetchAllUsers } from 'src/service/AuthService'

export default {
  data () {
    return {
      table: {
        project: null,
        loading: false,
        projects: [],
        projectsCopy: [],
        data: [],
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
      editMemberDialog: {
        state: false,
        title: '编辑',
        users: [],
        userId: null,
        projectId: null
      }
    }
  },
  methods: {
    searchProjects () {
      const vm = this
      fetchAllProjects({}).then(res => {
        vm.table.projects = res.data
      })
    },
    selectedProject (val) {
      const vm = this
      if (val) {
        fetchMembers(val.id).then(res => {
          vm.table.data = res.data
        })
      } else {
        vm.table.data = []
      }
    },
    filterProject (val, update) {
      if (val === '') {
        update(() => {
          this.table.projectsCopy = this.table.projects
        })
        return
      }
      update(() => {
        const needle = val.toLowerCase()
        this.table.projectsCopy = this.table.projects.filter(v => v.name.toLowerCase().indexOf(needle) > -1)
      })
    },
    deleteMember (props) {
      const vm = this
      this.$q.dialog({
        title: 'Confirm',
        message: '确定删除成员?',
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
        deleteMember(vm.table.project.id, props.key).then(res => {
          fetchMembers(vm.table.project.id).then(res => {
            vm.table.data = res.data
          })
        })
      })
    },
    newMember () {
      this.editMemberDialog = Object.assign(this.editMemberDialog, {
        state: true,
        title: '编辑',
        userId: null,
        projectId: null
      })
    },
    saveMember () {
      const vm = this
      saveMember(vm.table.project.id, vm.editMemberDialog.userId).then(res => {
        fetchMembers(vm.table.project.id).then(res => {
          vm.table.data = res.data
          vm.editMemberDialog.state = false
        })
      })
    }
  },
  mounted () {
    const vm = this
    vm.searchProjects()
    fetchAllUsers({
      pageNo: 1,
      pageSize: 10000
    }).then(res => {
      vm.editMemberDialog.users = res.data.items
    })
  }
}
</script>
