interface TemplateClassicProps {
  concertation: {
    titre: string
    description: string
    slug: string
  }
  couleurPrimaire: string
  couleurSecondaire: string
  logoUrl: string | null
  qrCodeDataUrl: string
}

export default function TemplateClassic({
  concertation,
  couleurPrimaire,
  couleurSecondaire,
  logoUrl,
  qrCodeDataUrl
}: TemplateClassicProps) {
  return (
    <div className="w-full h-full flex flex-col bg-white">
      <div className="flex items-center justify-center p-10">
        {logoUrl && (
          <img
            src={logoUrl}
            alt="Logo"
            className="w-24 h-24 object-contain"
          />
        )}
      </div>

      <div className="flex flex-col items-center gap-4 px-8 py-6">
        <div
          className="w-48 h-1"
          style={{ backgroundColor: couleurPrimaire }}
        />
        <h1
          className="text-3xl font-bold text-center"
          style={{ color: couleurPrimaire }}
        >
          {concertation.titre}
        </h1>
        <div
          className="w-48 h-1"
          style={{ backgroundColor: couleurPrimaire }}
        />
      </div>

      <div className="flex-1 flex flex-col gap-5 px-10 py-6">
        <p className="text-sm font-bold text-gray-500 tracking-widest">
          CONCERTATION CITOYENNE
        </p>
        <p className="text-base text-gray-900 leading-relaxed text-justify">
          {concertation.description || 'Votre opinion compte. Participez à cette consultation publique.'}
        </p>
      </div>

      <div className="flex flex-col items-center gap-4 px-10 py-8">
        <p className="text-base font-bold text-gray-900">
          Scannez ce QR Code pour participer
        </p>
        <img
          src={qrCodeDataUrl}
          alt="QR Code"
          className="w-44 h-44"
        />
        <div
          className="border-2 rounded-lg px-5 py-2"
          style={{ borderColor: couleurPrimaire }}
        >
          <p
            className="text-sm font-bold"
            style={{ color: couleurPrimaire }}
          >
            purpl.fr/c/{concertation.slug}
          </p>
        </div>
      </div>

      <div
        className="flex items-center justify-center py-6"
        style={{ backgroundColor: couleurPrimaire }}
      >
        <p
          className="text-base font-bold"
          style={{ color: couleurSecondaire }}
        >
          Votre avis nous intéresse
        </p>
      </div>
    </div>
  )
}
