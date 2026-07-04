import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useData } from '../data.jsx';
import { useTopBar } from '../shell.jsx';
import { Modal, Field, SearchInput, EmptyState, useToast, money, formatDate, StatusBadge, formatRuntime, parseMinutes } from '../ui.jsx';
import { illustrations, icons } from '../assets/index.js';
import Icon, { IconButton, BtnWithIcon } from '../components/Icon.jsx';
import PackageProgressIcon from '../components/PackageProgressIcon.jsx';
import { normalizeRunSheetOptions } from '../../shared/runSheetConfig.js';
import { useAuth } from '../auth.jsx';
import { RUN_SHEET_FONTS } from '../lib/fonts.js';
import { createShowPackageInDrive } from '../lib/showPackage.js';
import { exportSettlement, settlementFilename } from '../lib/closeoutCsv.js';
import { toastDriveError } from '../lib/mediaUpload.js';
import CloseoutFinalizeModal from '../components/CloseoutFinalizeModal.jsx';
import SettlementExportModal from '../components/SettlementExportModal.jsx';
import MediaPickerModal from '../components/MediaPickerModal.jsx';
import { ActFormModal } from './ActsPage.jsx';
import { VenueFormModal } from './VenuesPage.jsx';
import CloseoutPanel from './CloseoutPanel.jsx';
import LineupDragList from '../components/LineupDragList.jsx';
import RunSheetPreview from '../components/RunSheetPreview.jsx';
import RunSheetStylePanel from '../components/RunSheetStylePanel.jsx';

function newKey() {
  return Math.random().toString(36).slice(2, 10);
}

function PackagePreviewDialog({ stats, onConfirm, onClose, busy, progressPhase }) {
  return (
    <Modal
      title="Generate package"
      onClose={onClose}
      footer={
        <>
          <button className="btn ghost" onClick={onClose} disabled={busy}>Cancel</button>
          <BtnWithIcon
            icon={busy ? null : icons.action('export')}
            className="btn primary"
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? 'Generating…' : 'Generate package'}
          </BtnWithIcon>
        </>
      }
    >
      <div className="package-preview-header">
        <PackageProgressIcon phase={busy ? progressPhase : 'idle'} size={48} />
        <p style={{ color: 'var(--on-paper-muted)', margin: 0 }}>
          The package folder will be created in your Google Drive. It will include:
        </p>
      </div>
      <div className="package-preview">
        <div className="package-preview-item">{stats.mediaCount} media file{stats.mediaCount === 1 ? '' : 's'} will be copied & renamed</div>
        {stats.missingCount > 0 && (
          <div className="package-preview-item warn">
            <Icon src={icons.action('warning')} size={18} alt="" />
            {stats.missingCount} act{stats.missingCount === 1 ? '' : 's'} ha{stats.missingCount === 1 ? 's' : 've'} no media — will be skipped
          </div>
        )}
        <div className="package-preview-item">1 run sheet (RTF) using your typography settings</div>
      </div>
    </Modal>
  );
}

function AddActModal({ onPick, onClose }) {
  const { acts, performers } = useData();
  const [query, setQuery] = useState('');
  const [creating, setCreating] = useState(false);

  const performerName = (id) => performers.find((p) => p.id === id)?.stageName || 'Unknown performer';

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return acts
      .filter((a) => !q || [a.name, performerName(a.performerId), a.aesthetic, a.tagline].some((s) => (s || '').toLowerCase().includes(q)))
      .sort((a, b) => performerName(a.performerId).localeCompare(performerName(b.performerId)) || (a.name || '').localeCompare(b.name || ''));
  }, [acts, performers, query]);

  if (creating) {
    return (
      <ActFormModal
        onClose={() => setCreating(false)}
        onSaved={(saved) => { onPick(saved); onClose(); }}
      />
    );
  }

  return (
    <Modal
      title="Add act to running order"
      onClose={onClose}
      footer={
        <>
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <BtnWithIcon icon={icons.action('add')} className="btn secondary" onClick={() => setCreating(true)}>Add act</BtnWithIcon>
        </>
      }
    >
      <div style={{ marginBottom: 12 }}>
        <SearchInput value={query} onChange={setQuery} placeholder="Search act library…" />
      </div>
      {filtered.length === 0 ? (
        <div style={{ color: 'var(--on-paper-muted)', padding: '24px 4px', textAlign: 'center' }}>
          {acts.length === 0 ? 'No acts in your library yet.' : 'No acts match your search.'}
        </div>
      ) : (
        <div className="picker-list">
          {filtered.map((a) => (
            <button key={a.id} className="picker-item" onClick={() => { onPick(a); onClose(); }}>
              <div>
                <div className="picker-name">{a.name}</div>
                <div className="picker-sub">{performerName(a.performerId)}{a.length ? ` · ${a.length}` : ''}</div>
              </div>
              <span style={{ color: 'var(--wine-600)' }}>
                <Icon src={icons.action('add')} size={16} alt="" />
              </span>
            </button>
          ))}
        </div>
      )}
    </Modal>
  );
}

