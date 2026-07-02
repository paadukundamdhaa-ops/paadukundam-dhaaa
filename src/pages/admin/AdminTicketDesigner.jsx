import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ChevronLeft, Save, RotateCcw, Check, Plus, Trash2, Calendar, MapPin, UploadCloud, X } from 'lucide-react';
import Swal from 'sweetalert2';

const DEFAULT_DESIGN = {
  accentColor: '#cc0000',
  bgColor: '#ffffff',
  entryPassLabel: 'ENTRY PASS',
  badgeText: 'ACTIVE',
  badgeColor: '#cc0000',
  headerTagline: '',
  showVenue: true,
  showDate: true,
  showTime: true,
  showBadge: true,
  showBookingId: true,
  showTiers: true,
  qrPosition: 'left',
  dividerStyle: 'dashed',
  footerEnabled: false,
  footerText: '',
  customFields: [],
  borderRadius: '2rem',
  logoUrl: '',
  logoPosition: 'center',
};

const PRESETS = [
  {
    label: '🔴 Classic Red',
    design: { accentColor: '#cc0000', bgColor: '#ffffff', badgeText: 'ACTIVE', badgeColor: '#cc0000', footerEnabled: false },
  },
  {
    label: '⚫ Dark Luxe',
    design: { accentColor: '#f5c518', bgColor: '#1a1a1a', badgeText: 'VIP', badgeColor: '#f5c518', footerEnabled: true, footerText: 'Exclusive VIP Access Only' },
  },
  {
    label: '💚 Festival',
    design: { accentColor: '#16a34a', bgColor: '#ffffff', badgeText: 'LIVE', badgeColor: '#16a34a', footerEnabled: true, footerText: '• No re-entry\n• Gates open 5:30 PM' },
  },
  {
    label: '💙 Corporate',
    design: { accentColor: '#1d4ed8', bgColor: '#ffffff', badgeText: 'CONFERENCE', badgeColor: '#1d4ed8', footerEnabled: true, footerText: 'Business Formal Attire Required' },
  },
  {
    label: '🤍 Minimal',
    design: { accentColor: '#000000', bgColor: '#ffffff', badgeText: '', badgeColor: '#000000', showBadge: false, footerEnabled: false },
  },
];

function isLightColor(hex) {
  try {
    const rgb = parseInt((hex || '#ffffff').replace('#', ''), 16);
    const r = (rgb >> 16) & 0xff, g = (rgb >> 8) & 0xff, b = rgb & 0xff;
    return 0.299 * r + 0.587 * g + 0.114 * b > 128;
  } catch { return true; }
}

