import request from '@/utils/request'

// 查询专业,模糊查询
//包含输入的{name}的专业会被查询出,例如输入软件,会查询出软件工程,软件工程(学硕)等
export function majorName(name) {
    return request({
      url: '/postgraduate/postgraduateexam/majorName/'+name,
      method: 'get',
    })
  }

//    http://localhost/dev-api/postgraduate/postgraduateexam/average/山东/软件工程
//    查询每年该省院校平均分数
//    分数分别代表总分，英语，政治，专业课1，专业课2和科目数，科目数可不看
//    "data":{"2020":[318,41,41,71,71,3],"2021":[320,45,45,80,80,2],"2022":[300,44,44,66,66,3],"2023":[285,42,42,65,65,13]}
export function average_area(area,major) {
    return request({
      url: '/postgraduate/postgraduateexam/average/'+area+"/"+major,
      method: 'get',
    })
  }

//    http://localhost/dev-api/postgraduate/postgraduateexam/average/山东/软件工程/2023
//    在average/后加省份，专业和年份，会返回该省份的高校该年份该专业的分数
//    分数分别代表总分，英语，政治，专业课1，专业课2
//    "data":[{"聊城大学":3,"中国海洋大学":1,"山东大学":9},{"聊城大学":[264,37,37,56,56]},{"中国海洋大学":[305,37,37,56,56]},{"山东大学":[290,45,45,70,70]}]
//    数组的第一个map为该大学出现次数(分数相同,仅专业链接不同,在此去重)
export function average_school(area,major,year) {
    return request({
      url: '/postgraduate/postgraduateexam/average/'+area+"/"+major+"/"+year,
      method: 'get',
    })
  }

//    http://localhost/dev-api/postgraduate/university/AreaSchools/软件工程
//    会查询出包含{major}的学校,并按照省份分类
//    "data":{"山东":["中国海洋大学","青岛科技大学","聊城大学"],"福建":["福州大学","华侨大学"]}
export function AreaSchools(major) {
    return request({
      url: '/postgraduate/university/AreaSchools/'+major,
      method: 'get',
    })
  }
