<template>
  <div>
    <iframe id="treeIframe" src="../html/college/tree.html" scrolling="auto" frameborder="0" style="width: 100%;height: 535px;"></iframe>
    <iframe id="parallelIframe2" src="../html/college/parallel2.html" scrolling="auto" frameborder="0" style="width: 50%;height: 600px;"></iframe>
    <iframe id="K-MeansIframe" src="../html/college/K-Means.html" scrolling="auto" frameborder="0" style="width: 50%;height: 600px;"></iframe>

  </div>

</template>


<script>

import { areaTree,areaTreeScore,AreaYearScore,AreaYearScoreOverview,cluster ,ProvinceYearScore} from "@/api/postgraduate/AreaAnalysis";
export default {
  name: 'index',
  components: {
  },
  props: [],
  data() {
    return {
      //tree所选的区
      area:null,
      //tree所选的省份
      city:null,
    }
  },
  computed: {},
  watch: {},
  created() {
    window.getFromIframe1 = this.getFromIframe1; //把vue实例中的方法引用给window对象
    // console.log(this.$refs.map_ref.obj)
    window.getFromIframe2 = this.getFromIframe2; //把vue实例中的方法引用给window对象
    // console.log(this.$refs.map_ref.obj)
  },
  mounted() {},
  methods:{
    //获取tree.html的参数area，并赋值
    getFromIframe1(value) {
      this.area = `${value}`;
      console.log(this.area);
      this.getAreaYearScore();
    },
    getFromIframe2(value) {
      this.city = `${value}`;
      console.log(this.city);
      this.getProvinceYearScore();
    },
    //给聚类图传递信息
    getAreaYearScore(){
      this.loading = true;
      //给聚类页面传递信息
      let childFrameObj6 = document.getElementById("K-MeansIframe");
      childFrameObj6.contentWindow.getMessageFromParent6(
        JSON.stringify(this.area)
      );
    },

    //获给parallel2.html传输数据
    getProvinceYearScore(){
      this.loading = true;
      // 地区院校每年平均分数
      ProvinceYearScore(this.city).then(response => {
        // console.log(response);
        //给parallel2.html传输数据
        let childFrameObj5 = document.getElementById("parallelIframe2");
        childFrameObj5.contentWindow.getMessageFromParent5(
          JSON.stringify(response.data),
          JSON.stringify(this.city)
          // console.log(response)
        );
      })
    },

  }
}

</script>
<style>
</style>
