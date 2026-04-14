window.HomePageContent = {
  header: {
    brandMark: '智',
    brandName: '智聆羽声',
    brandSubtitle: '鸟类音频分类课程平台',
    nav: [
      { label: '课程概览', href: '#overview' },
      { label: '音频识别', href: '#playground' },
      { label: '知识地图', href: '#knowledge' },
      {
        label: '学习模块',
        children: [
          { label: 'CNN / ResNet 详解', href: './pages/code-lab/index.html' },
          { label: 'CNN + LSTM 基础台', href: './pages/cnn-training/index.html' },
          { label: 'ResNet18 + BiLSTM 深入进阶台', href: './pages/training/index.html' },
          { label: 'CNN + Transformer 探索进阶台', href: './pages/transformer-training/index.html' },
          { label: '学习支持', href: './pages/ai-learning/index.html' },
          { label: '作业导航', href: './pages/coursework/index.html' }
        ]
      },
      { label: '学习支持', href: '#faq' }
    ]
  },
  hero: {
    eyebrow: '鸟类音频分类课程平台',
    title: '智聆',
    accent: '羽声',
    lead: '平台以 CNN + LSTM 为主线组织课程内容，帮助学生建立从时频特征提取到时序建模的基本认识。ResNet18 + BiLSTM 与 CNN + Transformer 作为进阶模块保留，用于后续的结构比较与拓展分析。',
    primaryAction: { label: '进入 CNN + LSTM 基础台', href: './pages/cnn-training/index.html' },
    secondaryAction: { label: '查看三档作业路径', href: './pages/coursework/index.html' },
    quickLinks: [
      { label: '主线实验台', href: './pages/cnn-training/index.html' },
      { label: '音频识别区', href: '#playground' },
      { label: '进阶实验模块', href: '#studio' },
      { label: 'LSTM 知识地图', href: '#knowledge' },
      { label: '作业三档路径', href: '#path' }
    ],
    signalStory: {
      label: '学习主线',
      title: '先完成 CNN + LSTM 主线学习，再进入 BiLSTM 与 Transformer 进阶模块',
      waveHeights: ['30%', '46%', '62%', '74%', '42%', '88%', '54%', '70%', '82%', '48%', '90%', '50%', '72%', '78%', '44%', '66%', '60%', '38%', '76%', '32%']
    },
    stats: [
      { value: '1', label: '条首页主线' },
      { value: '2', label: '个进阶入口' },
      { value: '3', label: '档课程作业路径' }
    ]
  },
  playgroundSection: {
    id: 'playground',
    title: '音频识别区',
    description: '左侧用于上传音频并查看识别结果，右侧提供可直接载入的音频片段。页面同步生成频谱图，便于结合结果观察声音结构。',
    tester: {
      eyebrow: '音频识别',
      title: '上传音频并查看识别结果',
      text: '项目提供统一的音频识别接口。用户可上传本地音频，也可从右侧音频列表直接载入音频片段进行识别。',
      hint: '支持 wav、mp3、m4a、aac、flac、ogg。频谱图区按完整时间轴生成预览，长音频可左右拖动查看细节。'
    },
    library: {
      eyebrow: '音频列表',
      title: '音频片段',
      text: '右侧列表提供可直接载入的音频片段，仅保留播放与载入操作，便于快速查看识别结果。'
    }
  },
  capabilitySection: {
    title: '为什么首页要把 LSTM 放在最前面',
    description: '首页首先承担课程主线说明的作用。CNN + LSTM 能够以较清晰的结构呈现局部纹理提取与时间顺序建模之间的关系，在此基础上再进入更强骨干和注意力机制的比较，更有利于形成稳定的结构理解。',
    cards: [
      {
        number: '01',
        title: '先用 CNN + LSTM 建立直觉',
        text: '基础版把轻量 CNN 与单向 LSTM 串起来，让学生先看懂“卷积看局部，LSTM 记顺序”这条最易理解的入门链路。'
      },
      {
        number: '02',
        title: '深入进阶再看 ResNet18 + BiLSTM',
        text: '当学生已经能解释 LSTM 主线，再引入更强的卷积主干与双向上下文，结构比较才会发生在真实理解之上。'
      },
      {
        number: '03',
        title: '探索进阶最后再开放 Transformer',
        text: '探索版不再只是“更复杂”，而是让已经掌握 LSTM 系列的学生去比较门控记忆与注意力机制在鸟鸣任务上的收益与代价。'
      }
    ]
  },
  journeySection: {
    id: 'overview',
    title: '课程使用路径',
    description: '建议先通过音频识别区建立任务认识，再进入 CNN + LSTM 主线实验，最后结合课程作业要求完成结构分析与结果表达。',
    cards: [
      {
        stage: '起步',
        title: '先上传音频并观察结果',
        text: '通过识别结果与频谱图预览，建立对任务对象、输入形式和结果表达方式的初步认识。',
        linkLabel: '前往音频识别区',
        href: '#playground'
      },
      {
        stage: '主线',
        title: '先走 CNN + LSTM 主线',
        text: '首页优先引导进入 CNN + LSTM 基础台；ResNet18 + BiLSTM 与 CNN + Transformer 明确留作后续进阶比较。',
        linkLabel: '查看主线与进阶入口',
        href: '#studio'
      },
      {
        stage: '收束',
        title: '把实验过程整理成作业成果',
        text: '完成平台实验后，再回到课程作业导航页，把问题清单、训练观察、错误分析和结论串成完整表达。',
        linkLabel: '进入作业导航页',
        href: './pages/coursework/index.html'
      }
    ]
  },
  knowledgeSection: {
    id: 'knowledge',
    title: '课程知识地图',
    description: '这里把学生真正要跨越的理解路径拆成四步：先看声音怎样变图，再看 CNN 怎样看局部，然后把 LSTM 主线学扎实，最后再把 BiLSTM 与 Transformer 放到进阶比较里。',
    cards: [
      {
        number: '01',
        title: '声音变图',
        text: '先理解为什么音频常被转成频谱图，再理解 Mel 频谱图为什么适合送入深度学习模型。',
        points: ['波形、频谱图、Mel 频谱图的差异', '时间、频率、能量三要素', '音频任务与视觉任务的桥接关系']
      },
      {
        number: '02',
        title: 'CNN 看局部特征',
        text: '不管后面接的是 LSTM 还是 Transformer，第一步通常还是让 CNN 在频谱图上提取稳定的局部纹理。',
        points: ['卷积核如何滑动并提取局部模式', '池化怎样压缩空间并保留关键信息', '浅层与深层卷积特征的差异']
      },
      {
        number: '03',
        title: 'LSTM 主线与 BiLSTM 进阶',
        text: '这一层先解释为什么鸟鸣不能只看局部纹理，还要把若干时刻之间的先后关系重新读出来；随后再比较 BiLSTM 的进阶价值。',
        points: ['LSTM 如何保留有效记忆', 'BiLSTM 为什么属于后续进阶比较', '卷积特征怎样整理成序列']
      },
      {
        number: '04',
        title: 'Transformer 探索进阶',
        text: '当学生已经理解门控记忆，再进入 Transformer，就能更清楚地比较“注意力”与“记忆链”究竟分别在解决什么问题。',
        points: ['位置编码为什么必要', '多头注意力如何比较远近片段', '复杂模型的收益与代价']
      }
    ]
  },
  studioSection: {
    id: 'studio',
    title: '主线实验台与进阶模块',
    description: '首页将主线实验台与两个进阶模块统一整理为三张状态卡，分别对应不同的学习层次、运行状态和进入路径。',
    leftCard: {
      title: '实验入口说明',
      points: ['如果你刚接触时序建模，先从 CNN + LSTM 基础台开始。', '如果你已经能解释卷积特征与顺序关系，再进入 ResNet18 + BiLSTM 深入进阶台。', '如果你的问题已经转向“全局依赖值不值得”，再进入 CNN + Transformer 探索进阶台。']
    },
    canvas: {
      header: '学习路径总览',
      status: '主线 + 进阶',
      hint: '首页用于说明学习路径；训练控制、训练曲线、运行日志和模型蓝图均在各实验台中分别展示。',
      nodes: [
        { title: '音频输入', subtitle: '原始录音 / 音频片段' },
        { title: 'Mel 频谱图', subtitle: '把声音转成可学习图像' },
        { title: 'CNN 前端', subtitle: '提取局部时频纹理' },
        { title: 'LSTM 主线链', subtitle: '先理解单向记忆', highlight: true },
        { title: 'BiLSTM 深入进阶', subtitle: '再比较双向上下文' },
        { title: 'Transformer 探索进阶', subtitle: '最后比较全局依赖' }
      ],
      tracks: ['首页主线先跑 CNN + LSTM，建立时序建模直觉', '深入进阶再用 ResNet18 + BiLSTM 比较更强骨干与双向上下文', '探索进阶最后用 CNN + Transformer 讨论注意力机制是否值得引入']
    },
    actions: [
      { label: '打开 CNN + LSTM 基础台', href: './pages/cnn-training/index.html' },
      { label: '进入 ResNet18 + BiLSTM 深入进阶台', href: './pages/training/index.html' },
      { label: '打开 CNN + Transformer 探索进阶台', href: './pages/transformer-training/index.html' }
    ],
    rightCard: {
      title: '首页信息组织方式',
      text: '首页突出 CNN + LSTM 主线实验台，其余两张状态卡作为进阶模块入口，仅保留模型名称、运行状态、最佳准确率和跳转按钮。',
      points: ['首页以总览说明为主，不展开训练控制细节。', '主线卡片优先回答课程起点与学习顺序。', '进阶卡片用于承接后续结构比较与拓展分析。']
    }
  },
  assistantSection: {
    id: 'assistant',
    title: '智能辅助学习',
    description: '该模块用于辅助概念解释、结构比较与实验复盘，帮助学生围绕 LSTM 主线及进阶模块形成更完整的学习记录。',
    card: {
      eyebrow: '学习支持',
      title: '智能辅助工具的使用方式',
      text: '建议基于真实实验现象提出问题，用于概念解释、结构比较、训练分析和复盘总结，以形成可追踪的学习过程。',
      points: ['概念理解：为什么 CNN 后面还要接 LSTM。', '结构比较：单向 LSTM、BiLSTM 和 Transformer 分别在补什么。', '训练分析：为什么模型更复杂后不一定稳定提升。', '复盘表达：怎样把结果变化写成有依据的结论。'],
      pills: ['先描述现象', '再追问原因', '最后自己验证']
    },
    actions: [
      { label: '进入学习支持页', href: './pages/ai-learning/index.html' },
      { label: '查看示例追问链', href: './pages/ai-learning/index.html#ladder' }
    ],
    prompts: [
      { tag: '基础版', text: '为什么轻量 CNN 提取完局部纹理后，还需要 LSTM 去读时间顺序？' },
      { tag: '深入版', text: 'ResNet18 + BiLSTM 相比 CNN + LSTM 可能提升在哪里，又可能为什么不提升？' },
      { tag: '探索版', text: '如果换成 Transformer，哪些类别可能从全局依赖比较中受益？' },
      { tag: '复盘', text: '如果三套模型结果差异不大，我应该怎样解释，而不是只说“模型没效果”？' }
    ]
  },
  resourceSection: {
    id: 'resources',
    title: '常用入口与助学资源',
    description: '如果你已经知道自己要做什么，可以直接从这里跳转。首页负责建立整体理解，但仍然优先推荐先走 CNN + LSTM 主线，其余入口明确标为进阶或支持资源。',
    cards: [
      {
        eyebrow: '主讲内容',
        tone: 'lesson',
        title: 'CNN / ResNet 详解页',
        text: '按课堂顺序拆开卷积核、卷积块和 ResNet18，作为所有实验台的卷积背景知识。',
        href: './pages/code-lab/index.html',
        hint: '进入主讲页'
      },
      {
        eyebrow: '主线优先',
        tone: 'primary',
        title: 'CNN + LSTM 基础台',
        text: '先建立“卷积提局部、LSTM 记顺序”的基础版实验闭环。',
        href: './pages/cnn-training/index.html',
        hint: '进入基础实验'
      },
      {
        eyebrow: '深入进阶',
        tone: 'advanced',
        title: 'ResNet18 + BiLSTM 深入进阶台',
        text: '在掌握 LSTM 主线之后，再围绕更强卷积主干和双向上下文做结构比较。',
        href: './pages/training/index.html',
        hint: '进入深入实验'
      },
      {
        eyebrow: '探索进阶',
        tone: 'advanced',
        title: 'CNN + Transformer 探索进阶台',
        text: '在掌握 LSTM 主线之后，再把序列编码推进到注意力机制，完成探索版比较。',
        href: './pages/transformer-training/index.html',
        hint: '进入探索实验'
      },
      {
        eyebrow: '学习支持',
        tone: 'support',
        title: '学习支持页',
        text: '学习如何围绕概念、代码、调试和复盘设计高质量提示词。',
        href: './pages/ai-learning/index.html',
        hint: '进入学习支持'
      },
      {
        eyebrow: '作业路径',
        tone: 'support',
        title: '作业导航页',
        text: '查看基础、深入、探索三档作业如何分别对应三套实验台。',
        href: './pages/coursework/index.html',
        hint: '进入三档路径'
      },
      {
        eyebrow: '完整任务',
        tone: 'support',
        title: '完整任务书页',
        text: '在一个页面里完整阅读课程作业总说明和三档任务书。',
        href: './pages/coursework-full/index.html',
        hint: '查看完整任务书'
      },
      {
        eyebrow: '常见问题',
        tone: 'support',
        title: '学习支持',
        text: '回到常见疑问区，快速定位第一次接触时序音频分类时最常见的问题。',
        href: '#faq',
        hint: '查看常见疑问'
      }
    ]
  },
  pathSection: {
    id: 'path',
    title: '课程作业三档路径',
    description: '课程作业现在按三套实验台同步组织，但首页会先强调 CNN + LSTM 主线；ResNet18 + BiLSTM 与 CNN + Transformer 明确作为后续进阶层。每完成一层，学生就能把“听见鸟鸣”进一步推进到“能解释结构为什么这样设计”。',
    action: { label: '查看完整作业展示页', href: './pages/coursework-full/index.html' },
    cards: [
      {
        tone: 'basic',
        title: '基础主线',
        text: '目标是先跑通 CNN + LSTM 的最小闭环，建立对时序音频分类任务的第一条可解释链路。',
        points: ['完成音频切片与 Mel 频谱图生成。', '搭建 CNN + LSTM 基线模型。', '能解释卷积与单向记忆分别在做什么。'],
        pills: ['CNN + LSTM', 'Mel Spectrogram', 'Baseline']
      },
      {
        tone: 'deep',
        title: '深入进阶',
        text: '目标是用 ResNet18 + BiLSTM 做结构升级与有效比较，说明更强骨干和双向上下文是否真的带来改进。',
        points: ['将卷积前端升级为 ResNet18。', '比较单向与双向时序编码差异。', '把结构变化与结果变化对应起来。'],
        pills: ['ResNet18 + BiLSTM', 'Comparison', 'Deep Features']
      },
      {
        tone: 'explore',
        title: '探索进阶',
        text: '目标是用 CNN + Transformer 组织一个更像小研究的比较任务，讨论注意力机制的收益、局限与代价。',
        points: ['进入 CNN + Transformer 探索实验。', '比较 LSTM 系列与 Transformer 的差异来源。', '形成误差分析、局限与下一步设想。'],
        pills: ['CNN + Transformer', 'Attention', 'Error Analysis']
      }
    ]
  },
  faqSection: {
    id: 'faq',
    title: '学习支持与常见疑惑',
    description: '这一部分专门用来降低第一次接触时序音频分类学生的心理门槛，也帮助老师快速统一课程定位。',
    cards: [
      { title: '为什么首页聚焦 LSTM 主线', text: '因为 CNN + LSTM 更适合作为时序音频分类的起点，便于先建立局部特征提取与时间顺序建模之间的基本关系。' },
      { title: 'ResNet 和 Transformer 是否仍然保留', text: '保留。它们分别作为深入进阶与探索进阶模块，用于后续的结构比较与扩展分析。' },
      { title: '音频识别区和训练台有什么区别', text: '音频识别区用于上传音频、查看识别结果和频谱图预览；训练控制、训练曲线、运行日志和模型蓝图均在各实验台中展示。' },
      { title: '结果不理想是不是就失败了', text: '不是。对失败样本、参数设置和不同结构边界的复盘，本身就是课程作业最重要的学习成果之一。' }
    ]
  },
  footer: {
    title: '智聆羽声 · 鸟类音频分类辅助学习平台',
    subtitle: '围绕 LSTM 主线、进阶模块、学习支持与作业路径构建完整的鸟类音频分类课程链路',
    footbar: {
      eyebrow: '平台介绍',
      title: '智聆羽声首页导学与实验入口总览',
      description: '首页负责把课程主线、音频识别体验、实验入口、学习支持与作业路径组织成一条完整链路。页面重点突出 CNN + LSTM 主线，同时保留 ResNet18 + BiLSTM 与 CNN + Transformer 两个进阶模块，便于学生在完成基础理解后继续开展结构比较与结果分析。',
      blocks: [
        {
          title: '平台定位',
          items: ['首页导学与任务入口统一呈现。', '音频上传区支持完整时间轴频谱预览。', '主线实验、进阶实验与作业导航相互联动。', '学习支持页用于概念解释、结构比较与实验复盘。']
        },
        {
          title: '平台信息',
          items: ['适用场景：鸟类音频分类课程展示、课堂辅助与微课演示。', '核心技术：FastAPI、PyTorch、torchaudio 与前端可视化组件。', '资源内容：鸟鸣音频样本、频谱预览、模型实验台与课程作业路径。', '使用方式：浏览器访问首页后，可直接进入识别区或各实验模块。']
        }
      ]
    }
  }
};
