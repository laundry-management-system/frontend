# Frontend – quy tắc cho Claude

Kiến trúc gốc: `architecture-2.html` (FE: `app → pages → features → shared`; mỗi feature 4 layer `presentation → application → data → domain`, `index.ts` là public API). Các mục dưới đây là quy tắc chi tiết theo kiến trúc đó.

- `application/`: mỗi hook một file (`useXxx.ts`, `useCreateXxx.ts`, `useUpdateXxx.ts`), `queryKeys.ts`, `schemas.ts` (zod schema của form).
- `domain/`: TS thuần (type, hàm tính toán), không import React / axios / zod.
- Page không gọi API trực tiếp; chỉ dùng hook từ `@/features/<x>`.

## Hiển thị mã định danh

Mọi mã định danh do hệ thống cấp (mã đơn `LD-…`, mã khách `KH…`, mã nhân viên `NV…`, mã dịch vụ `DV…`, mã voucher, mã phiếu sự cố…) **phải dùng cùng một font mono** của Design System, ở mọi nơi hiển thị: cột bảng, breadcrumb, tiêu đề, dòng phụ, toast, modal.

- Dùng component `EntityCode` từ `@/shared/ui` (`size="md"` mặc định, `size="sm"` cho chỗ chữ nhỏ như breadcrumb). Riêng mã đơn có thể dùng `OrderCode` (bọc `EntityCode`).
- Cột mã trong bảng listing dùng `CopyableCode` (mã kèm nút sao chép, tự chặn click lan ra dòng); nơi khác dùng `EntityCode` / `OrderCode`.
- Không render mã bằng chuỗi trần (`{customer.code}`, `` `${code} · …` ``) và không tự gắn class `text-code-*` lẻ. Cột `DataTable` chứa mã phải có `render` trả về `CopyableCode` (hoặc `EntityCode` ngoài trang listing).
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

## Thao tác trên từng dòng bảng

Mọi màn danh sách dùng **cùng một kiểu cột thao tác**: cột cuối, `label: ''`, `width: 40`, `align: 'right'`, `fixed: 'right'`, render `RowActions` từ `@/shared/ui` (nút ⋯ mở menu), giống trang Nhân viên.

- Cột cố định khi bảng cuộn ngang (`DataTableColumn.fixed`): cột **Mã** và cột **Tên** `fixed: 'left'`, cột thao tác / mở chi tiết `fixed: 'right'`. Các cột cố định liền kề phải có `width` để tính vị trí (riêng cột cố định trong cùng có thể bỏ trống).
- Không đặt nút chữ/icon rời ("Sửa", bút chì…) trực tiếp trong dòng, kể cả khi chỉ có một thao tác.
- Thao tác hủy / vô hiệu hóa / ngừng hoạt động: `danger: true`. Thao tác không áp dụng cho dòng đó: `hidden: true` (không disable).
- Cột chỉ hiện với vai trò có quyền thao tác (VD `canManage`); thao tác nguy hiểm vẫn qua `ConfirmModal`.
- Ngoại lệ: dòng chỉ để mở trang chi tiết (danh sách Khách hàng) dùng `IconButton` "›" + bấm cả dòng, không phải menu.

## Phần giải thích trên UI

1. **Mọi câu giải thích đưa vào tooltip (i), đặt cạnh label / title mà nó giải thích**, không render thành dòng chữ trên trang hay dưới ô nhập:
   - Cả trang → prop `info` của `PageHeader` / `ListPage` (cạnh tiêu đề trang).
   - Ô nhập / nhóm / tiêu đề nhỏ → `InfoLabel` (`@/shared/ui`): `label={<InfoLabel info="…">Đơn giá</InfoLabel>}`.
   - Không dùng `description` của input, `Alert` hay `Text c="dimmed"` để giải thích. `Alert` chỉ cho cảnh báo / lỗi cần chú ý ngay.
2. **Chỉ giải thích khi thật cần**: hệ quả không tự thấy được (đổi giá không ảnh hưởng đơn cũ, ngừng hoạt động thì không chọn được nữa, thao tác bị ghi nhật ký). Không giải thích:
   - điều đã có lỗi validate nói rõ (VD "Ngắn hơn thời gian chuẩn"),
   - điều giao diện đã tự thể hiện (VD "Bảng giá chỉ xem" khi không có nút sửa),
   - đơn vị / định dạng → đưa thẳng vào label hoặc hậu tố (`Phụ phí giặt nhanh (mỗi kg)`, `rightSection="giờ"`).
