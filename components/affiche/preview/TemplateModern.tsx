interface TemplateModernProps {
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

export default function TemplateModern({
  concertation,
  couleurPrimaire,
  couleurSecondaire,
  logoUrl,
  qrCodeDataUrl
}: TemplateModernProps) {
  return (
    <div className="w-full h-full flex flex-col">
      <div
        className="flex flex-col items-center gap-5 p-10"
        style={{ backgroundColor: couleurPrimaire }}
      >
        {logoUrl && (
          <img
            src={logoUrl}
            alt="Logo"
            className="w-20 h-20 object-contain"
          />
        )}
        <h1
          className="text-3xl font-bold text-center"
          style={{ color: couleurSecondaire }}
        >
          {concertation.titre}
        </h1>
      </div>

      <div className="flex-1 flex flex-col gap-5 p-10">
        <h2 className="text-2xl font-bold text-gray-900">
          Donnez votre avis
        </h2>
        <p className="text-base text-gray-600 leading-relaxed">
          {concertation.description || 'Participez à cette concertation citoyenne en scannant le QR code ci-dessous.'}
        </p>
      </div>

      <div className="flex flex-col items-center gap-4 p-10">
        <img
          src={qrCodeDataUrl}
          alt="QR Code"
          className="w-52 h-52"
        />
        <p className="text-sm text-gray-500">
          purpl.fr/c/{concertation.slug}
        </p>
      </div>

      <div
        className="flex items-center justify-center p-8"
        style={{ backgroundColor: couleurPrimaire }}
      >
        <p
          className="text-lg font-bold"
          style={{ color: couleurSecondaire }}
        >
          Scannez pour participer
        </p>
      </div>
    </div>
  )
}