function SegmentModal({ segment, onSave, onClose }) {
  const [form, setForm] = useState({
    title: '', length: '', notes: '', mediaFileId: '', mediaName: '', mediaLink: '', ...segment,
  });
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const { ensureDriveFolderId } = useAuth();
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleMediaSelected = (file) => {
    setForm((f) => ({
      ...f,
      mediaFileId: file.fileId,
      mediaName: file.name,
      mediaLink: file.link,
      ...(file.length ? { length: file.length } : {}),
    }));
  };

  const submit = () => {
    if (!form.title.trim()) {
      toast('Title required', 'Give this segment a title.', 'error');
      return;
    }
    onSave(form);
    onClose();
  };

  return (
    <Modal
      title={segment ? 'Edit segment' : 'Add segment'}
      onClose={onClose}
      footer={
        <>
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <BtnWithIcon icon={icons.action('add')} className="btn primary" onClick={submit}>
            {segment ? 'Save segment' : 'Add to running order'}
          </BtnWithIcon>
        </>
      }
    >
      <div className="form-grid">
        <Field label="Segment title" full>
          <input className="input" value={form.title} onChange={set('title')} placeholder="Host welcome, raffle, announcements…" autoFocus />
        </Field>
        <Field label="Length" full helper='Editable anytime — auto-fills from audio/video media; images keep your entered length'>
          <input className="input" value={form.length} onChange={set('length')} placeholder="5:00" />
        </Field>
        <Field label="Notes" full>
          <textarea className="textarea" value={form.notes} onChange={set('notes')} placeholder="Talking points, cues, anything the run sheet should say…" />
        </Field>
        <Field label="Media file" full helper="Choose from Google Drive or upload from your computer">
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <button className="btn secondary sm" onClick={() => setShowMediaPicker(true)} type="button">
              {form.mediaFileId ? 'Replace media' : 'Choose media'}
            </button>
            {form.mediaFileId ? (
              <>
                <span className="media-badge ok">
                  <Icon src={icons.status('badge-media-ok')} size={12} alt="" />
                  {form.mediaName}
                </span>
                <IconButton
                  src={icons.action('delete')}
                  className="danger"
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, mediaFileId: '', mediaName: '', mediaLink: '' }))}
                  title="Remove media"
                />
              </>
            ) : (
              <span style={{ color: 'var(--on-paper-muted)', fontSize: 13 }}>No file attached</span>
            )}
          </div>
        </Field>
      </div>
      {showMediaPicker && (
        <MediaPickerModal
          getMediaFolderId={ensureDriveFolderId}
          onClose={() => setShowMediaPicker(false)}
          onSelect={handleMediaSelected}
        />
      )}
    </Modal>
  );
}