- Không thuộc diện "giải thích" (giữ nguyên trên UI): số liệu tóm tắt ở `description` của tiêu đề trang (VD "4 dịch vụ · 3 đang hoạt động"), bộ đếm ký tự còn lại, nội dung của `EmptyState` và `ConfirmModal`.

## Tạo shared component mới

Thứ tự ưu tiên:

1. Đã có trong `@/shared/ui` → dùng lại.
2. Mantine có sẵn → bọc component Mantine, chỉ custom phần DS cần (props mặc định, nhãn tiếng Việt, a11y). Mẫu: `IconButton` (ActionIcon + Tooltip), `RowActions` (Menu), `InfoTooltip` (Tooltip), `ConfirmModal` (Modal), `MoneyInput` (NumberInput).
3. Mantine không có → mới tự dựng, vẫn dùng token / class DS (VD `EmptyState`, `EntityCode`).

- Muốn đổi giao diện cho **mọi** chỗ dùng một component Mantine → sửa ở `app/theme.ts` (`Component.extend`: `defaultProps`, `styles`, `vars`) thay vì bọc thêm một lớp (VD badge không cắt chữ, tooltip có mũi tên).
- Không tự viết lại hành vi Mantine đã có: focus trap, portal, phím tắt, aria của Menu / Modal / Tooltip / Select.
- Đặt trong `src/shared/ui/<nhóm>/` (`buttons`, `feedback`, `layout`, `data-display`, `domain`) và export qua `src/shared/ui/index.ts`.

## Tổ chức file trong một layer

- Một layer của feature (`presentation`, `application`, `domain`, `data`) có **quá 8 file** → gom vào thư mục con theo nhóm, file dùng chung cho nhiều nhóm để ở gốc layer.
- `presentation/`: nhóm theo luồng màn hình. VD `orders`: `intake/` (Tiếp nhận), `classify/` (Phân loại), `detail/` (card trang chi tiết), `modals/` (modal thao tác); `OrderStatusCell`, `stickyAside` ở gốc.
- `application/`: `queries/` (hook `useQuery`), `mutations/` (hook `useMutation`); `queryKeys.ts`, `schemas.ts` và hook không thuộc hai loại trên ở gốc.
- Tên thư mục con viết thường, không có `index.ts` riêng; mọi export ra ngoài vẫn đi qua `index.ts` của feature.

## Comment trong code

- Chỉ viết comment cho **lý do** mà code không tự nói được: ràng buộc / lỗi lạ của BE, workaround thư viện, quy tắc nghiệp vụ không hiển nhiên, `shortcut:` kèm khi nào cần nâng cấp. Một dòng là đủ.
- Không viết comment lặp lại tên hàm / prop / type (VD `/** Dịch vụ đang hoạt động */` trên `services: Service[]`), không mô tả lại code bên dưới làm gì.
- Không ghi mã spec làm nội dung chính (`WF-…`, `BR-…`, `FR-…`, `US…`, `research R…`, ngày làm rõ): comment phải đọc hiểu được khi không mở spec. Chỉ kèm mã khi câu đã tự đủ nghĩa.
- Không để comment lịch sử / tạm (`v3 mới thêm`, `trước đây…`, `TODO` không có chủ). Sửa code thì sửa hoặc xóa luôn comment đã sai.

## Tạo page mới

- Page hiển thị **danh sách dữ liệu** → ưu tiên `ListPage` (`@/shared/ui`): đã gồm `PageHeader` (title, description, `info`, `primaryAction` / `actions`), khối `filters`, `DataTable` có phân trang, `EmptyState` lỗi tải + Thử lại. Không tự ghép lại `PageHeader` + `Card` + `Table`.
- Truyền `empty` cho trạng thái rỗng / tìm không ra (mục Empty state); cột thao tác theo mục "Thao tác trên từng dòng bảng"; ghi chú dưới bảng qua `children`.
- Chỉ dựng layout riêng khi màn không phải danh sách (trang chi tiết, form nhiều bước, dashboard); khi đó vẫn dùng `PageHeader` cho tiêu đề.
- Nhiều component con trong **một page** cần dùng chung state (VD toolbar bật/tắt, nội dung đọc) → dùng React context đặt cạnh page (xem mục Quản lý state), không truyền props qua nhiều tầng, không đưa lên zustand.
- Đăng ký page: lazy route trong `app/router/routes.tsx`, mục nav trong `app/layouts/MainLayout.tsx` (kèm `roles`).

