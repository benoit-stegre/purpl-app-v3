import { View, Text, Image, StyleSheet } from '@react-pdf/renderer'

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
    <View style={styles.container}>
      <View style={styles.header}>
        {logoUrl && (
          <Image src={logoUrl} style={styles.logo} />
        )}
      </View>

      <View style={styles.titleSection}>
        <View style={[styles.titleBar, { backgroundColor: couleurPrimaire }]} />
        <Text style={[styles.titre, { color: couleurPrimaire }]}>
          {concertation.titre}
        </Text>
        <View style={[styles.titleBar, { backgroundColor: couleurPrimaire }]} />
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>CONCERTATION CITOYENNE</Text>
        <Text style={styles.description}>
          {concertation.description || 'Votre opinion compte. Participez à cette consultation publique.'}
        </Text>
      </View>

      <View style={styles.qrSection}>
        <Text style={styles.qrLabel}>Scannez ce QR Code pour participer</Text>
        <Image src={qrCodeDataUrl} style={styles.qrCode} />
        <View style={[styles.urlBox, { borderColor: couleurPrimaire }]}>
          <Text style={[styles.urlText, { color: couleurPrimaire }]}>
            purpl.fr/c/{concertation.slug}
          </Text>
        </View>
      </View>

      <View style={[styles.footer, { backgroundColor: couleurPrimaire }]}>
        <Text style={[styles.footerText, { color: couleurSecondaire }]}>
          Votre avis nous intéresse
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
    flexDirection: 'column',
    backgroundColor: '#FFFFFF'
  },
  header: {
    padding: 40,
    display: 'flex',
    alignItems: 'center'
  },
  logo: {
    width: 100,
    height: 100,
    objectFit: 'contain'
  },
  titleSection: {
    padding: 30,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 15
  },
  titleBar: {
    width: 200,
    height: 4
  },
  titre: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'Helvetica-Bold'
  },
  content: {
    flex: 1,
    paddingHorizontal: 40,
    display: 'flex',
    flexDirection: 'column',
    gap: 20
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6B7280',
    letterSpacing: 2,
    fontFamily: 'Helvetica-Bold'
  },
  description: {
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 1.6,
    textAlign: 'justify',
    fontFamily: 'Helvetica'
  },
  qrSection: {
    padding: 40,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 15
  },
  qrLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    fontFamily: 'Helvetica-Bold'
  },
  qrCode: {
    width: 180,
    height: 180
  },
  urlBox: {
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10
  },
  urlText: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold'
  },
  footer: {
    padding: 25,
    display: 'flex',
    alignItems: 'center'
  },
  footerText: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold'
  }
})
