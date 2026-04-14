(function () {
  function isActiveItem(item, activeKey) {
    if (!item) {
      return false;
    }

    if (item.key && item.key === activeKey) {
      return true;
    }

    return !!(item.children || []).find(function (child) {
      return isActiveItem(child, activeKey);
    });
  }

  function renderNavLink(item, activeKey, className) {
    var isActive = isActiveItem(item, activeKey);
    return '<a href="' + item.href + '" class="' + className + (isActive ? ' is-active' : '') + '"' + (isActive ? ' aria-current="page"' : '') + '>' + item.label + '</a>';
  }

  function renderNavItem(item, activeKey) {
    var children = item.children || [];
    var isActive = isActiveItem(item, activeKey);

    if (!children.length) {
      return renderNavLink(item, activeKey, 'nav-link');
    }

    return [
      '<details class="nav-dropdown"' + (isActive ? ' open' : '') + '>',
      '  <summary class="nav-dropdown-toggle' + (isActive ? ' is-active' : '') + '">',
      '    <span>' + item.label + '</span>',
      '    <span class="nav-caret" aria-hidden="true">▾</span>',
      '  </summary>',
      '  <div class="nav-dropdown-menu">' + children.map(function (child) {
        return renderNavLink(child, activeKey, 'nav-dropdown-link');
      }).join('') + '</div>',
      '</details>'
    ].join('');
  }

  function renderHeader(target, data) {
    if (!target || !data) {
      return;
    }

    var links = (data.nav || []).map(function (item) {
      return renderNavItem(item, data.activeKey);
    }).join('');

    target.className = 'topbar';
    target.innerHTML = [
      '<div class="topbar-inner">',
      '  <div class="brand">',
      '    <div class="brand-mark">' + data.brandMark + '</div>',
      '    <div class="brand-copy">',
      '      <div>' + data.brandName + '</div>',
      '      <small>' + data.brandSubtitle + '</small>',
      '    </div>',
      '  </div>',
      '  <nav class="nav">' + links + '</nav>',
      '</div>'
    ].join('');
  }

  function renderFooter(target, data) {
    if (!target || !data) {
      return;
    }

    target.className = 'page-footer';
    target.innerHTML = data.title + '<br><small>' + data.subtitle + '</small>';
  }

  function renderList(items, className) {
    return '<ul' + (className ? ' class="' + className + '"' : '') + '>' + items.map(function (item) {
      return '<li>' + item + '</li>';
    }).join('') + '</ul>';
  }

  function renderPills(items, wrapperClass, pillClass) {
    var resolvedWrapperClass = wrapperClass || 'pill-group';
    var resolvedPillClass = pillClass || 'pill';
    return '<div class="' + resolvedWrapperClass + '">' + items.map(function (item) {
      return '<span class="' + resolvedPillClass + '">' + item + '</span>';
    }).join('') + '</div>';
  }

  function renderSectionHeading(section) {
    return [
      '<div class="section-heading">',
      '  <h2>' + section.title + '</h2>',
      '  <p>' + section.description + '</p>',
      '</div>'
    ].join('');
  }

  window.SiteShell = {
    renderFooter: renderFooter,
    renderHeader: renderHeader,
    renderList: renderList,
    renderPills: renderPills,
    renderSectionHeading: renderSectionHeading
  };
})();