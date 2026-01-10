'use client'

import { 
  Upload, ImagePlus, Image, FolderUp, FileUp,
  Crop, Scissors, Maximize2, Minimize2, Expand,
  Square, Frame, RectangleHorizontal, BoxSelect, Layout,
  AlignLeft, AlignCenter, AlignRight, AlignJustify
} from 'lucide-react'

export default function TestIconsPage() {
  const icons = {
    upload: [
      { id: 1, Icon: Upload, name: 'Upload' },
      { id: 2, Icon: ImagePlus, name: 'ImagePlus' },
      { id: 3, Icon: Image, name: 'Image' },
      { id: 4, Icon: FolderUp, name: 'FolderUp' },
      { id: 5, Icon: FileUp, name: 'FileUp' }
    ],
    crop: [
      { id: 6, Icon: Crop, name: 'Crop' },
      { id: 7, Icon: Scissors, name: 'Scissors' },
      { id: 8, Icon: Maximize2, name: 'Maximize2' },
      { id: 9, Icon: Minimize2, name: 'Minimize2' },
      { id: 10, Icon: Expand, name: 'Expand' }
    ],
    cadre: [
      { id: 11, Icon: Square, name: 'Square' },
      { id: 12, Icon: Frame, name: 'Frame' },
      { id: 13, Icon: RectangleHorizontal, name: 'RectangleHorizontal' },
      { id: 14, Icon: BoxSelect, name: 'BoxSelect' },
      { id: 15, Icon: Layout, name: 'Layout' }
    ],
    alignment: [
      { id: 16, Icon: AlignLeft, name: 'AlignLeft' },
      { id: 17, Icon: AlignCenter, name: 'AlignCenter' },
      { id: 18, Icon: AlignRight, name: 'AlignRight' },
      { id: 19, Icon: AlignJustify, name: 'AlignJustify' }
    ]
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Choix des icônes</h1>
          <p className="text-gray-600">Style minimaliste, line icons, noir, contours épais</p>
        </div>

        {/* MODIFIER / UPLOAD */}
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
            Icône "Modifier" (upload/téléchargement)
          </h2>
          <div className="grid grid-cols-5 gap-6">
            {icons.upload.map(({ id, Icon, name }) => (
              <div key={id} className="flex flex-col items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer">
                <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded-lg">
                  <Icon className="w-8 h-8 text-gray-900" strokeWidth={2} />
                </div>
                <div className="text-center space-y-1">
                  <div className="font-bold text-blue-600 text-lg">#{id}</div>
                  <div className="text-xs text-gray-600">{name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ROGNER / CROP */}
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
            Icône "Rogner" (crop/recadrage)
          </h2>
          <div className="grid grid-cols-5 gap-6">
            {icons.crop.map(({ id, Icon, name }) => (
              <div key={id} className="flex flex-col items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer">
                <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded-lg">
                  <Icon className="w-8 h-8 text-gray-900" strokeWidth={2} />
                </div>
                <div className="text-center space-y-1">
                  <div className="font-bold text-blue-600 text-lg">#{id}</div>
                  <div className="text-xs text-gray-600">{name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CADRE */}
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
            Icône "Cadre" (frame/bordure)
          </h2>
          <div className="grid grid-cols-5 gap-6">
            {icons.cadre.map(({ id, Icon, name }) => (
              <div key={id} className="flex flex-col items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer">
                <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded-lg">
                  <Icon className="w-8 h-8 text-gray-900" strokeWidth={2} />
                </div>
                <div className="text-center space-y-1">
                  <div className="font-bold text-blue-600 text-lg">#{id}</div>
                  <div className="text-xs text-gray-600">{name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ALIGNEMENT (pour référence) */}
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
            Icônes "Alignement" (actuelles)
          </h2>
          <div className="grid grid-cols-4 gap-6">
            {icons.alignment.map(({ id, Icon, name }) => (
              <div key={id} className="flex flex-col items-center gap-3 p-4 border-2 border-gray-200 rounded-lg">
                <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded-lg">
                  <Icon className="w-8 h-8 text-gray-900" strokeWidth={2} />
                </div>
                <div className="text-center space-y-1">
                  <div className="font-bold text-green-600 text-lg">✓ Actuelle</div>
                  <div className="text-xs text-gray-600">{name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
          <p className="text-blue-900 font-medium text-center">
            📝 Note les numéros de tes choix et dis-moi : "Je choisis #X pour Modifier, #Y pour Rogner, #Z pour Cadre"
          </p>
        </div>

      </div>
    </div>
  )
}