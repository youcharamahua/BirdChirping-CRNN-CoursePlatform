window.CodeLabPageContent = {
  header: {
    brandMark: '码',
    brandName: '智聆羽声',
    brandSubtitle: '主讲模块：从 CNN 到 ResNet 的鸟类音频分类实践',
    nav: [
      { label: '返回首页', href: '/' },
      {
        label: '相关模块',
        children: [
          { label: 'CNN + LSTM 基础台', href: '../cnn-training/index.html' },
          { label: 'CRNN 进阶页', href: '../crnn/index.html' },
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
    eyebrow: '卷积主讲模块',
    title: '从卷积核到',
    accent: 'ResNet',
    lead: '本模块围绕 CNN 到 ResNet 的核心主线展开，重点说明卷积网络如何识别频谱图中的局部模式、卷积特征如何逐层抽象，以及 ResNet 怎样通过残差结构获得更稳定的深层表示。',
    pills: ['先看卷积核', '再看卷积块', '理解残差连接', '最后走到 ResNet18'],
    primaryAction: { label: '先看搭建顺序', href: '#roadmap' },
    secondaryAction: { label: '完成主讲后进入 CNN + LSTM 基础台', href: '../cnn-training/index.html' }
  },
  aside: {
    label: '阅读顺序',
    title: '先懂卷积，再懂残差，最后看 ResNet',
    text: '本页聚焦 CNN 到 ResNet 的核心知识链，不延展开训练服务细节，也不在此页引入时序模块，便于围绕“卷积网络如何升级”形成完整理解。',
    points: ['先把类的外壳写出来，明确输入和输出。', '先用简单卷积理解“模型如何看频谱图”。', '再把卷积块逐层堆叠，观察特征如何变深。', '最后引入残差连接，并升级到 ResNet18 主干。']
  },
  roadmap: {
    id: 'roadmap',
    title: '先记住这 5 个搭建动作',
    description: '如果一上来就看完整 ResNet18，很容易只记住名字。更稳妥的方式，是先从最基本的卷积分类器搭起，再逐步引入更深的卷积块和残差连接，最后再回到完整的 ResNet18。',
    cards: [
      {
        tag: '第 1 步',
        title: '先约定输入和输出',
        text: '先把模型外壳搭起来，明确输入是一张单通道 Mel 频谱图，输出是每个鸟种的分类分数。',
        points: ['输入形状要和频谱图一致。', '输出维度要等于类别数。']
      },
      {
        tag: '第 2 步',
        title: '先写第一个卷积块',
        text: '先用最小卷积块理解卷积核、激活和池化各自负责什么。',
        points: ['卷积核负责找局部模式。', '池化负责压缩空间尺寸。']
      },
      {
        tag: '第 3 步',
        title: '再把卷积层逐步加深',
        text: '当你理解了第一层在做什么，就可以继续堆叠卷积块，观察特征图怎样逐层抽象。',
        points: ['浅层看边缘和纹理。', '深层看更稳定的组合特征。']
      },
      {
        tag: '第 4 步',
        title: '理解残差块为什么存在',
        text: '普通卷积越堆越深时，训练不一定更顺。残差连接的价值，是让深层网络学得更稳。',
        points: ['残差块不是绕过学习。', '它是在帮助网络更容易学到变化量。']
      },
      {
        tag: '第 5 步',
        title: '最后把主干升级成 ResNet18',
        text: '当卷积块和残差块都讲清楚后，再回到完整的 ResNet18，就不会只剩“背模型名字”。',
        points: ['把第一层改成单通道输入。', '保留 ResNet18 的主干特征提取能力。']
      }
    ]
  },
  steps: [
    {
      id: 'step1',
      label: '第一步',
      title: '先把 CNN 分类器的外壳搭起来',
      intro: '任何模型都先从输入输出关系开始。写 CNN 也一样，先把类、构造函数和前向传播入口搭好，后面的卷积层再一点点往里补。',
      codeLabel: '模型外壳',
      points: ['先写出类名，明确这是一个分类模型。', '构造函数里预留特征提取器和分类头。', 'forward 先保留输入输出接口。'],
      snippet: `class BirdSoundCNN(nn.Module):
    def __init__(self, num_classes: int):
        super().__init__()
        self.num_classes = num_classes

    def forward(self, inputs: torch.Tensor) -> torch.Tensor:
        raise NotImplementedError("先把卷积层和分类头一步步补齐")`
    },
    {
      id: 'step2',
      label: '第二步',
      title: '先写第一个卷积块，看清局部特征怎样被提取',
      intro: '这一小段代码的任务，不是直接把效果做到最好，而是帮助你理解：卷积核怎样在频谱图上滑动，ReLU 和池化又怎样让特征更容易被后续层继续利用。',
      codeLabel: '第一个卷积块',
      points: ['卷积层负责提取局部纹理。', 'BatchNorm 和 ReLU 让训练更稳定。', 'MaxPool2d 让特征图尺寸逐步缩小。'],
      snippet: `self.stem = nn.Sequential(
    nn.Conv2d(1, 32, kernel_size=3, padding=1),
    nn.BatchNorm2d(32),
    nn.ReLU(),
    nn.MaxPool2d(kernel_size=2),
)`
    },
    {
      id: 'step3',
      label: '第三步',
      title: '继续叠卷积块，让特征逐层抽象',
      intro: '第一层卷积往往只能看到比较局部、比较浅的模式。继续堆叠卷积块之后，网络才会逐步从纹理走向更稳定的高层特征。',
      codeLabel: '卷积堆叠',
      points: ['通道数逐步增加，表示特征表达能力变强。', '空间尺寸逐步减小，表示网络在压缩无关细节。', '这一步是理解 ResNet 之前的必要过渡。'],
      snippet: `self.features = nn.Sequential(
    self.stem,
    nn.Conv2d(32, 64, kernel_size=3, padding=1),
    nn.BatchNorm2d(64),
    nn.ReLU(),
    nn.MaxPool2d(kernel_size=2),
    nn.Conv2d(64, 128, kernel_size=3, padding=1),
    nn.BatchNorm2d(128),
    nn.ReLU(),
    nn.MaxPool2d(kernel_size=2),
)`
    },
    {
      id: 'step4',
      label: '第四步',
      title: '单独看一个残差块，理解 ResNet 的核心思想',
      intro: '在进入完整 ResNet18 之前，最好先把残差块本身看懂。它最关键的地方，不是多了一条线，而是让网络学习“输入和输出之间的变化量”。',
      codeLabel: '残差块示意',
      points: ['主分支继续做卷积变换。', '捷径分支保留原始信息。', '最后相加，再过激活函数。'],
      snippet: `class ResidualBlock(nn.Module):
    def __init__(self, channels: int):
        super().__init__()
        self.block = nn.Sequential(
            nn.Conv2d(channels, channels, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(channels),
            nn.ReLU(),
            nn.Conv2d(channels, channels, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(channels),
        )
        self.relu = nn.ReLU()

    def forward(self, inputs: torch.Tensor) -> torch.Tensor:
        residual = inputs
        outputs = self.block(inputs)
        outputs = outputs + residual
        return self.relu(outputs)`
    },
    {
      id: 'step5',
      label: '第五步',
      title: '把卷积主干升级成 ResNet18',
      intro: '当你已经知道普通卷积块和残差块分别在做什么，再看完整 ResNet18，就会更清楚：它其实是在一层层残差阶段中逐步提取更深的时频特征。',
      codeLabel: 'ResNet18 主干',
      points: ['先把 conv1 改成 1 通道输入。', '去掉原始全连接层，保留卷积主干。', '最后自己接分类头。'],
      snippet: `backbone = resnet18(weights=None)
backbone.conv1 = nn.Conv2d(
    1,
    64,
    kernel_size=(7, 7),
    stride=(2, 1),
    padding=(3, 3),
    bias=False,
)

self.feature_extractor = nn.Sequential(
    backbone.conv1,
    backbone.bn1,
    backbone.relu,
    backbone.maxpool,
    backbone.layer1,
    backbone.layer2,
    backbone.layer3,
    backbone.layer4,
)
self.classifier = nn.Linear(512, num_classes)`
    },
    {
      id: 'step6',
      label: '第六步',
      title: '把 ResNet18 主干和分类头串成完整前向',
      intro: '最后一步，就是把前面已经理解过的部分连起来。输入经过 ResNet18 主干后，做全局平均池化、展平，再送进分类头。到这里，一条完整的 CNN 到 ResNet 主线就闭合了。',
      codeLabel: '完整前向流程',
      points: ['输入先经过 ResNet18 主干。', '特征图通过全局平均池化压成向量。', '最后由线性层输出每个类别的分数。'],
      snippet: `def forward(self, inputs: torch.Tensor) -> torch.Tensor:
    features = self.feature_extractor(inputs)
    features = features.mean(dim=(2, 3))
    return self.classifier(features)`
    }
  ],
  shapes: {
    id: 'shapes',
    title: '最后检查 5 次张量变化',
    description: '如果这条形状链能讲清楚，CNN 到 ResNet 的主线就不会乱。你会看到：输入先是图，经过卷积和残差阶段后仍然是图，直到全局池化之后才真正变成分类向量。',
    items: [
      { step: '输入', shape: 'B × 1 × 128 × T', note: '一批单通道 Mel 频谱图' },
      { step: '浅层卷积', shape: 'B × 32 × 64 × T / 2', note: '第一层卷积开始提取局部纹理' },
      { step: '深层特征', shape: 'B × 128 × H\' × W\'', note: '卷积堆叠后特征变深，空间尺寸继续缩小' },
      { step: 'ResNet18 输出', shape: 'B × 512 × F\' × T\'', note: '残差主干提取出的高层时频特征' },
      { step: '分类输出', shape: 'B × C', note: '全局平均池化后送入线性分类头' }
    ],
    stream: ['先把声音变成频谱图', '再让卷积核提取局部纹理', '接着通过残差阶段走向更深特征', '最后用全局池化和分类头输出结果']
  },
  footer: {
    title: '智聆羽声 · CNN / ResNet 详解页',
    subtitle: '把 CNN 与 ResNet 拆成能自己一步步写出来的课堂代码'
  }
};