function LiveTicketPreview({ design, event }) {
  const tiersMock = [{ name: 'VIP', qty: 2 }, { name: 'General', qty: 3 }];
  const textOnBg = isLightColor(design.bgColor) ? '#000000' : '#ffffff';
  const textOnBgMuted = isLightColor(design.bgColor) ? '#6b7280' : '#9ca3af';

  const dividerClass = {
    dashed: 'border-dashed',
    solid: 'border-solid',
    dotted: 'border-dotted',
    none: 'border-none',
  }[design.dividerStyle] || 'border-dashed';

  return (
    <div
      className="w-full max-w-[360px] overflow-hidden shadow-2xl relative"
      style={{ backgroundColor: design.bgColor, borderRadius: design.borderRadius, border: '1px solid #e5e7eb' }}
    >
      {/* Header */}
      <div className="pt-5 pb-4 px-5 flex flex-col" style={{ alignItems: design.logoPosition === 'left' ? 'flex-start' : design.logoPosition === 'right' ? 'flex-end' : 'center', backgroundColor: design.bgColor }}>
        {design.logoUrl ? (
          <img src={design.logoUrl} alt="Logo" className="h-10 object-contain mb-1" onError={e => e.target.style.display = 'none'} />
        ) : (
          <div className="font-black text-base tracking-wider" style={{ color: design.accentColor }}>PaadukundamDhaa</div>
        )}
        {design.headerTagline && (
          <p className="text-[10px] mt-1 font-medium" style={{ color: textOnBgMuted }}>{design.headerTagline}</p>
        )}
      </div>

      {/* Event Banner */}
      <div className="relative h-52 w-full bg-gray-800 flex items-end">
        {event?.image_url ? (
          <img src={event.image_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div className="relative px-5 pb-4 w-full">
          {design.showBadge && design.badgeText && (
            <div className="inline-block text-white text-[10px] font-black px-2 py-0.5 rounded mb-1.5 tracking-wider" style={{ backgroundColor: design.badgeColor }}>
              {design.badgeText}
            </div>
          )}
          <h2 className="text-xl font-black text-white leading-tight mb-1.5">{event?.title || 'Event Title'}</h2>
          {design.showDate && (
            <div className="flex items-center text-gray-200 text-[12px] gap-1.5 mb-1">
              <Calendar size={11} style={{ color: design.accentColor }} />
              <span>Sat, Jul 12 {design.showTime ? '| 18:00' : ''}</span>
            </div>
          )}
          {design.showVenue && (
            <div className="flex items-center text-gray-200 text-[12px] gap-1.5">
              <MapPin size={11} style={{ color: design.accentColor }} />
              <span className="truncate">{event?.venue || 'Venue'}, {event?.city || 'City'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Tear Divider */}
      {design.dividerStyle !== 'none' && (
        <div className="relative flex items-center h-9" style={{ backgroundColor: design.bgColor }}>
          <div className="absolute -left-4 w-8 h-8 bg-gray-100 rounded-full border-r border-gray-200" />
          <div className={`w-full border-t-2 ${dividerClass} border-gray-300 mx-7`} />
          <div className="absolute -right-4 w-8 h-8 bg-gray-100 rounded-full border-l border-gray-200" />
        </div>
      )}

      {/* Stub */}
      <div
        className="px-5 pt-1 pb-6 flex items-start gap-4"
        style={{ backgroundColor: design.bgColor, flexDirection: design.qrPosition === 'right' ? 'row-reverse' : 'row' }}
      >
        <div className="w-[100px] h-[100px] shrink-0 border-2 border-gray-100 rounded-xl p-2 bg-white shadow-sm flex items-center justify-center">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=PREVIEW" alt="QR" className="w-full h-full" />
        </div>
        <div className="flex-1 flex flex-col items-end text-right">
          <p className="font-black text-[10px] tracking-[0.2em] mb-1" style={{ color: design.accentColor }}>{design.entryPassLabel}</p>
          {design.showTiers && tiersMock.map((t, i) => (
            <p key={i} className="text-[13px] font-black uppercase leading-tight" style={{ color: textOnBg }}>{t.qty}x {t.name}</p>
          ))}
          <p className="text-[11px] mb-2" style={{ color: textOnBgMuted }}>5 Ticket(s)</p>
          {(design.customFields || []).map((f, i) => f.label && f.value ? (
            <p key={i} className="text-[10px] mb-0.5" style={{ color: textOnBgMuted }}>
              <span className="font-bold">{f.label}:</span> {f.value}
            </p>
          ) : null)}
          {design.showBookingId && (
            <div className="border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 w-full text-center mt-1">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Booking ID</p>
              <p className="text-sm font-black text-black">#PKD-PREVIEW</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      {design.footerEnabled && design.footerText && (
        <div className="px-5 py-4 border-t border-gray-200 text-center" style={{ backgroundColor: design.bgColor }}>
          <p className="text-[11px] whitespace-pre-line" style={{ color: textOnBgMuted }}>{design.footerText}</p>
        </div>
      )}
    </div>
  );
}

export default function AdminTicketDesigner() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [design, setDesign] = useState(DEFAULT_DESIGN);
  const [event, setEvent] = useState(null);
  const [saving, setSaving] = useState(false);
  const [activePreset, setActivePreset] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const logoInputRef = useRef(null);

  useEffect(() => {
    const fetchEvent = async () => {
      const { data } = await supabase
        .from('events')
        .select('id, title, venue, city, image_url, ticket_design')
        .eq('id', id)
        .single();
      if (data) {
        setEvent(data);
        if (data.ticket_design) setDesign({ ...DEFAULT_DESIGN, ...data.ticket_design });
      }
    };
    fetchEvent();
  }, [id]);

  const set = (key, value) => { setDesign(prev => ({ ...prev, [key]: value })); setActivePreset(null); };
  const applyPreset = (preset, idx) => { setDesign(prev => ({ ...prev, ...preset.design })); setActivePreset(idx); };

  const addCustomField = () => setDesign(prev => ({ ...prev, customFields: [...(prev.customFields || []), { label: '', value: '' }] }));
  const updateCustomField = (i, key, val) => {
    const fields = [...(design.customFields || [])];
    fields[i] = { ...fields[i], [key]: val };
    setDesign(prev => ({ ...prev, customFields: fields }));
  };
  const removeCustomField = (i) => {
    const fields = [...(design.customFields || [])]; fields.splice(i, 1);
    setDesign(prev => ({ ...prev, customFields: fields }));
  };

  const handleSave = async () => {
    setSaving(true);
    let finalLogoUrl = design.logoUrl;

    // Upload logo if one was selected
    if (logoFile) {
      const fileExt = logoFile.name.split('.').pop();
      const fileName = `ticket_logo_${id}_${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('event-images').upload(fileName, logoFile);
      if (uploadError) {
        Swal.fire({ icon: 'error', title: 'Upload Failed', text: uploadError.message });
        setSaving(false);
        return;
      }
      const { data: { publicUrl } } = supabase.storage.from('event-images').getPublicUrl(fileName);
      finalLogoUrl = publicUrl;
    }

    const designToSave = { ...design, logoUrl: finalLogoUrl };
    const { error } = await supabase.from('events').update({ ticket_design: designToSave }).eq('id', id);
    setSaving(false);
    if (error) {
      Swal.fire({ icon: 'error', title: 'Save Failed', text: error.message, confirmButtonColor: '#e11d48' });
    } else {
      setLogoFile(null);
      setDesign(designToSave);
      Swal.fire({ icon: 'success', title: 'Design Saved!', text: 'All tickets for this event will now use this design.', confirmButtonColor: '#22c55e', timer: 2000, showConfirmButton: false });
    }
  };

  const handleLogoUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      set('logoUrl', URL.createObjectURL(file));
    }
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    set('logoUrl', '');
  };

  const labelClass = 'block text-[12px] font-bold text-gray-600 mb-1.5 uppercase tracking-wide';
  const inputClass = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-white';

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-black">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(`/admin/events/edit/${id}`)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500">
              <ChevronLeft size={20} />
            </button>
            <div className="h-4 w-px bg-gray-300" />
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Link to="/admin/events" className="hover:text-black">Events</Link>
              <span>/</span>
              <span className="cursor-pointer hover:text-black" onClick={() => navigate(`/admin/events/edit/${id}`)}>{event?.title || 'Edit Event'}</span>
              <span>/</span>
              <span className="font-bold text-black">🎨 Ticket Design</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => { setDesign(DEFAULT_DESIGN); setActivePreset(null); setLogoFile(null); }} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100">
              <RotateCcw size={15} /> Reset
            </button>
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-black text-white bg-primary hover:bg-red-700 shadow-md disabled:opacity-60">
              <Save size={15} /> {saving ? 'Saving...' : 'Save Design'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 py-8 flex gap-8 items-start">

        {/* ── LEFT CONTROLS ── */}
        <div className="w-[480px] shrink-0 space-y-5">

          {/* Presets */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <h3 className="text-sm font-black text-gray-800 mb-3">⚡ Quick Presets</h3>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p, i) => (
                <button key={i} onClick={() => applyPreset(p, i)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${activePreset === i ? 'bg-primary text-white border-primary' : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-400'}`}>
                  {activePreset === i && <Check size={11} className="inline mr-1" />}{p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Header */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-gray-800 border-b border-gray-100 pb-2">🏷️ Header Block</h3>
            <div>
              <label className={labelClass}>Header Logo</label>
              <div className="flex items-center gap-3">
                {design.logoUrl ? (
                  <div className="relative group w-20 h-20 rounded-xl bg-gray-100 border-2 border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                    <img src={design.logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                    <button onClick={handleRemoveLogo} className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="text-white" size={24} />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => logoInputRef.current?.click()} className="w-20 h-20 rounded-xl bg-gray-50 border-2 border-dashed border-gray-300 hover:border-purple-400 hover:bg-purple-50 flex flex-col items-center justify-center text-gray-500 hover:text-purple-600 transition-colors shrink-0">
                    <UploadCloud size={24} className="mb-1" />
                    <span className="text-[10px] font-bold">UPLOAD</span>
                  </button>
                )}
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-2">Upload a transparent PNG for best results on the ticket.</p>
                  <button onClick={() => logoInputRef.current?.click()} className="text-xs font-bold text-primary hover:underline">Change Logo</button>
                </div>
                <input type="file" accept="image/*" className="hidden" ref={logoInputRef} onChange={handleLogoUpload} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Logo Position</label>
              <div className="flex gap-2">
                {['left', 'center', 'right'].map(p => (
                  <button key={p} onClick={() => set('logoPosition', p)}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold border capitalize transition-all ${design.logoPosition === p ? 'bg-primary text-white border-primary' : 'bg-gray-50 border-gray-200 hover:border-gray-400'}`}>{p}</button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelClass}>Header Tagline (optional)</label>
              <input type="text" className={inputClass} value={design.headerTagline || ''} onChange={e => set('headerTagline', e.target.value)} placeholder="Official Ticket — No Transfers" />
            </div>
          </div>

          {/* Banner */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-gray-800 border-b border-gray-100 pb-2">🎬 Event Banner</h3>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className={labelClass}>Accent Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={design.accentColor} onChange={e => set('accentColor', e.target.value)} className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
                  <input type="text" value={design.accentColor} onChange={e => set('accentColor', e.target.value)} className={inputClass} />
                </div>
              </div>
              <div className="flex-1">
                <label className={labelClass}>Card Background</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={design.bgColor} onChange={e => set('bgColor', e.target.value)} className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
                  <input type="text" value={design.bgColor} onChange={e => set('bgColor', e.target.value)} className={inputClass} />
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className={labelClass}>Badge Text</label>
                <input type="text" className={inputClass} value={design.badgeText || ''} onChange={e => set('badgeText', e.target.value)} placeholder="ACTIVE" />
              </div>
              <div className="flex-1">
                <label className={labelClass}>Badge Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={design.badgeColor} onChange={e => set('badgeColor', e.target.value)} className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
                  <input type="text" value={design.badgeColor} onChange={e => set('badgeColor', e.target.value)} className={inputClass} />
                </div>
              </div>
            </div>
            <div>
              <label className={labelClass}>Show / Hide</label>
              <div className="flex gap-2 flex-wrap">
                {[{ key: 'showBadge', label: 'Badge' }, { key: 'showDate', label: 'Date' }, { key: 'showTime', label: 'Time' }, { key: 'showVenue', label: 'Venue' }].map(({ key, label }) => (
                  <button key={key} onClick={() => set(key, !design[key])}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${design[key] ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-400 border-gray-200 line-through'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <h3 className="text-sm font-black text-gray-800 border-b border-gray-100 pb-2 mb-4">✂️ Tear Divider</h3>
            <div className="flex gap-2">
              {['dashed', 'solid', 'dotted', 'none'].map(s => (
                <button key={s} onClick={() => set('dividerStyle', s)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold border capitalize transition-all ${design.dividerStyle === s ? 'bg-primary text-white border-primary' : 'bg-gray-50 border-gray-200 hover:border-gray-400'}`}>{s}</button>
              ))}
            </div>
          </div>

          {/* Stub */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-gray-800 border-b border-gray-100 pb-2">🎟️ Ticket Stub</h3>
            <div>
              <label className={labelClass}>"Entry Pass" Label</label>
              <input type="text" className={inputClass} value={design.entryPassLabel || ''} onChange={e => set('entryPassLabel', e.target.value)} placeholder="ENTRY PASS" />
            </div>
            <div>
              <label className={labelClass}>QR Code Side</label>
              <div className="flex gap-2">
                {['left', 'right'].map(p => (
                  <button key={p} onClick={() => set('qrPosition', p)}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold border capitalize transition-all ${design.qrPosition === p ? 'bg-primary text-white border-primary' : 'bg-gray-50 border-gray-200 hover:border-gray-400'}`}>
                    QR on {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              {[{ key: 'showTiers', label: 'Show Tiers' }, { key: 'showBookingId', label: 'Booking ID Box' }].map(({ key, label }) => (
                <button key={key} onClick={() => set(key, !design[key])}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${design[key] ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
                  {design[key] ? '✓' : '✗'} {label}
                </button>
              ))}
            </div>

            {/* Custom Fields */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={labelClass + ' mb-0'}>Custom Info Fields</label>
                <button onClick={addCustomField} className="flex items-center gap-1 text-xs font-bold text-primary hover:underline">
                  <Plus size={13} /> Add Field
                </button>
              </div>
              <div className="space-y-2">
                {(design.customFields || []).map((f, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input type="text" className={inputClass + ' flex-1'} placeholder="Label" value={f.label} onChange={e => updateCustomField(i, 'label', e.target.value)} />
                    <input type="text" className={inputClass + ' flex-1'} placeholder="Value" value={f.value} onChange={e => updateCustomField(i, 'value', e.target.value)} />
                    <button onClick={() => removeCustomField(i)} className="text-red-400 hover:text-red-600 shrink-0"><Trash2 size={15} /></button>
                  </div>
                ))}
                {!(design.customFields || []).length && (
                  <p className="text-xs text-gray-400 italic">e.g. Dress Code: Formal &nbsp;|&nbsp; Parking: Basement B2</p>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h3 className="text-sm font-black text-gray-800">📝 Footer / Rules Block</h3>
              <button onClick={() => set('footerEnabled', !design.footerEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${design.footerEnabled ? 'bg-primary' : 'bg-gray-200'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${design.footerEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            {design.footerEnabled && (
              <div>
                <label className={labelClass}>Footer Text (each line = one rule)</label>
                <textarea rows={4} className={inputClass + ' resize-none'} value={design.footerText || ''} onChange={e => set('footerText', e.target.value)}
                  placeholder={'• No re-entry after exit\n• Valid ID required\n• Gates open at 5:30 PM'} />
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT PREVIEW ── */}
        <div className="flex-1 sticky top-28">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-black text-gray-800">Live Preview</h3>
                <p className="text-xs text-gray-400 mt-0.5">Updates in real-time as you make changes</p>
              </div>
              <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full">● LIVE</span>
            </div>
            <div className="flex justify-center">
              <LiveTicketPreview design={design} event={event} />
            </div>
            <p className="text-center text-xs text-gray-400 mt-4">
              This is exactly what customers will see when they open or download their ticket.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
