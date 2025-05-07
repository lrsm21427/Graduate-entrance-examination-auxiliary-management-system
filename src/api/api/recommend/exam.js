import request from '@/utils/request'

// 查询考研历年具体分数信息列表（带范围查询）
export function listExamAry(query) {
  const params = {
    ...query,
    // 如果传入了scoreMin，则自动计算scoreMax
    ...(query.scoreMin && {
      scoreTotal: Number(query.scoreMin),
      scoreMax: Number(query.scoreMin) + (Number(query.scoreRange) || 20)
    })
  }
  // 移除前端专用参数
  delete params.scoreMin;
  delete params.scoreRange;
  return request({
    url: '/recommend/exam/listAry',
    method: 'get',
    params: params
  })
}

// 查询考研历年具体分数信息列表
export function listExam(query) {
  // 处理分数范围查询参数
  const params = {
    ...query,
    // 如果传入了scoreMin，则自动计算scoreMax
    ...(query.scoreMin && {
      scoreTotal: Number(query.scoreMin),
      scoreMax: Number(query.scoreMin) + (Number(query.scoreRange) || 20)
    })
  }
  return request({
    url: '/recommend/exam/list',
    method: 'get',
    params: params
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
