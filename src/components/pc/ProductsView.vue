<template>
  <div class="content-wrapper">
    <div class="table-wrapper">
      <div class="workzonehead-wrapper">
        <el-input
          v-model.trim="state.getInfoParams.productname"
          clearable
          placeholder="产品名称"
          style="width: 180px; height: 32px; margin-left: 25px"
        />
        <el-button type="primary" @click="getProducts" style="margin-left: 25px"
          >点击查询</el-button
        >
        <el-button
          type="primary"
          @click="createProduct"
          style="margin-left: 25px"
          >新建商品</el-button
        >
        <el-button
          type="primary"
          @click="maintaincategories"
          style="margin-left: 25px"
          >分类管理</el-button
        >
      </div>
      <el-table
        :data="state.companylist"
        style="width: 100%; height: calc(100vh - 240px)"
        @row-dblclick="onCompanyTableRowDBClicked"
      >
        <el-table-column fixed prop="id" label="序号" width="60px" />
        <el-table-column
          fixed
          prop="producttitle"
          label="产品名称"
          width="180px"
        />
        <el-table-column prop="bcompanyname" label="供应商名称" width="180px" />
        <el-table-column
          prop="categorya_title"
          label="一级品类"
          width="120px"
        />
        <el-table-column
          prop="categoryb_title"
          label="二级品类"
          width="120px"
        />
        <el-table-column prop="pricetype" label="计价方式" min-width="30%">
          <template #default="scope">
            {{ showpricetype(scope.row) }}
          </template>
        </el-table-column>
        <el-table-column prop="originalprice" label="原价" min-width="30%" />
        <el-table-column prop="price" label="结算单价" min-width="30%" />
        <el-table-column prop="status" label="产品状态" min-width="30%">
          <template #default="scope">
            {{ showstatus(scope.row.status) }}
          </template>
        </el-table-column>
        <el-table-column label="产品图片" width="120">
          <template v-slot="scope">
            <!-- 解析JSON字符串并获取第一个url，增加多层空值保护 -->
            <img
              v-if="getFirstImageUrl(scope.row.imagelist)"
              :src="getFirstImageUrl(scope.row.imagelist)"
              alt="产品图片"
              class="img-column"
            />
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="Operations" min-width="40%">
          <template #default="scope">
            <el-button
              type="danger"
              v-if="scope.row.status === 0"
              @click="handleOnline(scope.row)"
              >产品上架</el-button
            >
            <el-button
              type="success"
              v-if="scope.row.status === 1"
              @click="handleOffline(scope.row)"
              >产品下架</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="state.getInfoParams.currentPage"
        :page-size="state.getInfoParams.pageSize"
        layout="total, prev, pager, next"
        :total="state.getInfoParams.totalCount"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
  <!-- 产品信息模态窗口 -->
  <el-dialog
    v-model="state.showProductInfoDialog"
    width="80%"
    :show-close="false"
    @close="resetProductForm"
  >
    <div class="dialog-title-wrapper" style="padding-bottom: 15px">
      <span role="heading" aria-level="2" class="el-dialog__title">{{
        state.productInfoForm.id ? "修改产品信息" : "创建产品信息"
      }}</span>
    </div>
    <el-form :model="state.productInfoForm" status-icon label-width="90px">
      <el-form-item label="产品名称" prop="producttitle" style="width: 95%">
        <el-input
          v-model.trim="state.productInfoForm.producttitle"
          placeholder="产品名称"
        />
      </el-form-item>
      <el-form-item label="供应商名称" prop="bcompanyname" style="width: 95%">
        <el-select
          v-model="state.productInfoForm.bcompanyid"
          placeholder="请选择供应商"
        >
          <el-option
            v-for="item in state.allBCompanies"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <div class="line-wrapper" style="width: 95%">
        <el-form-item label="一级品类" prop="categorya" style="width: 90%">
          <el-select
            v-model="state.productInfoForm.categoryaid"
            placeholder="请选择一级品类"
            @change="handleSelectAChange"
          >
            <el-option
              v-for="item in state.categories_a"
              :key="item.id"
              :label="item.title"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="二级品类" prop="categoryb" style="width: 90%">
          <el-select
            v-model="state.productInfoForm.categorybid"
            placeholder="请选择二级品类"
            @change="handleSelectBChange"
          >
            <el-option
              v-for="item in state.categories_b"
              :key="item.id"
              :label="item.title"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="企业评级"
          prop=""
          style="width: 90%"
          v-if="state.productInfoForm.categoryaid === 2"
        >
          <el-select
            v-model="state.productInfoForm.packageid"
            placeholder="请选择企业评级"
          >
            <el-option
              v-for="item in state.creditpackagelist"
              :key="item.id"
              :label="item.packagename"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </div>
      <div class="line-wrapper" style="width: 95%">
        <div class="col-wrapper" style="width: 30%">
          <el-form-item label="计价方式" prop="pricetype" style="width: 100%">
            <el-select
              v-model="state.productInfoForm.pricetype"
              placeholder="请选择计价方式"
            >
              <el-option
                v-for="item in state.pricetypes"
                :key="item.id"
                :label="item.title"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </div>
        <div
          class="line-wrapper"
          style="width: 70%"
          v-if="state.productInfoForm.pricetype === 0"
        >
          <el-form-item label="原价" prop="originalprice" style="width: 33%">
            <el-input-number
              v-model="state.productInfoForm.originalprice"
              :precision="2"
              :step="0.01"
              :max="9999999999"
              :min="0"
              @change="handlePriceChange"
            />
          </el-form-item>
          <el-form-item label="折扣" prop="pricefactor" style="width: 33%">
            <el-input-number
              v-model="state.productInfoForm.pricefactor"
              :precision="2"
              :step="0.05"
              :max="1"
              :min="0"
              @change="handlePriceChange"
            />
          </el-form-item>
          <el-form-item label="单价" style="width: 33%">
            <el-input-number
              v-model="state.productInfoForm.price"
              :precision="2"
              :step="0.05"
              :max="9999999999"
              :min="0"
              :disabled="true"
            />
          </el-form-item>
        </div>
        <div
          class="line-wrapper"
          style="width: 70%"
          v-if="state.productInfoForm.pricetype === 1"
        >
          <el-form-item label="单价" prop="pricefactor" style="width: 33%">
            <el-input-number
              v-model="state.productInfoForm.pricefactor"
              :precision="2"
              :step="100"
              :max="9999999999"
              :min="0"
            />
          </el-form-item>
        </div>
        <div
          class="col-wrapper"
          style="width: 70%"
          v-if="state.productInfoForm.pricetype === 2"
        >
          <!-- 套餐计价方式 - 遍历packageprice数组 -->
          <div
            v-for="(item, index) in state.productInfoForm.packageprice"
            :key="index"
            class="package-price-item"
            style="
              display: flex;
              align-items: center;
              margin-bottom: 10px;
              gap: 10px;
            "
          >
            <el-form-item
              label="套餐项名称"
              prop="packageprice.title"
              style="width: 45%; margin: 0"
            >
              <el-input
                v-model.trim="item.title"
                placeholder="请输入套餐项名称"
                style="width: 100%"
              />
            </el-form-item>

            <el-form-item
              label="套餐项价格"
              prop="packageprice.value"
              style="width: 45%; margin: 0"
            >
              <el-input-number
                v-model="item.value"
                :precision="2"
                :step="0.01"
                :max="9999999999"
                :min="0"
                style="width: 100%"
                placeholder="请输入套餐项价格"
              />
            </el-form-item>

            <!-- 可选：添加删除按钮 -->
            <el-button
              type="danger"
              size="small"
              @click="removePackagePriceItem(index)"
              ><el-icon><Delete /></el-icon
            ></el-button>
          </div>

          <!-- 添加套餐项按钮 -->
          <el-button
            type="primary"
            size="small"
            @click="addPackagePriceItem"
            style="margin-top: 5px; width: 100px"
            ><el-icon><Plus /></el-icon>添加套餐项</el-button
          >
        </div>
      </div>
      <el-form-item label="产品详情" prop="details" style="width: 95%">
        <el-input
          v-model="state.productInfoForm.details"
          maxlength="500"
          style="width: 100%; min-height: 240px"
          placeholder="请输入产品详情介绍"
          show-word-limit
          type="textarea"
        />
      </el-form-item>
      <div class="upload-layer-wrapper">
        <div class="upload-layer upload-layer-top">
          <div class="upload-layer-title">头部图片</div>
          <el-upload
            v-model:file-list="state.productInfoForm.imagelist"
            :action="store.state.getImgurlApi"
            list-type="picture-card"
            :on-success="handleUploadFileOver"
            :on-preview="handlePictureCardPreview"
            :on-remove="handleRemoveImg"
            :before-upload="beforeAvatarUpload"
          >
            <div
              style="
                display: flex;
                flex-direction: column;
                justify-content: center;
                text-align: center;
              "
            >
              <div class="line-wrapper" style="justify-content: center">
                <el-icon><Plus /></el-icon>
              </div>
              <p>点击上传头部图片</p>
            </div>
          </el-upload>
        </div>

        <div class="upload-layer upload-layer-bottom">
          <div class="upload-layer-title">详情内容图片</div>
          <el-upload
            v-model:file-list="state.productInfoForm.detailimagelist"
            :action="store.state.getImgurlApi"
            list-type="picture-card"
            :on-success="handleUploadDetailFileOver"
            :on-preview="handleDetailPictureCardPreview"
            :on-remove="handleRemoveDetailImg"
            :before-upload="beforeAvatarUploadDetail"
          >
            <div
              style="
                display: flex;
                flex-direction: column;
                justify-content: center;
                text-align: center;
              "
            >
              <div class="line-wrapper" style="justify-content: center">
                <el-icon><Plus /></el-icon>
              </div>
              <p>点击上传详情内容图片</p>
            </div>
          </el-upload>
        </div>
      </div>
    </el-form>

    <template #footer>
      <div class="dialog-footer-wrapper">
        <span class="dialog-footer">
          <el-button @click="abortSaveProductInfo">取消</el-button>
          <el-button type="primary" @click="saveProductInfo"> 保存 </el-button>
        </span>
      </div>
    </template>
  </el-dialog>
  <!-- 查看图片窗体 -->
  <el-dialog
    v-model="state.dialogViewPicVisible"
    class="dialog-preview"
    title="图片预览"
    :close-on-click-modal="true"
  >
    <img
      style="width: 100%; height: 100%; object-fit: contain"
      :src="state.curDialogImageUrl"
      alt="Preview Image"
    />
  </el-dialog>
  <!-- 分类信息模态窗口 -->
  <el-dialog v-model="state.showCategoryDialog" width="80%" :show-close="true">
    <div class="dialog-title-wrapper" style="padding-bottom: 15px">
      <span role="heading" aria-level="2" class="el-dialog__title">{{
        "维护分类信息"
      }}</span>
    </div>
    <div class="line-wrapper" style="justify-content: space-between">
      <div style="width: 45%; text-align: left">
        <el-button type="primary" @click="createNewCategoryA"
          >增加一级分类</el-button
        >
        <el-table
          :data="state.categories_a"
          style="width: 100%; height: calc(100vh - 240px)"
          @row-dblclick="onCategoryATableRowDBClicked"
        >
          <el-table-column fixed prop="id" label="序号" min-width="20%" />
          <el-table-column
            fixed
            prop="title"
            label="分类标题"
            min-width="40%"
          />
        </el-table>
      </div>
      <div style="width: 45%; text-align: left">
        <el-button type="primary" @click="createNewCategoryB"
          >增加二级分类</el-button
        >
        <el-table
          :data="state.categories_b"
          style="width: 100%; height: calc(100vh - 240px)"
          @row-dblclick="onCategoryBTableRowDBClicked"
        >
          <el-table-column fixed prop="id" label="序号" min-width="20%" />
          <el-table-column
            fixed
            prop="title"
            label="分类标题"
            min-width="40%"
          />
          <el-table-column
            fixed
            prop="categoryaid"
            label="所属一级分类"
            min-width="40%"
          >
            <template #default="scope">
              {{ showcategoryatitle(scope.row.categoryaid) }}
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </el-dialog>
  <el-dialog
    v-model="state.showCategoryDialogA"
    width="40%"
    :show-close="false"
    @close="resetCategoryAForm"
  >
    <div class="dialog-title-wrapper" style="padding-bottom: 15px">
      <span role="heading" aria-level="2" class="el-dialog__title">{{
        state.category_a_info.id
          ? "修改一级分类子项信息"
          : "创建一级分类子项信息"
      }}</span>
    </div>
    <el-form :model="state.category_a_info" status-icon label-width="120px">
      <div class="line-wrapper">
        <el-form-item label="分类名称" prop="title" style="width: 90%">
          <el-input
            v-model.trim="state.category_a_info.title"
            placeholder="一级分类名称"
          />
        </el-form-item>
      </div>
    </el-form>
    <template #footer>
      <div class="dialog-footer-wrapper">
        <span class="dialog-footer">
          <el-button @click="abortSaveCategoryA">取消</el-button>
          <el-button type="primary" @click="saveCategoryAInfo">
            保存
          </el-button>
        </span>
      </div>
    </template>
  </el-dialog>
  <el-dialog
    v-model="state.showCategoryDialogB"
    width="40%"
    :show-close="false"
    @close="resetCategoryBForm"
  >
    <div class="dialog-title-wrapper" style="padding-bottom: 15px">
      <span role="heading" aria-level="2" class="el-dialog__title">{{
        state.category_b_info.id
          ? "修改二级分类子项信息"
          : "创建二级分类子项信息"
      }}</span>
    </div>
    <el-form :model="state.category_b_info" status-icon label-width="120px">
      <div class="line-wrapper">
        <el-form-item label="分类名称" prop="title" style="width: 90%">
          <el-input
            v-model.trim="state.category_b_info.title"
            placeholder="二级分类名称"
          />
        </el-form-item>
      </div>
      <div class="line-wrapper">
        <el-form-item label="一级分类" prop="categoryaid" style="width: 90%">
          <el-select
            v-model="state.category_b_info.categoryaid"
            placeholder="请选择一级品类"
          >
            <el-option
              v-for="item in state.categories_a"
              :key="item.id"
              :label="item.title"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </div>
    </el-form>
    <template #footer>
      <div class="dialog-footer-wrapper">
        <span class="dialog-footer">
          <el-button @click="abortSaveCategoryB">取消</el-button>
          <el-button type="primary" @click="saveCategoryBInfo">
            保存
          </el-button>
        </span>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive } from "vue";
