import { useState, useEffect, useRef } from 'react';
import { Plus, Download, Upload, Grid, Calendar, Settings, Info, X, Image } from 'lucide-react';
import { Timeline, type TimelineRef } from './components/Timeline';
import { EventModal } from './components/EventModal';
import type { TimelineEvent, TimelineSettings } from './types';
import { exportToJson, importFromJson, fetchGoogleSheet } from './utils';
import { themes } from './themes';
import './App.css';

function App() {
  const [events, setEvents] = useState<TimelineEvent[]>(() => {
    const saved = localStorage.getItem('timeline-data');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: '1',
        title: 'Welcome to Timeline Pro',
        description: 'Click me to edit or zoom in/out with your mouse wheel.',
        startDate: new Date().toISOString().split('T')[0],
        category: 'Getting Started',
        color: '#3b82f6',
        position: 'above',
        scale: 1.0
      }
    ];
  });
  
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [sheetId, setSheetId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<TimelineSettings>(() => {
    const saved = localStorage.getItem('timeline-settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!parsed.theme) parsed.theme = 'default-dark';
      return parsed;
    }
    return {
      showEventName: true,
      showEventDate: true,
      theme: 'default-dark'
    };
  });
  const timelineRef = useRef<TimelineRef>(null);

  const handleExportImage = async () => {
    if (timelineRef.current) {
      setIsExporting(true);
      await timelineRef.current.exportToImage();
      setIsExporting(false);
    }
  };

  // Apply theme styles to root
  useEffect(() => {
    const activeTheme = themes.find(t => t.id === settings.theme) || themes[0];
    const root = document.documentElement;
    root.style.setProperty('--bg-color', activeTheme.bg);
    root.style.setProperty('--sidebar-bg', activeTheme.sidebar);
    root.style.setProperty('--card-bg', activeTheme.card);
    root.style.setProperty('--text-main', activeTheme.text);
    root.style.setProperty('--text-muted', activeTheme.textMuted);
    root.style.setProperty('--accent-color', activeTheme.accent);
    root.style.setProperty('--border-color', activeTheme.border);
    root.style.setProperty('--canvas-grid', activeTheme.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.05)');
  }, [settings.theme]);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('timeline-data', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('timeline-settings', JSON.stringify(settings));
  }, [settings]);

  const handleSelectEvent = (event: TimelineEvent) => {
    setSelectedEvent(event);
    if (timelineRef.current) {
      timelineRef.current.centerOnDate(event.startDate);
    }
  };

  const handleSaveEvent = (event: TimelineEvent) => {
    setEvents(prev => {
      const idx = prev.findIndex(e => e.id === event.id);
      if (idx > -1) {
        const next = [...prev];
        next[idx] = event;
        return next;
      }
      return [...prev, event];
    });
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const handleExport = () => {
    exportToJson({ title: 'My Timeline', events });
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const data = await importFromJson(file);
        setEvents(data.events);
      } catch (err) {
        alert('Failed to import JSON file.');
      }
    }
  };

  const handleSheetImport = async () => {
    if (!sheetId) return;
    setIsLoading(true);
    try {
      const data = await fetchGoogleSheet(sheetId);
      setEvents(data);
    } catch (err) {
      alert('Failed to fetch Google Sheet. Make sure it is public (Published to Web as CSV).');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="sidebar">
        <h1 style={{ margin: '0 0 2rem 0', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Timeline <span style={{ color: 'var(--accent-color)' }}>Pro</span>
        </h1>

        <button 
          className="btn btn-primary" 
          style={{ marginBottom: '1.5rem' }}
          onClick={() => { setSelectedEvent(null); setIsModalOpen(true); }}
        >
          <Plus size={18} /> New Event
        </button>

        <div style={{ flex: 1, overflowY: 'auto', marginRight: '-1rem', paddingRight: '1rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Settings size={12} /> Canvas Settings
            </label>
            <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Theme</label>
                <select 
                  value={settings.theme} 
                  onChange={e => setSettings({ ...settings, theme: e.target.value })}
                  style={{ 
                    width: '100%', 
                    background: 'var(--bg-color)', 
                    color: 'var(--text-main)', 
                    border: '1px solid var(--border-color)',
                    padding: '4px',
                    borderRadius: '4px',
                    fontSize: '0.8rem'
                  }}
                >
                  {themes.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={settings.showEventName} 
                  onChange={e => setSettings({ ...settings, showEventName: e.target.checked })} 
                />
                Show Event Name
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={settings.showEventDate} 
                  onChange={e => setSettings({ ...settings, showEventDate: e.target.checked })} 
                />
                Show Event Date
              </label>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.75rem' }}>
              Events List
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {events.sort((a,b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()).map(event => (
                <div 
                  key={event.id}
                  onClick={() => handleSelectEvent(event)}
                  style={{
                    padding: '8px 12px',
                    background: selectedEvent?.id === event.id ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.03)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    borderLeft: `3px solid ${event.color}`,
                    fontSize: '0.875rem',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {event.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={12} /> {event.startDate}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Categories
            </label>
            <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {Array.from(new Set(events.map(e => e.category))).map(cat => (
                <div 
                  key={cat} 
                  style={{ 
                    padding: '3px 8px', 
                    background: 'rgba(255,255,255,0.07)', 
                    borderRadius: '12px', 
                    fontSize: '0.7rem' 
                  }}
                >
                  {cat}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="import-export">
          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            External Data
          </label>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={handleExport}>
                <Download size={16} /> JSON
              </button>
              <label className="btn btn-secondary" style={{ flex: 1, cursor: 'pointer' }}>
                <Upload size={16} /> Import
                <input type="file" hidden accept=".json" onChange={handleImport} />
              </label>
            </div>
            <button 
              className="btn btn-secondary" 
              style={{ width: '100%' }} 
              onClick={handleExportImage}
              disabled={isExporting}
            >
              <Image size={16} /> {isExporting ? 'Exporting...' : 'Export Image (Hi-Res)'}
            </button>
          </div>

          <div style={{ marginTop: '1rem', background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Grid size={14} /> Google Sheets
              </div>
              <button 
                onClick={() => setIsInfoOpen(true)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}
              >
                <Info size={14} />
              </button>
            </div>
            <input 
              className="sheet-input"
              style={{ 
                width: '100%', 
                background: '#0f172a', 
                border: '1px solid var(--border-color)', 
                borderRadius: '4px',
                padding: '0.4rem',
                color: 'white',
                fontSize: '0.75rem',
                marginBottom: '0.5rem'
              }}
              placeholder="Enter Sheet ID"
              value={sheetId}
              onChange={e => setSheetId(e.target.value)}
            />
            <button 
              className="btn btn-primary" 
              style={{ width: '100%', fontSize: '0.75rem', padding: '0.4rem' }}
              onClick={handleSheetImport}
              disabled={isLoading}
            >
              {isLoading ? 'Fetching...' : 'Fetch from Sheet'}
            </button>
            <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
              Must be "Published to Web" as CSV.
            </div>
          </div>
        </div>
      </div>

      <div className="main-content">
        <Timeline 
          ref={timelineRef}
          events={events} 
          selectedEventId={selectedEvent?.id}
          settings={settings}
          onEventClick={(event) => {
            setSelectedEvent(event);
            setIsModalOpen(true);
          }} 
        />
      </div>

      {isModalOpen && (
        <EventModal 
          event={selectedEvent}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedEvent(null);
          }}
        />
      )}

      {isInfoOpen && (
        <div className="modal-overlay" onClick={() => setIsInfoOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}>Google Sheets Import Guide</h2>
              <button onClick={() => setIsInfoOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
              <p>To import data, your Google Sheet must be <strong>"Published to the Web"</strong> as a <strong>CSV</strong>.</p>
              
              <h4 style={{ color: 'var(--accent-color)', marginBottom: '0.5rem' }}>Required Columns (Headers)</h4>
              <ul style={{ paddingLeft: '1.2rem' }}>
                <li><strong>title</strong>: The name of the event (text)</li>
                <li><strong>start date</strong>: Format YYYY-MM-DD (e.g., 2023-10-25)</li>
              </ul>

              <h4 style={{ color: 'var(--accent-color)', marginBottom: '0.5rem', marginTop: '1rem' }}>Optional Columns</h4>
              <ul style={{ paddingLeft: '1.2rem' }}>
                <li><strong>end date</strong>: YYYY-MM-DD (for range events)</li>
                <li><strong>description</strong>: Detailed text about the event</li>
                <li><strong>category</strong>: Group name for filtering</li>
                <li><strong>color</strong>: Hex code (e.g., #ff0000)</li>
                <li><strong>image</strong>: URL to an image</li>
              </ul>

              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <strong>How to publish:</strong> File &gt; Share &gt; Publish to web &gt; Select "Link", "Entire Document", and "Comma-separated values (.csv)". Copy the ID from the URL.
                </p>
              </div>
            </div>
            
            <button className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }} onClick={() => setIsInfoOpen(false)}>
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
