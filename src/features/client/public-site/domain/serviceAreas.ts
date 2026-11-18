import type { PublicServiceArea } from './types'

// Khách gõ không dấu ("ben thanh") vẫn phải ra "Phường Bến Thành"
const fold = (s: string) =>
  s.normalize('NFD').replace(/\p{M}/gu, '').replace(/[đĐ]/g, 'd').toLowerCase().trim()

export function filterAreas(areas: readonly PublicServiceArea[], query: string) {
  const q = fold(query)
  return q ? areas.filter((a) => fold(a.name).includes(q)) : areas
}

export const minFee = (areas: readonly PublicServiceArea[]) =>
  Math.min(...areas.flatMap((a) => [a.pickupFee, a.deliveryFee]))

export const directionsUrl = (address: string) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`
