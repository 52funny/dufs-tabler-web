# dufs-tabler-web

一个面向 [dufs](https://github.com/sigoden/dufs) 的本地化 Web 界面。所有 HTML、CSS、JS 都在 `assets/` 目录内，Tabler 组件样式也已本地化，不依赖 CDN、远程字体或远程脚本。

## 界面预览

![文件列表界面](docs/screenshots/dufs-desktop.png)

![文件预览界面](docs/screenshots/dufs-preview.png)

## 使用

```bash
dufs /path/to/files -A --assets ./assets
```

Docker 方式：

```bash
docker build -t dufs-tabler-web .
docker run --rm -p 5000:5000 -v /path/to/files:/data dufs-tabler-web
```

Docker 构建时会先压缩 `assets/` 下的 HTML、CSS、JS，并把压缩结果打包进镜像的 `/assets`。本地源码目录 `assets/` 不会被覆盖；如需查看压缩产物，可以运行：

```bash
npm install
npm run build:assets
```

压缩结果会输出到 `dist/assets/`。

Docker 认证示例：

```bash
docker run --rm -p 5000:5000 -v /path/to/files:/data dufs-tabler-web \
  /data \
  --assets /assets \
  --allow-upload \
  --allow-delete \
  --allow-search \
  --allow-archive \
  -a admin:admin@/:rw \
  -b 0.0.0.0 \
  -p 5000
```

Docker Compose 方式：

```bash
docker compose up --build
```

默认访问 `http://127.0.0.1:5050`，挂载当前目录。可以通过环境变量指定目录和端口：

```bash
DUFS_DATA=/path/to/files DUFS_PORT=5000 docker compose up --build
```

Compose 认证模式：

```bash
DUFS_DATA=/path/to/files docker compose --profile auth up --build dufs-auth
```

认证模式默认访问 `http://127.0.0.1:5051`，账号密码为 `admin/admin`。

更细粒度的权限示例：

```bash
dufs /path/to/files \
  --assets ./assets \
  --allow-upload \
  --allow-delete \
  --allow-search \
  --allow-archive \
  -a admin:admin@/:rw
```

## 功能

- 文件管理：列表/网格双视图、目录优先的智能排序、选择与批量下载/删除。
- 文件上传：按钮上传、文件夹上传、拖拽上传、上传进度、失败后基于 dufs `PATCH` + `X-Update-Range: append` 的断点续传。
- 文件下载：文件流式下载、目录 `?zip` 打包下载、登录用户下载前自动获取 `?tokengen` Token。
- 预览编辑：文本/代码/JSON/Markdown/CSV 在线编辑与预览，图片、音频、视频、PDF 在线预览。
- 用户认证：适配 dufs `CHECKAUTH` / `LOGOUT`，并按 dufs 注入的权限显示可用操作。
- UI：无侧边栏布局，基于本地 `tabler.min.css` 的 Tabler 风格组件。

## 文件

- `assets/index.html`：dufs assets 入口，保留 `__INDEX_DATA__` 和 `__ASSETS_PREFIX__` 注入占位。
- `assets/tabler.min.css`：本地 Tabler 组件样式子集。
- `assets/index.css`：文件管理器业务样式。
- `assets/index.js`：dufs API 适配与界面交互。
- `assets/favicon.svg`：本地图标。
- `dist/assets/`：本地构建生成的压缩产物，不提交到仓库。
- `Dockerfile`：基于 `sigoden/dufs` 打包本地 UI 资源，默认服务 `/data`。
- `docker-compose.yml`：本地构建并运行 dufs，包含默认服务和认证 profile。
