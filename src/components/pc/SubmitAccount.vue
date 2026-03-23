以下是为你设计的 **PC
端风格用户注册页面**，采用了分栏布局、卡片式设计和细腻的交互效果，符合桌面端的视觉习惯和操作逻辑：
```vue
<template>
  <div class="register-page">
    <!-- 左侧品牌/说明区 -->
    <div class="register-left">
      <div class="brand-logo">
        <span class="brand-name">招商信息管理系统</span>
      </div>
      <div class="register-desc">
        <h3>创建您的工作账号</h3>
        <p>填写以下信息完成注册</p>
      </div>
      <div class="register-features">
        <div class="feature-item">
          <i class="iconfont icon-shield"></i>
          <span>如需帮助</span>
        </div>
        <div class="feature-item">
          <i class="iconfont icon-lock"></i>
          <span>联系 孟庆博</span>
        </div>
        <div class="feature-item">
          <i class="iconfont icon-service"></i>
          <span>或拨打 18500031862</span>
        </div>
      </div>
    </div>

    <!-- 右侧表单区 -->
    <div class="register-right">
      <div class="form-card">
        <div class="form-header">
          <h2>用户注册</h2>
          <p class="form-subtitle">
            已有账号？<a href="/login" class="login-link">立即登录</a>
          </p>
        </div>

        <form @submit.prevent="handleSubmit" class="register-form">
          <!-- 账号信息组 -->
          <div class="form-section">
            <h3 class="section-title">账号信息</h3>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">
                  <span class="required-mark">*</span>用户名
                </label>
                <input
                  type="text"
                  v-model="form.username"
                  class="form-input"
                  placeholder="请输入3-20位字母、数字或下划线"
                  @blur="validateField('username')"
                />
                <div class="error-message" v-if="errors.username">
                  {{ errors.username }}
                </div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">
                  <span class="required-mark">*</span>密码
                </label>
                <div class="password-input">
                  <input
                    :type="showPassword ? 'text' : 'password'"
                    v-model="form.password"
                    class="form-input"
                    placeholder="请输入8-20位含字母和数字的密码"
                    @blur="validateField('password')"
                  />
                  <button
                    type="button"
                    class="toggle-password"
                    @click="showPassword = !showPassword"
                    aria-label="显示/隐藏密码"
                  >
                    <i
                      class="iconfont"
                      :class="showPassword ? 'icon-eye' : 'icon-eye-close'"
                    ></i>
                  </button>
                </div>
                <div class="error-message" v-if="errors.password">
                  {{ errors.password }}
                </div>
                <div class="password-strength" v-if="form.password.length > 0">
                  <div class="strength-label">密码强度：</div>
                  <div class="strength-bars">
                    <div
                      class="strength-bar"
                      :class="getStrengthClass(1)"
                    ></div>
                    <div
                      class="strength-bar"
                      :class="getStrengthClass(2)"
                    ></div>
                    <div
                      class="strength-bar"
                      :class="getStrengthClass(3)"
                    ></div>
                    <div
                      class="strength-bar"
                      :class="getStrengthClass(4)"
                    ></div>
                  </div>
                  <div class="strength-text">{{ getStrengthText() }}</div>
                </div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">
                  <span class="required-mark">*</span>确认密码
                </label>
                <input
                  type="password"
                  v-model="form.confirmPassword"
                  class="form-input"
                  placeholder="请再次输入密码"
                  @blur="validateField('confirmPassword')"
                />
                <div class="error-message" v-if="errors.confirmPassword">
                  {{ errors.confirmPassword }}
                </div>
              </div>
            </div>
          </div>

          <!-- 个人信息组 -->
          <div class="form-section">
            <h3 class="section-title">个人信息</h3>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">
                  <span class="required-mark">*</span>真实姓名
                </label>
                <input
                  type="text"
                  v-model="form.realName"
                  class="form-input"
                  placeholder="请输入您的真实姓名"
                  @blur="validateField('realName')"
                />
                <div class="error-message" v-if="errors.realName">
                  {{ errors.realName }}
                </div>
              </div>
            </div>

            <div class="form-row form-row-double">
              <div class="form-group">
                <label class="form-label">
                  <span class="required-mark">*</span>手机号
                </label>
                <input
                  type="tel"
                  v-model="form.phone"
                  class="form-input"
                  placeholder="请输入11位手机号码"
                  @blur="validateField('phone')"
                />
                <div class="error-message" v-if="errors.phone">
                  {{ errors.phone }}
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">
                  <span class="required-mark">*</span>电子邮箱
                </label>
                <input
                  type="email"
                  v-model="form.email"
                  class="form-input"
                  placeholder="请输入您的电子邮箱"
                  @blur="validateField('email')"
                />
                <div class="error-message" v-if="errors.email">
                  {{ errors.email }}
                </div>
              </div>
            </div>
          </div>

          <!-- 提交按钮 -->
          <button type="submit" class="register-btn" :disabled="isSubmitting">
            <span v-if="isSubmitting" class="loading-spinner">
              <i class="iconfont icon-loading"></i>
            </span>
            <span v-else>注册账号</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import { useRouter } from "vue-router";
import request from "../../utils/request";
import { ElMessage, ElMessageBox } from "element-plus";

const router = useRouter();

// 表单数据
const form = reactive({
  username: "",
  password: "",
  confirmPassword: "",
  realName: "",
  phone: "",
  email: "",
});

// 状态变量
const showPassword = ref(false);
const isSubmitting = ref(false);
const errors = reactive({});

// 密码强度检测
const getPasswordStrength = computed(() => {
  const password = form.password;
  let strength = 0;

  // 长度检测
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;

  // 字符类型检测
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  return Math.min(strength, 4);
});

// 获取密码强度文本
const getStrengthText = () => {
  const strength = getPasswordStrength.value;
  switch (strength) {
    case 0:
      return "请输入密码";
    case 1:
      return "弱";
    case 2:
      return "中";
    case 3:
      return "强";
    case 4:
      return "极强";
    default:
      return "";
  }
};

// 获取密码强度条样式
const getStrengthClass = (barIndex) => {
  const strength = getPasswordStrength.value;
  if (barIndex <= strength) {
    if (strength === 1) return "strength-weak";
    if (strength === 2) return "strength-medium";
    if (strength === 3) return "strength-strong";
    if (strength === 4) return "strength-very-strong";
  }
  return "strength-empty";
};

// 字段验证
const validateField = (fieldName) => {
  const value = form[fieldName];
  let error = "";

  switch (fieldName) {
    case "username":
      if (!value.trim()) {
        error = "用户名不能为空";
      } else if (value.length < 3 || value.length > 20) {
        error = "用户名长度应在3-20个字符之间";
      } else if (!/^[A-Za-z0-9_]+$/.test(value)) {
        error = "用户名只能包含字母、数字和下划线";
      }
      break;

    case "password":
      if (!value) {
        error = "密码不能为空";
      } else if (value.length < 8 || value.length > 20) {
        error = "密码长度应在8-20个字符之间";
      } else if (!/[A-Za-z]/.test(value) || !/[0-9]/.test(value)) {
        error = "密码必须包含字母和数字";
      }
      break;

    case "confirmPassword":
      if (!value) {
        error = "请确认密码";
      } else if (value !== form.password) {
        error = "两次输入的密码不一致";
      }
      break;

    case "realName":
      if (!value.trim()) {
        error = "真实姓名不能为空";
      } else if (!/^[\u4e00-\u9fa5a-zA-Z]+$/.test(value)) {
        error = "真实姓名只能包含中文和字母";
      }
      break;

    case "phone":
      if (!value) {
        error = "手机号不能为空";
      } else if (!/^1[3-9]\d{9}$/.test(value)) {
        error = "请输入有效的手机号";
      }
      break;

    case "email":
      if (!value) {
        error = "电子邮箱不能为空";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        error = "请输入有效的电子邮箱";
      }
      break;
  }

  errors[fieldName] = error;
  return !error;
};

// 表单整体验证
const validateForm = () => {
  let isValid = true;
  Object.keys(form).forEach((field) => {
    if (!validateField(field)) {
      isValid = false;
    }
  });
  return isValid;
};

// 提交表单
const handleSubmit = async () => {
  if (!validateForm()) return;

  try {
    isSubmitting.value = true;

    // 发起更新请求
    request
      .post("/user/submitaccount", form)
      .then((res) => {
        if (res && res.retcode === "200") {
          ElMessage({
            message: "账号注册成功，等待管理员审批！",
            type: "success",
          });
          // 注册成功后跳转到登录页
          setTimeout(() => {
            router.push({
              path: "/login",
              query: { registerSuccess: true },
            });
          }, 1500);
          isSubmitting.value = false;
        } else {
          ElMessage.error(res.str_err_code);
        }
      })
      .catch((error) => {
        // 捕获请求失败（如 404、网络错误等）
        ElMessage.error(`请求失败：${error.message}`); // 提示具体错误（如 404 Not Found）
      });
  } catch (error) {
    console.error("注册失败:", error);
    errors.submit = "注册失败，请稍后重试";
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
/* 页面整体布局 */
.register-page {
  display: flex;
  min-height: 100vh;
  background-color: #f7f8fa;
}

/* 左侧品牌区 */
.register-left {
  width: 35%;
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  color: #fff;
  padding: 60px 40px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.brand-logo {
  display: flex;
  align-items: center;
  margin-bottom: 40px;
}

.logo-img {
  width: 48px;
  height: 48px;
  margin-right: 16px;
}

.brand-name {
  font-size: 24px;
  font-weight: 600;
}

.register-desc h3 {
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 16px;
}

.register-desc p {
  font-size: 18px;
  opacity: 0.9;
  line-height: 1.6;
}

.register-features {
  margin-top: 60px;
}

.feature-item {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  font-size: 16px;
}

.feature-item i {
  font-size: 24px;
  margin-right: 12px;
  opacity: 0.9;
}

/* 右侧表单区 */
.register-right {
  width: 65%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
}

.form-card {
  width: 100%;
  max-width: 700px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  padding: 50px;
}

.form-header {
  margin-bottom: 40px;
}

.form-header h2 {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.form-subtitle {
  font-size: 16px;
  color: #666;
}

.login-link {
  color: #007bff;
  text-decoration: none;
  font-weight: 500;
}

.login-link:hover {
  text-decoration: underline;
}

/* 表单样式 */
.register-form {
  width: 100%;
}

.form-section {
  margin-bottom: 30px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.form-row {
  margin-bottom: 25px;
}

.form-row-double {
  display: flex;
  gap: 20px;
}

.form-row-double .form-group {
  flex: 1;
}

.form-group {
  position: relative;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
  font-size: 14px;
  text-align: left;
}

.required-mark {
  color: #dc3545;
  margin-right: 4px;
}

.form-input {
  width: 100%;
  height: 44px;
  padding: 0 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.form-input:focus {
  border-color: #007bff;
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.form-input:hover {
  border-color: #bbb;
}

/* 密码输入框 */
.password-input {
  position: relative;
}

.toggle-password {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  font-size: 18px;
}

.toggle-password:hover {
  color: #007bff;
}

/* 密码强度 */
.password-strength {
  display: flex;
  align-items: center;
  margin-top: 8px;
  font-size: 12px;
}

.strength-label {
  margin-right: 10px;
  color: #666;
}

.strength-bars {
  display: flex;
  gap: 4px;
  flex: 1;
  max-width: 120px;
}

.strength-bar {
  height: 6px;
  flex: 1;
  border-radius: 3px;
  background-color: #eee;
}

.strength-weak {
  background-color: #dc3545;
}

.strength-medium {
  background-color: #ffc107;
}

.strength-strong {
  background-color: #28a745;
}

.strength-very-strong {
  background-color: #20c997;
}

.strength-text {
  margin-left: 10px;
  font-weight: 500;
}

/* 错误提示 */
.error-message {
  margin-top: 5px;
  color: #dc3545;
  font-size: 13px;
  line-height: 1.4;
}

/* 同意条款 */
.form-agreement {
  margin: 20px 0 30px;
}

.agreement-label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.agreement-checkbox {
  width: 16px;
  height: 16px;
  margin-right: 10px;
  cursor: pointer;
}

.agreement-text {
  font-size: 14px;
  color: #666;
}

.terms-link {
  color: #007bff;
  text-decoration: none;
}

.terms-link:hover {
  text-decoration: underline;
}

/* 注册按钮 */
.register-btn {
  width: 100%;
  height: 48px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.1s;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 60px;
}

.register-btn:hover:not(:disabled) {
  background-color: #0056b3;
}

.register-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.register-btn:active:not(:disabled) {
  transform: scale(0.98);
}

/* 加载动画 */
.loading-spinner {
  display: inline-block;
  margin-right: 8px;
}

.loading-spinner i {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .register-left {
    width: 30%;
  }

  .register-right {
    width: 70%;
  }
}

@media (max-width: 992px) {
  .register-page {
    flex-direction: column;
  }

  .register-left {
    width: 100%;
    padding: 40px;
    text-align: center;
  }

  .brand-logo {
    justify-content: center;
  }

  .register-features {
    display: flex;
    justify-content: center;
    gap: 40px;
    margin-top: 40px;
  }

  .register-right {
    width: 100%;
    padding: 30px;
  }

  .form-card {
    padding: 40px;
  }
}

@media (max-width: 576px) {
  .form-row-double {
    flex-direction: column;
    gap: 0;
  }

  .form-card {
    padding: 30px 20px;
  }
}
</style>
