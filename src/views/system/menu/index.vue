<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch">
      <el-form-item label="菜单名称" prop="menuName">
        <el-input
          v-model="queryParams.menuName"
          placeholder="请输入菜单名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="菜单状态" clearable>
          <el-option
            v-for="dict in dict.type.sys_normal_disable"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
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
          v-hasPermi="['system:menu:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="info"
          plain
          icon="el-icon-sort"
          size="mini"
          @click="toggleExpandAll"
        >展开/折叠</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table
      v-if="refreshTable"
      v-loading="loading"
      :data="menuList"
      row-key="menuId"
      :default-expand-all="isExpandAll"
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
    >
      <el-table-column prop="menuName" label="菜单名称" :show-overflow-tooltip="true" width="160"></el-table-column>
      <el-table-column prop="icon" label="图标" align="center" width="100">
        <template slot-scope="scope">
          <svg-icon :icon-class="scope.row.icon" />
        </template>
      </el-table-column>
      <el-table-column prop="orderNum" label="排序" width="60"></el-table-column>
      <el-table-column prop="perms" label="权限标识" :show-overflow-tooltip="true"></el-table-column>
      <el-table-column prop="component" label="组件路径" :show-overflow-tooltip="true"></el-table-column>
      <el-table-column prop="status" label="状态" width="80">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.sys_normal_disable" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:menu:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-plus"
            @click="handleAdd(scope.row)"
            v-hasPermi="['system:menu:add']"
          >新增</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:menu:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改菜单对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="680px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="上级菜单" prop="parentId">
              <treeselect
                v-model="form.parentId"
                :options="menuOptions"
                :normalizer="normalizer"
                :show-count="true"
                placeholder="选择上级菜单"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="菜单类型" prop="menuType">
              <el-radio-group v-model="form.menuType">
                <el-radio label="M">目录</el-radio>
                <el-radio label="C">菜单</el-radio>
                <el-radio label="F">按钮</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24" v-if="form.menuType != 'F'">
            <el-form-item label="菜单图标" prop="icon">
              <el-popover
                placement="bottom-start"
                width="460"
                trigger="click"
                @show="$refs['iconSelect'].reset()"
              >
                <IconSelect ref="iconSelect" @selected="selected" :active-icon="form.icon" />
                <el-input slot="reference" v-model="form.icon" placeholder="点击选择图标" readonly>
                  <svg-icon
                    v-if="form.icon"
                    slot="prefix"
                    :icon-class="form.icon"
                    style="width: 25px;"
                  />
                  <i v-else slot="prefix" class="el-icon-search el-input__icon" />
                </el-input>
              </el-popover>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="菜单名称" prop="menuName">
              <el-input v-model="form.menuName" placeholder="请输入菜单名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="显示排序" prop="orderNum">
              <el-input-number v-model="form.orderNum" controls-position="right" :min="0" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.menuType != 'F'">
            <el-form-item prop="isFrame">
              <span slot="label">
                <el-tooltip content="选择是外链则路由地址需要以`http(s)://`开头" placement="top">
                <i class="el-icon-question"></i>
                </el-tooltip>
                是否外链
              </span>
              <el-radio-group v-model="form.isFrame">
                <el-radio label="0">是</el-radio>
                <el-radio label="1">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.menuType != 'F'">
            <el-form-item prop="path">
              <span slot="label">
                <el-tooltip content="访问的路由地址，如：`user`，如外网地址需内链访问则以`http(s)://`开头" placement="top">
                <i class="el-icon-question"></i>
                </el-tooltip>
                路由地址
              </span>
              <el-input v-model="form.path" placeholder="请输入路由地址" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.menuType == 'C'">
            <el-form-item prop="component">
              <span slot="label">
                <el-tooltip content="访问的组件路径，如：`system/user/index`，默认在`views`目录下" placement="top">
                <i class="el-icon-question"></i>
                </el-tooltip>
                组件路径
              </span>
              <el-input v-model="form.component" placeholder="请输入组件路径" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.menuType != 'M'">
            <el-form-item prop="perms">
              <el-input v-model="form.perms" placeholder="请输入权限标识" maxlength="100" />
              <span slot="label">
                <el-tooltip content="控制器中定义的权限字符，如：@PreAuthorize(`@ss.hasPermi('system:user:list')`)" placement="top">
                <i class="el-icon-question"></i>
                </el-tooltip>
                权限字符
              </span>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.menuType == 'C'">
            <el-form-item prop="query">
              <el-input v-model="form.query" placeholder="请输入路由参数" maxlength="255" />
              <span slot="label">
                <el-tooltip content='访问路由的默认传递参数，如：`{"id": 1, "name": "ry"}`' placement="top">
                <i class="el-icon-question"></i>
                </el-tooltip>
                路由参数
              </span>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.menuType == 'C'">
            <el-form-item prop="isCache">
              <span slot="label">
                <el-tooltip content="选择是则会被`keep-alive`缓存，需要匹配组件的`name`和地址保持一致" placement="top">
                <i class="el-icon-question"></i>
                </el-tooltip>
                是否缓存
              </span>
              <el-radio-group v-model="form.isCache">
                <el-radio label="0">缓存</el-radio>
                <el-radio label="1">不缓存</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.menuType != 'F'">
            <el-form-item prop="visible">
              <span slot="label">
                <el-tooltip content="选择隐藏则路由将不会出现在侧边栏，但仍然可以访问" placement="top">
                <i class="el-icon-question"></i>
                </el-tooltip>
                显示状态
              </span>
              <el-radio-group v-model="form.visible">
                <el-radio
                  v-for="dict in dict.type.sys_show_hide"
                  :key="dict.value"
                  :label="dict.value"
                >{{dict.label}}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.menuType != 'F'">
            <el-form-item prop="status">
              <span slot="label">
                <el-tooltip content="选择停用则路由将不会出现在侧边栏，也不能被访问" placement="top">
                <i class="el-icon-question"></i>
                </el-tooltip>
                菜单状态
              </span>
              <el-radio-group v-model="form.status">
                <el-radio
                  v-for="dict in dict.type.sys_normal_disable"
                  :key="dict.value"
                  :label="dict.value"
                >{{dict.label}}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listMenu, getMenu, delMenu, addMenu, updateMenu } from "@/api/system/menu";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import IconSelect from "@/components/IconSelect";

