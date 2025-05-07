<template>
  <div style="background-color: #f5f7fa;display: flex;flex-direction: column" >
    <div style="width: 100%;height: 600px;">
      <iframe id="treeIframe" src="../html/college/tree.html" scrolling="auto" frameborder="0" style="width: 100%;height: 630px;"></iframe>
       </div>
    <div style="width: 100%;height: 600px;">
      <iframe id="parallelIframe2" src="../html/college/parallel2.html" scrolling="auto" frameborder="0" style="width: 50%;height: 630px"></iframe>
      <iframe id="K-MeansIframe" src="../html/college/K-Means.html" scrolling="auto" frameborder="0" style="width: 50%;height: 630px"></iframe>
    </div>
  </div>
</template>

<script>
import { areaTree, areaTreeScore, AreaYearScore, AreaYearScoreOverview, cluster, ProvinceYearScore } from "@/api/postgraduate/AreaAnalysis";
export default {
  name: 'index',
  data() {
    return {
      area: "西南", // tree所选的区
      city: "四川", // tree所选的省份
    }
  },
  created() {
    window.getFromIframe1 = this.getFromIframe1;
    window.getFromIframe2 = this.getFromIframe2;
  },
  mounted() {

  },
  methods: {
    getFromIframe1(value) {
      this.area = `${value}`;
      console.log('getFromIframe1:', this.area);
      this.getAreaYearScore();
    },
    getFromIframe2(value) {
      this.city = `${value}`;
      console.log('getFromIframe2:', this.city);
      this.getProvinceYearScore();
    },
    getAreaYearScore() {
      this.loading = true;
      let childFrameObj6 = document.getElementById("K-MeansIframe");
      childFrameObj6.contentWindow.getMessageFromParent6(JSON.stringify(this.area));
    },
    getProvinceYearScore() {
      this.loading = true;
      ProvinceYearScore(this.city).then(response => {
        let childFrameObj5 = document.getElementById("parallelIframe2");
        childFrameObj5.contentWindow.getMessageFromParent5(
          JSON.stringify(response.data),
          JSON.stringify(this.city)
        );
      });
    }
  }
}
</script>
