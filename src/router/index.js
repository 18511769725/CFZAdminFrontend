import { createRouter, createWebHistory } from "vue-router";
import { ElMessage } from "element-plus";
import { h } from "vue";
import store from "../store";
import { isMobile } from "../utils/device";

import HomeContainer from "../components/HomeContainer.vue";

const routes = [
  {
    path: "/",
    name: "首页",
    component: HomeContainer,
    children: [
      {
        path: "/projects",
        name: "项目管理",
        component: () => import("../components/pc/ProjectsView.vue"),
      },
      {
        path: "/tasks",
        name: "任务管理",
        component: () => import("../components/pc/TasksView.vue"),
      },
      {
        path: "/files",
        name: "文件管理",
        component: () => import("../components/pc/FileManagerView.vue"),
      },
      {
        path: "/games",
        name: "游戏审批",
        component: () => import("../components/pc/GamesView.vue"),
      },
      {
        path: "/policy",
        name: "产业政策",
        component: () => import("../components/pc/PolicyView.vue"),
      },
      {
        path: "/mgames",
        name: "移动端游戏",
        component: () => import("../components/mobile/MGamesView.vue"),
      },
      {
        path: "/mpolicy",
        name: "移动端政策",
        component: () => import("../components/mobile/MPolicyView.vue"),
      },
      {
        path: "/mtopc",
        name: "到PC端查看",
        component: () => import("../components/mobile/MUsePC.vue"),
      },
      {
        path: "/mlogin",
        name: "移动端登录",
        component: () => import("../components/mobile/MLoginView.vue"),
      },
      {
        path: "/users",
        name: "成员管理",
        component: () => import("../components/pc/UsersView.vue"),
      },
      {
        path: "/companies",
        name: "招商数据",
        component: () => import("../components/pc/CompaniesView.vue"),
      },
      {
        path: "/bcompanies",
        name: "商户管理",
        component: () => import("../components/pc/BCompaniesView.vue"),
      },
      {
        path: "/ccompanies",
        name: "重点企业管理",
        component: () => import("../components/pc/CCompaniesView.vue"),
      },
      {
        path: "/caccounts",
        name: "企业账户管理",
        component: () => import("../components/pc/CAccountsView.vue"),
      },
      {
        path: "/products",
        name: "商品管理",
        component: () => import("../components/pc/ProductsView.vue"),
      },
      {
        path: "/orders",
        name: "订单管理",
        component: () => import("../components/pc/OrdersView.vue"),
      },
      {
        path: "/fagainews",
        name: "最新动态管理",
        component: () => import("../components/pc/FagainewsView.vue"),
      },
      {
        path: "/creditmanager",
        name: "额度配置管理",
        component: () => import("../components/pc/CreditManagerView.vue"),
      },
      {
        path: "/biview",
        name: "数据驾驶舱",
        component: () => import("../components/pc/BIView.vue"),
      },
    ],
  },
  {
    path: "/login",
    name: "登录页",
    component: () => import("../components/pc/LoginView.vue"),
  },
  {
    path: "/mlogin",
    name: "移动端登录页",
    component: () => import("../components/mobile/MLoginView.vue"),
  },
  {
    path: "/submitaccount",
    name: "注册账号",
    component: () => import("../components/pc/SubmitAccount.vue"),
  },
  // 页面找不到404 路由
  {
    path: "/404",
    name: "NoPage 404",
    component: () => import("../views/404.vue"),
    hidden: true,
  },
  {
    path: "/:pathMatch(.*)",
    redirect: "/404",
    hidden: true,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 设置登录过期时间（一天）86400000
//let expire = 21600000;
let expire = 21600000;

//路由守卫
//全局守卫，登录拦截
//进行路由拦截：当没有登陆标识，直接打回登陆页面，如何避免退回到 登陆页呢？
router.beforeEach((to, from, next) => {
  let date = new Date().getTime();
  console.info("router.beforeEach", to.path);
  if (isMobile() && to.path !== "/mtopc") {
    next("/mtopc");
    return;
  }
  if (to.path === "/submitaccount") {
    console.log("submitaccount");
    next();
    return;
  }
  //从本地缓存中获取保存的 token 信息
  const tokenObj = JSON.parse(window.localStorage.getItem("isLogin"));
  const username = window.localStorage.getItem("username");
  const userid = window.localStorage.getItem("userid");
  const email = window.localStorage.getItem("email");
  const level = window.localStorage.getItem("level");
  if (to.path === "/login" || to.path === "/mlogin") {
    console.log("2");
    next();
  } else {
    //next();
    // 如果没有token，强制跳转到登录页面；如果有，则判断token时间是否过期
    if (!tokenObj || !tokenObj.token || !username || !userid) {
      //next();
      //next("/login");
      console.log("3");
      console.info("isMobile", isMobile());
      console.log("4");
      if (isMobile()) {
        console.log("5");
        console.info("mlogin", "mlogin");
        //next("/mlogin");
        next("/mtopc");
        console.log("6");
      } else {
        console.log("7");
        console.info("login", "login");
        next("/login");
        console.log("8");
      }
    } else {
      let date = new Date().getTime();
      //console.log(date);
      // 当前时间 - token中的登录时间 > 设置的过期时间，为过期；则清除token，并强制跳转至登录页
      // 反之为有效期，则放行
      if (date - tokenObj.startTime > expire) {
        window.localStorage.removeItem("isLogin");
        window.localStorage.removeItem("username");
        window.localStorage.removeItem("userid");
        window.localStorage.removeItem("email");
        window.localStorage.removeItem("level");
        console.log(window.innerWidth);
        console.log("9");
        if (isMobile()) {
          console.log("10");
          //next("/mlogin");
          next("/mtopc");
          console.log("11");
        } else {
          console.log("12");
          next("/login");
          console.log("13");
        }
        ElMessage({
          message: h("p", null, [
            h("span", null, "登录状态过期"),
            h("i", { style: "color: teal" }, "请重新登录！"),
          ]),
        });
      } else {
        console.log("1401");
        let objCurUserInfo = {
          username: username,
          userid: userid,
          email: email,
          level: level,
          avation: "",
        };
        console.log("1402");
        store.commit("userLogin", objCurUserInfo);
        console.log("1403");
        next();
        console.log("1404");
        console.log("14");
      }
    }
  }
});

export default router;
