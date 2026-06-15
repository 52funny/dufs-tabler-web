"use strict";

/**
 * Dufs injects a base64 JSON payload into #index-data.
 * This UI keeps the same contract as the built-in assets.
 */

const MAX_PARALLEL_UPLOADS = 2;
const MAX_SUBPATHS_COUNT = 1000;
const TEXT_PREVIEW_EXTS = new Set([
  ".txt", ".log", ".md", ".markdown", ".json", ".yaml", ".yml", ".toml", ".xml",
  ".csv", ".tsv", ".html", ".css", ".js", ".ts", ".jsx", ".tsx", ".rs", ".go",
  ".py", ".java", ".c", ".cpp", ".h", ".hpp", ".sh", ".zsh", ".bash", ".ps1",
]);
const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".svg", ".ico"]);
const VIDEO_EXTS = new Set([".mp4", ".mov", ".avi", ".wmv", ".flv", ".webm", ".mkv"]);
const AUDIO_EXTS = new Set([".mp3", ".ogg", ".wav", ".m4a", ".flac", ".aac"]);
const PDF_EXTS = new Set([".pdf"]);
const OFFICE_EXTS = new Set([".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".odt", ".ods", ".odp", ".pages", ".numbers", ".key"]);
const ARCHIVE_EXTS = new Set([".zip", ".tar", ".gz", ".tgz", ".bz2", ".xz", ".7z", ".rar"]);
const SORT_LABELS = {
  smart: "智能排序",
  name: "名称",
  mtime: "修改时间",
  size: "大小",
  type: "类型",
};
const THEME_STORAGE_KEY = "dufs-theme";

const ICONS = {
  archive: paths("M21 8v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8", "M10 12h4", "M3 8l2.5-5h13L21 8Z"),
  "arrow-down": paths("M12 5v14", "m19 12-7 7-7-7"),
  "arrow-up": paths("M12 19V5", "m5 12 7-7 7 7"),
  "chevron-down": paths("m6 9 6 6 6-6"),
  check: paths("m20 6-11 11-5-5"),
  copy: paths("M8 8m0 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2z", "M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"),
  download: paths("M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", "M7 10l5 5 5-5", "M12 15V3"),
  edit: paths("M12 20h9", "M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"),
  "external-link": paths("M12 6H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6", "M11 13l9-9", "M15 4h5v5"),
  eye: paths("M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z", "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"),
  file: paths("M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z", "M14 2v6h6", "M8 13h8", "M8 17h5"),
  "file-plus": paths("M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z", "M14 2v6h6", "M12 18v-6", "M9 15h6"),
  folder: paths("M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7l-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z"),
  "folder-open": paths("M6 14l1.5-3h12.8a1 1 0 0 1 1 1.3l-1.7 5.7a2 2 0 0 1-1.9 1.4H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v2"),
  "folder-plus": paths("M12 10v6", "M9 13h6", "M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7l-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z"),
  "folder-up": paths("M12 12v6", "m9 15 3-3 3 3", "M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7l-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z"),
  grid: paths("M3 3h7v7H3Z", "M14 3h7v7h-7Z", "M14 14h7v7h-7Z", "M3 14h7v7H3Z"),
  image: paths("M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z", "m21 15-5-5L5 21", "M9 9.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"),
  list: paths("M8 6h13", "M8 12h13", "M8 18h13", "M3 6h.01", "M3 12h.01", "M3 18h.01"),
  login: paths("M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4", "M10 17l5-5-5-5", "M15 12H3"),
  logout: paths("M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4", "M16 17l5-5-5-5", "M21 12H9"),
  move: paths("M5 9V5a2 2 0 0 1 2-2h9l3 3v13a2 2 0 0 1-2 2h-4", "M9 18H3", "m6 15-3 3 3 3"),
  music: paths("M9 18V5l12-2v13", "M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z", "M21 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"),
  moon: paths("M12 3a6 6 0 0 0 9 7.7A9 9 0 1 1 12 3Z"),
  pause: paths("M10 4H6v16h4V4Z", "M18 4h-4v16h4V4Z"),
  play: paths("M5 3l14 9-14 9V3Z"),
  refresh: paths("M21 12a9 9 0 0 0-15.5-6.3L3 8", "M3 3v5h5", "M3 12a9 9 0 0 0 15.5 6.3L21 16", "M16 16h5v5"),
  save: paths("M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z", "M17 21v-8H7v8", "M7 3v5h8"),
  search: paths("M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z", "m21 21-5-5"),
  sort: paths("M3 7h18", "M6 12h12", "M10 17h4"),
  sun: paths("M12 4V2", "M12 22v-2", "m4.93 4.93-1.41-1.41", "m20.48 20.48-1.41-1.41", "M4 12H2", "M22 12h-2", "m4.93 19.07-1.41 1.41", "m20.48 3.52-1.41 1.41", "M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z"),
  trash: paths("M3 6h18", "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2", "M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6", "M10 11v6", "M14 11v6"),
  upload: paths("M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", "M17 8l-5-5-5 5", "M12 3v12"),
  "upload-cloud": paths("M16 16l-4-4-4 4", "M12 12v9", "M20 16.6A5 5 0 0 0 18 7h-1.3A8 8 0 1 0 4 15.3"),
  video: paths("M23 7l-7 5 7 5V7Z", "M3 5h13v14H3Z"),
  x: paths("M18 6 6 18", "m6 6 12 12"),
};

let DATA;
let PARAMS;
let state;
let collator;
let uploadManager;

document.addEventListener("DOMContentLoaded", () => {
  setupThemeToggle();
  renderStaticIcons();
  try {
    DATA = readDufsData();
  } catch (err) {
    showBootError(err);
    return;
  }

  PARAMS = Object.fromEntries(new URLSearchParams(location.search).entries());
  collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });
  state = {
    view: localStorage.getItem("dufs-view") || "list",
    sort: PARAMS.sort || localStorage.getItem("dufs-sort") || "smart",
    order: PARAMS.order || localStorage.getItem("dufs-order") || "asc",
    selected: new Set(),
    files: [],
    editorText: "",
    previewMode: "edit",
  };
  uploadManager = new UploadManager();

  const homeLink = document.querySelector("[data-home-link], .brand");
  if (homeLink) homeLink.href = DATA.uri_prefix || "/";
  addBreadcrumb(DATA.href, DATA.uri_prefix);
  setupTopActions();
  setupAuth();

  if (DATA.kind === "Index") {
    setupIndexPage();
  } else {
    setupEditorPage();
  }
});

window.addEventListener("beforeunload", (event) => {
  if (uploadManager && uploadManager.hasActiveUploads()) {
    event.preventDefault();
    event.returnValue = "";
  }
});

