# 创造1淋1

React + TypeScript 双端选秀养成音游。包含完整 0-6 周剧情、限次练习室、逐周解锁、双键太鼓判定、SRT/LRC 歌词时间轴、移动端触控与震动反馈。

## 启动

Windows 可直接双击 `启动游戏.bat`。不要双击根目录的 `index.html`，Vite 项目必须通过本地服务器运行。

```bash
pnpm install
pnpm dev
```

生产构建与测试：

```bash
pnpm test
pnpm build
```

## 操作

- PC：`F` = 红鼓 Don，`J` = 蓝鼓 Ka。
- 手机：触摸屏幕底部左/右鼓面。鼓面已设置 `touch-action: none`。
- 每次练习消耗一次机会，并为下一场正式演出累加 10% 得分系数。
- 游戏会自动保存到浏览器；标题页可导出 `.json` 存档，再在另一台手机或电脑导入。
- 场景界面可手动保存或返回主标题；演奏中可暂停、继续或保存后返回。

字幕解析入口位于 `src/utils/lyrics.ts`：

- `parseSRTToLyrics(srtText: string)`：支持 CapCut 的 `HH:MM:SS,mmm --> HH:MM:SS,mmm` 格式。
- `parseLRC(lrcText: string)`：支持标准 `[mm:ss.xx]` 与一行多时间戳。

两种格式都会统一输出毫秒级 `{ startMs, endMs, text }` 时间轴，再由同一谱面生成器处理。

## GitHub Pages

项目内置 `.github/workflows/deploy-pages.yml`。将仓库推送到 GitHub 后，在仓库的 **Settings → Pages → Build and deployment → Source** 中选择 **GitHub Actions**。此后推送到 `main` 或 `master` 会自动测试、构建并部署。

本项目对应账号 `yuriyg199506`，建议仓库名使用 `chuanzao101`：

```powershell
git init
git add .
git commit -m "发布创造1淋1"
git branch -M main
git remote add origin https://github.com/yuriyg199506/chuanzao101.git
git push -u origin main
```

部署成功后的公开地址为：`https://yuriyg199506.github.io/chuanzao101/`
