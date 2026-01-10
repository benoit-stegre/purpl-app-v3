import { createHistoryStore } from '@/stores/historyStore'
import { DesignConfigV6, DEFAULT_DESIGN_V6 } from '@/types/design-v6'

// Instance UNIQUE partagée dans toute l'application
export const useDesignHistory = createHistoryStore<DesignConfigV6>(DEFAULT_DESIGN_V6)