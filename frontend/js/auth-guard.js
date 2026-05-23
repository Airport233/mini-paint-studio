// Redirect to auth page if not logged in
(function() {
  // Don't guard the auth page itself
  if (window.location.pathname === '/auth' || window.location.pathname === '/auth.html') return;
  if (!localStorage.getItem('token')) {
    window.location.replace('/auth');
  }
})();