function setupIndexPage() {
  document.title = `Index of ${DATA.href} - Dufs`;
  document.querySelector(".toolbar.index-only").classList.remove("hidden");
  document.querySelector(".index-page").classList.remove("hidden");

  if (DATA.allow_search) setupSearch();
  if (DATA.allow_upload) setupUploadControls();
  if (DATA.allow_archive) {
    document.querySelector(".download-current").classList.remove("hidden");
    document.querySelector(".download-current").addEventListener("click", () => downloadUrl(baseUrl() + "?zip", "目录打包下载"));
  }
  if (DATA.allow_delete) document.querySelector(".batch-delete").classList.remove("hidden");

  document.querySelector(".batch-download").addEventListener("click", batchDownload);
  document.querySelector(".batch-delete").addEventListener("click", batchDelete);
  document.querySelector(".clear-selection").addEventListener("click", clearSelection);
  document.querySelector(".clear-completed").addEventListener("click", () => uploadManager.clearCompleted());
  document.querySelector(".select-all").addEventListener("change", toggleSelectAll);

  setupSortMenu();
  document.querySelector(".sort-order").addEventListener("click", () => {
    state.order = state.order === "asc" ? "desc" : "asc";
    localStorage.setItem("dufs-order", state.order);
    renderSortOrder();
    renderFiles();
  });
  document.querySelectorAll(".view-toggle").forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.view));
  });

  state.files = Array.isArray(DATA.paths) ? DATA.paths.slice() : [];
  renderSortOrder();
  setView(state.view);
  renderFiles();
}

