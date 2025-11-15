import { useEffect, useMemo, useState } from 'react'
import { Search, Play, Flame, Home } from 'lucide-react'

const API_BASE = import.meta.env.VITE_BACKEND_URL || ''

function formatViews(n){
  if(!n && n!==0) return ''
  if(n<1000) return String(n)
  const units = ['K','M','B']
  let u = -1
  while(n>=1000 && ++u<units.length){n/=1000}
  return `${n.toFixed(1)}${units[u]}`
}

function VideoCard({v, onClick}){
  return (
    <button onClick={onClick} className="group text-left">
      <div className="aspect-video w-full overflow-hidden rounded-xl bg-gray-100">
        {v.thumbnail && (
          <img src={v.thumbnail} alt={v.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"/>
        )}
      </div>
      <div className="mt-3 flex gap-3">
        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white text-xs font-bold">{(v.author||'?').slice(0,1)}</div>
        <div className="min-w-0">
          <div className="font-semibold text-gray-900 line-clamp-2">{v.title}</div>
          <div className="text-sm text-gray-500">{v.author} • {formatViews(v.views)} views</div>
        </div>
      </div>
    </button>
  )
}

function Player({video, onBack}){
  const src = useMemo(()=> video ? `https://piped.video/embed/${video.id}` : null,[video])
  if(!video) return null
  return (
    <div className="w-full">
      <div className="relative">
        <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
          <iframe
            src={src}
            title={video.title}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>
      <div className="mt-4">
        <div className="text-xl font-bold text-gray-900">{video.title}</div>
        <div className="text-sm text-gray-500 mt-1">{video.author} • {formatViews(video.views)} views</div>
        <button onClick={onBack} className="mt-3 inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
          <Home size={16}/> Kembali ke beranda
        </button>
      </div>
    </div>
  )
}

export default function App(){
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [videos, setVideos] = useState([])
  const [selected, setSelected] = useState(null)

  const fetchTrending = async()=>{
    setLoading(true)
    try{
      const r = await fetch(`${API_BASE}/api/trending`)
      const j = await r.json()
      setVideos(j.items||[])
    }catch(e){
      console.error(e)
    }finally{setLoading(false)}
  }

  const search = async (q)=>{
    if(!q) return fetchTrending()
    setLoading(true)
    try{
      const r = await fetch(`${API_BASE}/api/search?q=${encodeURIComponent(q)}`)
      const j = await r.json()
      setVideos(j.items||[])
    }catch(e){console.error(e)}
    finally{setLoading(false)}
  }

  useEffect(()=>{fetchTrending()},[])

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-3">
          <div className="flex items-center gap-2 text-red-600 font-black text-xl">
            <Flame/> YouTube Clone
          </div>
          <div className="flex-1"/>
          <form onSubmit={e=>{e.preventDefault(); search(query)}} className="relative w-full max-w-2xl">
            <input
              value={query}
              onChange={e=>setQuery(e.target.value)}
              placeholder="Cari video"
              className="w-full rounded-full border border-gray-300 bg-gray-50 px-4 py-2 pr-10 outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
              <Search size={18}/>
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        {selected ? (
          <Player video={selected} onBack={()=>setSelected(null)}/>
        ) : (
          <>
            {loading && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {Array.from({length:8}).map((_,i)=>(
                  <div key={i} className="animate-pulse">
                    <div className="aspect-video w-full rounded-xl bg-gray-200"/>
                    <div className="mt-3 flex gap-3">
                      <div className="h-9 w-9 rounded-full bg-gray-200"/>
                      <div className="space-y-2 w-full">
                        <div className="h-3 w-4/5 bg-gray-200 rounded"/>
                        <div className="h-3 w-3/5 bg-gray-200 rounded"/>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {videos.map(v=> (
                  <VideoCard key={v.id} v={v} onClick={()=>setSelected(v)} />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <footer className="py-8 text-center text-sm text-gray-500">
        Dibuat sebagai clone sederhana untuk menonton dan mencari video. Tidak ada premium, semua gratis.
      </footer>
    </div>
  )
}
