# 雅思话题随机选择器

这是一个简单的网页应用，用于随机选择雅思口语/写作话题进行练习。

## 特点

- 支持四个主要话题类别：教育、社会、科技和政府
- 支持两种题目类型：讨论双方观点、同意/不同意程度
- 可以选择一个或多个话题类别和题目类型进行随机抽取
- 提供中英文双语显示
- 简洁现代的用户界面

## 使用方法

1. 在浏览器中打开 `index.html` 文件
2. 勾选您感兴趣的话题类别（教育、社会、科技、政府）
   - 点击"全部"选项可以快速选择或取消选择所有类别
3. 勾选您感兴趣的题目类型（讨论双方观点、同意/不同意程度）
   - 同样可以使用"全部"选项进行快速选择或取消
4. 点击"随机选择话题"按钮
5. 页面将显示一个随机选择的题目，左侧中文，右侧英文，底部显示题目类型

## 添加新题目

如果您想添加新的题目，只需编辑对应话题类别的 JSON 文件：

1. 打开对应类别的 JSON 文件（`education.json`, `society.json`, `technology.json`, `government.json`）
2. 在相应的题目类型（`discussion` 或 `agreement`）下添加新的题目对象，格式如下：
```json
{
  "chinese": "您的中文题目",
  "english": "Your English question"
}
```
3. 保存文件后刷新网页即可使用新添加的题目

例如，要添加一个新的教育类讨论型题目，编辑 `education.json`：
```json
{
  "discussion": [
    // 现有题目...
    {
      "chinese": "您的新教育讨论题目",
      "english": "Your new education discussion question"
    }
  ],
  "agreement": [
    // 题目...
  ]
}
```

## 添加新的话题类别

如果您想添加新的话题类别：

1. 创建一个新的 JSON 文件（例如 `environment.json`），包含 `discussion` 和 `agreement` 两个部分
2. 编辑 `index.html` 文件，在话题类别选择框部分添加新的选项
3. 编辑 `script.js` 文件，在 `topicsData` 对象和 `topics` 数组中添加新的类别

## 技术栈

- HTML5
- CSS3
- JavaScript (ES6+)
- 纯前端实现，无需服务器 