import request from "../../utils/request";
import { onMounted } from "vue";
import store from "../../store";
import { timestamp2date, timestamp2datetime } from "../../utils";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus, Delete } from "@element-plus/icons-vue";
import { download } from "../../utils/request";

const state = reactive({
  fileTempList: [],
  companylist: [],
  showProductInfoDialog: false,
  showUploadFileDialog: false,
  showCategoryDialog: false,
  showCategoryDialogA: false,
  showCategoryDialogB: false,
  allBCompanies: [],
  categories_a: [],
  categories_b: [],
  pricetypes: [
    {
      id: 0,
      title: "比例折扣",
    },
    {
      id: 1,
      title: "金额计价",
    },
    {
      id: 2,
      title: "套餐计价",
    },
  ],
  getInfoParams: {
    totalCount: 0,
    currentPage: 1,
    pageSize: 30,
    productname: "",
    contact: "",
    telnumber: "",
    channel: "",
  },
  dialogViewPicVisible: false,
  curDialogImageUrl: "",
  productInfoForm: {
    id: "",
    producttitle: "",
    bcompanyname: "",
    bcompanyid: "",
    categoryaid: "",
    categorybid: "",
    pricetype: "",
    originalprice: "",
    price: "",
    pricefactor: "",
    status: "",
    extrainfo: "",
    details: "",
    imagelist: [],
    imagelistreal: [],
    detailimagelist: [],
    detailimagelistreal: [],
    packageprice: [],
    packageid: 0, // 康护产品对应品级
  },
  uploadFileForm: {
    fileid: "110",
    department: "0",
    uploaderid: "",
    posterfingerprint: "ccc",
  },
  uploadFileList: "",
  category_a_info: {
    id: "",
    title: "",
  },
  category_b_info: {
    id: "",
    title: "",
    categoryaid: "",
  },
  creditpackagelist: [],
});

