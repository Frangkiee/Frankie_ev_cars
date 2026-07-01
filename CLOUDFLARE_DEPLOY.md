# Cloudflare Pages 部署指南

## 前置准备

1. **GitHub 账号** - 用于托管代码
2. **Cloudflare 账号** - 免费注册 https://dash.cloudflare.com/sign-up
3. **Supabase 项目** - 用于数据库（已有扣子数据库的需要新建）

---

## 第1步：创建 Supabase 数据库（如已有可跳过）

1. 打开 https://supabase.com → 点击 "Start your project"
2. 用 GitHub 登录
3. 点击 "New Project"
   - Name: `ev-cars-2026`
   - Database Password: 设置一个密码（**记下来**）
   - Region: 选择 `Northeast Asia (Tokyo)` 或 `Southeast Asia (Singapore)`（国内访问快）
4. 等待创建完成（约2分钟）
5. 进入项目 → 左侧 "SQL Editor"
6. 点击 "New Query"
7. 复制 `scripts/init-database.sql` 的全部内容，粘贴到 SQL Editor
8. 点击 "Run" 执行
9. 看到 "Success. No rows returned" 表示成功

### 获取数据库配置

1. 左侧 "Settings" → "API"
2. 复制以下两个值：
   - **Project URL**: 类似 `https://xxxxx.supabase.co`
   - **anon public key**: 一长串 `eyJhbGc...` 开头的字符串

---

## 第2步：推送代码到 GitHub

### 方法A：在扣子中操作（推荐）

1. 在 GitHub 创建新仓库：https://github.com/new
   - Repository name: `ev-cars-2026`
   - 设为 Public 或 Private 都可以
   - **不要**勾选 "Add README" 等选项
   - 点击 "Create repository"

2. 在扣子终端执行以下命令（替换 `你的用户名` 为你的 GitHub 用户名）：

```bash
cd /workspace/projects

# 初始化 git（如果还没有）
git init
git add .
git commit -m "Initial commit"

# 添加远程仓库（替换为你的 GitHub 用户名和仓库名）
git remote add origin https://github.com/你的用户名/ev-cars-2026.git

# 推送代码
git branch -M main
git push -u origin main
```

### 方法B：下载代码后上传

1. 在扣子中打包代码：
```bash
cd /workspace/projects
tar -czf ../ev-cars-2026.tar.gz .
```

2. 下载 `ev-cars-2026.tar.gz` 文件

3. 在本地解压，然后推送到 GitHub：
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/你的用户名/ev-cars-2026.git
git branch -M main
git push -u origin main
```

---

## 第3步：部署到 Cloudflare Pages

1. 打开 https://dash.cloudflare.com → 登录

2. 左侧菜单点击 "Workers & Pages"

3. 点击 "Create" → 选择 "Pages" 标签 → 点击 "Connect to Git"

4. 授权 Cloudflare 访问你的 GitHub

5. 选择 `ev-cars-2026` 仓库 → 点击 "Begin setup"

6. 配置构建设置：
   | 设置项 | 值 |
   |--------|-----|
   | Framework preset | `Next.js` |
   | Build command | `pnpm run build:cf` |
   | Build output directory | `.vercel/output/static` |
   | Node.js version | `20` |

7. 点击 "Environment variables" 下方的 "Add variable"，添加：

   | 变量名 | 值 |
   |--------|-----|
   | `SUPABASE_URL` | 第1步复制的 Project URL |
   | `SUPABASE_ANON_KEY` | 第1步复制的 anon public key |
   | `NODE_VERSION` | `20` |

8. 点击 "Save and Deploy"

9. 等待部署完成（约3-5分钟）

10. 部署成功后会显示：
    - 预览链接：`https://xxxxx.ev-cars-2026.pages.dev`
    - 生产链接：`https://ev-cars-2026.pages.dev`（如果设置了自定义域名）

---

## 第4步：验证网站

1. 打开部署成功后给的链接
2. 检查：
   - 页面是否正常加载
   - 数据表格是否显示57款车
   - 图表是否正常显示
   - 搜索功能是否正常

---

## 后续更新数据

当需要更新新车数据时：

1. 修改 `src/data/cars.ts` 文件
2. 提交并推送到 GitHub：
```bash
git add .
git commit -m "Update car data"
git push
```
3. Cloudflare Pages 会自动重新部署

---

## 常见问题

### Q: 部署后页面空白或报错？
A: 检查环境变量是否正确配置，特别是 `SUPABASE_URL` 和 `SUPABASE_ANON_KEY`

### Q: 国内访问慢？
A: Cloudflare 有全球 CDN，国内访问速度一般。如需加速，可以：
- 绑定自己的域名
- 开启 Cloudflare 的 "Optimized for Asia" 选项

### Q: 如何绑定自己的域名？
A: 
1. 在 Cloudflare Pages 项目 → "Custom domains" → "Set up a custom domain"
2. 输入你的域名
3. 按提示修改 DNS 记录

---

## 费用说明

Cloudflare Pages 免费套餐：
- 无限带宽
- 每月 500 次构建
- 1 个并发构建
- 完全够用！
