# 2026年纯电新车数据网站 - 独立部署指南

## 概述
本指南将帮助你把网站部署到 Vercel 或 Netlify，实现独立访问（无需打开扣子）。

## 前置条件
1. GitHub 账号（https://github.com）
2. Vercel 账号（https://vercel.com）或 Netlify 账号（https://netlify.com）
3. Supabase 账号（https://supabase.com）- 用于数据库

---

## 第一步：创建 Supabase 数据库

1. 访问 https://supabase.com 并注册/登录
2. 点击 "New Project" 创建新项目
   - 项目名称：`ev-cars-2026`（或任意名称）
   - 设置数据库密码（请妥善保管）
   - 选择区域（建议选离你近的）
3. 等待项目创建完成（约1-2分钟）
4. 进入项目后，点击左侧 "SQL Editor"
5. 复制 `scripts/init-database.sql` 文件内容，粘贴到 SQL Editor 并执行
6. 执行完成后，数据表和数据就创建好了

### 获取数据库连接信息
1. 点击左侧 "Project Settings" → "API"
2. 记录以下信息：
   - **Project URL**: 类似 `https://xxxxx.supabase.co`
   - **anon public key**: 公开的读取密钥
   - **service_role key**: 管理员密钥（用于写入数据，**不要暴露在前端**）

---

## 第二步：准备代码

### 方式一：直接下载（推荐）
1. 在扣子 IDE 中，点击左侧文件面板
2. 右键点击项目根目录 → "Download as ZIP"
3. 解压到本地

### 方式二：Git 导出
如果你有 Git 访问权限：
```bash
git clone <your-repo-url>
cd ev-cars-website
```

---

## 第三步：配置环境变量

1. 在项目根目录创建 `.env.local` 文件
2. 复制 `.env.example` 的内容，填入你的 Supabase 信息：

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

**注意**：
- `SUPABASE_ANON_KEY` 可以安全地暴露在前端
- `SUPABASE_SERVICE_ROLE_KEY` 只能在服务端使用，**绝对不要**放到前端代码中

---

## 第四步：部署到 Vercel（推荐）

### 4.1 推送代码到 GitHub
1. 在 GitHub 创建新仓库（如 `ev-cars-2026`）
2. 在本地项目目录执行：
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/ev-cars-2026.git
git push -u origin main
```

### 4.2 在 Vercel 部署
1. 访问 https://vercel.com 并登录（可用 GitHub 账号）
2. 点击 "Add New..." → "Project"
3. 选择你的 GitHub 仓库 `ev-cars-2026`
4. Vercel 会自动检测为 Next.js 项目
5. 在 "Environment Variables" 部分，添加以下变量：
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL`
6. 点击 "Deploy"
7. 等待部署完成（约2-3分钟）
8. 部署完成后，你会得到一个域名，如 `https://ev-cars-2026.vercel.app`

### 4.3 自定义域名（可选）
1. 在 Vercel 项目设置中，点击 "Domains"
2. 添加你的自定义域名
3. 按提示配置 DNS 记录

---

## 第五步：部署到 Netlify（备选）

### 5.1 推送代码到 GitHub
（同上）

### 5.2 在 Netlify 部署
1. 访问 https://netlify.com 并登录
2. 点击 "Add new site" → "Import an existing project"
3. 选择 GitHub，授权并选择你的仓库
4. 配置构建设置：
   - Build command: `pnpm run build`
   - Publish directory: `.next`
5. 在 "Environment variables" 部分添加环境变量
6. 点击 "Deploy site"

---

## 第六步：验证部署

1. 访问你的网站域名
2. 检查以下内容：
   - 页面正常加载
   - 数据表格显示57款车型
   - 图表正常显示
   - 搜索功能正常
   - 月份切换正常

---

## 常见问题

### Q: 页面加载但没有数据？
A: 检查环境变量是否正确配置，特别是 `SUPABASE_URL` 和 `SUPABASE_ANON_KEY`。

### Q: 图表不显示？
A: 检查浏览器控制台是否有错误，可能是 Recharts 库加载问题。

### Q: 如何更新数据？
A: 
1. 通过 Supabase 控制台直接编辑数据
2. 或者使用 API 接口（需要 service_role_key）：
```bash
curl -X POST https://your-domain.com/api/cars \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -d '{"year": 2026, "month": 7, "cars": [...]}'
```

### Q: 如何添加新月份的数据？
A: 使用上面的 API 接口，传入新的月份和车型数据。

---

## 技术栈

- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **UI**: Tailwind CSS 4 + shadcn/ui
- **Charts**: Recharts
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel / Netlify

---

## 项目结构

```
├── src/
│   ├── app/                    # Next.js 页面
│   │   ├── api/cars/          # 数据 API
│   │   ├── [year]/[month]/    # 月度页面
│   │   └── [year]/quarter/    # 季度页面
│   ├── components/            # React 组件
│   │   └── charts.tsx        # 图表组件
│   └── storage/database/      # Supabase 客户端
├── scripts/
│   └── init-database.sql     # 数据库初始化脚本
├── vercel.json               # Vercel 配置
└── .env.example              # 环境变量示例
```

---

## 支持

如有问题，请检查：
1. Supabase 项目是否正常运行
2. 环境变量是否正确配置
3. 浏览器控制台是否有错误

祝你部署成功！
