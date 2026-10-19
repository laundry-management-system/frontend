# Frontend – quy tắc cho Claude

## Hiển thị mã định danh

Mọi mã định danh do hệ thống cấp (mã đơn `LD-…`, mã khách `KH…`, mã nhân viên `NV…`, mã dịch vụ `DV…`, mã voucher, mã phiếu sự cố…) **phải dùng cùng một font mono** của Design System, ở mọi nơi hiển thị: cột bảng, breadcrumb, tiêu đề, dòng phụ, toast, modal.

- Dùng component `EntityCode` từ `@/shared/ui` (`size="md"` mặc định, `size="sm"` cho chỗ chữ nhỏ như breadcrumb). Riêng mã đơn có thể dùng `OrderCode` (bọc `EntityCode`).
- Không render mã bằng chuỗi trần (`{customer.code}`, `` `${code} · …` ``) và không tự gắn class `text-code-*` lẻ. Cột `DataTable` chứa mã phải có `render` trả về `EntityCode`.
- Khi prop chỉ nhận `string` mà cần chèn mã (VD `description` của `PageHeader`), đổi prop đó sang `ReactNode` thay vì nối chuỗi.

## Empty state

Mọi vùng hiển thị dữ liệu (bảng, danh sách, thẻ, trang chi tiết) **phải xử lý đủ các trạng thái không có dữ liệu**, mỗi trạng thái một `EmptyState` (`@/shared/ui`) riêng, không để trống trắng hay chỉ một dòng chữ:

| Trạng thái | Icon gợi ý (`react-icons/lu`, `size={32}`) | Nội dung |
|---|---|---|
| Chưa có dữ liệu | icon của đối tượng (`LuUsers`, `LuReceiptText`, `LuInbox`…) | title + description "… sẽ hiện ở đây" + action tạo mới nếu người dùng có quyền |
| Tìm/lọc không ra | `LuSearchX` | nêu từ khóa, action xóa lọc hoặc tạo mới |
| Không tìm thấy (404) | icon "X" của đối tượng (`LuUserX`…) | action quay về danh sách |
| Lỗi tải | `LuCloudOff` | "Vui lòng kiểm tra kết nối rồi thử lại." + nút Thử lại nếu có |

- Luôn có icon. `EmptyState` tự dùng `LuInbox` khi không truyền `icon`, nhưng chỉ coi đó là dự phòng — chọn icon đúng ngữ cảnh.
- Dùng `ListPage` thì lỗi tải đã có sẵn; vẫn phải truyền `empty` cho trạng thái rỗng / không tìm thấy.
