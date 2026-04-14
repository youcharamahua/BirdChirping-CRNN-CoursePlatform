(function () {
  var content = window.CourseworkFullPageContent;
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
      '<aside class="docs-sidebar">',
      '  <section class="sidebar-card">',
      '    <h2>' + sidebar.title + '</h2>',
      '    <p>' + sidebar.copy + '</p>',
      '    <div class="sidebar-nav">' + links + '</div>',
      '  </section>',
      '  <section class="note-card">',
      '    <h3>' + sidebar.noteTitle + '</h3>',
      '    <p>' + sidebar.noteText + '</p>',
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
      '<section class="hero-card" id="guide">',
      '  <span class="eyebrow">' + hero.eyebrow + '</span>',
      '  <h1>' + hero.title + '</h1>',
      '  <p>' + hero.text + '</p>',
      '  <div class="hero-meta">' + meta + '</div>',
      '</section>'
    ].join('');
  }

  function renderJumpGrid(cards) {
    return '<section class="jump-grid">' + cards.map(function (card) {
      return [
        '<a class="jump-card" href="' + card.href + '">',
        '  <small>' + card.eyebrow + '</small>',
        '  <h3>' + card.title + '</h3>',
        '  <p>' + card.text + '</p>',
        '</a>'
      ].join('');
    }).join('') + '</section>';
  }

  function renderSection(section) {
    var actions = (section.actions || []).map(function (item) {
      return '<a class="doc-action" href="' + item.href + '">' + item.label + '</a>';
    }).join('');

    return [
      '<section class="doc-section" id="' + section.id + '">',
      '  <div class="doc-head">',
      '    <span class="doc-label">' + section.label + '</span>',
      '    <h2>' + section.title + '</h2>',
      '    <p class="doc-brief">' + section.brief + '</p>',
      actions ? '    <div class="doc-actions">' + actions + '</div>' : '',
      '  </div>',
      '  <div class="article-body">' + section.html + '</div>',
      '</section>'
    ].join('');
  }

  shell.renderHeader(document.getElementById('site-header'), content.header);
  document.getElementById('page-root').innerHTML = [
    '<div class="docs-shell">',
    renderSidebar(content.sidebar),
    '<main class="docs-main">',
    renderHero(content.hero),
    renderJumpGrid(content.jumpCards),
    content.sections.map(renderSection).join(''),
    '</main>',
    '</div>'
  ].join('');
  shell.renderFooter(document.getElementById('site-footer'), content.footer);
})();
