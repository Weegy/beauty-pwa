"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type RoutineItem = {
  id: string;
  title: string;
  slot: "AM" | "PM" | "Weekly";
  category: string;
  frequency: string;
  notes: string;
  completed: boolean;
};

type Recommendation = {
  id: string;
  name: string;
  category: string;
  when: "AM" | "PM" | "AM/PM" | "Weekly";
  frequency: string;
  notes: string;
};

type ScheduleItem = {
  day: string;
  treatment: string;
};

type Profile = {
  dryness: number;
  oiliness: number;
  sensitivity: number;
  focus: string;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type Tab = "routine" | "recommendations" | "profile" | "chat";
type RoutineSlot = "AM" | "PM" | "Weekly";

const defaultRecommendations: Recommendation[] = [
  { id: "rec-1", name: "Sulwhasoo First Care Activating Serum", category: "Booster", when: "AM/PM", frequency: "Täglich", notes: "Direkt nach der Reinigung, 1–2 Pumpstöße." },
  { id: "rec-2", name: "AMOREPACIFIC Vintage Single Extract Essence", category: "Essence", when: "AM/PM", frequency: "1–2× täglich", notes: "Nach dem Booster, vor Ampoule oder Serum." },
  { id: "rec-3", name: "COSRX Advanced Snail 96 Mucin Essence", category: "Hydration", when: "AM/PM", frequency: "Nach Bedarf täglich", notes: "Als zusätzlicher Feuchtigkeitslayer, vor Ampoule/Serum." },
  { id: "rec-4", name: "HERA Hydro Dew Plumping Ampoule", category: "Ampoule", when: "AM", frequency: "Täglich morgens", notes: "Für Glow und pralle Haut unter SPF." },
  { id: "rec-5", name: "SKIN1004 Probio-Cica Intensive Ampoule", category: "Ampoule", when: "PM", frequency: "4–7× pro Woche", notes: "Für Repair und Barrier-Support am Abend." },
  { id: "rec-6", name: "Sulwhasoo Ultimate S Serum", category: "Serum", when: "PM", frequency: "Täglich abends", notes: "Haupt-Anti-Aging-Step nach Essence/Ampoule." },
  { id: "rec-7", name: "Laneige Water Bank Blue Hyaluronic Cream", category: "Cream", when: "AM/PM", frequency: "Nach Bedarf", notes: "Ideal für die T-Zone oder als leichtere Tagescreme." },
  { id: "rec-8", name: "Sulwhasoo Concentrated Ginseng Renewing Cream", category: "Cream", when: "AM/PM", frequency: "Täglich", notes: "Wangen/abends großzügiger, morgens eher sparsam." },
  { id: "rec-9", name: "Biodance Bio-Collagen Real Deep Mask", category: "Sheet Mask", when: "PM", frequency: "1–2× pro Woche", notes: "Intensiv-Boost an trockenen Tagen." },
  { id: "rec-10", name: "Mediheal Mask", category: "Sheet Mask", when: "PM", frequency: "1–2× pro Woche", notes: "Maintenance zwischen den intensiveren Maskentagen." },
  { id: "rec-11", name: "Sulwhasoo Overnight Vitalizing Mask", category: "Sleeping Mask", when: "Weekly", frequency: "2–3× pro Woche", notes: "Als letzter Schritt statt der normalen Creme." },
  { id: "rec-12", name: "Enzyme Exfoliator / Peeling Gel", category: "Exfoliation", when: "Weekly", frequency: "1–2× pro Woche", notes: "Nicht am selben Abend wie starke Peelings kombinieren." },
  { id: "rec-13", name: "SPF 50+", category: "Protection", when: "AM", frequency: "Täglich morgens", notes: "Immer als letzter Schritt der Morgenroutine." },
  { id: "rec-14", name: "Sulwhasoo Concentrated Ginseng Renewing Eye Cream", category: "Eye Care", when: "AM/PM", frequency: "Täglich", notes: "Sehr sparsam anwenden, morgens und abends." }
];

const defaultRoutine: RoutineItem[] = [
  { id: "step-1", title: "Sanfter Cleanser", slot: "AM", category: "Cleanse", frequency: "Täglich", notes: "Mild reinigen, nicht austrocknen.", completed: false },
  { id: "step-2", title: "Sulwhasoo First Care Activating Serum", slot: "AM", category: "Booster", frequency: "Täglich", notes: "1–2 Pumpstöße direkt nach der Reinigung.", completed: false },
  { id: "step-3", title: "AMOREPACIFIC Vintage Single Extract Essence", slot: "AM", category: "Essence", frequency: "Täglich", notes: "Leichter Layer für Struktur und Feuchtigkeit.", completed: false },
  { id: "step-4", title: "HERA Hydro Dew Plumping Ampoule", slot: "AM", category: "Ampoule", frequency: "Täglich", notes: "Glow-Step vor Creme und SPF.", completed: false },
  { id: "step-5", title: "Laneige Water Bank Cream (T-Zone) / Sulwhasoo Cream (Wangen)", slot: "AM", category: "Moisturize", frequency: "Täglich", notes: "Mischhaut-spezifisches Layering.", completed: false },
  { id: "step-6", title: "SPF 50+", slot: "AM", category: "Protection", frequency: "Täglich", notes: "Als letzter Schritt.", completed: false },
  { id: "step-7", title: "Double Cleanse / Cleanser", slot: "PM", category: "Cleanse", frequency: "Täglich", notes: "Vor allem wenn SPF getragen wurde.", completed: false },
  { id: "step-8", title: "Sulwhasoo First Care Activating Serum", slot: "PM", category: "Booster", frequency: "Täglich", notes: "Wie morgens.", completed: false },
  { id: "step-9", title: "AMOREPACIFIC Essence oder COSRX Snail Essence", slot: "PM", category: "Essence", frequency: "Täglich", notes: "Je nach Feuchtigkeitsbedarf oder Hautgefühl.", completed: false },
  { id: "step-10", title: "SKIN1004 Probio-Cica Intensive Ampoule", slot: "PM", category: "Ampoule", frequency: "4–7×/Woche", notes: "Repair-Step für die Barriere.", completed: false },
  { id: "step-11", title: "Sulwhasoo Ultimate S Serum", slot: "PM", category: "Serum", frequency: "Täglich", notes: "Hauptbehandlung am Abend.", completed: false },
  { id: "step-12", title: "Sulwhasoo Concentrated Ginseng Cream", slot: "PM", category: "Moisturize", frequency: "Täglich", notes: "Etwas großzügiger als morgens.", completed: false },
  { id: "step-13", title: "Sheet Mask / Sleeping Mask / Exfoliation", slot: "Weekly", category: "Treatment", frequency: "Siehe Plan", notes: "Sheet Mask 2–4×/Woche, Sleeping Mask 2–3×/Woche, Exfoliation 1–2×/Woche.", completed: false }
];

const defaultSchedule: ScheduleItem[] = [
  { day: "Montag", treatment: "Normale PM-Routine" },
  { day: "Dienstag", treatment: "Sheet Mask" },
  { day: "Mittwoch", treatment: "Normale PM-Routine" },
  { day: "Donnerstag", treatment: "Exfoliation + reduzierte PM-Routine" },
  { day: "Freitag", treatment: "Sheet Mask" },
  { day: "Samstag", treatment: "Biodance / intensiver Maskenabend" },
  { day: "Sonntag", treatment: "Sleeping Mask" }
];

const defaultProfile: Profile = {
  dryness: 7,
  oiliness: 4,
  sensitivity: 4,
  focus: "Glow + Barrier"
};

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export default function RoutineApp() {
  const [routine, setRoutine] = useState<RoutineItem[]>(() => loadFromStorage("kb-routine-items", defaultRoutine));
  const [recommendations, setRecommendations] = useState<Recommendation[]>(() => loadFromStorage("kb-routine-recommendations", defaultRecommendations));
  const [schedule, setSchedule] = useState<ScheduleItem[]>(() => loadFromStorage("kb-routine-schedule", defaultSchedule));
  const [profile, setProfile] = useState<Profile>(() => loadFromStorage("kb-routine-profile", defaultProfile));
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [installable, setInstallable] = useState(false);
  const [feedback, setFeedback] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [activeTab, setActiveTab] = useState<Tab>("routine");
  const [routineSlot, setRoutineSlot] = useState<RoutineSlot>("AM");

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");
  const [apiKey, setApiKey] = useState(() => loadFromStorage("kb-openai-key", ""));
  const [showKeyInput, setShowKeyInput] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const [form, setForm] = useState({ title: "", slot: "AM" as RoutineItem["slot"], category: "Custom", frequency: "Täglich", notes: "" });
  const [recForm, setRecForm] = useState({ name: "", category: "Serum", when: "AM/PM" as Recommendation["when"], frequency: "Nach Bedarf", notes: "" });
  const [showAddForm, setShowAddForm] = useState(false);
  const [showRecForm, setShowRecForm] = useState(false);

  useEffect(() => saveToStorage("kb-routine-items", routine), [routine]);
  useEffect(() => saveToStorage("kb-routine-recommendations", recommendations), [recommendations]);
  useEffect(() => saveToStorage("kb-routine-schedule", schedule), [schedule]);
  useEffect(() => saveToStorage("kb-routine-profile", profile), [profile]);
  useEffect(() => saveToStorage("kb-openai-key", apiKey), [apiKey]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as any);
      setInstallable(true);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const stats = useMemo(() => ({
    total: routine.length,
    completed: routine.filter((item) => item.completed).length,
    am: routine.filter((item) => item.slot === "AM").length,
    pm: routine.filter((item) => item.slot === "PM").length,
    weekly: routine.filter((item) => item.slot === "Weekly").length,
  }), [routine]);

  const slotItems = useMemo(() => routine.filter((item) => item.slot === routineSlot), [routine, routineSlot]);

  const visibleRecommendations = useMemo(() => {
    return recommendations.filter((item) => {
      const matchesFilter = filter === "All" || item.when === filter || item.category === filter;
      const q = search.toLowerCase();
      const matchesSearch = !q || item.name.toLowerCase().includes(q) || item.notes.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [recommendations, filter, search]);

  const smartRecommendations = useMemo(() => {
    const items: { title: string; text: string }[] = [];
    if (profile.dryness >= 7) items.push({ title: "Mehr Feuchtigkeits-Reserven", text: "Erhöhe Sheet Masks auf 2–3× pro Woche und nutze die Sleeping Mask an zwei festen Abenden." });
    if (profile.oiliness >= 6) items.push({ title: "Leichtere Morgenroutine", text: "Nutze morgens die Water Cream in der T-Zone und beschränke reichhaltige Creme auf trockene Partien." });
    if (profile.sensitivity >= 6) items.push({ title: "Mehr Barrier-Support", text: "An sensiblen Tagen Exfoliation pausieren und abends den Repair-Layer priorisieren." });
    if (profile.focus.toLowerCase().includes("glow")) items.push({ title: "Glow priorisieren", text: "AMOREPACIFIC Essence und HERA Ampoule morgens als feste Steps beibehalten." });
    if (items.length === 0) items.push({ title: "Ausgewogene Basis", text: "Die Routine ist bereits gut balanciert. Weekly Treatments konstant halten und Hautreaktion beobachten." });
    return items;
  }, [profile]);

  function addRoutineItem(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setRoutine((prev) => [...prev, { id: crypto.randomUUID(), title: form.title.trim(), slot: form.slot, category: form.category.trim(), frequency: form.frequency.trim(), notes: form.notes.trim(), completed: false }]);
    setForm({ title: "", slot: "AM", category: "Custom", frequency: "Täglich", notes: "" });
    setShowAddForm(false);
  }

  function addRecommendation(e: React.FormEvent) {
    e.preventDefault();
    if (!recForm.name.trim()) return;
    setRecommendations((prev) => [{ id: crypto.randomUUID(), name: recForm.name.trim(), category: recForm.category.trim(), when: recForm.when, frequency: recForm.frequency.trim(), notes: recForm.notes.trim() }, ...prev]);
    setRecForm({ name: "", category: "Serum", when: "AM/PM", frequency: "Nach Bedarf", notes: "" });
    setShowRecForm(false);
  }

  function toggleComplete(id: string) {
    setRoutine((prev) => prev.map((item) => item.id === id ? { ...item, completed: !item.completed } : item));
  }

  function removeRoutineItem(id: string) {
    setRoutine((prev) => prev.filter((item) => item.id !== id));
  }

  function removeRecommendation(id: string) {
    setRecommendations((prev) => prev.filter((item) => item.id !== id));
  }

  function addRecommendationToRoutine(rec: Recommendation) {
    setRoutine((prev) => [...prev, { id: crypto.randomUUID(), title: rec.name, slot: rec.when === "AM/PM" ? "PM" : rec.when, category: rec.category, frequency: rec.frequency, notes: rec.notes, completed: false }]);
    setFeedback(`${rec.name} zur Routine hinzugefügt.`);
  }

  async function handleInstall() {
    if (!installPrompt) { setFeedback("Installationsdialog aktuell nicht verfügbar."); return; }
    installPrompt.prompt();
    const result = await installPrompt.userChoice;
    setFeedback(result.outcome === "accepted" ? "Installation gestartet." : "Installation abgebrochen.");
    setInstallPrompt(null);
    setInstallable(false);
  }

  function exportData() {
    const payload = { version: 1, exportedAt: new Date().toISOString(), routine, recommendations, schedule, profile };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "kbeauty-routine-export.json";
    a.click();
    URL.revokeObjectURL(url);
    setFeedback("Export erstellt.");
  }

  function importClick() { fileInputRef.current?.click(); }

  async function importData(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (Array.isArray(data.routine)) setRoutine(data.routine);
      if (Array.isArray(data.recommendations)) setRecommendations(data.recommendations);
      if (Array.isArray(data.schedule)) setSchedule(data.schedule);
      if (data.profile) setProfile(data.profile);
      setFeedback("Import erfolgreich.");
    } catch {
      setFeedback("Import fehlgeschlagen.");
    }
  }

  async function sendChat(e: React.FormEvent) {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;
    if (!apiKey) { setChatError("Bitte zuerst einen OpenAI API Key eingeben."); setShowKeyInput(true); return; }
    const userMsg: ChatMessage = { role: "user", content: chatInput.trim() };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setChatLoading(true);
    setChatError("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...chatMessages, userMsg], apiKey }),
      });
      const data = await res.json();
      if (!res.ok) { setChatError(data.error || "Fehler bei der Anfrage."); }
      else { setChatMessages((prev) => [...prev, { role: "assistant", content: data.reply }]); }
    } catch { setChatError("Netzwerkfehler."); }
    finally { setChatLoading(false); }
  }

  const card = "rounded-2xl border border-neutral-200 bg-white shadow-sm";
  const input = "w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500";
  const btn = "rounded-xl px-4 py-2 text-sm font-medium shadow-sm transition active:scale-[0.97]";
  const badge = "rounded-full border border-neutral-200 px-2 py-0.5 text-xs text-neutral-600";

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "routine", label: "Routine", icon: "☀️" },
    { key: "recommendations", label: "Tipps", icon: "💎" },
    { key: "profile", label: "Profil", icon: "⚙️" },
    { key: "chat", label: "AI Chat", icon: "💬" },
  ];

  return (
    <main className="min-h-screen bg-neutral-50 pb-16">
      {/* Header */}
      <div className="sticky top-0 z-20 border-b border-neutral-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-neutral-400">K-Beauty</div>
            <h1 className="text-lg font-bold tracking-tight">Routine Planner</h1>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className={badge}>{stats.completed}/{stats.total} erledigt</span>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mx-auto max-w-3xl px-4 py-4">

        {/* ───── ROUTINE TAB ───── */}
        {activeTab === "routine" && (
          <div className="space-y-4">
            {/* Slot sub-tabs */}
            <div className="flex gap-2">
              {(["AM", "PM", "Weekly"] as RoutineSlot[]).map((slot) => (
                <button key={slot} onClick={() => setRoutineSlot(slot)}
                  className={`${btn} flex-1 ${routineSlot === slot ? "bg-neutral-900 text-white" : "border border-neutral-300 bg-white text-neutral-700"}`}>
                  {slot} <span className="ml-1 text-xs opacity-70">({routine.filter(i => i.slot === slot).length})</span>
                </button>
              ))}
            </div>

            {/* Steps list */}
            <div className="space-y-2">
              {slotItems.map((item) => (
                <div key={item.id} className={`${card} p-3`}>
                  <div className="flex items-start gap-3">
                    <button onClick={() => toggleComplete(item.id)}
                      className={`mt-0.5 h-5 w-5 shrink-0 rounded-full border-2 transition ${item.completed ? "border-neutral-900 bg-neutral-900" : "border-neutral-300"}`}
                      aria-label="Toggle" />
                    <div className="min-w-0 flex-1">
                      <div className={`text-sm font-semibold ${item.completed ? "text-neutral-400 line-through" : ""}`}>{item.title}</div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        <span className={badge}>{item.category}</span>
                        <span className={badge}>{item.frequency}</span>
                      </div>
                      {item.notes && <p className="mt-1 text-xs text-neutral-500">{item.notes}</p>}
                    </div>
                    <button onClick={() => removeRoutineItem(item.id)} className="text-neutral-300 hover:text-neutral-600">✕</button>
                  </div>
                </div>
              ))}
              {slotItems.length === 0 && <p className="py-8 text-center text-sm text-neutral-400">Keine Steps für {routineSlot}.</p>}
            </div>

            {/* Add step toggle */}
            {!showAddForm ? (
              <button onClick={() => setShowAddForm(true)} className={`${btn} w-full border border-dashed border-neutral-300 bg-white`}>+ Step hinzufügen</button>
            ) : (
              <form onSubmit={addRoutineItem} className={`${card} space-y-3 p-4`}>
                <input className={input} placeholder="Produkt oder Schritt" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} autoFocus />
                <div className="grid grid-cols-2 gap-2">
                  <select className={input} value={form.slot} onChange={(e) => setForm({ ...form, slot: e.target.value as RoutineItem["slot"] })}>
                    <option>AM</option><option>PM</option><option>Weekly</option>
                  </select>
                  <input className={input} placeholder="Kategorie" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
                </div>
                <input className={input} placeholder="Häufigkeit" value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} />
                <textarea className={input} rows={2} placeholder="Notizen" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                <div className="flex gap-2">
                  <button type="submit" className={`${btn} flex-1 bg-neutral-900 text-white`}>Speichern</button>
                  <button type="button" onClick={() => setShowAddForm(false)} className={`${btn} flex-1 border border-neutral-300 bg-white`}>Abbrechen</button>
                </div>
              </form>
            )}

            {/* Quick actions */}
            <div className={`${card} p-4 space-y-3`}>
              <div className="text-xs font-semibold uppercase tracking-widest text-neutral-400">Backup</div>
              <div className="flex flex-wrap gap-2">
                <button onClick={handleInstall} disabled={!installable} className={`${btn} ${installable ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-400"}`}>Installieren</button>
                <button onClick={exportData} className={`${btn} border border-neutral-300 bg-white`}>Export</button>
                <button onClick={importClick} className={`${btn} border border-neutral-300 bg-white`}>Import</button>
                <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={importData} />
              </div>
              {feedback && <p className="text-xs text-neutral-500">{feedback}</p>}
            </div>
          </div>
        )}

        {/* ───── RECOMMENDATIONS TAB ───── */}
        {activeTab === "recommendations" && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <input className={`${input} flex-1`} placeholder="Suche…" value={search} onChange={(e) => setSearch(e.target.value)} />
              <select className={`${input} w-28`} value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="All">Alle</option>
                <option value="AM">AM</option>
                <option value="PM">PM</option>
                <option value="AM/PM">AM/PM</option>
                <option value="Weekly">Weekly</option>
                <option value="Ampoule">Ampoule</option>
                <option value="Serum">Serum</option>
                <option value="Sheet Mask">Sheet Mask</option>
                <option value="Cream">Cream</option>
                <option value="Eye Care">Eye Care</option>
              </select>
            </div>
            <div className="text-xs text-neutral-400">{visibleRecommendations.length} Empfehlungen</div>

            <div className="space-y-2">
              {visibleRecommendations.map((item) => (
                <div key={item.id} className={`${card} p-3`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold">{item.name}</div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        <span className={badge}>{item.category}</span>
                        <span className={badge}>{item.when}</span>
                        <span className={badge}>{item.frequency}</span>
                      </div>
                      <p className="mt-1 text-xs text-neutral-500">{item.notes}</p>
                    </div>
                    <button onClick={() => removeRecommendation(item.id)} className="text-neutral-300 hover:text-neutral-600">✕</button>
                  </div>
                  <button onClick={() => addRecommendationToRoutine(item)} className={`${btn} mt-2 w-full bg-neutral-900 text-white text-xs`}>Zur Routine hinzufügen</button>
                </div>
              ))}
            </div>

            {!showRecForm ? (
              <button onClick={() => setShowRecForm(true)} className={`${btn} w-full border border-dashed border-neutral-300 bg-white`}>+ Empfehlung hinzufügen</button>
            ) : (
              <form onSubmit={addRecommendation} className={`${card} space-y-3 p-4`}>
                <input className={input} placeholder="Produktname" value={recForm.name} onChange={(e) => setRecForm({ ...recForm, name: e.target.value })} autoFocus />
                <div className="grid grid-cols-2 gap-2">
                  <input className={input} placeholder="Kategorie" value={recForm.category} onChange={(e) => setRecForm({ ...recForm, category: e.target.value })} />
                  <select className={input} value={recForm.when} onChange={(e) => setRecForm({ ...recForm, when: e.target.value as Recommendation["when"] })}>
                    <option>AM</option><option>PM</option><option>AM/PM</option><option>Weekly</option>
                  </select>
                </div>
                <input className={input} placeholder="Häufigkeit" value={recForm.frequency} onChange={(e) => setRecForm({ ...recForm, frequency: e.target.value })} />
                <textarea className={input} rows={2} placeholder="Notizen" value={recForm.notes} onChange={(e) => setRecForm({ ...recForm, notes: e.target.value })} />
                <div className="flex gap-2">
                  <button type="submit" className={`${btn} flex-1 bg-neutral-900 text-white`}>Speichern</button>
                  <button type="button" onClick={() => setShowRecForm(false)} className={`${btn} flex-1 border border-neutral-300 bg-white`}>Abbrechen</button>
                </div>
              </form>
            )}
            {feedback && <p className="text-xs text-neutral-500">{feedback}</p>}
          </div>
        )}

        {/* ───── PROFILE TAB ───── */}
        {activeTab === "profile" && (
          <div className="space-y-4">
            <div className={`${card} p-4 space-y-4`}>
              <div className="text-xs font-semibold uppercase tracking-widest text-neutral-400">Hautprofil</div>
              <Slider label={`Trockenheit: ${profile.dryness}/10`} value={profile.dryness} onChange={(v) => setProfile({ ...profile, dryness: v })} />
              <Slider label={`Ölige T-Zone: ${profile.oiliness}/10`} value={profile.oiliness} onChange={(v) => setProfile({ ...profile, oiliness: v })} />
              <Slider label={`Sensitivität: ${profile.sensitivity}/10`} value={profile.sensitivity} onChange={(v) => setProfile({ ...profile, sensitivity: v })} />
              <div>
                <label className="mb-1 block text-sm font-medium">Fokus</label>
                <select className={input} value={profile.focus} onChange={(e) => setProfile({ ...profile, focus: e.target.value })}>
                  <option>Glow + Barrier</option>
                  <option>Mehr Glow</option>
                  <option>Mehr Hydration</option>
                  <option>Mehr Repair</option>
                  <option>Leichtere Routine</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-widest text-neutral-400">Smart Empfehlungen</div>
              {smartRecommendations.map((item) => (
                <div key={item.title} className={`${card} p-3`}>
                  <div className="text-sm font-semibold">{item.title}</div>
                  <div className="mt-1 text-xs text-neutral-500">{item.text}</div>
                </div>
              ))}
            </div>

            <div className={`${card} p-4`}>
              <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-neutral-400">Wochenplan</div>
              <div className="space-y-2">
                {schedule.map((item, index) => (
                  <div key={item.day} className="flex items-center gap-2">
                    <span className="w-16 shrink-0 text-xs font-medium text-neutral-600">{item.day.slice(0, 2)}</span>
                    <input className={input} value={item.treatment} onChange={(e) => setSchedule((prev) => prev.map((row, i) => i === index ? { ...row, treatment: e.target.value } : row))} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ───── AI CHAT TAB ───── */}
        {activeTab === "chat" && (
          <div className="flex flex-col" style={{ height: "calc(100vh - 130px)" }}>
            {/* Key config */}
            <div className="mb-3 flex items-center justify-between">
              <div className="text-xs font-semibold uppercase tracking-widest text-neutral-400">Skincare Berater</div>
              <button onClick={() => setShowKeyInput(!showKeyInput)} className="text-lg" title="API Key">⚙️</button>
            </div>
            {showKeyInput && (
              <div className={`${card} mb-3 p-3 space-y-2`}>
                <label className="block text-xs font-medium text-neutral-600">OpenAI API Key</label>
                <input type="password" className={input} placeholder="sk-..." value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
                <p className="text-xs text-neutral-400">Dein Key wird lokal gespeichert und nur für Anfragen an OpenAI verwendet.</p>
                <button onClick={() => setShowKeyInput(false)} className={`${btn} bg-neutral-900 text-white text-xs`}>Fertig</button>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-3 pb-2">
              {chatMessages.length === 0 && !showKeyInput && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="text-4xl mb-3">✨</div>
                  <div className="text-sm font-semibold text-neutral-700">K-Beauty Skincare Berater</div>
                  <p className="mt-1 max-w-xs text-xs text-neutral-400">Frag mich zu Inhaltsstoffen, Routine-Aufbau, Produktempfehlungen oder Hautpflege-Tipps.</p>
                </div>
              )}
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${msg.role === "user" ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-800"}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-neutral-100 px-4 py-2 text-sm text-neutral-400">Denkt nach…</div>
                </div>
              )}
              {chatError && <p className="text-xs text-red-500">{chatError}</p>}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendChat} className="mt-2 flex gap-2">
              <input className={`${input} flex-1`} placeholder="Frage stellen…" value={chatInput} onChange={(e) => setChatInput(e.target.value)} />
              <button type="submit" disabled={chatLoading} className={`${btn} bg-neutral-900 text-white shrink-0 ${chatLoading ? "opacity-50" : ""}`}>↑</button>
            </form>
          </div>
        )}

      </div>

      {/* Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-neutral-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs transition ${activeTab === t.key ? "text-neutral-900 font-semibold" : "text-neutral-400"}`}>
              <span className="text-base">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </nav>
    </main>
  );
}

function Slider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      <input type="range" min="1" max="10" value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full" />
    </div>
  );
}
