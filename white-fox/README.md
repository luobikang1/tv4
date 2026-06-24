# 白狐影视 (White Fox TV)

一个基于 React + Vite + Cloudflare Pages 部署的轻量级影视面板，功能与月亮TV基本一致。

## 主要功能

- 📺 **全网采集**: 支持 AppleCMS 格式 JSON 接口，预设 20+ 高质量资源站。
- 🎬 **高清播放**: 集成高性能播放器，支持 HLS (m3u8)，支持调节分辨率至 **360P**。
- 🔒 **访问控制**: 设有访问密码，确保私密性。
- ⚙️ **灵活配置**: 支持在设置中自定义添加、编辑 API 接口。
- ☁️ **云端同步**: 结合 Cloudflare D1 数据库实现数据同步。
- 🚀 **极速部署**: 完美适配 Cloudflare Pages 部署。

## 快速部署 (Cloudflare Pages)

1. **Fork 本项目** 到您的 GitHub 账号。
2. **连接 Cloudflare Pages**:
   - 在 Cloudflare 控制台选择 `Pages` -> `Connect to Git`。
   - 选择 `white-fox` 仓库。
3. **配置构建设置**:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. **添加环境变量 (可选)**:
   - 在 `Settings` -> `Functions` -> `Environment variables` 中添加。
5. **绑定 D1 数据库**:
   - 在 `Settings` -> `Functions` -> `D1 database bindings` 中绑定 `DB` 到您的 D1 实例。
6. **初始化数据库**:
   - 使用本项目根目录下的 `schema.sql` 初始化您的 D1 数据库。

## 注意事项

- **API 代理**: 本项目内置了 Cloudflare Functions 代理以解决跨域 (CORS) 问题。
- **关键变量**:
  - ┌──────────────────┐
    │ **DB**           │ -> D1 数据库绑定名称，必须设为 `DB`。
    └──────────────────┘
  - ┌──────────────────┐
    │ **PASSWORD**     │ -> (可选) 后台预设访问密码。
    └──────────────────┘

## 开发者说明

```bash
# 安装依赖
npm install

# 本地开发
# npm run dev

# 构建项目
npm run build
```

## 许可

MIT License
