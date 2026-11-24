<template>
  <div class="workzonehead-wrapper"></div>
  <el-button-group class="ml-4">
    <el-button type="primary" :icon="Plus" @click="showCreateUserDialog"
      >添加成员</el-button
    >
  </el-button-group>
  <el-table
    :data="state.userData"
    style="width: 100%"
    @row-dblclick="onUserTableRowDBClicked"
  >
    <el-table-column fixed prop="name" label="姓名" min-width="15%" />
    <!-- <el-table-column prop="department" label="部门" min-width="18%">
      <template #default="scope">
        {{ getBCompanyText(scope.row.department) }}
      </template>
    </el-table-column> -->
    <el-table-column prop="level" label="职级" min-width="15%">
      <template #default="scope">
        {{ getLevelText(scope.row.level) }}
      </template>
    </el-table-column>
    <!-- <el-table-column prop="leader" label="汇报人" min-width="15%">
      <template #default="scope">
        {{ getLeaderText(scope.row.leader) }}
      </template>
    </el-table-column> -->
    <el-table-column prop="cellnumber" label="联系方式" min-width="20%" />
    <el-table-column prop="email" label="电子邮箱" min-width="30%" />
    <el-table-column prop="loginaccount" label="登录账号" min-width="18%" />
    <el-table-column prop="createtime" label="创建时间" min-width="25%">
      <template #default="scope">
        {{ getTimeText(scope.row.createtime) }}
      </template>
    </el-table-column>
    <el-table-column
      prop="status"
      label="账号状态"
      min-width="15%"
      text-align="center"
    >
      <template #default="scope">
        <span v-if="scope.row.status === 0" style="color: green">正常</span>
        <span v-else-if="scope.row.status === 1" style="color: red">停用</span>
        <span v-else style="color: orange">异常</span>
      </template>
    </el-table-column>
    <el-table-column fixed="right" label="Operations" min-width="25%">
      <template #default="scope">
        <el-button
          type="primary"
          size="small"
          @click="handleSwitchUserStatus(scope.row)"
          >{{ scope.row.status === 0 ? "停用账号" : "恢复账号" }}</el-button
        >
        <el-button
          type="primary"
          size="small"
          @click="handleResetPassword(scope.row)"
          >重置密码</el-button
        >
      </template>
    </el-table-column>
  </el-table>

  <!-- 添加用户模态窗口 -->
  <el-dialog v-model="state.showUserInfoDialog" width="60%" :show-close="false">
    <div class="dialog-title-wrapper">
      <span role="heading" aria-level="2" class="el-dialog__title">{{
        state.createUserForm.id ? "修改成员信息" : "添加成员"
      }}</span>
    </div>
    <el-form :model="state.createUserForm" status-icon label-width="120px">
      <div class="line-wrapper">
        <el-form-item label="姓名" prop="name">
          <el-input
            v-model.trim="state.createUserForm.name"
            style="width: 190px"
            placeholder="请填写姓名"
          />
        </el-form-item>
        <el-form-item label="手机号码" prop="cellnumber">
          <el-input
            v-model.trim="state.createUserForm.cellnumber"
            placeholder="请输入手机号码"
            style="width: 190px"
          />
        </el-form-item>
        <el-form-item label="登录账号" prop="loginaccount">
          <el-input
            v-model.trim="state.createUserForm.loginaccount"
            placeholder="请输入登录账号"
            style="width: 190px"
          />
        </el-form-item>
      </div>
      <div class="line-wrapper">
        <!-- <el-form-item label="部门" prop="department">
          <el-select
            v-model.trim="state.createUserForm.department"
            placeholder="请选择部门"
          >
            <el-option
              v-for="item in store.state.arrayDepartments"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item> -->
        <el-form-item label="电子邮箱" prop="email">
          <el-input
            v-model.trim="state.createUserForm.email"
            placeholder="请输入电子邮箱"
            style="width: 190px"
          />
        </el-form-item>

        <el-form-item label="身份" prop="level" style="width: 310px">
          <el-select
            v-model.trim="state.createUserForm.level"
            placeholder="请选择身份"
            @change="handleLevelSelectChange"
          >
            <el-option
              v-for="item in arrayLevels"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="所属企业" prop="bcompany" style="width: 310px">
          <el-select
            v-model.trim="state.createUserForm.bcompanyid"
            placeholder="请选择所属企业"
            filterable
          >
            <el-option
              v-for="item in state.arrbcompanies"
              :key="item.id"
              :label="item.bcompanyname"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </div>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="abortCreateUser">取消</el-button>
        <el-button type="primary" @click="saveCreateUser"> 保存 </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="js" setup>
