export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  category: string;
  imageUrl?: string;
  color: string;
  position: 'above' | 'below';
  scale: number; // 1.0 is default
}

export interface TimelineData {
  title: string;
  events: TimelineEvent[];
}

export interface TimelineSettings {
  showEventName: boolean;
  showEventDate: boolean;
  theme: string;
}

export interface Theme {
  id: string;
  name: string;
  isDark: boolean;
  bg: string;
  sidebar: string;
  card: string;
  text: string;
  textMuted: string;
  accent: string;
  border: string;
}
