import React, { useRef, useState, useMemo, useImperativeHandle, forwardRef, useEffect } from 'react';
import type { TimelineEvent, TimelineSettings } from '../types';
import { format, differenceInDays, addDays, startOfYear, startOfMonth } from 'date-fns';
import { toPng } from 'html-to-image';

export interface TimelineRef {
  centerOnDate: (dateStr: string) => void;
  exportToImage: () => Promise<void>;
}

interface Props {
  events: TimelineEvent[];
  onEventClick: (event: TimelineEvent) => void;
  selectedEventId?: string | null;
  settings: TimelineSettings;
}

export const Timeline = forwardRef<TimelineRef, Props>(({ events, onEventClick, selectedEventId, settings }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.2); 
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);

  const referenceDate = useMemo(() => new Date(1970, 0, 1), []);

  const centerOnDate = (dateStr: string) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return;
    
    const days = differenceInDays(date, referenceDate);
    const targetX = rect.width / 2;
    setOffset(targetX - days * scale);
  };

  const [isExporting, setIsExportingLocal] = useState(false);

  const exportToImage = async () => {
    if (!containerRef.current || events.length === 0) return;
    
    setIsExportingLocal(true);
    const sorted = [...events].sort((a,b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    const firstDate = new Date(sorted[0].startDate);
    const lastDate = new Date(sorted[sorted.length - 1].endDate || sorted[sorted.length - 1].startDate);
    
    const originalScale = scale;
    const originalOffset = offset;
    
    // Improved framing: focus strictly on the event span
    const exportWidth = 2400; 
    const exportHeight = 1200;
    const daysSpan = Math.max(7, differenceInDays(lastDate, firstDate));
    
    // Fit to 85% of width for better padding
    const newScale = (exportWidth * 0.85) / daysSpan;
    // Offset to start at 7.5% mark
    const newOffset = (exportWidth * 0.075) - differenceInDays(firstDate, referenceDate) * newScale;
    
    setScale(newScale);
    setOffset(newOffset);

    // Wait longer for full high-res re-render
    await new Promise(r => setTimeout(r, 1200));

    try {
      const dataUrl = await toPng(containerRef.current, { 
        width: exportWidth, 
        height: exportHeight,
        pixelRatio: 2.5,
        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--bg-color').trim() || '#020617',
        style: {
          width: `${exportWidth}px`,
          height: `${exportHeight}px`,
          transform: 'none',
          position: 'relative'
        }
      });
      const link = document.createElement('a');
      link.download = `timeline-pro-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      alert('High-res export failed.');
      console.error(err);
    } finally {
      setScale(originalScale);
      setOffset(originalOffset);
      setIsExportingLocal(false);
    }
  };

  useImperativeHandle(ref, () => ({
    centerOnDate,
    exportToImage
  }));

  // Center on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      centerOnDate(new Date().toISOString());
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const getX = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 0;
    const days = differenceInDays(date, referenceDate);
    return days * scale + offset;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isExporting) return;
    setIsDragging(true);
    setStartX(e.clientX - offset);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || isExporting) return;
    setOffset(e.clientX - startX);
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    if (isExporting) return;
    const delta = e.deltaY;
    const factor = delta > 0 ? 0.8 : 1.2;
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const mouseX = e.clientX - rect.left;
    const dateAtMouse = (mouseX - offset) / scale;
    
    const newScale = Math.max(0.0001, Math.min(1000, scale * factor));
    const newOffset = mouseX - dateAtMouse * newScale;
    
    setScale(newScale);
    setOffset(newOffset);
  };

  const markers = useMemo(() => {
    const m = [];
    const exportW = 2400;
    const width = isExporting ? exportW : (containerRef.current?.clientWidth || window.innerWidth);
    
    const startDay = Math.floor(-offset / scale);
    const endDay = Math.floor((width - offset) / scale);

    let step: 'day' | 'month' | 'year' = 'year';
    let interval = 1;

    if (scale > 15) step = 'day';
    else if (scale > 1.5) step = 'month';
    else if (scale > 0.1) step = 'year';
    else if (scale > 0.01) { step = 'year'; interval = 10; }
    else if (scale > 0.001) { step = 'year'; interval = 100; }
    else { step = 'year'; interval = 1000; }

    const startDate = addDays(referenceDate, startDay);
    const endDate = addDays(referenceDate, endDay);

    let current = step === 'day' ? startDate : 
                step === 'month' ? startOfMonth(startDate) : 
                startOfYear(startDate);

    let count = 0;
    while (current <= endDate && count < 400) {
      const days = differenceInDays(current, referenceDate);
      const x = days * scale + offset;
      
      let label = '';
      let isMajor = false;

      if (step === 'day') {
        label = format(current, 'd MMM');
        isMajor = current.getDate() === 1;
      } else if (step === 'month') {
        label = format(current, 'MMM yyyy');
        isMajor = current.getMonth() === 0;
      } else {
        const year = current.getFullYear();
        if (year % interval === 0) {
          label = year.toString();
          isMajor = year % (interval * 10) === 0;
        }
      }

      if (label) m.push({ x, label, isMajor });

      if (step === 'day') current = addDays(current, 1);
      else if (step === 'month') current = addDays(startOfMonth(addDays(current, 32)), 0);
      else current = startOfYear(addDays(current, 366 * interval));
      
      count++;
    }
    return m;
  }, [scale, offset, referenceDate, isExporting]);

  return (
    <div 
      ref={containerRef}
      className={`timeline-canvas ${isExporting ? 'exporting' : ''}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      style={{ 
        background: 'var(--bg-color)', 
        width: '100%', 
        height: '100%', 
        position: 'relative', 
        overflow: isExporting ? 'visible' : 'hidden',
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
    >
      <div className="grid-overlay" style={{ 
        backgroundSize: `${Math.max(20, scale * 30)}px 100%`,
        backgroundImage: 'linear-gradient(to right, var(--canvas-grid) 1px, transparent 1px)'
      }} />

      {/* Central Horizontal Line - Using explicit wide bounds for export safety */}
      <div 
        style={{
          position: 'absolute',
          left: -50000,
          right: -50000,
          width: '100000px',
          top: '50%',
          height: '4px',
          background: 'var(--text-main)',
          opacity: 0.15,
          zIndex: 1,
          transform: 'translateY(-50%)'
        }}
      />

      {markers.map((m, i) => (
        <div 
          key={i}
          className={`time-marker ${m.isMajor ? 'major' : ''}`}
          style={{ 
            left: m.x, 
            zIndex: 5,
            top: '50%',
            transform: 'translate(-50%, -50%)',
            height: 'auto',
            border: 'none'
          }}
        >
          {/* Central Dot */}
          <div 
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--accent-color)',
              opacity: 0.8,
              border: '1px solid var(--bg-color)',
              marginBottom: '20px'
            }}
          />
          <span className="marker-label" style={{ 
            position: 'absolute',
            top: '14px',
            transform: 'translateX(-50%)'
          }}>
            {m.label}
          </span>
        </div>
      ))}

      {events.map((event, i) => {
        const x = getX(event.startDate);
        const isAbove = event.position !== 'below';
        const layer = (i % 3);
        const eventScale = event.scale || 1.0;
        const isPeriod = event.type === 'period';
        const isPercentage = event.type === 'percentage';
        
        const verticalOffset = isAbove 
          ? (120 * eventScale + layer * 70 * eventScale) 
          : (60 + layer * 70 * eventScale);
        
        const isSelected = selectedEventId === event.id;
        const width = event.endDate ? (getX(event.endDate) - x) : 0;
        
        return (
          <React.Fragment key={event.id}>
            {/* Period Background Block */}
            {isPeriod && event.endDate && (
              <div 
                style={{
                  position: 'absolute',
                  left: x,
                  width: Math.max(width, 2),
                  top: '50%',
                  height: isAbove ? `calc(${verticalOffset}px + 40px)` : `${verticalOffset}px`,
                  transform: isAbove ? 'translateY(-100%)' : 'translateY(0)',
                  background: event.color,
                  opacity: 0.05,
                  zIndex: 0,
                  pointerEvents: 'none'
                }}
              />
            )}

            {/* Connector Line */}
            <div 
              style={{
                position: 'absolute',
                left: x + 4,
                top: isAbove ? `calc(50% - ${verticalOffset}px + ${40 * eventScale}px)` : '50%',
                width: '1px',
                height: isAbove ? `calc(${verticalOffset}px - ${40 * eventScale}px)` : `${verticalOffset}px`,
                background: event.color,
                opacity: 0.4,
                zIndex: 2
              }}
            />

            {(event.endDate || isPeriod) && (
              <div 
                className="event-range-bar"
                style={{
                  left: x,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: Math.max(width, 4),
                  background: event.color,
                  boxShadow: isSelected ? `0 0 12px ${event.color}` : 'none',
                  zIndex: 3,
                  opacity: isPeriod ? 0.8 : 0.4,
                  height: isPeriod ? '8px' : '4px'
                }}
              />
            )}
            <div 
              className={`event-card ${isSelected ? 'selected' : ''}`}
              style={{ 
                left: x, 
                top: isAbove ? `calc(50% - ${verticalOffset}px)` : `calc(50% + ${verticalOffset}px)`,
                borderLeftColor: event.color,
                zIndex: isSelected ? 100 : 20,
                width: `${200 * eventScale}px`,
                transform: `scale(${eventScale})`,
                transformOrigin: isAbove ? 'bottom left' : 'top left',
                position: 'absolute'
              }}
              onClick={(e) => {
                e.stopPropagation();
                onEventClick(event);
              }}
            >
              <div className="event-dot" style={{ background: event.color }} />
              <div className="event-content">
                {settings.showEventName && <div className="event-title" style={{ whiteSpace: 'normal', overflow: 'visible' }}>{event.title}</div>}
                
                {isPercentage && (
                  <div style={{ marginTop: '6px', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '2px' }}>
                      <span>Progress</span>
                      <span>{event.value}%</span>
                    </div>
                    <div style={{ height: '4px', background: 'rgba(0,0,0,0.2)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: `${event.value}%`, height: '100%', background: event.color }} />
                    </div>
                  </div>
                )}

                {settings.showEventDate && (
                  <div className="event-date">
                    {format(new Date(event.startDate), 'MMM d, yyyy')}
                  </div>
                )}
              </div>
            </div>
          </React.Fragment>
        );
      })}

      {!isExporting && (
        <div className="zoom-controls">
          <button className="btn-fab" onClick={() => setScale(s => s * 1.5)}>+</button>
          <button className="btn-fab" onClick={() => setScale(s => s * 0.7)}>-</button>
          <button className="btn-fab" onClick={() => centerOnDate(new Date().toISOString())}>🎯</button>
        </div>
      )}
    </div>
  );
});