const handleSelectAChange = (e) => {
  // 当一级分类选择变化后，要先清空二级分类的选择结果，并重新拉取二级分类的备选项
  state.productInfoForm.categorybid = "";
  let payload = {
    categoryaid: e,
  };
  request.post("/getbcategoriesbyaid", payload).then((res) => {
    if (res && res.retcode === "200" && res.data) {
      state.categories_b = res.data.arr_category_b;
    } else {
      ElMessage.error("更新失败！");
    }
  });
};

const handleSelectBChange = (e) => {
  // 当二级菜单选项变化时，强制重新赋值一级菜单值
  // 遍历state.categories_b数组，查找id=e的对象，获取categoryaid的值，赋值给state.productInfoForm.categoryaid
  if (!state.categories_b || state.categories_b.length === 0) return;
  const found = state.categories_b.find((item) => item.id === e);
  if (found && found.categoryaid !== undefined) {
    state.productInfoForm.categoryaid = found.categoryaid;
  }
};

const showcategoryatitle = (categoryaid) => {
  // 遍历对象数组categories_a,找到对应id=categoryaid,返回title
  if (!state.categories_a || state.categories_a.length === 0) return "";
  const found = state.categories_a.find((item) => item.id === categoryaid);
  return found ? found.title : "";
};

const getAllPackages = () => {
  let payload = {};
  request.post("/getallpackages", payload).then((res) => {
    if (res && res.retcode === "200" && res.data) {
      state.creditpackagelist = res.data;
    } else {
      ElMessage.error("获取额度配置列表失败！");
    }
  });
};

