import type { Theme } from './types';

export const themes: Theme[] = [
  // DARK THEMES (5)
  {
    id: 'default-dark',
    name: 'Deep Midnight',
    isDark: true,
    bg: '#020617',
    sidebar: '#0f172a',
    card: 'rgba(30, 41, 59, 0.7)',
    text: '#f8fafc',
    textMuted: '#94a3b8',
    accent: '#3b82f6',
    border: 'rgba(148, 163, 184, 0.15)'
  },
  {
    id: 'dracula',
    name: 'Dracula',
    isDark: true,
    bg: '#282a36',
    sidebar: '#44475a',
    card: 'rgba(68, 71, 90, 0.7)',
    text: '#f8f8f2',
    textMuted: '#6272a4',
    accent: '#bd93f9',
    border: 'rgba(98, 114, 164, 0.3)'
  },
  {
    id: 'nord-dark',
    name: 'Nordic Night',
    isDark: true,
    bg: '#2e3440',
    sidebar: '#3b4252',
    card: 'rgba(67, 76, 94, 0.7)',
    text: '#eceff4',
    textMuted: '#d8dee9',
    accent: '#88c0d0',
    border: 'rgba(76, 86, 106, 0.3)'
  },
  {
    id: 'forest-dark',
    name: 'Forest Mist',
    isDark: true,
    bg: '#061a15',
    sidebar: '#0b261f',
    card: 'rgba(15, 46, 38, 0.7)',
    text: '#ecfdf5',
    textMuted: '#6ee7b7',
    accent: '#10b981',
    border: 'rgba(16, 185, 129, 0.2)'
  },
  {
    id: 'crimson-dark',
    name: 'Crimson Ember',
    isDark: true,
    bg: '#1a0606',
    sidebar: '#260b0b',
    card: 'rgba(46, 15, 15, 0.7)',
    text: '#fef2f2',
    textMuted: '#fca5a5',
    accent: '#ef4444',
    border: 'rgba(239, 68, 68, 0.2)'
  },
  
  // LIGHT THEMES (5)
  {
    id: 'light-clean',
    name: 'Pure Snow',
    isDark: false,
    bg: '#ffffff',
    sidebar: '#f1f5f9',
    card: 'rgba(255, 255, 255, 0.9)',
    text: '#0f172a',
    textMuted: '#475569',
    accent: '#2563eb',
    border: 'rgba(148, 163, 184, 0.4)'
  },
  {
    id: 'soft-sepia',
    name: 'Vintage Paper',
    isDark: false,
    bg: '#fdf6e3',
    sidebar: '#eee8d5',
    card: 'rgba(252, 249, 238, 0.9)',
    text: '#586e75',
    textMuted: '#839496',
    accent: '#b58900',
    border: 'rgba(147, 161, 161, 0.4)'
  },
  {
    id: 'ocean-light',
    name: 'Ocean Breeze',
    isDark: false,
    bg: '#f0f9ff',
    sidebar: '#e0f2fe',
    card: 'rgba(255, 255, 255, 0.9)',
    text: '#0c4a6e',
    textMuted: '#0ea5e9',
    accent: '#0284c7',
    border: 'rgba(2, 132, 199, 0.3)'
  },
  {
    id: 'rose-light',
    name: 'Rose Garden',
    isDark: false,
    bg: '#fff1f2',
    sidebar: '#ffe4e6',
    card: 'rgba(255, 255, 255, 0.9)',
    text: '#881337',
    textMuted: '#fb7185',
    accent: '#e11d48',
    border: 'rgba(225, 29, 72, 0.2)'
  },
  {
    id: 'emerald-light',
    name: 'Emerald Day',
    isDark: false,
    bg: '#f0fdf4',
    sidebar: '#dcfce7',
    card: 'rgba(255, 255, 255, 0.9)',
    text: '#064e3b',
    textMuted: '#10b981',
    accent: '#059669',
    border: 'rgba(5, 150, 105, 0.2)'
  }
];
