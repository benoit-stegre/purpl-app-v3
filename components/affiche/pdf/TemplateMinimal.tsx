import { View, Text, Image, StyleSheet } from '@react-pdf/renderer'

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
    <View style={styles.container}>
      <View style={styles.content}>
        {logoUrl && (
          <Image src={logoUrl} style={styles.logo} />
        )}
        
        <View style={styles.titleSection}>
          <Text style={[styles.titre, { color: couleurPrimaire }]}>
            {concertation.titre}
          </Text>
          <View style={[styles.underline, { backgroundColor: couleurPrimaire }]} />
        </View>

        <Text style={styles.description}>
          {concertation.description || 'Participez à cette concertation'}
        </Text>

        <View style={styles.qrSection}>
          <Image src={qrCodeDataUrl} style={styles.qrCode} />
        </View>

        <View style={styles.urlSection}>
          <Text style={styles.urlText}>purpl.fr/c/{concertation.slug}</Text>
        </View>

        <View style={[styles.badge, { backgroundColor: couleurPrimaire }]}>
          <Text style={[styles.badgeText, { color: couleurSecondaire }]}>
            Scannez pour répondre
          </Text>
        </View>
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
  content: {
    flex: 1,
    padding: 60,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 30
  },
  logo: {
    width: 80,
    height: 80,
    objectFit: 'contain',
    marginBottom: 20
  },
  titleSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
    width: '100%'
  },
  titre: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'Helvetica-Bold',
    maxWidth: '90%'
  },
  underline: {
    width: 100,
    height: 4
  },
  description: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 1.5,
    maxWidth: '80%',
    fontFamily: 'Helvetica'
  },
  qrSection: {
    marginVertical: 20
  },
  qrCode: {
    width: 220,
    height: 220
  },
  urlSection: {
    display: 'flex',
    alignItems: 'center'
  },
  urlText: {
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'Helvetica'
  },
  badge: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 10
  },
  badgeText: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold'
  }
})
