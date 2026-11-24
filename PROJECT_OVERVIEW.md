# 项目梳理

## 项目简介

本项目是基于 Vue 3 和 Vite 的企业服务平台前端，包含 PC 管理后台和移动端页面。业务页面通过 Vue Router 按需加载，平台使用 Element Plus、Vant、ECharts 等组件库和可视化工具。

## 技术栈

| 类别 | 技术 |
| --- | --- |
| 前端框架 | Vue 3、`<script setup>` |
| 构建与开发服务 | Vite 6 |
| 路由 | Vue Router 4（HTML5 History） |
| 全局状态 | Vuex 4 |
| PC 组件库 | Element Plus |
| 移动端组件库 | Vant |
| 图表 | ECharts |
| HTTP | Axios |
| 样式 | CSS、SCSS（通过 Sass） |

## 目录结构

```text
src/
├── App.vue                    # 根组件，渲染 RouterView
├── main.js                    # 注册 Vue 插件、组件库和全局图标
├── login.vue                  # 独立登录相关页面文件
├── router/
│   └── index.js               # 页面路由、设备适配和登录守卫
├── store/
│   └── index.js               # Vuex 用户信息、用户列表和上传地址
├── utils/
│   ├── device.js               # 移动设备识别
│   ├── index.js                # 日期、时间戳等通用函数
│   └── request.js              # Axios 实例、拦截器和下载辅助方法
├── components/
│   ├── HomeContainer.vue       # PC / 移动端主容器选择
│   ├── pc/                     # PC 后台、业务和数据分析页面
│   └── mobile/                 # 移动端页面
├── assets/                     # 图片等静态资源
├── style.css                   # 全局样式
└── views/
    └── 404.vue                 # 404 页面
```

## 应用启动与页面渲染

1. `src/main.js` 创建 Vue 应用，注册 Element Plus、Vue Router、Vuex、Vant、Axios 和 Element Plus 图标。
2. `src/App.vue` 渲染路由视图。
3. `/` 路由使用 `HomeContainer.vue`，根据窗口宽度切换 PC 首页 `pc/Home.vue` 或移动端首页 `mobile/MHome.vue`。
4. 业务页面由 `src/router/index.js` 配置为懒加载组件。PC 侧导航菜单定义在 `pc/Home.vue`，内容页面通过嵌套路由显示。

## 主要业务模块

| 模块 | 页面示例 | 功能范围 |
| --- | --- | --- |
| 用户与组织 | `UsersView.vue`、`BUsersView.vue` | 平台成员和商户端用户管理 |
| 商户与企业 | `BCompaniesView.vue`、`CCompaniesView.vue`、`CAccountsView.vue`、`CompaniesView.vue` | 商户、重点企业、企业账户和招商数据 |
| 商品与订单 | `ProductsView.vue`、`OrdersView.vue`、`OfflineOrderAdminView.vue` | 商品、线上及线下订单管理 |
| 账务与额度 | `BillingCenterView.vue`、`CreditManagerView.vue`、`AnjuCreditConfigView.vue`、`ClearCategoryConfig.vue` | 账务查询和额度、权益配置 |
| 数据分析 | `BIView.vue`、`BIDepartView.vue`、`BIOrdersView.vue` | 数据驾驶舱、重点企业服务及订单分析 |
| 内容与宣传 | `FagainewsView.vue`、`MediaPublicView.vue` | 动态内容和宣传发布 |
| 热线配置 | `HotlineConfigView.vue` | 热线信息维护 |
| 移动端 | `MGamesView.vue`、`MPolicyView.vue`、`MBIView.vue`、`MLoginView.vue` | 移动端游戏、政策、数据和登录页面 |
| 其他 | `ProjectsView.vue`、`TasksView.vue`、`FileManagerView.vue`、`GamesView.vue`、`PolicyView.vue` | 项目、任务、文件、游戏审批及政策页面 |

路由表中还保留了一些历史页面或独立页面（如 `/projects`、`/tasks`、`/files`、`/games`、`/policy` 和 `/submitaccount`）；页面是否出现在主导航中由各页面和用户权限逻辑决定。

## 路由与登录状态

- PC / 移动端的部分登录、游戏、政策和数据驾驶舱路由会在路由守卫中映射到对应设备的页面。
- 登录信息保存在浏览器 `localStorage`，涉及 `isLogin`、`username`、`userid`、`email`、`level` 和 `department` 等键。
- 路由守卫检查登录状态，并依据登录记录的时间戳判断会话是否过期；源码中当前过期时长为 `21,600,000` 毫秒（6 小时）。
- Vuex 保存当前用户信息、用户列表、部门选项及文件上传相关地址。

## 网络请求

`src/utils/request.js` 创建统一 Axios 实例，设置 API 基础地址、请求超时和请求 / 响应拦截器。业务页面通常从该模块导入 `request` 发起请求；下载辅助函数也在此模块中。

调整后端地址、请求头或部署环境配置时，请先检查 `src/utils/request.js` 和 `src/store/index.js` 中的配置，避免只改动单个页面导致接口行为不一致。

## 本地开发与构建

需要先安装项目依赖，然后执行：

```bash
npm run dev       # 启动 Vite 开发服务
npm run build     # 生成生产构建
npm run preview   # 本地预览生产构建
```

当前 `package.json` 提供以上三个脚本，未定义独立的 lint 或测试脚本。

## 维护注意事项

- 移动端判定存在两个入口：`HomeContainer.vue` 根据 `window.innerWidth <= 768` 选择首页；`utils/device.js` 还结合 User-Agent、小屏宽度和粗指针判断路由映射。修改断点或设备适配逻辑时应一起核对。
- 路由使用 `createWebHistory()`。部署到 Web 服务器时，需要配置未知路径回退到应用入口，否则刷新深层路由可能返回服务器 404。
- `src/components/pc/` 和 `src/components/mobile/` 中包含命名相近或带 `copy`、`Bak` 的文件。修改页面前应先从路由配置确认实际引用的组件，避免误改未被路由使用的副本。
- 页面中涉及的接口协议和业务规则由后端共同决定；新增或调整业务操作时，需同步确认对应接口、权限和错误反馈。