export default {
  name: "Menu",
  dicts: ['sys_show_hide', 'sys_normal_disable'],
  components: { Treeselect, IconSelect },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 菜单表格树数据
      menuList: [],
      // 菜单树选项
      menuOptions: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 是否展开，默认全部折叠
      isExpandAll: false,
      // 重新渲染表格状态
      refreshTable: true,
      // 查询参数
      queryParams: {
        menuName: undefined,
        visible: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        menuName: [
          { required: true, message: "菜单名称不能为空", trigger: "blur" }
        ],
        orderNum: [
          { required: true, message: "菜单顺序不能为空", trigger: "blur" }
        ],
        path: [
          { required: true, message: "路由地址不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    // 选择图标
    selected(name) {
      this.form.icon = name;
    },
    /** 查询菜单列表 */
    getList() {
      this.loading = true;
      listMenu(this.queryParams).then(response => {
        this.menuList = this.handleTree(response.data, "menuId");
        this.loading = false;
      });
    },
    /** 转换菜单数据结构 */
    normalizer(node) {
      if (node.children && !node.children.length) {
        delete node.children;
      }
      return {
        id: node.menuId,
        label: node.menuName,
        children: node.children
      };
    },
    /** 查询菜单下拉树结构 */
    getTreeselect() {
      listMenu().then(response => {
        this.menuOptions = [];
        const menu = { menuId: 0, menuName: '主类目', children: [] };
        menu.children = this.handleTree(response.data, "menuId");
        this.menuOptions.push(menu);
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
        menuId: undefined,
        parentId: 0,
        menuName: undefined,
        icon: undefined,
        menuType: "M",
        orderNum: undefined,
        isFrame: "1",
        isCache: "0",
        visible: "0",
        status: "0"
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    /** 新增按钮操作 */
    handleAdd(row) {
      this.reset();
      this.getTreeselect();
      if (row != null && row.menuId) {
        this.form.parentId = row.menuId;
      } else {
        this.form.parentId = 0;
      }
      this.open = true;
      this.title = "添加菜单";
    },
    /** 展开/折叠操作 */
    toggleExpandAll() {
      this.refreshTable = false;
      this.isExpandAll = !this.isExpandAll;
      this.$nextTick(() => {
        this.refreshTable = true;
      });
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      this.getTreeselect();
      getMenu(row.menuId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改菜单";
      });
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.menuId != undefined) {
            updateMenu(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addMenu(this.form).then(response => {
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
      this.$modal.confirm('是否确认删除名称为"' + row.menuName + '"的数据项？').then(function() {
        return delMenu(row.menuId);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    }
  }
};
</script>
<style scoped>
.app-container{
  background-image: url("data:image/svg+xml;charset=utf-8;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxOTInIGhlaWdodD0nMTkyJyB2aWV3Qm94PScwIDAgMTkyIDE5Mic+PHBhdGggZmlsbD0nIzQ5NDg0OScgZmlsbC1vcGFjaXR5PScwLjA4JyBkPSdNMTkyIDE1djJhMTEgMTEgMCAwIDAtMTEgMTFjMCAxLjk0IDEuMTYgNC43NSAyLjUzIDYuMTFsMi4zNiAyLjM2YTYuOTMgNi45MyAwIDAgMSAxLjIyIDcuNTZsLS40My44NGE4LjA4IDguMDggMCAwIDEtNi42NiA0LjEzSDE0NXYzNS4wMmE2LjEgNi4xIDAgMCAwIDMuMDMgNC44N2wuODQuNDNjMS41OC43OSA0IC40IDUuMjQtLjg1bDIuMzYtMi4zNmExMi4wNCAxMi4wNCAwIDAgMSA3LjUxLTMuMTEgMTMgMTMgMCAxIDEgLjAyIDI2IDEyIDEyIDAgMCAxLTcuNTMtMy4xMWwtMi4zNi0yLjM2YTQuOTMgNC45MyAwIDAgMC01LjI0LS44NWwtLjg0LjQzYTYuMSA2LjEgMCAwIDAtMy4wMyA0Ljg3VjE0M2gzNS4wMmE4LjA4IDguMDggMCAwIDEgNi42NiA0LjEzbC40My44NGE2LjkxIDYuOTEgMCAwIDEtMS4yMiA3LjU2bC0yLjM2IDIuMzZBMTAuMDYgMTAuMDYgMCAwIDAgMTgxIDE2NGExMSAxMSAwIDAgMCAxMSAxMXYyYTEzIDEzIDAgMCAxLTEzLTEzIDEyIDEyIDAgMCAxIDMuMTEtNy41M2wyLjM2LTIuMzZhNC45MyA0LjkzIDAgMCAwIC44NS01LjI0bC0uNDMtLjg0YTYuMSA2LjEgMCAwIDAtNC44Ny0zLjAzSDE0NXYzNS4wMmE4LjA4IDguMDggMCAwIDEtNC4xMyA2LjY2bC0uODQuNDNhNi45MSA2LjkxIDAgMCAxLTcuNTYtMS4yMmwtMi4zNi0yLjM2QTEwLjA2IDEwLjA2IDAgMCAwIDEyNCAxODFhMTEgMTEgMCAwIDAtMTEgMTFoLTJhMTMgMTMgMCAwIDEgMTMtMTNjMi40NyAwIDUuNzkgMS4zNyA3LjUzIDMuMTFsMi4zNiAyLjM2YTQuOTQgNC45NCAwIDAgMCA1LjI0Ljg1bC44NC0uNDNhNi4xIDYuMSAwIDAgMCAzLjAzLTQuODdWMTQ1aC0zNS4wMmE4LjA4IDguMDggMCAwIDEtNi42Ni00LjEzbC0uNDMtLjg0YTYuOTEgNi45MSAwIDAgMSAxLjIyLTcuNTZsMi4zNi0yLjM2QTEwLjA2IDEwLjA2IDAgMCAwIDEwNyAxMjRhMTEgMTEgMCAwIDAtMjIgMGMwIDEuOTQgMS4xNiA0Ljc1IDIuNTMgNi4xMWwyLjM2IDIuMzZhNi45MyA2LjkzIDAgMCAxIDEuMjIgNy41NmwtLjQzLjg0YTguMDggOC4wOCAwIDAgMS02LjY2IDQuMTNINDl2MzUuMDJhNi4xIDYuMSAwIDAgMCAzLjAzIDQuODdsLjg0LjQzYzEuNTguNzkgNCAuNCA1LjI0LS44NWwyLjM2LTIuMzZhMTIuMDQgMTIuMDQgMCAwIDEgNy41MS0zLjExQTEzIDEzIDAgMCAxIDgxIDE5MmgtMmExMSAxMSAwIDAgMC0xMS0xMWMtMS45NCAwLTQuNzUgMS4xNi02LjExIDIuNTNsLTIuMzYgMi4zNmE2LjkzIDYuOTMgMCAwIDEtNy41NiAxLjIybC0uODQtLjQzYTguMDggOC4wOCAwIDAgMS00LjEzLTYuNjZWMTQ1SDExLjk4YTYuMSA2LjEgMCAwIDAtNC44NyAzLjAzbC0uNDMuODRjLS43OSAxLjU4LS40IDQgLjg1IDUuMjRsMi4zNiAyLjM2YTEyLjA0IDEyLjA0IDAgMCAxIDMuMTEgNy41MUExMyAxMyAwIDAgMSAwIDE3N3YtMmExMSAxMSAwIDAgMCAxMS0xMWMwLTEuOTQtMS4xNi00Ljc1LTIuNTMtNi4xMWwtMi4zNi0yLjM2YTYuOTMgNi45MyAwIDAgMS0xLjIyLTcuNTZsLjQzLS44NGE4LjA4IDguMDggMCAwIDEgNi42Ni00LjEzSDQ3di0zNS4wMmE2LjEgNi4xIDAgMCAwLTMuMDMtNC44N2wtLjg0LS40M2MtMS41OS0uOC00LS40LTUuMjQuODVsLTIuMzYgMi4zNkExMiAxMiAwIDAgMSAyOCAxMDlhMTMgMTMgMCAxIDEgMC0yNmMyLjQ3IDAgNS43OSAxLjM3IDcuNTMgMy4xMWwyLjM2IDIuMzZhNC45NCA0Ljk0IDAgMCAwIDUuMjQuODVsLjg0LS40M0E2LjEgNi4xIDAgMCAwIDQ3IDg0LjAyVjQ5SDExLjk4YTguMDggOC4wOCAwIDAgMS02LjY2LTQuMTNsLS40My0uODRhNi45MSA2LjkxIDAgMCAxIDEuMjItNy41NmwyLjM2LTIuMzZBMTAuMDYgMTAuMDYgMCAwIDAgMTEgMjggMTEgMTEgMCAwIDAgMCAxN3YtMmExMyAxMyAwIDAgMSAxMyAxM2MwIDIuNDctMS4zNyA1Ljc5LTMuMTEgNy41M2wtMi4zNiAyLjM2YTQuOTQgNC45NCAwIDAgMC0uODUgNS4yNGwuNDMuODRBNi4xIDYuMSAwIDAgMCAxMS45OCA0N0g0N1YxMS45OGE4LjA4IDguMDggMCAwIDEgNC4xMy02LjY2bC44NC0uNDNhNi45MSA2LjkxIDAgMCAxIDcuNTYgMS4yMmwyLjM2IDIuMzZBMTAuMDYgMTAuMDYgMCAwIDAgNjggMTEgMTEgMTEgMCAwIDAgNzkgMGgyYTEzIDEzIDAgMCAxLTEzIDEzIDEyIDEyIDAgMCAxLTcuNTMtMy4xMWwtMi4zNi0yLjM2YTQuOTMgNC45MyAwIDAgMC01LjI0LS44NWwtLjg0LjQzQTYuMSA2LjEgMCAwIDAgNDkgMTEuOThWNDdoMzUuMDJhOC4wOCA4LjA4IDAgMCAxIDYuNjYgNC4xM2wuNDMuODRhNi45MSA2LjkxIDAgMCAxLTEuMjIgNy41NmwtMi4zNiAyLjM2QTEwLjA2IDEwLjA2IDAgMCAwIDg1IDY4YTExIDExIDAgMCAwIDIyIDBjMC0xLjk0LTEuMTYtNC43NS0yLjUzLTYuMTFsLTIuMzYtMi4zNmE2LjkzIDYuOTMgMCAwIDEtMS4yMi03LjU2bC40My0uODRhOC4wOCA4LjA4IDAgMCAxIDYuNjYtNC4xM0gxNDNWMTEuOThhNi4xIDYuMSAwIDAgMC0zLjAzLTQuODdsLS44NC0uNDNjLTEuNTktLjgtNC0uNC01LjI0Ljg1bC0yLjM2IDIuMzZBMTIgMTIgMCAwIDEgMTI0IDEzYTEzIDEzIDAgMCAxLTEzLTEzaDJhMTEgMTEgMCAwIDAgMTEgMTFjMS45NCAwIDQuNzUtMS4xNiA2LjExLTIuNTNsMi4zNi0yLjM2YTYuOTMgNi45MyAwIDAgMSA3LjU2LTEuMjJsLjg0LjQzYTguMDggOC4wOCAwIDAgMSA0LjEzIDYuNjZWNDdoMzUuMDJhNi4xIDYuMSAwIDAgMCA0Ljg3LTMuMDNsLjQzLS44NGMuOC0xLjU5LjQtNC0uODUtNS4yNGwtMi4zNi0yLjM2QTEyIDEyIDAgMCAxIDE3OSAyOGExMyAxMyAwIDAgMSAxMy0xM3pNODQuMDIgMTQzYTYuMSA2LjEgMCAwIDAgNC44Ny0zLjAzbC40My0uODRjLjgtMS41OS40LTQtLjg1LTUuMjRsLTIuMzYtMi4zNkExMiAxMiAwIDAgMSA4MyAxMjRhMTMgMTMgMCAxIDEgMjYgMGMwIDIuNDctMS4zNyA1Ljc5LTMuMTEgNy41M2wtMi4zNiAyLjM2YTQuOTQgNC45NCAwIDAgMC0uODUgNS4yNGwuNDMuODRhNi4xIDYuMSAwIDAgMCA0Ljg3IDMuMDNIMTQzdi0zNS4wMmE4LjA4IDguMDggMCAwIDEgNC4xMy02LjY2bC44NC0uNDNhNi45MSA2LjkxIDAgMCAxIDcuNTYgMS4yMmwyLjM2IDIuMzZBMTAuMDYgMTAuMDYgMCAwIDAgMTY0IDEwN2ExMSAxMSAwIDAgMCAwLTIyYy0xLjk0IDAtNC43NSAxLjE2LTYuMTEgMi41M2wtMi4zNiAyLjM2YTYuOTMgNi45MyAwIDAgMS03LjU2IDEuMjJsLS44NC0uNDNhOC4wOCA4LjA4IDAgMCAxLTQuMTMtNi42NlY0OWgtMzUuMDJhNi4xIDYuMSAwIDAgMC00Ljg3IDMuMDNsLS40My44NGMtLjc5IDEuNTgtLjQgNCAuODUgNS4yNGwyLjM2IDIuMzZhMTIuMDQgMTIuMDQgMCAwIDEgMy4xMSA3LjUxQTEzIDEzIDAgMSAxIDgzIDY4YTEyIDEyIDAgMCAxIDMuMTEtNy41M2wyLjM2LTIuMzZhNC45MyA0LjkzIDAgMCAwIC44NS01LjI0bC0uNDMtLjg0QTYuMSA2LjEgMCAwIDAgODQuMDIgNDlINDl2MzUuMDJhOC4wOCA4LjA4IDAgMCAxLTQuMTMgNi42NmwtLjg0LjQzYTYuOTEgNi45MSAwIDAgMS03LjU2LTEuMjJsLTIuMzYtMi4zNkExMC4wNiAxMC4wNiAwIDAgMCAyOCA4NWExMSAxMSAwIDAgMCAwIDIyYzEuOTQgMCA0Ljc1LTEuMTYgNi4xMS0yLjUzbDIuMzYtMi4zNmE2LjkzIDYuOTMgMCAwIDEgNy41Ni0xLjIybC44NC40M2E4LjA4IDguMDggMCAwIDEgNC4xMyA2LjY2VjE0M2gzNS4wMnonPjwvcGF0aD48L3N2Zz4=");
  height: 100vh;
}
</style>
