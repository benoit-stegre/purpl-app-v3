export const UPLOAD_LIMITS = {
  photo: {
    maxSize: 2 * 1024 * 1024, // 2 MB
    maxWidth: 1920,
    maxHeight: 1080,
    acceptedFormats: ['image/jpeg', 'image/png', 'image/webp']
  },
  logo: {
    maxSize: 500 * 1024, // 500 KB
    maxWidth: 512,
    maxHeight: 512,
    acceptedFormats: ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
  },
  fond: {
    maxSize: 1 * 1024 * 1024, // 1 MB
    maxWidth: 1080,
    maxHeight: 1920,
    acceptedFormats: ['image/jpeg', 'image/png', 'image/webp']
  }
}

export const LOGO_SIZES = {
  small: 60,
  medium: 100,
  large: 140
}

export const LOGO_PARTENAIRE_SIZES = {
  small: 40,
  medium: 60,
  large: 80
}