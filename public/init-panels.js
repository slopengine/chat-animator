// This runs before Remotion Studio loads
// Set sidebars to expanded by default
(function() {
  if (typeof localStorage !== 'undefined') {
    // Only set if not already configured by user
    if (!localStorage.getItem('remotion.sidebarRightCollapsing')) {
      localStorage.setItem('remotion.sidebarRightCollapsing', 'expanded');
    }
    if (!localStorage.getItem('remotion.sidebarCollapsing')) {
      localStorage.setItem('remotion.sidebarCollapsing', 'expanded');
    }
    console.log('[Chat Animator] Default panels set to expanded');
  }
})();
