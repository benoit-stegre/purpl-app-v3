import { View, Text, Image, StyleSheet } from '@react-pdf/renderer'

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
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: couleurPrimaire }]}>
        {logoUrl && (
          <Image src={logoUrl} style={styles.logo} />
        )}
        <Text style={[styles.titre, { color: couleurSecondaire }]}>
          {concertation.titre}
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.sousTitre}>Donnez votre avis</Text>
        <Text style={styles.description}>
          {concertation.description || 'Participez à cette concertation citoyenne en scannant le QR code ci-dessous.'}
        </Text>
      </View>

      <View style={styles.qrSection}>
        <Image src={qrCodeDataUrl} style={styles.qrCode} />
        <Text style={styles.urlText}>purpl.fr/c/{concertation.slug}</Text>
      </View>

      <View style={[styles.footer, { backgroundColor: couleurPrimaire }]}>
        <Text style={[styles.footerText, { color: couleurSecondaire }]}>
          Scannez pour participer
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    padding: 40,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 20
  },
  logo: {
    width: 80,
    height: 80,
    objectFit: 'contain'
  },
  titre: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'Helvetica-Bold'
  },
  content: {
    flex: 1,
    padding: 40,
    display: 'flex',
    flexDirection: 'column',
    gap: 20
  },
  sousTitre: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    fontFamily: 'Helvetica-Bold'
  },
  description: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 1.6,
    fontFamily: 'Helvetica'
  },
  qrSection: {
    padding: 40,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 15
  },
  qrCode: {
    width: 200,
    height: 200
  },
  urlText: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Helvetica'
  },
  footer: {
    padding: 30,
    display: 'flex',
    alignItems: 'center'
  },
  footerText: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold'
  }
})
