<template>
  <div class="task-content-wrapper">
    <div class="task-table-wrapper">
      <div class="workzonehead-wrapper">
        <el-button
          type="primary"
          :icon="Plus"
          @click="showTaskInfoDialog()"
          style="margin-left: 15px"
          >创建任务</el-button
        >
        <el-select
          v-model="state.getTaskListParams.selectType"
          class="m-2"
          placeholder="筛选方式"
          size="default"
          style="width: 200px; margin-left: 25px"
          @change="getTaskData"
        >
          <el-option
            v-for="item in state.selectTypes"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <el-input
          v-model="state.getTaskListParams.tasktitle"
          clearable
          placeholder="检索匹配项目名"
          style="width: 360px; height: 32px; margin-left: 15px"
        />
        <el-button type="primary" @click="getTaskData" style="margin-left: 25px"
          >点击查询</el-button
        >
      </div>
      <el-table
        :data="state.taskData"
        style="width: 100%"
        @row-dblclick="onTaskTableRowDBClicked"
      >
        <el-table-column type="expand">
          <template #default="scope">
            <div class="table-fold-wrapper">
              <div class="fold-line-wrapper">
                <p style="width: 100px; font-weight: bold">任务简介:</p>
                <p style="width: 75%">{{ scope.row.task_desc }}</p>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="任务名称" min-width="25%" />
        <el-table-column prop="proj_title" label="所属项目" min-width="25%" />
        <el-table-column
          prop="task_promoter_id"
          label="任务发起人"
          min-width="15%"
        >
          <template #default="scope">
            {{ getOwnerText(scope.row.task_promoter_id) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="task_owner_id"
          label="任务负责人"
          min-width="15%"
        >
          <template #default="scope">
            {{ getOwnerText(scope.row.task_owner_id) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="task_start_time"
          label="任务发起日期"
          min-width="15%"
        >
          <template #default="scope">
            {{ getDateText(scope.row.task_start_time) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="task_deadline"
          label="任务截止日期"
          min-width="15%"
        >
          <template #default="scope">
            {{ getDateText(scope.row.task_deadline) }}
          </template>
        </el-table-column>
        <el-table-column prop="sharetype" label="任务状态" min-width="20%">
          <template #default="scope">
            <el-select
              v-model="scope.row.task_status"
              class="m-2"
              placeholder="任务状态"
              size="default"
              style="width: 140px"
              :loading="state.taskStatusLoading"
              @change="handleTaskStatusChange(scope.row)"
            >
              <el-option
                v-for="item in state.taskStatusTypes"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </template>
        </el-table-column>
        <!-- <el-table-column prop="task_confirm_time" label="任务接受时间" min-width="25%">
          <template #default="scope">
            {{ getTimeText(scope.row.task_confirm_time) }}
          </template>
        </el-table-column> -->
        <el-table-column
          prop="task_complete_time"
          label="任务完成时间"
          min-width="25%"
        >
          <template #default="scope">
            {{ getTimeText(scope.row.task_complete_time) }}
          </template>
        </el-table-column>
        <!-- <el-table-column prop="last_modify_time" label="任务更新时间" min-width="25%">
          <template #default="scope">
            {{ getTimeText(scope.row.last_modify_time) }}
          </template>
        </el-table-column> -->
        <el-table-column fixed="right" label="Operations" min-width="30%">
          <template #default="scope">
            <el-button type="primary" @click="handleShowProgress(scope.row)"
              >查看进展</el-button
            >
            <el-button type="primary" @click="handleShowProjFiles(scope.row)"
              >文件管理</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="task-pagination-wrapper">
      <el-pagination
        v-model:current-page="state.getTaskListParams.currentPage"
        :page-size="30"
        layout="total, prev, pager, next"
        :total="state.getTaskListParams.totalCount"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
  <!-- 项目信息模态窗口 -->
  <el-dialog
    v-model="state.showTaskInfoDialog"
    width="80%"
    :show-close="false"
    @close="resetForm"
  >
    <div class="dialog-title-wrapper">
      <span role="heading" aria-level="2" class="el-dialog__title">{{
        state.taskInfoForm.id ? "修改任务信息" : "创建任务"
      }}</span>
    </div>
    <el-form :model="state.taskInfoForm" status-icon label-width="120px">
      <div class="line-wrapper">
        <el-form-item label="任务名称" prop="title" style="width: 90%">
          <el-input v-model="state.taskInfoForm.title" placeholder="任务名称" />
        </el-form-item>
      </div>
      <div class="line-wrapper">
        <el-form-item label="所属项目" prop="proj_id" style="width: 99%">
          <el-select
            v-model="state.taskInfoForm.proj_id"
            placeholder="请选择所属项目"
            clearable
            filterable
            :filter-method="onProjectSelect"
            style="width: 90%"
          >
            <el-option
              v-for="item in state.projects"
              :key="item.id"
              :label="item.title"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </div>
      <div class="line-wrapper">
        <el-form-item label="任务发起人" prop="task_promoter_id">
          <el-select
            v-model="state.taskInfoForm.task_promoter_id"
            placeholder="任务发起人"
            disabled
          >
            <el-option
              v-for="item in store.state.userlist"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="任务负责人" prop="owner_id">
          <el-select
            v-model="state.taskInfoForm.task_owner_id"
            placeholder="请选择任务负责人"
          >
            <el-option
              v-for="item in store.state.userlist"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </div>
      <div class="line-wrapper">
        <el-form-item label="任务发起时间" prop="task_start_time">
          <el-date-picker
            v-model="state.taskInfoForm.task_start_time"
            type="datetime"
            placeholder="无需填写"
            format="YYYY/MM/DD HH:mm:ss"
            value-format="x"
            readonly
          />
        </el-form-item>
        <el-form-item label="任务截止时间" prop="task_deadline">
          <el-date-picker
            v-model="state.taskInfoForm.task_deadline"
            type="datetime"
            placeholder="Pick a Date"
            format="YYYY/MM/DD HH:mm:ss"
            value-format="x"
          />
        </el-form-item>
      </div>
      <div class="line-wrapper">
        <el-form-item label="任务确认时间" prop="task_confirm_time">
          <el-date-picker
            v-model="state.taskInfoForm.task_confirm_time"
            type="datetime"
            placeholder="无需填写"
            format="YYYY/MM/DD HH:mm:ss"
            value-format="x"
            readonly
          />
        </el-form-item>
        <el-form-item label="任务完成时间" prop="task_complete_time">
          <el-date-picker
            v-model="state.taskInfoForm.task_complete_time"
            type="datetime"
            placeholder="无需填写"
            format="YYYY/MM/DD HH:mm:ss"
            value-format="x"
            readonly
          />
        </el-form-item>
      </div>
      <div class="line-wrapper">
        <el-form-item
          label="任务简介"
          prop="task_desc"
          style="width: 90%; line-height: 50px"
        >
          <el-input
            v-model="state.taskInfoForm.task_desc"
            placeholder="请填写任务简介"
            maxlength="300"
            show-word-limit
            type="textarea"
            style="height: 100px"
            input-style="height: 85px;"
          />
        </el-form-item>
      </div>
    </el-form>
    <template #footer>
      <div class="dialog-footer-wrapper">
        <el-button
          v-if="state.taskInfoForm.id"
          type="danger"
          @click="deleteTask"
          >删除任务</el-button
        >
        <div />
        <span class="dialog-footer">
          <el-button @click="abortSaveTaskInfo">取消</el-button>
          <el-button type="primary" @click="saveTaskInfo"> 保存 </el-button>
        </span>
      </div>
    </template>
  </el-dialog>
  <!-- 任务进展模态窗口 -->
  <el-dialog
    v-model="state.showProgressListDialog"
    width="80%"
    :show-close="true"
    @close="closeProgressListDialog"
  >
    <div class="dialog-title-wrapper">
      <span role="heading" aria-level="2" class="el-dialog__title"
        >任务名称：{{ state.taskInfoInProgressDialog.task_title }}</span
      >
    </div>
    <div class="line-wrapper">
      <el-button type="primary" @click="handleCreateProgress"
        >+ 创建新进展</el-button
      >
    </div>
    <div class="task-table-in-task-info-wrapper">
      <el-table :data="state.progress" style="width: 100%">
        <el-table-column type="expand">
          <template #default="scope">
            <div class="table-fold-wrapper">
              <div class="fold-line-wrapper">
                <p style="width: 100px; font-weight: bold">进展说明:</p>
                <p style="width: 75%">{{ scope.row.description }}</p>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="id" label="进展ID" min-width="10%" />
        <el-table-column prop="datetime" label="进展发生日期" min-width="20%">
          <template #default="scope">
            {{ timestamp2date(scope.row.datetime) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="last_modify_time"
          label="进展更新时间"
          min-width="25%"
        >
          <template #default="scope">
            {{ timestamp2datetime(scope.row.last_modify_time) }}
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="Operations" min-width="15%">
          <template #default="scope">
            <el-button
              type="primary"
              @click="
                showProgressDetail(state.taskInfoInProgressDialog, scope.row)
              "
              >编辑</el-button
            >
            <el-button type="primary" @click="handleShowProjFiles(scope.row)"
              >文件管理</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>
  </el-dialog>
  <!-- 任务进展详情模态窗口 -->
  <el-dialog
    v-model="state.showProgressDetailDialog"
    width="80%"
    :show-close="true"
    @close="closeProgressDetailDialog"
  >
    <div class="dialog-title-wrapper">
      <span role="heading" aria-level="2" class="el-dialog__title"
        >进展详情</span
      >
    </div>
    <div class="line-wrapper">
      <el-form-item label="进展发生日期" prop="progress_datetime">
        <el-date-picker
          v-model="state.progressInfoDialog.datetime"
          type="date"
          placeholder="进展发生日期"
          format="YYYY/MM/DD"
          value-format="x"
        />
      </el-form-item>
    </div>
    <div class="line-wrapper">
      <el-form-item
        label="任务进展说明"
        prop="progress_desc"
        style="width: 90%; line-height: 50px"
      >
        <el-input
          v-model="state.progressInfoDialog.description"
          placeholder="任务进展说明"
          maxlength="300"
          show-word-limit
          type="textarea"
          style="height: 100px"
          input-style="height: 85px;"
        />
      </el-form-item>
    </div>
    <template #footer>
      <div class="dialog-footer-wrapper">
        <el-button
          v-if="state.progressInfoDialog.id"
          type="danger"
          @click="deleteProgress"
          >删除进展</el-button
        >
        <div />
        <span class="dialog-footer">
          <el-button @click="abortSaveProgressInfo">取消</el-button>
          <el-button type="primary" @click="saveProgressInfo"> 保存 </el-button>
        </span>
      </div>
    </template>
  </el-dialog>
  <!-- 项目文件管理模态窗口 -->
  <el-dialog
    v-model="state.showFileListDialog"
    width="80%"
    :show-close="true"
    @close="resetProjFileForm"
  >
    <div class="dialog-title-wrapper">
      <span role="heading" aria-level="2" class="el-dialog__title">{{
        "相关文件管理"
      }}</span>
    </div>

    <div class="line-wrapper-center">
      <el-upload
        class="upload-demo"
        v-model:file-list="state.projFileList"
        drag
        :action="store.state.uploadApi"
        multiple
        :data="state.projFileListForm"
        :on-success="handleUploadFileOver"
        :on-preview="handleDownload"
        :before-remove="handleRemoveFile"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          拖拽文件到线框内 或者 <em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">文件列表</div>
        </template>
      </el-upload>
    </div>
  </el-dialog>
</template>

<script lang="js" setup>
import { ref, reactive } from "vue";
import { onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { ElMessage } from "element-plus";
import { Delete, Edit, Plus, UploadFilled } from "@element-plus/icons-vue";

import { download } from "../../utils/request";
import request from '../../utils/request';
import store from "../../store"

import {
  getCurrentDateTime,
  getCurrentTimestamp,
  timestamp2datetime,
  datatime2timestamp,
  timestamp2date,
} from "../../utils";

const state = reactive({
  taskSelectType: "全部任务",
  taskData: [],
  userData: store.state.userlist,
  taskStatusTypes: [
    {
      label: "待确认接受",
      value: 0,
    },
    {
      label: "推进中",
      value: 1,
    },
    {
      label: "已完成",
      value: 2,
    },
    {
      label: "已终止",
      value: 3,
    }
  ],
  serveObjectTypes: [
    {
      label: "央企",
      value: "0",
    },
    {
      label: "国企",
      value: "1",
    },
    {
      label: "跨国公司",
      value: "2",
    },
    {
      label: "民营企业",
      value: "3",
    },
    {
      label: "政府职能部门",
      value: "4",
    },
    {
      label: "其他",
      value: "5",
    },
  ],
  getTaskListParams: {
    currentPage: 1,
    pageSize: 30,
    totalCount: 0,
    selectType: 1, // 默认查看全部任务 = 我发起的+我负责的
    userid: store.state.userinfo.userid,
    department: store.state.userinfo.department,
    tasktitle: ""
  },
  selectTypes: [{
    label: "全部任务",
    value: 1
  },{
    label: "我发起的任务",
    value: 2
  },{
    label: "我负责的任务",
    value: 3
  }],
  showTaskInfoDialog: false, // 项目信息模态窗口显示隐藏控制
  taskInfoForm: {
    id: "",
    title: "",
    proj_title: "",
    proj_id: "",
    task_promoter_id: parseInt(store.state.userinfo.userid),
    task_owner_id: "",
    task_start_time: "",
    task_deadline: "",
    task_status: "",
    task_confirm_time: "",
    task_complete_time: "",
    task_update_time: "",
    task_desc: "",
    task_progress: {
      progress_total_count: "45",
    },
  },
  projects: [],
  showProgressListDialog: false, // 显示进展列表对话框
  taskInfoInProgressDialog: {
    task_id: "",
    task_title: ""
  },
  showProgressDetailDialog: false, // 显示进展详情对话框
  progressInfoDialog: { // //datetime,description,status,taskid,last_modify_time
    taskid: "",
    task_title: "",
    id: "",
    datetime: "",
    description: "",
  },
  progress: [],
  showFileListDialog: false, // 文件管理窗口
  projFileListForm: { // 项目文件管理数据结构
    fileid: "",
    uploaderid: "",
    department: "",
  },
  projFileList: [],
  boolTaskParamsReady: false,
  taskStatusLoading: false,
});
// 获取任务数据
const getTaskData = () => {
  request.post("/gettasks", state.getTaskListParams).then(res => {
    if (res) {
      state.taskData = res.data;
      state.getTaskListParams.totalCount = res.pageination.total_count;
      state.getTaskListParams.currentPage = res.pageination.currentPage;
    } else {
      ElMessage.error('获取任务数据失败！')
    }
  });
};

//修改或创建任务
const saveTaskInfo = () => {
  checkTaskParams(); // 参数检查
  if (!state.boolTaskParamsReady) {
    return;
  }
  let tip_text = state.taskInfoForm.id
    ? "是否要更新任务信息?"
    : "是否要创建新任务?";
  ElMessageBox.confirm(tip_text)
    .then(() => {
      // 发起更新请求
      request.post("/updatetask", state.taskInfoForm).then(res => {
        if (res) {
          console.log(res);
          ElMessage({
            message: '任务数据更新成功',
            type: 'success',
          });
          // 重新获取数据列表
          getTaskData();
          resetForm();
          state.showTaskInfoDialog = false;
        } else {
          ElMessage.error('更新任务数据失败！')
        }
      });
    })
    .catch(() => {
      // catch error
    });
};

// task列表中更新task_status状态事件
const handleTaskStatusChange = (rowinfo) => {
  // 比较当前用户是否为任务负责人，如果不是，报错
  if (rowinfo.task_owner_id !== store.state.userinfo.userid) {
    ElMessageBox.alert('您不是任务负责人，无法修改！', "错误提醒", {type: 'error'});
    getTaskData();
    return;
  }
  let tip_text = "确认要调整任务状态?";
  ElMessageBox.confirm(tip_text, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "info",
  }).then(() => {
    state.taskStatusLoading = true;
    let payload = {
      id: rowinfo.id,
      taskstatus: rowinfo.task_status,
    };
    request.post("/updatetaskstatus", payload).then(res => {
    if (res) {
      state.taskStatusLoading = false;
      getTaskData();
    } else {
      getTaskData();
      state.taskStatusLoading = false;
      ElMessage.error('调整任务状态失败！')
    }
  });
  }).catch(() => {
    getTaskData();
    state.taskStatusLoading = false;
    ElMessage.error('调整任务状态失败！')
  });
}

// 删除任务
const deleteTask = () => {
  let tip_text = "是否要删除任务?";
  ElMessageBox.confirm(tip_text)
    .then(() => {
      let payload = {
        id: state.taskInfoForm.id
      };

      // 发起删除请求
      request.post("/deletetask", payload).then(res => {
        if (res) {
          console.log(res);
          ElMessage({
            message: '任务删除成功',
            type: 'success',
          });
          // 重新获取数据列表
          getTaskData();
          resetForm();
          state.showTaskInfoDialog = false;
        } else {
          ElMessage.error('删除任务数据失败！')
        }
      });
    })
    .catch(() => {
      // catch error
    });
}

// pageination选择页码时加载项目数据
const handleCurrentChange = (pagenum) => {
  state.getTaskListParams.currentPage = pagenum;
  getTaskData();
}

// 渲染表格项目负责人列
const getOwnerText = (userid) => {
  for (let i = 0; i < state.userData.length; i++) {
    if (userid === state.userData[i].id) {
      return state.userData[i].name;
    }
  }
  return "";
};
// 渲染表格项目创建日期列
const getDateText = (createtime) => {
  return timestamp2date(createtime);
};

// 渲染表格子任务更新时间列
const getTimeText = (createtime) => {
  return timestamp2datetime(createtime);
};

// 渲染表格折叠展开内容的服务对象类型字段
const getserveObjectTypeText = (type_id) => {
  for (let i = 0; i < state.serveObjectTypes.length; i++) {
    if (type_id === state.serveObjectTypes[i].value) {
      return state.serveObjectTypes[i].label;
    }
  }
  return "";
};

// 表格事件
// 外层表格双击行事件，维护项目信息
const onTaskTableRowDBClicked = (row, column, event) => {
  state.taskInfoForm.id = row.id; // 无需编辑项
  state.taskInfoForm.title = row.title;
  state.taskInfoForm.proj_id = row.proj_id;
  state.taskInfoForm.proj_title = row.proj_title;
  state.taskInfoForm.task_promoter_id = row.task_promoter_id;
  state.taskInfoForm.task_owner_id = row.task_owner_id;
  state.taskInfoForm.task_start_time = row.task_start_time;
  state.taskInfoForm.task_deadline = row.task_deadline;
  state.taskInfoForm.task_status = row.task_status;
  state.taskInfoForm.task_confirm_time = row.task_confirm_time;
  state.taskInfoForm.task_complete_time = row.task_complete_time;
  state.taskInfoForm.task_update_time = row.task_update_time;
  state.taskInfoForm.task_desc = row.task_desc;

  state.showTaskInfoDialog = true; // 显示对话窗体

  // 填充项目列表数据
  let projects = [];
  let obj_project = {
    id: row.proj_id,
    title: row.proj_title
  };
  projects.push(obj_project);
  state.projects = projects;
};

const handleClick = () => {
  console.log("click");
};

const onProjectSelect = (str_text) => {
  let str_title = "";
  if (str_text) {
    str_title = str_text.trim();
  }
  let payload = {
    title: str_title
  };
  request.post("/getprojidtitle", payload).then(res => {
    if (res) {
      state.projects = res.data;
    } else {
      ElMessage.error('获取项目数据失败！')
    }
  });
}

//项目信息模态窗相关事件
// 清除窗体数据
const resetForm = () => {
  state.taskInfoForm.id = "";
  state.taskInfoForm.title = "";
  state.taskInfoForm.proj_title = "";
  state.taskInfoForm.proj_id = "";
  state.taskInfoForm.task_promoter_id = store.state.userinfo.userid;
  state.taskInfoForm.task_owner_id = "";
  state.taskInfoForm.task_start_time = "";
  state.taskInfoForm.task_deadline = "";
  state.taskInfoForm.task_status = 0;
  state.taskInfoForm.task_confirm_time = "";
  state.taskInfoForm.task_complete_time = "";
  state.taskInfoForm.task_update_time = "";
  state.taskInfoForm.task_desc = "";
};
//datetime,description,status,taskid,last_modify_time
const resetProgressForm = () => {
  state.progressInfoDialog.taskid = "";
  state.progressInfoDialog.task_title = "";
  state.progressInfoDialog.id = "";
  state.progressInfoDialog.datetime = "";
  state.progressInfoDialog.description = "";
};

// 显示任务信息窗体
const showTaskInfoDialog = () => {
  state.showTaskInfoDialog = true;
  onProjectSelect(); // 加载项目备选选项
}
// 放弃保存任务信息
const abortSaveTaskInfo = () => {
  let tip_text = state.taskInfoForm.id
    ? "是否要放弃修改项目信息?"
    : "是否要放弃创建项目?";
  ElMessageBox.confirm(tip_text)
    .then(() => {
      resetForm();
      state.showTaskInfoDialog = false;
    })
    .catch(() => {
      // catch error
    });
};
// 放弃保存进展信息
const abortSaveProgressInfo = () => {
  let tip_text = state.progressInfoDialog.id
    ? "是否要放弃修改进展信息?"
    : "是否要放弃创建进展?";
  ElMessageBox.confirm(tip_text)
    .then(() => {
      resetProgressForm();
      state.showProgressDetailDialog = false;
    })
    .catch(() => {
      // catch error
    });
};
const checkTaskParams = () => {
  // 检查是否填写了任务名称
  if (state.taskInfoForm.title === "") {
    state.boolTaskParamsReady = false;
    ElMessageBox.alert('请填写任务名称！', '保存错误', {confirmButtonText: 'OK',});
    return;
  }
  // 检查是否关联了项目
  if (state.taskInfoForm.proj_id === "") {
    state.boolTaskParamsReady = false;
    ElMessageBox.alert('请关联项目信息！', '保存错误', {confirmButtonText: 'OK',});
    return;
  }
  // 检查是否选择了任务负责人
  if (state.taskInfoForm.task_owner_id === "") {
    state.boolTaskParamsReady = false;
    ElMessageBox.alert('请选择任务负责人！', '保存错误', {confirmButtonText: 'OK',});
    return;
  }
  // 检查是否选择了任务截止时间
  if (state.taskInfoForm.task_deadline === "") {
    state.boolTaskParamsReady = false;
    ElMessageBox.alert('请选择任务截止时间！', '保存错误', {confirmButtonText: 'OK',});
    return;
  }
  state.boolTaskParamsReady = true;
}
// 创建或保存进展信息
const saveProgressInfo = () => {
  // 参数检查
  if (!state.progressInfoDialog.datetime) {
    ElMessageBox.alert('请选择进展事项发生时间！', '保存错误', {confirmButtonText: 'OK', type: 'error'});
    return;
  }
  if (!state.progressInfoDialog.description) {
    ElMessageBox.alert('请选择进展事项详细说明！', '保存错误', {confirmButtonText: 'OK', type: 'error'});
    return;
  }
  let tip_text = state.progressInfoDialog.id
    ? "是否要更新进展信息?"
    : "是否要创建新进展?";
  ElMessageBox.confirm(tip_text)
    .then(() => {
      // 发起更新请求
      request.post("/updateprogress", state.progressInfoDialog).then(res => {
        if (res) {
          console.log(res);
          ElMessage({
            message: '进展数据更新成功',
            type: 'success',
          });
          // 显示进展列表对话框
          let task_info = {
            id: state.progressInfoDialog.taskid,
            title: state.progressInfoDialog.task_title
          };
          handleShowProgress(task_info);

          resetProgressForm();
          state.showProgressDetailDialog = false;
        } else {
          ElMessage.error('更新任务数据失败！')
        }
      });
    })
    .catch(() => {
      // catch error
    });
};

const deleteProgress = () => {
  let tip_text = "确认要删除进展信息？";
  let payload = {
    id: state.progressInfoDialog.id
  };
  ElMessageBox.confirm(tip_text)
    .then(() => {
      // 发起更新请求
      request.post("/deleteprogress", payload).then(res => {
        if (res) {
          console.log(res);
          ElMessage({
            message: '删除进展成功！',
            type: 'success',
          });

          //加载进展列表数据
          getProgressListByid(state.taskInfoInProgressDialog.task_id);

          resetProgressForm();
          state.showProgressDetailDialog = false;
        } else {
          ElMessage.error('更新进展数据失败！')
        }
      });
    })
    .catch(() => {
      // catch error
    });
};

// 任务列表显示任务状态
const getTaskStatusText = (task_status_id) => {
  for (let i = 0; i < state.taskStatusTypes.length; i++) {
    if (task_status_id === state.taskStatusTypes[i].value) {
      return state.taskStatusTypes[i].label;
    }
  }
  return "";
};

// 显示进展列表对话框
const handleShowProgress = (rowinfo) => {
  state.taskInfoInProgressDialog.task_id = rowinfo.id;
  state.taskInfoInProgressDialog.task_title = rowinfo.title;

  //加载进展列表数据
  getProgressListByid(rowinfo.id);

  state.showProgressListDialog = true;
}

// 获取进展列表数据
const getProgressListByid = (task_id) => {
  let payload = {
    task_id: task_id,
    pageSize: 1000,
    currentPage: 1
  };
  request.post("/getprogresslist", payload).then(res => {
    if (res) {
      state.progress = res.data;
    } else {
      ElMessage.error('获取项目数据失败！')
    }
  });
}

// 隐藏进展列表对话框
const closeProgressListDialog = () => {
  state.showProgressListDialog = false;
}

// 创建任务进展，显示任务进展对话框
const handleCreateProgress = (task_row_info) => {
  resetProgressForm();
  state.progressInfoDialog.taskid = state.taskInfoInProgressDialog.task_id;
  state.progressInfoDialog.task_title = state.taskInfoInProgressDialog.task_title;
  state.showProgressDetailDialog = true;
}
const showProgressDetail = (task_info, progress_row_info) => {
  state.progressInfoDialog.taskid = task_info.task_id;
  state.progressInfoDialog.task_title = task_info.task_title;
  state.progressInfoDialog.id = progress_row_info.id;
  state.progressInfoDialog.datetime = progress_row_info.datetime;
  state.progressInfoDialog.description = progress_row_info.description;

  state.showProgressDetailDialog = true;
};

// 隐藏进展详情对话框
const closeProgressDetailDialog = () => {
  resetProgressForm();
  state.showProgressDetailDialog = false;
}

// 清除项目文件窗体数据
const resetProjFileForm = () => {
  state.projFileListForm.fileid = "";
  state.projFileListForm.uploaderid = "";
  state.projFileListForm.department = "";
};

// 显示项目文件管理页面
const handleShowProjFiles = (rowinfo) => {
  console.log(rowinfo)
  state.projFileListForm.fileid = rowinfo.fileid;
  state.projFileListForm.uploaderid = store.state.userinfo.userid;
  state.projFileListForm.department = store.state.userinfo.department;

  // 获取文件信息
  getProjFilesByFileid(rowinfo.fileid);

  state.showFileListDialog = true;
}
const getProjFilesByFileid = (fileid) => {
  let payload = {
    fileid: fileid
  };
  request.post("/getfiles", state.projFileListForm).then(res => {
    if (res) {
      state.projFileList = res.data;
    } else {
      ElMessage.error('获取文件数据失败！')
    }
  });
}
const handleUploadFileOver = (res, file) => {
  if (res) {
    ElMessage.success({
      message: "上传成功!",
    });
    let fileid = state.projFileListForm.fileid;
    getProjFilesByFileid(fileid);
  } else {
    ElMessage.error({
      message: "上传失败，请重新上传",
    });
  }
}

const handleDownload = (file) => {
  console.log(file.name)
  console.log(file.uuidname)
  let tip_text = "确认要下载文件《" + file.name + "》 ?";
  ElMessageBox.confirm(tip_text, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "info",
  }).then(() => {
    let payload = {
      uuidname: file.uuidname,
      filename: file.name
    }
    // 发起下载请求
    download("/download", payload, file.name);
  }).catch(() => {});
}

const handleRemoveFile = (UploadFile, UploadFiles) => {
  console.info("UploadFile", UploadFile);
  console.info("UploadFiles", UploadFiles);
  let tip_text = "是否要删除文件?";
  const result = new Promise((resolve, reject) => {
    ElMessageBox.confirm(tip_text, "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    })
      .then(() => {
        console.log(UploadFile)
        let payload = {
          id: UploadFile.id
        };

        // 发起删除请求
        request.post("/deletefile", payload).then(res => {
          if (res) {
            getProjFilesByFileid(UploadFile.parentid);
          } else {
            ElMessage.error('删除项目数据失败！')
          }
        });
      })
      .catch(() => {
        console.log("no delete")
        reject(false);
      });
  });
  return result;
}

// 当组件被创建并且DOM已经生成之后,默认加载项目管理子页面
onMounted(() => {
  getTaskData();
});
</script>

<style lang="scss" scoped>
.workzonehead-wrapper {
  width: 100%;
  height: 64px;
  background-color: white;
  margin-top: 15px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
}

.ml-4 {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  margin-left: 5px;
}

.task-content-wrapper {
  height: 100%;

  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.task-table-wrapper {
  width: 100%;
}

.task-pagination-wrapper {
  width: 90%;
  padding: 0 0 15px 15px;
}

.table-fold-wrapper {
  width: 90%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding: 0 0 0 15px;
}

.fold-line-wrapper {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
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

.dialog-footer-wrapper {
  width: 90;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
</style>
