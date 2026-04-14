window.TrainingPageContent = {
  header: {
    brandMark: '探',
    brandName: '智聆羽声',
    brandSubtitle: '探索实验平台：CNN + Transformer 结构拓展实践',
    nav: [
      { label: '返回首页', href: '/' },
      {
        label: '相关模块',
        children: [
          { label: 'CNN + LSTM 基础台', href: '../cnn-training/index.html' },
          { label: 'ResNet18 + BiLSTM 深入进阶台', href: '../training/index.html' },
          { label: 'CNN / ResNet 详解', href: '../code-lab/index.html' },
          { label: '完整作业', href: '../coursework-full/index.html' }
        ]
      },
      {
        label: '页内导览',
        children: [
          { label: '数据集', href: '#dataset' },
          { label: '模型中枢', href: '#studio' },
          { label: '训练控制', href: '#control' },
          { label: '识别结果', href: '#inference' }
        ]
      }
    ]
  },
  hero: {
    eyebrow: '探索进阶实验平台',
    title: 'CNN +',
    accent: 'Transformer',
    lead: '探索进阶实验以 CNN 前端与 Transformer Encoder 为核心结构，用于比较注意力机制与 LSTM 系列在鸟类音频分类任务中的建模差异，形成更进一步的结构分析。',
    pills: ['10 类鸟鸣', 'CNN 局部特征', 'Transformer Encoder', '全局依赖比较'],
    primaryAction: { label: '回看 ResNet18 + BiLSTM 深入进阶台', href: '../training/index.html' },
    secondaryAction: { label: '回到课程作业导航', href: '../coursework/index.html#explore' }
  },
  sections: {
    dataset: {
      title: '标准化数据集展示',
      description: '探索版仍然复用同一套数据底座，目的是让学生把注意力集中在“序列编码器发生了什么变化”，而不是把提升误判成数据清洗差异。',
      link: {
        label: '鸟类声音资源友链：Xeno-canto (XC)',
        href: 'https://xeno-canto.org/',
        note: '课程样本原始录音主要整理自 XC 平台，页面此处保留资源来源入口。'
      }
    },
    studio: {
      title: '模型中枢与训练反馈',
      description: '探索版展示的是 CNN 前端、序列整理、位置编码与 Transformer Encoder 的完整组合。它更适合拿来讨论“注意力是否真的比门控记忆更适合当前任务”，以及复杂结构的收益是否足以支撑代价。',
      blueprintTitle: 'CNN + Transformer 教学结构图',
      helperText: '训练同样以标准化后的 90 秒编号音频为底座，并在每个 epoch 内按文件随机抽取多个 3 秒片段。',
      phases: [
        { id: 'input', label: '音频输入' },
        { id: 'window', label: '统一与切片' },
        { id: 'mel', label: 'Mel 频谱图' },
        { id: 'cnn', label: 'CNN 卷积前端' },
        { id: 'sequence', label: '序列整理' },
        { id: 'transformer', label: 'Transformer' },
        { id: 'head', label: '分类头' }
      ]
    }
  },
  footer: {
    title: '智聆羽声 · CNN + Transformer 探索实验台',
    subtitle: '把注意力机制放进统一数据底座里，和 LSTM 系列做真正可解释的比较'
  }
};