function setupSortMenu() {
  const menu = document.querySelector("[data-sort-menu]");
  const button = menu?.querySelector(".sort-menu-button");
  const list = menu?.querySelector(".sort-menu-list");
  if (!menu || !button || !list) return;

  renderSortMenu(false);
  button.addEventListener("click", () => {
    renderSortMenu(list.classList.contains("hidden"));
  });
  list.querySelectorAll(".sort-menu-item").forEach((item) => {
    item.addEventListener("click", () => {
      state.sort = item.dataset.sortValue || "smart";
      localStorage.setItem("dufs-sort", state.sort);
      renderSortMenu(false);
      renderFiles();
    });
  });
  document.addEventListener("click", (event) => {
    if (!menu.contains(event.target)) renderSortMenu(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") renderSortMenu(false);
  });
  window.addEventListener("resize", () => renderSortMenu(false));
  window.addEventListener("scroll", () => renderSortMenu(false), true);
}

function renderSortMenu(open) {
  const button = document.querySelector(".sort-menu-button");
  const label = document.querySelector("[data-sort-label]");
  const list = document.querySelector(".sort-menu-list");
  if (!button || !label || !list) return;
  label.textContent = SORT_LABELS[state.sort] || SORT_LABELS.smart;
  button.setAttribute("aria-expanded", String(Boolean(open)));
  list.classList.toggle("hidden", !open);
  if (open) positionSortMenu(button, list);
  list.querySelectorAll(".sort-menu-item").forEach((item) => {
    const active = item.dataset.sortValue === state.sort;
    item.classList.toggle("active", active);
    item.setAttribute("aria-checked", String(active));
  });
}

function positionSortMenu(button, list) {
  const rect = button.getBoundingClientRect();
  const viewportWidth = document.documentElement.clientWidth;
  const width = Math.max(rect.width, 160);
  const left = Math.min(Math.max(rect.left, 8), Math.max(viewportWidth - width - 8, 8));
  list.style.width = `${width}px`;
  list.style.left = `${left}px`;
  list.style.top = `${rect.bottom + 6}px`;
}

function setupEditorPage() {
  document.title = `${DATA.kind === "Edit" ? "Edit" : "View"} ${DATA.href} - Dufs`;
  document.querySelector(".editor-page").classList.remove("hidden");

  const url = baseUrl();
  const fileName = baseName(url);
  const ext = extName(fileName);
  document.querySelector("[data-editor-title]").textContent = fileName || "文件预览";
  document.querySelector("[data-editor-meta]").textContent = DATA.kind === "Edit" ? "编辑模式" : "预览模式";
  document.querySelector("[data-editor-icon]").innerHTML = fileIconSvg(ext, false);
  document.querySelector(".download-file").addEventListener("click", () => downloadUrl(url, fileName));
  document.querySelector(".copy-file-link").addEventListener("click", async (event) => {
    try {
      await copyDirectLink(url);
      markCopied(event.currentTarget);
    } catch (err) {
      alert(`复制失败：${err.message}`);
    }
  });
  if (isMediaExt(ext)) {
    const openPlayerButton = document.querySelector(".open-player-file");
    openPlayerButton.classList.remove("hidden");
    setupExternalPlayerMenu(openPlayerButton, url, fileName);
  }

  if (DATA.kind === "Edit") {
    document.querySelector(".move-file").classList.remove("hidden");
    document.querySelector(".delete-file").classList.remove("hidden");
    document.querySelector(".move-file").addEventListener("click", async () => {
      const next = await doMovePath(url);
      if (next) location.href = next + location.search;
    });
    document.querySelector(".delete-file").addEventListener("click", async () => {
      await doDeletePath(fileName, url, () => {
        location.href = parentUrl(url);
      });
    });
  }

  renderEditorContent(url, fileName, ext);
}

async function renderEditorContent(url, fileName, ext) {
  const editor = document.querySelector(".editor");
  const previewPane = document.querySelector("[data-preview-pane]");
  const notEditable = document.querySelector(".not-editable");

  if (DATA.editable) {
    editor.classList.remove("hidden");
    document.querySelector(".preview-tabs").classList.remove("hidden");
    if (DATA.kind === "Edit") {
      document.querySelector(".save-btn").classList.remove("hidden");
      document.querySelector(".save-btn").addEventListener("click", saveChange);
    } else {
      editor.readOnly = true;
    }
    document.querySelectorAll(".preview-tab").forEach((tab) => {
      tab.addEventListener("click", () => setPreviewMode(tab.dataset.previewMode, ext));
    });

    try {
      const accessUrl = await withAccessToken(url);
      const res = await fetch(accessUrl);
      await assertResOK(res);
      const encoding = getEncoding(res.headers.get("content-type"));
      state.editorText = encoding === "utf-8"
        ? await res.text()
        : new TextDecoder(encoding).decode(await res.arrayBuffer());
      editor.value = ext === ".json" ? prettyJson(state.editorText) : state.editorText;
      editor.addEventListener("input", () => {
        state.editorText = editor.value;
        if (state.previewMode === "preview") renderTextPreview(previewPane, editor.value, ext);
      });
      renderTextPreview(previewPane, editor.value, ext);
    } catch (err) {
      notEditable.classList.remove("hidden");
      notEditable.textContent = `读取文件失败：${err.message}`;
    }
    return;
  }

  const accessUrl = await withAccessToken(url);
  previewPane.classList.remove("hidden");
  renderBinaryPreview(previewPane, accessUrl, fileName, ext, notEditable);
}

function setupSearch() {
  const searchbar = document.querySelector(".searchbar");
  const search = document.querySelector("#search");
  searchbar.classList.remove("hidden");
  search.value = PARAMS.q || "";
  searchbar.addEventListener("submit", (event) => {
    event.preventDefault();
    const q = search.value.trim();
    const target = q ? `${baseUrl()}?q=${encodeURIComponent(q)}` : baseUrl();
    location.href = target;
  });
}

function setupUploadControls() {
  document.querySelector(".upload-file").classList.remove("hidden");
  document.querySelector(".upload-folder").classList.remove("hidden");
  document.querySelector(".new-folder").classList.remove("hidden");
  document.querySelector(".new-file").classList.remove("hidden");

  document.querySelector(".upload-file").addEventListener("click", () => document.querySelector("#file").click());
  document.querySelector("#file").addEventListener("change", (event) => {
    uploadFiles(Array.from(event.target.files || []));
    event.target.value = "";
  });

  document.querySelector(".upload-folder").addEventListener("click", () => document.querySelector("#folder").click());
  document.querySelector("#folder").addEventListener("change", (event) => {
    uploadFiles(Array.from(event.target.files || []), true);
    event.target.value = "";
  });

  document.querySelector(".new-folder").addEventListener("click", () => {
    const name = prompt("输入文件夹名称");
    if (name) createFolder(name);
  });

  document.querySelector(".new-file").addEventListener("click", () => {
    const name = prompt("输入文件名称");
    if (name) createFile(name);
  });

  setupPageDropUpload();
}

function setupPageDropUpload() {
  ["drag", "dragstart", "dragend", "dragover", "dragenter", "dragleave", "drop"].forEach((name) => {
    document.addEventListener(name, (event) => {
      event.preventDefault();
      event.stopPropagation();
    });
  });

  document.addEventListener("drop", async (event) => {
    const items = Array.from(event.dataTransfer.items || []);
    if (items.length && items[0].webkitGetAsEntry) {
      const entries = items.map((item) => item.webkitGetAsEntry()).filter(Boolean);
      await addFileEntries(entries, []);
    } else {
      uploadFiles(Array.from(event.dataTransfer.files || []));
    }
  });
}

function uploadFiles(files, keepRelativePath = false) {
  files.filter((file) => file && file.size >= 0).forEach((file) => {
    const relative = keepRelativePath && file.webkitRelativePath ? file.webkitRelativePath : file.name;
    uploadManager.add(file, relative);
  });
}

async function addFileEntries(entries, dirs) {
  for (const entry of entries) {
    if (entry.isFile) {
      entry.file((file) => uploadManager.add(file, [...dirs, file.name].join("/")));
    } else if (entry.isDirectory) {
      const reader = entry.createReader();
      await readDirectoryEntries(reader, (children) => addFileEntries(children, [...dirs, entry.name]));
    }
  }
}

function readDirectoryEntries(reader, onChunk) {
  return new Promise((resolve) => {
    const read = () => {
      reader.readEntries(async (entries) => {
        if (!entries.length) {
          resolve();
          return;
        }
        await onChunk(entries);
        read();
      });
    };
    read();
  });
}

class UploadManager {
  constructor() {
    this.items = [];
    this.queue = [];
    this.running = 0;
    this.authed = false;
    this.list = document.querySelector("[data-upload-list]");
    this.panel = document.querySelector("[data-upload-panel]");
    this.count = document.querySelector("[data-upload-count]");
  }

  add(file, relativePath) {
    const item = new UploadItem(file, relativePath, this);
    this.items.push(item);
    this.queue.push(item);
    this.render();
    this.run();
  }

  async run() {
    if (this.running >= MAX_PARALLEL_UPLOADS || this.queue.length === 0) return;
    const item = this.queue.shift();
    if (item.status === "done") {
      this.run();
      return;
    }
    this.running += 1;
    item.status = "running";
    this.render();
    try {
      if (!this.authed) {
        await checkAuth();
        this.authed = true;
      }
      await item.start();
    } finally {
      this.running -= 1;
      this.render();
      this.run();
    }
  }

  retry(item) {
    if (item.status === "running") return;
    item.shouldResume = true;
    item.status = "queued";
    this.queue.push(item);
    this.render();
    this.run();
  }

  cancel(item) {
    item.cancel();
    this.queue = this.queue.filter((queued) => queued !== item);
    this.render();
  }

  clearCompleted() {
    this.items = this.items.filter((item) => item.status !== "done");
    this.render();
  }

  hasActiveUploads() {
    return this.items.some((item) => item.status === "running" || item.status === "queued");
  }

  render() {
    const active = this.items.filter((item) => item.status !== "done").length;
    this.count.textContent = String(active);
    this.count.classList.toggle("hidden", active === 0);
    this.panel.classList.toggle("hidden", this.items.length === 0);
    this.list.replaceChildren(...this.items.map((item) => item.render()));
  }
}

class UploadItem {
  constructor(file, relativePath, manager) {
    this.file = file;
    this.relativePath = normalizeRelativePath(relativePath);
    this.manager = manager;
    this.url = newUrl(this.relativePath);
    this.status = "queued";
    this.loaded = 0;
    this.offset = 0;
    this.shouldResume = false;
    this.speed = 0;
    this.error = "";
    this.xhr = null;
    this.lastLoaded = 0;
    this.lastTick = Date.now();
  }

  async start() {
    this.error = "";
    try {
      if (this.offset > 0 || this.shouldResume) {
        this.offset = await this.detectOffset();
        this.shouldResume = false;
      }
      if (this.offset >= this.file.size) {
        this.loaded = this.file.size;
        this.status = "done";
        return;
      }
      await this.send();
      this.status = "done";
      this.loaded = this.file.size;
    } catch (err) {
      if (this.status !== "canceled") {
        this.status = "failed";
        this.error = err.message || "上传失败";
      }
    }
  }

  async detectOffset() {
    const res = await fetch(this.url, { method: "HEAD" });
    if (res.status === 200) {
      return Math.min(parseInt(res.headers.get("content-length") || "0", 10), this.file.size);
    }
    return 0;
  }

  send() {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      this.xhr = xhr;
      const body = this.offset > 0 ? this.file.slice(this.offset) : this.file;
      xhr.upload.addEventListener("progress", (event) => {
        const now = Date.now();
        const elapsed = Math.max(now - this.lastTick, 1);
        this.loaded = this.offset + event.loaded;
        this.speed = ((this.loaded - this.lastLoaded) / elapsed) * 1000;
        if (elapsed > 250) {
          this.lastLoaded = this.loaded;
          this.lastTick = now;
          this.manager.render();
        }
      });
      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve();
        else reject(new Error(`${xhr.status} ${xhr.statusText}`));
      });
      xhr.addEventListener("error", () => reject(new Error("网络错误")));
      xhr.addEventListener("abort", () => reject(new Error("已取消")));
      if (this.offset > 0) {
        xhr.open("PATCH", this.url);
        xhr.setRequestHeader("X-Update-Range", "append");
      } else {
        xhr.open("PUT", this.url);
      }
      xhr.send(body);
    });
  }

  cancel() {
    this.status = "canceled";
    if (this.xhr) this.xhr.abort();
  }

  render() {
    const percent = this.file.size ? Math.min((this.loaded / this.file.size) * 100, 100) : 100;
    const row = el("div", { class: "upload-item" });
    const info = el("div");
    info.append(
      el("div", { class: "upload-name", title: this.relativePath }, this.relativePath),
      el("div", { class: "upload-meta" }, this.metaText(percent)),
      el("div", { class: "progress-track" }, el("div", { class: "progress-bar", style: `width: ${percent}%` }))
    );
    const actions = el("div", { class: "upload-actions" });
    if (this.status === "failed" || this.status === "canceled") {
      actions.append(iconButton("refresh", "继续断点续传", () => this.manager.retry(this)));
    }
    if (this.status === "running" || this.status === "queued") {
      actions.append(iconButton("x", "取消", () => this.manager.cancel(this)));
    }
    row.append(info, actions);
    return row;
  }

  metaText(percent) {
    const base = `${formatFileSize(this.loaded)} / ${formatFileSize(this.file.size)} · ${formatPercent(percent)}`;
    if (this.status === "failed") return `${base} · ${this.error || "失败"}，可继续上传`;
    if (this.status === "done") return `${base} · 已完成`;
    if (this.status === "queued") return `${base} · 等待中`;
    if (this.status === "canceled") return `${base} · 已取消`;
    return `${base} · ${formatFileSize(this.speed)}/s`;
  }
}

