import type { TimelineData, TimelineEvent } from './types';

export const generateId = () => Math.random().toString(36).substr(2, 9);

export const exportToJson = (data: TimelineData) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `timeline-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const importFromJson = async (file: File): Promise<TimelineData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        resolve(data);
      } catch (err) {
        reject(err);
      }
    };
    reader.readAsText(file);
  });
};

export const importFromCsv = async (csvText: string): Promise<TimelineEvent[]> => {
  const lines = csvText.split(/\r?\n/);
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  
  return lines.slice(1).filter(line => line.trim()).map(line => {
    const values = line.split(',').map(v => v.trim());
    const event: any = { id: generateId() };
    
    headers.forEach((header, i) => {
      if (header === 'title') event.title = values[i];
      if (header === 'description') event.description = values[i];
      if (header === 'start date') event.startDate = values[i];
      if (header === 'end date') event.endDate = values[i] || undefined;
      if (header === 'category') event.category = values[i];
      if (header === 'image') event.imageUrl = values[i];
      if (header === 'color') event.color = values[i];
    });
    
    // Fallbacks
    if (!event.title) event.title = 'Untitled Event';
    if (!event.startDate) event.startDate = new Date().toISOString().split('T')[0];
    if (!event.category) event.category = 'General';
    if (!event.color) event.color = '#3b82f6';
    
    return event as TimelineEvent;
  });
};

export const fetchGoogleSheet = async (sheetId: string): Promise<TimelineEvent[]> => {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
  const response = await fetch(url);
  const csvText = await response.text();
  return importFromCsv(csvText);
};
