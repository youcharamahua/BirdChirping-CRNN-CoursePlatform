window.CourseworkPageContent = {
  header: {
    brandMark: '课',
    brandName: '智聆羽声',
    brandSubtitle: '围绕 LSTM 主线组织的课程作业导航',
    nav: [
      { label: '返回平台首页', href: '/' },
      {
        label: '相关模块',
        children: [
          { label: 'CNN + LSTM 基础台', href: '../cnn-training/index.html' },
          { label: 'ResNet18 + BiLSTM 深入进阶台', href: '../training/index.html' },
          { label: 'CNN + Transformer 探索进阶台', href: '../transformer-training/index.html' },
          { label: '完整任务书', href: '../coursework-full/index.html' },
          { label: '学习支持', href: '../ai-learning/index.html' }
        ]
      },
      {
        label: '页内导览',
        children: [
          { label: '作业总览', href: '#overview' },
          { label: '实践平台', href: '#lab' },
          { label: '作业要求', href: '#requirements' },
          { label: '基础', href: '#basic' },
          { label: '深入', href: '#deep' },
          { label: '探索', href: '#explore' }
        ]
      }
    ]
  },
  sidebar: {
    title: '作业导航',
    copy: '左侧负责快速定位，右侧负责展开具体任务。建议先看总要求，再按自己的基础进入对应层级。',
    items: [
      { title: '实践平台', subtitle: '查看三套时序实验台', href: '#lab', order: '00' },
      { title: '作业要求', subtitle: '总说明与共同要求', href: '#requirements', order: '01' },
      { title: '基础', subtitle: '先跑通 CNN + LSTM', href: '#basic', order: '02' },
      { title: '深入', subtitle: '进入 ResNet18 + BiLSTM', href: '#deep', order: '03' },
      { title: '探索', subtitle: '比较 CNN + Transformer', href: '#explore', order: '04' }
    ],
    noteTitle: '使用建议',
    notePoints: ['先看总要求，再决定从哪一档开始。', '每一档都要保留过程记录，而不是只留最终结果。', '如果中途调整难度，请把调整原因写进实验日志。']
  },
  hero: {
    id: 'overview',
    eyebrow: '课程作业路径',
    title: '课程作业导航',
    text: '本页将课程作业整理为与实验平台一致的三层路径。可先阅读总要求，再根据学习基础进入 CNN + LSTM 基础层、ResNet18 + BiLSTM 深入层或 CNN + Transformer 探索层。',
    meta: ['3 档任务路径', '左侧固定导航', '右侧任务展开', '卡片点击直达对应层级']
  },
  platformBrief: {
    eyebrow: '实践平台说明',
    title: '课程作业和三套实验台已经完全对齐',
    text: '平台现提供三套对应的训练模块：基础层使用 CNN + LSTM，深入层使用 ResNet18 + BiLSTM，探索层使用 CNN + Transformer。作业要求已直接整合到网页内容与跳转入口中，便于统一浏览和使用。',
    actions: [
      { label: '打开 CNN + LSTM 基础台', href: '../cnn-training/index.html' },
      { label: '打开 ResNet18 + BiLSTM 深入进阶台', href: '../training/index.html' },
      { label: '打开 CNN + Transformer 探索进阶台', href: '../transformer-training/index.html' },
      { label: '打开完整任务书页', href: '../coursework-full/index.html' },
      { label: '打开学习支持页', href: '../ai-learning/index.html' }
    ]
  },
  quickLinks: [
    { eyebrow: '实验平台', title: 'CNN + LSTM 基础台', text: '先建立基础层的最小时序闭环。', href: '../cnn-training/index.html' },
    { eyebrow: '实验平台', title: 'ResNet18 + BiLSTM 深入进阶台', text: '围绕更强骨干和双向时序进行比较。', href: '../training/index.html' },
    { eyebrow: '实验平台', title: 'CNN + Transformer 探索进阶台', text: '把注意力机制引入探索层实验。', href: '../transformer-training/index.html' },
    { eyebrow: '学习支持', title: '学习支持页', text: '查看案例，学习如何围绕结构比较与结果复盘设计问题。', href: '../ai-learning/index.html' },
    { eyebrow: '完整任务', title: '完整任务书页', text: '集中阅读课程作业总说明和三档任务书。', href: '../coursework-full/index.html' },
    { eyebrow: '作业总览', title: '作业要求', text: '查看三档路径定位、共同要求、过程记录方式与整体完成逻辑。', href: '#requirements' },
    { eyebrow: '基础层', title: '基础版', text: '先跑通 CNN + LSTM 的第一条链路。', href: '#basic' },
    { eyebrow: '深入层', title: '深入版', text: '进入 ResNet18 + BiLSTM 做结构升级与比较。', href: '#deep' },
    { eyebrow: '探索层', title: '探索版', text: '用 CNN + Transformer 组织研究型比较任务。', href: '#explore' }
  ],
  sections: [
    {
      id: 'lab',
      label: '实践平台',
      title: '先看清三套实验台分别负责什么',
      intro: '现在平台不再只分“主讲”和“扩展”，而是直接对应作业三档路径。基础版先跑 CNN + LSTM，深入版再进入 ResNet18 + BiLSTM，探索版最后做 CNN + Transformer 比较。',
      cards: [
        {
          title: '平台现在能直接完成什么',
          items: ['在基础实验台中直接观察 CNN + LSTM 的训练与推理。', '在深入进阶台中比较更强卷积主干与双向上下文。', '在探索进阶台中继续观察 Transformer 的全局依赖建模。', '三套实验台共用同一数据底座，便于做公平比较。']
        },
        {
          title: '进入平台前建议先想清楚',
          items: ['你现在是要先建立最小闭环，还是已经准备比较结构升级。', '你的作业目标是“跑通、比较、探索”中的哪一层。', '如果进入探索版，你准备拿什么问题去判断 Transformer 是否值得引入。']
        }
      ],
      actions: [
        { label: '打开 CNN + LSTM 基础台', href: '../cnn-training/index.html' },
        { label: '打开 ResNet18 + BiLSTM 深入进阶台', href: '../training/index.html' },
        { label: '打开 CNN + Transformer 探索进阶台', href: '../transformer-training/index.html' }
      ]
    },
    {
      id: 'requirements',
      label: '作业要求',
      title: '先确认总要求，再进入具体层级',
      intro: '三档作业并不是三份互相孤立的说明，而是围绕同一门课程分层展开。共同原则是：不仅要得到结果，更要说明任务如何推进、困难如何暴露、结论如何形成。',
      cards: [
        {
          title: '建议先把这三件事想清楚',
          listClass: 'step-list',
          items: ['你当前最适合从哪一档开始，而不是一开始就追求最复杂模型。', '你的作业目标是“跑通、比较、探索”中的哪一层，应该和当前基础匹配。', '无论选哪一档，都必须保留问题清单、过程记录、关键结果和 LLM 使用轨迹。'],
          badges: ['问题清单', '过程记录', '结果分析', 'LLM 轨迹']
        },
        {
          title: '共同提交重点',
          listClass: 'deliverable-list',
          items: ['说明你最初怎样理解任务，以及为什么选择这一档。', '保留数据组织、训练观察和错误分析，而不只交最终数字。', '把课程知识和自己的任务步骤对应起来，形成可复盘的学习证据。', '如使用 LLM，要体现你如何提问、验证、修正，而不是直接照搬。']
        }
      ],
      actions: [{ label: '查看完整总说明', href: '../coursework-full/index.html#overview' }]
    },
    {
      id: 'basic',
      label: '基础',
      title: '基础版：先把 CNN + LSTM 的第一条链路跑通',
      intro: '基础版承担的是整门课程最关键的起步任务。重点不是一开始追求最复杂结构，而是让学生先建立“卷积提取局部纹理，LSTM 继续读取顺序”的完整闭环。',
      steps: [
        { index: '0', title: '先写下你对任务的理解', text: '明确这份作业要解决什么问题、你当前最不确定什么、一个“完成”的基础版应该至少包含哪些结果。' },
        { index: '1', title: '建立样本台账，先认识数据', text: '统计鸟种、时长、噪声和样本质量，不把数据当成天然正确的输入。' },
        { index: '2', title: '把“声音变图”讲清楚', text: '围绕波形、频谱图和 Mel 频谱图，说明你为什么选择这种表示方式。' },
        { index: '3', title: '搭建 CNN + LSTM 基线模型', text: '重点说明 CNN 负责什么、LSTM 负责什么，而不是只写出一个模型名。' },
        { index: '4', title: '完成第一次训练并记录真实观察', text: '不仅记录 loss 和准确率，还要写出模型是否真的开始学到东西。' },
        { index: '5', title: '做第一次错误分析', text: '对正确样本和错误样本分别解释，初步判断模型更依赖哪些局部特征和顺序线索。' }
      ],
      cards: [
        { title: '本层最重要的产出', items: ['任务理解与问题清单。', '样本统计与数据风险判断。', '输入表示说明与示意图。', 'CNN + LSTM 模型说明、训练曲线与第一轮结果摘要。', '至少一组错误样本分析。'] },
        { title: '适合谁从这里开始', items: ['第一次接触音频分类任务的同学。', '对 LSTM 只有模糊印象，还没独立跑通过完整实验的同学。', '希望先建立一条稳妥最小闭环的同学。'] }
      ],
      actions: [{ label: '查看基础版完整任务书', href: '../coursework-full/index.html#basic' }]
    },
    {
      id: 'deep',
      label: '深入',
      title: '深入版：从 CNN + LSTM 走到 ResNet18 + BiLSTM',
      intro: '深入版的目标不是“换一个更复杂的模型”，而是解释为什么更强卷积主干和双向上下文有可能带来提升，以及这种提升究竟来自哪里。',
      steps: [
        { index: '0', title: '回看基础版，明确为什么要升级', text: '先分析基础模型卡在哪里，是局部特征表达不足，还是顺序线索读取仍然不够完整。' },
        { index: '1', title: '重新定义目标，不只是追分', text: '明确你要验证的是 ResNet18 和 BiLSTM 是否真的比基础版更稳、更有解释力。' },
        { index: '2', title: '理解为什么是 ResNet18 + BiLSTM', text: '从残差主干和双向上下文出发，说明这条深入版结构的教学意义。' },
        { index: '3', title: '设计公平比较，再开始实验', text: '控制数据处理和评价方式，避免一边换主干、一边换训练策略。' },
        { index: '4', title: '比较结果变化', text: '不仅比较结果高低，还要说清更深骨干和双向读取分别可能带来什么变化。' },
        { index: '5', title: '把结构讲成完整数据流', text: '从输入到输出完整解释 ResNet18 + BiLSTM 这条链路，而不是只会调用。' }
      ],
      cards: [
        { title: '本层最重要的产出', items: ['基础版复盘与升级理由。', 'ResNet18 + BiLSTM 结构说明图。', '控制变量下的比较设计表。', '基础版与深入版的对比结果。', '对“提升来自哪里”的结构化分析。'] },
        { title: '这一层真正训练的能力', items: ['把更复杂的卷积主干和双向时序结构讲清楚。', '做出有依据的模型比较。', '把课堂概念转化为实验判断和解释。'] }
      ],
      actions: [{ label: '查看深入版完整任务书', href: '../coursework-full/index.html#deep' }]
    },
    {
      id: 'explore',
      label: '探索',
      title: '探索版：把 CNN + Transformer 推进成小研究',
      intro: '探索版不鼓励无目标地堆模型。更合理的做法，是在前两层已经完成之后，再提出一个明确问题，讨论注意力机制是否真的比 LSTM 系列更适合当前任务。',
      steps: [
        { index: '0', title: '先提出一个像样的问题', text: '把“我想优化模型”收束成更具体的问题，例如 Transformer 是否真的更擅长处理长程依赖。' },
        { index: '1', title: '回顾已有结果，避免盲试', text: '从基础版和深入版已有现象中抽取值得追问的痛点，而不是凭兴趣同时开很多实验线。' },
        { index: '2', title: '明确为什么要进入 Transformer', text: '先解释注意力机制可能解决什么，再决定是否引入它。' },
        { index: '3', title: '建立公平比较方案', text: '保证 CNN + Transformer 与前两套模型使用一致的数据底座和评价方式。' },
        { index: '4', title: '把现象收束成结论', text: '回到原始问题，明确哪些假设得到支持、哪些仍然不确定。' },
        { index: '5', title: '写成一份小型研究报告', text: '把结果、误差分析、局限和下一步设想组织成真正能讨论的问题。' }
      ],
      cards: [
        { title: '可作为主问题的方向', items: ['注意力是否真的比门控记忆更适合当前鸟鸣任务。', 'Transformer 的提升是否集中在少数特定类别。', '复杂模型的收益是否足以覆盖训练代价。', '哪些错误被缓解，哪些错误仍然保留。'] },
        { title: '本层最重要的产出', items: ['明确研究问题与初步假设。', '进入 Transformer 的理由说明。', '多组结果对照与可信度判断。', '典型错误案例和错误链分析。', '正式结论、局限与后续改进建议。'] }
      ],
      actions: [{ label: '查看探索版完整任务书', href: '../coursework-full/index.html#explore' }]
    }
  ],
  footer: {
    title: '智聆羽声 · 课程作业导航页',
    subtitle: '把 CNN + LSTM、ResNet18 + BiLSTM、CNN + Transformer 三档任务步骤组织成一条可浏览的学习入口'
  }
};