## Khai báo props trước khi truyền

Mọi page (đặc biệt màn listing dùng `ListPage`) **khai báo const trước, rồi mới truyền vào props**. Không viết literal hay function trực tiếp trong JSX:

```tsx
const STATUS_OPTIONS = [{ label: 'Tất cả', value: 'ALL' }, ...]   // tĩnh → ngoài component

export default function XxxPage() {
  ...
  const closeModal = () => setModal(null)
  const handleRetry = () => refetch()
  const rowKey = (x: Xxx) => x.id
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => setQ(e.currentTarget.value)

  const primaryAction = { label: 'Thêm …', onClick: openCreate }
  const filters = (<>…</>)
  const rowActions = (x: Xxx) => [{ label: 'Sửa', onClick: … }]
  const columns: DataTableColumn<Xxx>[] = [ … render: (x) => <RowActions items={rowActions(x)} /> ]
  const rowProps = (x: Xxx) => ({ … })
  const empty = filtered ? <EmptyState … /> : <EmptyState … />

  return <ListPage primaryAction={primaryAction} filters={filters} columns={columns} rowKey={rowKey} rowProps={rowProps} onRetry={handleRetry} empty={empty} … />
}
```

- Phải tách ra const: array literal (`columns`, `data` của `SegmentedControl`/`Select`, `items` của `RowActions`), object literal (`primaryAction`), khối JSX nhiều dòng / nhiều element (`filters`, `empty`, `actions`, `description` dạng fragment).
- **Mọi function truyền vào prop** (`onClick`, `onChange`, `onClose`, `onConfirm`, `onRetry`, `onSaved`, `rowKey`, `rowProps`…) phải là const đặt tên, kể cả một dòng: `onClose={closeModal}`, không `onClose={() => setModal(null)}`. Đặt tên theo hành động (`openCreate`, `closeModal`, `goIntake`, `confirmDisable`) hoặc `handleXxx` cho event (`handleSearchChange`, `handleStatusChange`, `handleRetry`).
  - Handler cần cho nhánh early-return (VD nút Thử lại khi lỗi tải) → khai báo trước `if (isLoading)`.
  - Ngoại lệ duy nhất: trong `render` của cột / callback `.map`, khi cần biến của dòng → gọi handler đã đặt tên: `onClick={() => openDetail(c)}`. Không viết logic trong closure đó.
- Được viết thẳng: giá trị đơn (string, number, boolean, ternary giữa các giá trị đơn), một element ngắn (`actions={<DashboardToolbar />}`, `icon={<LuSearch size={16} />}`), tham chiếu tới biến / function có sẵn (`onPageChange={setPage}`, `onClick={openCreate}`).
- Không phụ thuộc state/props → đặt ngoài component, tên `UPPER_SNAKE_CASE` (`STATUS_OPTIONS`); phụ thuộc → đặt trong component, ngay trước `return`, tên camelCase trùng tên prop (`filters`, `columns`, `empty`, `rowKey`). Trùng tên với biến khác thì thêm tiền tố (`headerActions`, `headerDescription`).
- Mẫu: `UsersPage`, `CustomersPage`, `OrdersPage`, `ServicesPage`.

## Tách khối JSX dài trước `return`

- JSX trả về của một component **quá ~80 dòng** → tách từng khối có nghĩa thành const đặt ngay trước `return`, để `return` chỉ còn bộ khung bố cục đọc được trong một màn hình.
- Đặt tên theo nội dung khối, camelCase: `customerFields`, `orderSummary`, `saveActions`, `receiptPreview`, `dialogs`. Nhiều element ngang hàng → bọc fragment `<>…</>`; khối điều kiện → const giữ cả biểu thức (`const conditionNotes = items.map(…)`), trong JSX chỉ còn `{conditionNotes}`.
- Mỗi const vẫn dài (> ~80 dòng) hoặc có state / handler riêng → tách thành component con trong cùng file hoặc file mới.
- Mẫu: `ClassifyEditor`, `IntakeForm`, `ItemLineEditor`, `OrderItemsCard`, `DesignSystemPage`.

