<template>
  <div class="app-container home">
    <img src="../assets/images/1169997.png" alt="Logo" class="logo">
    <br>
    <h1 class="title" style="color:#767676">欢迎来到考研志愿填报辅助系统</h1>
    <p class="description" style="color:#454343">
      本系统旨在完成数据设计和利用专门的数据可视化工具对考研数据进行深度分析，通过<br>
      分析整合近几年众多高校的自身信息、国家分数线、各单科需求分数线等数据，旨在为<br>
      考生提供便利的有用信息，加强信息数据的管理，整合不同类型的信息，进一步设计和<br>
      实现考研志愿填报辅助系统，为考生提供科学精准有效的信息基础保障。此研究将根据<br>
      高校学生备考和择校情况，通过有效的交互方式，帮助考生准确定位并获取所需的信息<br>
    </p>
  </div>
</template>

<script>
export default {
  name: "Index",
  data() {
    return {
      version: "3.8.5"
    };
  },
  methods: {
    goTarget(href) {
      window.open(href, "_blank");
    }
  }
};
</script>

<style scoped lang="scss">
.app-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.logo {
  width: auto;
  height: auto;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
}

.title {
  text-align: center;
  margin-bottom: 20px;
}

.description {
  text-align: center;
  margin-bottom: 30px;
}
</style>
