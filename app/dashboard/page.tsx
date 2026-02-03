"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Shield, CheckCircle, AlertTriangle, Search, Loader2, ExternalLink } from "lucide-react"
import { triggerN8n } from "./actions"

export default function DashboardPage() {
  const [contentType, setContentType] = useState<'url' | 'text'>('url')
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentId, setCurrentId] = useState<string | null>(null)
  const supabase = createClient()

  const parseVerdict = (verdict: any) => {
    if (!verdict) return null;
    if (typeof verdict === 'object' && !Array.isArray(verdict)) return verdict;
    try {
      let str = String(verdict).trim();
      const start = str.indexOf('{');
      const end = str.lastIndexOf('}');
      if (start !== -1 && end !== -1) {
        str = str.substring(start, end + 1);
        return JSON.parse(str);
      }
      return null;
    } catch (e) {
      console.error("Error parseando:", e);
      return null;
    }
  };

  // PLAN B: Si el Realtime falla, esto revisa la DB cada 3 segundos
  useEffect(() => {
    let interval: any;
    if (loading && currentId) {
      interval = setInterval(async () => {
        const { data } = await supabase
          .from('verifications')
          .select('*')
          .eq('id', currentId)
          .single();

        if (data?.status === 'completed') {
          setResult(parseVerdict(data.verdict));
          setLoading(false);
          setCurrentId(null);
          clearInterval(interval);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [loading, currentId]);

  // PLAN A: Realtime (Aviso instantáneo)
  useEffect(() => {
    if (!currentId) return;
    const channel = supabase
      .channel(`v_${currentId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'verifications',
        filter: `id=eq.${currentId}`
      }, (payload) => {
        if (payload.new.status === 'completed') {
          setResult(parseVerdict(payload.new.verdict));
          setLoading(false);
          setCurrentId(null);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [currentId]);

  const handleVerify = async () => {
    if (!url) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Inicia sesión");

      const insertData = contentType === 'url'
        ? { url, user_id: user.id, status: 'pending', content_type: 'url' }
        : { text_content: url, user_id: user.id, status: 'pending', content_type: 'text', url: null };

      const { data, error: insError } = await supabase
        .from('verifications')
        .insert([insertData])
        .select().single();

      if (insError) throw insError;
      setCurrentId(data.id);
      await triggerN8n(contentType, url, data.id);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl min-h-screen text-slate-900">
      <div className="flex items-center gap-2 mb-8">
        <Shield className="text-blue-600 w-8 h-8" />
        <h1 className="text-3xl font-black tracking-tighter italic">TRUTHGUARD</h1>
      </div>

      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setContentType('url')}
          className={`px-6 py-2 rounded-xl font-bold transition-all ${
            contentType === 'url'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Verificar URL
        </button>
        <button
          onClick={() => setContentType('text')}
          className={`px-6 py-2 rounded-xl font-bold transition-all ${
            contentType === 'text'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Verificar Texto
        </button>
      </div>

      <div className="flex gap-2 mb-12 bg-white p-2 rounded-2xl border shadow-xl">
        {contentType === 'url' ? (
          <input
            className="flex-1 px-4 py-3 outline-none text-lg bg-transparent"
            placeholder="Pega el link de la noticia..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        ) : (
          <textarea
            className="flex-1 px-4 py-3 outline-none text-lg bg-transparent resize-none"
            placeholder="Escribe la afirmación que quieres verificar..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            rows={6}
            maxLength={1000}
          />
        )}
        <button
          onClick={handleVerify}
          disabled={loading}
          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 disabled:bg-slate-300 flex items-center gap-2 self-end"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Search size={20} />}
          {loading ? "Analizando..." : "Verificar"}
        </button>
      </div>

      {loading && (
        <div className="text-center py-20 bg-blue-50/50 border-2 border-dashed border-blue-200 rounded-3xl">
          <Loader2 className="animate-spin mx-auto mb-4 h-12 w-12 text-blue-500" />
          <p className="text-xl font-bold text-blue-900">Consultando fuentes mundiales...</p>
        </div>
      )}

      {result && (
        <div className="space-y-6">
          <div className="bg-white p-10 rounded-3xl border shadow-2xl text-center">
            <div className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center ${result.color === 'verde' ? 'bg-green-500' :
              result.color === 'rojo' ? 'bg-red-500' : 'bg-yellow-500'
              }`}>
              <Shield size={48} color="white" />
            </div>
            <h2 className="text-4xl font-black mb-4">Veredicto: <span className={
              result.color === 'verde' ? 'text-green-600' :
                result.color === 'rojo' ? 'text-red-600' : 'text-yellow-600'
            }>{(result.color || "").toUpperCase()}</span></h2>
            <p className="text-slate-600 text-xl leading-relaxed italic">"{result.resumen}"</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 p-6 rounded-2xl border">
              <h3 className="font-bold text-slate-400 uppercase text-xs mb-4">Claims</h3>
              <ul className="space-y-3">
                {result.claims?.map((c: any, i: number) => (
                  <li key={i} className="text-sm bg-white p-4 rounded-xl border shadow-sm">
                    {typeof c === 'string' ? c : c.texto}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl border">
              <h3 className="font-bold text-slate-400 uppercase text-xs mb-4">Evidencias</h3>
              <div className="space-y-3">
                {result.evidencia?.map((e: any, i: number) => (
                  <a key={i} href={e.url} target="_blank" className="block bg-white p-4 rounded-xl border hover:border-blue-500 transition-all">
                    <span className="font-black text-blue-600 text-sm">{e.fuente}</span>
                    <p className="text-xs text-slate-500 line-clamp-2">{e.snippet}</p>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {error && <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl mt-6 text-center font-bold">⚠️ {error}</div>}
    </div>
  )
}