// 添加套餐项
const addPackagePriceItem = () => {
  // 初始化新的套餐项对象
  state.productInfoForm.packageprice.push({
    title: "",
    value: 0,
  });
};

// 删除套餐项
const removePackagePriceItem = (index) => {
  state.productInfoForm.packageprice.splice(index, 1);
};

const getFirstImageUrl = (imagelistStr) => {
  // 空值/非字符串直接返回空
  if (!imagelistStr || typeof imagelistStr !== "string") return "";

  try {
    // 解析JSON字符串为数组
    const imagelist = JSON.parse(imagelistStr);
    // 校验是数组、有元素、且元素有url字段
    if (Array.isArray(imagelist) && imagelist.length > 0 && imagelist[0].url) {
      return imagelist[0].url;
    }
    return "";
  } catch (e) {
    // JSON解析失败（格式错误）时返回空
    console.warn("解析imagelist失败:", e);
    return "";
  }
};

const handleRemoveImg = (uploadFile, uploadFiles) => {
  state.productInfoForm.imagelistreal = [];
  state.productInfoForm.imagelist = [];
  uploadFiles.forEach((item, index) => {
    let curobj = {
      name: item.name,
      url: item.url,
    };
    state.productInfoForm.imagelistreal.push(curobj);
  });
  state.productInfoForm.imagelist = state.productInfoForm.imagelistreal;
};

