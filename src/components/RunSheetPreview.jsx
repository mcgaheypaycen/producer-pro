import React from 'react';
import { RUN_SHEET_FIELD_LABELS } from '../../shared/runSheetConfig.js';
import { brand } from '../assets/index.js';

function spanStyle(style) {
  return {
    fontFamily: style.fontFamily,
    fontSize: `${style.fontSize}pt`,
    fontWeight: style.bold ? 700 : 400,
    fontStyle: style.italic ? 'italic' : 'normal',
    color: '#000',
  };
}

const SAMPLE_SHOW = {
  title: 'Velvet Nights',
  meta: 'Friday, June 12, 2026  ·  The Red Curtain  ·  Tickets: $25.00',
};

const SAMPLE_SEGMENT = {
  title: 'Host welcome',
  length: '5:00',
  notes: 'Greet the crowd, thank sponsors, and introduce the evening.',
};

const SAMPLE_ACT = {
  performerName: 'Velvet Thunder',
  actName: 'Feathers & Fire',
  tagline: 'A slow burn across the stage',
  aesthetic: 'Art deco glam',
  length: '4:30',
  lightingNotes: 'Deep red wash, follow spot on entrance',
  stageNotes: 'Chair center stage',
};

const ACT_FIELD_VALUES = {
  aesthetic: (e) => e.aesthetic,
  length: (e) => e.length,
  lighting: (e) => e.lightingNotes,
  stage: (e) => e.stageNotes,
};

export default function RunSheetPreview({ options }) {
  const { fields, typography: t } = options;
  const lengthFieldEnabled = fields.some((f) => f.key === 'length' && f.enabled);
  const enabledFields = fields.filter((f) => f.enabled);

  return (
    <div className="run-sheet-preview">
      <div className="run-sheet-preview-toolbar">
        <div>
          <div className="run-sheet-preview-title">Run sheet</div>
          <div className="run-sheet-preview-sub">Page preview of the exported document</div>
        </div>
        <img src={brand.sampleWatermark()} alt="Sample" className="run-sheet-preview-badge" />
      </div>

      <div className="run-sheet-preview-stage">
        <div className="run-sheet-page" role="document" aria-label="Run sheet page preview">
          <div className="run-sheet-document">
            <div style={spanStyle(t.showTitle)}>{SAMPLE_SHOW.title}</div>
            <div style={{ ...spanStyle(t.showMeta), marginTop: '0.35em' }}>{SAMPLE_SHOW.meta}</div>

            <div className="run-sheet-preview-body">
              <div className="run-sheet-preview-entry">
                <div>
                  <span style={spanStyle(t.positionNumber)}>1. </span>
                  <span style={spanStyle(t.segmentTitle)}>{SAMPLE_SEGMENT.title}</span>
                </div>
                {SAMPLE_SEGMENT.length && lengthFieldEnabled && (
                  <div style={{ ...spanStyle(t.segmentLength), marginTop: '0.25em' }}>
                    Length: {SAMPLE_SEGMENT.length}
                  </div>
                )}
                {SAMPLE_SEGMENT.notes && (
                  <div style={{ ...spanStyle(t.segmentNotes), marginTop: '0.25em' }}>
                    {SAMPLE_SEGMENT.notes}
                  </div>
                )}
              </div>

              <div className="run-sheet-preview-spacer" aria-hidden />

              <div className="run-sheet-preview-entry">
                <div>
                  <span style={spanStyle(t.positionNumber)}>2. </span>
                  <span style={spanStyle(t.performerName)}>{SAMPLE_ACT.performerName}</span>
                  <span style={{ color: '#000' }}> – </span>
                  <span style={spanStyle(t.actName)}>{SAMPLE_ACT.actName}</span>
                </div>
                {SAMPLE_ACT.tagline && (
                  <div style={{ ...spanStyle(t.tagline), marginTop: '0.25em' }}>{SAMPLE_ACT.tagline}</div>
                )}
                {enabledFields.map((field) => {
                  const val = ACT_FIELD_VALUES[field.key](SAMPLE_ACT);
                  if (!val) return null;
                  const valueStyle = t[field.key] || t.aesthetic;
                  return (
                    <div key={field.key} style={{ marginTop: '0.25em' }}>
                      <span style={spanStyle(t.fieldLabel)}>{RUN_SHEET_FIELD_LABELS[field.key]}: </span>
                      <span style={spanStyle(valueStyle)}>{val}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
