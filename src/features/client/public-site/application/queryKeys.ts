export const publicSiteKeys = {
  all: ['public-site'] as const,
  store: () => [...publicSiteKeys.all, 'store'] as const,
  services: () => [...publicSiteKeys.all, 'services'] as const,
  washModes: () => [...publicSiteKeys.all, 'wash-modes'] as const,
  serviceAreas: () => [...publicSiteKeys.all, 'service-areas'] as const,
}
