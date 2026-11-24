<template>
  <div class="content-wrapper">
    <div class="table-wrapper">
      <div class="workzonehead-wrapper search-toolbar">
        <el-button
          type="primary"
          class="search-create-button"
          @click="createArticle"
          >创建文章</el-button
        >
        <el-input
          v-model.trim="state.getInfoParams.title"
          placeholder="请输入文章标题关键字"
          clearable
          class="search-title-input"
        />
        <el-radio-group
          v-model="state.getInfoParams.channeltype"
          class="search-channel-group"
        >
          <el-radio
            v-for="(label, value) in channelTypeMap"
            :key="value"
            :value="value"
          >
            {{ label }}
          </el-radio>
        </el-radio-group>
        <el-button
          type="primary"
          class="search-submit-button"
          @click="getnewslist"
          >查询</el-button
        >
      </div>
      <el-table
        :data="state.newslist"
        style="width: 100%; height: calc(100vh - 240px)"
        @row-dblclick="onNewsTableRowDBClicked"
      >
        <el-table-column fixed prop="id" label="文章id" min-width="10%" />
        <el-table-column prop="channeltype" label="频道类型" min-width="15%">
          <template #default="scope">
            {{ showChannelType(scope.row.channeltype) }}
          </template>
        </el-table-column>
        <el-table-column prop="articletype" label="文章类型" min-width="15%">
          <template #default="scope">
            {{ showArticleType(scope.row.articletype) }}
          </template>
        </el-table-column>
        <el-table-column prop="title" label="文章标题" min-width="40%" />
        <el-table-column prop="createdate" label="创建日期" min-width="20%" />
        <el-table-column prop="weight" label="权重" min-width="15%" />
        <el-table-column prop="createtime" label="创建时间" min-width="20%">
          <template #default="scope">
            {{ timestamp2datetime(scope.row.createtime) }}
          </template>
        </el-table-column>
        <el-table-column prop="updatetime" label="更新时间" min-width="20%">
          <template #default="scope">
            {{ timestamp2datetime(scope.row.updatetime) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" min-width="20%">
          <template #default="scope">
            <el-tag :type="showStatusTagType(scope.row.status)">
              {{ showStatus(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="20%">
          <template #default="scope">
            <el-button
              :type="
                scope.row.status === 0 || scope.row.status === '0'
                  ? 'danger'
                  : 'success'
              "
              @click="changenewsstatus(scope.row.id, scope.row.status)"
            >
              {{
                scope.row.status === 0 || scope.row.status === "0"
                  ? "操作下线"
                  : "文章上线"
              }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
  <!-- 套餐配置模态窗口 -->
  <el-dialog
    v-model="state.showNewsInfoDialog"
    width="80%"
    :show-close="false"
    @close="resetForm"
  >
    <div class="dialog-title-wrapper" style="padding-bottom: 15px">
      <span role="heading" aria-level="2" class="el-dialog__title">{{
        state.newsInfoForm.id ? "修改文章" : "创建文章"
      }}</span>
    </div>
    <el-form :model="state.newsInfoForm" status-icon label-width="120px">
      <div class="line-wrapper">
        <el-form-item label="文章标题" prop="title" style="width: 70%">
          <el-input
            v-model.trim="state.newsInfoForm.title"
            placeholder="请输入文章标题"
            clearable
          />
        </el-form-item>
        <el-form-item label="创建日期" prop="createdate" style="width: 30%">
          <el-date-picker
            v-model="state.newsInfoForm.createdate"
            type="date"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            placeholder="请选择日期"
            style="width: 100%"
          />
        </el-form-item>
      </div>
      <div class="line-wrapper">
        <el-form-item label="频道类型" prop="channeltype" style="width: 35%">
          <el-select
            v-model="state.newsInfoForm.channeltype"
            placeholder="请选择频道类型"
          >
            <el-option
              v-for="(label, value) in channelTypeMap"
              :key="value"
              :label="label"
              :value="value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="文章类型" prop="articletype" style="width: 35%">
          <el-select
            v-model="state.newsInfoForm.articletype"
            placeholder="请选择文章类型"
          >
            <el-option label="本地图文" value="1" />
            <el-option label="URL外链" value="2" />
            <el-option label="视频播放" value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="文章权重" prop="weight" style="width: 30%">
          <el-input-number
            v-model="state.newsInfoForm.weight"
            :min="0"
            :max="100"
            label="文章权重"
            style="width: 100%"
          />
        </el-form-item>
      </div>
      <div class="line-wrapper">
        <el-form-item
          v-if="state.newsInfoForm.articletype === '2'"
          label="外链地址"
          prop="url"
          style="width: 100%"
        >
          <el-input
            v-model.trim="state.newsInfoForm.url"
            placeholder="请输入文章外链地址"
            clearable
          />
        </el-form-item>
        <el-form-item
          v-if="state.newsInfoForm.articletype === '3'"
          label="视频地址"
          prop="videourl"
          style="width: 70%"
        >
          <el-input
            v-model.trim="state.newsInfoForm.videourl"
            placeholder="上传成功后自动填充视频地址"
            clearable
          />
        </el-form-item>
        <el-upload
          v-if="state.newsInfoForm.articletype === '3'"
          :action="store.state.uploadVideoApi"
          accept="video/*"
          :show-file-list="false"
          :limit="1"
          :before-upload="beforeNewsVideoUpload"
          :on-success="handleNewsVideoUploadSuccess"
          :on-error="handleNewsVideoUploadError"
          style="width: 30%; margin-top: 2px"
        >
          <el-button type="primary">上传视频</el-button>
        </el-upload>
      </div>
      <el-form-item
        v-if="state.newsInfoForm.articletype === '1'"
        label="文章内容"
        prop="htmlcontent"
        class="rich-content-form-item"
      >
        <div class="rich-editor-toolbar">
          <el-upload
            :action="store.state.getImgurlApi"
            accept="image/*"
            :show-file-list="false"
            :before-upload="beforeRichImageUpload"
            :on-success="handleRichImageUploadSuccess"
            :on-error="handleRichResourceUploadError"
          >
            <el-button type="primary" plain>插入图片</el-button>
          </el-upload>
          <el-upload
            :action="store.state.uploadVideoApi"
            accept="video/*"
            :show-file-list="false"
            :before-upload="beforeRichVideoUpload"
            :on-success="handleRichVideoUploadSuccess"
            :on-error="handleRichResourceUploadError"
          >
            <el-button type="primary" plain>插入视频</el-button>
          </el-upload>
        </div>
        <div class="rich-editor" @click="rememberRichTextCursor">
          <div
            v-for="(block, index) in state.richTextBlocks"
            :key="block.id"
            class="rich-editor-block"
            :data-rich-index="index"
          >
            <div
              v-if="block.type === 'text'"
              class="rich-editor-text"
              contenteditable="plaintext-only"
              @focus="rememberRichTextCursor"
              @keydown.enter.stop
              @keydown.backspace="handleRichTextBackspace(index, $event)"
              @compositionstart="handleRichTextCompositionStart"
              @compositionend="handleRichTextCompositionEnd(index, $event)"
              @input="handleRichTextInput(index, $event)"
            >
              {{ block.content }}
            </div>
            <img
              v-else-if="block.type === 'image'"
              class="rich-editor-image"
              :src="block.content"
              alt="文章图片"
            />
            <button
              v-else-if="block.type === 'video'"
              type="button"
              class="rich-editor-video"
              @click.stop="playRichVideo(block.content)"
            >
              <span class="rich-editor-play-icon">&#9654;</span>
            </button>
          </div>
          <div v-if="!state.richTextBlocks.length" class="rich-editor-empty">
            点击文本区域输入内容，或插入图片、视频
          </div>
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer-wrapper">
        <span class="dialog-footer">
          <el-button @click="abortsaveInfo">取消</el-button>
          <el-button type="primary" @click="saveNewsInfo"> 保存 </el-button>
        </span>
      </div>
    </template>
  </el-dialog>
  <el-dialog
    v-model="state.richVideoPreviewVisible"
    title="视频播放"
    width="70%"
    @closed="state.richVideoPreviewUrl = ''"
  >
    <video
      v-if="state.richVideoPreviewUrl"
      class="rich-video-preview"
      :src="state.richVideoPreviewUrl"
      controls
      autoplay
    />
  </el-dialog>
</template>

<script setup>
import { ref, reactive, nextTick } from "vue";
import request from "../../utils/request";
import { onMounted } from "vue";
import store from "../../store";
import { timestamp2date, timestamp2datetime } from "../../utils";
import { ElMessage, ElMessageBox } from "element-plus";

import { download } from "../../utils/request";

const state = reactive({
  showNewsInfoDialog: false,
  newslist: [],
  getInfoParams: {
    totalCount: 0,
    currentPage: 1,
    pageSize: 30,
    channeltype: "hqzc", // hqzc：惠企政策；qydt： 区域动态；ptgg：平台公告
    title: "",
  },
  newsInfoForm: {
    id: "",
    channeltype: "",
    articletype: "",
    title: "",
    createdate: "",
    url: "", // 文章外链地址
    htmlcontent: "", // 本地文章内容
    videourl: "", // 视频地址
    weight: 0, // 文章排序权重
  },
  richTextBlocks: [],
  richTextComposing: false,
  richVideoPreviewVisible: false,
  richVideoPreviewUrl: "",
});

const channelTypeMap = {
  hqzc: "惠企政策",
  qydt: "区域动态",
  ptgg: "平台公告",
};

const getnewslist = () => {
  request.post("/getnewslist", state.getInfoParams).then((res) => {
    console.log("getnewslist res:", res);
    //console.log("getnewslist res:", res.retcode);
    if (res && res.retcode === "200" && res.data) {
      state.newslist = res.data;
    } else {
      ElMessage.error("获取额度配置列表失败！");
    }
  });
};

const showChannelType = (channeltype) => {
  return channelTypeMap[channeltype] || channeltype;
};

const showArticleType = (articletype) => {
  const articleTypeMap = {
    1: "本地图文",
    2: "URL外链",
    3: "视频播放",
  };
  return articleTypeMap[articletype] || articletype;
};

const showStatus = (status) => {
  const statusMap = {
    0: "有效",
    1: "已下线",
  };
  return statusMap[status] || status;
};

const showStatusTagType = (status) => {
  if (status === 0 || status === "0") return "success";
  if (status === 1 || status === "1") return "danger";
  return "info";
};

const beforeNewsVideoUpload = (rawFile) => {
  if (!rawFile.type.startsWith("video/")) {
    ElMessage.error("请上传视频文件！");
    return false;
  }
  if (rawFile.size / 1024 / 1024 > 100) {
    ElMessage.error("视频大小不能超过100MB！");
    return false;
  }
  return true;
};

const handleNewsVideoUploadSuccess = (res) => {
  const videoUrl = res?.imgurl || "";
  if (!videoUrl) {
    ElMessage.error("视频上传成功，但服务端未返回视频地址！");
    return;
  }
  state.newsInfoForm.videourl = videoUrl;
  ElMessage.success("视频上传成功！");
};

const handleNewsVideoUploadError = (error) => {
  if (error?.status === 413) {
    ElMessage.error("视频文件过大，请压缩视频或联系服务端提高上传限制！");
    return;
  }
  ElMessage.error("视频上传失败，请稍后重试！");
};

const createRichTextBlock = (type, content) => ({
  id: `${Date.now()}-${Math.random()}`,
  type,
  content,
});

const parseRichTextContent = (content) => {
  if (!content) return [createRichTextBlock("text", "")];
  try {
    const blocks = typeof content === "string" ? JSON.parse(content) : content;
    if (!Array.isArray(blocks)) return [createRichTextBlock("text", "")];
    const parsedBlocks = blocks
      .filter((block) => ["text", "image", "video"].includes(block.type))
      .flatMap((block) => {
        const blockContent = block.content || "";
        if (block.type !== "text") {
          return [createRichTextBlock(block.type, blockContent)];
        }
        return String(blockContent)
          .split(/\r?\n/)
          .filter((line) => line.trim())
          .map((line) => createRichTextBlock("text", line));
      });
    return parsedBlocks.length
      ? parsedBlocks
      : [createRichTextBlock("text", "")];
  } catch (error) {
    return [createRichTextBlock("text", content)];
  }
};

const syncRichTextContent = () => {
  state.newsInfoForm.htmlcontent = JSON.stringify(
    state.richTextBlocks.flatMap(({ type, content }) => {
      if (type !== "text") return [{ type, content }];
      return String(content)
        .split(/\r?\n/)
        .filter((line) => line.trim())
        .map((line) => ({ type: "text", content: line }));
    }),
  );
  console.log("htmlcontent:", state.newsInfoForm.htmlcontent);
};

const rememberRichTextCursor = () => {
  const selection = window.getSelection();
  const element =
    selection?.anchorNode?.parentElement?.closest(".rich-editor-block");
  if (element) state.richTextCursorIndex = Number(element.dataset.richIndex);
};

const handleRichTextInput = (index, event) => {
  if (state.richTextComposing || event.isComposing) return;
  const cursorOffset = getTextCursorOffset(event.target);
  state.richTextBlocks[index].content = event.target.innerText.replace(
    /\r\n/g,
    "\n",
  );
  state.richTextCursorIndex = index;
  syncRichTextContent();
  nextTick(() => restoreTextCursor(event.target, cursorOffset));
};

const handleRichTextBackspace = (index, event) => {
  if (
    state.richTextComposing ||
    event.isComposing ||
    getTextCursorOffset(event.currentTarget)
  ) {
    return;
  }

  const currentBlock = state.richTextBlocks[index];
  const previousBlock = state.richTextBlocks[index - 1];
  if (currentBlock?.type !== "text" || previousBlock?.type !== "text") return;

  event.preventDefault();
  event.stopPropagation();
  const cursorOffset = previousBlock.content.length;
  previousBlock.content += currentBlock.content;
  state.richTextBlocks.splice(index, 1);
  state.richTextCursorIndex = index - 1;
  syncRichTextContent();
  focusRichTextBlock(index - 1, cursorOffset);
};

const handleRichTextCompositionStart = () => {
  state.richTextComposing = true;
};

const handleRichTextCompositionEnd = (index, event) => {
  state.richTextComposing = false;
  handleRichTextInput(index, event);
};

const getTextCursorOffset = (element) => {
  const selection = window.getSelection();
  if (!selection || !selection.rangeCount) return element.innerText.length;

  const range = selection.getRangeAt(0);
  const cursorRange = range.cloneRange();
  cursorRange.selectNodeContents(element);
  cursorRange.setEnd(range.endContainer, range.endOffset);
  return cursorRange.toString().length;
};

const restoreTextCursor = (element, offset) => {
  const selection = window.getSelection();
  if (!selection) return;

  const range = document.createRange();
  let remaining = offset;
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  let textNode = walker.nextNode();

  while (textNode) {
    if (remaining <= textNode.textContent.length) {
      range.setStart(textNode, remaining);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
      return;
    }
    remaining -= textNode.textContent.length;
    textNode = walker.nextNode();
  }

  range.selectNodeContents(element);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
};

const insertRichResource = (type, content) => {
  const blocks = state.richTextBlocks;
  const selection = window.getSelection();
  const anchorBlock =
    selection?.anchorNode?.parentElement?.closest(".rich-editor-block");
  const index = anchorBlock
    ? Number(anchorBlock.dataset.richIndex)
    : (state.richTextCursorIndex ?? blocks.length - 1);
  const currentBlock = blocks[index];

  if (currentBlock?.type === "text" && anchorBlock && selection.rangeCount) {
    const range = selection.getRangeAt(0);
    const text = currentBlock.content;
    const prefix = text.slice(0, Math.min(range.startOffset, text.length));
    const suffix = text.slice(Math.min(range.startOffset, text.length));
    const replacement = [
      ...(prefix ? [createRichTextBlock("text", prefix)] : []),
      createRichTextBlock(type, content),
      ...(suffix ? [createRichTextBlock("text", suffix)] : []),
    ];
    const nextTextIndex = index + (prefix ? 2 : 1);
    if (!suffix) {
      replacement.push(createRichTextBlock("text", ""));
    }
    blocks.splice(index, 1, ...replacement);
    focusRichTextBlock(nextTextIndex);
  } else {
    const resourceIndex = Math.max(index + 1, 0);
    blocks.splice(resourceIndex, 0, createRichTextBlock(type, content));
    const nextTextIndex = resourceIndex + 1;
    blocks.splice(nextTextIndex, 0, createRichTextBlock("text", ""));
    focusRichTextBlock(nextTextIndex);
  }
  syncRichTextContent();
};

const focusRichTextBlock = (index, cursorOffset = 0) => {
  nextTick(() => {
    const textElement = document.querySelector(
      `[data-rich-index="${index}"] .rich-editor-text`,
    );
    if (!textElement) return;

    textElement.focus();
    restoreTextCursor(textElement, cursorOffset);
    state.richTextCursorIndex = index;
  });
};

const beforeRichImageUpload = (rawFile) => {
  if (!rawFile.type.startsWith("image/")) {
    ElMessage.error("请上传图片文件！");
    return false;
  }
  if (rawFile.size / 1024 / 1024 > 10) {
    ElMessage.error("图片大小不能超过10MB！");
    return false;
  }
  return true;
};

const beforeRichVideoUpload = (rawFile) => {
  if (!rawFile.type.startsWith("video/")) {
    ElMessage.error("请上传视频文件！");
    return false;
  }
  if (rawFile.size / 1024 / 1024 > 10) {
    ElMessage.error("富文本视频大小不能超过10MB！");
    return false;
  }
  return true;
};

const getUploadResourceUrl = (res) =>
  res?.imaurl ||
  res?.imgurl ||
  res?.videoUrl ||
  res?.videourl ||
  res?.url ||
  "";

const handleRichImageUploadSuccess = (res) => {
  const imageUrl = getUploadResourceUrl(res);
  if (!imageUrl) {
    ElMessage.error("图片上传成功，但服务端未返回图片地址！");
    return;
  }
  insertRichResource("image", imageUrl);
};

const handleRichVideoUploadSuccess = (res) => {
  const videoUrl = getUploadResourceUrl(res);
  if (!videoUrl) {
    ElMessage.error("视频上传成功，但服务端未返回视频地址！");
    return;
  }
  insertRichResource("video", videoUrl);
};

const handleRichResourceUploadError = (error) => {
  if (error?.status === 413) {
    ElMessage.error("资源文件过大，请压缩后重试！");
    return;
  }
  ElMessage.error("资源上传失败，请稍后重试！");
};

const playRichVideo = (videoUrl) => {
  state.richVideoPreviewUrl = videoUrl;
  state.richVideoPreviewVisible = true;
};

const changenewsstatus = (id, status) => {
  const newstatus = status === 0 || status === "0" ? 1 : 0;
  const payload = {
    newsid: id,
    status: newstatus,
  };
  request.post("/changenewsstatus", payload).then((res) => {
    if (res && res.retcode === "200") {
      getnewslist();
    } else {
      ElMessage.error("更新文章状态失败！");
    }
  });
};

const getAllCCompanynames = () => {
  let payload = {};
  request.post("/getccompaniesnames", payload).then((res) => {
    if (res) {
      state.companynames = res.data;
    } else {
      ElMessage.error("获取企业名称列表失败！");
    }
  });
};

const handleCompanyChange = (companyId) => {
  const company = state.companynames.find((item) => item.id === companyId);
  state.newsInfoForm.ccompanyname = company ? company.name : "";
};

const onNewsTableRowDBClicked = (row, column, event) => {
  console.log("onNewsTableRowDBClicked row:", row);
  state.newsInfoForm.id = row.id;
  state.newsInfoForm.channeltype = row.channeltype;
  state.newsInfoForm.articletype = String(row.articletype ?? "");
  state.newsInfoForm.title = row.title || "";
  state.newsInfoForm.createdate = row.createdate || "1970-01-01";
  state.newsInfoForm.url = row.url || "";
  state.newsInfoForm.htmlcontent = row.htmlcontent || "";
  state.richTextBlocks = parseRichTextContent(row.htmlcontent);
  state.newsInfoForm.videourl = row.videourl || "";
  state.newsInfoForm.weight = row.weight || 0;

  state.showNewsInfoDialog = true;
};

const createArticle = () => {
  resetForm();
  state.showNewsInfoDialog = true;
};

// 清除企业信息窗体数据
const resetForm = () => {
  state.newsInfoForm.id = "";
  state.newsInfoForm.channeltype = "hqzc";
  state.newsInfoForm.articletype = "1";
  state.newsInfoForm.title = "";
  state.newsInfoForm.createdate = "1970-01-01";
  state.newsInfoForm.url = "";
  state.newsInfoForm.htmlcontent = "";
  state.newsInfoForm.videourl = "";
  state.newsInfoForm.weight = 0;
  state.richTextBlocks = [createRichTextBlock("text", "")];
  syncRichTextContent();
  state.richVideoPreviewVisible = false;
  state.richVideoPreviewUrl = "";
};

const abortsaveInfo = () => {
  resetForm();
  state.showNewsInfoDialog = false;
};

const saveNewsInfo = () => {
  if (!state.newsInfoForm.title) {
    ElMessageBox.alert("文章标题为必填项！", "保存错误", {
      confirmButtonText: "OK",
    });
    return;
  }
  const articleType = String(state.newsInfoForm.articletype);
  const contentRequiredByType = {
    1: [state.newsInfoForm.htmlcontent, "请输入文章内容！"],
    2: [state.newsInfoForm.url, "请输入文章外链地址！"],
    3: [state.newsInfoForm.videourl, "请上传或填写视频地址！"],
  };
  const [requiredValue, errorMessage] =
    contentRequiredByType[articleType] || [];
  if (!requiredValue || !String(requiredValue).trim()) {
    ElMessageBox.alert(errorMessage || "请完善文章内容！", "保存错误", {
      confirmButtonText: "OK",
    });
    return;
  }

  let tip_text = state.newsInfoForm.id
    ? "是否要更新文章内容?"
    : "是否要创建新文章?";
  ElMessageBox.confirm(tip_text)
    .then(() => {
      // 发起更新请求
      request
        .post("/updatenews", state.newsInfoForm)
        .then((res) => {
          if (res && res.retcode === "200") {
            ElMessage({
              message: "文章内容更新成功",
              type: "success",
            });
            // 重新获取数据列表
            getnewslist();
            resetForm();
            state.showNewsInfoDialog = false;
          } else {
            ElMessage.error("更新文章内容失败！");
          }
        })
        .catch((error) => {
          // 捕获请求失败（如 404、网络错误等）
          console.error("请求失败：", error);
          ElMessage.error(`请求失败：${error.message}`); // 提示具体错误（如 404 Not Found）
        });
    })
    .catch(() => {
      ElMessage.error("更新文章内容失败！");
    });
};

// 当组件被创建并且DOM已经生成之后,默认加载项目管理子页面
onMounted(() => {
  getnewslist();
});
</script>

<style lang="scss" scoped>
.workzonehead-wrapper {
  width: 100%;
  margin-top: 12px;
  min-height: 64px;
  padding: 12px 16px;
  box-sizing: border-box;
  background-color: #ffffff;
  border: 1px solid #e6eaf0;
  border-radius: 8px;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
}

.search-toolbar {
  flex-wrap: wrap;
}

.search-create-button,
.search-submit-button {
  flex: 0 0 auto;
  height: 36px;
  border-radius: 6px;
}

.search-title-input {
  width: 220px;
  flex: 0 1 220px;
}

.search-channel-group {
  min-height: 36px;
  padding: 0 10px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background-color: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
}

.search-channel-group :deep(.el-radio) {
  margin-right: 8px;
}

.search-channel-group :deep(.el-radio:last-child) {
  margin-right: 0;
}

.rich-content-form-item {
  width: 100%;
}

.rich-editor-toolbar {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.rich-editor {
  width: 100%;
  min-height: 260px;
  padding: 14px;
  box-sizing: border-box;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  background: #fff;
}

.rich-editor-block {
  margin-bottom: 10px;
}

.rich-editor-text {
  min-height: 24px;
  padding: 3px 0;
  outline: none;
  text-align: left;
  white-space: pre-wrap;
  word-break: break-word;
}

.rich-editor-image {
  display: block;
  max-width: 100%;
  max-height: 260px;
  object-fit: contain;
}

.rich-editor-video {
  display: flex;
  width: 320px;
  max-width: 100%;
  height: 180px;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  background: #101010;
  cursor: pointer;
}

.rich-editor-play-icon {
  color: #fff;
  font-size: 42px;
  line-height: 1;
}

.rich-editor-empty {
  color: #a8abb2;
  line-height: 24px;
}

.rich-video-preview {
  display: block;
  width: 100%;
  max-height: 65vh;
  background: #000;
}

.ml-4 {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  margin-left: 5px;
}

.content-wrapper {
  height: 100%;

  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.table-wrapper {
  width: 100%;
}

.pagination-wrapper {
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
  width: 160px;
}

.col-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.credit-count-item {
  width: 48%;
  margin-right: 2%;
}

.credit-count-item:last-child {
  margin-right: 0;
}

:deep(.credit-count-input) {
  width: 220px;
}

:deep(.credit-count-input .el-input__wrapper) {
  min-height: 36px;
  border-radius: 6px;
  box-shadow: 0 0 0 1px #dcdfe6 inset;
  transition: box-shadow 0.2s ease;
}

:deep(.credit-count-input .el-input__wrapper:hover),
:deep(.credit-count-input .el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px var(--el-color-primary) inset;
}

@media (max-width: 768px) {
  .search-title-input {
    width: min(100%, 280px);
    flex-basis: 220px;
  }

  .search-channel-group {
    width: 100%;
    justify-content: space-around;
  }

  .search-submit-button {
    min-width: 76px;
  }

  .credit-count-item {
    width: 100%;
    margin-right: 0;
  }

  :deep(.credit-count-input) {
    width: 100%;
  }
}
</style>
