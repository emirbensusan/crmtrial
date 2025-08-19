// Accessibility Utilities
export const ARIA_LABELS = {
  // Navigation
  mainNavigation: 'Ana navigasyon',
  userMenu: 'Kullanıcı menüsü',
  breadcrumb: 'Sayfa konumu',
  
  // Actions
  edit: 'Düzenle',
  delete: 'Sil',
  view: 'Görüntüle',
  close: 'Kapat',
  save: 'Kaydet',
  cancel: 'İptal',
  
  // Status
  loading: 'Yükleniyor',
  error: 'Hata',
  success: 'Başarılı',
  warning: 'Uyarı',
  
  // Forms
  required: 'Zorunlu alan',
  optional: 'İsteğe bağlı alan',
  invalid: 'Geçersiz giriş',
  
  // Data
  sortAscending: 'Artan sıralama',
  sortDescending: 'Azalan sıralama',
  filterActive: 'Filtre aktif',
  searchResults: 'Arama sonuçları'
};

// Keyboard navigation helper
export const handleKeyboardNavigation = (
  event: React.KeyboardEvent,
  items: HTMLElement[],
  currentIndex: number,
  onSelect?: (index: number) => void
) => {
  let newIndex = currentIndex;
  
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      newIndex = Math.min(currentIndex + 1, items.length - 1);
      break;
    case 'ArrowUp':
      event.preventDefault();
      newIndex = Math.max(currentIndex - 1, 0);
      break;
    case 'Home':
      event.preventDefault();
      newIndex = 0;
      break;
    case 'End':
      event.preventDefault();
      newIndex = items.length - 1;
      break;
    case 'Enter':
    case ' ':
      event.preventDefault();
      if (onSelect) onSelect(currentIndex);
      return currentIndex;
    case 'Escape':
      event.preventDefault();
      items[0]?.blur();
      return -1;
  }
  
  if (newIndex !== currentIndex && items[newIndex]) {
    items[newIndex].focus();
  }
  
  return newIndex;
};

// Focus management
export const focusManager = {
  // Trap focus within an element
  trapFocus: (element: HTMLElement) => {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };
    
    element.addEventListener('keydown', handleTabKey);
    firstElement?.focus();
    
    return () => {
      element.removeEventListener('keydown', handleTabKey);
    };
  },
  
  // Return focus to previous element
  returnFocus: (previousElement: HTMLElement | null) => {
    if (previousElement && document.contains(previousElement)) {
      previousElement.focus();
    }
  }
};

// Color contrast checker
export const checkColorContrast = (foreground: string, background: string): boolean => {
  // Simplified contrast check - in production use a proper library
  const getLuminance = (color: string): number => {
    // This is a simplified version - use a proper color library in production
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;
    
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  
  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  
  return ratio >= 4.5; // WCAG AA standard
};

// Screen reader announcements
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};