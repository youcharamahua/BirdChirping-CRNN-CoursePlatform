window.TrainingPageContent = {
  header: {
    brandMark: '训',
    brandName: '智聆羽声',
    brandSubtitle: '基础实验平台：CNN + LSTM 鸟鸣分类实践',
    nav: [
      { label: '返回首页', href: '/' },
      {
        label: '相关模块',
        children: [
          { label: 'CNN / ResNet 详解', href: '../code-lab/index.html' },
          { label: 'ResNet18 + BiLSTM 深入进阶台', href: '../training/index.html' },
          { label: 'CNN + Transformer 探索进阶台', href: '../transformer-training/index.html' },
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
    eyebrow: '基础实验平台',
    title: 'CNN +',
    accent: 'LSTM',
    lead: '基础实验以轻量 CNN 与单向 LSTM 为核心结构，帮助学生先建立“卷积提取局部时频特征，LSTM 组织时间顺序信息”的基本认识，形成清晰的时序分类入门链路。',
    pills: ['10 类鸟鸣', '轻量 CNN 前端', '单向 LSTM', '训练曲线与上传识别'],
    primaryAction: { label: '回看首页三档路径', href: '/' },
    secondaryAction: { label: '进入 ResNet18 + BiLSTM 深入进阶台', href: '../training/index.html' }
  },
  sections: {
    dataset: {
      title: '标准化数据集展示',
      description: '基础版与后续两套实验台共用同一套标准化数据底座。这样学生在比较 CNN + LSTM、ResNet18 + BiLSTM 与 CNN + Transformer 时，看到的是同一数据条件下的结构差异，而不是数据来源差异。',
      link: {
        label: '鸟类声音资源友链：Xeno-canto (XC)',
        href: 'https://xeno-canto.org/',
        note: '课程样本原始录音主要整理自 XC 平台，页面此处保留资源来源入口。'
      }
    },
    studio: {
      title: '模型中枢与训练反馈',
      description: '基础版先用轻量 CNN 提取局部时频纹理，再把卷积输出整理成时间序列交给 LSTM。它的重点不是一上来堆最深的主干，而是先让学生真正理解时序编码怎样接在卷积之后。',
      blueprintTitle: 'CNN + LSTM 教学结构图',
      helperText: '训练台以标准化后的 90 秒编号音频为底座，并在每个 epoch 内按文件随机抽取多个 3 秒片段，便于观察基础版的时序建模过程。',
      phases: [
        { id: 'input', label: '音频输入' },
        { id: 'window', label: '统一与切片' },
        { id: 'mel', label: 'Mel 频谱图' },
        { id: 'cnn', label: 'CNN 卷积前端' },
        { id: 'sequence', label: '序列整理' },
        { id: 'lstm', label: 'LSTM' },
        { id: 'head', label: '分类头' }
      ]
    }
  },
  footer: {
    title: '智聆羽声 · CNN + LSTM 基础实验台',
    subtitle: '先用最容易建立直觉的卷积加时序基线，把鸟鸣分类的第一条 LSTM 路线跑通'
  }
};
