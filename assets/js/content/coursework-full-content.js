window.CourseworkFullPageContent = {
  header: {
    brandMark: '书',
    brandName: '智聆羽声',
    brandSubtitle: 'LSTM 三阶段实验路径完整任务书',
    nav: [
      { label: '返回首页', href: '/' },
      {
        label: '相关模块',
        children: [
          { label: 'CNN + LSTM 基础台', href: '../cnn-training/index.html' },
          { label: 'ResNet18 + BiLSTM 深入进阶台', href: '../training/index.html' },
          { label: 'CNN + Transformer 探索进阶台', href: '../transformer-training/index.html' },
          { label: '作业导航', href: '../coursework/index.html' }
        ]
      },
      {
        label: '页内导览',
        children: [
          { label: '阅读说明', href: '#guide' },
          { label: '总说明', href: '#overview' },
          { label: '基础版', href: '#basic' },
          { label: '深入版', href: '#deep' },
          { label: '探索版', href: '#explore' }
        ]
      }
    ]
  },
  sidebar: {
    title: '完整任务书导航',
    copy: '本页将课程作业总说明与三档任务书整合到同一页面中，便于集中阅读、投屏讲解和课堂跳转。',
    items: [
      { title: '阅读说明', subtitle: '先了解本页的使用方式', href: '#guide', order: '00' },
      { title: '作业总说明', subtitle: '定位、路径、共同要求与评价关注点', href: '#overview', order: '01' },
      { title: '基础版', subtitle: 'CNN + LSTM 基线闭环', href: '#basic', order: '02' },
      { title: '深入版', subtitle: 'ResNet18 + BiLSTM 结构升级', href: '#deep', order: '03' },
      { title: '探索版', subtitle: 'CNN + Transformer 比较任务', href: '#explore', order: '04' }
    ],
    noteTitle: '阅读建议',
    noteText: '首次使用时建议先通读总说明，再从基础层开始；已经完成前一层实验的学习者，可直接进入对应训练平台继续下一层任务。',
    notePoints: [
      '先看总说明中的共同要求，再决定从哪一档进入。',
      '阅读任务书时同步打开对应实验台，边看边对应结构和实验观察。',
      '如果要做课后展示或答辩，本页更适合集中投屏讲解。'
    ]
  },
  hero: {
    eyebrow: '完整任务书',
    title: '课程作业完整任务书',
    text: '本页将课程作业总说明、基础层、深入层和探索层任务整合为一个可直接滚动浏览的完整页面，并与首页及三套实验平台保持统一的学习路径。',
    meta: ['4 份内容整合', '适合课堂投屏', '支持侧边快速定位', '与三套训练台互相联动']
  },
  jumpCards: [
    { eyebrow: '总说明', title: '先看作业总说明', text: '先确认三档路径与课程内容的对应关系及共同要求。', href: '#overview' },
    { eyebrow: '基础层', title: '打开 CNN + LSTM 基础台', text: '边看基础层任务书，边对照基础实验台。', href: '../cnn-training/index.html' },
    { eyebrow: '深入层', title: '打开 ResNet18 + BiLSTM 深入进阶台', text: '边看深入层任务书，边进行结构比较。', href: '../training/index.html' },
    { eyebrow: '探索层', title: '打开 CNN + Transformer 探索进阶台', text: '边看探索层任务书，边组织探索问题。', href: '../transformer-training/index.html' },
    { eyebrow: '导航页', title: '回到作业导航页', text: '如需更简洁的入口版式，可回到导航页快速确定学习路径。', href: '../coursework/index.html' }
  ],
  sections: [
    {
      id: 'guide',
      label: '阅读说明',
      title: '先按三层实验路径来使用这页',
      brief: '本页围绕三套训练平台统一组织，便于将任务要求与实验入口对应起来。',
      actions: [
        { label: '打开 CNN + LSTM 基础台', href: '../cnn-training/index.html' },
        { label: '打开 ResNet18 + BiLSTM 深入进阶台', href: '../training/index.html' },
        { label: '打开 CNN + Transformer 探索进阶台', href: '../transformer-training/index.html' }
      ],
      html: `
        <div class="highlight-box">
          <span class="sub-label">使用提示</span>
          <p>本页建议按三层来阅读：<strong>基础版</strong>先建立 CNN + LSTM 的最小闭环；<strong>深入版</strong>再用 ResNet18 + BiLSTM 做结构升级与比较；<strong>探索版</strong>最后用 CNN + Transformer 组织更像小研究的问题。</p>
        </div>
        <div class="sub-block">
          <span class="sub-label">建议顺序</span>
          <ol>
            <li>先用基础版建立最小闭环，理解卷积提特征和 LSTM 读顺序的分工。</li>
            <li>再用深入版比较更强卷积主干和双向时序编码是否真的带来提升。</li>
            <li>最后在探索版中把 Transformer 当作扩展结构，讨论注意力机制是否值得引入。</li>
          </ol>
        </div>
      `
    },
    {
      id: 'overview',
      label: '作业总说明',
      title: '课程作业总说明：从鸟鸣到结构解释',
      brief: '本部分主要说明三档路径的课程定位，以及无论选择哪一层都需要保留哪些过程性学习证据。',
      actions: [
        { label: '打开 CNN + LSTM 基础台', href: '../cnn-training/index.html' },
        { label: '打开 ResNet18 + BiLSTM 深入进阶台', href: '../training/index.html' },
        { label: '打开 CNN + Transformer 探索进阶台', href: '../transformer-training/index.html' }
      ],
      html: `
        <div class="highlight-box">
          <span class="sub-label">阅读提示</span>
          <p>课程与平台结构已统一为三条实验路径：<strong>CNN + LSTM</strong> 负责基础闭环，<strong>ResNet18 + BiLSTM</strong> 负责深入比较，<strong>CNN + Transformer</strong> 负责探索扩展。网页内容已直接整合这些任务要求，便于集中阅读与跳转。</p>
        </div>
        <div class="sub-block">
          <span class="sub-label">一、作业定位</span>
          <p>本课程作业不再采用“一份要求覆盖所有同学”的写法，而是拆分为三个难度层级，分别对应三套实验台。</p>
          <p>本次作业的核心不只是“训练出一个模型”，而是完成以下三个层面的转变：</p>
          <ol>
            <li>从“听见鸟鸣”走向“理解声音如何被表示”。</li>
            <li>从“会跑一个模型”走向“能解释为什么这样设计”。</li>
            <li>从“看到一个结果”走向“能分析结果为什么会这样”。</li>
          </ol>
        </div>
        <div class="sub-block">
          <span class="sub-label">二、三档路径与课程内容的对应关系</span>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>路径</th>
                  <th>对应平台描述</th>
                  <th>对应课程内容重点</th>
                  <th>适合人群</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>基础版</td>
                  <td>先把全流程跑通</td>
                  <td>CNN + LSTM、声音变图、最小闭环</td>
                  <td>第一次接触音频分类或时序模型的同学</td>
                </tr>
                <tr>
                  <td>深入版</td>
                  <td>进入结构升级与比较</td>
                  <td>ResNet18 + BiLSTM、结构比较、结果解释</td>
                  <td>已能完成基线模型，希望做有效比较的同学</td>
                </tr>
                <tr>
                  <td>探索版</td>
                  <td>把实验推进成小研究</td>
                  <td>CNN + Transformer、注意力机制、误差分析</td>
                  <td>希望继续比较更复杂时序结构的同学</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="sub-block">
          <span class="sub-label">三、所有版本共同要求</span>
          <ol>
            <li>先写出问题清单，而不是直接开写代码。</li>
            <li>按阶段记录过程，而不是等全部完成后再回忆补写。</li>
            <li>保留关键结果材料、错误分析和结论说明。</li>
            <li>如使用 LLM，请保留关键提问、采纳理由和修正过程。</li>
          </ol>
        </div>
      `
    },
    {
      id: 'basic',
      label: '基础版任务书',
      title: '基础版：从声音表示到 CNN + LSTM 可解释结果',
      brief: '基础版承担的是整门课程最关键的起步任务。重点不是一开始追求复杂结构，而是让学生第一次真正建立“卷积提取局部特征，LSTM 继续读取时间顺序”的完整认知闭环。',
      actions: [
        { label: '对照 CNN + LSTM 数据集展示', href: '../cnn-training/index.html#dataset' },
        { label: '回看作业导航页', href: '../coursework/index.html#basic' }
      ],
      html: `
        <div class="sub-block">
          <span class="sub-label">一、任务定位</span>
          <p>基础版承担的任务是：帮助你第一次真正建立“鸟鸣如何一步步变成分类结果”的完整认识。</p>
          <p>本部分对应课程中的前三层核心内容：</p>
          <ol>
            <li>声音为什么要先转成频谱图。</li>
            <li>CNN 怎样从频谱图中提取局部特征。</li>
            <li>LSTM 为什么还要继续读取时间顺序。</li>
          </ol>
        </div>
        <div class="sub-block">
          <span class="sub-label">二、建议推进方式</span>
          <ol>
            <li>先写一段任务理解，明确你最不确定的问题。</li>
            <li>建立样本台账，观察鸟种、时长、噪声和样本质量。</li>
            <li>把“声音变图”讲清楚，说明为什么选择 Mel 频谱图。</li>
            <li>搭建 CNN + LSTM 基线模型，明确两部分各自负责什么。</li>
            <li>完成第一次训练，记录曲线、观察和第一轮解释。</li>
            <li>做第一次错误分析，判断模型更依赖哪些局部纹理和顺序线索。</li>
          </ol>
        </div>
        <div class="sub-block">
          <span class="sub-label">三、本层产出</span>
          <ol>
            <li>任务理解与问题清单。</li>
            <li>样本统计与数据风险判断。</li>
            <li>输入表示说明与示意图。</li>
            <li>CNN + LSTM 模型说明、训练曲线与第一轮结果摘要。</li>
            <li>至少一组错误样本分析。</li>
          </ol>
        </div>
      `
    },
    {
      id: 'deep',
      label: '深入版任务书',
      title: '深入版：从 CNN + LSTM 走到 ResNet18 + BiLSTM',
      brief: '深入版的目标不是简单换一个更复杂的模型，而是解释为什么更强卷积主干和双向时序上下文有可能带来提升。',
      actions: [
        { label: '打开 ResNet18 + BiLSTM 深入进阶台', href: '../training/index.html' },
        { label: '回看作业导航页', href: '../coursework/index.html#deep' }
      ],
      html: `
        <div class="sub-block">
          <span class="sub-label">一、任务定位</span>
          <p>深入版的核心，不是“换模型冲更高分”，而是回答两个更重要的问题：为什么基础版还不够，以及 ResNet18 + BiLSTM 这条升级路线到底解决了什么。</p>
        </div>
        <div class="sub-block">
          <span class="sub-label">二、建议推进方式</span>
          <ol>
            <li>先复盘基础版，明确 CNN + LSTM 的瓶颈是什么。</li>
            <li>重新定义目标：你要验证的是更强卷积主干和双向上下文是否真的更稳、更有解释力。</li>
            <li>讲清 ResNet18 与 BiLSTM 各自补足了什么。</li>
            <li>在控制变量的前提下比较基础版与深入版。</li>
            <li>解释结果变化，并把结构讲成一条完整数据流。</li>
          </ol>
        </div>
        <div class="sub-block">
          <span class="sub-label">三、本层产出</span>
          <ol>
            <li>基础版复盘与升级理由。</li>
            <li>ResNet18 + BiLSTM 结构说明图。</li>
            <li>控制变量下的比较设计表。</li>
            <li>基础版与深入版的对比结果。</li>
            <li>对“提升来自哪里”的结构化分析。</li>
          </ol>
        </div>
      `
    },
    {
      id: 'explore',
      label: '探索版任务书',
      title: '探索版：把 CNN + Transformer 推进成比较研究',
      brief: '探索版不鼓励无目标地堆模型。更合理的做法，是在前两层已经学完之后，再明确一个问题，讨论注意力机制是否真的值得引入。',
      actions: [
        { label: '打开 CNN + Transformer 探索进阶台', href: '../transformer-training/index.html' },
        { label: '回看作业导航页', href: '../coursework/index.html#explore' }
      ],
      html: `
        <div class="sub-block">
          <span class="sub-label">一、任务定位</span>
          <p>探索版的重点不是“结构越复杂越好”，而是当你已经真正理解了前两层模型之后，再继续追问：注意力机制是否真的更适合当前任务，或者它的收益是否足以覆盖代价。</p>
        </div>
        <div class="sub-block">
          <span class="sub-label">二、建议推进方式</span>
          <ol>
            <li>先提出一个像样的问题，例如 Transformer 是否真的改善了长程依赖建模。</li>
            <li>回顾前两层结果，避免盲目加模块。</li>
            <li>解释为什么要进入 Transformer，而不是把它当成默认主线。</li>
            <li>在同一数据与评价方式下比较三套结构。</li>
            <li>把现象收束成结论、局限与后续设想。</li>
          </ol>
        </div>
        <div class="sub-block">
          <span class="sub-label">三、本层产出</span>
          <ol>
            <li>明确研究问题与初步假设。</li>
            <li>进入 Transformer 的理由说明。</li>
            <li>多组结果对照与可信度判断。</li>
            <li>典型错误案例和错误链分析。</li>
            <li>正式结论、局限与后续改进建议。</li>
          </ol>
        </div>
      `
    }
  ]
};