export default function ShowEditor({ showId, onBack }) {
  const { shows, acts, performers, venues, save } = useData();
  const toast = useToast();
  const { ensureDriveFolderId, signIn } = useAuth();
  const show = shows.find((s) => s.id === showId);
  const [zone, setZone] = useState(() => (show?.status === 'closed' ? 'closeout' : 'order'));
  const [addingAct, setAddingAct] = useState(false);
  const [mediaPickTarget, setMediaPickTarget] = useState(null);
  const [addingSegment, setAddingSegment] = useState(false);
  const [editingSegmentKey, setEditingSegmentKey] = useState(null);
  const [editingActId, setEditingActId] = useState(null);
  const [addingVenue, setAddingVenue] = useState(false);
  const [packaging, setPackaging] = useState(false);
  const [packagePhase, setPackagePhase] = useState('idle');
  const [packagePreview, setPackagePreview] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [closingOut, setClosingOut] = useState(false);
  const [showSettlementExport, setShowSettlementExport] = useState(false);
  const [closeoutDraft, setCloseoutDraft] = useState(null);
  const [runSheetOptions, setRunSheetOptions] = useState(() => normalizeRunSheetOptions(show?.runSheet));
  const runSheetSaveTimer = useRef(null);

  useEffect(() => {
    setRunSheetOptions(normalizeRunSheetOptions(show?.runSheet));
  }, [showId]);

  useEffect(() => {
    if (!packaging) {
      setPackagePhase('idle');
      return;
    }
    setPackagePhase('copying');
    const writingTimer = setTimeout(() => setPackagePhase('writing-rtf'), 1400);
    return () => clearTimeout(writingTimer);
  }, [packaging]);

  const closed = show?.status === 'closed';
  const status = show?.status || 'draft';
  const venueNameForBar = show ? (venues.find((v) => v.id === show.venueId)?.name || '') : '';

  const persistRunSheet = useCallback((opts) => {
    if (!show || closed) return;
    clearTimeout(runSheetSaveTimer.current);
    runSheetSaveTimer.current = setTimeout(() => {
      save('shows', { ...show, runSheet: opts });
    }, 500);
  }, [show, closed, save]);

  const handleRunSheetChange = (opts) => {
    setRunSheetOptions(opts);
    persistRunSheet(opts);
  };

  let primaryAction = null;
  if (show) {
    if (closed) {
      primaryAction = <BtnWithIcon icon={icons.action('export')} className="btn primary" onClick={() => setShowSettlementExport(true)}>Export settlement</BtnWithIcon>;
    } else if (zone === 'closeout') {
      primaryAction = <button className="btn primary" onClick={() => setConfirmClose(true)}>Close out</button>;
    } else {
      primaryAction = (
        <BtnWithIcon icon={icons.action('export')} className="btn primary" onClick={() => setPackagePreview(true)} disabled={packaging}>
          Generate package
        </BtnWithIcon>
      );
    }
  }

  useTopBar(
    show
      ? [{ label: 'Shows', onClick: onBack }, { label: show.title || 'Untitled show' }]
      : [{ label: 'Shows', onClick: onBack }],
    primaryAction
  );

  if (!show) {
    return (
      <div className="page">
        <p>This show no longer exists.</p>
        <button className="btn ghost" onClick={onBack}>Back to shows</button>
      </div>
    );
  }

  const lineup = show.lineup || [];
  const update = (patch) => save('shows', { ...show, ...patch });

  const resolveEntry = (entry) => {
    if (entry.type === 'segment') return entry;
    const act = acts.find((a) => a.id === entry.actId);
    const performer = performers.find((p) => p.id === (act?.performerId || entry.performerId));
    return {
      ...entry,
      act,
      performerName: performer?.stageName || entry.performerName || 'Unknown performer',
      actName: act?.name || entry.actName || 'Untitled act',
      tagline: act?.tagline || '',
      aesthetic: act?.aesthetic || '',
      length: act?.length || '',
      lightingNotes: act?.lightingNotes || '',
      stageNotes: act?.stageNotes || '',
      mediaFileId: act?.mediaFileId || '',
      mediaName: act?.mediaName || '',
    };
  };

  const resolved = lineup.map(resolveEntry);
  const actEntries = resolved.filter((e) => e.type === 'act');
  const totalMinutes = resolved.reduce((t, e) => t + parseMinutes(e.length), 0);
  const mediaAttached = resolved.filter((e) => e.mediaFileId).length;
  const venueName = venues.find((v) => v.id === show.venueId)?.name || '';

  const packageStats = {
    mediaCount: resolved.filter((e) => e.mediaFileId).length,
    missingCount: actEntries.filter((e) => !e.mediaFileId).length,
  };

  const reorderLineup = (from, to) => {
    const next = lineup.slice();
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    update({ lineup: next });
  };

  const removeEntry = (i) => update({ lineup: lineup.filter((_, idx) => idx !== i) });

  const addAct = (act) => {
    const performer = performers.find((p) => p.id === act.performerId);
    update({
      lineup: [...lineup, {
        key: newKey(),
        type: 'act',
        actId: act.id,
        performerId: act.performerId,
        performerName: performer?.stageName || '',
        actName: act.name,
      }],
    });
  };

  const attachMedia = (entry) => {
    setMediaPickTarget(entry);
  };

  const handleLineupMediaSelected = async (file) => {
    const entry = mediaPickTarget;
    if (!entry || !file) return;
    setMediaPickTarget(null);

    if (entry.type === 'act' && entry.act) {
      const patch = { ...entry.act, mediaFileId: file.fileId, mediaName: file.name, mediaLink: file.link };
      if (file.length) patch.length = file.length;
      await save('acts', patch);
      toast(
        'Media attached',
        file.length ? `${file.name} → ${entry.actName} (${file.length})` : `${file.name} → ${entry.actName}`,
      );
      return;
    }

    if (entry.type === 'segment') {
      const idx = lineup.findIndex((e) => e.key === entry.key);
      if (idx < 0) return;
      const next = lineup.slice();
      const seg = { ...next[idx], mediaFileId: file.fileId, mediaName: file.name, mediaLink: file.link };
      if (file.length) seg.length = file.length;
      next[idx] = seg;
      update({ lineup: next });
      toast(
        'Media attached',
        file.length ? `${file.name} → ${entry.title} (${file.length})` : `${file.name} → ${entry.title}`,
      );
    }
  };

  const runPackage = async () => {
    if (resolved.length === 0) {
      toast('Running order is empty', 'Add acts and segments before generating a package.', 'error');
      return;
    }
    setPackaging(true);
    setPackagePhase('copying');
    try {
      const appFolderId = await ensureDriveFolderId();
      const result = await createShowPackageInDrive({
        show: {
          title: show.title || 'Untitled show',
          dateLabel: formatDate(show.dateLabel),
          venueName,
          ticketPrice: show.ticketPrice,
        },
        lineup: resolved.map((e) =>
          e.type === 'segment'
            ? { type: 'segment', title: e.title, notes: e.notes, length: e.length, mediaFileId: e.mediaFileId, mediaName: e.mediaName }
            : {
                type: 'act',
                performerName: e.performerName,
                actName: e.actName,
                tagline: e.tagline,
                aesthetic: e.aesthetic,
                length: e.length,
                lightingNotes: e.lightingNotes,
                stageNotes: e.stageNotes,
                mediaFileId: e.mediaFileId,
                mediaName: e.mediaName,
              }
        ),
        runSheet: runSheetOptions,
        appFolderId,
      });
      setPackagePreview(false);
      setPackagePhase('complete');
      await update({
        status: closed ? 'closed' : 'packaged',
        driveFolderId: result.folderId,
        driveFolderLink: result.folderLink,
        driveFolderName: result.folderName,
        runSheet: runSheetOptions,
      });
      const missingNote = result.missing?.length ? ` ${result.missing.length} file(s) could not be copied.` : '';
      toast('Package ready', `${result.copied.length} media file(s) + run sheet in your Google Drive.${missingNote}`, 'success', result.folderLink ? {
        label: 'Open in Google Drive',
        icon: icons.action('folder-open'),
        onClick: () => window.open(result.folderLink, '_blank', 'noopener'),
      } : undefined);
    } catch (err) {
      setPackagePreview(false);
      toastDriveError(toast, err, signIn);
    } finally {
      setPackaging(false);
    }
  };

  const finalizeCloseout = async (exportMode) => {
    const data = closeoutDraft || show.closeout;
    if (!data) {
      toast('Nothing to close out', 'Enter settlement figures first.', 'error');
      setConfirmClose(false);
      return;
    }
    setClosingOut(true);
    try {
      const closedAt = new Date().toISOString();
      const closeoutData = { ...data, closedAt };
      await update({
        closeout: closeoutData,
        status: 'closed',
      });
      setConfirmClose(false);
      toast('Show closed out', `${show.title || 'Show'} is settled and archived.`);

      if (exportMode) {
        const performersById = Object.fromEntries(performers.map((p) => [p.id, p]));
        try {
          const result = await exportSettlement(
            { ...show, venueName: venueNameForBar },
            closeoutData,
            performersById,
            { mode: exportMode, folderId: show.driveFolderId, getAppFolderId: ensureDriveFolderId },
          );
          const filename = settlementFilename(show);
          if (result.webViewLink) {
            toast('Settlement exported', filename, 'success', {
              label: 'Open in Drive',
              icon: icons.action('folder-open'),
              onClick: () => window.open(result.webViewLink, '_blank', 'noopener'),
            });
          } else {
            toast('Settlement exported', filename);
          }
        } catch (err) {
          toastDriveError(toast, err, signIn);
        }
      }
      setZone('closeout');
    } finally {
      setClosingOut(false);
    }
  };

  const editingSegmentIdx = lineup.findIndex((e) => e.key === editingSegmentKey);

  return (
    <div className="page">
      <div style={{ marginBottom: 8 }}>
        <input
          className="inline-title-input"
          value={show.title}
          onChange={(e) => update({ title: e.target.value })}
          placeholder="Name your show…"
          disabled={closed}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
          <StatusBadge status={status} />
          {show.driveFolderLink && (
            <BtnWithIcon icon={icons.action('folder-open')} className="btn ghost sm" onClick={() => window.open(show.driveFolderLink, '_blank', 'noopener')}>
              Open in Google Drive
            </BtnWithIcon>
          )}
        </div>
      </div>

      <div className="meta-panel">
        <div className="form-grid" style={{ gridTemplateColumns: '1fr 1.4fr 0.8fr' }}>
          <Field label="Show date">
            <input className="input" type="date" value={show.dateLabel || ''} onChange={(e) => update({ dateLabel: e.target.value })} disabled={closed} />
          </Field>
          <Field label="Venue">
            <div style={{ display: 'flex', gap: 8 }}>
              <select className="select" value={show.venueId || ''} onChange={(e) => update({ venueId: e.target.value })} disabled={closed}>
                <option value="">Select venue…</option>
                {[...venues].sort((a, b) => (a.name || '').localeCompare(b.name || '')).map((v) => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
              {!closed && <IconButton src={icons.action('add')} title="Add venue" onClick={() => setAddingVenue(true)} />}
            </div>
          </Field>
          <Field label="Ticket price">
            <input
              className="input" type="number" min="0" step="0.01" placeholder="25.00"
              value={show.ticketPrice ?? ''}
              onChange={(e) => update({ ticketPrice: e.target.value })}
              disabled={closed}
            />
          </Field>
        </div>
      </div>

      <div className="zone-tabs">
        <button className={'zone-tab' + (zone === 'order' ? ' active' : '')} onClick={() => setZone('order')}>Running order</button>
        <button className={'zone-tab' + (zone === 'package' ? ' active' : '')} onClick={() => setZone('package')}>Package</button>
        <button className={'zone-tab' + (zone === 'closeout' ? ' active' : '')} onClick={() => setZone('closeout')}>
          Closeout
        </button>
      </div>

      {zone === 'closeout' && (
        <CloseoutPanel
          show={show}
          venueName={venueName}
          readOnly={closed}
          onChange={setCloseoutDraft}
          onSave={(patch) => update(patch)}
        />
      )}

      {zone === 'package' && (
        <div>
          <h2 className="h2" style={{ marginBottom: 8 }}>Show package</h2>
          <p style={{ color: 'var(--on-paper-muted)', marginBottom: 20, maxWidth: 560 }}>
            Generates a folder in your Google Drive with media files named by position, performer, and act — plus an RTF run sheet using your typography settings.
          </p>
          <div className="summary-stat"><span className="stat-label">Media ready</span><span className="stat-value">{mediaAttached} / {resolved.length}</span></div>
          <div className="summary-stat"><span className="stat-label">Running order</span><span className="stat-value">{resolved.length} entries</span></div>
          <div className="summary-stat"><span className="stat-label">Est. runtime</span><span className="stat-value">{formatRuntime(totalMinutes)}</span></div>
          {show.driveFolderLink && (
            <div className="summary-stat">
              <span className="stat-label">Drive folder</span>
              <a href={show.driveFolderLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, wordBreak: 'break-all', color: 'var(--wine-600)' }}>
                {show.driveFolderName || 'Open in Google Drive'}
              </a>
            </div>
          )}
          {!closed && (
            <BtnWithIcon icon={icons.action('export')} className="btn primary" style={{ marginTop: 20 }} onClick={() => setPackagePreview(true)} disabled={packaging}>
              Generate package
            </BtnWithIcon>
          )}
        </div>
      )}

      {zone === 'order' && (
        <div className="order-workspace">
          <div className="order-main">
            <div className="lineup-header">
              <div>
                <h2 className="h2">Running order</h2>
                <div className="lineup-stats">
                  <span className="data">{resolved.length}</span> entries · est. <span className="data">{formatRuntime(totalMinutes)}</span>
                  {resolved.length > 0 && <> · <span className="data">{mediaAttached}/{resolved.length}</span> have media</>}
                </div>
                {!closed && <p className="page-lead" style={{ marginTop: 6 }}>Drag handles to reorder acts and segments.</p>}
              </div>
              {!closed && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <BtnWithIcon icon={icons.action('add')} className="btn secondary sm" onClick={() => setAddingSegment(true)}>Add segment</BtnWithIcon>
                  <BtnWithIcon icon={icons.action('add')} className="btn secondary sm" onClick={() => setAddingAct(true)}>Add act</BtnWithIcon>
                </div>
              )}
            </div>

            {resolved.length === 0 ? (
              <EmptyState
                illustration={illustrations.emptyLineup()}
                title="Build your running order"
                body="Add performer acts and segments like the host welcome, games, or announcements."
                action={!closed ? (
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                    <BtnWithIcon icon={icons.action('add')} className="btn secondary sm" onClick={() => setAddingSegment(true)}>Add segment</BtnWithIcon>
                    <BtnWithIcon icon={icons.action('add')} className="btn primary sm" onClick={() => setAddingAct(true)}>Add act</BtnWithIcon>
                  </div>
                ) : null}
              />
            ) : (
              <LineupDragList
                entries={resolved}
                closed={closed}
                onReorder={reorderLineup}
                onRemove={removeEntry}
                onEditSegment={setEditingSegmentKey}
                onEditAct={setEditingActId}
                onAttachMedia={attachMedia}
              />
            )}
          </div>

          <div className="order-side">
            <div className="document-preview-panel">
              <RunSheetPreview options={runSheetOptions} />
            </div>
            <div className="typography-panel-scroll">
              <RunSheetStylePanel
                options={runSheetOptions}
                onChange={handleRunSheetChange}
                fonts={RUN_SHEET_FONTS}
                disabled={closed}
              />
            </div>
          </div>
        </div>
      )}

      {packagePreview && (
        <PackagePreviewDialog
          stats={packageStats}
          onConfirm={runPackage}
          onClose={() => setPackagePreview(false)}
          busy={packaging}
          progressPhase={packagePhase}
        />
      )}

      {addingAct && <AddActModal onPick={addAct} onClose={() => setAddingAct(false)} />}

      {addingSegment && (
        <SegmentModal
          onClose={() => setAddingSegment(false)}
          onSave={(form) => update({ lineup: [...lineup, { key: newKey(), type: 'segment', ...form }] })}
        />
      )}

      {editingSegmentIdx >= 0 && (
        <SegmentModal
          segment={lineup[editingSegmentIdx]}
          onClose={() => setEditingSegmentKey(null)}
          onSave={(form) => {
            const next = lineup.slice();
            next[editingSegmentIdx] = { ...next[editingSegmentIdx], ...form };
            update({ lineup: next });
          }}
        />
      )}

      {editingActId && (
        <ActFormModal act={acts.find((a) => a.id === editingActId)} onClose={() => setEditingActId(null)} />
      )}

      {addingVenue && (
        <VenueFormModal onClose={() => setAddingVenue(false)} onSaved={(venue) => update({ venueId: venue.id })} />
      )}

      {confirmClose && (
        <CloseoutFinalizeModal
          showTitle={show.title}
          busy={closingOut}
          onCancel={() => setConfirmClose(false)}
          onConfirm={finalizeCloseout}
        />
      )}

      {showSettlementExport && show.closeout && (
        <SettlementExportModal
          show={{ ...show, venueName: venueNameForBar }}
          closeout={show.closeout}
          performersById={Object.fromEntries(performers.map((p) => [p.id, p]))}
          onClose={() => setShowSettlementExport(false)}
        />
      )}

      {mediaPickTarget && (
        <MediaPickerModal
          getMediaFolderId={ensureDriveFolderId}
          onClose={() => setMediaPickTarget(null)}
          onSelect={handleLineupMediaSelected}
        />
      )}
    </div>
  );
}
