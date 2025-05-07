<template>
  <div class="main">
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
      <div style="display: flex;flex-direction: column;">
        <div>
          <iframe id="mapIframe" src="../html/speciality/map.html" ref="map_ref" scrolling="auto" frameborder="0" style="width: 50%;height: 650px;"></iframe>
          <iframe id="parallelIframe" src="../html/speciality/parallel.html" scrolling="auto" frameborder="0" style="width: 50%;height: 650px;"></iframe>
        </div>
        <div>
          <iframe id="mixed_bar_lineIframe" src="../html/speciality/mixed_bar_line.html" ref="mixed_bar_line_ref" scrolling="auto" frameborder="0" style="width: 100%;height: 650px;"></iframe>
        </div>
      </div>
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
      listAverageArea2020:[],
      listAverageArea2021:[],
      listAverageArea2022:[],
      listAverageArea2023:[],
      //考研历年具体分数信息表格数据
      listPostgraduateexam:[],
      // 显示搜索条件
      showSearch: true,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        select_speciality: "计算机科学与技术",
      },
    }
  },

  computed: {},
  watch: {},
  created() {
    window.getFromIframe = this.getFromIframe; //把vue实例中的方法引用给window对象
    // console.log(this.$refs.map_ref.obj)
    this.city = "四川";
    this.handleQuery();
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
      const currentCity = this.city || "四川";

      majorName(this.queryParams.select_speciality).then(response => {
        this.listMajor=response.data;
        // console.log(response);
        this.majorNum= response.data.length;
        this.getAverageArea();
        this.getAverageSchool2020();
        this.getAverageSchool2021();
        this.getAverageSchool2022();
        this.getAverageSchool2023();
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
    getAverageSchool2023() {
      // 查询该年该省院校该专业院校分数
      //2023年的
      average_school(this.city,this.queryParams.select_speciality,"2023").then(response => {
        // console.log(response);
        // console.log(response.data[0]);
        let childFrameObj1 = document.getElementById("parallelIframe");
        childFrameObj1.contentWindow.getMessageFromParent1(
          JSON.stringify(response.data)
        );
        // let childFrameObj2023 = document.getElementById("Radar");
        // childFrameObj2023.contentWindow.getMessageFromParent2023(
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
    getAverageSchool2022() {
      //2022年的
      average_school(this.city,this.queryParams.select_speciality,"2022").then(response => {
        // console.log(response);
        // console.log(response.data[0]);
        let childFrameObj2 = document.getElementById("parallelIframe");
        childFrameObj2.contentWindow.getMessageFromParent2(
          JSON.stringify(response.data)
        );
      })

    },
    getAverageSchool2021() {
      //2021年的
      average_school(this.city,this.queryParams.select_speciality,"2021").then(response => {
        // console.log(response);
        // console.log(response.data[0]);
        let childFrameObj3 = document.getElementById("parallelIframe");
        childFrameObj3.contentWindow.getMessageFromParent3(
          JSON.stringify(response.data)
        );
      })

    },
    getAverageSchool2020() {
      //2020年的
      average_school(this.city,this.queryParams.select_speciality,"2020").then(response => {
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
        this.listAverageArea2020 = response.data[2020];
        this.listAverageArea2021 = response.data[2021];
        this.listAverageArea2022 = response.data[2022];
        this.listAverageArea2023 = response.data[2023];
        this.sentToIframe();
      })

      // return response.data;
    },
    //向mixed_bar_line.html文件传参
    sentToIframe() {
      let childFrameObj = document.getElementById("mixed_bar_lineIframe");
      // console.log("childFrameObj", childFrameObj);
      childFrameObj.contentWindow.getMessageFromParent(
        this.listAverageArea2020,
        this.listAverageArea2021,
        this.listAverageArea2022,
        this.listAverageArea2023,
        JSON.stringify(this.city),
        JSON.stringify(this.queryParams.select_speciality)

      );
      //一种向子iFrame传参方式，调用iframe的methods达到传参的目的
    },
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
<style scoped>
.main{
  background-image: url("data:image/svg+xml;charset=utf-8;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxOTInIGhlaWdodD0nMTkyJyB2aWV3Qm94PScwIDAgMTkyIDE5Mic+PHBhdGggZmlsbD0nIzQ5NDg0OScgZmlsbC1vcGFjaXR5PScwLjA4JyBkPSdNMTkyIDE1djJhMTEgMTEgMCAwIDAtMTEgMTFjMCAxLjk0IDEuMTYgNC43NSAyLjUzIDYuMTFsMi4zNiAyLjM2YTYuOTMgNi45MyAwIDAgMSAxLjIyIDcuNTZsLS40My44NGE4LjA4IDguMDggMCAwIDEtNi42NiA0LjEzSDE0NXYzNS4wMmE2LjEgNi4xIDAgMCAwIDMuMDMgNC44N2wuODQuNDNjMS41OC43OSA0IC40IDUuMjQtLjg1bDIuMzYtMi4zNmExMi4wNCAxMi4wNCAwIDAgMSA3LjUxLTMuMTEgMTMgMTMgMCAxIDEgLjAyIDI2IDEyIDEyIDAgMCAxLTcuNTMtMy4xMWwtMi4zNi0yLjM2YTQuOTMgNC45MyAwIDAgMC01LjI0LS44NWwtLjg0LjQzYTYuMSA2LjEgMCAwIDAtMy4wMyA0Ljg3VjE0M2gzNS4wMmE4LjA4IDguMDggMCAwIDEgNi42NiA0LjEzbC40My44NGE2LjkxIDYuOTEgMCAwIDEtMS4yMiA3LjU2bC0yLjM2IDIuMzZBMTAuMDYgMTAuMDYgMCAwIDAgMTgxIDE2NGExMSAxMSAwIDAgMCAxMSAxMXYyYTEzIDEzIDAgMCAxLTEzLTEzIDEyIDEyIDAgMCAxIDMuMTEtNy41M2wyLjM2LTIuMzZhNC45MyA0LjkzIDAgMCAwIC44NS01LjI0bC0uNDMtLjg0YTYuMSA2LjEgMCAwIDAtNC44Ny0zLjAzSDE0NXYzNS4wMmE4LjA4IDguMDggMCAwIDEtNC4xMyA2LjY2bC0uODQuNDNhNi45MSA2LjkxIDAgMCAxLTcuNTYtMS4yMmwtMi4zNi0yLjM2QTEwLjA2IDEwLjA2IDAgMCAwIDEyNCAxODFhMTEgMTEgMCAwIDAtMTEgMTFoLTJhMTMgMTMgMCAwIDEgMTMtMTNjMi40NyAwIDUuNzkgMS4zNyA3LjUzIDMuMTFsMi4zNiAyLjM2YTQuOTQgNC45NCAwIDAgMCA1LjI0Ljg1bC44NC0uNDNhNi4xIDYuMSAwIDAgMCAzLjAzLTQuODdWMTQ1aC0zNS4wMmE4LjA4IDguMDggMCAwIDEtNi42Ni00LjEzbC0uNDMtLjg0YTYuOTEgNi45MSAwIDAgMSAxLjIyLTcuNTZsMi4zNi0yLjM2QTEwLjA2IDEwLjA2IDAgMCAwIDEwNyAxMjRhMTEgMTEgMCAwIDAtMjIgMGMwIDEuOTQgMS4xNiA0Ljc1IDIuNTMgNi4xMWwyLjM2IDIuMzZhNi45MyA2LjkzIDAgMCAxIDEuMjIgNy41NmwtLjQzLjg0YTguMDggOC4wOCAwIDAgMS02LjY2IDQuMTNINDl2MzUuMDJhNi4xIDYuMSAwIDAgMCAzLjAzIDQuODdsLjg0LjQzYzEuNTguNzkgNCAuNCA1LjI0LS44NWwyLjM2LTIuMzZhMTIuMDQgMTIuMDQgMCAwIDEgNy41MS0zLjExQTEzIDEzIDAgMCAxIDgxIDE5MmgtMmExMSAxMSAwIDAgMC0xMS0xMWMtMS45NCAwLTQuNzUgMS4xNi02LjExIDIuNTNsLTIuMzYgMi4zNmE2LjkzIDYuOTMgMCAwIDEtNy41NiAxLjIybC0uODQtLjQzYTguMDggOC4wOCAwIDAgMS00LjEzLTYuNjZWMTQ1SDExLjk4YTYuMSA2LjEgMCAwIDAtNC44NyAzLjAzbC0uNDMuODRjLS43OSAxLjU4LS40IDQgLjg1IDUuMjRsMi4zNiAyLjM2YTEyLjA0IDEyLjA0IDAgMCAxIDMuMTEgNy41MUExMyAxMyAwIDAgMSAwIDE3N3YtMmExMSAxMSAwIDAgMCAxMS0xMWMwLTEuOTQtMS4xNi00Ljc1LTIuNTMtNi4xMWwtMi4zNi0yLjM2YTYuOTMgNi45MyAwIDAgMS0xLjIyLTcuNTZsLjQzLS44NGE4LjA4IDguMDggMCAwIDEgNi42Ni00LjEzSDQ3di0zNS4wMmE2LjEgNi4xIDAgMCAwLTMuMDMtNC44N2wtLjg0LS40M2MtMS41OS0uOC00LS40LTUuMjQuODVsLTIuMzYgMi4zNkExMiAxMiAwIDAgMSAyOCAxMDlhMTMgMTMgMCAxIDEgMC0yNmMyLjQ3IDAgNS43OSAxLjM3IDcuNTMgMy4xMWwyLjM2IDIuMzZhNC45NCA0Ljk0IDAgMCAwIDUuMjQuODVsLjg0LS40M0E2LjEgNi4xIDAgMCAwIDQ3IDg0LjAyVjQ5SDExLjk4YTguMDggOC4wOCAwIDAgMS02LjY2LTQuMTNsLS40My0uODRhNi45MSA2LjkxIDAgMCAxIDEuMjItNy41NmwyLjM2LTIuMzZBMTAuMDYgMTAuMDYgMCAwIDAgMTEgMjggMTEgMTEgMCAwIDAgMCAxN3YtMmExMyAxMyAwIDAgMSAxMyAxM2MwIDIuNDctMS4zNyA1Ljc5LTMuMTEgNy41M2wtMi4zNiAyLjM2YTQuOTQgNC45NCAwIDAgMC0uODUgNS4yNGwuNDMuODRBNi4xIDYuMSAwIDAgMCAxMS45OCA0N0g0N1YxMS45OGE4LjA4IDguMDggMCAwIDEgNC4xMy02LjY2bC44NC0uNDNhNi45MSA2LjkxIDAgMCAxIDcuNTYgMS4yMmwyLjM2IDIuMzZBMTAuMDYgMTAuMDYgMCAwIDAgNjggMTEgMTEgMTEgMCAwIDAgNzkgMGgyYTEzIDEzIDAgMCAxLTEzIDEzIDEyIDEyIDAgMCAxLTcuNTMtMy4xMWwtMi4zNi0yLjM2YTQuOTMgNC45MyAwIDAgMC01LjI0LS44NWwtLjg0LjQzQTYuMSA2LjEgMCAwIDAgNDkgMTEuOThWNDdoMzUuMDJhOC4wOCA4LjA4IDAgMCAxIDYuNjYgNC4xM2wuNDMuODRhNi45MSA2LjkxIDAgMCAxLTEuMjIgNy41NmwtMi4zNiAyLjM2QTEwLjA2IDEwLjA2IDAgMCAwIDg1IDY4YTExIDExIDAgMCAwIDIyIDBjMC0xLjk0LTEuMTYtNC43NS0yLjUzLTYuMTFsLTIuMzYtMi4zNmE2LjkzIDYuOTMgMCAwIDEtMS4yMi03LjU2bC40My0uODRhOC4wOCA4LjA4IDAgMCAxIDYuNjYtNC4xM0gxNDNWMTEuOThhNi4xIDYuMSAwIDAgMC0zLjAzLTQuODdsLS44NC0uNDNjLTEuNTktLjgtNC0uNC01LjI0Ljg1bC0yLjM2IDIuMzZBMTIgMTIgMCAwIDEgMTI0IDEzYTEzIDEzIDAgMCAxLTEzLTEzaDJhMTEgMTEgMCAwIDAgMTEgMTFjMS45NCAwIDQuNzUtMS4xNiA2LjExLTIuNTNsMi4zNi0yLjM2YTYuOTMgNi45MyAwIDAgMSA3LjU2LTEuMjJsLjg0LjQzYTguMDggOC4wOCAwIDAgMSA0LjEzIDYuNjZWNDdoMzUuMDJhNi4xIDYuMSAwIDAgMCA0Ljg3LTMuMDNsLjQzLS44NGMuOC0xLjU5LjQtNC0uODUtNS4yNGwtMi4zNi0yLjM2QTEyIDEyIDAgMCAxIDE3OSAyOGExMyAxMyAwIDAgMSAxMy0xM3pNODQuMDIgMTQzYTYuMSA2LjEgMCAwIDAgNC44Ny0zLjAzbC40My0uODRjLjgtMS41OS40LTQtLjg1LTUuMjRsLTIuMzYtMi4zNkExMiAxMiAwIDAgMSA4MyAxMjRhMTMgMTMgMCAxIDEgMjYgMGMwIDIuNDctMS4zNyA1Ljc5LTMuMTEgNy41M2wtMi4zNiAyLjM2YTQuOTQgNC45NCAwIDAgMC0uODUgNS4yNGwuNDMuODRhNi4xIDYuMSAwIDAgMCA0Ljg3IDMuMDNIMTQzdi0zNS4wMmE4LjA4IDguMDggMCAwIDEgNC4xMy02LjY2bC44NC0uNDNhNi45MSA2LjkxIDAgMCAxIDcuNTYgMS4yMmwyLjM2IDIuMzZBMTAuMDYgMTAuMDYgMCAwIDAgMTY0IDEwN2ExMSAxMSAwIDAgMCAwLTIyYy0xLjk0IDAtNC43NSAxLjE2LTYuMTEgMi41M2wtMi4zNiAyLjM2YTYuOTMgNi45MyAwIDAgMS03LjU2IDEuMjJsLS44NC0uNDNhOC4wOCA4LjA4IDAgMCAxLTQuMTMtNi42NlY0OWgtMzUuMDJhNi4xIDYuMSAwIDAgMC00Ljg3IDMuMDNsLS40My44NGMtLjc5IDEuNTgtLjQgNCAuODUgNS4yNGwyLjM2IDIuMzZhMTIuMDQgMTIuMDQgMCAwIDEgMy4xMSA3LjUxQTEzIDEzIDAgMSAxIDgzIDY4YTEyIDEyIDAgMCAxIDMuMTEtNy41M2wyLjM2LTIuMzZhNC45MyA0LjkzIDAgMCAwIC44NS01LjI0bC0uNDMtLjg0QTYuMSA2LjEgMCAwIDAgODQuMDIgNDlINDl2MzUuMDJhOC4wOCA4LjA4IDAgMCAxLTQuMTMgNi42NmwtLjg0LjQzYTYuOTEgNi45MSAwIDAgMS03LjU2LTEuMjJsLTIuMzYtMi4zNkExMC4wNiAxMC4wNiAwIDAgMCAyOCA4NWExMSAxMSAwIDAgMCAwIDIyYzEuOTQgMCA0Ljc1LTEuMTYgNi4xMS0yLjUzbDIuMzYtMi4zNmE2LjkzIDYuOTMgMCAwIDEgNy41Ni0xLjIybC44NC40M2E4LjA4IDguMDggMCAwIDEgNC4xMyA2LjY2VjE0M2gzNS4wMnonPjwvcGF0aD48L3N2Zz4=");
}
</style>