function renderFiles() {
  state.selected = new Set([...state.selected].filter((name) => state.files.some((file) => file.name === name)));
  const files = sortedFiles();
  document.querySelector("[data-file-list]").replaceChildren(...files.map(renderFileRow));
  document.querySelector("[data-file-grid]").replaceChildren(...files.map(renderFileCard));
  document.querySelector(".file-table").classList.toggle("hidden", files.length === 0);
  document.querySelector(".empty-state").classList.toggle("hidden", files.length !== 0);
  document.querySelector("[data-empty-title]").textContent = PARAMS.q ? "没有搜索结果" : DATA.dir_exists ? "空文件夹" : "上传时会自动创建文件夹";
  document.querySelector("[data-path-summary]").textContent = summarizeFiles(files);
  updateSelectionUI();
}

function renderFileRow(file) {
  const isDir = isDirectory(file);
  const url = fileUrl(file);
  const row = el("tr");
  row.append(
    el("td", { class: "select-cell" }, selectionInput(file)),
    el("td", { "data-label": "名称" }, el("div", { class: "file-name" }, iconNode(file), fileLink(file, url, isDir))),
    el("td", { "data-label": "类型" }, pathTypeLabel(file)),
    el("td", { "data-label": "修改时间" }, formatMtime(file.mtime)),
    el("td", { class: "number-cell", "data-label": "大小" }, isDir ? formatDirSize(file.size) : formatFileSize(file.size)),
    el("td", { class: "actions-cell", "data-label": "操作" }, fileActions(file))
  );
  return row;
}

function renderFileCard(file) {
  const isDir = isDirectory(file);
  const url = fileUrl(file);
  const card = el("article", { class: "file-card" });
  card.append(
    el("div", { class: "select-box" }, selectionInput(file)),
    el("div", { class: "file-card-icon icon-lg" }, iconNode(file, true)),
    el("div", { class: "file-card-name" }, fileLink(file, url, isDir)),
    el("div", { class: "file-card-meta" }, `${pathTypeLabel(file)} · ${isDir ? formatDirSize(file.size) : formatFileSize(file.size)}`),
    el("div", { class: "file-card-actions" }, fileActions(file, true))
  );
  return card;
}

function fileActions(file, compact = false) {
  const actions = el("div", { class: compact ? "file-card-actions" : "file-actions" });
  const isDir = isDirectory(file);
  const url = fileUrl(file);
  if (!isDir || DATA.allow_archive) {
    actions.append(iconButton("download", isDir ? "打包下载" : "流式下载", () => downloadUrl(isDir ? `${url}?zip` : url, file.name)));
  }
  if (!isDir) {
    actions.append(iconButton("copy", "复制直链", async (event) => {
      try {
        await copyDirectLink(url);
        markCopied(event.currentTarget);
      } catch (err) {
        alert(`复制失败：${err.message}`);
      }
    }));
    actions.append(iconButton("eye", "预览", () => openAccessUrl(url, { view: "" })));
  }
  if (DATA.allow_upload && DATA.allow_delete) {
    actions.append(iconButton("move", "移动或重命名", async () => {
      const next = await doMovePath(url);
      if (next) location.reload();
    }));
  }
  if (DATA.allow_upload && DATA.allow_delete && !isDir) {
    actions.append(iconButton("edit", "编辑", () => openAccessUrl(url, { edit: "" })));
  }
  if (DATA.allow_delete) {
    actions.append(iconButton("trash", "删除", () => deletePath(file), true));
  }
  return actions;
}

function selectionInput(file) {
  const input = el("input", { class: "form-check-input", type: "checkbox", "aria-label": `选择 ${file.name}` });
  input.checked = state.selected.has(file.name);
  input.addEventListener("change", () => {
    if (input.checked) state.selected.add(file.name);
    else state.selected.delete(file.name);
    updateSelectionUI();
    renderFiles();
  });
  return input;
}

function updateSelectionUI() {
  const count = state.selected.size;
  document.querySelector(".selection-bar").classList.toggle("hidden", count === 0);
  document.querySelector("[data-selected-count]").textContent = String(count);
  document.querySelector(".batch-download").disabled = count === 0;
  document.querySelector(".batch-delete").disabled = count === 0;
  const all = document.querySelector(".select-all");
  if (all) {
    all.checked = count > 0 && count === state.files.length;
    all.indeterminate = count > 0 && count < state.files.length;
  }
}

function toggleSelectAll(event) {
  state.selected = event.target.checked ? new Set(state.files.map((file) => file.name)) : new Set();
  renderFiles();
}

function clearSelection() {
  state.selected.clear();
  renderFiles();
}

