import request from '@/utils/request'

// 查询考研分数信息列表
export function listProfessional(query) {
  return request({
    url: '/recommend/professional/list',
    method: 'get',
    params: query
  })
}

// 查询考研分数信息详细
export function getProfessional(lineId) {
  return request({
    url: '/recommend/professional/' + lineId,
    method: 'get'
  })
}

// 新增考研分数信息
export function addProfessional(data) {
  return request({
    url: '/recommend/professional',
    method: 'post',
    data: data
  })
}

// 修改考研分数信息
export function updateProfessional(data) {
  return request({
    url: '/recommend/professional',
    method: 'put',
    data: data
  })
}

// 删除考研分数信息
export function delProfessional(lineId) {
  return request({
    url: '/recommend/professional/' + lineId,
    method: 'delete'
  })
}
