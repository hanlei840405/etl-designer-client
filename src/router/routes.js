
const routes = [
  {
    path: '',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '/',
        component: () => import('pages/Index.vue'),
        meta: {
          authorities: ['HOME', 'ROOT']
        }
      },
      {
        path: '/basic-project',
        component: () => import('pages/base/Project.vue'),
        meta: {
          authorities: ['PROJECT', 'ROOT']
        }
      },
      {
        path: '/basic-datasource',
        component: () => import('pages/base/Datasource.vue'),
        meta: {
          authorities: ['DATASOURCE', 'ROOT']
        }
      },
      {
        path: '/basic-ftp',
        component: () => import('pages/base/Ftp.vue'),
        meta: {
          authorities: ['FTP', 'ROOT']
        }
      },
      {
        path: '/basic-dictionary',
        component: () => import('pages/base/Dictionary.vue'),
        meta: {
          authorities: ['ROOT']
        }
      },
      {
        path: '/auth-application',
        component: () => import('pages/auth/Application.vue'),
        meta: {
        }
      },
      {
        path: '/auth-privilege',
        component: () => import('pages/auth/Privilege.vue'),
        meta: {
          authorities: ['PRIVILEGE', 'ROOT']
        }
      },
      {
        path: '/auth-user',
        component: () => import('pages/auth/User.vue'),
        meta: {
          authorities: ['USER', 'ROOT']
        }
      },
      {
        path: '/etl-design',
        component: () => import('pages/etl/Design.vue'),
        meta: {
          authorities: ['ETL', 'ROOT']
        }
      },
      {
        path: '/etl-deploy',
        component: () => import('pages/etl/Deploy.vue'),
        meta: {
          authorities: ['ETL', 'ROOT']
        }
      },
      {
        path: '/task-batch',
        component: () => import('pages/task/Batch.vue'),
        meta: {
          authorities: ['TASK', 'ROOT']
        }
      },
      {
        path: '/task-streaming',
        component: () => import('pages/task/Streaming.vue'),
        meta: {
          authorities: ['TASK', 'ROOT']
        }
      },
      {
        path: '/running-process',
        component: () => import('pages/task/RuningProcess.vue'),
        meta: {
          authorities: ['TASK', 'ROOT']
        }
      },
      {
        path: '/bi-chart',
        meta: {
          authorities: ['CHART', 'ROOT']
        },
        component: () => import('pages/bi/Chart.vue')
      },
      {
        path: '/bi-model',
        meta: {
          authorities: ['MODEL', 'ROOT']
        },
        component: () => import('pages/bi/Model.vue')
      },
      {
        path: '/bi-report',
        meta: {
          authorities: ['REPORT', 'ROOT']
        },
        component: () => import('pages/bi/Report.vue')
      },
      {
        path: '/bi-layout',
        meta: {
          authorities: ['LAYOUT', 'ROOT']
        },
        component: () => import('pages/bi/Layout.vue')
      },
    ]
  },
  {
    path: '/dashboard/:id',
    component: () => import('pages/bi/Dashboard.vue')
  },
  {
    path: '/login',
    component: () => import('pages/Login.vue')
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
