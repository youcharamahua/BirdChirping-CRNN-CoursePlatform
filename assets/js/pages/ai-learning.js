(function () {
  var content = window.AILearningPageContent;
  var shell = window.SiteShell;

  function renderHero(hero) {
    var pills = hero.pills.map(function (item) {
      return '<span>' + item + '</span>';
    }).join('');

    return [
      '<section class="ai-hero">',
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
      '  <div class="hero-side">',
      '    <div class="prompt-orbit">',
      '      <div class="orbit-node">角色</div>',
      '      <div class="orbit-node">阶段</div>',
      '      <div class="orbit-core">Prompt</div>',
      '      <div class="orbit-node">输出</div>',
      '      <div class="orbit-node">边界</div>',
      '    </div>',
      '  </div>',
      '</section>'
    ].join('');
  }

  function renderPrinciples(section) {
    var cards = section.cards.map(function (card) {
      return [
        '<article class="principle-card">',
        '  <div class="principle-index">' + card.number + '</div>',
        '  <h3>' + card.title + '</h3>',
        '  <p>' + card.text + '</p>',
        shell.renderList(card.points),
        '</article>'
      ].join('');
    }).join('');

    return [
      '<section class="section" id="' + section.id + '">',
      shell.renderSectionHeading(section),
      '  <div class="principle-grid">' + cards + '</div>',
      '</section>'
    ].join('');
  }

  function renderLadder(section) {
    var items = section.items.map(function (item) {
      return [
        '<article class="ladder-card">',
        '  <span class="ladder-step">' + item.step + '</span>',
        '  <h3>' + item.title + '</h3>',
        '  <blockquote>' + item.question + '</blockquote>',
        '  <p>' + item.gain + '</p>',
        '</article>'
      ].join('');
    }).join('');

    return [
      '<section class="section" id="' + section.id + '">',
      shell.renderSectionHeading(section),
      '  <div class="ladder-grid">' + items + '</div>',
      '</section>'
    ].join('');
  }

  function renderAnatomy(section) {
    return [
      '<section class="section" id="' + section.id + '">',
      shell.renderSectionHeading(section),
      '  <div class="anatomy-layout">',
      '    <article class="formula-card">',
      '      <h3>五段式结构</h3>',
      shell.renderList(section.formula),
      '    </article>',
      '    <article class="template-card">',
      '      <h3>推荐模板</h3>',
      '      <pre class="prompt-template">' + section.template + '</pre>',
      '    </article>',
      '  </div>',
      '</section>'
    ].join('');
  }

  function renderCompare(section) {
    var pairs = section.pairs.map(function (pair) {
      return [
        '<article class="compare-card">',
        '  <div class="compare-bad"><small>低质量提问</small><p>' + pair.bad + '</p></div>',
        '  <div class="compare-good"><small>更好的提问</small><p>' + pair.good + '</p></div>',
        '  <div class="compare-why">' + pair.why + '</div>',
        '</article>'
      ].join('');
    }).join('');

    return [
      '<section class="section" id="' + section.id + '">',
      shell.renderSectionHeading(section),
      '  <div class="compare-grid">' + pairs + '</div>',
      '</section>'
    ].join('');
  }

  function renderStudio(section) {
    var prompts = section.prompts.map(function (item) {
      return [
        '<article class="studio-card">',
        '  <small>' + item.tag + '</small>',
        '  <p>' + item.prompt + '</p>',
        '</article>'
      ].join('');
    }).join('');

    return [
      '<section class="section" id="' + section.id + '">',
      shell.renderSectionHeading(section),
      '  <div class="studio-layout">',
      '    <div class="studio-grid">' + prompts + '</div>',
      '    <article class="checklist-card">',
      '      <h3>提问前检查表</h3>',
      shell.renderList(section.checklist),
      '    </article>',
      '  </div>',
      '</section>'
    ].join('');
  }

  function renderEthics(section) {
    return [
      '<section class="section" id="' + section.id + '">',
      shell.renderSectionHeading(section),
      '  <article class="ethics-card">',
      shell.renderList(section.points),
      '  </article>',
      '</section>'
    ].join('');
  }

  shell.renderHeader(document.getElementById('site-header'), content.header);
  document.getElementById('page-root').innerHTML = [
    renderHero(content.hero),
    renderPrinciples(content.sections.principles),
    renderLadder(content.sections.ladder),
    renderAnatomy(content.sections.anatomy),
    renderCompare(content.sections.compare),
    renderStudio(content.sections.studio),
    renderEthics(content.sections.ethics)
  ].join('');
  shell.renderFooter(document.getElementById('site-footer'), content.footer);
})();