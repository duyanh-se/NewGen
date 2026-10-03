# NewGen Construction

Landing page tiếng Việt, Next.js App Router + Tailwind CSS + ShadcnUI (Base UI).

## Chạy trên máy

```sh
npm install
npm run dev
```

Mở http://localhost:3000.

## Xuất bản tĩnh

```sh
npm run build
```

Thư mục `out/` là bản website tĩnh. Cấu hình `output: export` không sử dụng `next start`.

## Nội dung và hình ảnh

- Nguồn: `../pics/Newgen Profile_file xem_3.pdf` và ảnh trong `../pics`.
- Nội dung trang: `src/app/page.tsx`.
- Theme NewGen: `src/app/brand.css`; styles nền Shadcn: `src/app/globals.css`.
- Ảnh đã tối ưu: `public/images/`.
- Thông tin doanh nghiệp lấy từ phần giới thiệu hồ sơ; không đưa tài liệu hợp đồng, chữ ký và thông tin tài khoản vào website.
- 36 cán bộ chuyên môn là tổng số nhân sự trong bảng ở trang PDF 13 (trang in 24–25). Vốn điều lệ lấy từ trang PDF 3. Thông tin phản ánh hồ sơ được cung cấp.
- Dự án Đồng Đăng: PDF 18; 31 căn nhà Hà Nam: PDF 21; Hoa Đất 3: PDF 22. Đối tác: PDF 117.
- Nút gọi/email mở ứng dụng tương ứng của khách truy cập. Không có biểu mẫu gửi dữ liệu hoặc backend.