const beforeAvatarUpload = (rawFile) => {
  if (rawFile.size / 1024 / 1024 > 10) {
    ElMessage.error("Picture size can not exceed 10MB!");
    return false;
  }
  return true;
};

const handlePictureCardPreview = (uploadedFile) => {
  state.curDialogImageUrl = uploadedFile.url;
  state.dialogViewPicVisible = true;
};

const handleUploadFileOver = (res) => {
  console.log(state.productInfoForm.imagelist);
  if (res.status === 200) {
    let curObj = {
      name: state.productInfoForm.imagelistreal.length + 1,
      url: res.imgurl,
    };
    state.productInfoForm.imagelistreal.push(curObj);
  } else {
    ElMessage.error("请选择1M以下的图片文件！");
  }
  state.productInfoForm.imagelist = state.productInfoForm.imagelistreal;
};

const handleRemoveDetailImg = (uploadFile, uploadFiles) => {
  state.productInfoForm.detailimagelistreal = [];
  state.productInfoForm.detailimagelist = [];
  uploadFiles.forEach((item, index) => {
    let curobj = {
      name: item.name,
      url: item.url,
    };
    state.productInfoForm.detailimagelistreal.push(curobj);
  });
  state.productInfoForm.detailimagelist =
    state.productInfoForm.detailimagelistreal;
};

const beforeAvatarUploadDetail = (rawFile) => {
  if (rawFile.size / 1024 / 1024 > 10) {
    ElMessage.error("Picture size can not exceed 10MB!");
    return false;
  }
  return true;
};

const handleDetailPictureCardPreview = (uploadedFile) => {
  state.curDialogImageUrl = uploadedFile.url;
  state.dialogViewPicVisible = true;
};

const handleUploadDetailFileOver = (res) => {
  console.log(state.productInfoForm.detailimagelist);
  if (res.status === 200) {
    let curObj = {
      name: state.productInfoForm.detailimagelistreal.length + 1,
      url: res.imgurl,
    };
    state.productInfoForm.detailimagelistreal.push(curObj);
  } else {
    ElMessage.error("请选择1M以下的图片文件！");
  }
  state.productInfoForm.detailimagelist =
    state.productInfoForm.detailimagelistreal;
};

const handlePriceChange = () => {
  state.productInfoForm.price =
    state.productInfoForm.originalprice * state.productInfoForm.pricefactor;
};

const onCompanyTableRowDBClicked = (row, column, event) => {
  state.productInfoForm.id = row.id;
  state.productInfoForm.producttitle = row.producttitle;
  state.productInfoForm.bcompanyid = row.bcompanyid;
  state.productInfoForm.categoryaid = row.categorya;
  state.productInfoForm.categorybid = row.categoryb;
  state.productInfoForm.pricetype = row.pricetype;
  state.productInfoForm.originalprice = row.originalprice;
  state.productInfoForm.pricefactor = row.pricefactor;
  state.productInfoForm.details = row.details;
  state.productInfoForm.extrainfo = row.extrainfo;
  if (!row.imagelist) {
    state.productInfoForm.imagelistreal = [];
  } else {
    state.productInfoForm.imagelistreal = JSON.parse(row.imagelist);
  }
  state.productInfoForm.imagelist = state.productInfoForm.imagelistreal;
  if (!row.detailimagelist) {
    state.productInfoForm.detailimagelistreal = [];
  } else {
    state.productInfoForm.detailimagelistreal = JSON.parse(row.detailimagelist);
  }
  state.productInfoForm.detailimagelist =
    state.productInfoForm.detailimagelistreal;
  state.productInfoForm.packageprice = JSON.parse(row.packageprice);
  state.productInfoForm.packageid = row.packageid;

  state.showProductInfoDialog = true;
};

const onCategoryATableRowDBClicked = (row, column, event) => {
  console.log("aa");
  state.category_a_info.id = row.id;
  state.category_a_info.title = row.title;
  state.showCategoryDialogA = true;
  console.log("aaa");
};
const onCategoryBTableRowDBClicked = (row, column, event) => {
  state.category_b_info.id = row.id;
  state.category_b_info.title = row.title;
  state.category_b_info.categoryaid = row.categoryaid;
  state.showCategoryDialogB = true;
};

const getCategories = () => {
  // 访问接口给两个category赋值
  let payload = {};
  request.post("/getcategories", payload).then((res) => {
    if (res) {
      state.categories_a = res.data.arr_category_a;
      state.categories_b = res.data.arr_category_b;
    } else {
      ElMessage.error("更新失败！");
    }
  });
};

const maintaincategories = () => {
  getCategories();
  state.showCategoryDialog = true;
};

const showpricetype = (rowinfo) => {
  if (rowinfo.pricetype === 0) {
    return (rowinfo.pricefactor * 100) % 10 === 0
      ? rowinfo.pricefactor * 10 + "折"
      : rowinfo.pricefactor * 100 + "折";
  } else if (rowinfo.pricetype === 2) {
    return "套餐计价";
  } else {
    return "优惠金额";
  }
};

