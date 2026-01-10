import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer'
import TemplateModern from './TemplateModern'
import TemplateClassic from './TemplateClassic'
import TemplateMinimal from './TemplateMinimal'

interface AffichePDFDocumentProps {
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

export default function AffichePDFDocument({
  concertation,
  template,
  couleurPrimaire,
  couleurSecondaire,
  logoUrl,
  qrCodeDataUrl
}: AffichePDFDocumentProps) {
  const templates = {
    modern: TemplateModern,
    classic: TemplateClassic,
    minimal: TemplateMinimal
  }

  const TemplateComponent = templates[template]

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <TemplateComponent
          concertation={concertation}
          couleurPrimaire={couleurPrimaire}
          couleurSecondaire={couleurSecondaire}
          logoUrl={logoUrl}
          qrCodeDataUrl={qrCodeDataUrl}
        />
      </Page>
    </Document>
  )
}

const styles = StyleSheet.create({
  page: {
    width: '100%',
    height: '100%'
  }
})
