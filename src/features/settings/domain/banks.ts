export interface Bank {
  bin: string
  shortName: string
}

// Mã BIN theo danh sách ngân hàng của VietQR (api.vietqr.io/v2/banks)
export const BANKS: Bank[] = [
  { bin: '970436', shortName: 'Vietcombank' },
  { bin: '970415', shortName: 'VietinBank' },
  { bin: '970418', shortName: 'BIDV' },
  { bin: '970405', shortName: 'Agribank' },
  { bin: '970407', shortName: 'Techcombank' },
  { bin: '970422', shortName: 'MBBank' },
  { bin: '970416', shortName: 'ACB' },
  { bin: '970432', shortName: 'VPBank' },
  { bin: '970403', shortName: 'Sacombank' },
  { bin: '970423', shortName: 'TPBank' },
  { bin: '970441', shortName: 'VIB' },
  { bin: '970443', shortName: 'SHB' },
]

/** BIN đang lưu không có trong danh sách vẫn giữ làm một lựa chọn để không mất giá trị */
export function bankOptions(currentBin: string) {
  const options = BANKS.map((b) => ({ value: b.bin, label: b.shortName }))
  return currentBin && !BANKS.some((b) => b.bin === currentBin)
    ? [...options, { value: currentBin, label: `Mã BIN ${currentBin}` }]
    : options
}
