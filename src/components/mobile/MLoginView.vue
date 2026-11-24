<template>
  <div class="login-body">
    <div class="login-panel">
      <div class="panel-glow panel-glow-1"></div>
      <div class="panel-glow panel-glow-2"></div>

      <el-form
        :model="formData"
        :rules="rules"
        ref="formDataRef"
        class="login-form"
      >
        <el-form-item prop="username" class="login-form-item">
          <el-input
            class="login-input"
            placeholder="请输入账号"
            v-model="formData.username"
            size="large"
            type="text"
          >
            <template #prefix>
              <el-icon>
                <i-ep-user />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item prop="password" class="login-form-item">
          <el-input
            class="login-input"
            placeholder="请输入密码"
            v-model="formData.password"
            size="large"
            type="password"
            @keyup.enter.native="login()"
          >
            <template #prefix>
              <el-icon>
                <i-ep-lock />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item class="login-submit-item">
          <el-button
            type="primary"
            class="login-btn"
            @click="login()"
            size="large"
            >登录</el-button
          >
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { ElMessage } from "element-plus";
import request from "../../utils/request";
import { useRouter } from "vue-router";
import store from "../../store";

const formDataRef = ref();
let formData = reactive({
  username: "",
  password: "",
});

const rules = {
  username: [
    {
      required: true,
      message: "请输入用户名",
    },
  ],
  password: [
    {
      required: true,
      message: "请输入密码",
    },
  ],
};

const router = useRouter();

const login = () => {
  const form_obj = JSON.parse(JSON.stringify(formData));

  request.post("/user/login", form_obj).then((res) => {
    if (res && res.retcode === "200") {
      ElMessage({
        message: "登录成功",
        type: "success",
      });

      const tokenObj = { token: " isLogin", startTime: new Date().getTime() };
      window.localStorage.setItem("isLogin", JSON.stringify(tokenObj));
      localStorage.setItem(
        "username",
        JSON.parse(JSON.stringify(res.retBody.username)),
      );
      localStorage.setItem(
        "userid",
        JSON.parse(JSON.stringify(res.retBody.userid)),
      );
      localStorage.setItem(
        "email",
        JSON.parse(JSON.stringify(res.retBody.email)),
      );
      localStorage.setItem(
        "level",
        JSON.parse(JSON.stringify(res.retBody.level)),
      );

      const objCurUserInfo = {
        username: JSON.parse(JSON.stringify(res.retBody.username)),
        userid: JSON.parse(JSON.stringify(res.retBody.userid)),
        email: JSON.parse(JSON.stringify(res.retBody.email)),
        level: JSON.parse(JSON.stringify(res.retBody.level)),
        avation: "",
      };
      store.commit("userLogin", objCurUserInfo);
      router.push("/mbi");
    } else if (res.retcode === "400") {
      ElMessage.error("账号状态异常，请联系管理员！");
    } else {
      ElMessage.error("账号或密码错误！！！登录失败！！！");
    }
  });
};
</script>

