<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="所在省份" prop="province">
        <el-input
          v-model="queryParams.province"
          placeholder="请输入省份"
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
      <el-form-item label="办学性质" prop="publicOrPrivate">
        <el-select v-model="queryParams.publicOrPrivate" placeholder="民办、公办或其他" clearable>
          <el-option
            v-for="dict in dict.type.public_private"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
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
          v-hasPermi="['postgraduate:university:add']"
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
          v-hasPermi="['postgraduate:university:edit']"
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
          v-hasPermi="['postgraduate:university:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['postgraduate:university:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="universityList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="学校的ID" align="center" prop="schoolId" />
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
<!--      <el-table-column label="是否985" align="center" prop="project985" />-->
      <el-table-column label="是否985" align="center" prop="project985">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.or_985" :value="scope.row.project985"/>
        </template>
      </el-table-column>
<!--      <el-table-column label="是否211" align="center" prop="project211" />-->
      <el-table-column label="是否211" align="center" prop="project211">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.or_211" :value="scope.row.project211"/>
        </template>
      </el-table-column>
<!--      <el-table-column label="是否双一流高校" align="center" prop="dfc" />-->
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
            v-hasPermi="['postgraduate:university:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['postgraduate:university:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="queryParams.pageNum"
        :limit.sync="queryParams.pageSize"
        @pagination="getList"
      />
    </div>

    <!-- 添加或修改大学信息对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="所在省份" prop="province">
          <el-input v-model="form.province" placeholder="请输入省份" />
        </el-form-item>
        <el-form-item label="学校名称" prop="schoolName">
          <el-input v-model="form.schoolName" placeholder="请输入学校名称" />
        </el-form-item>
        <el-form-item label="学校类型" prop="type">
          <el-input v-model="form.type" placeholder="请输入学校类型" />
        </el-form-item>
        <el-form-item label="办学性质" prop="publicOrPrivate">
          <el-radio-group v-model="form.publicOrPrivate">
            <el-radio
              v-for="dict in dict.type.public_private"
              :key="dict.value"
              :label="dict.value"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="本专科" prop="regularOrSpecial">
          <el-radio-group v-model="form.publicOrPrivate">
            <el-radio
              v-for="dict in dict.type.regular_special"
              :key="dict.value"
              :label="dict.value"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否985" prop="project985">
          <el-radio-group v-model="form.publicOrPrivate">
            <el-radio
              v-for="dict in dict.type.or_985"
              :key="dict.value"
              :label="dict.value"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否211" prop="project211">
          <el-radio-group v-model="form.publicOrPrivate">
            <el-radio
              v-for="dict in dict.type.or_211"
              :key="dict.value"
              :label="dict.value"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="双一流" prop="dfc">
          <el-radio-group v-model="form.publicOrPrivate">
            <el-radio
              v-for="dict in dict.type.or_dfc"
              :key="dict.value"
              :label="dict.value"
            >{{dict.label}}</el-radio>
          </el-radio-group>
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
import { listUniversity, getUniversity, delUniversity, addUniversity, updateUniversity } from "@/api/postgraduate/university";

