import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../auth.jsx';
import { useData } from '../data.jsx';
import { Modal, Field, SearchInput, useToast } from '../ui.jsx';
import { icons } from '../assets/index.js';
import { BtnWithIcon } from './Icon.jsx';
import { actLineupEntry } from './AddToShowModal.jsx';
import { isDriveConnected, DriveAuthError } from '../lib/drive.js';
import {
  IMPORT_FIELDS,
  FIELD_LABELS,
  detectColumnMapping,
  parseSheetRows,
  matchImportRows,
  applyConflictAction,
  buildNewAct,
  demoSheetPayload,
  summarizeMatches,
  listDriveFolders,
  listSpreadsheetsInFolder,
  searchSpreadsheets,
  loadSpreadsheetById,
  loadSpreadsheetsFromFolder,
  defaultVersionLabel,
} from '../lib/googleSheetsImport.js';
import {
  loadSavedForms,
  createProducerProTechNotesForm,
  refreshFormResponseSheet,
  removeSavedForm,
  mappingFromProducerProHeaders,
  isProducerProMappingComplete,
} from '../lib/googleFormTemplate.js';
import {
  allSegmentPresets,
  loadCustomSegmentPresets,
  addCustomSegmentPreset,
  removeCustomSegmentPreset,
  defaultSegmentSelection,
  normalizeSegmentLength,
  buildLineupWithSegments,
  resolveEnabledPresets,
  SEGMENT_PLACEMENTS,
} from '../lib/lineupSegments.js';

const STEPS = [
  'Source',
  'Columns',
  'Review',
  'Conflicts',
  'Performers',
  'Show',
  'Import',
];

function StepIndicator({ step }) {
  return (
    <div className="import-steps" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
      {STEPS.map((label, i) => (
        <span
          key={label}
          style={{
            fontSize: 12,
            padding: '4px 10px',
            borderRadius: 999,
            background: i === step ? 'var(--rose-600)' : i < step ? 'var(--rose-tint)' : 'var(--canvas-deep)',
            color: i === step ? '#fff' : 'var(--ink-soft)',
            fontWeight: i === step ? 600 : 400,
          }}
        >
          {i + 1}. {label}
        </span>
      ))}
    </div>
  );
}

function statusLabel(row) {
  switch (row.status) {
    case 'matched': return row.hasConflict ? 'Act found — data differs' : 'Matched';
    case 'new_act': return 'Performer found — new act';
    case 'act_only': return 'Act found — map performer';
    case 'performer_mismatch': return 'Act belongs to another performer';
    default: return 'Needs mapping';
  }
}

