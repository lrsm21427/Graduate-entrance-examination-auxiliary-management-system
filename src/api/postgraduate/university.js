import request from '@/utils/request'

// 查询大学信息列表
export function listUniversity(query) {
  return request({
    url: '/postgraduate/university/list',
    method: 'get',
    params: query
  })
}

// 查询大学信息详细
export function getUniversity(schoolId) {
  return request({
    url: '/postgraduate/university/' + schoolId,
    method: 'get'
  })
}

// 新增大学信息
export function addUniversity(data) {
  return request({
    url: '/postgraduate/university',
    method: 'post',
    data: data
  })
}

// 修改大学信息
export function updateUniversity(data) {
  return request({
    url: '/postgraduate/university',
    method: 'put',
    data: data
  })
}

// 删除大学信息
export function delUniversity(schoolId) {
  return request({
    url: '/postgraduate/university/' + schoolId,
    method: 'delete'
  })
}
