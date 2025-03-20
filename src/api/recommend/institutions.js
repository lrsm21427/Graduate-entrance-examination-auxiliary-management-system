import request from '@/utils/request'

// 查询大学推荐列表
export function listInstitutions(query) {
  return request({
    url: '/recommend/institutions/list',
    method: 'get',
    params: query
  })
}

// 查询大学推荐详细
export function getInstitutions(schoolId) {
  return request({
    url: '/recommend/institutions/' + schoolId,
    method: 'get'
  })
}

// 新增大学推荐
export function addInstitutions(data) {
  return request({
    url: '/recommend/institutions',
    method: 'post',
    data: data
  })
}

// 修改大学推荐
export function updateInstitutions(data) {
  return request({
    url: '/recommend/institutions',
    method: 'put',
    data: data
  })
}

// 删除大学推荐
export function delInstitutions(schoolId) {
  return request({
    url: '/recommend/institutions/' + schoolId,
    method: 'delete'
  })
}