import { ref, reactive } from "vue";
import { onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { ElMessage } from "element-plus";
import { Delete, Edit, Plus } from "@element-plus/icons-vue";

import request from "../../utils/request";
import store from "../../store";

import {
  getCurrentDateTime,
  getCurrentTimestamp,
  timestamp2datetime,
  datatime2timestamp,
} from "../../utils";

const dialogCreateUserVisible = ref(false); // 添加用户模态窗口显示隐藏控制
const dialogOnCreateStatus = ref(true); // 添加用户模态窗口处于创建或修改状态标识 创建：true/修改：false

const resetForm = () => {
  state.createUserForm.id = "";
  state.createUserForm.name = "";
  state.createUserForm.bcompanyid = "";
  state.createUserForm.level = 0;
  state.createUserForm.cellnumber = "";
  state.createUserForm.loginaccount = "";
  state.createUserForm.createtime = "";
  state.createUserForm.updatetime = "";
  state.createUserForm.status = "";
  state.createUserForm.password = "";
  state.createUserForm.email = "";
};
const state = reactive({
  userData: [],
  arrayLeaders: [],
  createUserForm: {
    id: "",
    name: "",
    bcompanyid: "",
    level: "",
    cellnumber: "",
    loginaccount: "",
    createtime: "",
    updatetime: "",
    status: "",
    password: "",
    email: "",
  },
  showUserInfoDialog: false,
  boolParamsReady: false,
  arrbcompanies: [],
});

const arrayLevels = reactive([
  {
    value: 0,
    label: "普通用户",
  },
  {
    value: 1,
    label: "管理员",
  },
]);

const getUsers = () => {
  let payload = {};
  request.post("/getbuserlist", payload).then((res) => {
    if (res) {
      state.userData = res.data;

      // 页面加载时默认leader数组用user赋值
      state.arrayLeaders = res.data;
    } else {
      ElMessage.error("获取用户数据失败！");
    }
  });
};

// 处理调整用户状态操作
const handleSwitchUserStatus = (row) => {
  let tip_text = row.status === 0 ? "是否要关停账号?" : "是否要恢复账号?";
  ElMessageBox.confirm(tip_text)
    .then(() => {
      let payload = {
        id: row.id,
        status: row.status,
      };
      request.post("/updatebuserstatus", payload).then((res) => {
        if (res) {
          getUsers();
          ElMessage("用户信息更新完毕！");
        } else {
          ElMessage.error("更新用户数据失败！");
        }
      });
    })
    .catch(() => {
      // catch error
    });
};

// 用户列表行双击，进入用户信息维护状态
const onUserTableRowDBClicked = (row, column, event) => {
  state.createUserForm.id = row.id;
  state.createUserForm.name = row.name;
  state.createUserForm.level = row.level;
  state.createUserForm.bcompanyid = row.bcompanyid;
  state.createUserForm.cellnumber = row.cellnumber;
  state.createUserForm.loginaccount = row.loginaccount;
  state.createUserForm.createtime = row.createtime;
  state.createUserForm.updatetime = row.updatetime;
  state.createUserForm.password = row.password;
  state.createUserForm.status = row.status;
  state.createUserForm.email = row.email;

  showCreateUserDialog(); // 显示对话框
};

//添加用户模态窗相关事件
// 显示创建用户窗口(创建成员)
const showCreateUserDialog = () => {
  state.showUserInfoDialog = true;
};

const abortCreateUser = () => {
  let tip_text = state.createUserForm.id
    ? "是否要放弃修改成员信息?"
    : "是否要放弃创建成员?";
  ElMessageBox.confirm(tip_text)
    .then(() => {
      resetForm();
      state.showUserInfoDialog = false;
    })
    .catch(() => {
      // catch error
    });
};
const checkParams = () => {
  // 检查用户姓名
  if (state.createUserForm.name === "") {
    state.boolParamsReady = false;
    ElMessageBox.alert("请填写用户姓名！", "保存错误", {
      confirmButtonText: "OK",
    });
    return;
  }
  // 检查用户登录账号名称
  if (state.createUserForm.loginaccount === "") {
    state.boolParamsReady = false;
    ElMessageBox.alert("请填写用户登录账户名称！", "保存错误", {
      confirmButtonText: "OK",
    });
    return;
  }
  // 检查用户所属单位
  if (state.createUserForm.bcompanyid === "") {
    state.boolParamsReady = false;
    ElMessageBox.alert("请选择用户所属企业！", "保存错误", {
      confirmButtonText: "OK",
    });
    return;
  }
  // 检查用户职级
  if (state.createUserForm.level === "") {
    state.boolParamsReady = false;
    ElMessageBox.alert("请选择用户身份！", "保存错误", {
      confirmButtonText: "OK",
    });
    return;
  }
  // // 检查用户汇报人
  // if (state.createUserForm.leader === "") {
  //   state.boolParamsReady = false;
  //   ElMessageBox.alert('请选择用户汇报人！', '保存错误', {confirmButtonText: 'OK',});
  //   return;
  // }

  // 检查用户汇报人
  if (state.createUserForm.email === "") {
    state.boolParamsReady = false;
    ElMessageBox.alert("请填写电子邮箱！", "保存错误", {
      confirmButtonText: "OK",
    });
    return;
  }

  state.boolParamsReady = true;
};
const saveCreateUser = () => {
  checkParams(); // 参数检查
  if (!state.boolParamsReady) {
    return;
  }
  let tip_text = state.createUserForm.id
    ? "是否要保存成员信息?"
    : "是否要创建成员?";
  ElMessageBox.confirm(tip_text)
    .then(() => {
      request.post("/updatebuser", state.createUserForm).then((res) => {
        if (res) {
          getUsers();

          ElMessage("用户信息更新完毕！");
          resetForm();
          state.showUserInfoDialog = false;
        } else {
          ElMessage.error("更新用户数据失败！");
        }
      });
    })
    .catch(() => {
      // catch error
    });
};

const handleResetPassword = (row) => {
  let tip_text = "确定要重置密码？";
  ElMessageBox.confirm(tip_text)
    .then(() => {
      let payload = {
        username: row.loginaccount,
      };
      request.post("/user/bresetpass", payload).then((res) => {
        if (res) {
          ElMessageBox.alert("密码修改成功", "修改密码", {
            confirmButtonText: "OK",
          });
        } else {
          ElMessage.error("更新用户数据失败！");
        }
      });
    })
    .catch(() => {});
};
// 渲染表格企业列
const getBCompanyText = (value) => {
  for (let i = 0; i < store.state.arrbcompanies.length; i++) {
    if (value === store.state.arrbcompanies[i].value) {
      return store.state.arrbcompanies[i].label;
    }
  }
  return "";
};
// 渲染表格职级列
const getLevelText = (value) => {
  for (let i = 0; i < arrayLevels.length; i++) {
    if (value === arrayLevels[i].value) {
      return arrayLevels[i].label;
    }
  }
  return "";
};
// 渲染表格汇报人列
const getLeaderText = (userid) => {
  for (let i = 0; i < state.userData.length; i++) {
    if (userid === state.userData[i].id) {
      return state.userData[i].name;
    }
  }
  return "";
};
// 渲染表格创建时间列
const getTimeText = (createtime) => {
  return timestamp2datetime(createtime);
};

const handleLevelSelectChange = () => {
  state.arrayLeaders = state.userData.filter(
    (item) => item.level < createUserForm.level,
  );
};

const getbcompanylist = () => {
  request.post("/getbcompanylist", {}).then((res) => {
    if (res && res.code === "200") {
      state.arrbcompanies = res.data;
    } else {
      ElMessage.error("获取管理部门数据失败！");
    }
  });
};

// 当组件被创建并且DOM已经生成之后,默认加载项目管理子页面
onMounted(() => {
  getUsers();
  getbcompanylist();
});
</script>

<style lang="scss" scoped>
.workzonehead-wrapper {
  width: 100%;
  height: 64px;
  background-color: white;
}

.line-wrapper {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
}

.select-label {
  width: 120px;
  display: inline-flex;
  justify-content: flex-end;
  align-items: flex-start;
  flex: 0 0 auto;
  font-size: var(--el-form-label-font-size);
  color: var(--el-text-color-regular);
  height: 32px;
  line-height: 32px;
  padding: 0 12px 0 0;
  box-sizing: border-box;
}

.dialog-title-wrapper {
  padding: var(--el-dialog-padding-primary);
  padding-bottom: 10px;
  margin-right: 16px;
  margin-bottom: 45px;
}
</style>