const showstatus = (status) => {
  if (status === 1) {
    return "已上架";
  } else {
    return "已下架";
  }
};

const handleOnline = (rowinfo) => {
  let tip_text = "确认要上架产品?";
  ElMessageBox.confirm(tip_text, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "info",
  })
    .then(() => {
      let payload = {
        id: rowinfo.id,
        status: 1,
      };
      request.post("/changeproductstatus", payload).then((res) => {
        if (res) {
          getProducts();
        } else {
          ElMessage.error("更新失败！");
        }
      });
    })
    .catch(() => {});
};
const handleOffline = (rowinfo) => {
  let tip_text = "确认要下架产品?";
  ElMessageBox.confirm(tip_text, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "info",
  })
    .then(() => {
      let payload = {
        id: rowinfo.id,
        status: 0,
      };
      request.post("/changeproductstatus", payload).then((res) => {
        if (res) {
          getProducts();
        } else {
          ElMessage.error("更新失败！");
        }
      });
    })
    .catch(() => {});
};

const createProduct = () => {
  resetProductForm();
  state.showProductInfoDialog = true;
};
// 清除产品信息窗体数据
const resetProductForm = () => {
  state.productInfoForm.id = "";
  state.productInfoForm.producttitle = "";
  state.productInfoForm.bcompanyid = "";
  state.productInfoForm.categoryaid = "";
  state.productInfoForm.categorybid = "";
  state.productInfoForm.pricetype = "";
  state.productInfoForm.originalprice = "";
  state.productInfoForm.pricefactor = "";
  state.productInfoForm.details = "";
  state.productInfoForm.extrainfo = "";
  state.productInfoForm.imagelist = [];
  state.productInfoForm.imagelistreal = [];
  state.productInfoForm.detailimagelist = [];
  state.productInfoForm.detailimagelistreal = [];
  state.productInfoForm.packageprice = [];
  state.productInfoForm.packageid = 0;
};
const resetFileUploadDialogForm = () => {
  state.uploadFileList = "";
};

const abortSaveProductInfo = () => {
  resetProductForm();
  state.showProductInfoDialog = false;
};

const createNewCategoryB = () => {
  resetCategoryBForm();
  state.showCategoryDialogB = true;
};
const resetCategoryBForm = () => {
  state.category_b_info.id = "";
  state.category_b_info.title = "";
  state.category_b_info.categoryaid = "";
};
const abortSaveCategoryB = () => {
  resetCategoryBForm();
  state.showCategoryDialogB = false;
};
const saveCategoryBInfo = () => {
  console.info("state.category_b_info.title", state.category_b_info.title);
  console.info(
    "state.category_b_info.categoryaid",
    state.category_b_info.categoryaid,
  );
  if (
    !state.category_b_info.title ||
    state.category_b_info.categoryaid === "" ||
    state.category_b_info.categoryaid === null
    // !state.productInfoForm.channel
  ) {
    ElMessageBox.alert("分类名称必填项,并选择一级分类！", "保存错误", {
      confirmButtonText: "OK",
    });
    return;
  }
  let tip_text = state.category_b_info.id
    ? "是否要更新二级分类信息?"
    : "是否要创建新的二级分类?";
  ElMessageBox.confirm(tip_text)
    .then(() => {
      // 发起更新请求
      let payload = {
        type: 2, // 二级分类
        id: state.category_b_info.id,
        title: state.category_b_info.title,
        categoryaid: state.category_b_info.categoryaid,
      };
      request
        .post("/updatecategory", payload)
        .then((res) => {
          if (res && res.retcode === "200") {
            ElMessage({
              message: "分类数据更新成功",
              type: "success",
            });
            // 重新获取数据列表
            getCategories();
            resetCategoryBForm();
            state.showCategoryDialogB = false;
          } else {
            ElMessage.error("更新商户数据失败！");
          }
        })
        .catch((error) => {
          // 捕获请求失败（如 404、网络错误等）
          console.error("请求失败：", error);
          ElMessage.error(`请求失败：${error.message}`); // 提示具体错误（如 404 Not Found）
        });
    })
    .catch(() => {
      ElMessage.error("更新商户数据失败！");
    });
};

const createNewCategoryA = () => {
  resetCategoryAForm();
  state.showCategoryDialogA = true;
};
const resetCategoryAForm = () => {
  state.category_a_info.id = "";
  state.category_a_info.title = "";
};
const abortSaveCategoryA = () => {
  resetCategoryAForm();
  state.showCategoryDialogA = false;
};

