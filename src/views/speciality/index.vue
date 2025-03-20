<template>
  <div>
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch"  label-width="68px">

      <el-form-item label-width="85px" label="目标专业：" prop="select_speciality">
        <el-input
          v-model="queryParams.select_speciality"
          placeholder="请输入目标专业"
          clearable
          @keyup.enter.native="handleQuery"
          :style="{width: '100%'}"
        />

      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>

    </el-form>
    <div>
      <iframe id="mapIframe" src="../html/speciality/map.html" ref="map_ref" scrolling="auto" frameborder="0" style="width: 50%;height: 600px;"></iframe>
      <iframe id="parallelIframe" src="../html/speciality/parallel.html" scrolling="auto" frameborder="0" style="width: 50%;height: 600px;"></iframe>
      <iframe id="mixed_bar_lineIframe" src="../html/speciality/mixed_bar_line.html" ref="mixed_bar_line_ref" scrolling="auto" frameborder="0" style="width: 100%;height: 535px;"></iframe>
<!--      <iframe id="Radar" src="../html/speciality/radar.html" ref="radar" scrolling="auto" frameborder="0" style="width: 720px;height: 535px;"></iframe>-->
    </div>

  </div>

</template>
<script>
import { majorName,average_area,average_school,AreaSchools } from "@/api/postgraduate/overview";
import { areaTree,areaTreeScore,AreaYearScore,cluster } from "@/api/postgraduate/AreaAnalysis";

export default {
  name: 'index',
  components: {},
  props: [],
  data() {

    return {
      radarData:[[]],
      //map所选的城市
      city:null,
      //检索的专业数量
      majorNum:0,
      //检索的专业列表
      listMajor:[],
      //每年该省院校该专业平均分数
      listAverageArea2017:[],
      listAverageArea2018:[],
      listAverageArea2019:[],
      listAverageArea2020:[],
      //考研历年具体分数信息表格数据
      listPostgraduateexam:[],
      // 显示搜索条件
      showSearch: true,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        select_speciality: null,
      },
    }
  },

  computed: {},
  watch: {},
  created() {
    window.getFromIframe = this.getFromIframe; //把vue实例中的方法引用给window对象
    // console.log(this.$refs.map_ref.obj)

  },
  mounted() {},
  methods: {
    //获取map.html的参数city，并赋值
    getFromIframe(value) {
      this.city = `${value}`;
      // console.log(this.city);
    },
    //获取专业名称，调用getAverageArea()
    getMajorName(){
      this.loading = true;
      majorName(this.queryParams.select_speciality).then(response => {
        this.listMajor=response.data;
        // console.log(response);
        this.majorNum= response.data.length;
        this.getAverageArea();
        this.getAverageSchool2017();
        this.getAverageSchool2018();
        this.getAverageSchool2019();
        this.getAverageSchool2020();
        // this.sentToIframe2();
        // console.log(this.majorNum);
        // console.log(this.city);
        this.loading = false;
      })
    },
    // sentToIframe2(){
    //   let childFrameObj_Radar = document.getElementById("Radar");
    //   // console.log("childFrameObj", childFrameObj);
    //   childFrameObj_Radar.contentWindow.getMessageFromParent_Radar(
    //
    //     JSON.stringify(this.radarData)
    //
    //   );
    // },
    // 查询该年该省院校该专业院校分数,并保存
    getAverageSchool2020() {
      // 查询该年该省院校该专业院校分数
      //2020年的
      average_school(this.city,this.queryParams.select_speciality,"2020").then(response => {
        // console.log(response);
        // console.log(response.data[0]);
        let childFrameObj1 = document.getElementById("parallelIframe");
        childFrameObj1.contentWindow.getMessageFromParent1(
          JSON.stringify(response.data)
        );
        // let childFrameObj2020 = document.getElementById("Radar");
        // childFrameObj2020.contentWindow.getMessageFromParent2020(
        //   JSON.stringify(response.data)
        // );

        let childFrameObj7 = document.getElementById("parallelIframe");
        childFrameObj7.contentWindow.getMessageFromParent7(
          JSON.stringify(this.city)
        );
        let childFrameObj8 = document.getElementById("parallelIframe");
        childFrameObj8.contentWindow.getMessageFromParent8(
          JSON.stringify(this.queryParams.select_speciality)
        );
      })

    },
    getAverageSchool2019() {
      //2019年的
      average_school(this.city,this.queryParams.select_speciality,"2019").then(response => {
        // console.log(response);
        // console.log(response.data[0]);
        let childFrameObj2 = document.getElementById("parallelIframe");
        childFrameObj2.contentWindow.getMessageFromParent2(
          JSON.stringify(response.data)
        );
      })

    },
    getAverageSchool2018() {
      //2018年的
      average_school(this.city,this.queryParams.select_speciality,"2018").then(response => {
        // console.log(response);
        // console.log(response.data[0]);
        let childFrameObj3 = document.getElementById("parallelIframe");
        childFrameObj3.contentWindow.getMessageFromParent3(
          JSON.stringify(response.data)
        );
      })

    },
    getAverageSchool2017() {
      //2017年的
      average_school(this.city,this.queryParams.select_speciality,"2017").then(response => {
        // console.log(response);
        // console.log(response.data[0]);
        let childFrameObj4 = document.getElementById("parallelIframe");
        childFrameObj4.contentWindow.getMessageFromParent4(
          JSON.stringify(response.data)
        );
      })
    },
    // 查询每年该省院校该专业平均分数,并保存
    getAverageArea() {
      // console.log(city1)
      // console.log(sp1)
      average_area(this.city,this.queryParams.select_speciality).then(response => {
        // console.log(response.data);
        this.listAverageArea2017 = response.data[2017];
        this.listAverageArea2018 = response.data[2018];
        this.listAverageArea2019 = response.data[2019];
        this.listAverageArea2020 = response.data[2020];
        this.sentToIframe();
      })

      // return response.data;
    },
    //向mixed_bar_line.html文件传参
    sentToIframe() {
      let childFrameObj = document.getElementById("mixed_bar_lineIframe");
      // console.log("childFrameObj", childFrameObj);
      childFrameObj.contentWindow.getMessageFromParent(
        this.listAverageArea2017,
        this.listAverageArea2018,
        this.listAverageArea2019,
        this.listAverageArea2020,
        JSON.stringify(this.city),
        JSON.stringify(this.queryParams.select_speciality)

      );
      //一种向子iFrame传参方式，调用iframe的methods达到传参的目的
    },
    //向parallel.html文件传参parallelIframe
    // sentToIframe_parallel() {
    //   let childFrameObj1 = document.getElementById("parallelIframe");
    //   // console.log("childFrameObj", childFrameObj);
    //   // console.log(this.city,this.queryParams.select_speciality)
    //   childFrameObj1.contentWindow.getMessageFromParent(
    //
    //   ); //一种向子iFrame传参方式，调用iframe的methods达到传参的目的
    // },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getMajorName();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
  }
}

</script>
<style>
</style>
