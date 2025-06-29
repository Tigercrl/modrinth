import { createRouter, createWebHistory } from 'vue-router'
import * as Pages from '@/pages'
import * as Project from '@/pages/project'
import * as Instance from '@/pages/instance'
import * as Library from '@/pages/library'

/**
 * Configures application routing. Add page to pages/index and then add to route table here.
 */
export default new createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: '主页',
      component: Pages.Index,
      meta: {
        breadcrumb: [{ name: '主页' }],
      },
    },
    {
      path: '/worlds',
      name: '世界',
      component: Pages.Worlds,
      meta: {
        breadcrumb: [{ name: '世界' }],
      },
    },
    {
      path: '/browse/:projectType',
      name: '探索资源',
      component: Pages.Browse,
      meta: {
        breadcrumb: [{ name: '探索资源' }],
      },
    },
    {
      path: '/library',
      name: '实例管理',
      component: Library.Index,
      meta: {
        breadcrumb: [{ name: '实例管理' }],
      },
      children: [
        {
          path: '',
          name: '实例管理概览',
          component: Library.Overview,
        },
        {
          path: 'downloaded',
          name: '实例管理已下载',
          component: Library.Downloaded,
        },
        {
          path: 'custom',
          name: '实例管理自定义',
          component: Library.Custom,
        },
      ],
    },
    {
      path: '/project/:id',
      name: '资源',
      component: Project.Index,
      props: true,
      children: [
        {
          path: '',
          name: '资源简介',
          component: Project.Description,
          meta: {
            useContext: true,
            breadcrumb: [{ name: '?Project' }],
          },
        },
        {
          path: 'versions',
          name: '资源版本列表',
          component: Project.Versions,
          meta: {
            useContext: true,
            breadcrumb: [{ name: '?Project', link: '/project/{id}/' }, { name: '版本列表' }],
          },
        },
        {
          path: 'version/:version',
          name: '资源版本',
          component: Project.Version,
          props: true,
          meta: {
            useContext: true,
            breadcrumb: [
              { name: '?Project', link: '/project/{id}/' },
              { name: '版本列表', link: '/project/{id}/versions' },
              { name: '?Version' },
            ],
          },
        },
        {
          path: 'gallery',
          name: '资源画廊',
          component: Project.Gallery,
          meta: {
            useContext: true,
            breadcrumb: [{ name: '?Project', link: '/project/{id}/' }, { name: '画廊' }],
          },
        },
      ],
    },
    {
      path: '/instance/:id',
      name: '实例',
      component: Instance.Index,
      props: true,
      children: [
        // {
        //   path: '',
        //   name: 'Overview',
        //   component: Instance.Overview,
        //   meta: {
        //     useRootContext: true,
        //     breadcrumb: [{ name: '?Instance' }],
        //   },
        // },
        {
          path: 'worlds',
          name: '实例世界',
          component: Instance.Worlds,
          meta: {
            useRootContext: true,
            breadcrumb: [{ name: '?Instance', link: '/instance/{id}/' }, { name: '世界' }],
          },
        },
        {
          path: '',
          name: '实例资源',
          component: Instance.Mods,
          meta: {
            useRootContext: true,
            breadcrumb: [{ name: '?Instance', link: '/instance/{id}/' }, { name: '资源' }],
          },
        },
        {
          path: 'projects/:type',
          name: '实例资源筛选',
          component: Instance.Mods,
          meta: {
            useRootContext: true,
            breadcrumb: [{ name: '?Instance', link: '/instance/{id}/' }, { name: '资源' }],
          },
        },
        {
          path: 'logs',
          name: '实例日志',
          component: Instance.Logs,
          meta: {
            useRootContext: true,
            breadcrumb: [{ name: '?Instance', link: '/instance/{id}/' }, { name: '日志' }],
          },
        },
      ],
    },
  ],
  linkActiveClass: 'router-link-active',
  linkExactActiveClass: 'router-link-exact-active',
  scrollBehavior() {
    // Sometimes Vue's scroll behavior is not working as expected, so we need to manually scroll to top (especially on Linux)
    document.querySelector('.app-viewport')?.scrollTo(0, 0)
    return {
      el: '.app-viewport',
      top: 0,
    }
  },
})
