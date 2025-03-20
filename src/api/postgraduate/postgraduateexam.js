import request from '@/utils/request'

// 查询考研历年具体分数信息列表
export function listPostgraduateexam(query) {
  return request({
    url: '/postgraduate/postgraduateexam/list',
    method: 'get',
    params: query
  })
}

// 查询考研历年具体分数信息详细
export function getPostgraduateexam(lineId) {
  return request({
    url: '/postgraduate/postgraduateexam/' + lineId,
    method: 'get'
  })
}

// 新增考研历年具体分数信息
export function addPostgraduateexam(data) {
  return request({
    url: '/postgraduate/postgraduateexam',
    method: 'post',
    data: data
  })
}

// 修改考研历年具体分数信息
export function updatePostgraduateexam(data) {
  return request({
    url: '/postgraduate/postgraduateexam',
    method: 'put',
    data: data
  })
}

// 删除考研历年具体分数信息
export function delPostgraduateexam(lineId) {
  return request({
    url: '/postgraduate/postgraduateexam/' + lineId,
    method: 'delete'
  })
}
