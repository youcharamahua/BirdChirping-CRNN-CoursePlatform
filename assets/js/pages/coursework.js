(function () {
  var content = window.CourseworkPageContent;
  var shell = window.SiteShell;

  function renderSidebar(sidebar) {
    var links = sidebar.items.map(function (item) {
      return [
        '<a href="' + item.href + '">',
        '  <div><strong>' + item.title + '</strong><span>' + item.subtitle + '</span></div>',
        '  <span>' + item.order + '</span>',
        '</a>'
      ].join('');
    }).join('');

    return [
      '<aside class="sidebar-wrap">',
      '  <section class="panel">',
      '    <h2 class="sidebar-title">' + sidebar.title + '</h2>',
      '    <p class="sidebar-copy">' + sidebar.copy + '</p>',
      '    <div class="sidebar-nav">' + links + '</div>',
      '  </section>',
      '  <section class="side-note">',
      '    <h3>' + sidebar.noteTitle + '</h3>',
      shell.renderList(sidebar.notePoints),
      '  </section>',
      '</aside>'
    ].join('');
  }

  function renderHero(hero) {
    var meta = hero.meta.map(function (item) {
      return '<span>' + item + '</span>';
    }).join('');

    return [
      '<section class="hero-panel" id="' + hero.id + '">',
      '  <span class="eyebrow">' + hero.eyebrow + '</span>',
      '  <h1>' + hero.title + '</h1>',
      '  <p>' + hero.text + '</p>',
      '  <div class="hero-meta">' + meta + '</div>',
      '</section>'
    ].join('');
  }

  function renderQuickLinks(links) {
    var cards = links.map(function (item) {
      return [
        '<a class="card-link" href="' + item.href + '">',
        '  <small>' + item.eyebrow + '</small>',
        '  <h3>' + item.title + '</h3>',
        '  <p>' + item.text + '</p>',
        '  <span class="hint">点击跳转</span>',
        '</a>'
      ].join('');
    }).join('');

    return '<section class="card-grid" aria-label="作业快速入口">' + cards + '</section>';
  }

  function renderPlatformBrief(platform) {
    var actions = platform.actions.map(function (item) {
      return '<a class="button button-secondary" href="' + item.href + '">' + item.label + '</a>';
    }).join('');

    return [
      '<section class="platform-brief">',
      '  <div>',
      '    <small>' + platform.eyebrow + '</small>',
      '    <h2>' + platform.title + '</h2>',
      '    <p>' + platform.text + '</p>',
      '    <div class="platform-actions">' + actions + '</div>',
      '  </div>',
      '  <div class="platform-runtime" id="platform-runtime">',
      '    <span class="runtime-chip">正在连接训练平台...</span>',
      '  </div>',
      '</section>'
    ].join('');
  }

  function renderSteps(steps) {
    return '<div class="step-board">' + steps.map(function (step) {
      return [
        '<article class="step-item">',
        '  <span class="step-index">' + step.index + '</span>',
        '  <strong>' + step.title + '</strong>',
        '  <p>' + step.text + '</p>',
        '</article>'
      ].join('');
    }).join('') + '</div>';
  }

  function renderCards(cards) {
    return '<div class="split-grid">' + cards.map(function (card) {
      var listClass = card.listClass ? ' class="' + card.listClass + '"' : '';
      var list = '<ul' + listClass + '>' + card.items.map(function (item) {
        return '<li>' + item + '</li>';
      }).join('') + '</ul>';
      var badges = card.badges ? '<div class="badge-row">' + card.badges.map(function (badge) {
        return '<span>' + badge + '</span>';
      }).join('') + '</div>' : '';
      return '<div class="sub-card"><h3>' + card.title + '</h3>' + list + badges + '</div>';
    }).join('') + '</div>';
  }

  function renderActions(actions) {
    return '<div class="section-actions">' + actions.map(function (action) {
      return '<a class="text-link" href="' + action.href + '">' + action.label + '</a>';
    }).join('') + '</div>';
  }

  function renderSection(section) {
    return [
      '<section class="section-panel" id="' + section.id + '">',
      '  <span class="section-label">' + section.label + '</span>',
      '  <h2>' + section.title + '</h2>',
      '  <p class="section-intro">' + section.intro + '</p>',
      section.steps ? renderSteps(section.steps) : '',
      renderCards(section.cards),
      section.actions ? renderActions(section.actions) : '',
      '</section>'
    ].join('');
  }

  function hydratePlatformRuntime() {
    var target = document.getElementById('platform-runtime');
    if (!target || !window.PlatformApi) {
      return;
    }

    Promise.all([window.PlatformApi.getHealth(), window.PlatformApi.getTrainStatus()]).then(function (values) {
      var health = values[0];
      var status = values[1];
      target.innerHTML = [
        '<span class="runtime-chip">模型：' + health.active_model + '</span>',
        '<span class="runtime-chip">状态：' + (status.stage || 'idle') + '</span>',
        '<span class="runtime-chip">训练集片段：' + (status.dataset_size || 0) + '</span>',
        '<span class="runtime-chip">最佳验证准确率：' + (typeof status.best_val_accuracy === 'number' ? (status.best_val_accuracy * 100).toFixed(2) + '%' : '--') + '</span>'
      ].join('');
    }).catch(function () {
      target.innerHTML = '<span class="runtime-chip runtime-chip-error">训练平台 API 未连接</span>';
    });
  }

  shell.renderHeader(document.getElementById('site-header'), content.header);
  document.getElementById('page-root').innerHTML = [
    '<div class="page-shell">',
    renderSidebar(content.sidebar),
    '<main class="main">',
    renderHero(content.hero),
    renderPlatformBrief(content.platformBrief),
    renderQuickLinks(content.quickLinks),
    content.sections.map(renderSection).join(''),
    '</main>',
    '</div>'
  ].join('');
  shell.renderFooter(document.getElementById('site-footer'), content.footer);
  hydratePlatformRuntime();
})();