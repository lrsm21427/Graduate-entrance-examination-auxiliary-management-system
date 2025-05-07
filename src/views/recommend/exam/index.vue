<template>
  <div class="app-container" style="height: 100%">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="年份" prop="year">
        <el-input
          v-model="queryParams.year"
          placeholder="请输入年份"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="学校名称" prop="schoolName">
        <el-input
          v-model="queryParams.schoolName"
          placeholder="请输入学校名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="学院名字" prop="departmentName">
        <el-input
          v-model="queryParams.departmentName"
          placeholder="请输入学院名字"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="专业名字" prop="majorName">
        <el-input
          v-model="queryParams.majorName"
          placeholder="请输入专业名字"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="最低总分" prop="scoreTotal">
        <el-input
          v-model="queryParams.scoreTotal"
          placeholder="请输入总分"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['recommend:exam:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['recommend:exam:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['recommend:exam:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['recommend:exam:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <div class="exam-cards-container">
      <el-card v-for="item in examList" :key="item.lineId" class="exam-card">
        <div slot="header" class="card-header">
          <h3>{{ item.schoolName }}</h3>
          <div class="year-badge">{{ item.year }}年</div>
        </div>

        <div class="card-body">
          <div class="info-row">
            <span class="label">学院:</span>
            <span>{{ item.departmentName || '无' }}</span>
          </div>
          <div class="info-row">
            <span class="label">专业:</span>
            <span>{{ item.majorName }}</span>
            <el-tag v-if="item.majorId" size="mini" style="margin-left: 5px;">{{ item.majorId }}</el-tag>
          </div>

          <div class="score-section">
            <div class="score-total">
              <span class="label">总分:</span>
              <span class="score-value">{{ item.scoreTotal }}分</span>
            </div>

            <div class="score-details" v-if="item.scorePolitics || item.scoreForeignLanguage || item.scoreSpecialized1 || item.scoreSpecialized2">
              <div class="score-item" v-if="item.scorePolitics">
                <span>政治:</span>
                <span>{{ item.scorePolitics }}分</span>
              </div>
              <div class="score-item" v-if="item.scoreForeignLanguage">
                <span>外语:</span>
                <span>{{ item.scoreForeignLanguage }}分</span>
              </div>
              <div class="score-item" v-if="item.scoreSpecialized1">
                <span>专业课一:</span>
                <span>{{ item.scoreSpecialized1 }}分</span>
              </div>
              <div class="score-item" v-if="item.scoreSpecialized2">
                <span>专业课二:</span>
                <span>{{ item.scoreSpecialized2 }}分</span>
              </div>
            </div>
          </div>
        </div>

        <div class="card-actions">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(item)"
            v-hasPermi="['recommend:exam:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(item)"
            v-hasPermi="['recommend:exam:remove']"
          >删除</el-button>
        </div>
      </el-card>
    </div>

    <div class="pagination-container">
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="queryParams.pageNum"
        :limit.sync="queryParams.pageSize"
        @pagination="getList"
      />
    </div>

    <!-- 添加或修改考研历年具体分数信息对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="学校的ID" prop="schoolId">
          <el-input v-model="form.schoolId" placeholder="请输入学校的ID" />
        </el-form-item>
        <el-form-item label="年份" prop="year">
          <el-input v-model="form.year" placeholder="请输入年份" />
        </el-form-item>
        <el-form-item label="学校链接" prop="schoolLink">
          <el-input v-model="form.schoolLink" placeholder="请输入学校链接" />
        </el-form-item>
        <el-form-item label="学校名称" prop="schoolName">
          <el-input v-model="form.schoolName" placeholder="请输入学校名称" />
        </el-form-item>
        <el-form-item label="学院链接" prop="departmentLink">
          <el-input v-model="form.departmentLink" placeholder="请输入学院链接" />
        </el-form-item>
        <el-form-item label="学院名字" prop="departmentName">
          <el-input v-model="form.departmentName" placeholder="请输入学院名字" />
        </el-form-item>
        <el-form-item label="专业编号" prop="majorId">
          <el-input v-model="form.majorId" placeholder="请输入专业编号" />
        </el-form-item>
        <el-form-item label="专业链接" prop="majorLink">
          <el-input v-model="form.majorLink" placeholder="请输入专业链接" />
        </el-form-item>
        <el-form-item label="专业名字" prop="majorName">
          <el-input v-model="form.majorName" placeholder="请输入专业名字" />
        </el-form-item>
        <el-form-item label="总分" prop="scoreTotal">
          <el-input v-model="form.scoreTotal" placeholder="请输入总分" />
        </el-form-item>
        <el-form-item label="政治分数" prop="scorePolitics">
          <el-input v-model="form.scorePolitics" placeholder="请输入政治分数" />
        </el-form-item>
        <el-form-item label="外语分数" prop="scoreForeignLanguage">
          <el-input v-model="form.scoreForeignLanguage" placeholder="请输入外语分数" />
        </el-form-item>
        <el-form-item label="专业课一的分数" prop="scoreSpecialized1">
          <el-input v-model="form.scoreSpecialized1" placeholder="请输入专业课一的分数" />
        </el-form-item>
        <el-form-item label="专业课二的分数" prop="scoreSpecialized2">
          <el-input v-model="form.scoreSpecialized2" placeholder="请输入专业课二的分数" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listExam, getExam, delExam, addExam, updateExam } from "@/api/recommend/exam";

export default {
  name: "Exam",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 考研历年具体分数信息表格数据
      examList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 20,
        year: null,
        schoolName: null,
        departmentName: null,
        majorName: null,
        scoreTotal: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询考研历年具体分数信息列表 */
    getList() {
      this.loading = true;
      listExam(this.queryParams).then(response => {
        this.examList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        lineId: null,
        schoolId: null,
        year: null,
        schoolLink: null,
        schoolName: null,
        departmentLink: null,
        departmentName: null,
        majorId: null,
        majorLink: null,
        majorName: null,
        scoreTotal: null,
        scorePolitics: null,
        scoreForeignLanguage: null,
        scoreSpecialized1: null,
        scoreSpecialized2: null
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.lineId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加考研历年具体分数信息";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const lineId = row.lineId || this.ids
      getExam(lineId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改考研历年具体分数信息";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.lineId != null) {
            updateExam(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addExam(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const lineIds = row.lineId || this.ids;
      this.$modal.confirm('是否确认删除考研历年具体分数信息编号为"' + lineIds + '"的数据项？').then(function() {
        return delExam(lineIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('recommend/exam/export', {
        ...this.queryParams
      }, `exam_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>

<style scoped>
.app-container{
  background-image: url("data:image/svg+xml;charset=utf-8;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxOTInIGhlaWdodD0nMTkyJyB2aWV3Qm94PScwIDAgMTkyIDE5Mic+PHBhdGggZmlsbD0nIzQ5NDg0OScgZmlsbC1vcGFjaXR5PScwLjA4JyBkPSdNMTkyIDE1djJhMTEgMTEgMCAwIDAtMTEgMTFjMCAxLjk0IDEuMTYgNC43NSAyLjUzIDYuMTFsMi4zNiAyLjM2YTYuOTMgNi45MyAwIDAgMSAxLjIyIDcuNTZsLS40My44NGE4LjA4IDguMDggMCAwIDEtNi42NiA0LjEzSDE0NXYzNS4wMmE2LjEgNi4xIDAgMCAwIDMuMDMgNC44N2wuODQuNDNjMS41OC43OSA0IC40IDUuMjQtLjg1bDIuMzYtMi4zNmExMi4wNCAxMi4wNCAwIDAgMSA3LjUxLTMuMTEgMTMgMTMgMCAxIDEgLjAyIDI2IDEyIDEyIDAgMCAxLTcuNTMtMy4xMWwtMi4zNi0yLjM2YTQuOTMgNC45MyAwIDAgMC01LjI0LS44NWwtLjg0LjQzYTYuMSA2LjEgMCAwIDAtMy4wMyA0Ljg3VjE0M2gzNS4wMmE4LjA4IDguMDggMCAwIDEgNi42NiA0LjEzbC40My44NGE2LjkxIDYuOTEgMCAwIDEtMS4yMiA3LjU2bC0yLjM2IDIuMzZBMTAuMDYgMTAuMDYgMCAwIDAgMTgxIDE2NGExMSAxMSAwIDAgMCAxMSAxMXYyYTEzIDEzIDAgMCAxLTEzLTEzIDEyIDEyIDAgMCAxIDMuMTEtNy41M2wyLjM2LTIuMzZhNC45MyA0LjkzIDAgMCAwIC44NS01LjI0bC0uNDMtLjg0YTYuMSA2LjEgMCAwIDAtNC44Ny0zLjAzSDE0NXYzNS4wMmE4LjA4IDguMDggMCAwIDEtNC4xMyA2LjY2bC0uODQuNDNhNi45MSA2LjkxIDAgMCAxLTcuNTYtMS4yMmwtMi4zNi0yLjM2QTEwLjA2IDEwLjA2IDAgMCAwIDEyNCAxODFhMTEgMTEgMCAwIDAtMTEgMTFoLTJhMTMgMTMgMCAwIDEgMTMtMTNjMi40NyAwIDUuNzkgMS4zNyA3LjUzIDMuMTFsMi4zNiAyLjM2YTQuOTQgNC45NCAwIDAgMCA1LjI0Ljg1bC44NC0uNDNhNi4xIDYuMSAwIDAgMCAzLjAzLTQuODdWMTQ1aC0zNS4wMmE4LjA4IDguMDggMCAwIDEtNi42Ni00LjEzbC0uNDMtLjg0YTYuOTEgNi45MSAwIDAgMSAxLjIyLTcuNTZsMi4zNi0yLjM2QTEwLjA2IDEwLjA2IDAgMCAwIDEwNyAxMjRhMTEgMTEgMCAwIDAtMjIgMGMwIDEuOTQgMS4xNiA0Ljc1IDIuNTMgNi4xMWwyLjM2IDIuMzZhNi45MyA2LjkzIDAgMCAxIDEuMjIgNy41NmwtLjQzLjg0YTguMDggOC4wOCAwIDAgMS02LjY2IDQuMTNINDl2MzUuMDJhNi4xIDYuMSAwIDAgMCAzLjAzIDQuODdsLjg0LjQzYzEuNTguNzkgNCAuNCA1LjI0LS44NWwyLjM2LTIuMzZhMTIuMDQgMTIuMDQgMCAwIDEgNy41MS0zLjExQTEzIDEzIDAgMCAxIDgxIDE5MmgtMmExMSAxMSAwIDAgMC0xMS0xMWMtMS45NCAwLTQuNzUgMS4xNi02LjExIDIuNTNsLTIuMzYgMi4zNmE2LjkzIDYuOTMgMCAwIDEtNy41NiAxLjIybC0uODQtLjQzYTguMDggOC4wOCAwIDAgMS00LjEzLTYuNjZWMTQ1SDExLjk4YTYuMSA2LjEgMCAwIDAtNC44NyAzLjAzbC0uNDMuODRjLS43OSAxLjU4LS40IDQgLjg1IDUuMjRsMi4zNiAyLjM2YTEyLjA0IDEyLjA0IDAgMCAxIDMuMTEgNy41MUExMyAxMyAwIDAgMSAwIDE3N3YtMmExMSAxMSAwIDAgMCAxMS0xMWMwLTEuOTQtMS4xNi00Ljc1LTIuNTMtNi4xMWwtMi4zNi0yLjM2YTYuOTMgNi45MyAwIDAgMS0xLjIyLTcuNTZsLjQzLS44NGE4LjA4IDguMDggMCAwIDEgNi42Ni00LjEzSDQ3di0zNS4wMmE2LjEgNi4xIDAgMCAwLTMuMDMtNC44N2wtLjg0LS40M2MtMS41OS0uOC00LS40LTUuMjQuODVsLTIuMzYgMi4zNkExMiAxMiAwIDAgMSAyOCAxMDlhMTMgMTMgMCAxIDEgMC0yNmMyLjQ3IDAgNS43OSAxLjM3IDcuNTMgMy4xMWwyLjM2IDIuMzZhNC45NCA0Ljk0IDAgMCAwIDUuMjQuODVsLjg0LS40M0E2LjEgNi4xIDAgMCAwIDQ3IDg0LjAyVjQ5SDExLjk4YTguMDggOC4wOCAwIDAgMS02LjY2LTQuMTNsLS40My0uODRhNi45MSA2LjkxIDAgMCAxIDEuMjItNy41NmwyLjM2LTIuMzZBMTAuMDYgMTAuMDYgMCAwIDAgMTEgMjggMTEgMTEgMCAwIDAgMCAxN3YtMmExMyAxMyAwIDAgMSAxMyAxM2MwIDIuNDctMS4zNyA1Ljc5LTMuMTEgNy41M2wtMi4zNiAyLjM2YTQuOTQgNC45NCAwIDAgMC0uODUgNS4yNGwuNDMuODRBNi4xIDYuMSAwIDAgMCAxMS45OCA0N0g0N1YxMS45OGE4LjA4IDguMDggMCAwIDEgNC4xMy02LjY2bC44NC0uNDNhNi45MSA2LjkxIDAgMCAxIDcuNTYgMS4yMmwyLjM2IDIuMzZBMTAuMDYgMTAuMDYgMCAwIDAgNjggMTEgMTEgMTEgMCAwIDAgNzkgMGgyYTEzIDEzIDAgMCAxLTEzIDEzIDEyIDEyIDAgMCAxLTcuNTMtMy4xMWwtMi4zNi0yLjM2YTQuOTMgNC45MyAwIDAgMC01LjI0LS44NWwtLjg0LjQzQTYuMSA2LjEgMCAwIDAgNDkgMTEuOThWNDdoMzUuMDJhOC4wOCA4LjA4IDAgMCAxIDYuNjYgNC4xM2wuNDMuODRhNi45MSA2LjkxIDAgMCAxLTEuMjIgNy41NmwtMi4zNiAyLjM2QTEwLjA2IDEwLjA2IDAgMCAwIDg1IDY4YTExIDExIDAgMCAwIDIyIDBjMC0xLjk0LTEuMTYtNC43NS0yLjUzLTYuMTFsLTIuMzYtMi4zNmE2LjkzIDYuOTMgMCAwIDEtMS4yMi03LjU2bC40My0uODRhOC4wOCA4LjA4IDAgMCAxIDYuNjYtNC4xM0gxNDNWMTEuOThhNi4xIDYuMSAwIDAgMC0zLjAzLTQuODdsLS44NC0uNDNjLTEuNTktLjgtNC0uNC01LjI0Ljg1bC0yLjM2IDIuMzZBMTIgMTIgMCAwIDEgMTI0IDEzYTEzIDEzIDAgMCAxLTEzLTEzaDJhMTEgMTEgMCAwIDAgMTEgMTFjMS45NCAwIDQuNzUtMS4xNiA2LjExLTIuNTNsMi4zNi0yLjM2YTYuOTMgNi45MyAwIDAgMSA3LjU2LTEuMjJsLjg0LjQzYTguMDggOC4wOCAwIDAgMSA0LjEzIDYuNjZWNDdoMzUuMDJhNi4xIDYuMSAwIDAgMCA0Ljg3LTMuMDNsLjQzLS44NGMuOC0xLjU5LjQtNC0uODUtNS4yNGwtMi4zNi0yLjM2QTEyIDEyIDAgMCAxIDE3OSAyOGExMyAxMyAwIDAgMSAxMy0xM3pNODQuMDIgMTQzYTYuMSA2LjEgMCAwIDAgNC44Ny0zLjAzbC40My0uODRjLjgtMS41OS40LTQtLjg1LTUuMjRsLTIuMzYtMi4zNkExMiAxMiAwIDAgMSA4MyAxMjRhMTMgMTMgMCAxIDEgMjYgMGMwIDIuNDctMS4zNyA1Ljc5LTMuMTEgNy41M2wtMi4zNiAyLjM2YTQuOTQgNC45NCAwIDAgMC0uODUgNS4yNGwuNDMuODRhNi4xIDYuMSAwIDAgMCA0Ljg3IDMuMDNIMTQzdi0zNS4wMmE4LjA4IDguMDggMCAwIDEgNC4xMy02LjY2bC44NC0uNDNhNi45MSA2LjkxIDAgMCAxIDcuNTYgMS4yMmwyLjM2IDIuMzZBMTAuMDYgMTAuMDYgMCAwIDAgMTY0IDEwN2ExMSAxMSAwIDAgMCAwLTIyYy0xLjk0IDAtNC43NSAxLjE2LTYuMTEgMi41M2wtMi4zNiAyLjM2YTYuOTMgNi45MyAwIDAgMS03LjU2IDEuMjJsLS44NC0uNDNhOC4wOCA4LjA4IDAgMCAxLTQuMTMtNi42NlY0OWgtMzUuMDJhNi4xIDYuMSAwIDAgMC00Ljg3IDMuMDNsLS40My44NGMtLjc5IDEuNTgtLjQgNCAuODUgNS4yNGwyLjM2IDIuMzZhMTIuMDQgMTIuMDQgMCAwIDEgMy4xMSA3LjUxQTEzIDEzIDAgMSAxIDgzIDY4YTEyIDEyIDAgMCAxIDMuMTEtNy41M2wyLjM2LTIuMzZhNC45MyA0LjkzIDAgMCAwIC44NS01LjI0bC0uNDMtLjg0QTYuMSA2LjEgMCAwIDAgODQuMDIgNDlINDl2MzUuMDJhOC4wOCA4LjA4IDAgMCAxLTQuMTMgNi42NmwtLjg0LjQzYTYuOTEgNi45MSAwIDAgMS03LjU2LTEuMjJsLTIuMzYtMi4zNkExMC4wNiAxMC4wNiAwIDAgMCAyOCA4NWExMSAxMSAwIDAgMCAwIDIyYzEuOTQgMCA0Ljc1LTEuMTYgNi4xMS0yLjUzbDIuMzYtMi4zNmE2LjkzIDYuOTMgMCAwIDEgNy41Ni0xLjIybC44NC40M2E4LjA4IDguMDggMCAwIDEgNC4xMyA2LjY2VjE0M2gzNS4wMnonPjwvcGF0aD48L3N2Zz4=");
  min-height: 100vh;
}
.pagination-container {
  position: fixed;
  bottom: 10px;
  right: 10px;
  width: 100%;
  text-align: center;
  z-index: 999;
}
.exam-cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  margin-bottom: 60px; /* 为分页留出空间 */
}

.exam-card {
  border-radius: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.exam-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.year-badge {
  background-color: #409EFF;
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
}

.card-body {
  padding: 15px 0;
}

.info-row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  font-size: 14px;
  line-height: 1.5;
}

.info-row:last-child {
  margin-bottom: 15px;
}

.label {
  font-weight: 600;
  color: #909399;
  min-width: 50px;
  margin-right: 10px;
}

.score-section {
  background-color: #f9f9f9;
  border-radius: 6px;
  padding: 10px;
}

.score-total {
  display: flex;
  align-items: center;
  font-size: 15px;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px dashed #dcdfe6;
}

.score-value {
  font-weight: bold;
  color: #F56C6C;
  margin-left: 5px;
}

.score-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.score-item {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #606266;
}

.card-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 10px;
  border-top: 1px solid #ebeef5;
}

.pagination-container {
  position: fixed;
  bottom: 10px;
  left: 0;
  right: 10px;
  padding: 10px 20px;
  z-index: 100;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .exam-cards-container {
    grid-template-columns: 1fr;
  }

  .score-details {
    grid-template-columns: 1fr;
  }
}
</style>
