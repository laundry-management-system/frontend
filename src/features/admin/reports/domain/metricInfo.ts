/** Định nghĩa (i) của từng chỉ số, theo Danh mục chỉ số trong spec. */
export const PERIOD_NOTE = 'Đơn tính theo ngày nhận, doanh thu theo ngày thanh toán.'

export const METRIC_INFO = {
  revenue:
    'Tổng các khoản thanh toán đã xác nhận có thời điểm thanh toán trong kỳ, trừ khoản đã hoàn / huỷ.',
  revenueByMethod: 'Doanh thu thực thu tách theo phương thức thanh toán / kênh của đơn.',
  paidOrders: 'Số đơn có ít nhất một thanh toán tính vào doanh thu kỳ.',
  avgOrderValue: 'Doanh thu thực thu chia cho số đơn đã thanh toán trong kỳ.',
  growth:
    '(Kỳ này - kỳ trước) / kỳ trước, làm tròn 1 chữ số thập phân. Kỳ trước là khoảng cùng số ngày liền kề.',
  received: 'Số đơn có thời điểm nhận đơn trong kỳ (không gồm yêu cầu online chưa xác nhận).',
  delivered: 'Số đơn chuyển sang trạng thái đã giao trong kỳ.',
  cancelled: 'Số đơn chuyển sang trạng thái đã hủy trong kỳ.',
  processing: 'Số đơn nhận trong kỳ hiện chưa ở trạng thái đã giao / đã hủy.',
  returningRate: 'Quay lại / (mới + quay lại).',
  onlineSignups: 'Số tài khoản khách đăng ký trong kỳ, không tính đơn bị từ chối.',
  topCustomers: '10 khách có doanh thu thực thu cao nhất trong kỳ.',
  shiftsClosed: 'Số ca đóng trong kỳ.',
  shiftCashTotal: 'Tổng tiền nộp của các ca đóng trong kỳ.',
  medianProcessing: 'Trung vị của thời gian xử lý.',
  cancelByReason:
    'Đơn hủy trong kỳ nhóm theo lý do trong danh mục; đơn cũ không có lý do danh mục tính vào "Khác".',
  lateByPeriod: 'Đơn có hẹn trả trong kỳ mà sẵn sàng sau hẹn hoặc chưa sẵn sàng.',
  lateNow: 'Đơn đang mở (đã nhận hoặc đang xử lý) đã quá hẹn trả tại thời điểm xem.',
  openByStatus: 'Số đơn đang ở từng trạng thái tại thời điểm xem.',
  unclaimed: 'Đơn sẵn sàng trả quá số ngày ngưỡng của tiệm mà khách chưa nhận.',
  processingTime:
    'Từ lúc nhận đơn đến lần đầu đơn đạt trạng thái hoàn tất / sẵn sàng trả theo lịch sử trạng thái; đơn có mốc này trong kỳ.',
  onTimeRate:
    'Tỉ lệ đơn sẵn sàng trả không quá hẹn trả, tính trên các đơn có mốc sẵn sàng trong kỳ.',
  byService: 'Đơn nhận trong kỳ tách theo dịch vụ / hình thức giặt.',
  onlineConfirmRate: 'Yêu cầu đặt online được xác nhận / tổng yêu cầu tạo trong kỳ.',
  newCustomers: 'Mới: đơn đầu tiên của khách nằm trong kỳ.',
  returningCustomers: 'Quay lại: có đơn trong kỳ và đã có đơn trước kỳ.',
  voucher: 'Đơn nhận trong kỳ có áp voucher, không gồm đơn đã hủy.',
  ordersByStaff:
    'Đơn nhận trong kỳ; đơn quầy tính cho người tạo, đơn online tính cho nhân viên xác nhận.',
  shiftDiff: 'Chênh lệch, thiếu / thừa và tiền nộp của các ca đóng trong kỳ.',
  incidents: 'Sự cố ghi nhận trong kỳ.',
  compensation: 'Tiền bồi thường đã chi trong kỳ.',
} as const

export type MetricKey = keyof typeof METRIC_INFO
