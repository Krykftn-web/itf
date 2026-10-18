"use client";

import { useCallback, useEffect, useState } from "react";

import { api } from "@/lib/kf.ts";
import type { Job, State, Target } from "@/lib/model.ts";

const visible = (): boolean => (typeof document === "undefined" ? true : document.visibilityState === "visible");

export default function Home() {
  const [state, setState] = useState<State | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [tc, setTc] = useState("");
  const [phone, setPhone] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [label, setLabel] = useState("Babam");

  // Target states
  const [targetDay, setTargetDay] = useState("Perşembe");
  const [room, setRoom] = useState("Dahiliye 21");
  const [timeSlot, setTimeSlot] = useState("7-8-9");

  const reload = useCallback(async () => {
    try {
      const data = await api.me();
      setState(data);
      if (data.account) {
        setTc((prev) => prev || data.account?.tc || "");
        setPhone((prev) => prev || data.account?.phone || "");
        setFatherName((prev) => prev || data.account?.fatherName || "");
        setBirthDate((prev) => prev || data.account?.birthDate || "");
        setLabel((prev) => prev || data.account?.label || "Babam");
      }
      if (data.targets && data.targets.length > 0) {
        const first = data.targets[0];
        if (first) {
          setTargetDay((prev) => prev || first.targetDay || "Perşembe");
          if (first.polyclinics && first.polyclinics[0]) setRoom((prev) => prev || first.polyclinics[0] || "Dahiliye 21");
        }
      }
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  useEffect(() => {
    const first = setTimeout(() => {
      void reload();
    }, 0);
    const timer = setInterval(() => {
      if (visible()) void reload();
    }, 4000);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, [reload]);

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.saveAccount({ tc, phone, fatherName, birthDate, label });
      await reload();
      alert("Kimlik bilgileri başarıyla kaydedildi!");
    } catch (err: unknown) {
      alert("Hata: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTarget = async () => {
    try {
      setLoading(true);
      await api.addTarget({
        campus: "Çapa",
        branch: "İç Hastalıkları",
        polyclinics: [room],
        targetDay,
        slots: [timeSlot],
      });
      await reload();
      alert("Randevu hedefi oluşturuldu!");
    } catch (err: unknown) {
      alert("Hata: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  const handleRun = async (targetId: string, dryRun: boolean) => {
    try {
      await api.runTarget(targetId, dryRun);
      await reload();
      alert(dryRun ? "Test başlatıldı! Sayfayı takip edin." : "Randevu alma botu başlatıldı!");
    } catch (err: unknown) {
      alert("Hata: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleCancel = async (jobId: string) => {
    try {
      await api.cancelJob(jobId);
      await reload();
    } catch (err: unknown) {
      alert("Hata: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      {/* Üst Başlık */}
      <header className="mb-6 flex items-center justify-between border-b border-line pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-hospital-soft text-2xl text-hospital">
            🏥
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">İTF Randevu Botu</h1>
            <p className="text-xs text-muted">Çapa Tıp Fakültesi · 20:00 Otomatik Takip</p>
          </div>
        </div>
        <div className="text-right">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-good-soft px-2.5 py-1 text-xs font-semibold text-good">
            <span className="h-2 w-2 rounded-full bg-good animate-pulse"></span>
            Server Hazır
          </span>
        </div>
      </header>

      {error && (
        <div className="mb-6 rounded-2xl border border-hospital/30 bg-hospital-soft p-4 text-sm text-hospital">
          {error}
        </div>
      )}

      {/* 20:00 Açılış Hatırlatıcısı */}
      <div className="mb-6 rounded-2xl border border-line bg-paper-2 p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⏰</span>
          <div>
            <h3 className="text-sm font-semibold">20:00 Randevu Açılış Kuralı</h3>
            <p className="mt-0.5 text-xs text-muted leading-relaxed">
              İTF randevuları her akşam <strong>20:00</strong>&apos;da açılır. Kurduğunuz hedef için sunucumuz{" "}
              <strong>19:59:45</strong>&apos;te hazır bekleyip randevuyu saniyesinde kapar.
            </p>
          </div>
        </div>
      </div>

      {/* Hasta Kimlik Bilgileri */}
      <section className="mb-6 rounded-2xl border border-line bg-paper p-5 shadow-sm">
        <h2 className="mb-4 text-base font-bold flex items-center gap-2">
          <span>👤</span> Hasta Kimlik Bilgileri
        </h2>
        <form onSubmit={handleSaveAccount} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Kişi / Etiket</label>
            <input
              type="text"
              className="w-full rounded-xl border border-line bg-paper-2 px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Örn: Babam"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">T.C. Kimlik Numarası</label>
            <input
              type="text"
              maxLength={11}
              className="w-full rounded-xl border border-line bg-paper-2 px-3.5 py-2.5 text-sm font-mono font-medium focus:outline-none focus:ring-2 focus:ring-accent"
              value={tc}
              onChange={(e) => setTc(e.target.value)}
              placeholder="11 haneli T.C. No"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Cep Telefonu</label>
              <input
                type="text"
                className="w-full rounded-xl border border-line bg-paper-2 px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0532..."
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Baba Adı</label>
              <input
                type="text"
                className="w-full rounded-xl border border-line bg-paper-2 px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent"
                value={fatherName}
                onChange={(e) => setFatherName(e.target.value)}
                placeholder="Baba adı"
                required
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Doğum Tarihi (GG.AA.YYYY)</label>
            <input
              type="text"
              className="w-full rounded-xl border border-line bg-paper-2 px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              placeholder="01.01.1960"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-accent py-2.5 text-sm font-semibold text-accent-ink transition active:scale-[0.98]"
          >
            Bilgileri Güvenle Kaydet
          </button>
        </form>
      </section>

      {/* Randevu Hedefi Ayarı */}
      <section className="mb-6 rounded-2xl border border-line bg-paper p-5 shadow-sm">
        <h2 className="mb-4 text-base font-bold flex items-center gap-2">
          <span>🎯</span> Randevu Hedefi Belirleme
        </h2>

        <div className="space-y-3">
          <div className="rounded-xl bg-paper-2 p-3 text-xs text-muted">
            <p><strong>Yerleşke:</strong> İstanbul Tıp Fakültesi (Çapa)</p>
            <p className="mt-1"><strong>Ana Branş:</strong> İç Hastalıkları (Dahiliye)</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Hedef Poliklinik / Oda</label>
              <select
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full rounded-xl border border-line bg-paper-2 px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="Dahiliye 21">Dahiliye 21 (Öncelikli)</option>
                <option value="Dahiliye">Herhangi bir Dahiliye Odası</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Hedef Gün</label>
              <select
                value={targetDay}
                onChange={(e) => setTargetDay(e.target.value)}
                className="w-full rounded-xl border border-line bg-paper-2 px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="Perşembe">Perşembe</option>
                <option value="Pazartesi">Pazartesi</option>
                <option value="Salı">Salı</option>
                <option value="Çarşamba">Çarşamba</option>
                <option value="Cuma">Cuma</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Saat Aralığı</label>
            <select
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              className="w-full rounded-xl border border-line bg-paper-2 px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="7-8-9">Sabah Saatleri (7, 8, 9 civarı)</option>
              <option value="10-11-12">Öğleden Önce (10, 11, 12)</option>
              <option value="13-14-15">Öğleden Sonra (13, 14, 15)</option>
              <option value="all">Farketmez (İlk açık saat)</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleSaveTarget}
            disabled={loading}
            className="w-full rounded-xl border border-line bg-paper-2 py-2.5 text-sm font-semibold transition hover:bg-line active:scale-[0.98]"
          >
            🎯 Hedefi Kaydet / Güncelle
          </button>
        </div>

        {/* Aktif Hedefler & Butonlar */}
        {state?.targets && state.targets.length > 0 && (
          <div className="mt-5 space-y-3 border-t border-line pt-4">
            <h3 className="text-xs font-bold text-muted uppercase tracking-wider">Kayıtlı Hedefler</h3>
            {state.targets.map((t: Target) => (
              <div key={t.id} className="rounded-xl border border-line bg-paper-2 p-3.5 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">
                    {t.targetDay} · {t.polyclinics?.join(", ") || "Dahiliye 21"}
                  </span>
                  <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs text-accent font-medium">
                    {t.campus} · {t.branch}
                  </span>
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => handleRun(t.id, true)}
                    className="flex-1 rounded-lg bg-wait-soft py-1.5 text-xs font-bold text-wait transition hover:opacity-90"
                  >
                    🧪 Test Et (Dry Run)
                  </button>
                  <button
                    onClick={() => handleRun(t.id, false)}
                    className="flex-1 rounded-lg bg-hospital py-1.5 text-xs font-bold text-white transition hover:opacity-90"
                  >
                    ⚡ Şimdi Randevu Al
                  </button>
                  <button
                    onClick={() => api.removeTarget(t.id).then(reload)}
                    className="rounded-lg border border-line px-2.5 py-1.5 text-xs text-muted hover:text-hospital"
                  >
                    Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Canlı İş ve Sonuç Takibi */}
      {state?.jobs && state.jobs.length > 0 && (
        <section className="rounded-2xl border border-line bg-paper p-5 shadow-sm">
          <h2 className="mb-4 text-base font-bold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span>📋</span> Randevu Geçmişi & Canlı Takip
            </span>
            <span className="text-xs font-normal text-muted">Otomatik güncellenir</span>
          </h2>

          <div className="space-y-4">
            {state.jobs.slice(0, 5).map((j: Job) => (
              <div key={j.id} className="rounded-xl border border-line bg-paper-2 p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-muted">
                    {new Date(j.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </span>
                  <div className="flex items-center gap-2">
                    {j.dryRun && (
                      <span className="rounded bg-wait-soft px-1.5 py-0.5 text-[10px] font-bold text-wait">
                        TEST
                      </span>
                    )}
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                        j.status === "done"
                          ? "bg-good-soft text-good"
                          : j.status === "running"
                          ? "bg-accent-soft text-accent animate-pulse"
                          : j.status === "failed"
                          ? "bg-hospital-soft text-hospital"
                          : "bg-line text-muted"
                      }`}
                    >
                      {j.status === "done"
                        ? "Tamamlandı"
                        : j.status === "running"
                        ? "Çalışıyor…"
                        : j.status === "failed"
                        ? "Başarısız"
                        : j.status}
                    </span>
                  </div>
                </div>

                {j.result && (
                  <p className="text-xs font-medium text-ink bg-paper p-2.5 rounded-lg border border-line">
                    {j.result}
                  </p>
                )}

                {/* Log Akışı */}
                {j.log && j.log.length > 0 && (
                  <div className="max-h-36 overflow-y-auto rounded-lg bg-black/80 p-2.5 font-mono text-[11px] text-slate-300 space-y-1">
                    {j.log.map((l, idx) => (
                      <div key={idx} className="leading-tight">
                        <span className="text-muted mr-1.5">
                          {new Date(l.at).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                        </span>
                        <span className={l.level === "good" ? "text-good" : l.level === "warn" ? "text-hospital" : ""}>
                          {l.message}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {j.status === "running" && (
                  <button
                    onClick={() => handleCancel(j.id)}
                    className="w-full rounded-lg border border-hospital/30 bg-hospital-soft py-1.5 text-xs font-bold text-hospital"
                  >
                    İşlemi Durdur
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
