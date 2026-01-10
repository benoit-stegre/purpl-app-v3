'use client'

/**
 * 🧪 PAGE TEST CROP - Workflow Figma (VERSION CORRIGÉE)
 * 
 * Fix : Import react-konva compatible avec Next.js 14
 */

import { useState, useRef, useEffect } from 'react'

export default function TestCropPage() {
  // État pour react-konva (chargé dynamiquement)
  const [Konva, setKonva] = useState<any>(null)
  
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null) // Image originale
  const [originalImageProps, setOriginalImageProps] = useState({ // Props originaux
    x: 50,
    y: 50,
    width: 0,
    height: 0,
    scaleX: 1,
    scaleY: 1,
  })
  
  // Props de l'image (position, taille, scale)
  const [imageProps, setImageProps] = useState({
    x: 50,
    y: 50,
    width: 0,
    height: 0,
    scaleX: 1,
    scaleY: 1,
  })
  
  // Mode crop
  const [isCropMode, setIsCropMode] = useState(false)
  const [cropRect, setCropRect] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  })
  
  // Image finale croppée
  const [croppedImage, setCroppedImage] = useState<string | null>(null)
  
  // Refs Konva
  const imageRef = useRef<any>(null)
  const transformerRef = useRef<any>(null)
  const cropRectRef = useRef<any>(null)
  const cropTransformerRef = useRef<any>(null)
  const stageRef = useRef<any>(null)

  // Charger react-konva côté client uniquement
  useEffect(() => {
    import('react-konva').then(module => {
      setKonva(module)
    })
  }, [])

  // Charger l'image quand l'URL change
  useEffect(() => {
    if (!imageUrl) return
    
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const maxSize = 400
      let scaledWidth = img.width
      let scaledHeight = img.height
      
      // Redimensionner pour tenir dans le canvas
      if (img.width > maxSize || img.height > maxSize) {
        const ratio = Math.min(maxSize / img.width, maxSize / img.height)
        scaledWidth = img.width * ratio
        scaledHeight = img.height * ratio
      }
      
      const props = {
        x: (800 - scaledWidth) / 2,
        y: (600 - scaledHeight) / 2,
        width: scaledWidth,
        height: scaledHeight,
        scaleX: 1,
        scaleY: 1,
      }
      
      // Sauvegarder l'image originale ET les props originaux
      setOriginalImage(img)
      setOriginalImageProps(props)
      
      setImage(img)
      setImageProps(props)
    }
    img.src = imageUrl
  }, [imageUrl])

  // Attacher le transformer en mode normal
  useEffect(() => {
    if (!Konva || !image) return
    
    if (!isCropMode && transformerRef.current && imageRef.current) {
      transformerRef.current.nodes([imageRef.current])
      transformerRef.current.getLayer()?.batchDraw()
    }
  }, [isCropMode, Konva, image])

  // Attacher le transformer en mode crop
  useEffect(() => {
    if (!Konva) return
    
    if (isCropMode && cropTransformerRef.current && cropRectRef.current) {
      cropTransformerRef.current.nodes([cropRectRef.current])
      cropTransformerRef.current.getLayer()?.batchDraw()
    }
  }, [isCropMode, Konva])

  // Upload de fichier
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setImageUrl(event.target?.result as string)
        setCroppedImage(null)
        setIsCropMode(false)
      }
      reader.readAsDataURL(file)
    }
  }

  // Double-clic sur l'image → Mode crop
  const handleImageDoubleClick = () => {
    if (!isCropMode && imageRef.current) {
      const node = imageRef.current
      
      // Initialiser le rectangle de crop avec les dimensions actuelles
      setCropRect({
        x: node.x(),
        y: node.y(),
        width: node.width() * node.scaleX(),
        height: node.height() * node.scaleY(),
      })
      
      setIsCropMode(true)
    }
  }

  // Transform de l'image (resize)
  const handleImageTransform = () => {
    const node = imageRef.current
    if (!node) return

    setImageProps({
      x: node.x(),
      y: node.y(),
      width: node.width(),
      height: node.height(),
      scaleX: node.scaleX(),
      scaleY: node.scaleY(),
    })
  }

  // Transform du rectangle de crop
  const handleCropTransform = () => {
    const node = cropRectRef.current
    if (!node) return

    setCropRect({
      x: node.x(),
      y: node.y(),
      width: node.width() * node.scaleX(),
      height: node.height() * node.scaleY(),
    })

    // Reset scale
    node.scaleX(1)
    node.scaleY(1)
  }

  // Clic sur le stage (en dehors) → Valider le crop
  const handleStageClick = (e: any) => {
    if (!isCropMode) return

    const clickedOnEmpty = e.target === stageRef.current
    if (clickedOnEmpty) {
      applyCrop()
    }
  }

  // Appliquer le crop
  const applyCrop = () => {
    if (!imageRef.current || !image) return

    const node = imageRef.current
    const imageX = node.x()
    const imageY = node.y()
    const imageWidth = node.width() * node.scaleX()
    const imageHeight = node.height() * node.scaleY()

    // Calculer les coordonnées de crop relatives
    const cropX = Math.max(0, cropRect.x - imageX)
    const cropY = Math.max(0, cropRect.y - imageY)
    const cropWidth = Math.min(cropRect.width, imageWidth - cropX)
    const cropHeight = Math.min(cropRect.height, imageHeight - cropY)

    // Ratio image source vs affichage
    const scaleX = image.width / imageWidth
    const scaleY = image.height / imageHeight

    // Créer canvas pour crop
    const canvas = document.createElement('canvas')
    canvas.width = cropWidth
    canvas.height = cropHeight
    const ctx = canvas.getContext('2d')

    if (ctx) {
      ctx.drawImage(
        image,
        cropX * scaleX,
        cropY * scaleY,
        cropWidth * scaleX,
        cropHeight * scaleY,
        0,
        0,
        cropWidth,
        cropHeight
      )

      const croppedDataUrl = canvas.toDataURL('image/png')
      setCroppedImage(croppedDataUrl)
      
      // NE PAS remplacer l'image originale - juste sortir du mode crop
      setIsCropMode(false)
    }
  }
  
  // Fonction pour recommencer un nouveau crop sur l'image originale
  const handleNewCrop = () => {
    if (!originalImage) return
    
    // Restaurer l'image et props originaux
    setImage(originalImage)
    setImageProps(originalImageProps)
    setIsCropMode(false)
    setCroppedImage(null)
  }

  // Upload vers Supabase (exemple)
  const uploadToSupabase = async () => {
    if (!croppedImage) return
    
    try {
      // Convertir dataURL en Blob
      const response = await fetch(croppedImage)
      const blob = await response.blob()
      
      // Créer FormData
      const formData = new FormData()
      formData.append('file', blob, 'logo-cropped.png')
      
      // Upload via ton API route existante
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      
      if (!uploadResponse.ok) throw new Error('Upload failed')
      
      const data = await uploadResponse.json()
      alert('✅ Image uploadée avec succès !\nURL: ' + data.url)
    } catch (error) {
      console.error('Erreur upload:', error)
      alert('❌ Erreur lors de l\'upload')
    }
  }

  // Attendre que Konva soit chargé
  if (!Konva) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de l'éditeur...</p>
        </div>
      </div>
    )
  }

  // Déstructurer les composants Konva
  const { Stage, Layer, Image: KonvaImage, Rect, Transformer } = Konva

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧪 Test Crop d'Image - Workflow Figma
          </h1>
          <p className="text-gray-600">
            Resize avec proportions → Double-clic → Crop libre → Clic dehors = Validation
          </p>
        </div>

        {/* UPLOAD ZONE */}
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Cliquer pour uploader</span> ou glisser-déposer
            </p>
            <p className="text-xs text-gray-500">PNG, JPG, GIF jusqu'à 10MB</p>
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>

        {/* GRID : ÉDITEUR + RÉSULTAT */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ÉDITEUR KONVA */}
          {image && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Éditeur
              </h2>
              
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <Stage
                  ref={stageRef}
                  width={800}
                  height={600}
                  onMouseDown={handleStageClick}
                >
                  <Layer>
                    {/* IMAGE PRINCIPALE */}
                    <KonvaImage
                      ref={imageRef}
                      image={image}
                      {...imageProps}
                      draggable={!isCropMode}
                      onDblClick={handleImageDoubleClick}
                      onDblTap={handleImageDoubleClick}
                      onTransformEnd={handleImageTransform}
                      opacity={isCropMode ? 0.5 : 1}
                    />
                    
                    {/* TRANSFORMER RESIZE (proportions lockées) */}
                    {!isCropMode && (
                      <Transformer
                        ref={transformerRef}
                        keepRatio={true}
                        enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
                        borderStroke="#8b5cf6"
                        borderStrokeWidth={2}
                        anchorStroke="#8b5cf6"
                        anchorFill="#ffffff"
                        anchorSize={12}
                        anchorCornerRadius={6}
                      />
                    )}

                    {/* RECTANGLE DE CROP */}
                    {isCropMode && (
                      <>
                        <Rect
                          ref={cropRectRef}
                          {...cropRect}
                          stroke="#10b981"
                          strokeWidth={3}
                          dash={[10, 5]}
                          draggable
                          onDragEnd={() => {
                            const node = cropRectRef.current
                            if (node) {
                              setCropRect({
                                ...cropRect,
                                x: node.x(),
                                y: node.y()
                              })
                            }
                          }}
                          onTransformEnd={handleCropTransform}
                        />
                        
                        {/* TRANSFORMER CROP (4 côtés indépendants) */}
                        <Transformer
                          ref={cropTransformerRef}
                          keepRatio={false}
                          enabledAnchors={[
                            'top-left',
                            'top-center',
                            'top-right',
                            'middle-left',
                            'middle-right',
                            'bottom-left',
                            'bottom-center',
                            'bottom-right',
                          ]}
                          borderStroke="#10b981"
                          borderStrokeWidth={2}
                          anchorStroke="#10b981"
                          anchorFill="#ffffff"
                          anchorSize={12}
                          anchorCornerRadius={6}
                        />
                      </>
                    )}
                  </Layer>
                </Stage>
              </div>
              
              {/* INSTRUCTIONS */}
              <div className="mt-4 space-y-2 text-sm">
                {!isCropMode ? (
                  <>
                    <div className="flex items-center gap-2 text-purple-700">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>Glissez les poignées pour <strong>redimensionner</strong> (proportions verrouillées)</span>
                    </div>
                    <div className="flex items-center gap-2 text-purple-700">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span><strong>Double-cliquez</strong> sur l'image pour entrer en mode crop</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 text-green-700">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Mode crop activé : ajustez les <strong>4 côtés indépendamment</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-green-700">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Cliquez en <strong>dehors du cadre</strong> pour valider le crop</span>
                    </div>
                  </>
                )}
              </div>
              
              {/* BOUTON NOUVEAU CROP */}
              {croppedImage && !isCropMode && (
                <div className="mt-4">
                  <button
                    onClick={handleNewCrop}
                    className="w-full bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Nouveau crop sur l'image originale
                  </button>
                </div>
              )}
            </div>
          )}

          {/* RÉSULTAT CROPÉ */}
          {croppedImage && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Image croppée
              </h2>
              
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <img
                  src={croppedImage}
                  alt="Image croppée"
                  className="w-full h-auto rounded shadow-sm"
                />
              </div>
              
              {/* ACTIONS */}
              <div className="mt-4 flex gap-3">
                <button
                  onClick={uploadToSupabase}
                  className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  Upload vers Supabase
                </button>
                <a
                  href={croppedImage}
                  download="logo-cropped.png"
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium text-center"
                >
                  Télécharger
                </a>
              </div>
            </div>
          )}
        </div>

        {/* PLACEHOLDER si pas d'image */}
        {!image && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg">
              Uploadez une image pour commencer l'édition
            </p>
          </div>
        )}

        {/* GUIDE D'UTILISATION */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            📘 Guide d'utilisation
          </h3>
          <ol className="space-y-2 text-blue-800">
            <li className="flex gap-3">
              <span className="font-bold min-w-[1.5rem]">1.</span>
              <span>Uploadez une image depuis votre ordinateur</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold min-w-[1.5rem]">2.</span>
              <span>Utilisez les <strong>poignées</strong> pour redimensionner l'image (proportions verrouillées)</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold min-w-[1.5rem]">3.</span>
              <span><strong>Double-cliquez</strong> sur l'image pour entrer en mode crop</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold min-w-[1.5rem]">4.</span>
              <span>Ajustez le cadre de crop en déplaçant les <strong>4 côtés indépendamment</strong></span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold min-w-[1.5rem]">5.</span>
              <span>Cliquez <strong>en dehors</strong> du cadre pour valider le crop</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold min-w-[1.5rem]">6.</span>
              <span>L'image croppée apparaît à droite, prête à être uploadée</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold min-w-[1.5rem]">7.</span>
              <span>Vous pouvez faire un <strong>nouveau crop</strong> sur l'image originale en cliquant sur le bouton violet</span>
            </li>
          </ol>
        </div>

        {/* RETOUR */}
        <div className="text-center">
          <a
            href="/dashboard/concertations"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour au dashboard
          </a>
        </div>
      </div>
    </div>
  )
}