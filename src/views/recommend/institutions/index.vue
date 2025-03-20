<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="省份" prop="province">
        <el-input
          v-model="queryParams.province"
          placeholder="请输入省份"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="本专科" prop="regularOrSpecial">
        <el-select v-model="queryParams.regularOrSpecial" placeholder="本科或者专科" clearable>
          <el-option
            v-for="dict in dict.type.regular_special"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="是否985" prop="project985">
        <el-select v-model="queryParams.project985" placeholder="是否985" clearable>
          <el-option
            v-for="dict in dict.type.or_985"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="是否211" prop="project211">
        <el-select v-model="queryParams.project211" placeholder="是否211" clearable>
          <el-option
            v-for="dict in dict.type.or_211"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="双一流" prop="dfc">
        <el-select v-model="queryParams.dfc" placeholder="是否双一流高校" clearable>
          <el-option
            v-for="dict in dict.type.or_dfc"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="所在城市" prop="city">
        <el-input
          v-model="queryParams.city"
          placeholder="请输入所在城市"
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
          v-hasPermi="['recommend:institutions:add']"
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
          v-hasPermi="['recommend:institutions:edit']"
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
          v-hasPermi="['recommend:institutions:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['recommend:institutions:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="institutionsList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <!-- <el-table-column label="学校的ID" align="center" prop="schoolId" /> -->
      <el-table-column label="省份" align="center" prop="province" />
      <el-table-column label="学校名称" align="center" prop="schoolName" />
      <el-table-column label="学校类型" align="center" prop="type" />
      <el-table-column label="办学性质" align="center" prop="publicOrPrivate">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.public_private" :value="scope.row.publicOrPrivate"/>
        </template>
      </el-table-column>
      <el-table-column label="本专科" align="center" prop="regularOrSpecial">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.regular_special" :value="scope.row.regularOrSpecial"/>
        </template>
      </el-table-column>
      <el-table-column label="是否985" align="center" prop="project985">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.or_985" :value="scope.row.project985"/>
        </template>
      </el-table-column>
      <el-table-column label="是否211" align="center" prop="project211">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.or_211" :value="scope.row.project211"/>
        </template>
      </el-table-column>
      <el-table-column label="是否双一流高校" align="center" prop="dfc">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.or_dfc" :value="scope.row.dfc"/>
        </template>
      </el-table-column>
      <el-table-column label="所在城市" align="center" prop="city" />
      <el-table-column label="隶属于" align="center" prop="subordinate" />
      <el-table-column label="详细地址" align="center" prop="address" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['recommend:institutions:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['recommend:institutions:remove']"
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

    <!-- 添加或修改大学推荐对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="省份" prop="province">
          <el-input v-model="form.province" placeholder="请输入省份" />
        </el-form-item>
        <el-form-item label="学校名称" prop="schoolName">
          <el-input v-model="form.schoolName" placeholder="请输入学校名称" />
        </el-form-item>
        <el-form-item label="公办或者民办" prop="publicOrPrivate">
          <el-input v-model="form.publicOrPrivate" placeholder="请输入公办或者民办" />
        </el-form-item>
        <el-form-item label="本科或者专科" prop="regularOrSpecial">
          <el-input v-model="form.regularOrSpecial" placeholder="请输入本科或者专科" />
        </el-form-item>
        <el-form-item label="是否985" prop="project985">
          <el-input v-model="form.project985" placeholder="请输入是否985" />
        </el-form-item>
        <el-form-item label="是否211" prop="project211">
          <el-input v-model="form.project211" placeholder="请输入是否211" />
        </el-form-item>
        <el-form-item label="是否双一流高校" prop="dfc">
          <el-input v-model="form.dfc" placeholder="请输入是否双一流高校" />
        </el-form-item>
        <el-form-item label="所在城市" prop="city">
          <el-input v-model="form.city" placeholder="请输入所在城市" />
        </el-form-item>
        <el-form-item label="隶属于" prop="subordinate">
          <el-input v-model="form.subordinate" placeholder="请输入隶属于" />
        </el-form-item>
        <el-form-item label="详细地址" prop="address">
          <el-input v-model="form.address" placeholder="请输入详细地址" />
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
import { listInstitutions, getInstitutions, delInstitutions, addInstitutions, updateInstitutions } from "@/api/recommend/institutions";

export default {
  name: "Institutions",
  dicts: ['sys_normal_disable','public_private','regular_special','or_985','or_211','or_dfc'],
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
      // 大学推荐表格数据
      institutionsList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        province: null,
        schoolName: null,
        publicOrPrivate: null,
        regularOrSpecial: null,
        project985: null,
        project211: null,
        dfc: null,
        city: null,
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
    /** 查询大学推荐列表 */
    getList() {
      this.loading = true;
      listInstitutions(this.queryParams).then(response => {
        this.institutionsList = response.rows;
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
        schoolId: null,
        province: null,
        schoolName: null,
        type: null,
        publicOrPrivate: null,
        regularOrSpecial: null,
        project985: null,
        project211: null,
        dfc: null,
        city: null,
        subordinate: null,
        address: null
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
      this.ids = selection.map(item => item.schoolId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加大学推荐";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const schoolId = row.schoolId || this.ids
      getInstitutions(schoolId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改大学推荐";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.schoolId != null) {
            updateInstitutions(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addInstitutions(this.form).then(response => {
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
      const schoolIds = row.schoolId || this.ids;
      this.$modal.confirm('是否确认删除大学推荐编号为"' + schoolIds + '"的数据项？').then(function() {
        return delInstitutions(schoolIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('recommend/institutions/export', {
        ...this.queryParams
      }, `institutions_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