## Validate form

Mọi form phải báo lỗi **cùng một kiểu**: chữ đỏ ngay dưới ô (lỗi của Mantine). Không để popup validate mặc định của trình duyệt ("Vui lòng điền vào trường này") hiện ra.

- Thẻ `<form>` luôn có `noValidate`: `<form onSubmit={form.onSubmit(...)} noValidate>`. Prop `required` trên input chỉ để hiện dấu `*`; còn luật bắt buộc nằm ở schema zod / hàm `validate`.
- Không dùng `pattern`, `minLength`, `type="email"`… để chặn submit; đưa luật vào schema để lỗi hiện đúng chỗ, đúng câu tiếng Việt.
- Form không bọc `<form>` (gọi `form.onSubmit(handler)()` từ nút) thì không cần `noValidate`, nhưng vẫn phải validate qua `useForm`.
- Lỗi từ BE: field error → `form.setErrors` (map tên field BE sang tên field form nếu khác), lỗi chung → `notify.error`.

## Quản lý state

| Loại state | Giữ ở đâu | Ví dụ |
|---|---|---|
| Dữ liệu từ backend | TanStack Query (`useQuery` / `useMutation` trong `features/<x>/application`). Không copy vào zustand hay `useState` | `useCustomers`, `useServices` |
| Bộ lọc / tìm kiếm / trang của màn danh sách | URL, qua hook `useListParams(STATUSES)` (`shared/hooks`): `q` (ô gõ), `search` (đã debounce), `status`, `page`, `filtered`, `reset`. Không tự viết lại `useSearchParams` cho việc này | `CustomersPage`, `UsersPage`, `ServicesPage` |
| Trạng thái UI của một component / page (mở modal, dòng đang sửa, tab) | `useState` trong page; nhiều modal → một union `ModalState` | `ServicesPage` |
| Giá trị form | `@mantine/form` `useForm` + `validate: schemaResolver(xxxFormSchema, { sync: true })`, schema zod đặt ở `features/<x>/application/schemas.ts`; modal remount khi mở (`{opened && <Form/>}`); `isDirty` → `ConfirmModal` "Bỏ thay đổi?" | `ServiceFormModal` |
| State chia sẻ giữa các component trong **một page** | React context (`createContext` + `useContext`) đặt cạnh page | `DashboardPageContext` |
| State dùng chung toàn app, không đến từ backend | zustand: `shared/store` (UI) hoặc `features/<x>/application` (theo feature) | `useUiStore`, `useAuthStore` |

- **Context trong page** (theo mẫu `pages/<page>/<Page>Context.tsx`):
  - Provider bọc nội dung page; `value` bọc `useMemo`.
  - Export hook `use<Page>()` dùng `useContext` và `throw` khi gọi ngoài Provider; component con dùng hook này, không gọi `useContext` trực tiếp.
  - Chỉ chứa state UI của page đó. Dữ liệu backend vẫn lấy bằng Query hook, không nhét vào context.
  - Dùng khi có từ 2 component con trở lên cần chung state; chỉ cha–con một tầng thì truyền props.
- **Query**:
  - Mỗi feature có `queryKeys.ts` dạng factory `xxxKeys.all / list(params) / detail(id)`.
  - Mutation thành công → `invalidateQueries({ queryKey: xxxKeys.all })`; không tự sửa cache bằng tay khi không cần.
  - Danh sách phân trang dùng `placeholderData: (prev) => prev`.
  - Lỗi: field error → `form.setErrors`, còn lại → `notify.error`; 403 đã có toast chung ở `queryClient`.
- **zustand**:
  - Luôn đọc qua selector từng phần (`useAuthStore((s) => s.status)`), không lấy cả store.
  - Chỉ `persist` tùy chọn giao diện. **Không persist token hay dữ liệu nhạy cảm**: token giữ trong bộ nhớ, khôi phục bằng refresh cookie.
- **Không tạo global store mới** khi `useState`, context của page, URL hoặc Query đã đủ. Cần store mới thì nêu lý do trong `plan.md` của feature.
- **Không lưu giá trị suy ra được** vào state (VD `activeCount`, `total`): tính lúc render.
- **Đổi bộ lọc / từ khóa** → đưa trang về 1.
