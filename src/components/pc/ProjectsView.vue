<template>
  <div class="project-content-wrapper">
    <div class="project-table-wrapper">
      <div class="workzonehead-wrapper">
        <el-button
          type="primary"
          :icon="Plus"
          @click="handleShowProjectInfo()"
          style="margin-left: 15px"
          >创建项目</el-button
        >
        <el-select
          v-model="state.getProjectListParams.selectType"
          class="m-2"
          placeholder="筛选方式"
          size="default"
          style="width: 200px; margin-left: 25px"
          @change="getProjectData"
        >
          <el-option
            v-for="item in state.selectTypes"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <el-input
          v-model="state.getProjectListParams.projname"
          clearable
          placeholder="检索匹配项目名"
          style="width: 360px; height: 32px; margin-left: 15px"
        />
        <el-button
          type="primary"
          @click="getProjectData"
          style="margin-left: 25px"
          >点击查询</el-button
        >
      </div>
      <el-table
        :data="state.projectData"
        style="width: 100%"
        @row-dblclick="onProjectTableRowDBClicked"
      >
        <el-table-column type="expand">
          <template #default="scope">
            <div class="table-fold-wrapper">
              <div class="fold-line-wrapper">
                <p style="width: 100px; font-weight: bold">服务对象:</p>
                <p m="t-0 b-2">{{ scope.row.serve_object }}</p>
              </div>
              <div class="fold-line-wrapper">
                <p style="width: 100px; font-weight: bold">对象类型:</p>
                <p m="t-0 b-2">
                  {{ getserveObjectTypeText(scope.row.serve_object_type) }}
                </p>
              </div>
              <div class="fold-line-wrapper">
                <p style="width: 100px; font-weight: bold">联系方式:</p>
                <p m="t-0 b-2">{{ scope.row.serve_object_contect }}</p>
              </div>
              <div class="fold-line-wrapper">
                <p style="width: 100px; font-weight: bold">项目简介:</p>
                <p style="width: 75%">{{ scope.row.proj_desc }}</p>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="项目名称" />
        <el-table-column prop="department" label="所属部门" min-width="20%">
          <template #default="scope">
            {{ getDepartmentText(scope.row.department) }}
          </template>
        </el-table-column>
        <el-table-column prop="promoterid" label="项目发起人" min-width="20%">
          <template #default="scope">
            {{ getOwnerText(scope.row.promoterid) }}
          </template>
        </el-table-column>
        <el-table-column prop="owner_id" label="项目负责人" min-width="20%">
          <template #default="scope">
            {{ getOwnerText(scope.row.owner_id) }}
          </template>
        </el-table-column>
        <!-- <el-table-column prop="serve_object" label="服务对象" min-width="30%">
          <template #default="scope">
            {{ scope.row.serve_object }}
          </template>
        </el-table-column> -->
        <el-table-column prop="start_time" label="项目创建日期" min-width="25%">
          <template #default="scope">
            {{ getDateText(scope.row.start_time) }}
          </template>
        </el-table-column>
        <el-table-column prop="proj_status" label="项目状态" min-width="15%">
          <template #default="scope">
            {{ getProjectStatusText(scope.row.proj_status) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="last_modify_time"
          label="项目更新时间"
          min-width="30%"
        >
          <template #default="scope">
            {{ getTimeText(scope.row.last_modify_time) }}
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="Operations" min-width="40%">
          <template #default="scope">
            <el-button type="primary" @click="handleShowTasks(scope.row)"
              >查看任务</el-button
            >
            <el-button type="primary" @click="handleShowProjFiles(scope.row)"
              >文件管理</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="project-pagination-wrapper">
      <el-pagination
        v-model:current-page="state.getProjectListParams.currentPage"
        :page-size="state.getProjectListParams.pageSize"
        layout="total, prev, pager, next"
        :total="state.getProjectListParams.totalCount"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
  <!-- 项目信息模态窗口 -->
  <el-dialog
    v-model="state.showProjectInfoDialog"
    width="80%"
    :show-close="false"
    @close="resetForm"
  >
    <div class="dialog-title-wrapper">
      <span role="heading" aria-level="2" class="el-dialog__title">{{
        state.projectInfoForm.id ? "修改项目信息" : "创建项目"
      }}</span>
    </div>
    <el-form :model="state.projectInfoForm" status-icon label-width="120px">
      <div class="line-wrapper">
        <el-form-item label="项目名称" prop="name" style="width: 90%">
          <el-input
            v-model.trim="state.projectInfoForm.title"
            placeholder="项目名称"
          />
        </el-form-item>
      </div>
      <div class="line-wrapper">
        <el-form-item label="所属部门" prop="department">
          <el-select
            v-model.trim="state.projectInfoForm.department"
            placeholder="请选择项目所属部门"
          >
            <el-option
              v-for="item in store.state.arrayDepartments"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="负责人" prop="owner_id">
          <el-select
            v-model.trim="state.projectInfoForm.owner_id"
            placeholder="请选择项目负责人"
          >
            <el-option
              v-for="item in store.state.userlist"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="项目状态" prop="proj_status">
          <el-select
            v-model.trim="state.projectInfoForm.proj_status"
            placeholder="请选择项目状态"
          >
            <el-option
              v-for="item in state.projectStatusTypes"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </div>
      <div class="line-wrapper">
        <el-form-item label="服务对象" prop="serve_object" style="width: 60%">
          <el-input
            v-model.trim="state.projectInfoForm.serve_object"
            placeholder="服务对象"
          />
        </el-form-item>
        <el-form-item label="对象类型" prop="serve_object_type">
          <el-select
            v-model.trim="state.projectInfoForm.serve_object_type"
            placeholder="请选服务对象类型"
          >
            <el-option
              v-for="item in state.serveObjectTypes"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </div>
      <div class="line-wrapper">
        <el-form-item
          label="联系方式"
          prop="serve_object_contect"
          style="width: 90%"
        >
          <el-input
            v-model.trim="state.projectInfoForm.serve_object_contect"
            placeholder="服务对象联系方式"
          />
        </el-form-item>
      </div>
      <div class="line-wrapper">
        <el-form-item
          label="项目简介"
          prop="proj_desc"
          style="width: 90%; line-height: 50px"
        >
          <el-input
            v-model.trim="state.projectInfoForm.proj_desc"
            placeholder="服务对象联系方式"
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
          v-if="state.projectInfoForm.id"
          type="danger"
          @click="deleteProject"
          >删除项目</el-button
        >
        <div />
        <span class="dialog-footer">
          <el-button @click="abortSaveProjectInfo">取消</el-button>
          <el-button type="primary" @click="saveProjectInfo"> 保存 </el-button>
        </span>
      </div>
    </template>
  </el-dialog>
  <!-- 任务列表模态窗口 -->
  <el-dialog
    v-model="state.showTaskListDialog"
    width="80%"
    :show-close="true"
    @close="closeTaskListDialog"
  >
    <div class="dialog-title-wrapper">
      <span role="heading" aria-level="2" class="el-dialog__title"
        >项目: {{ state.projInfoInTaskDialog.proj_title }}</span
      >
    </div>
    <div class="task-table-in-project-info-wrapper">
      <el-table :data="state.tasks.tasklist" style="width: 100%">
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
        <el-table-column prop="title" label="任务名称" min-width="20%" />
        <el-table-column
          prop="task_start_time"
          label="启动时间"
          min-width="15%"
        >
          <template #default="scope">
            {{ timestamp2datetime(scope.row.task_start_time) }}
          </template>
        </el-table-column>
        <el-table-column prop="task_deadline" label="截止时间" min-width="15%">
          <template #default="scope">
            {{ timestamp2datetime(scope.row.task_deadline) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="task_confirm_time"
          label="确认时间"
          min-width="15%"
        >
          <template #default="scope">
            {{ timestamp2datetime(scope.row.task_confirm_time) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="task_complete_time"
          label="完成时间"
          min-width="15%"
        >
          <template #default="scope">
            {{ timestamp2datetime(scope.row.task_complete_time) }}
          </template>
        </el-table-column>
        <el-table-column prop="task_owner_id" label="负责人" min-width="10%">
          <template #default="scope">
            {{ getOwnerText(scope.row.task_owner_id) }}
          </template>
        </el-table-column>
        <el-table-column prop="task_status" label="任务状态" min-width="10%">
          <template #default="scope">
            {{ getTaskStatusText(scope.row.task_status) }}
          </template>
        </el-table-column>
      </el-table>
    </div>
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
        "项目相关文件管理"
      }}</span>
    </div>

    <div class="line-wrapper-center">
      <el-upload
        class="upload-demo"
        v-model:file-list="state.projFileList"
        drag
        :action="store.state.uploadApi"
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
import { download } from "../../utils/request";
import { Plus, UploadFilled } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { onMounted, reactive } from "vue";

import request from '../../utils/request';

import store from "../../store";

import {
timestamp2date,
timestamp2datetime
} from "../../utils";

// 项目状态 -1 为标记删除
const state = reactive({
  projectData: [],
  userData: [],
  projectStatusTypes: [
    {
      label: "接触洽谈",
      value: 0,
    },
    {
      label: "意向确认",
      value: 1,
    },
    {
      label: "协议签署",
      value: 2,
    },
    {
      label: "服务中",
      value: 3,
    },
    {
      label: "项目完结",
      value: 4,
    },
    {
      label: "项目终止不推进",
      value: 5,
    },
  ],
  serveObjectTypes: [
    {
      label: "央企",
      value: 0,
    },
    {
      label: "国企",
      value: 1,
    },
    {
      label: "跨国公司",
      value: 2,
    },
    {
      label: "民营企业",
      value: 3,
    },
    {
      label: "政府职能部门",
      value: 4,
    },
    {
      label: "其他",
      value: 5,
    },
  ],
  getProjectListParams: {
    currentPage: 1,
    pageSize: 30,
    totalCount: 0,
    selectType: 1, // 默认查看我负责的项目
    userid: store.state.userinfo.userid,
    department: store.state.userinfo.department,
    projname: ""
  },
  selectTypes: [{
    label: "我负责的项目",
    value: 1
  },{
    label: "我发起的项目",
    value: 2
  },{
    label: "我所在部门的项目",
    value: 3
  },{
    label: "我可以查看的所有项目",
    value: 4
  }],
  showProjectInfoDialog: false, // 项目信息模态窗口显示隐藏控制
  projectInfoForm: {
    id: "",
    title: "",
    promoterid: store.state.userinfo.userid,
    owner_id: "",
    department: "",
    proj_status: "",
    serve_object: "",
    serve_object_type: "",
    serve_object_contect: "",
    proj_desc: "",
    start_time: "",
    sub_task_lastmodifytime: "",
    taskData: {
      task_total_count: "102",
    },
  },
  showTaskListDialog: false, // 任务列表模态窗口显示隐藏控制
  projInfoInTaskDialog: {
    proj_id: "",
    proj_title: ""
  },
  showFileListDialog: false, // 文件管理窗口
  projFileListForm: { // 项目文件管理数据结构
    fileid: "",
    uploaderid: "",
    department: "",
  },
  projFileList: [],
  tasks: {
    total_count: "", // 总任务数
    active_count: "", // 推进中任务数
    terminated_count: "", // 终止任务数
    overtime_count: "", // 超时任务数
    accomplish_count: "", // 任务完成数 total_count = active_count + accomplish_count + terminated_count
    tasklist: [],
  },
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
  boolParamsReady: false
});

const getProjectData = () => {
  request.post("/getprojects", state.getProjectListParams).then(res => {
    if (res) {
      console.log(res);
      state.projectData = res.data;
      state.getProjectListParams.totalCount = res.pageination.total_count;
      state.getProjectListParams.currentPage = res.pageination.currentPage;
    } else {
      ElMessage.error('获取项目数据失败！')
    }
  });
};

//获取当前项目的任务列表
const getTaskListByid = (proj_id) => {
  if (!proj_id) {
    return;
  }
  let payload = {
    proj_id: proj_id
  };
  request.post("/gettasksbyprojid", payload).then(res => {
    if (res) {
      console.log(res);
      state.tasks.tasklist = res.data;
    } else {
      ElMessage.error('获取任务数据失败！')
    }
  });
};

// 渲染表格部门列
const getDepartmentText = (value) => {
  for (let i = 0; i < store.state.arrayDepartments.length; i++) {
    if (value === store.state.arrayDepartments[i].value) {
      return store.state.arrayDepartments[i].label;
    }
  }
  return "";
};
// 渲染表格项目负责人列
const getOwnerText = (userid) => {
  for (let i = 0; i < store.state.userlist.length; i++) {
    if (userid === store.state.userlist[i].id) {
      return store.state.userlist[i].name;
    }
  }
  return "";
};
// 渲染表格项目创建日期列
const getDateText = (createtime) => {
  return timestamp2date(createtime);
};
// 渲染表格项目状态列
const getProjectStatusText = (status_id) => {
  for (let i = 0; i < state.projectStatusTypes.length; i++) {
    if (status_id === state.projectStatusTypes[i].value) {
      return state.projectStatusTypes[i].label;
    }
  }
  return "";
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
const onProjectTableRowDBClicked = (row, column, event) => {
  state.projectInfoForm.id = row.id; // 无需编辑项
  state.projectInfoForm.title = row.title;
  state.projectInfoForm.promoterid = store.state.userinfo.userid;
  state.projectInfoForm.owner_id = row.owner_id;
  state.projectInfoForm.department = row.department;
  state.projectInfoForm.proj_status = row.proj_status;
  state.projectInfoForm.serve_object = row.serve_object;
  state.projectInfoForm.serve_object_type = row.serve_object_type;
  state.projectInfoForm.serve_object_contect = row.serve_object_contect;
  state.projectInfoForm.proj_desc = row.proj_desc;
  state.projectInfoForm.start_time = row.start_time; // 无需编辑项
  state.projectInfoForm.sub_task_lastmodifytime = row.sub_task_lastmodifytime; // 无需编辑项

  handleShowProjectInfo(); // 修改状态
};

const handleClick = () => {
  console.log("click");
};

//项目信息模态窗相关事件
// 清除窗体数据
const resetForm = () => {
  state.projectInfoForm.id = "";
  state.projectInfoForm.title = "";
  state.projectInfoForm.owner_id = "";
  state.projectInfoForm.department = "";
  state.projectInfoForm.proj_status = "";
  state.projectInfoForm.serve_object = "";
  state.projectInfoForm.serve_object_type = "";
  state.projectInfoForm.serve_object_contect = "";
  state.projectInfoForm.proj_desc = "";
  state.projectInfoForm.start_time = "";
  state.projectInfoForm.sub_task_lastmodifytime = "";
};

// 清除项目文件窗体数据
const resetProjFileForm = () => {
  state.projFileListForm.fileid = "";
  state.projFileListForm.uploaderid = "";
  state.projFileListForm.department = "";
};
// 显示项目信息窗口
const handleShowProjectInfo = () => {
  state.showProjectInfoDialog = true;
};

const abortSaveProjectInfo = () => {
  let tip_text = state.projectInfoForm.id
    ? "是否要放弃修改项目信息?"
    : "是否要放弃创建项目?";
  ElMessageBox.confirm(tip_text)
    .then(() => {
      resetForm();
      state.showProjectInfoDialog = false;
    })
    .catch(() => {
      // catch error
    });
};
const checkParams = () => {
  // 检查项目名称是否为空
  if (state.projectInfoForm.title === "") {
    state.boolParamsReady = false;
    ElMessageBox.alert('请填写项目名称！', '保存错误', {confirmButtonText: 'OK',});
    return;
  }
  // 检查是否选择了所属部门信息
  if (state.projectInfoForm.department === "") {
    state.boolParamsReady = false;
    ElMessageBox.alert('请选择部门信息！', '保存错误', {confirmButtonText: 'OK',});
    return;
  }
  // 检查是否选择了项目负责人
  if (state.projectInfoForm.owner_id === "") {
    state.boolParamsReady = false;
    ElMessageBox.alert('请选择项目负责人！', '保存错误', {confirmButtonText: 'OK',});
    return;
  }
  // 检查是否选择了项目状态
  if (state.projectInfoForm.proj_status === "") {
    state.boolParamsReady = false;
    ElMessageBox.alert('请选择项目状态！', '保存错误', {confirmButtonText: 'OK',});
    return;
  }
  // 检查是否选择了项目状态
  if (state.projectInfoForm.proj_status === "") {
    state.boolParamsReady = false;
    ElMessageBox.alert('请选择项目状态！', '保存错误', {confirmButtonText: 'OK',});
    return;
  }
  // 检查是否填写了服务对象信息
  if (state.projectInfoForm.serve_object === "") {
    state.boolParamsReady = false;
    ElMessageBox.alert('请填写服务对象信息！', '保存错误', {confirmButtonText: 'OK',});
    return;
  }
  // 检查是否选择了服务对象的类型
  if (state.projectInfoForm.serve_object_type === "") {
    state.boolParamsReady = false;
    ElMessageBox.alert('请选择服务对象类型！', '保存错误', {confirmButtonText: 'OK',});
    return;
  }
  state.boolParamsReady = true;
}
// 修改或创建项目
const saveProjectInfo = () => {
  checkParams(); // 参数检查
  if (!state.boolParamsReady) {
    return;
  }
  let tip_text = state.projectInfoForm.id
    ? "是否要更新项目信息?"
    : "是否要创建新项目?";
  ElMessageBox.confirm(tip_text)
    .then(() => {

      // 发起更新请求
      request.post("/updateproject", state.projectInfoForm).then(res => {
        if (res) {
          console.log(res);
          ElMessage({
            message: '项目数据更新成功',
            type: 'success',
          });
          // 重新获取数据列表
          getProjectData();
          resetForm();
          state.showProjectInfoDialog = false;
        } else {
          ElMessage.error('获取项目数据失败！')
        }
      });
    })
    .catch(() => {
      // catch error
    });
};
// 删除项目
const deleteProject = () => {
  let tip_text = "是否要删除项目?";
  ElMessageBox.confirm(tip_text)
    .then(() => {
      let payload = {
        id: state.projectInfoForm.id
      };

      // 发起删除请求
      request.post("/deleteproject", payload).then(res => {
        if (res) {
          console.log(res);
          ElMessage({
            message: '项目删除成功',
            type: 'success',
          });
          // 重新获取数据列表
          getProjectData();
          resetForm();
          state.showProjectInfoDialog = false;
        } else {
          ElMessage.error('删除项目数据失败！')
        }
      });
    })
    .catch(() => {
      // catch error
    });
}

// pageination选择页码时加载项目数据
const handleCurrentChange = (pagenum) => {
  state.getProjectListParams.currentPage = pagenum;
  getProjectData();
}

// 任务列表显示任务状态
const getTaskStatusText = (task_status_id) => {
  for (let i = 0; i < state.taskStatusTypes.length; i++) {
    if (task_status_id === state.taskStatusTypes[i].value) {
      return state.taskStatusTypes[i].label;
    }
  }
  return "";
};

// 显示任务列表对话框
const handleShowTasks = (rowinfo) => {
  state.projInfoInTaskDialog.proj_id = rowinfo.id;
  state.projInfoInTaskDialog.proj_title = rowinfo.title;

  //加载任务列表数据
  getTaskListByid(rowinfo.id);

  state.showTaskListDialog = true;

}
// 隐藏任务列表对话框
const closeTaskListDialog = () => {
  state.showTaskListDialog = false;
}

// 显示项目文件管理页面
const handleShowProjFiles = (rowinfo) => {
  state.projFileListForm.fileid = rowinfo.fileid;
  state.projFileListForm.uploaderid = store.state.userinfo.userid;
  state.projFileListForm.department = store.state.userinfo.department;

  console.info("state.projFileListForm", state.projFileListForm)

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
  getProjectData();

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

.project-content-wrapper {
  height: 100%;

  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.project-table-wrapper {
  width: 100%;
}

.project-pagination-wrapper {
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

.line-wrapper-center {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
}

.upload-demo {
  width: 60%;
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
