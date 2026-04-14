window.CodeLabPageContent = {
  header: {
    brandMark: '进',
    brandName: '智聆羽声',
    brandSubtitle: 'CRNN 拓展模块：ResNet18 + BiLSTM 结构延展',
    nav: [
      { label: '返回首页', href: '/' },
      {
        label: '相关模块',
        children: [
          { label: 'CNN / ResNet 详解', href: '../code-lab/index.html' },
          { label: 'ResNet18 + BiLSTM 深入进阶台', href: '../training/index.html' },
          { label: 'CNN + Transformer 探索进阶台', href: '../transformer-training/index.html' },
          { label: '完整任务书', href: '../coursework-full/index.html' }
        ]
      },
      {
        label: '页内导览',
        children: [
          { label: '搭建顺序', href: '#roadmap' },
          { label: '第一步', href: '#step1' },
          { label: '第二步', href: '#step2' },
          { label: '第三步', href: '#step3' },
          { label: '第四步', href: '#step4' },
          { label: '第五步', href: '#step5' },
          { label: '第六步', href: '#step6' },
          { label: '张量变化', href: '#shapes' }
        ]
      }
    ]
  },
  hero: {
    eyebrow: 'CRNN 拓展模块',
    title: '从 ResNet18',
    accent: '再扩展到 CRNN',
    lead: '本页作为结构拓展阅读，说明在卷积主干已经完成局部时频特征提取之后，如何继续将这些特征整理成时间序列，并交由 BiLSTM 补充前后文信息，形成完整的 CRNN 结构。',
    pills: ['先有 ResNet18 主干', '再整理时间序列', '最后接入 BiLSTM', '回到完整分类输出'],
    primaryAction: { label: '先看搭建顺序', href: '#roadmap' },
    secondaryAction: { label: '前往 ResNet18 + BiLSTM 深入进阶台对照结构', href: '../training/index.html#studio' }
  },
  aside: {
    label: '阅读顺序',
    title: '先复用卷积主干，再补时序模块',
    text: '这页默认你已经理解了前一页里的 CNN 和 ResNet。现在的重点不再是“卷积是什么”，而是“卷积特征为什么还要交给时序模型继续读”。',
    points: ['先把类的外壳写出来，明确这是一个序列增强分类模型。', '先复用 ResNet18 主干，而不是重新发明卷积部分。', '再把二维特征整理成时间序列。', '最后接上 BiLSTM 和分类头，完成 CRNN 闭环。']
  },
  roadmap: {
    id: 'roadmap',
    title: '进阶页先记住这 5 个动作',
    description: 'CRNN 不是把两个模型名字机械拼在一起，而是沿着同一条数据流往后多走一步。先保留卷积主干，再把特征整理成序列，最后再让 BiLSTM 去理解顺序。',
    cards: [
      {
        tag: '第 1 步',
        title: '先约定输入和输出',
        text: '输入仍然是一张单通道 Mel 频谱图，输出仍然是每个鸟种的分类分数，但中间会多一段时序编码。',
        points: ['输入形状和前一页保持一致。', '输出维度仍然等于类别数。']
      },
      {
        tag: '第 2 步',
        title: '复用 ResNet18 卷积主干',
        text: '先把前面已经讲清楚的卷积骨干拿过来，继续承担时频纹理提取。',
        points: ['卷积部分负责看局部模式。', '残差结构负责让深层提取更稳。']
      },
      {
        tag: '第 3 步',
        title: '把二维特征整理成序列',
        text: '卷积输出的是特征图，BiLSTM 需要的是时间序列，所以必须先做维度整理。',
        points: ['先沿频率维做平均。', '再把维度换成 Batch × Time × Feature。']
      },
      {
        tag: '第 4 步',
        title: '接上 BiLSTM 编码前后文',
        text: '这一步负责回答“同样的局部纹理，如果出现在不同顺序里，会不会代表不同类别”。',
        points: ['BiLSTM 同时看前向和后向上下文。', '它补的是顺序信息，而不是替代卷积。']
      },
      {
        tag: '第 5 步',
        title: '把时序特征送入分类头',
        text: '最后把 BiLSTM 输出收束成一份整段音频的表示，再输出类别分数。',
        points: ['时间维做聚合。', '分类头完成最终判断。']
      }
    ]
  },
  steps: [
    {
      id: 'step1',
      label: '第一步',
      title: '先把 CRNN 外壳搭起来',
      intro: '和主讲页一样，先不要急着把全部模块一口气写完。先把类、构造函数和 forward 入口立住，后面的卷积主干、时序整理和 BiLSTM 再逐步补齐。',
      codeLabel: 'CRNN 外壳',
      points: ['先明确这是一个分类模型。', '构造函数里预留卷积主干、时序模块和分类头。', 'forward 先保留接口，后面再补全过程。'],
      snippet: `class BirdSoundCRNN(nn.Module):
    def __init__(self, num_classes: int):
        super().__init__()
        self.num_classes = num_classes

    def forward(self, inputs: torch.Tensor) -> torch.Tensor:
        raise NotImplementedError("先把 ResNet18、BiLSTM 和分类头补齐")`
    },
    {
      id: 'step2',
      label: '第二步',
      title: '先接上 ResNet18 卷积主干',
      intro: 'CRNN 的前半段并不是新造一个特征提取器，而是直接复用已经理解过的 ResNet18 主干。关键仍然是把第一层改成单通道输入。',
      codeLabel: 'ResNet18 主干',
      points: ['把 conv1 改为 1 通道输入。', '保留 stem 和 layer1 到 layer4。', '卷积主干继续负责层级化时频纹理提取。'],
      snippet: `backbone = resnet18(weights=None)
backbone.conv1 = nn.Conv2d(
    1,
    64,
    kernel_size=(7, 7),
    stride=(2, 1),
    padding=(3, 3),
    bias=False,
)
backbone.maxpool = nn.MaxPool2d(kernel_size=3, stride=(2, 1), padding=1)

self.feature_extractor = nn.Sequential(
    backbone.conv1,
    backbone.bn1,
    backbone.relu,
    backbone.maxpool,
    backbone.layer1,
    backbone.layer2,
    backbone.layer3,
    backbone.layer4,
)`
    },
    {
      id: 'step3',
      label: '第三步',
      title: '把二维特征图改成时间序列',
      intro: '卷积主干输出的还是二维特征图，而 BiLSTM 读取的是一串时间向量。所以中间这一步其实就是 CRNN 能否成立的关键桥梁。',
      codeLabel: '序列整理',
      points: ['先沿频率维做平均，压掉高低频位置。', '再把维度变成 Batch × Time × Feature。', 'LayerNorm 可以帮助后续时序编码更稳定。'],
      snippet: `self.sequence_norm = nn.LayerNorm(512)

features = self.feature_extractor(inputs)
features = features.mean(dim=2)
features = features.permute(0, 2, 1)
features = self.sequence_norm(features)`
    },
    {
      id: 'step4',
      label: '第四步',
      title: '接上 BiLSTM 读前后顺序',
      intro: '现在的输入已经不再是图，而是一串按时间排好的特征向量。于是，BiLSTM 终于有了可以读取的“序列”。',
      codeLabel: 'BiLSTM 编码器',
      points: ['input_size 要和卷积特征维度一致。', 'bidirectional=True 表示同时读前向和后向。', 'dropout 用来缓解过拟合。'],
      snippet: `self.temporal_encoder = nn.LSTM(
    input_size=512,
    hidden_size=256,
    num_layers=2,
    batch_first=True,
    bidirectional=True,
    dropout=0.2,
)`
    },
    {
      id: 'step5',
      label: '第五步',
      title: '补上分类头，把整段表示收束成结果',
      intro: 'BiLSTM 输出的是每个时间点上的上下文增强特征。最后还要把它们聚合成整段音频的表示，再交给分类头。',
      codeLabel: '分类头',
      points: ['先把双向输出压到中间维度。', '再用 Dropout 提高泛化。', '最后输出每个类别的分数。'],
      snippet: `self.classifier = nn.Sequential(
    nn.Linear(256 * 2, 256),
    nn.ReLU(),
    nn.Dropout(0.25),
    nn.Linear(256, num_classes),
)`
    },
    {
      id: 'step6',
      label: '第六步',
      title: '把卷积、时序和分类串成完整前向',
      intro: '最后一步就是把前面写好的模块按顺序串起来。到这里，ResNet18 + BiLSTM 这条 CRNN 拓展路线才算真正完成。',
      codeLabel: '完整前向流程',
      points: ['输入先经过 ResNet18 主干。', '中间把特征图整理成时间序列。', 'BiLSTM 编码后在时间维做平均，再送进分类头。'],
      snippet: `def forward(self, inputs: torch.Tensor) -> torch.Tensor:
    features = self.feature_extractor(inputs)
    features = features.mean(dim=2)
    features = features.permute(0, 2, 1)
    features = self.sequence_norm(features)
    features, _ = self.temporal_encoder(features)
    features = features.mean(dim=1)
    return self.classifier(features)`
    }
  ],
  shapes: {
    id: 'shapes',
    title: '最后检查 5 次张量变化',
    description: '只要你能把这五次张量变化说顺，CRNN 就不会沦为“把两个名字拼在一起”。它本质上是一条从图到序列、再从序列到类别的连续流水线。',
    items: [
      { step: '输入', shape: 'B × 1 × 128 × T', note: '一批单通道 Mel 频谱图' },
      { step: '卷积输出', shape: 'B × 512 × F\' × T\'', note: 'ResNet18 提取出的二维时频特征' },
      { step: '频率压缩', shape: 'B × 512 × T\'', note: '沿频率维平均后，只保留每个时间点的特征' },
      { step: '序列整理', shape: 'B × T\' × 512', note: '变成 BiLSTM 可以直接读取的时间序列' },
      { step: '分类输出', shape: 'B × C', note: '得到每个鸟种的分类分数' }
    ],
    stream: ['先让 ResNet18 提取时频纹理', '再把特征图整理成时间序列', '接着交给 BiLSTM 读取前后文', '最后用分类头输出整段判断']
  },
  footer: {
    title: '智聆羽声 · CRNN 进阶页',
    subtitle: '把 ResNet18 + BiLSTM 放进一个可继续深挖的进阶模块'
  }
};