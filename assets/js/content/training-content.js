window.TrainingPageContent = {
  header: {
    brandMark: '训',
    brandName: '智聆羽声',
    brandSubtitle: '深入实验平台：ResNet18 + BiLSTM 结构比较实践',
    nav: [
      { label: '返回首页', href: '/' },
      {
        label: '相关模块',
        children: [
          { label: 'CNN + LSTM 基础台', href: '../cnn-training/index.html' },
          { label: 'CNN / ResNet 详解', href: '../code-lab/index.html' },
          { label: 'CNN + Transformer 探索进阶台', href: '../transformer-training/index.html' },
          { label: '完整作业', href: '../coursework-full/index.html' },
          { label: '作业导航', href: '../coursework/index.html' }
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
    eyebrow: '深入进阶实验平台',
    title: 'ResNet18 +',
    accent: 'BiLSTM',
    lead: '深入进阶实验以 ResNet18 主干与双向 BiLSTM 为核心结构，用于比较更强卷积表示与双向时序上下文对鸟类音频分类任务的影响，并形成可解释的结构分析。',
    pills: ['10 类鸟鸣', 'ResNet18 主干', '双向 BiLSTM', '上传识别与日志反馈'],
    primaryAction: { label: '回看 CNN + LSTM 基础台', href: '../cnn-training/index.html' },
    secondaryAction: { label: '进入 CNN + Transformer 探索进阶台', href: '../transformer-training/index.html' }
  },
  sections: {
    dataset: {
      title: '标准化数据集展示',
      description: '深入版继续复用同一套标准化数据、图片与频谱预览，避免比较时混入额外变量。学生可以直接把这里的训练反馈与基础版、探索版做横向对照。',
      link: {
        label: '鸟类声音资源友链：Xeno-canto (XC)',
        href: 'https://xeno-canto.org/',
        note: '课程样本原始录音主要整理自 XC 平台，页面此处保留资源来源入口。'
      }
    },
    studio: {
      title: '模型中枢与训练反馈',
      description: '深入版重点展示从 Mel 频谱图进入 ResNet18 Stem、残差阶段、序列展开，再进入 BiLSTM 双向支路与分类头的完整数据流。这里服务的是“结构比较”和“深层特征理解”，不是单纯展示一个更复杂的名字。',
      blueprintTitle: 'ResNet18 + BiLSTM 教学结构图',
      helperText: '训练以标准化后的 90 秒编号音频为底座，并在每个 epoch 内按文件随机抽取多个 3 秒片段。',
      phases: [
        { id: 'input', label: '音频输入' },
        { id: 'window', label: '统一与切片' },
        { id: 'mel', label: 'Mel 频谱图' },
        { id: 'resnet', label: 'ResNet18' },
        { id: 'sequence', label: '序列展开' },
        { id: 'bilstm', label: 'BiLSTM' },
        { id: 'head', label: '分类头' }
      ]
    }
  },
  footer: {
    title: '智聆羽声 · ResNet18 + BiLSTM 深入实验台',
    subtitle: '把更强的卷积主干与双向时序编码放进同一套课堂比较平台'
  }
};
