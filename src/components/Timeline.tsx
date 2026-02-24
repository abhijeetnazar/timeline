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
  const [isExporting, setIsExportingLocal] = useState(false);

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

  const exportToImage = async () => {
    if (!containerRef.current || events.length === 0) return;
    
    setIsExportingLocal(true);
    const sorted = [...events].sort((a,b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    const firstDate = new Date(sorted[0].startDate);
    const lastDate = new Date(sorted[sorted.length - 1].endDate || sorted[sorted.length - 1].startDate);
    
    const originalScale = scale;
    const originalOffset = offset;
    
    const exportWidth = 2400; 
    const exportHeight = 1200;
    const daysSpan = Math.max(7, differenceInDays(lastDate, firstDate));
    
    const newScale = (exportWidth * 0.8) / daysSpan;
    const newOffset = (exportWidth * 0.1) - differenceInDays(firstDate, referenceDate) * newScale;
    
    setScale(newScale);
    setOffset(newOffset);

    await new Promise(r => setTimeout(r, 1000));

    try {
      const dataUrl = await toPng(containerRef.current, { 
        width: exportWidth, 
        height: exportHeight,
        pixelRatio: 2,
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
      alert('Export failed.');
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
      {/* Central Axis Line */}
      <div 
        style={{
          position: 'absolute',
          left: -100000,
          width: '200000px',
          top: '50%',
          height: '4px',
          background: 'rgba(255, 255, 255, 0.4)',
          zIndex: 1,
          transform: 'translateY(-50%)'
        }}
      />

      {/* Current Date Marker */}
      <div className="current-date-marker" style={{ left: getX(new Date().toISOString()) }} />

      {/* Markers */}
      {markers.map((m, i) => (
        <div 
          key={i}
          style={{ 
            position: 'absolute',
            left: m.x, 
            zIndex: 5,
            top: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          {m.isMajor ? (
            <div 
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: '#ffffff',
                marginBottom: '30px'
              }}
            />
          ) : (
            <div className="axis-tick" style={{ top: '50%', transform: 'translateY(-50%)', marginBottom: '30px' }} />
          )}
          <span style={{ 
            position: 'absolute',
            top: '18px',
            fontSize: m.isMajor ? '14px' : '11px',
            fontWeight: m.isMajor ? '800' : '600',
            color: '#ffffff',
            opacity: m.isMajor ? 1 : 0.6,
            whiteSpace: 'nowrap'
          }}>
            {m.label}
          </span>
        </div>
      ))}

      {events.map((event, i) => {
        const x = getX(event.startDate);
        const isAbove = event.position !== 'below';
        const layer = (i % 4);
        const eventScale = event.scale || 1.0;
        const isPercentage = event.type === 'percentage';
        const isEvent = event.type === 'event' || !event.type;
        
        // Base distance from center
        const verticalOffset = isAbove 
          ? (70 + layer * 50) * eventScale 
          : (40 + layer * 50) * eventScale;
        
        const isSelected = selectedEventId === event.id;
        const width = event.endDate ? (getX(event.endDate) - x) : 50;

        if (isEvent) {
          return (
            <React.Fragment key={event.id}>
              <div 
                className="connector-dashed"
                style={{
                  left: x,
                  top: isAbove ? `calc(50% - ${verticalOffset}px)` : '50%',
                  height: `${verticalOffset}px`,
                  borderColor: event.color
                }}
              />
              <div 
                className={`event-bubble ${isAbove ? 'above' : 'below'} ${isSelected ? 'selected' : ''}`}
                style={{ 
                  left: x, 
                  top: isAbove ? `calc(50% - ${verticalOffset}px - 36px)` : `calc(50% + ${verticalOffset}px)`,
                  background: event.color,
                  color: event.color, // For the CSS triangle inheritance
                  transform: `translateX(-50%) scale(${eventScale})`,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onEventClick(event);
                }}
              >
                <span style={{ color: '#ffffff' }}>
                  {settings.showEventName ? event.title : 'Event'}
                </span>
              </div>
            </React.Fragment>
          );
        }

        // Period or Percentage
        return (
          <React.Fragment key={event.id}>
            <div 
              style={{
                position: 'absolute',
                left: x,
                top: isAbove ? `calc(50% - ${verticalOffset}px)` : `calc(50% + ${verticalOffset}px)`,
                zIndex: isSelected ? 100 : 20,
                transform: `scale(${eventScale})`,
                transformOrigin: 'left center'
              }}
              onClick={(e) => {
                e.stopPropagation();
                onEventClick(event);
              }}
            >
              <div 
                className="bar-label" 
                style={{ 
                  color: event.color, 
                  top: isAbove ? '-22px' : '22px' 
                }}
              >
                {isPercentage ? `${event.value}%, ` : ''}{settings.showEventName ? event.title : ''}
              </div>
              
              <div 
                className={`thick-bar ${isSelected ? 'selected' : ''}`}
                style={{
                  width: Math.max(width, 20),
                  background: isPercentage ? `${event.color}44` : event.color,
                }}
              >
                {isPercentage && (
                  <div 
                    style={{ 
                      width: `${event.value}%`, 
                      height: '100%', 
                      background: event.color, 
                      borderRadius: 'inherit' 
                    }} 
                  />
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
