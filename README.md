# 🦊 白狐影视 (White Fox TV) - 极简部署版

一个功能强大、部署简便的影视项目。支持 **Cloudflare Pages** 和 **Vercel** 部署。

---

## 🔑 关键环境变量 (环境变量)

部署时请在平台后台设置中添加以下变量：

+-----------------------------------------------------------+
| **PASSWORD**                                              |
| - 说明：访问面板的授权密码                                |
| - 默认：如果不设置，默认密码为 `whitefox`                 |
+-----------------------------------------------------------+

---

## 🚀 部署说明 (必看，防止失败)

### 1. Cloudflare Pages 部署 (推荐)
- **步骤**: GitHub Fork 本项目 -> CF Pages 绑定仓库。
- **构建设置**:
  - 构建命令: `npm run build`
  - 输出目录: `dist`
- **!!! 解决部署失败 (D1 错误) !!!**:
  - 本项目的 `wrangler.toml` 默认禁用了 D1 绑定以确保首次部署成功。
  - **部署成功后**，请在 Cloudflare Pages 控制台：
    `设置` -> `函数` -> `D1 数据库绑定` -> 点击 `添加绑定`。
    - **变量名称**: 填 `DB`
    - **D1 数据库**: 选择你创建好的数据库。
  - 绑定后重新部署一次即可。

### 2. Vercel 部署
- **步骤**: GitHub Fork 本项目 -> Vercel 导入仓库。
- **环境变量**: 添加 `PASSWORD`。

---

## ❓ 常见部署失败原因分析

1. **Error 8000022: Invalid database UUID**:
   - *原因*: `wrangler.toml` 中填写的 `database_id` 是无效的占位符。
   - *解决*: 已在本项目中注释掉该部分。请通过 Cloudflare 控制台手动进行 D1 绑定。
2. **Infinite loop detected in _redirects**:
   - *原因*: SPA 路由重定向配置格式不当。
   - *解决*: 已修正 `_redirects` 文件格式。
3. **404 错误 (刷新页面后)**:
   - *原因*: 静态托管平台不知道如何处理前端路由。
   - *解决*: 确保 `_redirects` 或 `vercel.json` 存在于发布目录。

---

## 🛠️ 开发与构建
```bash
npm install
npm run build
```

## 📄 许可证
MIT License
