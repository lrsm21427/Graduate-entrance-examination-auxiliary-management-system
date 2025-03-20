import request from '@/utils/request'

// 查询专业,模糊查询
//包含输入的{name}的专业会被查询出,例如输入软件,会查询出软件工程,软件工程(学硕)等
export function majorName(name) {
    return request({
      url: '/postgraduate/postgraduateexam/majorName/'+name,
      method: 'get',
    })
  }

//    http://localhost/dev-api/postgraduate/postgraduateexam/average/山东/软件工程/2020
//    在average/后加省份，专业和年份，会返回该省份的高校该年份该专业的分数
//    分数分别代表总分，英语，政治，专业课1，专业课2
//    "data":[{"聊城大学":3,"中国海洋大学":1,"山东大学":9},{"聊城大学":[264,37,37,56,56]},{"中国海洋大学":[305,37,37,56,56]},{"山东大学":[290,45,45,70,70]}]
//    数组的第一个map为该大学出现次数(分数相同,仅专业链接不同,在此去重)
export function average(area,major) {
    return request({
      url: '/postgraduate/postgraduateexam/average/'+area+"/"+major,
      method: 'get',
    })
  }


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
//    返回数据格式data":[{"黑龙江":{"2017":{"哈尔滨工业大学":[327,51,48,83,80,220],"东北农业大学":[270,36,35,55,52,67]},
//                              "2018":{...},"2019":{...}},
//                      "辽宁":{"2017":{...},"2018":{...},"2019":{...}}}]
//    数组内共五个值，分别代表总分，英语，政治，专业课1，专业课2和该学校专业数量
export function AreaYearScore(allArea) {
    return request({
      url: '/postgraduate/postgraduateexam/AreaYearScore/'+allArea,
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