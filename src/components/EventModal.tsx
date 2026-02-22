import React, { useState, useEffect } from 'react';
import type { TimelineEvent } from '../types';
import { generateId } from '../utils';

interface Props {
  event?: TimelineEvent | null;
  onSave: (event: TimelineEvent) => void;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

export const EventModal: React.FC<Props> = ({ event, onSave, onClose, onDelete }) => {
  const [formData, setFormData] = useState<Partial<TimelineEvent>>({
    title: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    category: 'General',
    color: '#3b82f6',
    imageUrl: '',
    position: 'above',
    scale: 1.0
  });

  useEffect(() => {
    if (event) {
      setFormData({
        ...event,
        position: event.position || 'above',
        scale: event.scale || 1.0
      });
    }
  }, [event]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData as TimelineEvent,
      position: formData.position || 'above',
      scale: formData.scale || 1.0,
      id: event?.id || generateId()
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2 style={{ marginBottom: '1.5rem', marginTop: 0, color: 'var(--text-main)' }}>
          {event ? 'Edit Event' : 'New Event'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input 
              required 
              value={formData.title} 
              onChange={e => setFormData({ ...formData, title: e.target.value })} 
              placeholder="Event Title"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Start Date</label>
              <input 
                type="date" 
                required 
                value={formData.startDate} 
                onChange={e => setFormData({ ...formData, startDate: e.target.value })} 
              />
            </div>
            <div className="form-group">
              <label>End Date (Optional)</label>
              <input 
                type="date" 
                value={formData.endDate || ''} 
                onChange={e => setFormData({ ...formData, endDate: e.target.value || undefined })} 
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Position</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  type="button"
                  className={`btn ${formData.position === 'above' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, fontSize: '0.8rem', padding: '6px' }}
                  onClick={() => setFormData({ ...formData, position: 'above' })}
                >
                  Above
                </button>
                <button 
                  type="button"
                  className={`btn ${formData.position === 'below' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, fontSize: '0.8rem', padding: '6px' }}
                  onClick={() => setFormData({ ...formData, position: 'below' })}
                >
                  Below
                </button>
              </div>
            </div>
            <div className="form-group">
              <label>Event Size ({formData.scale?.toFixed(1)}x)</label>
              <input 
                type="range" 
                min="0.5" 
                max="2.0" 
                step="0.1"
                value={formData.scale || 1.0} 
                onChange={e => setFormData({ ...formData, scale: parseFloat(e.target.value) })}
                style={{ width: '100%', accentColor: 'var(--accent-color)' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Theme Color</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input 
                type="color" 
                value={formData.color} 
                onChange={e => setFormData({ ...formData, color: e.target.value })} 
                style={{ width: '40px', height: '32px', padding: 0, border: 'none', background: 'none' }}
              />
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{formData.color}</div>
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea 
              rows={2} 
              value={formData.description} 
              onChange={e => setFormData({ ...formData, description: e.target.value })} 
              placeholder="Tell a story..."
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <input 
              value={formData.category} 
              onChange={e => setFormData({ ...formData, category: e.target.value })} 
            />
          </div>

          <div className="form-group">
            <label>Color</label>
            <input 
              type="color" 
              value={formData.color} 
              onChange={e => setFormData({ ...formData, color: e.target.value })} 
            />
          </div>

          <div className="form-group">
            <label>Image URL</label>
            <input 
              value={formData.imageUrl} 
              onChange={e => setFormData({ ...formData, imageUrl: e.target.value })} 
              placeholder="https://..."
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
              Save Event
            </button>
            
            {event && onDelete && (
              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{ color: '#ef4444' }}
                onClick={() => onDelete(event.id)}
              >
                Delete
              </button>
            )}
            
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
