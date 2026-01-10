import { forwardRef } from 'react'
import TemplateModern from './TemplateModern'
import TemplateClassic from './TemplateClassic'
import TemplateMinimal from './TemplateMinimal'

interface AffichePreviewProps {
  concertation: {
    titre: string
    description: string
    slug: string
  }
  template: 'modern' | 'classic' | 'minimal'
  couleurPrimaire: string
  couleurSecondaire: string
  logoUrl: string | null
  qrCodeDataUrl: string
}

const AffichePreview = forwardRef<HTMLDivElement, AffichePreviewProps>(
  ({ concertation, template, couleurPrimaire, couleurSecondaire, logoUrl, qrCodeDataUrl }, ref) => {
    const templates = {
      modern: TemplateModern,
      classic: TemplateClassic,
      minimal: TemplateMinimal
    }

    const TemplateComponent = templates[template]

    return (
      <div
        ref={ref}
        className="w-[210mm] h-[297mm] bg-white"
        style={{
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          overflow: 'hidden'
        }}
      >
        <TemplateComponent
          concertation={concertation}
          couleurPrimaire={couleurPrimaire}
          couleurSecondaire={couleurSecondaire}
          logoUrl={logoUrl}
          qrCodeDataUrl={qrCodeDataUrl}
        />
      </div>
    )
  }
)

AffichePreview.displayName = 'AffichePreview'

export default AffichePreview