const saveCategoryAInfo = () => {
  if (
    !state.category_a_info.title
    // !state.productInfoForm.contact ||
    // !state.productInfoForm.channel
  ) {
    ElMessageBox.alert("分类名称必填项！", "保存错误", {
      confirmButtonText: "OK",
    });
    return;
  }
  let tip_text = state.category_a_info.id
    ? "是否要更新一级分类信息?"
    : "是否要创建新的一级分类?";
  ElMessageBox.confirm(tip_text)
    .then(() => {
      // 发起更新请求
      let payload = {
        type: 1, // 一级分类
        id: state.category_a_info.id,
        title: state.category_a_info.title,
      };
      request
        .post("/updatecategory", payload)
        .then((res) => {
          if (res && res.retcode === "200") {
            ElMessage({
              message: "分类数据更新成功",
              type: "success",
            });
            // 重新获取数据列表
            getCategories();
            resetCategoryAForm();
            state.showCategoryDialogA = false;
          } else {
            ElMessage.error("更新商户数据失败！");
          }
        })
        .catch((error) => {
          // 捕获请求失败（如 404、网络错误等）
          console.error("请求失败：", error);
          ElMessage.error(`请求失败：${error.message}`); // 提示具体错误（如 404 Not Found）
        });
    })
    .catch(() => {
      ElMessage.error("更新商户数据失败！");
    });
};

const saveProductInfo = () => {
  if (!state.productInfoForm.producttitle) {
    ElMessageBox.alert("商品名称为必填项！", "保存错误", {
      confirmButtonText: "OK",
    });
    return;
  }
  if (!state.productInfoForm.bcompanyid) {
    ElMessageBox.alert("请为商品关联供应商信息！", "保存错误", {
      confirmButtonText: "OK",
    });
    return;
  }
  if (state.productInfoForm.categoryaid === "") {
    ElMessageBox.alert(
      "请选择一级分类，如无正确分类请到分类维护页面添加！",
      "保存错误",
      {
        confirmButtonText: "OK",
      },
    );
    return;
  }
  if (state.productInfoForm.categorybid === "") {
    ElMessageBox.alert(
      "请选择二级分类，如无正确分类请到分类维护页面添加！",
      "保存错误",
      {
        confirmButtonText: "OK",
      },
    );
    return;
  }
  // 检查计价方式，原价、价格因子、套餐的逻辑规则：
  // pricetype为空：不允许保存
  // pricetype=0（比例折扣）：originalprice、pricefactor必填，pricefactor为0-1之间的小数，price计算为originalprice*pricefactor
  // pricetype=1（金额计价）：originalprice、pricefactor必填，pricefactor为优惠后价格，originalprice可等于pricefactor
  // pricetype=2（套餐计价）：packageprice数组必填，数组内每个项的title和value必填，originalprice和pricefactor不做要求
  if (state.productInfoForm.pricetype === "") {
    ElMessageBox.alert("请选择商品计价方式！", "保存错误", {
      confirmButtonText: "OK",
    });
    return;
  } else if (state.productInfoForm.pricetype === 2) {
    // 套餐计价方式
    if (
      !state.productInfoForm.packageprice ||
      state.productInfoForm.packageprice.length === 0
    ) {
      ElMessageBox.alert("请添加套餐计价项！", "保存错误", {
        confirmButtonText: "OK",
      });
      return;
    }
    for (let i = 0; i < state.productInfoForm.packageprice.length; i++) {
      let item = state.productInfoForm.packageprice[i];
      if (!item.title || item.value === "" || item.value === null) {
        ElMessageBox.alert(
          "请确保所有套餐计价项的名称和价格均已填写！",
          "保存错误",
          {
            confirmButtonText: "OK",
          },
        );
        return;
      }
    }
  } else if (state.productInfoForm.pricetype === 0) {
    // 比例折扣
    if (
      state.productInfoForm.originalprice === "" ||
      state.productInfoForm.originalprice === null
    ) {
      ElMessageBox.alert("请填写商品原价！", "保存错误", {
        confirmButtonText: "OK",
      });
      return;
    }
    if (
      state.productInfoForm.pricefactor === "" ||
      state.productInfoForm.pricefactor === null ||
      state.productInfoForm.pricefactor <= 0 ||
      state.productInfoForm.pricefactor > 1
    ) {
      ElMessageBox.alert("请填写正确的折扣比例，例0.85为八五折！", "保存错误", {
        confirmButtonText: "OK",
      });
      return;
    }
  } else if (state.productInfoForm.pricetype === 1) {
    // 金额计价
    if (
      state.productInfoForm.pricefactor === "" ||
      state.productInfoForm.pricefactor === null
    ) {
      ElMessageBox.alert("请填写商品优惠后价格！", "保存错误", {
        confirmButtonText: "OK",
      });
      return;
    }
  }

  if (
    state.productInfoForm.categoryaid === 2 &&
    !state.productInfoForm.packageid
  ) {
    ElMessageBox.alert("康护产品请关联对应的套餐品级！", "保存错误", {
      confirmButtonText: "OK",
    });
    return;
  }

  let tip_text = state.productInfoForm.id
    ? "是否要更新产品信息?"
    : "是否要创建新商品?";
  ElMessageBox.confirm(tip_text)
    .then(() => {
      // 发起更新请求
      let str_json_imglist = JSON.stringify(
        state.productInfoForm.imagelistreal,
      );
      let str_json_detailimglist = JSON.stringify(
        state.productInfoForm.detailimagelistreal,
      );
      let payload = {
        id: state.productInfoForm.id,
        producttitle: state.productInfoForm.producttitle,
        bcompanyid: state.productInfoForm.bcompanyid,
        categoryaid: state.productInfoForm.categoryaid,
        categorybid: state.productInfoForm.categorybid,
        pricetype: state.productInfoForm.pricetype,
        originalprice: state.productInfoForm.originalprice,
        pricefactor: state.productInfoForm.pricefactor,
        details: state.productInfoForm.details,
        extrainfo: state.productInfoForm.extrainfo,
        imagelist: str_json_imglist,
        detailimagelist: str_json_detailimglist,
        packageprice: JSON.stringify(state.productInfoForm.packageprice),
        packageid: state.productInfoForm.packageid,
      };
      request
        .post("/updateproduct", payload)
        .then((res) => {
          if (res && res.retcode === "200") {
            ElMessage({
              message: "商品数据更新成功",
              type: "success",
            });
            // 重新获取数据列表
            getProducts();
            resetProductForm();
            state.showProductInfoDialog = false;
          } else {
            ElMessage.error("更新商品数据失败！");
          }
        })
        .catch((error) => {
          // 捕获请求失败（如 404、网络错误等）
          ElMessage.error(`请求失败：${error.message}`); // 提示具体错误（如 404 Not Found）
        });
    })
    .catch(() => {
      ElMessage.error("更新商品数据失败！");
    });
};