async function batchDownload() {
  const files = selectedFiles();
  for (const file of files) {
    if (isDirectory(file) && !DATA.allow_archive) continue;
    const url = isDirectory(file) ? `${fileUrl(file)}?zip` : fileUrl(file);
    await downloadUrl(url, file.name);
  }
}

async function batchDelete() {
  const files = selectedFiles();
  if (!files.length) return;
  if (!confirm(`删除选中的 ${files.length} 项？`)) return;
  for (const file of files) {
    await doDeletePath(file.name, fileUrl(file), () => {
      state.files = state.files.filter((item) => item.name !== file.name);
      state.selected.delete(file.name);
    }, false);
  }
  renderFiles();
}

async function deletePath(file) {
  await doDeletePath(file.name, fileUrl(file), () => {
    state.files = state.files.filter((item) => item.name !== file.name);
    state.selected.delete(file.name);
    renderFiles();
  });
}

async function doDeletePath(name, url, callback, ask = true) {
  if (ask && !confirm(`删除「${name}」？`)) return;
  try {
    await checkAuth();
    const res = await fetch(url, { method: "DELETE" });
    await assertResOK(res);
    callback();
  } catch (err) {
    alert(`无法删除「${name}」：${err.message}`);
  }
}

async function doMovePath(fileUrlValue) {
  const fileUrlObj = new URL(fileUrlValue);
  const prefix = DATA.uri_prefix ? DATA.uri_prefix.replace(/\/$/, "") : "";
  const currentPath = decodeURIComponent(fileUrlObj.pathname.slice(prefix.length));
  let nextPath = prompt("输入新的路径", currentPath);
  if (!nextPath) return "";
  if (!nextPath.startsWith("/")) nextPath = `/${nextPath}`;
  if (nextPath === currentPath) return "";
  const nextUrl = fileUrlObj.origin + prefix + nextPath.split("/").map(encodeURIComponent).join("/");

  try {
    await checkAuth();
    const head = await fetch(nextUrl, { method: "HEAD" });
    if (head.status === 200 && !confirm("目标已存在，是否覆盖？")) return "";
    const res = await fetch(fileUrlValue, {
      method: "MOVE",
      headers: { Destination: nextUrl },
    });
    await assertResOK(res);
    return nextUrl;
  } catch (err) {
    alert(`移动失败：${err.message}`);
    return "";
  }
}

async function createFolder(name) {
  const url = newUrl(name);
  try {
    await checkAuth();
    const res = await fetch(url, { method: "MKCOL" });
    await assertResOK(res);
    location.href = withInheritedToken(`${url}/`);
  } catch (err) {
    alert(`无法创建文件夹：${err.message}`);
  }
}

async function createFile(name) {
  const url = newUrl(name);
  try {
    await checkAuth();
    const res = await fetch(url, { method: "PUT", body: "" });
    await assertResOK(res);
    location.href = withInheritedToken(urlWithParams(url, { edit: "" }));
  } catch (err) {
    alert(`无法创建文件：${err.message}`);
  }
}

async function saveChange() {
  try {
    await checkAuth();
    const res = await fetch(baseUrl(), {
      method: "PUT",
      body: document.querySelector(".editor").value,
    });
    await assertResOK(res);
    location.reload();
  } catch (err) {
    alert(`保存失败：${err.message}`);
  }
}

async function downloadUrl(url, name) {
  try {
    const finalUrl = await withAccessToken(url);
    const anchor = document.createElement("a");
    anchor.href = finalUrl;
    anchor.download = name || "";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  } catch (err) {
    alert(`下载失败：${err.message}`);
  }
}

async function copyDirectLink(url) {
  const finalUrl = await directAccessUrl(url);
  await copyText(finalUrl);
}

function setupExternalPlayerMenu(button, url, fileName) {
  const menu = el("div", { class: "player-menu-list hidden", role: "menu" });
  const items = [
    ["IINA 打开（macOS）", "play", () => openPlayerScheme(url, "iina")],
    ["VLC 协议打开", "play", () => openPlayerScheme(url, "vlc")],
    ["PotPlayer 打开（Windows）", "play", () => openPlayerScheme(url, "potplayer")],
    ["下载 M3U 播放列表", "download", () => downloadPlaylist(url, fileName)],
    ["复制 mpv 命令", "copy", () => copyPlayerCommand(url, "mpv")],
    ["复制 VLC 命令", "copy", () => copyPlayerCommand(url, "vlc")],
    ["复制直链", "copy", () => copyDirectLink(url)],
  ];
  items.forEach(([label, icon, handler]) => {
    const item = el("button", { class: "player-menu-item", type: "button", role: "menuitem" }, iconSvg(icon), el("span", {}, label));
    item.addEventListener("click", async () => {
      closePlayerMenu(button, menu);
      try {
        await handler();
        if (/复制/.test(label)) markMenuItemCopied(button);
      } catch (err) {
        alert(`${label}失败：${err.message}`);
      }
    });
    menu.append(item);
  });
  document.body.append(menu);

  button.addEventListener("click", (event) => {
    event.stopPropagation();
    const open = menu.classList.contains("hidden");
    renderPlayerMenu(button, menu, open);
  });
  document.addEventListener("click", (event) => {
    if (event.target !== button && !menu.contains(event.target)) closePlayerMenu(button, menu);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closePlayerMenu(button, menu);
  });
  window.addEventListener("resize", () => closePlayerMenu(button, menu));
  window.addEventListener("scroll", () => closePlayerMenu(button, menu), true);
}

function directFileUrl(url) {
  const targetUrl = new URL(url, location.href);
  targetUrl.searchParams.delete("view");
  targetUrl.searchParams.delete("edit");
  targetUrl.searchParams.delete("noscript");
  targetUrl.searchParams.delete("tokengen");
  return targetUrl.toString();
}

async function directAccessUrl(url) {
  return withAccessToken(directFileUrl(url));
}

function renderPlayerMenu(button, menu, open) {
  button.setAttribute("aria-expanded", String(Boolean(open)));
  menu.classList.toggle("hidden", !open);
  if (open) positionPlayerMenu(button, menu);
}

function closePlayerMenu(button, menu) {
  renderPlayerMenu(button, menu, false);
}

function positionPlayerMenu(button, menu) {
  const rect = button.getBoundingClientRect();
  const viewportWidth = document.documentElement.clientWidth;
  const width = Math.max(238, rect.width);
  const left = Math.min(Math.max(rect.right - width, 8), Math.max(viewportWidth - width - 8, 8));
  menu.style.width = `${width}px`;
  menu.style.left = `${left}px`;
  menu.style.top = `${rect.bottom + 6}px`;
}

