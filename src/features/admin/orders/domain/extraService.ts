/** Dịch vụ phát sinh: đơn có ghi nhận dịch vụ khách chọn nhưng dòng dùng dịch vụ ngoài danh sách đó (FR-009, FR-012). */
export function isExtraService(
  serviceId: number | null | undefined,
  requestedServices: { id: number }[],
): boolean {
  return (
    requestedServices.length > 0 &&
    serviceId != null &&
    !requestedServices.some((s) => s.id === serviceId)
  )
}
