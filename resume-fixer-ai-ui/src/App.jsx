import React, { useState } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE || 'https://resumefixeraiapi.azurewebsites.net'

export default function App(){
  const [text, setText] = useState('')
  const [jobRole, setJobRole] = useState('Software Engineer')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  async function handleSubmit(e){
    e?.preventDefault()
    setError(null)
    if(!text.trim()){ setError('Please paste resume text or upload file'); return }
    setLoading(true)
    try{
      const res = await fetch(`${API_BASE}/api/rewrite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, jobRole })
      })
      if(!res.ok){ const b = await res.text(); throw new Error(b || res.status) }
      const data = await res.json()
      setResult(data)
    }catch(err){
      setError(err.message || 'Error')
    }finally{ setLoading(false) }
  }

  function handleFile(e){
    const f = e.target.files?.[0]
    if(!f) return
    const reader = new FileReader()
    reader.onload = ()=> setText(reader.result.toString())
    reader.readAsText(f)
  }

  return (
    <div className="container">
      <div className="header">
        <div className="logo">RF</div>
        <div>
          <h2 style={{margin:0}}>ResumeFixerAI</h2>
          <div className="small">Rewrite resumes to ATS-friendly, achievement-oriented text</div>
        </div>
      </div>

      <div className="card">
        <div className="grid">
          <div>
            <form onSubmit={handleSubmit}>
              <div style={{marginBottom:10}} className="small">Paste resume text or upload a plain .txt/.md file</div>
              <div className="upload">
                <input type="file" accept=".txt,.md,.json,.csv" onChange={handleFile} />
                <div className="small" style={{marginTop:8}}>File content will be read in the browser; no upload to server.</div>
              </div>
              <div style={{marginTop:12}}>
                <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Paste resume text here..." />
              </div>
              <div style={{marginTop:8, display:'flex', gap:8}}>
                <input value={jobRole} onChange={e=>setJobRole(e.target.value)} style={{flex:1,padding:8,borderRadius:8,border:'1px solid rgba(255,255,255,0.04)',background:'transparent',color:'inherit'}} />
                <button className="button" disabled={loading}>{loading? 'Working...':'Rewrite'}</button>
              </div>
            </form>
            {error && <div style={{color:'#ffb4b4',marginTop:10}}>{error}</div>}
          </div>

          <div>
            <div className="small">Result</div>
            <div className="result">
              {result? <div><h4>Markdown</h4><pre style={{whiteSpace:'pre-wrap'}}>{result.improved}</pre><h4>HTML Preview</h4><div dangerouslySetInnerHTML={{__html: result.html}} /></div> : <div className="small">No result yet</div>}
            </div>
            <div className="footer">
              <div className="small">Powered by OpenAI</div>
              <div className="small">Made by Vijit</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
