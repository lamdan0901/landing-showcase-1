# Landing Pages 01

Ba landing page độc lập bằng HTML, CSS và JavaScript. Toàn bộ nội dung bằng tiếng Việt.

| Trang | Ngành | Phong cách |
| --- | --- | --- |
| `index.html` | Trang chọn mẫu | Bộ sưu tập với ảnh xem trước |
| `moc.html` | Nội thất & thiết kế không gian | Thanh lịch, kem và xanh olive, serif, ảnh lớn |
| `volt.html` | Studio thương hiệu & trải nghiệm số | Đen và xanh acid, typography mạnh, quỹ đạo chuyển động |
| `nep.html` | Cà phê Việt | Đỏ gạch, giấy kem, minh họa bao bì và chất hoài niệm |

## Mở trang

Mở trực tiếp `index.html` bằng trình duyệt. Không cần cài package, build hoặc kết nối internet. Ảnh và font nằm trong `assets/`.

Hoặc chạy từ thư mục này:

```sh
python -m http.server 4177 --bind 127.0.0.1
```

Mở `http://127.0.0.1:4177`.

## Tương tác

- Menu mobile, liên kết cuộn đến từng phần và hiệu ứng xuất hiện khi cuộn.
- Nội dung, điều hướng và nút từ 16px; nhãn phụ từ 14px, giữ cỡ chữ trên desktop và mobile.
- Mộc: lọc bộ sưu tập theo loại, mở form tư vấn từng sản phẩm.
- VOLT: quỹ đạo phản ứng với chuột, marquee, xem chi tiết dự án và mở từng dịch vụ.
- Nếp: minh họa cà phê chuyển động, chọn gu và hướng dẫn pha phin.
- Form tư vấn có kiểm tra tên, email và lời nhắn; chỉ hiển thị bản xem thử. Không gửi, lưu hoặc truyền dữ liệu.
- Hộp thoại hỗ trợ Escape, giữ focus và trả focus về nút mở. Chuyển động tắt khi người dùng chọn `prefers-reduced-motion`.

## Kiểm tra

```sh
node --check shared.js
node check.mjs
```

`check.mjs` kiểm tra tài nguyên, liên kết, ID, tiêu đề, văn bản thay thế và tham chiếu tương tác.

Kiểm tra trình duyệt tùy chọn cần Playwright được cài riêng và server đang chạy. Trong PowerShell, đặt đường dẫn package Playwright nếu package không có trong môi trường hiện tại:

```powershell
$env:PLAYWRIGHT_PATH = 'C:\path\to\node_modules\playwright'
node browser-check.mjs
```

Kiểm tra trình duyệt xác nhận cỡ chữ thực tế, bố cục từ 320px đến 1440px, menu, form, bộ lọc và giảm chuyển động. Chạy `node browser-check.mjs --screenshots` để tạo lại ảnh xem trước và ảnh mobile trong `previews/`.

## Chỉnh sửa

Mỗi mẫu có file HTML và CSS riêng. `shared.css` chứa font, hộp thoại và các quy tắc dùng chung. `shared.js` xử lý tương tác. Không dùng framework hoặc thư viện ở runtime; không tham chiếu mã hay API của dự án cha.

Các thương hiệu, sản phẩm và dự án là ý tưởng minh họa. Cần nối form với dịch vụ thực trước khi dùng cho doanh nghiệp thật.

Ảnh: [Unsplash](https://unsplash.com), các URL nguồn trong `assets/SOURCES.md`. Font: Manrope và Playfair Display, tải từ Google Fonts; giấy phép đi kèm trong `assets/`. Minh họa SVG và đồ họa CSS được tạo cho bộ sưu tập này.