function ConflictDiff({ details }) {
  if (!details?.length) return null;
  return (
    <div className="import-conflict-diff">
      {details.map((d) => (
        <div key={d.key} className="import-conflict-row">
          <div className="import-conflict-label">{d.label}</div>
          <div className="import-conflict-cols">
            <div className="import-conflict-col">
              <div className="import-conflict-heading">Current</div>
              <div className="import-conflict-value">{d.existing}</div>
            </div>
            <div className="import-conflict-col import-conflict-col--incoming">
              <div className="import-conflict-heading">From form</div>
              <div className="import-conflict-value">{d.incoming}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function GoogleFormsImportModal({ onClose, onOpenShow }) {
  const { performers, acts, shows, save, reloadAll } = useData();
  const { isConfigured, signIn, ensureDriveFolderId } = useAuth();
  const toast = useToast();

  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [savedForms, setSavedForms] = useState(() => loadSavedForms());
  const [lastCreatedForm, setLastCreatedForm] = useState(null);

  // Step 1 — source
  const [sourceMode, setSourceMode] = useState(isConfigured ? 'folder' : 'demo');
  const [folders, setFolders] = useState([]);
  const [folderStack, setFolderStack] = useState([{ id: 'root', name: 'My Drive' }]);
  const [folderSheets, setFolderSheets] = useState([]);
  const [sheetSearch, setSheetSearch] = useState('');
  const [sheetResults, setSheetResults] = useState([]);
  const [selectedSheetId, setSelectedSheetId] = useState('');
  const [sheetMeta, setSheetMeta] = useState(null);

  // Step 2 — columns
  const [mapping, setMapping] = useState({});
  const [parsedRows, setParsedRows] = useState([]);

  // Step 3+ — matching
  const [matchedRows, setMatchedRows] = useState([]);
  const [conflictActions, setConflictActions] = useState({});
  const [versionLabels, setVersionLabels] = useState({});
  const [performerActions, setPerformerActions] = useState({});
  const [showAction, setShowAction] = useState('skip');
  const [selectedShowId, setSelectedShowId] = useState('');
  const [newShowTitle, setNewShowTitle] = useState('');
  const [customSegmentPresets, setCustomSegmentPresets] = useState(() => loadCustomSegmentPresets());
  const [segmentSelection, setSegmentSelection] = useState(() => defaultSegmentSelection());
  const [showAddCustomSegment, setShowAddCustomSegment] = useState(false);
  const [customSegmentDraft, setCustomSegmentDraft] = useState({ title: '', length: '5:00', placement: 'start' });

  const driveReady = isConfigured && isDriveConnected();
  const currentFolder = folderStack[folderStack.length - 1];

  const loadFolders = useCallback(async (parentId) => {
    setBusy(true);
    setError('');
    try {
      const list = await listDriveFolders(parentId);
      setFolders(list);
      const sheets = await listSpreadsheetsInFolder(parentId);
      setFolderSheets(sheets);
    } catch (err) {
      setError(err instanceof DriveAuthError
        ? 'Google access expired. Reconnect Google Drive from the account menu and try again.'
        : err.message);
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    if (step === 0 && sourceMode === 'folder' && driveReady) {
      loadFolders(currentFolder.id);
    }
  }, [step, sourceMode, driveReady, currentFolder.id, loadFolders]);

  useEffect(() => {
    if (sourceMode !== 'sheet' || !driveReady) return;
    const timer = setTimeout(async () => {
      try {
        const results = await searchSpreadsheets(sheetSearch);
        setSheetResults(results);
      } catch (err) {
        setError(err.message);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [sheetSearch, sourceMode, driveReady]);

  const enterFolder = (folder) => {
    setFolderStack((s) => [...s, folder]);
  };

  const leaveFolder = () => {
    if (folderStack.length > 1) setFolderStack((s) => s.slice(0, -1));
  };

  const loadSheetData = async (payload, { presetMapping = false } = {}) => {
    const templateMap = mappingFromProducerProHeaders(payload.headers);
    const map = presetMapping && isProducerProMappingComplete(templateMap)
      ? templateMap
      : detectColumnMapping(payload.headers);
    const parsed = parseSheetRows(payload.headers, payload.rows, map);
    setSheetMeta({ ...payload, presetMapping: presetMapping && isProducerProMappingComplete(templateMap) });
    setMapping(map);
    setParsedRows(parsed);
    setMatchedRows(matchImportRows(parsed, performers, acts));
    setConflictActions({});
    setVersionLabels({});
    setPerformerActions({});
    setStep(isProducerProMappingComplete(map) ? 2 : 1);
  };

  const pickDemo = () => {
    const payload = demoSheetPayload();
    loadSheetData({ ...payload, rows: payload.rows });
  };

  const handleCreateForm = async () => {
    setBusy(true);
    setError('');
    try {
      await ensureDriveFolderId();
      const created = await createProducerProTechNotesForm();
      setSavedForms(loadSavedForms());
      setLastCreatedForm(created);
      toast('Form created', 'Share the link with performers — columns are pre-mapped for import.');
    } catch (err) {
      setError(err instanceof DriveAuthError
        ? 'Google access expired. Reconnect Google Drive from the account menu and try again.'
        : err.message);
    } finally {
      setBusy(false);
    }
  };

  const loadSavedFormSheet = async (savedForm) => {
    setBusy(true);
    setError('');
    try {
      let form = savedForm;
      if (!form.responseSheetId) {
        form = await refreshFormResponseSheet(savedForm);
        setSavedForms(loadSavedForms());
      }
      if (!form.responseSheetId) {
        setError('No responses yet. Share your form and collect at least one submission, then try again.');
        return;
      }
      const payload = await loadSpreadsheetById(form.responseSheetId);
      await loadSheetData(payload, { presetMapping: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const pickFolderSheet = async (file) => {
    setBusy(true);
    setError('');
    try {
      const payload = await loadSpreadsheetById(file.id);
      await loadSheetData(payload);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const scanFolder = async () => {
    setBusy(true);
    setError('');
    try {
      const sheets = await loadSpreadsheetsFromFolder(currentFolder.id);
      if (sheets.length === 0) {
        setError('No spreadsheets found in this folder.');
        return;
      }
      if (sheets.length === 1) {
        await loadSheetData(sheets[0]);
        return;
      }
      setFolderSheets(sheets.map((s) => ({ id: s.id, name: s.name, webViewLink: s.webViewLink })));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const pickSearchedSheet = async () => {
    if (!selectedSheetId) return;
    setBusy(true);
    try {
      const payload = await loadSpreadsheetById(selectedSheetId);
      await loadSheetData(payload);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const applyMapping = () => {
    const parsed = parseSheetRows(sheetMeta.headers, sheetMeta.rows, mapping);
    setParsedRows(parsed);
    setMatchedRows(matchImportRows(parsed, performers, acts));
    setStep(2);
  };

  useEffect(() => {
    setConflictActions((prev) => {
      const next = { ...prev };
      for (const row of matchedRows) {
        if (row.hasConflict && !next[row.rowIndex]) next[row.rowIndex] = 'merge';
      }
      return next;
    });
    setVersionLabels((prev) => {
      const next = { ...prev };
      for (const row of matchedRows) {
        if (row.hasConflict && !next[row.rowIndex]) next[row.rowIndex] = defaultVersionLabel();
      }
      return next;
    });
    setPerformerActions((prev) => {
      const next = { ...prev };
      for (const row of matchedRows) {
        if (['unmatched', 'act_only', 'performer_mismatch'].includes(row.status) && !next[row.rowIndex]) {
          next[row.rowIndex] = {
            mode: row.performerMatch ? 'existing' : 'new',
            performerId: row.performerMatch?.id || '',
            newStageName: row.performerName || '',
          };
        }
      }
      return next;
    });
  }, [matchedRows]);

  const conflictRows = useMemo(
    () => matchedRows.filter((r) => r.hasConflict && r.actMatch),
    [matchedRows],
  );

  const needsPerformerStep = useMemo(
    () => matchedRows.some((r) =>
      ['unmatched', 'act_only', 'performer_mismatch'].includes(r.status)
      && !(r.hasConflict && conflictActions[r.rowIndex] === 'discard')),
    [matchedRows, conflictActions],
  );

  const openShows = useMemo(
    () => shows.filter((s) => (s.status || 'draft') !== 'closed'),
    [shows],
  );

  const segmentPresets = useMemo(
    () => allSegmentPresets(customSegmentPresets),
    [customSegmentPresets],
  );

  const enabledSegments = useMemo(
    () => resolveEnabledPresets(segmentPresets, segmentSelection),
    [segmentPresets, segmentSelection],
  );

  const placementLabel = (id) => SEGMENT_PLACEMENTS.find((p) => p.id === id)?.label || id;

  const toggleSegmentPreset = (id, enabled) => {
    setSegmentSelection((prev) => ({
      ...prev,
      [id]: { ...prev[id], enabled, length: prev[id]?.length || segmentPresets.find((p) => p.id === id)?.length },
    }));
  };

  const setSegmentPresetLength = (id, length) => {
    setSegmentSelection((prev) => ({
      ...prev,
      [id]: { ...prev[id], enabled: prev[id]?.enabled ?? false, length },
    }));
  };

  const handleAddCustomSegment = () => {
    const added = addCustomSegmentPreset(customSegmentDraft);
    if (!added) return;
    const nextCustom = loadCustomSegmentPresets();
    setCustomSegmentPresets(nextCustom);
    setSegmentSelection((prev) => ({
      ...prev,
      [added.id]: { enabled: true, length: added.length },
    }));
    setCustomSegmentDraft({ title: '', length: '5:00', placement: 'start' });
    setShowAddCustomSegment(false);
  };

  const handleRemoveCustomSegment = (id) => {
    setCustomSegmentPresets(removeCustomSegmentPreset(id));
    setSegmentSelection((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const goNextFromReview = () => {
    if (conflictRows.length > 0) setStep(3);
    else if (needsPerformerStep) setStep(4);
    else setStep(5);
  };

  const goNextFromConflicts = () => {
    if (needsPerformerStep) setStep(4);
    else setStep(5);
  };

  const importSummary = useMemo(() => {
    let create = 0;
    let update = 0;
    let versions = 0;
    let skip = 0;
    for (const row of matchedRows) {
      if (conflictActions[row.rowIndex] === 'discard') { skip += 1; continue; }
      if (conflictActions[row.rowIndex] === 'version') { versions += 1; continue; }
      if (row.actMatch && row.status === 'matched') update += 1;
      else create += 1;
    }
    return { create, update, versions, skip };
  }, [matchedRows, conflictActions]);

  const resolvePerformerId = async (row) => {
    const action = performerActions[row.rowIndex];
    if (row.status === 'matched' && row.performerMatch) return row.performerMatch.id;
    if (row.status === 'new_act' && row.performerMatch) return row.performerMatch.id;
    if (!action) return row.performerMatch?.id || null;
    if (action.mode === 'existing' && action.performerId) return action.performerId;
    if (action.mode === 'new' && action.newStageName?.trim()) {
      const saved = await save('performers', { stageName: action.newStageName.trim(), legalName: '', email: '', phone: '', paymentMethod: '', paymentInfo: '' });
      return saved.id;
    }
    return null;
  };

  const runImport = async () => {
    setBusy(true);
    setError('');
    try {
      const savedActs = [];

      for (const row of matchedRows) {
        if (row.hasConflict && conflictActions[row.rowIndex] === 'discard') continue;

        let performerId = null;
        if (row.status === 'matched' || row.status === 'new_act') {
          performerId = row.performerMatch?.id || null;
        } else {
          performerId = await resolvePerformerId(row);
        }
        if (!performerId) continue;

        if (row.actMatch && row.status === 'matched') {
          const action = conflictActions[row.rowIndex] || 'merge';
          if (action === 'version') {
            const versionAct = applyConflictAction(row.actMatch, row.incoming, 'version', {
              versionLabel: versionLabels[row.rowIndex],
            });
            savedActs.push(await save('acts', versionAct));
          } else {
            const patch = applyConflictAction(row.actMatch, row.incoming, action);
            if (patch) savedActs.push(await save('acts', patch));
          }
        } else if (row.actMatch && (row.status === 'act_only' || row.status === 'performer_mismatch')) {
          const action = conflictActions[row.rowIndex] || 'merge';
          const base = { ...row.actMatch, performerId };
          const patch = applyConflictAction(base, row.incoming, action);
          if (patch) savedActs.push(await save('acts', patch));
        } else {
          const act = buildNewAct(row.incoming, performerId);
          if (!act.name) continue;
          savedActs.push(await save('acts', act));
        }
      }

      if (showAction === 'existing' && selectedShowId && savedActs.length > 0) {
        const show = shows.find((s) => s.id === selectedShowId);
        if (show) {
          const lineup = [...(show.lineup || [])];
          for (const act of savedActs) {
            lineup.push(actLineupEntry(act, performers));
          }
          await save('shows', { ...show, lineup });
        }
      } else if (showAction === 'new' && savedActs.length > 0) {
        const actEntries = savedActs.map((act) => actLineupEntry(act, performers));
        const lineup = buildLineupWithSegments(actEntries, enabledSegments);
        const savedShow = await save('shows', {
          title: newShowTitle.trim() || 'Imported show',
          dateLabel: new Date().toISOString().slice(0, 10),
          venueId: '',
          ticketPrice: '',
          lineup,
          status: 'draft',
        });
        await reloadAll();
        toast('Import complete', `${savedActs.length} act${savedActs.length === 1 ? '' : 's'} imported into a new show.`);
        onClose();
        onOpenShow?.(savedShow.id);
        return;
      }

      await reloadAll();
      toast('Import complete', `${savedActs.length} act${savedActs.length === 1 ? '' : 's'} updated or created from form responses.`);
      onClose();
    } catch (err) {
      setError('Import failed: ' + err.message);
    } finally {
      setBusy(false);
    }
  };

  const footer = () => {
    if (step === 0) {
      return (
        <>
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          {sourceMode === 'demo' && (
            <BtnWithIcon icon={icons.action('check')} className="btn primary" onClick={pickDemo}>
              Use sample data
            </BtnWithIcon>
          )}
          {sourceMode === 'sheet' && (
            <button className="btn primary" onClick={pickSearchedSheet} disabled={!selectedSheetId || busy}>
              {busy ? 'Loading…' : 'Load spreadsheet'}
            </button>
          )}
          {sourceMode === 'folder' && (
            <button className="btn primary" onClick={scanFolder} disabled={busy || !driveReady}>
              {busy ? 'Scanning…' : 'Import from this folder'}
            </button>
          )}
        </>
      );
    }
    if (step === 1) {
      return (
        <>
          <button className="btn ghost" onClick={() => setStep(0)}>Back</button>
          <button className="btn primary" onClick={applyMapping} disabled={mapping.actName == null}>
            Review matches
          </button>
        </>
      );
    }
    if (step === 2) {
      return (
        <>
          <button className="btn ghost" onClick={() => setStep(sheetMeta?.presetMapping ? 0 : 1)}>Back</button>
          <button className="btn primary" onClick={goNextFromReview}>Continue</button>
        </>
      );
    }
    if (step === 3) {
      return (
        <>
          <button className="btn ghost" onClick={() => setStep(2)}>Back</button>
          <button className="btn primary" onClick={goNextFromConflicts}>Continue</button>
        </>
      );
    }
    if (step === 4) {
      return (
        <>
          <button className="btn ghost" onClick={() => setStep(conflictRows.length ? 3 : 2)}>Back</button>
          <button className="btn primary" onClick={() => setStep(5)}>Continue</button>
        </>
      );
    }
    if (step === 5) {
      return (
        <>
          <button className="btn ghost" onClick={() => setStep(needsPerformerStep ? 4 : conflictRows.length ? 3 : 2)}>Back</button>
          <button className="btn primary" onClick={() => setStep(6)}>Review import</button>
        </>
      );
    }
    return (
      <>
        <button className="btn ghost" onClick={() => setStep(5)} disabled={busy}>Back</button>
        <BtnWithIcon icon={icons.action('check')} className="btn primary" onClick={runImport} disabled={busy}>
          {busy ? 'Importing…' : 'Import'}
        </BtnWithIcon>
      </>
    );
  };

  return (
    <Modal
      title="Import from Google Form"
      wide
      onClose={onClose}
      footer={footer()}
    >
      <StepIndicator step={step} />
      {error && <p style={{ color: 'var(--ledger-brick)', marginBottom: 12 }}>{error}</p>}

      {step === 0 && (
        <>
          <p style={{ color: 'var(--on-paper-muted)', marginBottom: 14, fontSize: 14 }}>
            Create a Producer Pro tech-notes form (pre-mapped columns), import from a saved form,
            or browse any linked Google Sheet.
          </p>

          {isConfigured && driveReady && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Producer Pro forms</div>
                <BtnWithIcon icon={icons.action('add')} className="btn secondary sm" onClick={handleCreateForm} disabled={busy}>
                  {busy ? 'Creating…' : 'Create tech-notes form'}
                </BtnWithIcon>
              </div>
              {lastCreatedForm && (
                <div className="import-form-created" style={{ marginBottom: 12 }}>
                  <div style={{ fontWeight: 600, marginBottom: 6 }}>Form ready to share</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 13 }}>
                    <a href={lastCreatedForm.responderUrl} target="_blank" rel="noreferrer" className="breadcrumb-link">Open form (share link)</a>
                    <a href={lastCreatedForm.formEditUrl} target="_blank" rel="noreferrer" className="breadcrumb-link">Edit in Google</a>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--on-paper-muted)', marginTop: 8, marginBottom: 0 }}>
                    Columns are pre-mapped. After performers submit, import responses below.
                  </p>
                </div>
              )}
              {savedForms.length > 0 ? (
                <div className="picker-list" style={{ maxHeight: 200 }}>
                  {savedForms.map((form) => (
                    <div key={form.formId} className="picker-item" style={{ cursor: 'default' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="picker-name">{form.title}</div>
                        <div className="picker-sub">
                          {form.responseSheetId ? 'Responses linked · pre-mapped' : 'Waiting for first response…'}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                        <button type="button" className="btn ghost sm" onClick={() => loadSavedFormSheet(form)} disabled={busy}>
                          Import
                        </button>
                        <a href={form.responderUrl} target="_blank" rel="noreferrer" className="btn ghost sm">Share</a>
                        <button type="button" className="btn ghost sm" onClick={() => { removeSavedForm(form.formId); setSavedForms(loadSavedForms()); }}>Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: 13, color: 'var(--on-paper-muted)', margin: 0 }}>
                  No saved forms yet. Create one above — questions and import mapping are set up automatically.
                </p>
              )}
            </div>
          )}

          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Other sources</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            {[
              ...(isConfigured ? [
                { id: 'folder', label: 'Drive folder' },
                { id: 'sheet', label: 'Spreadsheet' },
              ] : []),
              { id: 'demo', label: 'Sample data' },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={'filter-tab' + (sourceMode === opt.id ? ' active' : '')}
                onClick={() => { setSourceMode(opt.id); setError(''); }}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {sourceMode === 'demo' && (
            <p style={{ fontSize: 14, color: 'var(--on-paper-muted)' }}>
              Walk through the full import flow with sample form responses — no Google account required.
            </p>
          )}

          {sourceMode === 'folder' && (
            <>
              {!driveReady ? (
                <div style={{ padding: '12px 0' }}>
                  <p style={{ marginBottom: 10 }}>Connect Google Drive to browse folders and read form response sheets.</p>
                  <button type="button" className="btn primary" onClick={() => signIn().catch((e) => setError(e.message))}>
                    Connect Google
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    {folderStack.length > 1 && (
                      <button type="button" className="btn ghost sm" onClick={leaveFolder}>↑ Up</button>
                    )}
                    <span style={{ fontWeight: 600 }}>{currentFolder.name}</span>
                  </div>
                  {folderSheets.length > 0 && (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Spreadsheets here</div>
                      <div className="picker-list">
                        {folderSheets.map((f) => (
                          <button key={f.id} type="button" className="picker-item" onClick={() => pickFolderSheet(f)} disabled={busy}>
                            <div className="picker-name">{f.name}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Folders</div>
                  <div className="picker-list">
                    {folders.map((f) => (
                      <button key={f.id} type="button" className="picker-item" onClick={() => enterFolder(f)}>
                        <div className="picker-name">{f.name}</div>
                      </button>
                    ))}
                    {folders.length === 0 && !busy && (
                      <div style={{ color: 'var(--on-paper-muted)', padding: 12 }}>No subfolders — use Import from this folder to scan spreadsheets.</div>
                    )}
                  </div>
                </>
              )}
            </>
          )}

          {sourceMode === 'sheet' && (
            <>
              {!driveReady ? (
                <div style={{ padding: '12px 0' }}>
                  <p style={{ marginBottom: 10 }}>Connect Google to search your spreadsheets.</p>
                  <button type="button" className="btn primary" onClick={() => signIn().catch((e) => setError(e.message))}>
                    Connect Google
                  </button>
                </div>
              ) : (
                <>
                  <SearchInput value={sheetSearch} onChange={setSheetSearch} placeholder="Search spreadsheets…" />
                  <div className="picker-list" style={{ marginTop: 12, maxHeight: 280, overflow: 'auto' }}>
                    {sheetResults.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        className={'picker-item' + (selectedSheetId === f.id ? ' active' : '')}
                        onClick={() => setSelectedSheetId(f.id)}
                      >
                        <div className="picker-name">{f.name}</div>
                      </button>
                    ))}
                    {sheetResults.length === 0 && (
                      <div style={{ color: 'var(--on-paper-muted)', padding: 12 }}>Type to search your Google Sheets.</div>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </>
      )}

      {step === 1 && sheetMeta && (
        <>
          <p style={{ color: 'var(--on-paper-muted)', marginBottom: 12, fontSize: 14 }}>
            {sheetMeta.presetMapping ? (
              <>Columns from <strong>{sheetMeta.name}</strong> match the Producer Pro template — mapping is pre-filled.</>
            ) : (
              <>Map columns from <strong>{sheetMeta.name}</strong> to act fields. Adjust anything the auto-detection missed.</>
            )}
          </p>
          <div className="form-grid">
            {IMPORT_FIELDS.map((field) => (
              <Field key={field} label={FIELD_LABELS[field]}>
                <select
                  className="select"
                  value={mapping[field] ?? ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setMapping((m) => {
                      const next = { ...m };
                      if (val === '') delete next[field];
                      else next[field] = Number(val);
                      return next;
                    });
                  }}
                >
                  <option value="">{FIELD_LABELS.skip}</option>
                  {sheetMeta.headers.map((h, i) => (
                    <option key={i} value={i}>{h || `Column ${i + 1}`}</option>
                  ))}
                </select>
              </Field>
            ))}
          </div>
          {mapping.actName == null && (
            <p style={{ color: 'var(--ledger-brick)', marginTop: 10, fontSize: 13 }}>Act name column is required.</p>
          )}
        </>
      )}

      {step === 2 && (
        <>
          <p style={{ color: 'var(--on-paper-muted)', marginBottom: 12, fontSize: 14 }}>
            {parsedRows.length} response{parsedRows.length === 1 ? '' : 's'} found.
            {' '}{summarizeMatches(matchedRows).matched} matched existing acts,{' '}
            {summarizeMatches(matchedRows).new_act} new acts for known performers,{' '}
            {summarizeMatches(matchedRows).unmatched} need mapping.
          </p>
          <div className="picker-list" style={{ maxHeight: 360, overflow: 'auto' }}>
            {matchedRows.map((row) => (
              <div key={row.rowIndex} className="picker-item" style={{ cursor: 'default' }}>
                <div>
                  <div className="picker-name">{row.actName || '(no act name)'} — {row.performerName || '(no performer)'}</div>
                  <div className="picker-sub">{statusLabel(row)}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <p style={{ color: 'var(--on-paper-muted)', marginBottom: 12, fontSize: 14 }}>
            These acts already exist but the form has different tech notes. Compare each field, then choose how to apply the row.
          </p>
          <div className="picker-list import-conflict-list">
            {conflictRows.map((row) => {
              const action = conflictActions[row.rowIndex] || 'merge';
              return (
                <div key={row.rowIndex} className="picker-item import-conflict-card">
                  <div>
                    <div className="picker-name">{row.actMatch.name}</div>
                    <div className="picker-sub">{row.performerMatch?.stageName || row.performerName}</div>
                  </div>
                  <ConflictDiff details={row.conflictDetails} />
                  <select
                    className="select"
                    value={action}
                    onChange={(e) => setConflictActions((c) => ({ ...c, [row.rowIndex]: e.target.value }))}
                  >
                    <option value="merge">Merge — fill empty fields only</option>
                    <option value="overwrite">Update — overwrite with form data</option>
                    <option value="version">New version — keep current act, create variant with form notes</option>
                    <option value="discard">Discard — keep existing act unchanged</option>
                  </select>
                  {action === 'version' && (
                    <Field label="Version label" helper="Shown on the new act, e.g. show date or revision name">
                      <input
                        className="input"
                        value={versionLabels[row.rowIndex] || ''}
                        onChange={(e) => setVersionLabels((v) => ({ ...v, [row.rowIndex]: e.target.value }))}
                        placeholder="Mar 2026 tech notes"
                      />
                    </Field>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {step === 4 && (
        <>
          <p style={{ color: 'var(--on-paper-muted)', marginBottom: 12, fontSize: 14 }}>
            Map unmatched rows to performers, or create new performer records.
          </p>
          <div className="picker-list" style={{ maxHeight: 360, overflow: 'auto' }}>
            {matchedRows.filter((r) =>
              ['unmatched', 'act_only', 'performer_mismatch'].includes(r.status)
              && !(r.hasConflict && conflictActions[r.rowIndex] === 'discard'),
            ).map((row) => {
              const action = performerActions[row.rowIndex] || { mode: 'new', performerId: '', newStageName: row.performerName };
              return (
                <div key={row.rowIndex} className="picker-item" style={{ cursor: 'default', flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
                  <div>
                    <div className="picker-name">{row.actName}</div>
                    <div className="picker-sub">Form performer: {row.performerName || '—'}</div>
                  </div>
                  <select
                    className="select"
                    value={action.mode}
                    onChange={(e) => setPerformerActions((p) => ({
                      ...p,
                      [row.rowIndex]: { ...action, mode: e.target.value },
                    }))}
                  >
                    <option value="existing">Add to existing performer</option>
                    <option value="new">Create new performer</option>
                  </select>
                  {action.mode === 'existing' ? (
                    <select
                      className="select"
                      value={action.performerId}
                      onChange={(e) => setPerformerActions((p) => ({
                        ...p,
                        [row.rowIndex]: { ...action, performerId: e.target.value },
                      }))}
                    >
                      <option value="">Select performer…</option>
                      {[...performers].sort((a, b) => (a.stageName || '').localeCompare(b.stageName || '')).map((p) => (
                        <option key={p.id} value={p.id}>{p.stageName}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      className="input"
                      value={action.newStageName}
                      onChange={(e) => setPerformerActions((p) => ({
                        ...p,
                        [row.rowIndex]: { ...action, newStageName: e.target.value },
                      }))}
                      placeholder="Stage name"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {step === 5 && (
        <>
          <p style={{ color: 'var(--on-paper-muted)', marginBottom: 12, fontSize: 14 }}>
            Optionally add imported acts to a show running order.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="radio" checked={showAction === 'skip'} onChange={() => setShowAction('skip')} />
              Skip — import acts only
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="radio" checked={showAction === 'new'} onChange={() => setShowAction('new')} />
              Create new show with imported acts
            </label>
            {showAction === 'new' && (
              <div className="import-show-new" style={{ marginLeft: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <input
                  className="input"
                  value={newShowTitle}
                  onChange={(e) => setNewShowTitle(e.target.value)}
                  placeholder="Show title"
                />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Running order segments</div>
                  <p style={{ fontSize: 12, color: 'var(--on-paper-muted)', marginTop: 0, marginBottom: 10 }}>
                    Add standard show segments around imported acts. Lengths use mm:ss (e.g. 10:00 = 10 minutes).
                  </p>
                  <div className="import-segment-list">
                    {segmentPresets.map((preset) => {
                      const sel = segmentSelection[preset.id] || { enabled: false, length: preset.length };
                      return (
                        <div key={preset.id} className="import-segment-row">
                          <label className="import-segment-check">
                            <input
                              type="checkbox"
                              checked={!!sel.enabled}
                              onChange={(e) => toggleSegmentPreset(preset.id, e.target.checked)}
                            />
                            <span className="import-segment-title">{preset.title}</span>
                            <span className="import-segment-placement">{placementLabel(preset.placement)}</span>
                          </label>
                          <input
                            className="input import-segment-length"
                            value={sel.length}
                            onChange={(e) => setSegmentPresetLength(preset.id, e.target.value)}
                            onBlur={(e) => setSegmentPresetLength(preset.id, normalizeSegmentLength(e.target.value))}
                            placeholder="10:00"
                            disabled={!sel.enabled}
                            title="Segment length"
                          />
                          {!preset.builtin && (
                            <button
                              type="button"
                              className="btn ghost sm"
                              onClick={() => handleRemoveCustomSegment(preset.id)}
                              title="Remove saved segment"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {showAddCustomSegment ? (
                    <div className="import-segment-add-form">
                      <Field label="Segment title">
                        <input
                          className="input"
                          value={customSegmentDraft.title}
                          onChange={(e) => setCustomSegmentDraft((d) => ({ ...d, title: e.target.value }))}
                          placeholder="Opening raffle"
                        />
                      </Field>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <Field label="Length">
                          <input
                            className="input"
                            value={customSegmentDraft.length}
                            onChange={(e) => setCustomSegmentDraft((d) => ({ ...d, length: e.target.value }))}
                            placeholder="5:00"
                          />
                        </Field>
                        <Field label="Placement">
                          <select
                            className="select"
                            value={customSegmentDraft.placement}
                            onChange={(e) => setCustomSegmentDraft((d) => ({ ...d, placement: e.target.value }))}
                          >
                            {SEGMENT_PLACEMENTS.map((p) => (
                              <option key={p.id} value={p.id}>{p.label}</option>
                            ))}
                          </select>
                        </Field>
                      </div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        <button type="button" className="btn primary sm" onClick={handleAddCustomSegment}>Save segment</button>
                        <button type="button" className="btn ghost sm" onClick={() => setShowAddCustomSegment(false)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button type="button" className="btn ghost sm" style={{ marginTop: 10 }} onClick={() => setShowAddCustomSegment(true)}>
                      + Add custom segment preset
                    </button>
                  )}
                </div>
              </div>
            )}
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="radio" checked={showAction === 'existing'} onChange={() => setShowAction('existing')} />
              Add to existing open show
            </label>
            {showAction === 'existing' && (
              <select className="select" value={selectedShowId} onChange={(e) => setSelectedShowId(e.target.value)} style={{ marginLeft: 24 }}>
                <option value="">Select show…</option>
                {openShows.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title || 'Untitled'} · {s.dateLabel || 'no date'}
                  </option>
                ))}
              </select>
            )}
          </div>
        </>
      )}

      {step === 6 && (
        <>
          <p style={{ marginBottom: 12 }}>
            Ready to import from <strong>{sheetMeta?.name || 'sample data'}</strong>:
          </p>
          <ul style={{ paddingLeft: 20, color: 'var(--on-paper-muted)', marginBottom: 12 }}>
            <li>{importSummary.create} new act{importSummary.create === 1 ? '' : 's'} to create</li>
            <li>{importSummary.update} existing act{importSummary.update === 1 ? '' : 's'} to update</li>
            {importSummary.versions > 0 && (
              <li>{importSummary.versions} new act version{importSummary.versions === 1 ? '' : 's'} to create</li>
            )}
            <li>{importSummary.skip} row{importSummary.skip === 1 ? '' : 's'} discarded</li>
            {showAction === 'new' && <li>New show: {newShowTitle.trim() || 'Imported show'}</li>}
            {showAction === 'new' && enabledSegments.length > 0 && (
              <li>{enabledSegments.length} segment{enabledSegments.length === 1 ? '' : 's'}: {enabledSegments.map((s) => s.title).join(', ')}</li>
            )}
            {showAction === 'existing' && selectedShowId && (
              <li>Add to show: {openShows.find((s) => s.id === selectedShowId)?.title || 'Selected show'}</li>
            )}
          </ul>
          <p style={{ fontSize: 13, color: 'var(--on-paper-muted)' }}>
            Media file names and Drive links are saved on each act. Upload or attach files manually if needed.
          </p>
        </>
      )}
    </Modal>
  );
}