export default {
  name: "University",
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
      // 大学信息表格数据
      universityList: [],
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
        type: null,
        publicOrPrivate: null,
        regularOrSpecial: null,
        project985: null,
        project211: null,
        dfc: null,
        city: null,
        subordinate: null,
        address: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        province: [
          { required: true, message: "省份不能为空", trigger: "blur" }
        ],
        schoolName: [
          { required: true, message: "学校名称不能为空", trigger: "blur" }
        ],
        type: [
          { required: true, message: "学校类型不能为空", trigger: "blur" }
        ],
        publicOrPrivate: [
          { required: true, message: "此处必选", trigger: "blur" }
        ],
        regularOrSpecial: [
          { required: true, message: "此处必选", trigger: "blur" }
        ],
        project985: [
          { required: true, message: "此处必选", trigger: "blur" }
        ],
        project211: [
          { required: true, message: "此处必选", trigger: "blur" }
        ],
        dfc: [
          { required: true, message: "此处必选", trigger: "blur" }
        ],
        city: [
          { required: true, message: "所在城市不能为空", trigger: "blur" }
        ],
        subordinate: [
          { required: true, message: "此处不能为空", trigger: "blur" }
        ],
        address: [
          { required: true, message: "详细地址不能为空，如无法获知可填写“暂无", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询大学信息列表 */
    getList() {
      this.loading = true;
      listUniversity(this.queryParams).then(response => {
        this.universityList = response.rows;
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
      this.title = "添加大学信息";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const schoolId = row.schoolId || this.ids
      getUniversity(schoolId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改大学信息";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.schoolId != null) {
            updateUniversity(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addUniversity(this.form).then(response => {
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
      this.$modal.confirm('是否确认删除大学信息编号为"' + schoolIds + '"的数据项？').then(function() {
        return delUniversity(schoolIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('postgraduate/university/export', {
        ...this.queryParams
      }, `university_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
<style scoped>
.app-container{
  background-image: url("data:image/svg+xml;charset=utf-8;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxOTInIGhlaWdodD0nMTkyJyB2aWV3Qm94PScwIDAgMTkyIDE5Mic+PHBhdGggZmlsbD0nIzQ5NDg0OScgZmlsbC1vcGFjaXR5PScwLjA4JyBkPSdNMTkyIDE1djJhMTEgMTEgMCAwIDAtMTEgMTFjMCAxLjk0IDEuMTYgNC43NSAyLjUzIDYuMTFsMi4zNiAyLjM2YTYuOTMgNi45MyAwIDAgMSAxLjIyIDcuNTZsLS40My44NGE4LjA4IDguMDggMCAwIDEtNi42NiA0LjEzSDE0NXYzNS4wMmE2LjEgNi4xIDAgMCAwIDMuMDMgNC44N2wuODQuNDNjMS41OC43OSA0IC40IDUuMjQtLjg1bDIuMzYtMi4zNmExMi4wNCAxMi4wNCAwIDAgMSA3LjUxLTMuMTEgMTMgMTMgMCAxIDEgLjAyIDI2IDEyIDEyIDAgMCAxLTcuNTMtMy4xMWwtMi4zNi0yLjM2YTQuOTMgNC45MyAwIDAgMC01LjI0LS44NWwtLjg0LjQzYTYuMSA2LjEgMCAwIDAtMy4wMyA0Ljg3VjE0M2gzNS4wMmE4LjA4IDguMDggMCAwIDEgNi42NiA0LjEzbC40My44NGE2LjkxIDYuOTEgMCAwIDEtMS4yMiA3LjU2bC0yLjM2IDIuMzZBMTAuMDYgMTAuMDYgMCAwIDAgMTgxIDE2NGExMSAxMSAwIDAgMCAxMSAxMXYyYTEzIDEzIDAgMCAxLTEzLTEzIDEyIDEyIDAgMCAxIDMuMTEtNy41M2wyLjM2LTIuMzZhNC45MyA0LjkzIDAgMCAwIC44NS01LjI0bC0uNDMtLjg0YTYuMSA2LjEgMCAwIDAtNC44Ny0zLjAzSDE0NXYzNS4wMmE4LjA4IDguMDggMCAwIDEtNC4xMyA2LjY2bC0uODQuNDNhNi45MSA2LjkxIDAgMCAxLTcuNTYtMS4yMmwtMi4zNi0yLjM2QTEwLjA2IDEwLjA2IDAgMCAwIDEyNCAxODFhMTEgMTEgMCAwIDAtMTEgMTFoLTJhMTMgMTMgMCAwIDEgMTMtMTNjMi40NyAwIDUuNzkgMS4zNyA3LjUzIDMuMTFsMi4zNiAyLjM2YTQuOTQgNC45NCAwIDAgMCA1LjI0Ljg1bC44NC0uNDNhNi4xIDYuMSAwIDAgMCAzLjAzLTQuODdWMTQ1aC0zNS4wMmE4LjA4IDguMDggMCAwIDEtNi42Ni00LjEzbC0uNDMtLjg0YTYuOTEgNi45MSAwIDAgMSAxLjIyLTcuNTZsMi4zNi0yLjM2QTEwLjA2IDEwLjA2IDAgMCAwIDEwNyAxMjRhMTEgMTEgMCAwIDAtMjIgMGMwIDEuOTQgMS4xNiA0Ljc1IDIuNTMgNi4xMWwyLjM2IDIuMzZhNi45MyA2LjkzIDAgMCAxIDEuMjIgNy41NmwtLjQzLjg0YTguMDggOC4wOCAwIDAgMS02LjY2IDQuMTNINDl2MzUuMDJhNi4xIDYuMSAwIDAgMCAzLjAzIDQuODdsLjg0LjQzYzEuNTguNzkgNCAuNCA1LjI0LS44NWwyLjM2LTIuMzZhMTIuMDQgMTIuMDQgMCAwIDEgNy41MS0zLjExQTEzIDEzIDAgMCAxIDgxIDE5MmgtMmExMSAxMSAwIDAgMC0xMS0xMWMtMS45NCAwLTQuNzUgMS4xNi02LjExIDIuNTNsLTIuMzYgMi4zNmE2LjkzIDYuOTMgMCAwIDEtNy41NiAxLjIybC0uODQtLjQzYTguMDggOC4wOCAwIDAgMS00LjEzLTYuNjZWMTQ1SDExLjk4YTYuMSA2LjEgMCAwIDAtNC44NyAzLjAzbC0uNDMuODRjLS43OSAxLjU4LS40IDQgLjg1IDUuMjRsMi4zNiAyLjM2YTEyLjA0IDEyLjA0IDAgMCAxIDMuMTEgNy41MUExMyAxMyAwIDAgMSAwIDE3N3YtMmExMSAxMSAwIDAgMCAxMS0xMWMwLTEuOTQtMS4xNi00Ljc1LTIuNTMtNi4xMWwtMi4zNi0yLjM2YTYuOTMgNi45MyAwIDAgMS0xLjIyLTcuNTZsLjQzLS44NGE4LjA4IDguMDggMCAwIDEgNi42Ni00LjEzSDQ3di0zNS4wMmE2LjEgNi4xIDAgMCAwLTMuMDMtNC44N2wtLjg0LS40M2MtMS41OS0uOC00LS40LTUuMjQuODVsLTIuMzYgMi4zNkExMiAxMiAwIDAgMSAyOCAxMDlhMTMgMTMgMCAxIDEgMC0yNmMyLjQ3IDAgNS43OSAxLjM3IDcuNTMgMy4xMWwyLjM2IDIuMzZhNC45NCA0Ljk0IDAgMCAwIDUuMjQuODVsLjg0LS40M0E2LjEgNi4xIDAgMCAwIDQ3IDg0LjAyVjQ5SDExLjk4YTguMDggOC4wOCAwIDAgMS02LjY2LTQuMTNsLS40My0uODRhNi45MSA2LjkxIDAgMCAxIDEuMjItNy41NmwyLjM2LTIuMzZBMTAuMDYgMTAuMDYgMCAwIDAgMTEgMjggMTEgMTEgMCAwIDAgMCAxN3YtMmExMyAxMyAwIDAgMSAxMyAxM2MwIDIuNDctMS4zNyA1Ljc5LTMuMTEgNy41M2wtMi4zNiAyLjM2YTQuOTQgNC45NCAwIDAgMC0uODUgNS4yNGwuNDMuODRBNi4xIDYuMSAwIDAgMCAxMS45OCA0N0g0N1YxMS45OGE4LjA4IDguMDggMCAwIDEgNC4xMy02LjY2bC44NC0uNDNhNi45MSA2LjkxIDAgMCAxIDcuNTYgMS4yMmwyLjM2IDIuMzZBMTAuMDYgMTAuMDYgMCAwIDAgNjggMTEgMTEgMTEgMCAwIDAgNzkgMGgyYTEzIDEzIDAgMCAxLTEzIDEzIDEyIDEyIDAgMCAxLTcuNTMtMy4xMWwtMi4zNi0yLjM2YTQuOTMgNC45MyAwIDAgMC01LjI0LS44NWwtLjg0LjQzQTYuMSA2LjEgMCAwIDAgNDkgMTEuOThWNDdoMzUuMDJhOC4wOCA4LjA4IDAgMCAxIDYuNjYgNC4xM2wuNDMuODRhNi45MSA2LjkxIDAgMCAxLTEuMjIgNy41NmwtMi4zNiAyLjM2QTEwLjA2IDEwLjA2IDAgMCAwIDg1IDY4YTExIDExIDAgMCAwIDIyIDBjMC0xLjk0LTEuMTYtNC43NS0yLjUzLTYuMTFsLTIuMzYtMi4zNmE2LjkzIDYuOTMgMCAwIDEtMS4yMi03LjU2bC40My0uODRhOC4wOCA4LjA4IDAgMCAxIDYuNjYtNC4xM0gxNDNWMTEuOThhNi4xIDYuMSAwIDAgMC0zLjAzLTQuODdsLS44NC0uNDNjLTEuNTktLjgtNC0uNC01LjI0Ljg1bC0yLjM2IDIuMzZBMTIgMTIgMCAwIDEgMTI0IDEzYTEzIDEzIDAgMCAxLTEzLTEzaDJhMTEgMTEgMCAwIDAgMTEgMTFjMS45NCAwIDQuNzUtMS4xNiA2LjExLTIuNTNsMi4zNi0yLjM2YTYuOTMgNi45MyAwIDAgMSA3LjU2LTEuMjJsLjg0LjQzYTguMDggOC4wOCAwIDAgMSA0LjEzIDYuNjZWNDdoMzUuMDJhNi4xIDYuMSAwIDAgMCA0Ljg3LTMuMDNsLjQzLS44NGMuOC0xLjU5LjQtNC0uODUtNS4yNGwtMi4zNi0yLjM2QTEyIDEyIDAgMCAxIDE3OSAyOGExMyAxMyAwIDAgMSAxMy0xM3pNODQuMDIgMTQzYTYuMSA2LjEgMCAwIDAgNC44Ny0zLjAzbC40My0uODRjLjgtMS41OS40LTQtLjg1LTUuMjRsLTIuMzYtMi4zNkExMiAxMiAwIDAgMSA4MyAxMjRhMTMgMTMgMCAxIDEgMjYgMGMwIDIuNDctMS4zNyA1Ljc5LTMuMTEgNy41M2wtMi4zNiAyLjM2YTQuOTQgNC45NCAwIDAgMC0uODUgNS4yNGwuNDMuODRhNi4xIDYuMSAwIDAgMCA0Ljg3IDMuMDNIMTQzdi0zNS4wMmE4LjA4IDguMDggMCAwIDEgNC4xMy02LjY2bC44NC0uNDNhNi45MSA2LjkxIDAgMCAxIDcuNTYgMS4yMmwyLjM2IDIuMzZBMTAuMDYgMTAuMDYgMCAwIDAgMTY0IDEwN2ExMSAxMSAwIDAgMCAwLTIyYy0xLjk0IDAtNC43NSAxLjE2LTYuMTEgMi41M2wtMi4zNiAyLjM2YTYuOTMgNi45MyAwIDAgMS03LjU2IDEuMjJsLS44NC0uNDNhOC4wOCA4LjA4IDAgMCAxLTQuMTMtNi42NlY0OWgtMzUuMDJhNi4xIDYuMSAwIDAgMC00Ljg3IDMuMDNsLS40My44NGMtLjc5IDEuNTgtLjQgNCAuODUgNS4yNGwyLjM2IDIuMzZhMTIuMDQgMTIuMDQgMCAwIDEgMy4xMSA3LjUxQTEzIDEzIDAgMSAxIDgzIDY4YTEyIDEyIDAgMCAxIDMuMTEtNy41M2wyLjM2LTIuMzZhNC45MyA0LjkzIDAgMCAwIC44NS01LjI0bC0uNDMtLjg0QTYuMSA2LjEgMCAwIDAgODQuMDIgNDlINDl2MzUuMDJhOC4wOCA4LjA4IDAgMCAxLTQuMTMgNi42NmwtLjg0LjQzYTYuOTEgNi45MSAwIDAgMS03LjU2LTEuMjJsLTIuMzYtMi4zNkExMC4wNiAxMC4wNiAwIDAgMCAyOCA4NWExMSAxMSAwIDAgMCAwIDIyYzEuOTQgMCA0Ljc1LTEuMTYgNi4xMS0yLjUzbDIuMzYtMi4zNmE2LjkzIDYuOTMgMCAwIDEgNy41Ni0xLjIybC44NC40M2E4LjA4IDguMDggMCAwIDEgNC4xMyA2LjY2VjE0M2gzNS4wMnonPjwvcGF0aD48L3N2Zz4=");
  //height: 100vh;
}
.pagination-container {
  position: fixed;
  bottom: 10px;
  right: 10px;
  width: 100%;
  text-align: center;
  z-index: 999;
}
</style>
