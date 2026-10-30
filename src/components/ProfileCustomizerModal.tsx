import React, { useEffect, useState } from 'react';
import {
  DEFAULT_EDITABLE_PROFILE,
  EditableProfileOverrides,
  isValidInstagramHandle,
  resolveInstagramHref,
} from '../data/portfolio';

interface ProfileCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: EditableProfileOverrides;
  onSave: (updated: EditableProfileOverrides) => void;
}

export function ProfileCustomizerModal({
  isOpen,
  onClose,
  profile,
  onSave,
}: ProfileCustomizerModalProps) {
  const [draft, setDraft] = useState<EditableProfileOverrides>(profile);
  const [copiedJson, setCopiedJson] = useState(false);

  useEffect(() => {
    setDraft(profile);
  }, [profile, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const resolvedIg = resolveInstagramHref(draft.instagramId, draft.instagramCustomUrl);
  const handleValid = isValidInstagramHandle(draft.instagramId);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setDraft((prev) => ({ ...prev, portraitUrl: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCopyConfig = () => {
    const json = JSON.stringify(draft, null, 2);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(json).then(() => {
        setCopiedJson(true);
        window.setTimeout(() => setCopiedJson(false), 2000);
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(draft);
    onClose();
  };

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      data-lenis-prevent=""
    >
      <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="customizer-title">
        <div className="modal-card__head">
          <div>
            <span className="mono">Editable Details</span>
            <h3 id="customizer-title" className="text-xl font-medium tracking-tight mt-1">
              Customize Profile &amp; Social Details
            </h3>
          </div>
          <button type="button" className="modal-card__close" onClick={onClose}>
            Close ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="composer__field">
            <label className="mono" htmlFor="cust-ig">
              Instagram Display ID
            </label>
            <input
              id="cust-ig"
              type="text"
              className="composer__input"
              value={draft.instagramId}
              onChange={(e) => setDraft({ ...draft, instagramId: e.target.value })}
              placeholder="_.sakthyyy._08._"
            />
            <span className="composer__note">
              {resolvedIg
                ? `Valid handle — links directly to ${resolvedIg}`
                : handleValid
                  ? 'Valid handle syntax.'
                  : 'Handle contains non-URL characters — no URL will be invented; clicking copies the exact display ID.'}
            </span>
          </div>

          <div className="composer__field">
            <label className="mono" htmlFor="cust-ig-url">
              Optional Explicit Instagram Profile URL
            </label>
            <input
              id="cust-ig-url"
              type="url"
              className="composer__input"
              value={draft.instagramCustomUrl}
              onChange={(e) => setDraft({ ...draft, instagramCustomUrl: e.target.value })}
              placeholder="https://www.instagram.com/..."
            />
          </div>

          <div className="composer__field">
            <label className="mono" htmlFor="cust-loc">
              Location Label
            </label>
            <input
              id="cust-loc"
              type="text"
              className="composer__input"
              value={draft.locationLabel}
              onChange={(e) => setDraft({ ...draft, locationLabel: e.target.value })}
              placeholder="India"
            />
          </div>

          <div className="composer__field">
            <label className="mono" htmlFor="cust-edu">
              Learning / Education Focus
            </label>
            <input
              id="cust-edu"
              type="text"
              className="composer__input"
              value={draft.educationNote}
              onChange={(e) => setDraft({ ...draft, educationNote: e.target.value })}
              placeholder="Self-directed Computer Science, Cybersecurity & Embedded Systems"
            />
          </div>

          <div className="composer__field">
            <label className="mono" htmlFor="cust-portrait">
              Portrait Photo URL or Local Upload
            </label>
            <input
              id="cust-portrait"
              type="text"
              className="composer__input"
              value={draft.portraitUrl}
              onChange={(e) => setDraft({ ...draft, portraitUrl: e.target.value })}
              placeholder="/portrait.webp or paste image URL"
            />
            <div className="flex flex-wrap items-center gap-3 mt-1">
              <label className="btn btn--ghost text-xs py-2 px-4 cursor-pointer">
                Upload local photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              {draft.portraitUrl && (
                <button
                  type="button"
                  onClick={() => setDraft({ ...draft, portraitUrl: '' })}
                  className="mono underline text-xs"
                >
                  Use S.K* monogram plate
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[var(--line)] mt-2">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="btn btn--ghost text-sm py-2.5 px-4"
                onClick={() => setDraft(DEFAULT_EDITABLE_PROFILE)}
              >
                Reset defaults
              </button>
              <button
                type="button"
                className="btn btn--ghost text-sm py-2.5 px-4"
                onClick={handleCopyConfig}
              >
                {copiedJson ? 'Config JSON Copied ✓' : 'Copy JSON'}
              </button>
            </div>
            <button type="submit" className="btn text-sm py-2.5 px-6">
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
