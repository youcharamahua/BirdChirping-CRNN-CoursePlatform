(function () {
  var content = window.TrainingPageContent;
  var shell = window.SiteShell;
  var api = window.PlatformApi;
  var pollTimer = null;
  var uploadPreviewUrl = null;
  var blueprintScale = 1;
  var blueprintScrollLeft = 0;
  var blueprintScrollTop = 0;
  var latestStatus = null;
  var latestBlueprint = null;
  var flowPlaybackIndex = 0;
  var flowPlaybackTimer = null;

  function safeNumber(value, digits) {
    if (typeof value !== 'number' || !isFinite(value)) {
      return '--';
    }
    return value.toFixed(digits == null ? 4 : digits);
  }

  function formatSplitStrategy(value) {
    var normalized = String(value || '').trim();
    if (!normalized) {
      return '--';
    }
    if (normalized === 'class_stratified_segments') {
      return '按类内片段分层';
    }
    return normalized;
  }

  function formatStageLabel(value) {
    var normalized = String(value || '').trim();
    var labels = {
      idle: '空闲',
      training: '训练中',
      completed: '已完成',
      stopped: '已停止',
      failed: '训练失败'
    };
    return labels[normalized] || (normalized || '--');
  }

  function studioConfig() {
    return content.sections && content.sections.studio ? content.sections.studio : {};
  }

  function phaseItems() {
    var configured = studioConfig().phases;
    if (configured && configured.length) {
      return configured;
    }
    return [
      { id: 'input', label: '音频输入' },
      { id: 'window', label: '统一与切片' },
      { id: 'mel', label: 'Mel 频谱图' },
      { id: 'resnet', label: 'ResNet18' },
      { id: 'bilstm', label: 'BiLSTM' },
      { id: 'head', label: '分类头' }
    ];
  }

  function renderHero(hero) {
    var pills = hero.pills.map(function (item) {
      return '<span>' + item + '</span>';
    }).join('');

    return [
      '<section class="training-hero">',
      '  <div class="hero-copy">',
      '    <span class="eyebrow">' + hero.eyebrow + '</span>',
      '    <h1>' + hero.title + '<span>' + hero.accent + '</span></h1>',
      '    <p>' + hero.lead + '</p>',
      '    <div class="hero-actions">',
      '      <a class="button button-primary" href="' + hero.primaryAction.href + '">' + hero.primaryAction.label + '</a>',
      '      <a class="button button-secondary" href="' + hero.secondaryAction.href + '">' + hero.secondaryAction.label + '</a>',
      '    </div>',
      '    <div class="hero-pills">' + pills + '</div>',
      '  </div>',
      '  <div class="hero-metrics" id="hero-metrics">',
      '    <div class="metric-card"><small>数据集</small><strong>加载中</strong><span>准备鸟类目录</span></div>',
      '    <div class="metric-card"><small>活跃模型</small><strong>加载中</strong><span>检查权重状态</span></div>',
      '    <div class="metric-card"><small>训练状态</small><strong>待连接</strong><span>等待 API</span></div>',
      '  </div>',
      '</section>'
    ].join('');
  }

  function renderWorkspace() {
    var studio = studioConfig();
    return [
      '<section class="training-section" id="studio">',
      '  <div class="section-heading">',
      '    <h2>' + content.sections.studio.title + '</h2>',
      '    <p>' + content.sections.studio.description + '</p>',
      '  </div>',
      '  <div class="workspace-stage">',
      '    <aside class="stack-column workspace-side workspace-side-left">',
      '      <article class="lab-panel" id="control">',
      '        <div class="panel-head">',
      '          <div><span class="kicker">训练控制</span><h3>训练控制台</h3></div>',
      '          <span class="status-tag">可操作</span>',
      '        </div>',
      '        <div class="panel-body">',
      '          <form class="control-form" id="train-form">',
      '            <div class="field-grid">',
      '              <label><span>训练轮数</span><input name="epochs" type="number" min="1" max="80" value="12"></label>',
      '              <label><span>批大小</span><input name="batch_size" type="number" min="1" max="64" value="6"></label>',
      '              <label><span>学习率</span><input name="learning_rate" type="number" step="0.0001" min="0.0001" value="0.0003"></label>',
      '              <label><span>验证占比</span><input name="val_split" type="number" step="0.01" min="0.1" max="0.4" value="0.2"></label>',
      '              <label><span>每条音频片段数</span><input name="segments_per_file" type="number" min="1" max="64" value="12"></label>',
      '              <label><span>随机种子</span><input name="seed" type="number" min="0" value="42"></label>',
      '            </div>',
      '            <div class="panel-actions">',
      '              <button class="button button-primary" type="submit" id="start-training-btn">启动训练</button>',
      '              <button class="button button-secondary" type="button" id="stop-training-btn">停止训练</button>',
      '            </div>',
      '          </form>',
      '          <p class="helper-copy">' + (studio.helperText || '训练以标准化后的 90 秒编号音频为底座，并在每个 epoch 内按文件随机抽取多个 3 秒片段。') + '</p>',
      '        </div>',
      '      </article>',
      '      <article class="lab-panel">',
      '        <div class="panel-head">',
      '          <div><span class="kicker">训练状态</span><h3>运行状态与日志</h3></div>',
      '          <span class="status-tag" id="runtime-stage">空闲</span>',
      '        </div>',
      '        <div class="panel-body">',
      '          <div id="runtime-cards"></div>',
      '          <div class="log-list" id="runtime-logs"></div>',
      '        </div>',
      '      </article>',
      '    </aside>',
      '    <article class="lab-panel lab-panel-dark blueprint-shell workspace-blueprint">',
      '      <div class="panel-head panel-head-dark">',
      '        <div><span class="kicker">结构图</span><h3>' + (studio.blueprintTitle || '教学结构图') + '</h3></div>',
      '        <span class="status-tag status-tag-dark" id="blueprint-tag">准备中</span>',
      '      </div>',
      '      <div class="panel-body" id="blueprint-panel"></div>',
      '    </article>',
      '    <aside class="stack-column workspace-side workspace-side-right">',
      '      <article class="lab-panel metrics-panel">',
      '        <div class="panel-head">',
      '          <div><span class="kicker">训练曲线</span><h3>训练曲线与进度</h3></div>',
      '          <span class="status-tag">已记录</span>',
      '        </div>',
      '        <div class="panel-body charts-layout">',
      '          <div class="chart-card"><div class="chart-title">训练损失 / 验证损失</div><div id="loss-chart"></div></div>',
      '          <div class="chart-card"><div class="chart-title">验证准确率</div><div id="accuracy-chart"></div></div>',
      '          <div class="timeline-card" id="phase-track"></div>',
      '        </div>',
      '      </article>',
      '      <article class="lab-panel" id="inference">',
      '        <div class="panel-head">',
      '          <div><span class="kicker">音频识别</span><h3>上传音频文件</h3></div>',
      '          <span class="status-tag">可上传</span>',
      '        </div>',
      '        <div class="panel-body">',
      '          <form class="control-form" id="inference-form">',
      '            <label><span>音频文件</span><input id="inference-file" type="file" accept=".wav,.mp3,.flac,.m4a,.aac,.ogg"></label>',
      '            <div class="panel-actions">',
      '              <button class="button button-primary" type="submit" id="analyze-btn">开始识别</button>',
      '            </div>',
      '          </form>',
      '          <audio id="upload-preview" controls class="upload-preview is-hidden"></audio>',
      '          <div id="inference-result" class="inference-result"></div>',
      '        </div>',
      '      </article>',
      '    </aside>',
      '  </div>',
      '</section>'
    ].join('');
  }

  function renderDatasetGallery() {
    var resourceLink = content.sections.dataset.link;
    var footer = resourceLink
      ? [
          '<div class="dataset-credit">',
          '  <strong>' + resourceLink.label + '</strong>',
          '  <a href="' + resourceLink.href + '" target="_blank" rel="noreferrer">打开 XC 资源平台</a>',
          '  <p>' + resourceLink.note + '</p>',
          '</div>'
        ].join('')
      : '';
    return [
      '<section class="training-section" id="dataset">',
      '  <div class="section-heading">',
      '    <h2>' + content.sections.dataset.title + '</h2>',
      '    <p>' + content.sections.dataset.description + '</p>',
      '  </div>',
      '  <article class="lab-panel dataset-overview-panel">',
      '    <div class="panel-head">',
      '      <div><span class="kicker">数据概览</span><h3>数据集概览</h3></div>',
      '      <span class="status-tag">已准备</span>',
      '    </div>',
      '    <div class="panel-body" id="dataset-summary-panel"></div>',
      '  </article>',
      '  <div class="species-gallery" id="species-gallery"></div>',
      footer,
      '</section>'
    ].join('');
  }

  function renderMetricCards(overview, health, status) {
    var items = [
      { label: '标准类目', value: overview.summary.class_count, note: '来自映射文件' },
      { label: '活跃模型', value: health.active_model, note: health.model_ready ? '已可推理' : '等待训练' },
      { label: '训练状态', value: formatStageLabel(status.stage), note: status.running ? '后台任务运行中' : '当前无训练线程' }
    ];

    return items.map(function (item) {
      return '<div class="metric-card"><small>' + item.label + '</small><strong>' + item.value + '</strong><span>' + item.note + '</span></div>';
    }).join('');
  }

  function renderDatasetSummary(overview) {
    var names = overview.species.map(function (item) {
      return '<span>' + item.id + ' · ' + item.name + '</span>';
    }).join('');

    return [
      '<div class="summary-grid">',
      '  <div class="summary-item"><strong>' + overview.summary.class_count + '</strong><span>分类总数</span></div>',
      '  <div class="summary-item"><strong>' + overview.summary.raw_audio_files + '</strong><span>原始音频</span></div>',
      '  <div class="summary-item"><strong>' + overview.summary.standardized_audio_files + '</strong><span>标准音频</span></div>',
      '  <div class="summary-item"><strong>' + overview.summary.spectrogram_files + '</strong><span>频谱预览</span></div>',
      '</div>',
      '<div class="pill-stream">' + names + '</div>'
    ].join('');
  }

  function renderSpeciesGallery(species) {
    return species.map(function (item) {
      var image = item.image_url
        ? '<div class="species-image"><img src="' + item.image_url + '" alt="' + item.name + '"></div>'
        : '<div class="species-image"><div class="empty-state">暂无图片</div></div>';
      var previewAudio = item.audio_url
        ? '<div class="preview-panel is-visible" data-preview="audio"><audio controls src="' + item.audio_url + '"></audio></div>'
        : '<div class="preview-panel is-visible" data-preview="audio"><div class="empty-state">暂无标准音频</div></div>';
      var previewSpec = item.spectrogram_url
        ? '<div class="preview-panel" data-preview="spectrogram"><img src="' + item.spectrogram_url + '" alt="' + item.name + '频谱图"></div>'
        : '<div class="preview-panel" data-preview="spectrogram"><div class="empty-state">暂无频谱图</div></div>';
      return [
        '<article class="species-card" data-species-id="' + item.id + '">',
        '  <div class="species-overview">',
        '    <div class="species-head"><span class="species-id">' + item.id + '</span><div class="species-copy"><h3>' + item.name + '</h3><p>原始样本 ' + item.raw_sample_count + ' 条</p></div></div>',
        '    <div class="species-media">' + image + '</div>',
        '    <div class="source-caption">来源：' + (item.raw_sources.length ? item.raw_sources.join(' / ') : '暂无原始来源') + '</div>',
        '  </div>',
        '  <div class="species-preview">',
        '    <div class="species-meta"><span>标准化音频可直接试听</span><span>频谱预览支持切换查看</span></div>',
        '    <div class="species-tabs">',
        '      <button class="tab-button is-active" type="button" data-role="preview-toggle" data-view="audio">播放音频</button>',
        '      <button class="tab-button" type="button" data-role="preview-toggle" data-view="spectrogram">查看频谱</button>',
        '    </div>',
        '    <div class="preview-stack">',
        previewAudio,
        previewSpec,
        '    </div>',
        '  </div>',
        '</article>'
      ].join('');
    }).join('');
  }

  function buildChartSvg(seriesCollection, config) {
    var maxLength = 0;
    var minValue = config && typeof config.min === 'number' ? config.min : Infinity;
    var maxValue = config && typeof config.max === 'number' ? config.max : -Infinity;

    seriesCollection.forEach(function (series) {
      maxLength = Math.max(maxLength, series.values.length);
      series.values.forEach(function (value) {
        minValue = Math.min(minValue, value);
        maxValue = Math.max(maxValue, value);
      });
    });

    if (!maxLength || minValue === Infinity || maxValue === -Infinity) {
      return '<div class="chart-empty">等待训练数据</div>';
    }

    if (minValue === maxValue) {
      minValue = minValue - 1;
      maxValue = maxValue + 1;
    }

    var gridLines = [0.2, 0.4, 0.6, 0.8].map(function (ratio) {
      var y = 160 - ratio * 140 - 10;
      return '<line x1="12" y1="' + y + '" x2="348" y2="' + y + '" class="chart-grid"></line>';
    }).join('');

    var lines = seriesCollection.map(function (series) {
      var points = series.values.map(function (value, index) {
        var x = maxLength === 1 ? 180 : 20 + (320 * index / (maxLength - 1));
        var yRatio = (value - minValue) / (maxValue - minValue);
        var y = 160 - yRatio * 140 - 10;
        return x + ',' + y;
      }).join(' ');
      return '<polyline class="chart-line ' + series.className + '" points="' + points + '"></polyline>';
    }).join('');

    return [
      '<svg class="chart-svg" viewBox="0 0 360 170" preserveAspectRatio="none">',
      gridLines,
      '<line x1="12" y1="150" x2="348" y2="150" class="chart-axis"></line>',
      lines,
      '</svg>'
    ].join('');
  }

  function renderCharts(history) {
    document.getElementById('loss-chart').innerHTML = buildChartSvg([
      { values: history.train_loss || [], className: 'train-line' },
      { values: history.val_loss || [], className: 'val-line' }
    ]);

    document.getElementById('accuracy-chart').innerHTML = buildChartSvg([
      { values: history.val_accuracy || [], className: 'acc-line' }
    ], { min: 0, max: 1 });
  }

  function renderPhaseTrack() {
    var phases = phaseItems();
    return phases.map(function (item, index) {
      return '<span class="phase-chip" data-phase-index="' + index + '">' + item.label + '</span>';
    }).join('');
  }

  function phaseOrder() {
    return phaseItems().map(function (item) {
      return item.id;
    });
  }

  function phaseLabel(phaseId) {
    var matched = phaseItems().filter(function (item) {
      return item.id === phaseId;
    })[0];
    return matched ? matched.label : '等待数据流';
  }

  function nodePhaseIndex(node) {
    var phases = node.phases || [node.id];
    var order = phaseOrder();
    var indexes = phases.map(function (item) {
      return order.indexOf(item);
    }).filter(function (item) {
      return item >= 0;
    });
    return indexes.length ? indexes[0] : -1;
  }

  function playbackPhaseIndex() {
    var order = phaseOrder();
    return order.length ? flowPlaybackIndex % order.length : -1;
  }

  function playbackPhaseId() {
    var order = phaseOrder();
    var index = playbackPhaseIndex();
    return index >= 0 ? order[index] : '';
  }

  function nodeIsActive(node) {
    var phases = node.phases || [node.id];
    var current = playbackPhaseId();
    return current ? phases.indexOf(current) >= 0 : false;
  }

  function nodeIsReady(node) {
    var currentIndex = playbackPhaseIndex();
    var index = nodePhaseIndex(node);
    return index >= 0 && currentIndex > index;
  }

  function edgeTargetPhaseIndex(edge, blueprint) {
    var targetIndex = -1;
    blueprint.nodes.forEach(function (node) {
      if (node.id === edge.to) {
        targetIndex = nodePhaseIndex(node);
      }
    });
    return targetIndex;
  }

  function stageWidth() {
    return 2320;
  }

  function stageHeight() {
    return 560;
  }

  function applyPhaseTrackState() {
    var currentIndex = playbackPhaseIndex();
    Array.prototype.forEach.call(document.querySelectorAll('#phase-track .phase-chip'), function (chip, index) {
      chip.classList.toggle('is-ready', currentIndex > index);
      chip.classList.toggle('is-active', currentIndex === index);
    });
  }

  function applyBlueprintPlaybackState(blueprint) {
    var currentIndex = playbackPhaseIndex();
    var currentPhase = playbackPhaseId();
    var labelTarget = document.getElementById('flow-status-current');
    if (labelTarget) {
      labelTarget.textContent = phaseLabel(currentPhase);
    }

    blueprint.nodes.forEach(function (node) {
      var target = document.querySelector('[data-node-id="' + node.id + '"]');
      if (!target) {
        return;
      }
      var active = nodeIsActive(node);
      var ready = nodeIsReady(node);
      target.classList.toggle('is-active', active);
      target.classList.toggle('is-ready', ready && !active);
    });

    blueprint.edges.forEach(function (edge) {
      var target = document.querySelector('[data-edge-to="' + edge.to + '"]');
      if (!target) {
        return;
      }
      var targetIndex = edgeTargetPhaseIndex(edge, blueprint);
      target.classList.toggle('is-active', currentIndex === targetIndex);
      target.classList.toggle('is-ready', currentIndex > targetIndex);
    });
  }

  function refreshFlowPlayback() {
    if (!latestStatus) {
      return;
    }
    applyPhaseTrackState();
    if (latestBlueprint) {
      applyBlueprintPlaybackState(latestBlueprint);
    }
  }

  function startFlowPlayback() {
    if (flowPlaybackTimer) {
      return;
    }
    flowPlaybackTimer = window.setInterval(function () {
      var order = phaseOrder();
      if (!order.length) {
        return;
      }
      flowPlaybackIndex = (flowPlaybackIndex + 1) % order.length;
      refreshFlowPlayback();
    }, 1200);
  }

  function nodeWidthPixels(node) {
    return Math.max(140, Math.round((node.width || 10) / 100 * stageWidth() * 0.64));
  }

  function nodeCenter(node) {
    return {
      x: node.x / 100 * stageWidth(),
      y: node.y / 100 * stageHeight()
    };
  }

  function edgePath(from, to) {
    var start = nodeCenter(from);
    var end = nodeCenter(to);
    var startX = start.x + nodeWidthPixels(from) / 2 - 10;
    var endX = end.x - nodeWidthPixels(to) / 2 + 10;
    var deltaX = Math.max(40, endX - startX);
    var controlOffset = Math.min(120, Math.max(28, deltaX * 0.32));
    return [
      'M', startX, start.y,
      'C', startX + controlOffset, start.y,
      endX - controlOffset, end.y,
      endX, end.y
    ].join(' ');
  }

  function captureBlueprintViewport() {
    var viewport = document.getElementById('blueprint-viewport');
    if (!viewport) {
      return;
    }
    blueprintScrollLeft = viewport.scrollLeft;
    blueprintScrollTop = viewport.scrollTop;
  }

  function applyBlueprintScale() {
    var stage = document.getElementById('blueprint-stage');
    var value = Math.max(0.75, Math.min(1.75, blueprintScale));
    blueprintScale = Number(value.toFixed(2));
    if (!stage) {
      return;
    }
    stage.style.setProperty('--blueprint-scale', String(blueprintScale));
    var label = document.getElementById('blueprint-zoom-label');
    if (label) {
      label.textContent = Math.round(blueprintScale * 100) + '%';
    }
  }

  function restoreBlueprintViewport() {
    var viewport = document.getElementById('blueprint-viewport');
    if (!viewport) {
      return;
    }
    applyBlueprintScale();
    viewport.scrollLeft = blueprintScrollLeft;
    viewport.scrollTop = blueprintScrollTop;
  }

  function bindBlueprintControls() {
    var viewport = document.getElementById('blueprint-viewport');
    var zoomIn = document.getElementById('blueprint-zoom-in');
    var zoomOut = document.getElementById('blueprint-zoom-out');
    var reset = document.getElementById('blueprint-zoom-reset');
    if (!viewport || !zoomIn || !zoomOut || !reset) {
      return;
    }

    var pointerState = null;

    viewport.addEventListener('scroll', function () {
      blueprintScrollLeft = viewport.scrollLeft;
      blueprintScrollTop = viewport.scrollTop;
    });

    viewport.addEventListener('pointerdown', function (event) {
      pointerState = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        left: viewport.scrollLeft,
        top: viewport.scrollTop
      };
      viewport.classList.add('is-dragging');
      viewport.setPointerCapture(event.pointerId);
    });

    viewport.addEventListener('pointermove', function (event) {
      if (!pointerState || pointerState.id !== event.pointerId) {
        return;
      }
      viewport.scrollLeft = pointerState.left - (event.clientX - pointerState.x);
      viewport.scrollTop = pointerState.top - (event.clientY - pointerState.y);
    });

    function releasePointer(event) {
      if (!pointerState || pointerState.id !== event.pointerId) {
        return;
      }
      pointerState = null;
      viewport.classList.remove('is-dragging');
      if (viewport.hasPointerCapture(event.pointerId)) {
        viewport.releasePointerCapture(event.pointerId);
      }
      blueprintScrollLeft = viewport.scrollLeft;
      blueprintScrollTop = viewport.scrollTop;
    }

    viewport.addEventListener('pointerup', releasePointer);
    viewport.addEventListener('pointercancel', releasePointer);
    viewport.addEventListener('pointerleave', function (event) {
      if (pointerState && pointerState.id === event.pointerId && event.buttons === 0) {
        releasePointer(event);
      }
    });

    zoomIn.addEventListener('click', function () {
      blueprintScale += 0.15;
      applyBlueprintScale();
    });

    zoomOut.addEventListener('click', function () {
      blueprintScale -= 0.15;
      applyBlueprintScale();
    });

    reset.addEventListener('click', function () {
      blueprintScale = 1;
      applyBlueprintScale();
      viewport.scrollLeft = 0;
      viewport.scrollTop = 0;
      blueprintScrollLeft = 0;
      blueprintScrollTop = 0;
    });
  }

  function renderBlueprint(blueprint, status) {
    captureBlueprintViewport();
    var summary = blueprint.summary.map(function (item) {
      return '<div class="summary-badge"><small>' + item.label + '</small><strong>' + item.value + '</strong></div>';
    }).join('');

    var notes = (blueprint.flow_notes || []).map(function (item) {
      return '<li>' + item + '</li>';
    }).join('');

    var edgeSvg = blueprint.edges.map(function (edge) {
      var from = null;
      var to = null;
      blueprint.nodes.forEach(function (node) {
        if (node.id === edge.from) {
          from = node;
        }
        if (node.id === edge.to) {
          to = node;
        }
      });
      return '<path class="graph-edge" data-edge-to="' + edge.to + '" d="' + edgePath(from, to) + '" marker-end="url(#flow-arrow)"></path>';
    }).join('');

    var nodes = blueprint.nodes.map(function (node) {
      var center = nodeCenter(node);
      var style = 'left:' + center.x + 'px;top:' + center.y + 'px;--node-width:' + nodeWidthPixels(node) + 'px;';
      return [
        '<div class="graph-node tone-' + node.tone + '" data-node-id="' + node.id + '" style="' + style + '">',
        '  <strong>' + node.title + '</strong>',
        '  <span>' + node.subtitle + '</span>',
        '</div>'
      ].join('');
    }).join('');

    document.getElementById('blueprint-tag').textContent = status.running ? '训练中' : (status.model_ready ? '已就绪' : '预热中');
    document.getElementById('blueprint-panel').innerHTML = [
      '<div class="blueprint-summary">' + summary + '</div>',
      '<div class="blueprint-toolbar">',
      '  <div class="blueprint-hint"><strong>交互画布</strong><span>拖动画布查看全貌，使用缩放按钮放大或缩小。</span></div>',
      '  <div class="blueprint-controls">',
      '    <button class="blueprint-button" type="button" id="blueprint-zoom-out">-</button>',
      '    <span class="blueprint-zoom-label" id="blueprint-zoom-label">100%</span>',
      '    <button class="blueprint-button" type="button" id="blueprint-zoom-in">+</button>',
      '    <button class="blueprint-button blueprint-button-wide" type="button" id="blueprint-zoom-reset">重置视图</button>',
      '  </div>',
      '</div>',
      '<div class="blueprint-viewport" id="blueprint-viewport">',
      '  <div class="blueprint-stage" id="blueprint-stage">',
      '    <div class="blueprint-stage-inner">',
      '      <svg class="graph-lines" viewBox="0 0 ' + stageWidth() + ' ' + stageHeight() + '" preserveAspectRatio="none"><defs><marker id="flow-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" fill="currentColor"></path></marker></defs>' + edgeSvg + '</svg>',
      nodes,
      '      <div class="flow-status-bar"><strong>数据流演示进度</strong><span id="flow-status-current">等待数据流</span></div>',
      '    </div>',
      '  </div>',
      '</div>',
      '<div class="blueprint-notes"><div class="blueprint-note-title">讲解提示</div><ul>' + notes + '</ul></div>'
    ].join('');
    bindBlueprintControls();
    restoreBlueprintViewport();
    applyBlueprintPlaybackState(blueprint);
  }

  function renderRuntime(status) {
    var cards = [
      { label: '轮次', value: (status.current_epoch || 0) + ' / ' + (status.total_epochs || 0) },
      { label: '批次', value: (status.current_batch || 0) + ' / ' + (status.total_batches || 0) },
      { label: '训练损失', value: safeNumber(status.last_train_loss, 4) },
      { label: '验证损失', value: safeNumber(status.last_val_loss, 4) },
      { label: '最佳准确率', value: safeNumber(status.best_val_accuracy, 4) },
      { label: '参数量', value: status.parameter_count ? (status.parameter_count / 1000000).toFixed(2) + 'M' : '--' },
      { label: '验证切分', value: formatSplitStrategy(status.split_strategy) }
    ];

    document.getElementById('runtime-stage').textContent = formatStageLabel(status.stage);
    document.getElementById('runtime-cards').innerHTML = '<div class="runtime-grid">' + cards.map(function (item) {
      return '<div class="runtime-card"><small>' + item.label + '</small><strong>' + item.value + '</strong></div>';
    }).join('') + '</div>';

    document.getElementById('runtime-logs').innerHTML = (status.logs || []).map(function (item) {
      return '<div class="log-item">' + item + '</div>';
    }).join('') || '<div class="log-item">暂无训练日志</div>';
    document.getElementById('phase-track').innerHTML = renderPhaseTrack();
    applyPhaseTrackState();
    document.getElementById('start-training-btn').disabled = !!status.running;
    document.getElementById('stop-training-btn').disabled = !status.running;
  }

  function renderInferenceResult(result) {
    var list = (result.top_k || []).map(function (item) {
      return '<li><span>' + item.species + '</span><strong>' + (item.probability * 100).toFixed(2) + '%</strong></li>';
    }).join('');

    document.getElementById('inference-result').innerHTML = [
      '<div class="inference-card">',
      '  <div class="inference-summary"><strong>' + (result.detected ? '检测到鸟类目标' : '置信度不足') + '</strong><span>活跃模型：' + result.active_model + '</span></div>',
      '  <img class="upload-spectrogram" src="' + result.spectrogram + '" alt="上传音频频谱图">',
      '  <ul class="prediction-list">' + list + '</ul>',
      '</div>'
    ].join('');
  }

  function updateUploadPreview(file) {
    var audio = document.getElementById('upload-preview');
    if (uploadPreviewUrl) {
      URL.revokeObjectURL(uploadPreviewUrl);
      uploadPreviewUrl = null;
    }
    if (!file) {
      audio.classList.add('is-hidden');
      audio.removeAttribute('src');
      return;
    }
    uploadPreviewUrl = URL.createObjectURL(file);
    audio.src = uploadPreviewUrl;
    audio.classList.remove('is-hidden');
  }

  function bindGalleryToggle() {
    var gallery = document.getElementById('species-gallery');
    gallery.addEventListener('click', function (event) {
      var button = event.target.closest('[data-role="preview-toggle"]');
      if (!button) {
        return;
      }
      var card = button.closest('.species-card');
      var view = button.getAttribute('data-view');
      Array.prototype.forEach.call(card.querySelectorAll('.tab-button'), function (item) {
        item.classList.toggle('is-active', item === button);
      });
      Array.prototype.forEach.call(card.querySelectorAll('.preview-panel'), function (panel) {
        panel.classList.toggle('is-visible', panel.getAttribute('data-preview') === view);
      });
    });
  }

  function bindTrainingControls() {
    document.getElementById('train-form').addEventListener('submit', function (event) {
      event.preventDefault();
      var form = event.target;
      var payload = {
        epochs: Number(form.epochs.value),
        batch_size: Number(form.batch_size.value),
        learning_rate: Number(form.learning_rate.value),
        val_split: Number(form.val_split.value),
        segments_per_file: Number(form.segments_per_file.value),
        seed: Number(form.seed.value)
      };
      api.startTraining(payload).then(function () {
        loadRuntime();
      }).catch(function (error) {
        alert(error.message);
      });
    });

    document.getElementById('stop-training-btn').addEventListener('click', function () {
      api.stopTraining().then(loadRuntime).catch(function (error) {
        alert(error.message);
      });
    });

    document.getElementById('inference-file').addEventListener('change', function (event) {
      updateUploadPreview(event.target.files && event.target.files[0]);
    });

    document.getElementById('inference-form').addEventListener('submit', function (event) {
      event.preventDefault();
      var file = document.getElementById('inference-file').files[0];
      if (!file) {
        alert('请先选择音频文件');
        return;
      }
      document.getElementById('analyze-btn').disabled = true;
      api.analyzeUpload(file, { threshold: 0.35, top_k: 5 }).then(function (result) {
        renderInferenceResult(result);
      }).catch(function (error) {
        alert(error.message);
      }).finally(function () {
        document.getElementById('analyze-btn').disabled = false;
      });
    });
  }

  function loadRuntime() {
    Promise.all([api.getHealth(), api.getTrainStatus(), api.getModelBlueprint()]).then(function (values) {
      var health = values[0];
      var status = values[1];
      var blueprint = values[2];
      latestStatus = status;
      latestBlueprint = blueprint;
      renderRuntime(status);
      renderBlueprint(blueprint, status);
      renderCharts(status.history || { train_loss: [], val_loss: [], val_accuracy: [] });
      document.getElementById('hero-metrics').setAttribute('data-model-ready', health.model_ready ? 'true' : 'false');
      refreshFlowPlayback();
    }).catch(function () {
      document.getElementById('runtime-cards').innerHTML = '<div class="runtime-card runtime-card-wide"><strong>无法连接到训练 API</strong><small>请检查 main.py 是否正在运行</small></div>';
    });
  }

  function loadPageData() {
    Promise.all([api.getDatasetOverview(), api.getHealth(), api.getTrainStatus(), api.getModelBlueprint()]).then(function (values) {
      var overview = values[0];
      var health = values[1];
      var status = values[2];
      var blueprint = values[3];
      latestStatus = status;
      latestBlueprint = blueprint;
      document.getElementById('hero-metrics').innerHTML = renderMetricCards(overview, health, status);
      document.getElementById('dataset-summary-panel').innerHTML = renderDatasetSummary(overview);
      document.getElementById('species-gallery').innerHTML = renderSpeciesGallery(overview.species);
      renderBlueprint(blueprint, status);
      renderRuntime(status);
      renderCharts(status.history || { train_loss: [], val_loss: [], val_accuracy: [] });
      bindGalleryToggle();
      refreshFlowPlayback();
    }).catch(function (error) {
      document.getElementById('dataset-summary-panel').innerHTML = '<div class="empty-state">' + error.message + '</div>';
      document.getElementById('species-gallery').innerHTML = '<div class="empty-state">实践平台尚未就绪</div>';
    });
  }

  shell.renderHeader(document.getElementById('site-header'), content.header);
  document.getElementById('page-root').innerHTML = [
    renderHero(content.hero),
    renderWorkspace(),
    renderDatasetGallery()
  ].join('');
  shell.renderFooter(document.getElementById('site-footer'), content.footer);

  bindTrainingControls();
  loadPageData();
  loadRuntime();
  startFlowPlayback();
  pollTimer = window.setInterval(loadRuntime, 2500);
  window.addEventListener('beforeunload', function () {
    if (pollTimer) {
      window.clearInterval(pollTimer);
    }
    if (flowPlaybackTimer) {
      window.clearInterval(flowPlaybackTimer);
    }
    if (uploadPreviewUrl) {
      URL.revokeObjectURL(uploadPreviewUrl);
    }
  });
})();