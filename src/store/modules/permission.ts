import { VuexModule, Module, Mutation, Action, getModule } from 'vuex-module-decorators'
import { RouteConfig } from 'vue-router'
import router, { asyncRoutes, constantRoutes } from '@/router'
import store from '@/store'
import { getMeuns } from '@/api/roles'
import { UserModule } from './user'
import Layout from "@/layout/index.vue";


export const loadView = (view: string) => {
  return (resolve) => require([`@/views/${view}`], resolve)
};

const hasPermission = (roles: string[], route: RouteConfig) => {
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.includes(role))
  } else {
    return true
  }
}

export const filterAsyncRoutes = (routes: RouteConfig[]) => {
  // return routes.filter((route: any) => {
  //   route.meta = JSON.parse(route.meta)
  //   if(0 == route.pid){
  //     console.log('layout lyao')
  //     route.component = Layout
  //   } else {
  //     route.component = loadView(route.component)

  //   }
  //   if (route.child && route.child.length > 0) {
  //     route.children = filterAsyncRoutes(route.child)
  //   }
  //   delete route.child
  //   delete route.pid
  //   return true
  // })
  return routes.filter((route: any) => {
    const { children } = route

    if (0 == route.pid) {
      route.name = route.title
      route.meta = JSON.parse(route.meta)
      route.redirect = route.meta.redirect

      route.component = Layout
    } else {
      route.name = route.title
      route.meta = JSON.parse(route.meta)
      
      route.component = loadView(route.meta.component)
    }

    if (children && children.length > 0) {
      route.children = filterAsyncRoutes(children)
    } else {
      delete route.children
    }
    
    delete route.title
    delete route.pid

    return true
  })
  // const res: RouteConfig[] = []

  // routes.forEach(route => {
  //   const r = { ...route }
  //   if (hasPermission(roles, r)) {
  //     if (r.children) {
  //       r.children = filterAsyncRoutes(r.children)
  //     }
  //     res.push(r)
  //   }
  // })
  // return res
}

export interface IPermissionState {
  routes: RouteConfig[]
  dynamicRoutes: RouteConfig[]
}

@Module({ dynamic: true, store, name: 'permission' })
class Permission extends VuexModule implements IPermissionState {
  public routes: RouteConfig[] = []
  public dynamicRoutes: RouteConfig[] = []

  @Mutation
  private SET_ROUTES(routes: RouteConfig[]) {
    this.routes = constantRoutes.concat(routes)
    this.dynamicRoutes = routes
  }

  @Action
  public async GenerateRoutes(roles: string[]) {
    const res = await getMeuns()
    let accessedRoutes = filterAsyncRoutes(res.list)
    accessedRoutes = asyncRoutes.concat(accessedRoutes)
    router.addRoutes(accessedRoutes)
    this.SET_ROUTES(accessedRoutes)
  }
}

export const PermissionModule = getModule(Permission)
