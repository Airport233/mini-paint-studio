// Shared layout: sidebar with auth state
(function () {
  var currentPath = window.location.pathname.replace(/\/$/, '') || '/';
  var links = [
    { href: '/', label: '首页', icon: 'home' },
    { href: '/paints', label: '漆料库', icon: 'palette' },
    { href: '/mix', label: '调色引擎', icon: 'flask-conical' },
    { href: '/color-wheel', label: '色彩工具', icon: 'palette' },
    { href: '/preview', label: '3D 预览', icon: 'box' },
    { href: '/recipes', label: '配方库', icon: 'clipboard-list' },
    { href: '/presets', label: '灯光预设', icon: 'lightbulb' },
  ];

  var email = localStorage.getItem('email');
  var token = localStorage.getItem('token');

  var navLinks = links
    .map(function (l) {
      var cls = currentPath === l.href ? ' class="active"' : '';
      return (
        '<a href="' +
        l.href +
        '"' +
        cls +
        '><i data-lucide="' +
        l.icon +
        '" class="nav-icon"></i> ' +
        l.label +
        '</a>'
      );
    })
    .join('');

  var userRow = token
    ? '<div class="user-row"><i data-lucide="circle-user" class="nav-icon"></i> <span>' +
      (email || '') +
      '</span><a class="logout" onclick="window.logout();return false" href="#" title="登出"><i data-lucide="log-out" class="nav-icon"></i></a></div>'
    : '<div class="user-row"><i data-lucide="circle-user" class="nav-icon"></i> <span>未登录</span><a class="logout" href="/auth">登录</a></div>';

  document.getElementById('sidebar').innerHTML =
    '<nav>' +
    '<div class="brand"><i data-lucide="palette" class="nav-icon"></i> <span>Hobby</span>Mix</div>' +
    navLinks +
    userRow +
    '</nav>';
  if (window.lucide) { lucide.createIcons(); }
})();
