import request from '@/utils/request'
import { IAuthRuleData, IRulePid } from './types'

export const defaultRuleMeta = {
  icon: '',
  title: '',
  component: '/404'
}

export const defaultAuthRule: IAuthRuleData = {
  meta: defaultRuleMeta,
  path: '',
  pid: 0,
  title: '',
  sort: 0,
  status: 1,
  type: 'router'
}

export const defaultRulePid: IRulePid = {
  id: 0,
  title: '顶级'
}

export const getAuthRules = () =>
  request({
    url: '/admin/rule',
    method: 'get'
  })
export const getRuleSelect = () =>
  request({
    url: '/admin/rule/select',
    method: 'get'
  })
export const addRule = (rule: IAuthRuleData) =>
  request({
    url: '/admin/rule',
    method: 'post',
    data: rule
  })
export const updateRule = (rule: IAuthRuleData) =>
  request({
    url: '/admin/rule',
    method: 'put',
    data: rule
  })
export const deleteRules = (ids: number[]) =>
  request({
    url: '/admin/rule',
    method: 'delete',
    data: { ids }
  })
