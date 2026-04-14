(function () {
  var content = window.HomePageContent;
  var shell = window.SiteShell;
  var playgroundPreviewUrl = null;
  var playgroundSpectrogramToken = 0;
  var playgroundState = {
    file: null,
    label: '',
    source: ''
  };

  function parseResponse(response) {
    return response.text().then(function (text) {
      var payload = text ? JSON.parse(text) : {};
      if (!response.ok) {
        throw new Error(payload.detail || payload.message || '请求失败');
      }
      return payload;
    });
  }

  function requestJson(path) {
    return fetch(path, { cache: 'no-store' }).then(parseResponse);
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

  function formatAccuracy(value) {
    return typeof value === 'number' ? (value * 100).toFixed(2) + '%' : '--';
  }

  function buildRuntimeCard(config, health, status) {
    return [
      '<article class="runtime-overview-card runtime-' + config.tone + '">',
      '  <div class="runtime-overview-head">',
      '    <span class="runtime-overview-tag">' + config.title + '</span>',
      '    <span class="runtime-overview-stage">' + formatStageLabel(status.stage) + '</span>',
      '  </div>',
      '  <h3>' + health.active_model + '</h3>',
      '  <p>' + config.text + '</p>',
      '  <div class="runtime-overview-meta">',
      '    <span>Epoch ' + (status.current_epoch || 0) + '/' + (status.total_epochs || 0) + '</span>',
      '    <span>最佳验证准确率 ' + formatAccuracy(status.best_val_accuracy) + '</span>',
      '  </div>',
      '  <div class="runtime-overview-meta">',
      '    <span>' + (health.model_ready ? '模型已就绪' : '等待训练') + '</span>',
      '    <span>' + ((health.dataset && health.dataset.class_count) || '--') + ' 类数据</span>',
      '  </div>',
      '  <a class="runtime-overview-link" href="' + config.href + '">' + config.linkLabel + '</a>',
      '</article>'
    ].join('');
  }

  function buildFallbackCard(config) {
    return [
      '<article class="runtime-overview-card runtime-' + config.tone + ' runtime-offline">',
      '  <div class="runtime-overview-head">',
      '    <span class="runtime-overview-tag">' + config.title + '</span>',
      '    <span class="runtime-overview-stage">离线</span>',
      '  </div>',
      '  <h3>训练 API 未连接</h3>',
      '  <p>页面入口仍可打开，但当前首页无法读取实时状态。</p>',
      '  <a class="runtime-overview-link" href="' + config.href + '">' + config.linkLabel + '</a>',
      '</article>'
    ].join('');
  }

  function renderHero(hero) {
    var wave = hero.signalStory.waveHeights.map(function (height) {
      return '<span style="height:' + height + '"></span>';
    }).join('');

    var stats = hero.stats.map(function (item) {
      return '<div class="stat"><strong>' + item.value + '</strong>' + item.label + '</div>';
    }).join('');

    var quickLinks = (hero.quickLinks || []).map(function (item) {
      return '<a class="hero-link" href="' + item.href + '">' + item.label + '</a>';
    }).join('');

    return [
      '<section class="hero" id="overview">',
      '  <div class="hero-shell">',
      '    <div class="hero-copy">',
      '      <span class="eyebrow">' + hero.eyebrow + '</span>',
      '      <h1>' + hero.title + '<span>' + hero.accent + '</span></h1>',
      '      <p class="lead">' + hero.lead + '</p>',
      '      <div class="hero-actions">',
      '        <a class="button button-primary" href="' + hero.primaryAction.href + '">' + hero.primaryAction.label + '</a>',
      '        <a class="button button-secondary" href="' + hero.secondaryAction.href + '">' + hero.secondaryAction.label + '</a>',
      '      </div>',
      '      <div class="hero-link-rack">' + quickLinks + '</div>',
      '    </div>',
      '    <div class="hero-side">',
      '      <div class="glass-card">',
      '        <div class="signal-label">' + hero.signalStory.label + '</div>',
      '        <h3 class="signal-title">' + hero.signalStory.title + '</h3>',
      '        <div class="wave" aria-hidden="true">' + wave + '</div>',
      '      </div>',
      '      <div class="stats">' + stats + '</div>',
      '    </div>',
      '  </div>',
      '</section>'
    ].join('');
  }

  function renderCapabilitySection(section) {
    var cards = section.cards.map(function (card) {
      return [
        '<article class="feature-card">',
        '  <div class="icon-chip">' + card.number + '</div>',
        '  <h3>' + card.title + '</h3>',
        '  <p>' + card.text + '</p>',
        '</article>'
      ].join('');
    }).join('');

    return [
      '<section class="section">',
      shell.renderSectionHeading(section),
      '  <div class="grid-3">' + cards + '</div>',
      '</section>'
    ].join('');
  }

  function renderKnowledgeSection(section) {
    var cards = section.cards.map(function (card) {
      return [
        '<article class="knowledge-card">',
        '  <div class="number">' + card.number + '</div>',
        '  <h3>' + card.title + '</h3>',
        '  <p>' + card.text + '</p>',
        shell.renderList(card.points),
        '</article>'
      ].join('');
    }).join('');

    return [
      '<section class="section" id="' + section.id + '">',
      shell.renderSectionHeading(section),
      '  <div class="knowledge-grid">' + cards + '</div>',
      '</section>'
    ].join('');
  }

  function renderJourneySection(section) {
    var cards = section.cards.map(function (card) {
      return [
        '<article class="journey-card">',
        '  <span class="journey-stage">' + card.stage + '</span>',
        '  <h3>' + card.title + '</h3>',
        '  <p>' + card.text + '</p>',
        '  <a class="journey-link" href="' + card.href + '">' + card.linkLabel + '</a>',
        '</article>'
      ].join('');
    }).join('');

    return [
      '<section class="section" id="' + section.id + '">',
      shell.renderSectionHeading(section),
      '  <div class="journey-grid">' + cards + '</div>',
      '</section>'
    ].join('');
  }

  function renderStudioSection(section) {
    var nodes = section.canvas.nodes.map(function (node, index) {
      var parts = [
        '<div class="node' + (node.highlight ? ' highlight' : '') + '"><div><strong>' + node.title + '</strong><span>' + node.subtitle + '</span></div></div>'
      ];
      if (index < section.canvas.nodes.length - 1) {
        parts.push('<div class="node-arrow" aria-hidden="true"><span></span></div>');
      }
      return parts.join('');
    }).join('');

    var tracks = section.canvas.tracks.map(function (track) {
      return '<span>' + track + '</span>';
    }).join('');

    var actions = (section.actions || []).map(function (item) {
      return '<a class="button button-secondary" href="' + item.href + '">' + item.label + '</a>';
    }).join('');

    return [
      '<section class="section" id="' + section.id + '">',
      shell.renderSectionHeading(section),
      '  <div class="studio-support-grid">',
      '    <article class="hub-card">',
      '      <h3>' + section.leftCard.title + '</h3>',
      shell.renderList(section.leftCard.points),
      '    </article>',
      '    <article class="hub-card">',
      '      <h3>' + section.rightCard.title + '</h3>',
      '      <p>' + section.rightCard.text + '</p>',
      shell.renderList(section.rightCard.points),
      '    </article>',
      '  </div>',
      '  <div class="lab-canvas lab-canvas-wide">',
      '    <div class="lab-header"><span>' + section.canvas.header + '</span><span class="lab-status">' + section.canvas.status + '</span></div>',
      '    <div class="lab-body">',
      '      <div class="lab-viewport">',
      '        <div class="skeleton">' + nodes + '</div>',
      '      </div>',
      '      <div class="lab-flow-note"><strong>导学提示</strong><span>' + section.canvas.hint + '</span></div>',
      '      <div class="flow-track">' + tracks + '</div>',
      '      <div class="studio-links">' + actions + '</div>',
      '    </div>',
      '  </div>',
      '  <div class="studio-runtime-grid" id="studio-runtime"></div>',
      '</section>'
    ].join('');
  }

  function renderPlaygroundSection(section) {
    return [
      '<section class="section" id="' + section.id + '">',
      shell.renderSectionHeading(section),
      '  <div class="playground-layout">',
      '    <article class="playground-panel playground-tester">',
      '      <div class="playground-head">',
      '        <span class="journey-stage">' + section.tester.eyebrow + '</span>',
      '        <h3>' + section.tester.title + '</h3>',
      '      </div>',
      '      <p class="playground-copy">' + section.tester.text + '</p>',
      '      <label class="playground-upload">',
      '        <span>选择本地音频</span>',
      '        <input id="playground-file" type="file" accept=".wav,.mp3,.m4a,.aac,.flac,.ogg">',
      '      </label>',
      '      <div class="playground-actions">',
      '        <button class="button button-primary" type="button" id="playground-submit">开始识别</button>',
      '        <button class="button button-secondary" type="button" id="playground-clear">清空音频</button>',
      '      </div>',
      '      <div class="playground-status" id="playground-status">请上传音频文件或从右侧音频列表载入。</div>',
      '      <div class="playground-hint">' + section.tester.hint + '</div>',
      '      <audio id="playground-audio" class="playground-audio is-hidden" controls></audio>',
      '      <div class="playground-visuals">',
      '        <div class="playground-card">',
      '          <div class="playground-card-label">频谱图</div>',
      '          <div class="playground-spectrogram-meta">',
      '            <span id="playground-spectrogram-detail">等待音频输入</span>',
      '            <span>长音频可左右拖动查看完整时间轴</span>',
      '          </div>',
      '          <div class="playground-spectrogram-frame" id="playground-spectrogram-frame">',
      '            <canvas id="playground-spectrogram" class="playground-spectrogram" width="720" height="256"></canvas>',
      '          </div>',
      '          <div class="playground-spectrogram-scale"><span>0 秒</span><span id="playground-spectrogram-end">--</span></div>',
      '        </div>',
      '        <div class="playground-card" id="playground-result">',
      '          <div class="playground-card-label">识别结果</div>',
      '          <div class="playground-empty">识别结果将在此显示。</div>',
      '        </div>',
      '      </div>',
      '    </article>',
      '    <article class="playground-panel playground-library">',
      '      <div class="playground-head">',
      '        <span class="journey-stage">' + section.library.eyebrow + '</span>',
      '        <h3>' + section.library.title + '</h3>',
      '      </div>',
      '      <p class="playground-copy">' + section.library.text + '</p>',
      '      <div class="clip-list" id="playground-clips">',
      '        <div class="playground-empty">正在加载音频列表...</div>',
      '      </div>',
      '    </article>',
      '  </div>',
      '</section>'
    ].join('');
  }

  function renderAssistantSection(section) {
    var prompts = section.prompts.map(function (prompt) {
      return '<div class="bubble"><small>' + prompt.tag + '</small>' + prompt.text + '</div>';
    }).join('');

    var actions = (section.actions || []).map(function (item) {
      return '<a class="button button-secondary" href="' + item.href + '">' + item.label + '</a>';
    }).join('');

    return [
      '<section class="section" id="' + section.id + '">',
      shell.renderSectionHeading(section),
      '  <div class="ai-layout">',
      '    <article class="ai-card">',
      '      <div class="eyebrow">' + section.card.eyebrow + '</div>',
      '      <h3>' + section.card.title + '</h3>',
      '      <p>' + section.card.text + '</p>',
      shell.renderList(section.card.points),
      shell.renderPills(section.card.pills),
      '      <div class="assistant-actions">' + actions + '</div>',
      '    </article>',
      '    <div class="chat-mock">' + prompts + '</div>',
      '  </div>',
      '</section>'
    ].join('');
  }

  function renderResourceSection(section) {
    var cards = section.cards.map(function (card) {
      var className = 'resource-card' + (card.tone ? ' resource-' + card.tone : '');
      return [
        '<a class="' + className + '" href="' + card.href + '">',
        '  <small>' + card.eyebrow + '</small>',
        '  <h3>' + card.title + '</h3>',
        '  <p>' + card.text + '</p>',
        '  <span class="resource-hint">' + card.hint + '</span>',
        '</a>'
      ].join('');
    }).join('');

    return [
      '<section class="section" id="' + section.id + '">',
      shell.renderSectionHeading(section),
      '  <div class="resource-grid">' + cards + '</div>',
      '</section>'
    ].join('');
  }

  function renderPathSection(section) {
    var cards = section.cards.map(function (card) {
      return [
        '<article class="path-card path-' + card.tone + '">',
        '  <h3>' + card.title + '</h3>',
        '  <p>' + card.text + '</p>',
        shell.renderList(card.points),
        shell.renderPills(card.pills),
        '</article>'
      ].join('');
    }).join('');

    return [
      '<section class="section" id="' + section.id + '">',
      shell.renderSectionHeading(section),
      '  <div class="path-cta"><a class="button button-secondary" href="' + section.action.href + '">' + section.action.label + '</a></div>',
      '  <div class="grid-3">' + cards + '</div>',
      '</section>'
    ].join('');
  }

  function renderFaqSection(section) {
    var cards = section.cards.map(function (card) {
      return '<article class="faq-card"><h3>' + card.title + '</h3><p>' + card.text + '</p></article>';
    }).join('');

    return [
      '<section class="section" id="' + section.id + '">',
      shell.renderSectionHeading(section),
      '  <div class="faq-grid">' + cards + '</div>',
      '</section>'
    ].join('');
  }

  function renderHomeFooter(footer) {
    var footbar = footer.footbar || {};
    var blocks = (footbar.blocks || []).map(function (block) {
      return [
        '<article class="footbar-card">',
        '  <h3>' + block.title + '</h3>',
        shell.renderList(block.items, 'footbar-list'),
        '</article>'
      ].join('');
    }).join('');

    var footbarHtml = footbar.title ? [
      '<div class="footbar">',
      '  <div class="footbar-shell">',
      '    <div class="footbar-copy">',
      footbar.eyebrow ? '      <span class="journey-stage">' + footbar.eyebrow + '</span>' : '',
      '      <h2>' + footbar.title + '</h2>',
      '      <p>' + (footbar.description || '') + '</p>',
      '    </div>',
      blocks ? '    <div class="footbar-grid">' + blocks + '</div>' : '',
      '  </div>',
      '</div>'
    ].join('') : '';

    return footbarHtml + [
      '<div class="footer-signature">',
      '  ' + footer.title + '<br><small>' + footer.subtitle + '</small>',
      '</div>'
    ].join('');
  }

  function hydrateStudioRuntime() {
    var target = document.getElementById('studio-runtime');
    if (!target) {
      return;
    }

    var configs = [
      {
        title: '主线基础',
        text: '首页优先推荐，从卷积局部特征过渡到 LSTM 顺序记忆。',
        href: './pages/cnn-training/index.html',
        linkLabel: '打开 CNN + LSTM 基础台',
        tone: 'basic',
        healthPath: '/api/health',
        statusPath: '/api/train/status'
      },
      {
        title: '深入进阶',
        text: '在掌握 LSTM 主线后，再比较更强骨干与双向上下文。',
        href: './pages/training/index.html',
        linkLabel: '进入 ResNet18 + BiLSTM 深入进阶台',
        tone: 'deep',
        healthPath: '/api/bilstm/health',
        statusPath: '/api/bilstm/train/status'
      },
      {
        title: '探索进阶',
        text: '在掌握 LSTM 主线后，再讨论注意力机制是否值得引入。',
        href: './pages/transformer-training/index.html',
        linkLabel: '打开 CNN + Transformer 探索进阶台',
        tone: 'explore',
        healthPath: '/api/transformer/health',
        statusPath: '/api/transformer/train/status'
      }
    ];

    Promise.allSettled(configs.map(function (config) {
      return Promise.all([requestJson(config.healthPath), requestJson(config.statusPath)]);
    })).then(function (results) {
      var cards = results.map(function (result, index) {
        var config = configs[index];
        if (result.status === 'fulfilled') {
          return buildRuntimeCard(config, result.value[0], result.value[1]);
        }
        return buildFallbackCard(config);
      });
      target.innerHTML = cards.join('');
    }).catch(function () {
      target.innerHTML = configs.map(buildFallbackCard).join('');
    });
  }

  function formatDurationLabel(seconds) {
    if (typeof seconds !== 'number' || !isFinite(seconds) || seconds <= 0) {
      return '--';
    }
    var rounded = seconds >= 10 ? Number(seconds.toFixed(1)) : Number(seconds.toFixed(2));
    if (rounded < 60) {
      return String(rounded).replace(/\.0$/, '') + ' 秒';
    }
    var minutes = Math.floor(rounded / 60);
    var remain = Number((rounded - minutes * 60).toFixed(1));
    return minutes + ' 分 ' + String(remain).replace(/\.0$/, '') + ' 秒';
  }

  function updateSpectrogramMeta(detail, endLabel) {
    var detailTarget = document.getElementById('playground-spectrogram-detail');
    var endTarget = document.getElementById('playground-spectrogram-end');
    if (detailTarget) {
      detailTarget.textContent = detail || '等待音频输入';
    }
    if (endTarget) {
      endTarget.textContent = endLabel || '--';
    }
  }

  function setSpectrogramCanvasSize(width, height) {
    var canvas = document.getElementById('playground-spectrogram');
    if (!canvas) {
      return null;
    }
    var resolvedWidth = Math.max(1, Math.round(width));
    var resolvedHeight = Math.max(1, Math.round(height));
    canvas.width = resolvedWidth;
    canvas.height = resolvedHeight;
    canvas.style.width = resolvedWidth + 'px';
    canvas.style.height = resolvedHeight + 'px';
    return canvas;
  }

  function drawSpectrogramPlaceholder(message) {
    var canvas = setSpectrogramCanvasSize(720, 256);
    if (!canvas) {
      return;
    }
    var ctx = canvas.getContext('2d');
    var gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#0b1a15');
    gradient.addColorStop(0.55, '#245c4d');
    gradient.addColorStop(1, '#d9a75a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
    for (var x = 0; x < canvas.width; x += 24) {
      ctx.fillRect(x, 0, 1, canvas.height);
    }
    for (var y = 0; y < canvas.height; y += 24) {
      ctx.fillRect(0, y, canvas.width, 1);
    }
    ctx.fillStyle = '#fff7ef';
    ctx.font = '16px Microsoft YaHei';
    ctx.textAlign = 'center';
    ctx.fillText(message, canvas.width / 2, canvas.height / 2);
    updateSpectrogramMeta(message, '--');

    var frame = document.getElementById('playground-spectrogram-frame');
    if (frame) {
      frame.scrollLeft = 0;
      frame.classList.remove('is-ready');
    }
  }

  function requestPlaygroundSpectrogram(file) {
    var formData = new FormData();
    formData.append('file', file, file.name || 'audio.wav');
    return fetch('/api/playground/spectrogram', {
      method: 'POST',
      body: formData
    }).then(parseResponse);
  }

  function renderSpectrogramPreview(payload, requestToken) {
    var canvas = document.getElementById('playground-spectrogram');
    if (!canvas) {
      return;
    }
    var image = new Image();
    image.onload = function () {
      if (requestToken !== playgroundSpectrogramToken) {
        return;
      }
      var resolvedCanvas = setSpectrogramCanvasSize(payload.width || image.naturalWidth, payload.height || image.naturalHeight);
      var ctx = resolvedCanvas.getContext('2d');
      ctx.clearRect(0, 0, resolvedCanvas.width, resolvedCanvas.height);
      ctx.drawImage(image, 0, 0, resolvedCanvas.width, resolvedCanvas.height);

      var frame = document.getElementById('playground-spectrogram-frame');
      if (frame) {
        frame.scrollLeft = 0;
        frame.classList.add('is-ready');
      }

      var detail = '完整时长 ' + formatDurationLabel(payload.duration_seconds) + ' · ' + String(payload.frame_count || payload.width || image.naturalWidth) + ' 个时间步';
      updateSpectrogramMeta(detail, formatDurationLabel(payload.duration_seconds));
    };
    image.onerror = function () {
      if (requestToken !== playgroundSpectrogramToken) {
        return;
      }
      drawSpectrogramPlaceholder('当前音频无法生成频谱图');
    };
    image.src = payload.spectrogram;
  }

  function generateLocalSpectrogram(file, requestToken) {
    drawSpectrogramPlaceholder('正在生成全时长频谱图...');
    updateSpectrogramMeta('正在生成完整时间轴频谱图', '--');
    return requestPlaygroundSpectrogram(file).then(function (payload) {
      if (requestToken !== playgroundSpectrogramToken) {
        return;
      }
      renderSpectrogramPreview(payload, requestToken);
    }).catch(function () {
      if (requestToken !== playgroundSpectrogramToken) {
        return;
      }
      drawSpectrogramPlaceholder('当前音频无法生成频谱图');
    });
  }

  function bindSpectrogramDrag() {
    var frame = document.getElementById('playground-spectrogram-frame');
    if (!frame || frame.dataset.dragBound === 'true') {
      return;
    }
    frame.dataset.dragBound = 'true';

    var dragging = false;
    var startX = 0;
    var startScrollLeft = 0;

    function stopDragging() {
      dragging = false;
      frame.classList.remove('is-dragging');
    }

    frame.addEventListener('mousedown', function (event) {
      if (event.button !== 0) {
        return;
      }
      dragging = true;
      startX = event.clientX;
      startScrollLeft = frame.scrollLeft;
      frame.classList.add('is-dragging');
      event.preventDefault();
    });

    frame.addEventListener('mousemove', function (event) {
      if (!dragging) {
        return;
      }
      frame.scrollLeft = startScrollLeft - (event.clientX - startX);
    });

    frame.addEventListener('mouseleave', stopDragging);
    window.addEventListener('mouseup', stopDragging);
  }

  function updatePlaygroundAudio(file) {
    var audio = document.getElementById('playground-audio');
    if (!audio) {
      return;
    }
    if (playgroundPreviewUrl) {
      URL.revokeObjectURL(playgroundPreviewUrl);
      playgroundPreviewUrl = null;
    }
    if (!file) {
      audio.classList.add('is-hidden');
      audio.removeAttribute('src');
      audio.load();
      return;
    }
    playgroundPreviewUrl = URL.createObjectURL(file);
    audio.src = playgroundPreviewUrl;
    audio.classList.remove('is-hidden');
  }

  function setPlaygroundStatus(message, isError) {
    var target = document.getElementById('playground-status');
    if (!target) {
      return;
    }
    target.textContent = message;
    target.classList.toggle('is-error', !!isError);
  }

  function setPlaygroundFile(file, label, source) {
    playgroundState.file = file || null;
    playgroundState.label = label || (file ? file.name : '');
    playgroundState.source = source || '';
    updatePlaygroundAudio(file);
    if (!file) {
      playgroundSpectrogramToken += 1;
      setPlaygroundStatus('请上传音频文件或从右侧音频列表载入。', false);
      drawSpectrogramPlaceholder('等待音频输入');
      document.getElementById('playground-result').innerHTML = '<div class="playground-card-label">识别结果</div><div class="playground-empty">识别结果将在此显示。</div>';
      return;
    }
    setPlaygroundStatus('已载入音频：' + playgroundState.label, false);
    generateLocalSpectrogram(file, ++playgroundSpectrogramToken);
  }

  function normalizePredictionResult(payload) {
    return {
      detected: !!payload.detected,
      timestamp: payload.timestamp || '',
      topK: (payload.top_k || []).map(function (item) {
        return {
          species: item.Species || item.species || item.name || '--',
          probability: Number(item.Probability != null ? item.Probability : item.probability || 0)
        };
      })
    };
  }

  function renderPlaygroundResult(payload) {
    var result = normalizePredictionResult(payload);
    var list = result.topK.map(function (item) {
      return [
        '<li>',
        '  <span>' + item.species + '</span>',
        '  <strong>' + (item.probability * 100).toFixed(2) + '%</strong>',
        '</li>'
      ].join('');
    }).join('');

    document.getElementById('playground-result').innerHTML = [
      '<div class="playground-card-label">识别结果</div>',
      '<div class="playground-result-head">',
      '  <strong>' + (result.detected ? '已返回候选类别' : '当前音频未达到识别阈值') + '</strong>',
      '  <span>' + (result.timestamp || '接口已返回结果') + '</span>',
      '</div>',
      '<div class="playground-result-source">当前文件：' + (playgroundState.label || '未命名文件') + '</div>',
      list ? '<ul class="playground-predictions">' + list + '</ul>' : '<div class="playground-empty">接口未返回候选类别。</div>'
    ].join('');
  }

  function requestPlaygroundPredict(file) {
    var formData = new FormData();
    formData.append('file', file, file.name || 'audio.wav');
    return fetch('/api/playground/predict?threshold=0.1&top_k=7', {
      method: 'POST',
      body: formData
    }).then(parseResponse);
  }

  function classifyPlaygroundFile(file, label, source) {
    if (!file) {
      setPlaygroundStatus('请先选择音频文件。', true);
      return;
    }
    var resolvedLabel = label || (file && file.name) || '';
    var resolvedSource = source || '';
    if (playgroundState.file !== file || playgroundState.label !== resolvedLabel || playgroundState.source !== resolvedSource) {
      setPlaygroundFile(file, resolvedLabel, resolvedSource);
    }
    setPlaygroundStatus('正在提交音频并获取识别结果...', false);
    var submitButton = document.getElementById('playground-submit');
    submitButton.disabled = true;
    requestPlaygroundPredict(file).then(function (payload) {
      renderPlaygroundResult(payload);
      setPlaygroundStatus('识别完成。', false);
    }).catch(function (error) {
      document.getElementById('playground-result').innerHTML = '<div class="playground-card-label">识别结果</div><div class="playground-empty">' + error.message + '</div>';
      setPlaygroundStatus(error.message, true);
    }).finally(function () {
      submitButton.disabled = false;
    });
  }

  function renderClipList(items) {
    var target = document.getElementById('playground-clips');
    if (!target) {
      return;
    }
    if (!items.length) {
      target.innerHTML = '<div class="playground-empty">当前暂无可用音频片段。</div>';
      return;
    }
    target.innerHTML = items.map(function (item, index) {
      var label = '音频片段 ' + String(index + 1).padStart(2, '0');
      return [
        '<article class="clip-item">',
        '  <span class="clip-label">' + label + '</span>',
        '  <audio controls src="' + item.audio_url + '"></audio>',
        '  <button class="button button-secondary clip-test" type="button" data-role="clip-test" data-url="' + item.audio_url + '" data-name="' + item.file_name + '" data-label="' + label + '">载入</button>',
        '</article>'
      ].join('');
    }).join('');
  }

  function loadPlaygroundClips() {
    requestJson('/api/playground/clips').then(function (payload) {
      renderClipList(payload.items || []);
    }).catch(function (error) {
      document.getElementById('playground-clips').innerHTML = '<div class="playground-empty">' + error.message + '</div>';
    });
  }

  function bindPlaygroundControls() {
    drawSpectrogramPlaceholder('等待音频输入');
    bindSpectrogramDrag();

    document.getElementById('playground-file').addEventListener('change', function (event) {
      var file = event.target.files && event.target.files[0];
      if (!file) {
        return;
      }
      setPlaygroundFile(file, file.name, '本地文件');
    });

    document.getElementById('playground-submit').addEventListener('click', function () {
      classifyPlaygroundFile(playgroundState.file, playgroundState.label || (playgroundState.file && playgroundState.file.name), playgroundState.source || '本地文件');
    });

    document.getElementById('playground-clear').addEventListener('click', function () {
      document.getElementById('playground-file').value = '';
      setPlaygroundFile(null, '', '');
    });

    document.getElementById('playground-clips').addEventListener('click', function (event) {
      var button = event.target.closest('[data-role="clip-test"]');
      if (!button) {
        return;
      }
      setPlaygroundStatus('正在载入音频片段...', false);
      fetch(button.getAttribute('data-url'), { cache: 'no-store' }).then(function (response) {
        if (!response.ok) {
          throw new Error('无法读取音频文件');
        }
        return response.blob();
      }).then(function (blob) {
        var fileName = button.getAttribute('data-name') || 'sample.wav';
        var file = new File([blob], fileName, { type: blob.type || 'audio/wav' });
        classifyPlaygroundFile(file, button.getAttribute('data-label') || fileName, '音频列表');
      }).catch(function (error) {
        setPlaygroundStatus(error.message, true);
      });
    });
  }

  shell.renderHeader(document.getElementById('site-header'), content.header);
  document.getElementById('page-root').innerHTML = [
    renderHero(content.hero),
    renderPlaygroundSection(content.playgroundSection),
    renderCapabilitySection(content.capabilitySection),
    renderJourneySection(content.journeySection),
    renderKnowledgeSection(content.knowledgeSection),
    renderStudioSection(content.studioSection),
    renderAssistantSection(content.assistantSection),
    renderResourceSection(content.resourceSection),
    renderPathSection(content.pathSection),
    renderFaqSection(content.faqSection)
  ].join('');

  var footerTarget = document.getElementById('site-footer');
  footerTarget.className = 'page-footer page-footer-rich';
  footerTarget.innerHTML = renderHomeFooter(content.footer);

  hydrateStudioRuntime();
  bindPlaygroundControls();
  loadPlaygroundClips();

  window.addEventListener('beforeunload', function () {
    if (playgroundPreviewUrl) {
      URL.revokeObjectURL(playgroundPreviewUrl);
    }
  });
})();
