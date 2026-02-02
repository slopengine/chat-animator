import { registerRoot } from 'remotion';
import { RemotionRoot } from './Root';

// Set default panel states to open (only if not already set by user)
// Remotion uses 'expanded' | 'collapsed' | 'responsive' as values
if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
  // Right sidebar (props panel) - must be 'expanded' to show
  if (localStorage.getItem('remotion.sidebarRightCollapsing') === null) {
    localStorage.setItem('remotion.sidebarRightCollapsing', 'expanded');
  }
  // Left sidebar - 'responsive' or 'expanded'
  if (localStorage.getItem('remotion.sidebarCollapsing') === null) {
    localStorage.setItem('remotion.sidebarCollapsing', 'expanded');
  }
}

registerRoot(RemotionRoot);