<style lang="scss" scoped>
.login-body {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  box-sizing: border-box;
  background: url("https://mvpme82.cloud/data/45791308-2d05-4d7a-b331-9d41d8d6cd16_1783778810680.jpg")
    no-repeat center center;
  background-size: cover;

  .login-panel {
    position: relative;
    z-index: 1;
    width: min(420px, calc(100vw - 32px));
    height: 180px;
    padding: 24px;
    border-radius: 20px;
    overflow: hidden;
    transform: translateY(40px); // 数值越大越往下
    background: linear-gradient(
      155deg,
      rgba(246, 251, 255, 0.2),
      rgba(255, 255, 255, 0.1)
    );
    border: 1px solid rgba(165, 199, 242, 0.2);
    backdrop-filter: blur(1px);
    box-shadow:
      0 18px 42px rgba(5, 35, 73, 0.26),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);

    .panel-glow {
      position: absolute;
      border-radius: 50%;
      pointer-events: none;
    }

    .panel-glow-1 {
      width: 180px;
      height: 180px;
      right: -70px;
      top: -85px;
      background: radial-gradient(
        circle,
        rgba(62, 150, 255, 0.28),
        transparent 70%
      );
    }

    .panel-glow-2 {
      width: 140px;
      height: 140px;
      left: -60px;
      bottom: -68px;
      background: radial-gradient(
        circle,
        rgba(34, 113, 224, 0.18),
        transparent 72%
      );
    }

    .login-title {
      position: relative;
      z-index: 1;
      text-align: center;
      margin-bottom: 8px;
      font-size: 24px;
      font-weight: 700;
      color: #143b6f;
      letter-spacing: 1px;
    }

    .login-subtitle {
      position: relative;
      z-index: 1;
      text-align: center;
      margin-bottom: 20px;
      color: #4e6f98;
      font-size: 13px;
      letter-spacing: 0.4px;
    }

    .login-form {
      position: relative;
      z-index: 1;

      :deep(.el-form-item) {
        margin-bottom: 16px;
      }

      :deep(.el-input__wrapper) {
        min-height: 48px;
        border-radius: 12px;
        padding: 0 14px;
        background: rgba(255, 255, 255, 0.92);
        box-shadow:
          0 0 0 1px rgba(158, 188, 229, 0.9) inset,
          0 6px 14px rgba(20, 63, 125, 0.1);
        transition: all 0.2s ease;
      }

      :deep(.el-input__wrapper:hover) {
        box-shadow:
          0 0 0 1px rgba(93, 143, 212, 0.9) inset,
          0 8px 16px rgba(20, 63, 125, 0.14);
      }

      :deep(.el-input__wrapper.is-focus) {
        box-shadow:
          0 0 0 1.5px rgba(51, 118, 210, 0.95) inset,
          0 0 0 4px rgba(51, 118, 210, 0.16),
          0 10px 18px rgba(24, 94, 190, 0.18);
      }

      :deep(.el-input__inner) {
        height: 48px;
        font-size: 15px;
        color: #1d365a;
      }

      :deep(.el-input__prefix) {
        color: #4f709f;
        font-size: 16px;
      }

      .login-submit-item {
        margin-top: 22px;
        margin-bottom: 0;
      }

      .login-btn {
        width: 100%;
        min-height: 54px;
        border: none;
        border-radius: 12px;
        font-size: 16px;
        font-weight: 700;
        letter-spacing: 2px;
        /* 渐变：暗金过渡，贴合画面金色 */
        background: linear-gradient(120deg, #c8b288, #a99067);
        box-shadow: 0 4px 18px rgba(200, 178, 136, 0.32);
        font-size: 20px;
        font-weight: 500;
        color: #fff;
        letter-spacing: 1px;
        transition: all 0.24s ease;
      }

      .login-btn:hover,
      .login-btn:focus {
        filter: brightness(1.04);
        transform: translateY(-1px);
        box-shadow: 0 14px 28px rgba(23, 93, 173, 0.4);
      }
      /* hover悬浮效果 */
      .login-btn:hover {
        background: linear-gradient(135deg, #e0bc78 0%, #c9a25c 100%);
        box-shadow: 0 6px 20px rgba(212, 176, 108, 0.45);
      }
      /* 点击按压 */
      .login-btn:active {
        transform: scale(0.98);
        box-shadow: 0 2px 8px rgba(212, 176, 108, 0.25);
      }
    }
  }
}

@media (max-width: 480px) {
  .login-body {
    padding: 16px;

    .login-panel {
      width: calc(100vw - 32px);
      min-height: 180px;
      padding: 24px 18px 18px;
      border-radius: 18px;

      .login-title {
        font-size: 21px;
      }

      .login-subtitle {
        font-size: 12px;
        margin-bottom: 16px;
      }

      .login-form {
        :deep(.el-input__wrapper) {
          min-height: 44px;
        }

        :deep(.el-input__inner) {
          height: 44px;
          font-size: 14px;
        }

        .login-submit-item {
          margin-top: 18px;
        }

        .login-btn {
          min-height: 54px;
          font-size: 15px;
        }
      }
    }
  }
}
</style>
