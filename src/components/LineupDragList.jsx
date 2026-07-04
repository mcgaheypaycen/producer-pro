import React, { useState } from 'react';
import { icons } from '../assets/index.js';
import Icon, { IconButton } from './Icon.jsx';

export default function LineupDragList({
  entries,
  closed,
  onReorder,
  onRemove,
  onEditSegment,
  onEditAct,
  onAttachMedia,
}) {
  const [dragIdx, setDragIdx] = useState(null);
  const [overIdx, setOverIdx] = useState(null);

  const reorder = (from, to) => {
    if (from === null || to === null || from === to) return;
    onReorder(from, to);
  };

  const dragIcon = icons.action('drag');

  return (
    <div className="lineup">
      {entries.map((entry, i) => (
        <div
          key={entry.key || i}
          className={
            'lineup-row ' + entry.type +
            (dragIdx === i ? ' dragging' : '') +
            (overIdx === i && dragIdx !== i ? ' drop-target' : '')
          }
          onDragOver={(e) => {
            if (closed || dragIdx === null) return;
            e.preventDefault();
            setOverIdx(i);
          }}
          onDragLeave={() => { if (overIdx === i) setOverIdx(null); }}
          onDrop={(e) => {
            e.preventDefault();
            reorder(dragIdx, i);
            setDragIdx(null);
            setOverIdx(null);
          }}
        >
          {!closed ? (
            <button
              type="button"
              className="drag-handle"
              draggable
              title="Drag to reorder"
              onDragStart={(e) => {
                setDragIdx(i);
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', String(i));
              }}
              onDragEnd={() => { setDragIdx(null); setOverIdx(null); }}
            >
              <Icon src={dragIcon} size={16} alt="" />
            </button>
          ) : (
            <span className="drag-handle drag-handle-static" aria-hidden>
              <Icon src={dragIcon} size={16} alt="" />
            </span>
          )}
          <div className="marquee-numeral">{i + 1}</div>
          <div className="lineup-body">
            {entry.type === 'segment' ? (
              <>
                <div className="lineup-act-name">{entry.title}</div>
                <div className="lineup-seg-label">
                  <Icon src={icons.status('badge-segment')} size={12} alt="" />
                  Segment
                </div>
                {entry.notes && <div className="lineup-detail">{entry.notes}</div>}
              </>
            ) : (
              <>
                <div className="lineup-act-name">{entry.actName}</div>
                <div className="lineup-performer">{entry.performerName}</div>
                {(entry.tagline || entry.aesthetic) && (
                  <div className="lineup-detail">
                    {[entry.tagline ? `"${entry.tagline}"` : '', entry.aesthetic, entry.lightingNotes].filter(Boolean).join(' · ')}
                  </div>
                )}
              </>
            )}
          </div>
          <div className="lineup-meta">
            {entry.length && <span className="lineup-time">{entry.length}</span>}
            <span className={'media-badge ' + (entry.mediaFileId ? 'ok' : 'missing')}>
              <Icon
                src={icons.status(entry.mediaFileId ? 'badge-media-ok' : 'badge-media-missing')}
                size={12}
                alt=""
              />
              {entry.mediaFileId ? 'media' : 'no media'}
            </span>
          </div>
          {!closed && (
            <div className="lineup-actions">
              <IconButton src={icons.action('media')} title="Attach media" onClick={() => onAttachMedia(entry)} />
              <IconButton
                src={icons.action('edit')}
                title="Edit"
                onClick={() => entry.type === 'segment' ? onEditSegment(entry.key) : entry.act && onEditAct(entry.act.id)}
              />
              <IconButton src={icons.action('delete')} className="danger" title="Remove" onClick={() => onRemove(i)} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
