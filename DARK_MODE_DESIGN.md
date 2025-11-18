# Tổng Quan Thiết Kế Dark Mode

Hệ thống Dark Mode được xây dựng xoay quanh một context toàn cục (quản lý trạng thái theme), các style token (CSS variables) và những component UI đọc trạng thái đó để đổi màu động. Phần dưới mô tả từng tệp liên quan.

## `src/contexts/ThemeContext.js`
- **Mục đích**: Cung cấp context lưu theme (`light`/`dark`), đồng bộ với `localStorage` và cập nhật attribute `data-theme` trên `<html>`.
- **Nội dung chính**:
  - Khởi tạo state `theme` từ `localStorage` (mặc định `light`).
  - `useEffect` áp dụng thuộc tính `data-theme` và class `dark` lên `document.documentElement` mỗi khi theme đổi.
  - Hàm `toggleTheme` đảo giá trị giữa `light` và `dark`.
  - Trả về `{ theme, toggleTheme, isDark }` qua `ThemeContext`.
- **Mối liên hệ**:
  - Được bọc quanh toàn bộ app trong `src/index.js`.
  - Những component như `App`, `Sidebar`, `Dashboard`, `DashboardCard`, `ThemeToggle` gọi `useTheme()` để lấy trạng thái/theme.
- **Ví dụ**:
  ```pseudo
  const [theme, setTheme] = useState(localStorage.theme ?? 'light')
  useEffect(() => {
      document.documentElement.dataset.theme = theme
      document.documentElement.classList.toggle('dark', theme === 'dark')
      localStorage.theme = theme
  }, [theme])
  ```

## `src/components/ThemeToggle/ThemeToggle.js`
- **Mục đích**: Nút chuyển đổi giao diện sáng/tối đặt cố định trên layout.
- **Nội dung chính**:
  - Lấy `theme`, `toggleTheme`, `isDark` từ context.
  - Hiển thị hai icon `LightModeIcon` và `DarkModeIcon` chồng nhau, animate opacity/scale khi chuyển.
  - Nút tròn có hiệu ứng hover và `aria-label` thân thiện truy cập.
- **Mối liên hệ**:
  - Được render trong `App.js` (góc trên bên phải) khi user đã đăng nhập.
  - Mỗi lần click gọi `toggleTheme` của context, kéo theo cập nhật toàn bộ UI.

## `src/styles/design-system.css`
- **Mục đích**: Định nghĩa hệ thống token (màu sắc, typography, spacing, bóng...) dùng chung cho cả hai chế độ.
- **Nội dung chính**:
  - `:root` khai báo color palette, background/text tokens cho light mode.
  - `[data-theme="dark"]` override lại các biến: nền tối hơn, text sáng, shadow sâu.
  - Định nghĩa font, size, spacing, border radius, transition, utility (`glass-effect-modern`, `.btn-*`, `.card`, v.v.).
- **Mối liên hệ**:
  - Được import trong `src/index.js` để sẵn cho toàn ứng dụng.
  - Các component chỉ cần dùng `var(--bg-primary)`... sẽ tự đổi theo theme nhờ thuộc tính `data-theme` mà `ThemeContext` set.

## `src/index.css`
- **Mục đích**: Áp dụng base styles và điều chỉnh một số hiệu ứng phụ thuộc theme.
- **Nội dung chính**:
  - Set `body` sử dụng `var(--font-family)` và `var(--bg-secondary)`/`var(--text-primary)` (=> tự đổi theo theme).
  - Thêm version dark cho `.glass-effect`.
- **Mối liên hệ**:
  - Được import trước `App`.
  - Kết hợp với `design-system.css` để bảo toàn token khi chuyển đổi.

## `src/index.js`
- **Mục đích**: Điểm vào React, nơi ghép `ThemeProvider` vào cây component để toàn app dùng được dark mode.
- **Nội dung chính**:
  - Import CSS/token.
  - Bao `App` trong `<ThemeProvider>` và `<BrowserRouter>`.
- **Mối liên hệ**:
  - Nếu bỏ `ThemeProvider`, `useTheme` sẽ lỗi → mọi thành phần phụ thuộc dark mode đều dựa vào file này.

## `src/App.js`
- **Mục đích**: Áp dụng theme ở cấp layout và truyền trải nghiệm người dùng.
- **Nội dung chính**:
  - Lấy `theme` từ context để chọn gradient nền (`backgroundClass`).
  - Render `ThemeToggle` khi đăng nhập.
  - `ToastContainer` nhận prop `theme` và màu progress bar khác nhau.
- **Mối liên hệ**:
  - `ThemeToggle` bố trí trong `App`.
  - Background gradient giúp toàn bộ area chính chuyển màu mềm mại khi `theme` đổi.

## `src/components/Sidebar/Sidebar.js`
- **Mục đích**: Sidebar điều hướng, đổi màu theo chế độ giúp đồng nhất trải nghiệm.
- **Nội dung chính**:
  - `sidebarBg`, màu chữ, border, hover trạng thái logout button… đều chọn theo `theme`.
  - Avatar border, text greeting chuyển màu dùng class `dark:` hoặc điều kiện JS.
- **Mối liên hệ**:
  - Sử dụng `useTheme`.
  - Là ví dụ rõ ràng cho cách component đọc theme rồi chọn class Tailwind tương ứng.

## `src/Pages/Dashboard/Dashboard.js`
- **Mục đích**: Trang tổng quan đọc `theme` để thay đổi màu chữ/ mô tả.
- **Nội dung chính**:
  - `div` bao ngoài áp dụng `text-white` hay `text-slate-800`, headline/paragraph đổi màu bằng template literal.
- **Mối liên hệ**:
  - Đặt trong layout `App`, hiển thị cùng gradient nền.
  - Gọi `DashboardCard` (xem phía dưới) vốn cũng aware theme → cả grid đồng bộ.

## `src/Pages/Dashboard/DashboardCard.js`
- **Mục đích**: Card thống kê dynamic theo theme.
- **Nội dung chính**:
  - `cardBg` và `hoverEffect` dùng điều kiện `theme === 'dark'`.
  - Văn bản chọn `text-white` hay `text-slate-800`.
- **Mối liên hệ**:
  - Được dùng nhiều lần trong `Dashboard`.
  - Cho thấy pattern “component đọc theme rồi đổi class” có thể tái sử dụng cho card khác.

---

### Luồng hoạt động tổng quát
1. `ThemeProvider` lưu trạng thái và áp dụng `data-theme` vào DOM.
2. `design-system.css` & `index.css` sử dụng các biến CSS nên nền/tông màu đổi tự động.
3. UI components (Sidebar, Dashboard, DashboardCard, ToastContainer…) đọc `theme` qua `useTheme` để chọn class Tailwind/phản hồi.
4. `ThemeToggle` cung cấp nút đổi theme, gọi `toggleTheme` → state cập nhật → `useEffect` trong `ThemeProvider` kích hoạt → giao diện chuyển sáng/tối mượt mà.

