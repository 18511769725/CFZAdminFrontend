<template>
  <div class="workzonehead-wrapper"></div>
  <el-button-group class="ml-4">
    <el-button type="primary" :icon="Plus" @click="showCreateHotLine"
      >添加热线电话</el-button
    >
  </el-button-group>
  <el-table
    :data="state.arrhotlineconfigs"
    style="width: 100%"
    @row-dblclick="onTableRowDBClicked"
  >
    <el-table-column fixed prop="id" label="ID" min-width="15%" />
    <el-table-column prop="title" label="岗位名称" min-width="15%" />
    <el-table-column prop="telnumber" label="电话号码" min-width="20%" />
    <el-table-column prop="nametext" label="人员姓名" min-width="30%" />
    <el-table-column prop="createtime" label="创建时间" min-width="25%">
      <template #default="scope">
        {{ getTimeText(scope.row.createtime) }}
      </template>
    </el-table-column>
    <el-table-column prop="updatetime" label="更新时间" min-width="25%">
      <template #default="scope">
        {{ getTimeText(scope.row.updatetime) }}
      </template>
    </el-table-column>
    <el-table-column prop="status" label="状态" min-width="25%">
      <template #default="scope">
        {{ scope.row.status === 1 ? "启用" : "停用" }}
      </template>
    </el-table-column>
    <el-table-column fixed="right" label="Operations" min-width="25%">
      <template #default="scope">
        <el-button
          :type="scope.row.status === 1 ? 'danger' : 'success'"
          size="small"
          @click="handleSwitchHotlineStatus(scope.row)"
          >{{ scope.row.status === 1 ? "停用" : "启用" }}</el-button
        >
        <el-button
          type="primary"
          size="small"
          @click="handleDeleteHotline(scope.row)"
          >删除热线</el-button
        >
      </template>
    </el-table-column>
  </el-table>

  <!-- 模态窗口 -->
  <el-dialog
    v-model="state.showHotlineInfoDialog"
    width="60%"
    :show-close="false"
  >
    <div class="dialog-title-wrapper">
      <span role="heading" aria-level="2" class="el-dialog__title">{{
        state.createHotlineForm.id ? "修改成员信息" : "添加成员"
      }}</span>
    </div>
    <el-form :model="state.createHotlineForm" status-icon label-width="120px">
      <div class="line-wrapper">
        <el-form-item label="岗位名称" prop="title" required>
          <el-input
            v-model.trim="state.createHotlineForm.title"
            style="width: 190px"
            placeholder="请填写岗位名称"
          />
        </el-form-item>
        <el-form-item label="电话号码" prop="telnumber" required>
          <el-input
            v-model.trim="state.createHotlineForm.telnumber"
            placeholder="请输入电话号码"
            style="width: 190px"
          />
        </el-form-item>
        <el-form-item label="人员姓名" prop="nametext">
          <el-input
            v-model.trim="state.createHotlineForm.nametext"
            placeholder="请输入人员姓名"
            style="width: 190px"
          />
        </el-form-item>
      </div>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="abortCreateHotline">取消</el-button>
        <el-button type="primary" @click="saveCreateHotline"> 保存 </el-button>
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

import { timestamp2datetime } from "../../utils";

