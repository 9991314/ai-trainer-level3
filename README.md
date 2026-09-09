# 人工智能刷题平台

> 少走一点弯路，多刷一道会做的题。

面向人工智能训练师职业技能等级考试的免费学习工具。项目把备考过程中的题目、知识点、错题解析、实操模板和学习资料整理成可搜索、可练习、可复盘的学习路径。

项目不卖课，不是培训机构官网，也不代表任何官方考试机构。

## 在线访问

[https://ai-trainer-level3.bbringing30.chatgpt.site](https://ai-trainer-level3.bbringing30.chatgpt.site)

站点地址通过构建环境变量 `VITE_SITE_URL` 配置，源码中不写死域名。

## 功能

- 上午理论：1037 道单选、多选、判断题，支持顺序和随机刷题
- 下午实操：答题思路、标准模板、示例代码和常见扣分点
- 模拟考试：从完整理论题库按 70 单选、10 多选、20 判断组成 100 题，支持 90 分钟倒计时、答题卡、未答提醒和自动判分
- 错题本：自动记录错误次数，连续答对 3 次后标记掌握
- Markdown 知识库：全文搜索、文章目录、上一篇/下一篇和相关练习
- 考前速记：高频结论搜索、分类和收藏
- 学习资料：百度网盘资源卡片、提取码复制和工具包入口
- 全局搜索、Dark Mode、键盘快捷键与响应式布局
- 本地学习记录：进度、错题、收藏和设置保存在 `localStorage`

## 技术栈

- Vue 3 + TypeScript
- Vite
- Vue Router
- Pinia
- Lucide Icons
- Marked（Markdown 渲染）
- 原生 CSS 变量与响应式布局

## 本地运行

要求 Node.js 20.19+ 或 22.12+。推荐使用仓库 `.nvmrc` 中的版本。

```bash
npm ci
npm run dev
```

类型检查与生产构建：

```bash
npm run type-check
npm run build
npm run preview
```

## 项目结构

```text
content/
└─ knowledge/           # Markdown 知识文章
materials/
├─ catalog.json         # 去重文档索引和 SHA-256
└─ files/               # 按地区、等级和内容分类的文档
public/                 # favicon、manifest、robots、SPA 重定向
scripts/
├─ generate-seo.mjs     # 构建后根据站点域名生成 sitemap
└─ prepare-materials.ps1 # 文档去重、安全初筛与分类
src/
├─ components/          # 导航、搜索、答题等通用组件
├─ composables/         # 知识库解析与加载
├─ data/
│  ├─ questions/        # JSON 题库
│  ├─ flashcards.json   # 考前速记
│  └─ resources.json    # 学习资料与下载入口
├─ pages/               # 页面级组件
├─ router/              # 路由配置
├─ stores/              # 学习记录与主题状态
├─ styles/              # 全局设计系统
├─ types/               # TypeScript 数据类型
└─ utils/               # 判分、剪贴板等工具
```

仓库只收录网站源码、必要内容和经过筛选的文档资料。本地课程视频、安装包、生成产物与私人辅助脚本由 `.gitignore` 的根目录白名单统一排除。

## 文档资料

`materials/` 当前收录 493 份经过 SHA-256 去重和公开安全初筛的 PDF/Office 备考文档，共 254.19 MB；视频和安装包不进入仓库。目录规则、筛选边界和版权说明见 [materials/README.md](./materials/README.md)。

## 添加新题目

在 `src/data/questions/` 中新增或编辑 JSON。题目不会写在 Vue 页面中。

```json
{
  "id": "L3-AM-0009",
  "level": 3,
  "session": "morning",
  "category": "机器学习",
  "type": "single",
  "question": "题目正文",
  "options": { "A": "选项 A", "B": "选项 B" },
  "answer": ["A"],
  "explanation": "答案解析",
  "memoryTip": "一句话速记",
  "difficulty": 1,
  "tags": ["标签"]
}
```

题型支持：`single`、`multiple`、`boolean`、`practical`。实操题可增加 `requirements`（作答要求）、`validation`（验收检查）、`steps`（答题思路）、`code`（参考模板）和 `pitfalls`（常见扣分点）。

## 添加知识库文章

在 `content/knowledge/` 新增 Markdown 文件，文件名就是可读 URL。例如 `softmax.md` 对应 `/knowledge/softmax`。

```md
---
title: 文章标题
description: 用于列表和 SEO 的描述
category: 机器学习
tags: 标签一,标签二
updatedAt: 2026-08-31
order: 10
---

# 文章标题

正文内容……
```

文章底部会按分类和标签自动匹配相关练习题。

## 添加百度网盘视频或工具包

编辑 `src/data/resources.json`：

```json
{
  "id": "unique-resource-id",
  "title": "资源名称",
  "description": "内容简介",
  "type": "baidu",
  "session": "general",
  "url": "https://pan.baidu.com/...",
  "code": "xxxx",
  "updatedAt": "2026-08-31",
  "status": "available",
  "tags": ["课程", "视频"]
}
```

外部链接统一使用新窗口安全打开。大型安装包不要复制到 `public/`，以免拖慢部署和网站加载。

## 部署到 Cloudflare Pages

1. 把项目推送到 GitHub，确认没有提交 `.env`、API Key 或私人资料。
2. 在 Cloudflare Pages 连接 GitHub 仓库。
3. 构建命令设置为 `npm run build`。
4. 输出目录设置为 `dist`。
5. Node.js 版本使用 20 或更高版本。
6. 添加环境变量：
   - `VITE_SITE_URL`：正式站点地址，例如 `https://exam.example.com`
   - `VITE_GITHUB_URL`：公开 GitHub 仓库地址
7. 在 Pages 中绑定自定义域名并重新部署。

`public/_redirects` 已处理 Vue Router 的 SPA 回退，构建脚本会根据 `VITE_SITE_URL` 生成 `sitemap.xml`。

## 贡献方式

- 题库贡献：保证题目 ID 唯一，答案格式正确，并尽量提供可验证的解析。
- 知识库贡献：使用自己的语言总结，不复制受版权保护的完整教材或课程内容。
- 勘误：说明文件、题目 ID、问题原因和建议修改。
- 资料贡献：确认链接允许分享，注明来源和更新时间，不上传个人信息。

Pull Request 会通过 GitHub Actions 执行依赖安装、TypeScript 检查和生产构建。

## 安全

- 前端代码中禁止保存 API Key、密码、GitHub Token 或 Cloudflare Token。
- `.gitignore` 使用白名单限制可提交的根目录文件，`.env` 、本地资料和生成产物不会进入仓库。
- 若密钥曾以明文出现在本地文档、Git 历史或聊天记录中，请立即在对应服务端轮换。

安全问题请使用 GitHub 的私密漏洞报告功能，详见 [SECURITY.md](./SECURITY.md)。

## TODO

- 持续校对题库答案与解析，并补充更多来源说明
- 增加多套固定模拟卷与更细的题型计分规则
- 增加不同地区考情和三级/四级/五级切换
- 为知识库增加更多实操截图和代码示例
- 增加学习数据导入、导出和跨设备同步
- 补充自动化测试与内容校验脚本

## 免责声明

本项目仅用于学习与备考交流，不构成官方考试指导。考试安排、题型和政策可能变化，请以当地职业技能鉴定机构或考试组织方发布的信息为准。

## License

项目代码使用 [MIT License](./LICENSE)。题库、课程和外部资料的版权归各自权利人所有，不因代码许可证而改变。未经授权的课程文件、试卷和安装包不应上传到本仓库。