async function openPlayerScheme(url, player) {
  const finalUrl = await directAccessUrl(url);
  const schemes = {
    iina: `iina://weblink?url=${encodeURIComponent(finalUrl)}`,
    vlc: `vlc://${finalUrl}`,
    potplayer: `potplayer://${finalUrl}`,
  };
  location.href = schemes[player];
}

async function copyPlayerCommand(url, player) {
  const finalUrl = await directAccessUrl(url);
  await copyText(`${player} ${quoteCommandArg(finalUrl)}`);
}

async function downloadPlaylist(url, fileName) {
  const finalUrl = await directAccessUrl(url);
  const content = `#EXTM3U\n#EXTINF:-1,${fileName || "media"}\n${finalUrl}\n`;
  const objectUrl = URL.createObjectURL(new Blob([content], { type: "audio/x-mpegurl" }));
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = `${safePlaylistName(fileName)}.m3u8`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}

function quoteCommandArg(value) {
  return `"${String(value).replace(/(["\\])/g, "\\$1")}"`;
}

function safePlaylistName(fileName) {
  return (fileName || "media").replace(/[\\/:*?"<>|]+/g, "_");
}

function markMenuItemCopied(button) {
  const title = button.title;
  button.title = "已复制";
  button.setAttribute("aria-label", "已复制");
  window.setTimeout(() => {
    button.title = title;
    button.setAttribute("aria-label", title);
  }, 1400);
}

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const input = document.createElement("textarea");
  input.value = text;
  input.setAttribute("readonly", "");
  input.style.position = "fixed";
  input.style.left = "-9999px";
  document.body.appendChild(input);
  input.select();
  const ok = document.execCommand("copy");
  input.remove();
  if (!ok) throw new Error("当前浏览器不允许写入剪贴板");
}

function markCopied(button) {
  if (!button) return;
  const title = button.title;
  button.title = "已复制";
  button.setAttribute("aria-label", "已复制");
  button.replaceChildren(iconSvg("check"));
  window.setTimeout(() => {
    button.title = title;
    button.setAttribute("aria-label", title);
    button.replaceChildren(iconSvg("copy"));
  }, 1400);
}

async function withDownloadToken(url) {
  return withAccessToken(url);
}

async function withAccessToken(url) {
  const targetUrl = new URL(url, location.href);
  if (targetUrl.searchParams.has("token")) return targetUrl.toString();
  const inheritedToken = currentAccessToken();
  if (inheritedToken) {
    targetUrl.searchParams.set("token", inheritedToken);
    return targetUrl.toString();
  }
  if (!DATA.user) return targetUrl.toString();
  const tokenUrl = new URL(targetUrl);
  tokenUrl.searchParams.set("tokengen", "");
  const res = await fetch(tokenUrl);
  await assertResOK(res);
  const token = await res.text();
  targetUrl.searchParams.set("token", token);
  return targetUrl.toString();
}

function withInheritedToken(url) {
  const token = currentAccessToken();
  if (!token) return new URL(url, location.href).toString();
  const targetUrl = new URL(url, location.href);
  if (!targetUrl.searchParams.has("token")) targetUrl.searchParams.set("token", token);
  return targetUrl.toString();
}

function currentAccessToken() {
  return new URLSearchParams(location.search).get("token") || "";
}

function urlWithParams(url, params) {
  const targetUrl = new URL(url, location.href);
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value == null || value === false) return;
    targetUrl.searchParams.set(key, value);
  });
  return targetUrl.toString();
}

async function openAccessUrl(url, params) {
  const popup = window.open("about:blank", "_blank");
  try {
    const finalUrl = await withAccessToken(urlWithParams(url, params));
    if (popup) popup.location.href = finalUrl;
    else location.href = finalUrl;
  } catch (err) {
    if (popup) popup.close();
    alert(`无法打开文件：${err.message}`);
  }
}

async function checkAuth(variant) {
  if (!DATA.auth) return;
  const qs = variant ? `?${variant}` : "";
  const res = await fetch(baseUrl() + qs, { method: "CHECKAUTH" });
  await assertResOK(res);
  const user = await res.text();
  DATA.user = user || DATA.user;
  setupAuth();
}

function setupAuth() {
  const loginBtn = document.querySelector(".login-btn");
  const logoutBtn = document.querySelector(".logout-btn");
  const userName = document.querySelector(".user-name");
  if (!DATA.auth) {
    loginBtn.classList.add("hidden");
    logoutBtn.classList.add("hidden");
    return;
  }
  if (DATA.user) {
    loginBtn.classList.add("hidden");
    logoutBtn.classList.remove("hidden");
    userName.textContent = DATA.user;
    logoutBtn.onclick = logout;
  } else {
    logoutBtn.classList.add("hidden");
    loginBtn.classList.remove("hidden");
    loginBtn.onclick = async () => {
      try {
        await checkAuth("login");
      } catch {
        /* Browser auth prompts are controlled by the server. */
      }
      location.reload();
    };
  }
}

function logout() {
  if (!DATA.auth) return;
  const xhr = new XMLHttpRequest();
  xhr.open("LOGOUT", baseUrl(), true, DATA.user);
  xhr.onload = () => {
    location.href = baseUrl();
  };
  xhr.send();
}

