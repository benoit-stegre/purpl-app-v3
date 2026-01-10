'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Remerciement {
  id: string
  concertation_id: string
  message: string
  image_url: string | null
  collecte_email_active: boolean
  design_config: any
  created_at: string
}

interface Concertation {
  id: string
  titre: string
}

export default function RemerciementPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const concertationId = searchParams.get('id')
  const supabase = createClient()

  const [concertation, setConcertation] = useState<Concertation | null>(null)
  const [remerciement, setRemerciement] = useState<Remerciement | null>(null)
  const [message, setMessage] = useState("Merci d'avoir participé à cette concertation !")
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [collecteEmail, setCollecteEmail] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle')
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!concertationId) {
      router.push('/dashboard/concertations')
      return
    }
    loadData()
  }, [concertationId])

  const loadData = async () => {
    if (!concertationId) return

    try {
      setError(null)
      
      // Charger via API
      const concertResponse = await fetch(`/api/concertations/${concertationId}`)
      
      if (!concertResponse.ok) {
        setError(`Erreur ${concertResponse.status}: Concertation non trouvée`)
        setLoading(false)
        return
      }

      const concertData = await concertResponse.json()
      setConcertation({ id: concertData.id, titre: concertData.titre })

      const response = await fetch(`/api/remerciements?concertation_id=${concertationId}`)
      if (response.ok) {
        const result = await response.json()
        
        if (result.data) {
          setRemerciement(result.data)
          setMessage(result.data.message)
          setImageUrl(result.data.image_url)
          setCollecteEmail(result.data.collecte_email_active)
        } else {
          const createResponse = await fetch('/api/remerciements', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              concertation_id: concertationId,
              message: "Merci d'avoir participé à cette concertation !",
              collecte_email_active: false
            })
          })
          
          if (createResponse.ok) {
            const createResult = await createResponse.json()
            setRemerciement(createResult.data)
            setMessage(createResult.data.message)
            setImageUrl(createResult.data.image_url)
            setCollecteEmail(createResult.data.collecte_email_active)
          } else {
            setError('Impossible de créer le remerciement')
          }
        }
      }
    } catch (err: any) {
      console.error('Erreur chargement:', err)
      setError(err.message || 'Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const saveRemerciement = async (updates: Partial<Remerciement>) => {
    if (!remerciement) return

    setSaveStatus('saving')
    try {
      const response = await fetch(`/api/remerciements/${remerciement.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      if (response.ok) {
        const result = await response.json()
        if (result.data) {
          setRemerciement(result.data)
          setSaveStatus('saved')
          setTimeout(() => setSaveStatus('idle'), 2000)
        }
      }
    } catch (error) {
      console.error('Erreur sauvegarde:', error)
      setSaveStatus('idle')
    }
  }

  const handleMessageChange = (value: string) => {
    setMessage(value)
    if (debounceTimer) clearTimeout(debounceTimer)
    const timer = setTimeout(() => {
      saveRemerciement({ message: value })
    }, 500)
    setDebounceTimer(timer)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image')
      return
    }
    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `remerciements/${fileName}`
      const { error: uploadError } = await supabase.storage.from('images').upload(filePath, file)
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(filePath)
      setImageUrl(publicUrl)
      await saveRemerciement({ image_url: publicUrl })
    } catch (error) {
      console.error('Erreur upload:', error)
      alert("Erreur lors de l'upload")
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteImage = async () => {
    if (!imageUrl) return
    try {
      const path = imageUrl.split('/images/')[1]
      if (path) await supabase.storage.from('images').remove([path])
      setImageUrl(null)
      await saveRemerciement({ image_url: null })
    } catch (error) {
      console.error('Erreur suppression:', error)
    }
  }

  const handleCollecteEmailToggle = async () => {
    const newValue = !collecteEmail
    setCollecteEmail(newValue)
    await saveRemerciement({ collecte_email_active: newValue })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-black text-lg">Chargement...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-xl font-bold text-red-600 mb-4">Erreur</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button 
            onClick={() => router.push('/dashboard/concertations')}
            className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            Retour à la liste
          </button>
        </div>
      </div>
    )
  }

  if (!concertation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600 text-lg">Concertation introuvable</div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
      <div className="bg-white border-b px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">    
          <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <button onClick={() => router.push(`/dashboard/concertations/creer/questionnaire?id=${concertationId}`)} className="text-black hover:text-purple-600 text-sm sm:text-base">← Retour</button>
            <h1 className="text-base sm:text-xl font-bold text-black truncate">Remerciement : {concertation.titre}</h1>
            {saveStatus === 'saving' && <span className="text-xs sm:text-sm text-gray-500">Sauvegarde...</span>}
            {saveStatus === 'saved' && <span className="text-xs sm:text-sm text-green-600">✓ Sauvegardé</span>}
          </div>
          <button onClick={() => router.push(`/dashboard/concertations/creer/affiche?id=${concertationId}`)} className="w-full sm:w-auto bg-purple-600 text-white px-4 sm:px-6 py-2.5 sm:py-2 rounded hover:bg-purple-700 text-sm sm:text-base">Étape suivante</button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0 bg-gray-50">
        <div className="flex-1 bg-white p-4 sm:p-6 overflow-y-auto">
          <div className="max-w-2xl space-y-4 sm:space-y-6">
            <div>
              <label className="block text-sm font-medium text-black mb-2">Message de remerciement</label>
              <textarea value={message} onChange={(e) => handleMessageChange(e.target.value)} placeholder="Ex: Merci pour votre participation !" className="w-full border border-gray-300 rounded px-3 sm:px-4 py-2 sm:py-3 text-black resize-none text-sm sm:text-base bg-white" rows={6} />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-2">Image (optionnelle)</label>   
              {!imageUrl ? (
                <div className="border-2 border-dashed border-gray-300 rounded p-4 sm:p-6 text-center bg-white">
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="image-upload" disabled={uploading} />
                  <label htmlFor="image-upload" className="cursor-pointer inline-block bg-white border border-gray-300 px-3 sm:px-4 py-2 rounded hover:bg-gray-50 text-black text-sm sm:text-base">{uploading ? 'Upload...' : '📷 Ajouter une image'}</label>
                </div>
              ) : (
                <div className="relative border border-gray-300 rounded p-4 bg-white">
                  <img src={imageUrl} alt="Preview" className="max-h-48 mx-auto rounded" />
                  <button onClick={handleDeleteImage} className="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 rounded-full hover:bg-red-600">✕</button>
                </div>
              )}
            </div>
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={collecteEmail} onChange={handleCollecteEmailToggle} className="w-4 sm:w-5 h-4 sm:h-5" />
                <span className="text-black font-medium text-sm sm:text-base">Collecter les emails</span>
              </label>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex w-96 bg-gray-50 p-4 items-center justify-center flex-shrink-0 overflow-hidden">
          <div style={{ width: 375, height: 812, maxHeight: '100%', overflow: 'auto', backgroundColor: 'white', borderRadius: 8, padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ textAlign: 'center' }}><h2 style={{ fontSize: 24, fontWeight: 'bold', color: 'black', marginBottom: 8 }}>{message}</h2></div>
            {imageUrl && <div style={{ textAlign: 'center' }}><img src={imageUrl} alt="Remerciement" style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 8, objectFit: 'contain' }} /></div>}
            {collecteEmail && <div><label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: 'black', marginBottom: 8 }}>Votre email (optionnel)</label><input type="email" placeholder="exemple@email.com" disabled style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 6, padding: '12px', fontSize: 14, color: 'black', backgroundColor: '#f9fafb' }} /></div>}
            <div style={{ marginTop: 'auto' }}><button disabled style={{ width: '100%', backgroundColor: '#d1d5db', color: 'white', padding: '14px', borderRadius: 6, fontSize: 16, fontWeight: 600, border: 'none', cursor: 'not-allowed' }}>Terminer</button></div>
          </div>
        </div>
      </div>
    </div>
  )
}