<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">

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
      <el-form-item label="年份" prop="year">
        <el-input
          v-model="queryParams.year"
          placeholder="请输入年份"
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
          v-hasPermi="['postgraduate:postgraduateexam:add']"
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
          v-hasPermi="['postgraduate:postgraduateexam:edit']"
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
          v-hasPermi="['postgraduate:postgraduateexam:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['postgraduate:postgraduateexam:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="postgraduateexamList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
<!--      <el-table-column label="某一院校某一专业某一年分数的ID" align="center" prop="lineId" />-->
<!--      <el-table-column label="学校的ID" align="center" prop="schoolId" />-->
      <el-table-column label="年份" align="center" prop="year" />
      <el-table-column label="学校链接" align="center" prop="schoolLink" />
      <el-table-column label="学校名称" align="center" prop="schoolName" />
      <el-table-column label="学院链接" align="center" prop="departmentLink" />
      <el-table-column label="学院名字" align="center" prop="departmentName" />
      <el-table-column label="专业编号" align="center" prop="majorId" />
      <el-table-column label="专业链接" align="center" prop="majorLink" />
      <el-table-column label="专业名字" align="center" prop="majorName" />
      <el-table-column label="总分" align="center" prop="scoreTotal" />
      <el-table-column label="政治分数" align="center" prop="scorePolitics" />
      <el-table-column label="外语分数" align="center" prop="scoreForeignLanguage" />
      <el-table-column label="专业课一的分数" align="center" prop="scoreSpecialized1" />
      <el-table-column label="专业课二的分数" align="center" prop="scoreSpecialized2" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['postgraduate:postgraduateexam:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['postgraduate:postgraduateexam:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

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
import { listPostgraduateexam, getPostgraduateexam, delPostgraduateexam, addPostgraduateexam, updatePostgraduateexam } from "@/api/postgraduate/postgraduateexam";

export default {
  name: "Postgraduateexam",
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
      postgraduateexamList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        year: null,
        schoolName: null,
        departmentName: null,
        majorName: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        lineId: [
          { required: true, message: "某一院校某一专业某一年分数的ID不能为空", trigger: "blur" }
        ],
        schoolId: [
          { required: true, message: "学校的ID不能为空", trigger: "blur" }
        ],
        year: [
          { required: true, message: "年份不能为空", trigger: "blur" }
        ],
        schoolLink: [
          { required: true, message: "学校链接不能为空", trigger: "blur" }
        ],
        schoolName: [
          { required: true, message: "学校名称不能为空", trigger: "blur" }
        ],
        departmentLink: [
          { required: true, message: "学院链接不能为空", trigger: "blur" }
        ],
        departmentName: [
          { required: true, message: "学院名字不能为空", trigger: "blur" }
        ],
        majorId: [
          { required: true, message: "专业编号不能为空", trigger: "blur" }
        ],
        majorLink: [
          { required: true, message: "专业链接不能为空", trigger: "blur" }
        ],
        majorName: [
          { required: true, message: "专业名字不能为空", trigger: "blur" }
        ],
        scoreTotal: [
          { required: true, message: "总分不能为空", trigger: "blur" }
        ],
        scorePolitics: [
          { required: true, message: "政治分数不能为空", trigger: "blur" }
        ],
        scoreForeignLanguage: [
          { required: true, message: "外语分数不能为空", trigger: "blur" }
        ],
        scoreSpecialized1: [
          { required: true, message: "专业课一的分数不能为空", trigger: "blur" }
        ],
        scoreSpecialized2: [
          { required: true, message: "专业课二的分数不能为空", trigger: "blur" }
        ]
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
      listPostgraduateexam(this.queryParams).then(response => {
        this.postgraduateexamList = response.rows;
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
      getPostgraduateexam(lineId).then(response => {
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
            updatePostgraduateexam(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addPostgraduateexam(this.form).then(response => {
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
        return delPostgraduateexam(lineIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('postgraduate/postgraduateexam/export', {
        ...this.queryParams
      }, `postgraduateexam_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
