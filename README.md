# 🦊 白狐影视 (White Fox TV)

一个功能强大、部署简便的开源影视项目。支持 Cloudflare Pages 和 Vercel 一键部署。

## ✨ 主要功能

- 📺 **全网采集**: 支持 AppleCMS 格式接口，内置 20+ 优质资源站。
- 🎬 **高清播放**: 支持 HLS/m3u8 播放，可手动调节分辨率（低至 **360P**）。
- 🔒 **访问保护**: 设有访问密码，确保隐私。
- ⚙️ **自定义接口**: 在设置面板中可自由管理 API 接口。
- ☁️ **数据同步**: 支持 Cloudflare D1 实现跨端同步（仅限 CF 部署）。
- 🚀 **多平台支持**: 完美适配 Cloudflare Pages 和 Vercel。

---

## 🚀 部署说明

### 方式一：Cloudflare Pages 部署

1. **Fork 本仓库**。
2. 在 Cloudflare Pages 中连接 Git 仓库。
3. 构建配置：
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. **关键变量配置**:
   - ┌──────────────────┐
     │ **DB**           │ -> D1 数据库绑定名称，必须设为 `DB` (用于同步)
     └──────────────────┘
   - ┌──────────────────┐
     │ **PASSWORD**     │ -> 访问密码，默认为 `whitefox`
     └──────────────────┘
5. 执行 `schema.sql` 初始化 D1 数据库。

### 方式二：Vercel 部署

1. **Fork 本仓库**。
2. 在 Vercel 中导入项目。
3. 配置环境变量 `PASSWORD`。
4. Vercel 会自动识别构建命令并完成部署。

---

## ⚠️ 注意事项

1. **SPA 路由**: 本项目已内置 `_redirects` (CF) 和 `vercel.json` (Vercel) 配置文件，确保刷新不丢失页面。
2. **跨域代理**: 内置代理服务解决 API 跨域问题。

## 🛠️ 开发环境

```bash
# 安装
npm install
# 构建
npm run build
```

## 📄 许可证

MIT License
