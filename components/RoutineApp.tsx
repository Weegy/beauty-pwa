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

  const [form, setForm] = useState({ title: "", slot: "AM" as RoutineItem["slot"], category: "Custom", frequency: "Täglich", notes: "" });
  const [recForm, setRecForm] = useState({ name: "", category: "Serum", when: "AM/PM" as Recommendation["when"], frequency: "Nach Bedarf", notes: "" });

  useEffect(() => saveToStorage("kb-routine-items", routine), [routine]);
  useEffect(() => saveToStorage("kb-routine-recommendations", recommendations), [recommendations]);
  useEffect(() => saveToStorage("kb-routine-schedule", schedule), [schedule]);
  useEffect(() => saveToStorage("kb-routine-profile", profile), [profile]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as any);
      setInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  const stats = useMemo(() => ({
    total: routine.length,
    completed: routine.filter((item) => item.completed).length,
    am: routine.filter((item) => item.slot === "AM").length,
    pm: routine.filter((item) => item.slot === "PM").length,
    weekly: routine.filter((item) => item.slot === "Weekly").length,
  }), [routine]);

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

    if (profile.dryness >= 7) {
      items.push({ title: "Mehr Feuchtigkeits-Reserven", text: "Erhöhe Sheet Masks auf 2–3× pro Woche und nutze die Sleeping Mask an zwei festen Abenden." });
    }
    if (profile.oiliness >= 6) {
      items.push({ title: "Leichtere Morgenroutine", text: "Nutze morgens die Water Cream in der T-Zone und beschränke reichhaltige Creme auf trockene Partien." });
    }
    if (profile.sensitivity >= 6) {
      items.push({ title: "Mehr Barrier-Support", text: "An sensiblen Tagen Exfoliation pausieren und abends den Repair-Layer priorisieren." });
    }
    if (profile.focus.toLowerCase().includes("glow")) {
      items.push({ title: "Glow priorisieren", text: "AMOREPACIFIC Essence und HERA Ampoule morgens als feste Steps beibehalten." });
    }
    if (items.length === 0) {
      items.push({ title: "Ausgewogene Basis", text: "Die Routine ist bereits gut balanciert. Weekly Treatments konstant halten und Hautreaktion beobachten." });
    }
    return items;
  }, [profile]);

  function addRoutineItem(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setRoutine((prev) => [...prev, { id: crypto.randomUUID(), title: form.title.trim(), slot: form.slot, category: form.category.trim(), frequency: form.frequency.trim(), notes: form.notes.trim(), completed: false }]);
    setForm({ title: "", slot: "AM", category: "Custom", frequency: "Täglich", notes: "" });
  }

  function addRecommendation(e: React.FormEvent) {
    e.preventDefault();
    if (!recForm.name.trim()) return;
    setRecommendations((prev) => [{ id: crypto.randomUUID(), name: recForm.name.trim(), category: recForm.category.trim(), when: recForm.when, frequency: recForm.frequency.trim(), notes: recForm.notes.trim() }, ...prev]);
    setRecForm({ name: "", category: "Serum", when: "AM/PM", frequency: "Nach Bedarf", notes: "" });
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
    if (!installPrompt) {
      setFeedback("Installationsdialog aktuell nicht verfügbar.");
      return;
    }
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

  function importClick() {
    fileInputRef.current?.click();
  }

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

  const card = "rounded-3xl border border-neutral-200 bg-white shadow-sm";
  const input = "w-full rounded-2xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500";
  const button = "rounded-2xl px-4 py-2 text-sm font-medium shadow-sm transition active:scale-[0.99]";
  const badge = "rounded-full border border-neutral-200 px-2.5 py-1 text-xs text-neutral-600";

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className={`${card} overflow-hidden`}>
          <div className="border-b border-neutral-200 bg-gradient-to-br from-white to-neutral-100 p-6 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-3">
                <div className="inline-flex items-center rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-medium text-neutral-600 shadow-sm">K-Beauty Routine Planner</div>
                <div>
                  <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Luxury Routine Planner</h1>
                  <p className="mt-2 max-w-2xl text-sm text-neutral-600 sm:text-base">Deploybar auf Vercel mit App Router, PWA-Support, Offline-Cache, JSON Backup und erweiterbarer Empfehlungsliste.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard label="Gesamt" value={stats.total} />
                <StatCard label="Erledigt" value={stats.completed} />
                <StatCard label="AM" value={stats.am} />
                <StatCard label="PM" value={stats.pm} />
              </div>
            </div>
          </div>

          <div className="grid gap-6 p-6 lg:grid-cols-[1.05fr_0.95fr] sm:p-8">
            <section className="space-y-6">
              <SectionTitle eyebrow="Quick actions" title="Installation und Backup" subtitle="PWA installieren, Export/Import nutzen und Daten lokal behalten." />
              <div className="flex flex-wrap gap-3">
                <button onClick={handleInstall} disabled={!installable} className={`${button} ${installable ? "bg-neutral-900 text-white" : "bg-neutral-200 text-neutral-500"}`}>App installieren</button>
                <button onClick={exportData} className={`${button} border border-neutral-300 bg-white`}>JSON exportieren</button>
                <button onClick={importClick} className={`${button} border border-neutral-300 bg-white`}>JSON importieren</button>
                <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={importData} />
              </div>
              {feedback ? <p className="text-sm text-neutral-600">{feedback}</p> : null}

              <div className="grid gap-4 md:grid-cols-2">
                <form onSubmit={addRoutineItem} className={`${card} p-4 space-y-3`}>
                  <div className="text-sm font-semibold">Neuen Routine-Step anlegen</div>
                  <input className={input} placeholder="Produkt oder Schritt" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                  <div className="grid grid-cols-2 gap-3">
                    <select className={input} value={form.slot} onChange={(e) => setForm({ ...form, slot: e.target.value as RoutineItem["slot"] })}>
                      <option>AM</option>
                      <option>PM</option>
                      <option>Weekly</option>
                    </select>
                    <input className={input} placeholder="Kategorie" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
                  </div>
                  <input className={input} placeholder="Häufigkeit" value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} />
                  <textarea className={input} rows={3} placeholder="Notizen" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                  <button className={`${button} bg-neutral-900 text-white`}>Step hinzufügen</button>
                </form>

                <form onSubmit={addRecommendation} className={`${card} p-4 space-y-3`}>
                  <div className="text-sm font-semibold">Empfehlung speichern</div>
                  <input className={input} placeholder="Produktname" value={recForm.name} onChange={(e) => setRecForm({ ...recForm, name: e.target.value })} />
                  <div className="grid grid-cols-2 gap-3">
                    <input className={input} placeholder="Kategorie" value={recForm.category} onChange={(e) => setRecForm({ ...recForm, category: e.target.value })} />
                    <select className={input} value={recForm.when} onChange={(e) => setRecForm({ ...recForm, when: e.target.value as Recommendation["when"] })}>
                      <option>AM</option>
                      <option>PM</option>
                      <option>AM/PM</option>
                      <option>Weekly</option>
                    </select>
                  </div>
                  <input className={input} placeholder="Häufigkeit" value={recForm.frequency} onChange={(e) => setRecForm({ ...recForm, frequency: e.target.value })} />
                  <textarea className={input} rows={3} placeholder="Warum / wie verwenden?" value={recForm.notes} onChange={(e) => setRecForm({ ...recForm, notes: e.target.value })} />
                  <button className={`${button} bg-neutral-900 text-white`}>Empfehlung hinzufügen</button>
                </form>
              </div>
            </section>

            <section className="space-y-6">
              <SectionTitle eyebrow="Smart engine" title="Hautprofil und Vorschläge" subtitle="Regelbasierte Empfehlungen je nach Trockenheit, Oiliness und Sensitivität." />
              <div className={`${card} p-5`}>
                <Slider label={`Trockenheit: ${profile.dryness}/10`} value={profile.dryness} onChange={(value) => setProfile({ ...profile, dryness: value })} />
                <Slider label={`Ölige T-Zone: ${profile.oiliness}/10`} value={profile.oiliness} onChange={(value) => setProfile({ ...profile, oiliness: value })} />
                <Slider label={`Sensitivität: ${profile.sensitivity}/10`} value={profile.sensitivity} onChange={(value) => setProfile({ ...profile, sensitivity: value })} />
                <div className="mt-4">
                  <label className="mb-2 block text-sm font-medium">Fokus</label>
                  <select className={input} value={profile.focus} onChange={(e) => setProfile({ ...profile, focus: e.target.value })}>
                    <option>Glow + Barrier</option>
                    <option>Mehr Glow</option>
                    <option>Mehr Hydration</option>
                    <option>Mehr Repair</option>
                    <option>Leichtere Routine</option>
                  </select>
                </div>
              </div>
              <div className="grid gap-3">
                {smartRecommendations.map((item) => (
                  <div key={item.title} className={`${card} p-4`}>
                    <div className="font-semibold">{item.title}</div>
                    <div className="mt-2 text-sm text-neutral-600">{item.text}</div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        <section className="mt-8 space-y-6">
          <SectionTitle eyebrow="Routine" title="Deine Steps" subtitle="AM, PM und Weekly auf einen Blick." />
          <div className="grid gap-4 xl:grid-cols-3">
            <RoutineColumn slot="AM" items={routine.filter((item) => item.slot === "AM")} onToggle={toggleComplete} onRemove={removeRoutineItem} />
            <RoutineColumn slot="PM" items={routine.filter((item) => item.slot === "PM")} onToggle={toggleComplete} onRemove={removeRoutineItem} />
            <RoutineColumn slot="Weekly" items={routine.filter((item) => item.slot === "Weekly")} onToggle={toggleComplete} onRemove={removeRoutineItem} />
          </div>
        </section>

        <section className="mt-8 space-y-6">
          <SectionTitle eyebrow="Recommendations" title="Erweiterbare Empfehlungsliste" subtitle="Suche, filtere und füge Vorschläge direkt der Routine hinzu." />
          <div className={`${card} p-5`}>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-1 gap-3">
                <input className={input} placeholder="Suche nach Produkt, Kategorie oder Notiz" value={search} onChange={(e) => setSearch(e.target.value)} />
                <select className={`${input} max-w-[180px]`} value={filter} onChange={(e) => setFilter(e.target.value)}>
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
              <div className="text-sm text-neutral-500">{visibleRecommendations.length} Empfehlungen</div>
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">
              {visibleRecommendations.map((item) => (
                <div key={item.id} className="rounded-2xl border border-neutral-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-base font-semibold">{item.name}</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className={badge}>{item.category}</span>
                        <span className={badge}>{item.when}</span>
                        <span className={badge}>{item.frequency}</span>
                      </div>
                    </div>
                    <button onClick={() => removeRecommendation(item.id)} className="text-sm text-neutral-400 hover:text-neutral-700">✕</button>
                  </div>
                  <p className="mt-3 text-sm text-neutral-600">{item.notes}</p>
                  <button onClick={() => addRecommendationToRoutine(item)} className={`${button} mt-4 bg-neutral-900 text-white`}>Zur Routine</button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 space-y-6">
          <SectionTitle eyebrow="Schedule" title="Weekly Treatment Plan" subtitle="Masken, Peeling und Recovery-Tage flexibel bearbeiten." />
          <div className={`${card} p-4`}>
            <div className="space-y-3">
              {schedule.map((item, index) => (
                <div key={item.day} className="grid grid-cols-[110px_1fr] items-center gap-3 rounded-2xl border border-neutral-200 p-3">
                  <div className="text-sm font-medium">{item.day}</div>
                  <input className={input} value={item.treatment} onChange={(e) => setSchedule((prev) => prev.map((row, rowIndex) => rowIndex === index ? { ...row, treatment: e.target.value } : row))} />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="text-xs text-neutral-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}

function Slider({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <div className="mb-4 last:mb-0">
      <label className="mb-2 block text-sm font-medium">{label}</label>
      <input type="range" min="1" max="10" value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full" />
    </div>
  );
}

function SectionTitle({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">{eyebrow}</div>
      <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">{title}</h2>
      {subtitle ? <p className="text-sm text-neutral-600">{subtitle}</p> : null}
    </div>
  );
}

function RoutineColumn({
  slot,
  items,
  onToggle,
  onRemove,
}: {
  slot: string;
  items: RoutineItem[];
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const badge = "rounded-full border border-neutral-200 px-2.5 py-1 text-xs text-neutral-600";

  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-900">{slot}</h3>
        <span className={badge}>{items.length} Steps</span>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-2xl border border-neutral-200 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <button onClick={() => onToggle(item.id)} className={`h-5 w-5 rounded-full border ${item.completed ? "border-neutral-900 bg-neutral-900" : "border-neutral-400 bg-white"}`} aria-label="Toggle complete" />
                  <div className={`font-medium ${item.completed ? "text-neutral-400 line-through" : "text-neutral-900"}`}>{item.title}</div>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-neutral-500">
                  <span className={badge}>{item.category}</span>
                  <span className={badge}>{item.frequency}</span>
                </div>
                <p className="text-sm text-neutral-600">{item.notes}</p>
              </div>
              <button onClick={() => onRemove(item.id)} className="text-sm text-neutral-400 hover:text-neutral-700">✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