// pageination选择页码时加载项目数据
const handleCurrentChange = (pagenum) => {
  state.getInfoParams.currentPage = pagenum;
  getProducts();
};

const getProducts = () => {
  request.post("/getproducts", state.getInfoParams).then((res) => {
    if (res) {
      state.companylist = res.data;
      state.getInfoParams.totalCount = res.pageination.total_count;
      state.getInfoParams.currentPage = res.pageination.currentPage;
    } else {
      ElMessage.error("获取文件数据失败！");
    }
  });
};

const getallbcompanies = () => {
  let payload = {};
  request.post("/getallbcompanies", payload).then((res) => {
    if (res) {
      state.allBCompanies = res.data;
    } else {
      ElMessage.error("获取文件数据失败！");
    }
  });
};

// 当组件被创建并且DOM已经生成之后,默认加载项目管理子页面
onMounted(() => {
  getProducts();
  getCategories();
  getallbcompanies();
  getAllPackages();
});
</script>

<style lang="scss" scoped>
.workzonehead-wrapper {
  width: 100%;
  margin-top: 15px;
  height: 64px;
  background-color: white;
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

.col-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.upload-demo {
  width: 160px;
}

.upload-layer-wrapper {
  width: 95%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 8px;
}

.upload-layer {
  width: 100%;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 14px 16px;
}

.upload-layer-top {
  background-color: #f8fbff;
}

.upload-layer-bottom {
  background-color: #f9fbf6;
}

.upload-layer-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 10px;
}

.img-column {
  width: 100px; /* 宽度 */
  height: 80px; /* 高度 */
  object-fit: cover; /* 保持比例，裁剪多余部分 */
  border-radius: 4px; /* 可选：圆角 */
}
.el-input-number {
  width: 100%;
}
:deep(.el-textarea__inner) {
  min-height: 240px !important;
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.avatar-uploader-icon {
  color: #8c939d;
  width: 178px;
  height: 178px;
  background: #f4f4f5;
  /* text-align: center; */
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  font-size: 16px;
  border: 1px solid #d7d7dc;
}

:deep(.dialog-preview) {
  /* 1. 限制弹窗最大宽高为屏幕的 50% */
  max-width: 50vw !important; /* vw：视口宽度的 1%，50vw 即屏幕宽度 50% */
  max-height: 50vh !important; /* vh：视口高度的 1%，50vh 即屏幕高度 50% */
  width: fit-content; /* 宽度自适应内容，不超出 max-width */
  height: fit-content; /* 高度自适应内容，不超出 max-height */
}

/* 优化弹窗主体容器，避免内容溢出 */
:deep(.dialog-preview .el-dialog__body) {
  padding: 0; /* 移除默认内边距，让图片全屏展示 */
  max-height: calc(50vh - 60px); /* 扣除弹窗标题栏高度，避免超出整体最大高度 */
  overflow: hidden; /* 隐藏溢出内容 */
}

/* 2. 实现弹窗垂直+水平居中（el-dialog 默认水平居中，补充垂直居中） */
:deep(.el-dialog__wrapper) {
  display: flex;
  align-items: center; /* 垂直居中 */
  justify-content: center; /* 水平居中（兜底，确保兼容性） */
}

.img-placeholder {
  width: 100px;
  height: 80px;
  border: 1px dashed #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 12px;
}
</style>
