(function () {
  var content = window.CodeLabPageContent;
  var shell = window.SiteShell;

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function renderHero(hero, aside) {
    var pills = hero.pills.map(function (item) {
      return '<span>' + item + '</span>';
    }).join('');

    var points = aside.points.map(function (item) {
      return '<li>' + item + '</li>';
    }).join('');

    return [
      '<section class="code-hero">',
      '  <article class="hero-card">',
      '    <span class="eyebrow">' + hero.eyebrow + '</span>',
      '    <h1>' + hero.title + '<span>' + hero.accent + '</span></h1>',
      '    <p>' + hero.lead + '</p>',
      '    <div class="hero-actions">',
      '      <a class="button button-primary" href="' + hero.primaryAction.href + '">' + hero.primaryAction.label + '</a>',
      '      <a class="button button-secondary" href="' + hero.secondaryAction.href + '">' + hero.secondaryAction.label + '</a>',
      '    </div>',
      '    <div class="hero-pills">' + pills + '</div>',
      '  </article>',
      '  <aside class="code-aside">',
      '    <span class="aside-label">' + aside.label + '</span>',
      '    <h2>' + aside.title + '</h2>',
      '    <p>' + aside.text + '</p>',
      '    <ul class="aside-list">' + points + '</ul>',
      '  </aside>',
      '</section>'
    ].join('');
  }

  function renderRoadmap(section) {
    var cards = section.cards.map(function (card) {
      return [
        '<article class="arch-card">',
        '  <small>' + card.tag + '</small>',
        '  <h3>' + card.title + '</h3>',
        '  <p>' + card.text + '</p>',
        shell.renderList(card.points),
        '</article>'
      ].join('');
    }).join('');

    return [
      '<section class="code-section" id="' + section.id + '">',
      shell.renderSectionHeading(section),
      '  <div class="arch-grid">' + cards + '</div>',
      '</section>'
    ].join('');
  }

  function renderStep(item) {
    return [
      '<article class="step-card" id="' + item.id + '">',
      '  <div class="step-copy">',
      '    <span class="step-label">' + item.label + '</span>',
      '    <h3>' + item.title + '</h3>',
      '    <p>' + item.intro + '</p>',
      shell.renderList(item.points),
      '  </div>',
      '  <div class="step-code">',
      '    <div class="code-toolbar"><span>' + item.codeLabel + '</span><span>课堂示例</span></div>',
      '    <pre><code>' + escapeHtml(item.snippet) + '</code></pre>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function renderShapes(section) {
    var cards = section.items.map(function (item) {
      return [
        '<article class="shape-card">',
        '  <span class="shape-step">' + item.step + '</span>',
        '  <h3>' + item.shape + '</h3>',
        '  <p>' + item.note + '</p>',
        '</article>'
      ].join('');
    }).join('');

    var stream = section.stream.map(function (item) {
      return '<span class="shape-chip">' + item + '</span>';
    }).join('');

    return [
      '<section class="code-section" id="' + section.id + '">',
      shell.renderSectionHeading(section),
      '  <div class="shape-grid">' + cards + '</div>',
      '  <div class="shape-stream">' + stream + '</div>',
      '</section>'
    ].join('');
  }

  shell.renderHeader(document.getElementById('site-header'), content.header);
  document.getElementById('page-root').innerHTML = [
    '<div class="code-shell">',
    renderHero(content.hero, content.aside),
    renderRoadmap(content.roadmap),
    '<section class="code-section code-stack">' + content.steps.map(renderStep).join('') + '</section>',
    renderShapes(content.shapes),
    '</div>'
  ].join('');
  shell.renderFooter(document.getElementById('site-footer'), content.footer);
})();