function setupTopActions() {
  const uploadQueueButton = document.querySelector(".upload-queue-button");
  if (uploadQueueButton) {
    uploadQueueButton.addEventListener("click", () => {
      document.querySelector("[data-upload-panel]")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
}

function addBreadcrumb(href, uriPrefix) {
  const breadcrumb = document.querySelector(".breadcrumb");
  breadcrumb.replaceChildren();
  const parts = href === "/" ? [""] : href.split("/");
  let path = uriPrefix || "/";
  parts.forEach((part, index) => {
    if (index > 0) {
      if (!path.endsWith("/")) path += "/";
      path += encodeURIComponent(part);
    }
    if (index === 0) {
      breadcrumb.append(el("a", { href: path || "/", title: "根目录" }, iconSvg("folder")));
    } else if (index === parts.length - 1) {
      breadcrumb.append(el("b", {}, part));
    } else {
      breadcrumb.append(el("a", { href: path }, part));
    }
    if (index !== parts.length - 1) breadcrumb.append(el("span", { class: "separator" }, "/"));
  });
}

function sortedFiles() {
  const dirFirst = (a, b) => Number(isDirectory(b)) - Number(isDirectory(a));
  const compareBy = {
    smart: (a, b) => dirFirst(a, b) || collator.compare(a.name, b.name),
    name: (a, b) => dirFirst(a, b) || collator.compare(a.name, b.name),
    mtime: (a, b) => dirFirst(a, b) || ((a.mtime || 0) - (b.mtime || 0)) || collator.compare(a.name, b.name),
    size: (a, b) => dirFirst(a, b) || ((a.size || 0) - (b.size || 0)) || collator.compare(a.name, b.name),
    type: (a, b) => dirFirst(a, b) || collator.compare(extName(a.name), extName(b.name)) || collator.compare(a.name, b.name),
  };
  const sorter = compareBy[state.sort] || compareBy.smart;
  const files = state.files.slice().sort(sorter);
  if (state.order === "desc") {
    const dirs = files.filter(isDirectory).reverse();
    const plain = files.filter((file) => !isDirectory(file)).reverse();
    return dirs.concat(plain);
  }
  return files;
}

function selectedFiles() {
  return state.files.filter((file) => state.selected.has(file.name));
}

function setView(view) {
  state.view = view === "grid" ? "grid" : "list";
  localStorage.setItem("dufs-view", state.view);
  document.querySelectorAll(".view-toggle").forEach((button) => {
    const active = button.dataset.view === state.view;
    button.classList.toggle("is-active", active);
    button.classList.toggle("active", active);
  });
  document.querySelectorAll("[data-view-panel]").forEach((panel) => {
    panel.classList.toggle("hidden", panel.dataset.viewPanel !== state.view);
  });
}

function setPreviewMode(mode, ext) {
  state.previewMode = mode;
  document.querySelectorAll(".preview-tab").forEach((tab) => {
    const active = tab.dataset.previewMode === mode;
    tab.classList.toggle("is-active", active);
    tab.classList.toggle("active", active);
  });
  const editor = document.querySelector(".editor");
  const previewPane = document.querySelector("[data-preview-pane]");
  editor.classList.toggle("hidden", mode !== "edit");
  previewPane.classList.toggle("hidden", mode !== "preview");
  if (mode === "preview") renderTextPreview(previewPane, editor.value, ext);
}

function renderSortOrder() {
  const icon = state.order === "asc" ? "arrow-up" : "arrow-down";
  document.querySelector(".sort-order").replaceChildren(iconSvg(icon));
}

function setupThemeToggle() {
  applyStoredTheme();
  renderThemeToggle();
  document.querySelector(".theme-toggle")?.addEventListener("click", () => {
    const next = resolvedTheme() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* Theme still applies for the current page. */
    }
    renderThemeToggle();
  });
  const themeMedia = window.matchMedia?.("(prefers-color-scheme: dark)");
  themeMedia?.addEventListener?.("change", () => {
    if (!storedTheme()) renderThemeToggle();
  });
}

function applyStoredTheme() {
  const theme = storedTheme();
  if (theme) document.documentElement.dataset.theme = theme;
}

function storedTheme() {
  try {
    const theme = localStorage.getItem(THEME_STORAGE_KEY);
    return theme === "light" || theme === "dark" ? theme : "";
  } catch {
    return "";
  }
}

function resolvedTheme() {
  const theme = document.documentElement.dataset.theme || storedTheme();
  if (theme === "light" || theme === "dark") return theme;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function renderThemeToggle() {
  const button = document.querySelector(".theme-toggle");
  const iconSlot = button?.querySelector("[data-theme-icon]");
  if (!button || !iconSlot) return;
  const current = resolvedTheme();
  const nextLabel = current === "dark" ? "切换白天模式" : "切换夜间模式";
  button.title = nextLabel;
  button.setAttribute("aria-label", nextLabel);
  iconSlot.replaceChildren(iconSvg(current === "dark" ? "sun" : "moon"));
}

function renderTextPreview(container, text, ext) {
  container.replaceChildren();
  if (ext === ".md" || ext === ".markdown") {
    container.innerHTML = markdownToHtml(text);
  } else if (ext === ".json") {
    container.append(el("pre", {}, prettyJson(text)));
  } else if (ext === ".csv" || ext === ".tsv") {
    container.append(csvTable(text, ext === ".tsv" ? "\t" : ","));
  } else {
    container.append(el("pre", {}, text));
  }
}

function renderBinaryPreview(container, url, fileName, ext, notEditable) {
  container.replaceChildren();
  container.classList.remove("hidden", "preview-empty");
  notEditable.classList.add("hidden");
  if (IMAGE_EXTS.has(ext)) {
    container.append(el("img", { src: url, alt: fileName }));
  } else if (VIDEO_EXTS.has(ext)) {
    container.append(el("video", { src: url, controls: "", preload: "metadata" }));
  } else if (AUDIO_EXTS.has(ext)) {
    container.append(el("audio", { src: url, controls: "", preload: "metadata" }));
  } else if (PDF_EXTS.has(ext)) {
    renderPdfPreview(container, url, fileName);
  } else if (TEXT_PREVIEW_EXTS.has(ext)) {
    container.append(el("iframe", { src: url, title: fileName }));
  } else {
    container.classList.add("preview-empty");
    const kind = OFFICE_EXTS.has(ext)
      ? "当前浏览器不能直接预览 Office 文档。"
      : ARCHIVE_EXTS.has(ext)
        ? "压缩包不能直接在线预览。"
        : "此文件类型暂不支持在线预览。";
    container.append(previewFallback(url, fileName, kind));
  }
}

function renderPdfPreview(container, url, fileName) {
  const viewerUrl = withPdfFragment(url);
  const object = el("object", {
    class: "pdf-viewer",
    data: viewerUrl,
    type: "application/pdf",
    title: fileName,
  });
  object.append(el("iframe", { src: viewerUrl, title: fileName }));
  container.append(object);
  container.append(previewFallback(url, fileName, "如果 PDF 仍然空白，说明当前浏览器不支持内嵌 PDF。"));
}

function previewFallback(url, fileName, message) {
  return el("div", { class: "preview-fallback" },
    el("p", {}, message),
    el("div", { class: "preview-actions" },
      actionLink("external-link", "新窗口打开", url),
      actionLink("download", "下载文件", url, fileName)
    )
  );
}

function actionLink(icon, text, href, downloadName = "") {
  const link = el("a", {
    class: icon === "download" ? "btn btn-primary primary-button" : "btn btn-outline-secondary",
    href,
    target: "_blank",
    rel: "noopener",
  });
  if (downloadName) link.setAttribute("download", downloadName);
  link.append(iconSvg(icon), el("span", {}, text));
  return link;
}

function withPdfFragment(url) {
  const clean = String(url || "").split("#")[0];
  return `${clean}#toolbar=1&navpanes=0&view=FitH`;
}

function fileLink(file, url, isDir) {
  const accessHref = isDir
    ? withInheritedToken(`${url}/`)
    : withInheritedToken(urlWithParams(url, { view: "" }));
  const link = el("a", { href: accessHref, title: file.name }, file.name);
  if (!isDir) {
    link.target = "_blank";
    link.addEventListener("click", (event) => {
      if (!DATA.user || currentAccessToken() || new URL(link.href, location.href).searchParams.has("token")) return;
      event.preventDefault();
      openAccessUrl(url, { view: "" });
    });
  }
  return link;
}

function iconNode(file, large = false) {
  const wrap = el("span", { class: large ? "icon-lg" : "" });
  wrap.innerHTML = fileIconSvg(extName(file.name), isDirectory(file));
  return wrap;
}

function fileIconSvg(ext, isDir) {
  if (isDir) return ICONS.folder;
  if (IMAGE_EXTS.has(ext)) return ICONS.image;
  if (VIDEO_EXTS.has(ext)) return ICONS.video;
  if (AUDIO_EXTS.has(ext)) return ICONS.music;
  return ICONS.file;
}

function isMediaExt(ext) {
  return VIDEO_EXTS.has(ext) || AUDIO_EXTS.has(ext);
}

function iconButton(icon, title, handler, danger = false) {
  const button = el("button", {
    class: danger
      ? "btn btn-icon btn-outline-danger danger-button"
      : "btn btn-icon btn-outline-secondary tool-button",
    type: "button",
    title,
    "aria-label": title,
  });
  button.append(iconSvg(icon));
  button.addEventListener("click", handler);
  return button;
}

function renderStaticIcons() {
  document.querySelectorAll("[data-icon]").forEach((node) => {
    const icon = node.dataset.icon;
    node.innerHTML = ICONS[icon] || "";
  });
}

function iconSvg(icon) {
  const span = el("span");
  span.innerHTML = ICONS[icon] || "";
  return span.firstElementChild || span;
}

function paths(...values) {
  return `<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${values.map((d) => `<path d="${d}"/>`).join("")}</svg>`;
}

function pathTypeLabel(file) {
  if (file.path_type === "SymlinkDir") return "链接文件夹";
  if (file.path_type === "SymlinkFile") return "链接文件";
  if (isDirectory(file)) return "文件夹";
  return extName(file.name).replace(".", "").toUpperCase() || "文件";
}

function isDirectory(file) {
  return file.path_type === "Dir" || file.path_type === "SymlinkDir";
}

function fileUrl(file) {
  return newUrl(file.name);
}

function newUrl(name) {
  let url = baseUrl();
  if (!url.endsWith("/")) url += "/";
  return url + normalizeRelativePath(name).split("/").map(encodeURIComponent).join("/");
}

function baseUrl() {
  return location.href.split(/[?#]/)[0];
}

function parentUrl(url) {
  return url.split("/").slice(0, -1).join("/") || "/";
}

function baseName(url) {
  const clean = url.split(/[?#]/)[0].replace(/\/$/, "");
  return decodeURIComponent(clean.split("/").filter(Boolean).pop() || "");
}

function extName(filename) {
  const index = filename.lastIndexOf(".");
  if (index <= 0 || index === filename.length - 1) return "";
  return filename.slice(index).toLowerCase();
}

function normalizeRelativePath(path) {
  return String(path || "").replace(/^\/+/, "").split("/").filter(Boolean).join("/");
}

function summarizeFiles(files) {
  const dirs = files.filter(isDirectory).length;
  const plain = files.length - dirs;
  return `${files.length} 项 · ${dirs} 个文件夹 · ${plain} 个文件`;
}

function formatMtime(mtime) {
  if (!mtime) return "-";
  const date = new Date(mtime);
  if (Number.isNaN(date.getTime())) return "-";
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function formatDirSize(size) {
  const unit = size === 1 ? "项" : "项";
  const count = size >= MAX_SUBPATHS_COUNT ? `>${MAX_SUBPATHS_COUNT - 1}` : `${size || 0}`;
  return `${count} ${unit}`;
}

function formatFileSize(size) {
  if (!Number.isFinite(size) || size <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(Math.floor(Math.log(size) / Math.log(1024)), units.length - 1);
  const value = size / Math.pow(1024, index);
  return `${index === 0 ? Math.round(value) : Math.round(value * 10) / 10} ${units[index]}`;
}

function formatPercent(percent) {
  return `${Math.min(Math.max(percent, 0), 100).toFixed(percent < 10 ? 2 : 1)}%`;
}

function prettyJson(text) {
  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    return text;
  }
}

function markdownToHtml(text) {
  const escaped = escapeHtml(text);
  return escaped
    .replace(/^### (.*)$/gm, "<h3>$1</h3>")
    .replace(/^## (.*)$/gm, "<h2>$1</h2>")
    .replace(/^# (.*)$/gm, "<h1>$1</h1>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\n{2,}/g, "</p><p>")
    .replace(/\n/g, "<br>")
    .replace(/^/, "<p>")
    .replace(/$/, "</p>");
}

function csvTable(text, delimiter) {
  const rows = text.trim().split(/\r?\n/).slice(0, 200).map((line) => line.split(delimiter));
  if (!rows.length) return el("pre", {}, text);
  const table = el("table");
  rows.forEach((row, index) => {
    const tr = el("tr");
    row.forEach((cell) => tr.append(el(index === 0 ? "th" : "td", {}, cell)));
    table.append(tr);
  });
  return table;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getEncoding(contentType) {
  const charset = contentType?.split(";").find((part) => /charset/i.test(part));
  return charset?.split("=")[1]?.trim().toLowerCase() || "utf-8";
}

async function assertResOK(res) {
  if (!(res.status >= 200 && res.status < 300)) {
    throw new Error(await res.text() || `HTTP ${res.status}`);
  }
}

function readDufsData() {
  const template = document.querySelector("#index-data");
  if (!template) throw new Error("缺少 dufs 注入数据节点");
  const raw = template.innerHTML.trim();
  if (!raw || raw === "__INDEX_DATA__") {
    throw new Error("当前页面需要由 dufs 提供服务并注入 __INDEX_DATA__。请使用 dufs --assets ./assets 启动。");
  }
  return JSON.parse(decodeBase64(raw));
}

function decodeBase64(base64String) {
  const binString = atob(base64String);
  const len = binString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i += 1) bytes[i] = binString.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

function showBootError(err) {
  document.body.replaceChildren(
    el("main", {
      style: "max-width:720px;margin:80px auto;padding:24px;border:1px solid #d8dee7;border-radius:8px;font-family:system-ui",
    },
      el("h1", {}, "Dufs Web"),
      el("p", {}, err.message),
      el("pre", {}, "dufs /path/to/files -A --assets ./assets")
    )
  );
}

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  Object.entries(attrs || {}).forEach(([key, value]) => {
    if (value === false || value == null) return;
    if (key === "class") node.className = value;
    else if (key === "style") node.setAttribute("style", value);
    else node.setAttribute(key, value === true ? "" : String(value));
  });
  children.flat().forEach((child) => {
    if (child == null) return;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  });
  return node;
}
