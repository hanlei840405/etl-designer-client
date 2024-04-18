
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
      }
    ]
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
