import request from '@/utils/request'


//    http://localhost/dev-api/postgraduate/postgraduateexam/areaTree
//    用于绘制地区树
//    返回数据格式为{"中国":[{"东北":["黑龙江","吉林","辽宁"]},{"华北":["北京","天津","山西","河北","内蒙古"]},
//    {"西北":["陕西","甘肃","青海","宁夏","新疆"]},{"华东":["上海","江苏","浙江","安徽","福建","江西","山东","台湾"]},
//    {"西南":["四川","贵州","云南","重庆","西藏"]},{"华南":["广东","广西","海南","香港","澳门"]},
//    {"华中":["河南","湖北","湖南"]}]}}
export function areaTree() {
    return request({
      url: '/postgraduate/postgraduateexam/areaTree',
      method: 'get',
    })
  }


//    http://localhost/dev-api/postgraduate/postgraduateexam/areaTreeScore/华北&华东
//    areaTreeScore/+地区,多个地区则用&连接
//    返回数据格式[{"华北":{"北京":{"首都经济贸易大学":[247,36,41,47,47,211]}},
//              {"华东":{"山东":{"山东财经大学":[328,47,49,66,66,66]}}}]
//    数组内共五个值，用于热力图绘制，分别代表总分，英语，政治，专业课1，专业课2和该学校专业数量
export function areaTreeScore(allArea) {
    return request({
      url: '/postgraduate/postgraduateexam/areaTreeScore/'+allArea,
      method: 'get',
    })
  }

//    http://localhost/dev-api/postgraduate/postgraduateexam/AreaYearScore/东北
//    areaTreeScore/+地区，只能单个地区
//    返回数据格式data":[{"黑龙江":{"2020":{"哈尔滨工业大学":[327,51,48,83,80,220],"东北农业大学":[270,36,35,55,52,67]},
//                              "2021":{...},"2022":{...}},
//                      "辽宁":{"2020":{...},"2021":{...},"2022":{...}}}]
//    数组内共五个值，分别代表总分，英语，政治，专业课1，专业课2和该学校专业数量
export function AreaYearScore(allArea) {
    return request({
      url: '/postgraduate/postgraduateexam/AreaYearScore/'+allArea,
      method: 'get',
    })
  }

//    http://localhost/dev-api/postgraduate/postgraduateexam/AreaYearScoreOverview/东北
//    areaTreeScore/+地区，只能单个地区
//    返回数据格式"data":[{"黑龙江":{"2020":[272,39,37,62,59,525],"2021":[302,51,45,63,61,145],
//    "2022":[305,43,43,68,59,450],"2023":[300,41,43,73,49,1754]}},{"吉林":{"2020":[316,47,46,102,51,684],
//    "2021":[319,48,48,103,63,272],"2022":[309,44,44,92,58,598],"2023":[299,41,42,75,49,1989]}},
//    {"辽宁":{"2020":[314,45,43,75,69,473],"2021":[308,45,45,74,71,188],"2022":[302,44,45,71,56,637],
//    "2023":[291,40,41,68,50,2323]}}]
//    数组内共五个值，分别代表总分，英语，政治，专业课1，专业课2和该学校专业数量
export function AreaYearScoreOverview(allArea) {
  return request({
    url: '/postgraduate/postgraduateexam/AreaYearScoreOverview/'+allArea,
    method: 'get',
  })
}



//  调用python聚类
//  传入参数为要参与聚类的属性，如果有多个请用&分隔
//  http://localhost/dev-api/postgraduate/postgraduateexam/cluster/985&211
export function cluster(attrs) {
    return request({
      url: '/postgraduate/postgraduateexam/cluster/'+attrs,
      method: 'get',
    })
  }


export function ProvinceYearScore(allArea) {
  return request({
    url: '/postgraduate/postgraduateexam/ProvinceYearScore/'+allArea,
    method: 'get',
  })
}
