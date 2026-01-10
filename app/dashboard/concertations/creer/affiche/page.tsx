'use client'

import { useEffect, useState, useRef, ChangeEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Download, Upload, Loader2 } from 'lucide-react'
import AffichePreview from '@/components/affiche/preview/AffichePreview'
import AffichePDFDocument from '@/components/affiche/pdf/AffichePDFDocument'
import { pdf } from '@react-pdf/renderer'
import QRCode from 'qrcode'

interface Concertation {
  id: string
  titre: string
  description: string
  slug: string
  design_config: {
    canvas?: {
      background?: string
    }
  }
}

export default function AffichePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const concertationId = searchParams.get('id')
  const supabase = createClient()
  const afficheRef = useRef<HTMLDivElement>(null)

  const [concertation, setConcertation] = useState<Concertation | null>(null)
  const [template, setTemplate] = useState<'modern' | 'classic' | 'minimal'>('modern')
  const [couleurPrimaire, setCouleurPrimaire] = useState('#7C3AED')
  const [couleurSecondaire, setCouleurSecondaire] = useState('#FFFFFF')
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (concertationId) {
      loadConcertation()
    }
  }, [concertationId])

  async function loadConcertation() {
    try {
      const response = await fetch(`/api/concertations/${concertationId}`)
      if (response.ok) {
        const data = await response.json()
        setConcertation(data)
        await generateQRCode(data.slug)
      }
      setLoading(false)
    } catch (error) {
      console.error('Erreur:', error)
      setLoading(false)
    }
  }

  async function generateQRCode(slug: string) {
    try {
      const url = `https://purpl.fr/c/${slug}`
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'H'
      })
      setQrCodeDataUrl(qrDataUrl)
    } catch (error) {
      console.error('Erreur QR Code:', error)
    }
  }

  async function handleLogoUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      alert('Le fichier est trop volumineux (max 2MB)')
      return
    }

    setUploading(true)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${concertationId}-${Date.now()}.${fileExt}`
      const filePath = `affiches/logos/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('concertations')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('concertations')
        .getPublicUrl(filePath)

      setLogoUrl(publicUrl)
    } catch (error) {
      console.error('Erreur upload:', error)
      alert('Erreur lors de l\'upload du logo')
    } finally {
      setUploading(false)
    }
  }

  function handleDeleteLogo() {
    setLogoUrl(null)
  }

  async function handleDownloadPDF() {
    if (!concertation) return

    setGenerating(true)

    try {
      const blob = await pdf(
        <AffichePDFDocument
          concertation={concertation}
          template={template}
          couleurPrimaire={couleurPrimaire}
          couleurSecondaire={couleurSecondaire}
          logoUrl={logoUrl}
          qrCodeDataUrl={qrCodeDataUrl}
        />
      ).toBlob()

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `affiche-${concertation.slug}.pdf`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erreur PDF:', error)
      alert('Erreur lors de la génération du PDF')
    } finally {
      setGenerating(false)
    }
  }

  // NOTE: Export PNG temporairement désactivé
  // Solutions identifiées pour implémentation future :
  // - modern-screenshot (recommandé)
  // - html-to-image
  // Voir documentation archivée pour détails

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    )
  }

  if (!concertation) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-500">Concertation introuvable</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 py-3 sm:py-0 sm:h-16">
            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <button
                onClick={() => router.push(`/dashboard/concertations/creer/remerciement?id=${concertationId}`)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm sm:text-base"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Retour</span>
              </button>
              <div className="hidden sm:block h-6 w-px bg-gray-300" />
              <h1 className="text-base sm:text-xl font-semibold text-gray-900 truncate">
                Affiche : {concertation.titre}
              </h1>
            </div>
            <button
              onClick={() => router.push(`/dashboard/concertations/creer/export?id=${concertationId}`)}  
              className="w-full sm:w-auto px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium text-sm sm:text-base"
            >
              Publier
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-8">
          <div className="flex-1 space-y-4 sm:space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Template</h2>        
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <button
                  onClick={() => setTemplate('modern')}
                  className={`p-3 sm:p-4 rounded-lg border-2 transition-all ${
                    template === 'modern'
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <p className="font-medium text-gray-900 text-xs sm:text-sm">Modern</p>
                    <p className="text-xs text-gray-500 mt-1 hidden sm:block">Image + encart</p>
                  </div>
                </button>
                <button
                  onClick={() => setTemplate('classic')}
                  className={`p-3 sm:p-4 rounded-lg border-2 transition-all ${
                    template === 'classic'
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <p className="font-medium text-gray-900 text-xs sm:text-sm">Classic</p>
                    <p className="text-xs text-gray-500 mt-1 hidden sm:block">Traditionnel</p>
                  </div>
                </button>
                <button
                  onClick={() => setTemplate('minimal')}
                  className={`p-3 sm:p-4 rounded-lg border-2 transition-all ${
                    template === 'minimal'
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <p className="font-medium text-gray-900 text-xs sm:text-sm">Minimal</p>
                    <p className="text-xs text-gray-500 mt-1 hidden sm:block">Épuré</p>
                  </div>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Couleurs</h2>        
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Couleur principale
                  </label>
                  <input
                    type="color"
                    value={couleurPrimaire}
                    onChange={(e) => setCouleurPrimaire(e.target.value)}
                    className="w-full h-10 sm:h-12 rounded-lg border border-gray-300 cursor-pointer"     
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Couleur secondaire
                  </label>
                  <input
                    type="color"
                    value={couleurSecondaire}
                    onChange={(e) => setCouleurSecondaire(e.target.value)}
                    className="w-full h-10 sm:h-12 rounded-lg border border-gray-300 cursor-pointer"     
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Logo (optionnel)</h2>
              {!logoUrl ? (
                <label className="flex flex-col items-center justify-center h-28 sm:h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-400 transition-colors">
                  <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 mb-2" />
                  <span className="text-xs sm:text-sm text-gray-600">Cliquez pour uploader</span>        
                  <span className="text-xs text-gray-400 mt-1">PNG ou JPG, max 2MB</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handleLogoUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="space-y-3">
                  <img src={logoUrl} alt="Logo" className="max-h-20 sm:max-h-24 mx-auto" />
                  <button
                    onClick={handleDeleteLogo}
                    className="w-full py-2 text-xs sm:text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Supprimer le logo
                  </button>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Téléchargements</h2> 
              <div className="space-y-3">
                <button
                  onClick={handleDownloadPDF}
                  disabled={generating}
                  className="w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm sm:text-base"
                >
                  {generating ? (
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                  Télécharger PDF A4
                </button>
                <button
                  disabled
                  className="w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 px-4 border border-gray-300 text-gray-400 rounded-lg cursor-not-allowed font-medium text-sm sm:text-base"
                  title="Export PNG disponible prochainement"
                >
                  <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                  PNG Instagram (1080×1080)
                </button>
                <button
                  disabled
                  className="w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 px-4 border border-gray-300 text-gray-400 rounded-lg cursor-not-allowed font-medium text-sm sm:text-base"
                  title="Export PNG disponible prochainement"
                >
                  <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                  PNG Twitter (1200×628)
                </button>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-[600px] order-first lg:order-last">
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 lg:sticky lg:top-24">  
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Aperçu</h2>
              <div className="flex justify-center overflow-x-auto">
                <div
                  style={{
                    transform: 'scale(0.5)',
                    transformOrigin: 'top center'
                  }}
                  className="sm:scale-[0.67]"
                >
                  <AffichePreview
                    ref={afficheRef}
                    concertation={concertation}
                    template={template}
                    couleurPrimaire={couleurPrimaire}
                    couleurSecondaire={couleurSecondaire}
                    logoUrl={logoUrl}
                    qrCodeDataUrl={qrCodeDataUrl}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}