const resetForm = () => {
  state.createHotlineForm.id = "";
  state.createHotlineForm.title = "";
  state.createHotlineForm.telnumber = "";
  state.createHotlineForm.nametext = "";
};
const state = reactive({
  arrhotlineconfigs: [],
  arrayLeaders: [],
  createHotlineForm: {
    id: "",
    title: "",
    telnumber: "",
    nametext: "",
  },
  showHotlineInfoDialog: false,
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

// 处理调整用户状态操作
const handleDeleteHotline = (row) => {
  let tip_text = "是否要删除配置?";
  ElMessageBox.confirm(tip_text)
    .then(() => {
      let payload = {
        id: row.id,
      };
      request.post("/deletehotlineconfig", payload).then((res) => {
        if (res) {
          gethotlineconfigs();
          ElMessage("信息删除完毕！");
        } else {
          ElMessage.error("删除信息失败！");
        }
      });
    })
    .catch(() => {
      // catch error
    });
};

const handleSwitchHotlineStatus = (row) => {
  const nextStatus = row.status === 1 ? 0 : 1;
  const tipText = nextStatus === 1 ? "是否要启用该热线配置?" : "是否要停用该热线配置?";

  ElMessageBox.confirm(tipText)
    .then(() => {
      request
        .post("/updatehotlinestatus", {
          id: row.id,
          status: nextStatus,
        })
        .then((res) => {
          if (res) {
            gethotlineconfigs();
            ElMessage(nextStatus === 1 ? "热线配置已启用！" : "热线配置已停用！");
          } else {
            ElMessage.error("更新热线状态失败！");
          }
        });
    })
    .catch(() => {
      // catch error
    });
};

// 用户列表行双击，进入用户信息维护状态
const onTableRowDBClicked = (row, column, event) => {
  state.createHotlineForm.id = row.id;
  state.createHotlineForm.title = row.title;
  state.createHotlineForm.telnumber = row.telnumber;
  state.createHotlineForm.nametext = row.nametext;

  showCreateHotLine(); // 显示对话框
};

//添加用户模态窗相关事件
// 显示创建用户窗口(创建成员)
const showCreateHotLine = () => {
  state.showHotlineInfoDialog = true;
};

const abortCreateHotline = () => {
  let tip_text = state.createHotlineForm.id
    ? "是否要放弃修改成员信息?"
    : "是否要放弃创建成员?";
  ElMessageBox.confirm(tip_text)
    .then(() => {
      resetForm();
      state.showHotlineInfoDialog = false;
    })
    .catch(() => {
      // catch error
    });
};

const saveCreateHotline = () => {
  // 强制检查state.createHotlineForm.title、state.createHotlineForm.telnumber是否为空
  if (state.createHotlineForm.title === "") {
    ElMessageBox.alert("请填写岗位名称！", "保存错误", {
      confirmButtonText: "OK",
    });
    return;
  }
  if (state.createHotlineForm.telnumber === "") {
    ElMessageBox.alert("请填写电话号码！", "保存错误", {
      confirmButtonText: "OK",
    });
    return;
  }
  const phonePattern =
    /^(?:1[3-9]\d{9}|0\d{2,3}[- ]?\d{7,8}(?:[- ]?\d{1,6})?)$/;
  if (!phonePattern.test(state.createHotlineForm.telnumber)) {
    ElMessageBox.alert("请输入有效的手机号或座机号！", "保存错误", {
      confirmButtonText: "OK",
    });
    return;
  }
  let tip_text = state.createHotlineForm.id
    ? "是否要保存热线信息?"
    : "是否要创建热线信息?";
  ElMessageBox.confirm(tip_text)
    .then(() => {
      request
        .post("/updatehotlineinfo", state.createHotlineForm)
        .then((res) => {
          if (res) {
            ElMessage("用户信息更新完毕！");
            resetForm();
            gethotlineconfigs();
            state.showHotlineInfoDialog = false;
          } else {
            ElMessage.error("更新热线信息失败！");
          }
        });
    })
    .catch(() => {
      // catch error
    });
};

// 渲染表格创建时间列
const getTimeText = (createtime) => {
  return timestamp2datetime(createtime);
};

const gethotlineconfigs = () => {
  request.post("/gethotlineconfigs", {}).then((res) => {
    if (res && res.code === "200") {
      state.arrhotlineconfigs = res.data;
    } else {
      ElMessage.error("获取热线配置数据失败！");
    }
  });
};

// 当组件被创建并且DOM已经生成之后,默认加载项目管理子页面
onMounted(() => {
  gethotlineconfigs();
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
