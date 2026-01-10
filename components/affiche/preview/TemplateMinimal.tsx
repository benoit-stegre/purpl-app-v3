interface TemplateMinimalProps {
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

export default function TemplateMinimal({
  concertation,
  couleurPrimaire,
  couleurSecondaire,
  logoUrl,
  qrCodeDataUrl
}: TemplateMinimalProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-8 p-16 bg-white">
      {logoUrl && (
        <img
          src={logoUrl}
          alt="Logo"
          className="w-20 h-20 object-contain mb-5"
        />
      )}

      <div className="flex flex-col items-center gap-3 w-full">
        <h1
          className="text-4xl font-bold text-center max-w-[90%]"
          style={{ color: couleurPrimaire }}
        >
          {concertation.titre}
        </h1>
        <div
          className="w-24 h-1"
          style={{ backgroundColor: couleurPrimaire }}
        />
      </div>

      <p className="text-base text-gray-600 text-center leading-relaxed max-w-[80%]">
        {concertation.description || 'Participez à cette concertation'}
      </p>

      <div className="my-5">
        <img
          src={qrCodeDataUrl}
          alt="QR Code"
          className="w-56 h-56"
        />
      </div>

      <p className="text-base text-gray-500">
        purpl.fr/c/{concertation.slug}
      </p>

      <div
        className="px-8 py-4 rounded-full mt-3"
        style={{ backgroundColor: couleurPrimaire }}
      >
        <p
          className="text-sm font-bold"
          style={{ color: couleurSecondaire }}
        >
          Scannez pour répondre
        </p>
      </div>
    </div>
  )
}
