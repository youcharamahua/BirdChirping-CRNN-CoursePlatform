# 智聆羽声辅助学习平台

这是“智聆羽声”的辅助学习平台。平台将课程主线整理为三条递进实验路径：CNN + LSTM 基础版、ResNet18 + BiLSTM 深入版、CNN + Transformer 探索版，并由 FastAPI 提供训练、识别和数据集接口。

## 目录结构

```text
辅助内容设计/
├─ index.html
├─ README.md
├─ requirements.txt
├─ assets/
│  ├─ css/
│  │  ├─ base.css
│  │  ├─ home.css
│  │  ├─ training.css
│  │  ├─ coursework.css
│  │  └─ ai-learning.css
│  └─ js/
│     ├─ site.js
│     ├─ services/
│     │  └─ platform-api.js
│     ├─ content/
│     │  ├─ home-content.js
│     │  ├─ training-content.js
│     │  ├─ coursework-content.js
│     │  └─ ai-learning-content.js
│     └─ pages/
│        ├─ home.js
│        ├─ training.js
│        ├─ coursework.js
│        └─ ai-learning.js
├─ pages/
│  ├─ training/
│  │  └─ index.html
│  ├─ coursework/
│  │  └─ index.html
│  └─ ai-learning/
│     └─ index.html
└─ webapi/
   ├─ main.py
   ├─ models/
   │  └─ resnet18_bilstm_best.pth
   └─ app/
      └─ ...
```

## 页面入口

- 主界面：index.html
- 训练平台：pages/training/index.html
- 作业导航页：pages/coursework/index.html
- AI 智学页：pages/ai-learning/index.html

## 快速安装

1. 在辅助内容设计目录执行 pip install -r requirements.txt
2. 如需稳定读取 mp3、m4a 等格式，建议系统已安装 ffmpeg
3. 进入 webapi 目录后运行 python main.py
4. 浏览器打开 http://127.0.0.1:8087

## 当前拆分方式

- HTML 只保留页面壳和资源引入。
- CSS 按共享样式和页面样式拆分。
- JS 分为共享渲染能力、页面脚本、页面内容数据和 API 服务四层。
- FastAPI 负责提供训练状态、数据集概览、结构图和音频推理接口。
- 训练平台现在作为 CRNN 进阶实验台保留，只负责当前主站实际调用的 ResNet18 + BiLSTM 代码与模型文件。

## 后续扩展建议

- 新增页面时，在 pages 下增加页面目录，并同步补充对应内容脚本与样式。
- 新增内容时，优先补充 assets/js/content 下的数据文件，保持页面渲染逻辑与内容数据分离。
- 训练页的模型蓝图已经支持拖动浏览与缩放，后续如果扩展结构节点，优先沿用当前的数据流表达方式。