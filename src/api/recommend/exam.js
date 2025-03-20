import request from '@/utils/request'

// 查询考研历年具体分数信息列表
export function listExam(query) {
  return request({
    url: '/recommend/exam/list',
    method: 'get',
    params: query
  })
}

// 查询考研历年具体分数信息详细
export function getExam(lineId) {
  return request({
    url: '/recommend/exam/' + lineId,
    method: 'get'
  })
}

// 新增考研历年具体分数信息
export function addExam(data) {
  return request({
    url: '/recommend/exam',
    method: 'post',
    data: data
  })
}

// 修改考研历年具体分数信息
export function updateExam(data) {
  return request({
    url: '/recommend/exam',
    method: 'put',
    data: data
  })
}

// 删除考研历年具体分数信息
export function delExam(lineId) {
  return request({
    url: '/recommend/exam/' + lineId,
    method: 'delete'
  })
}
