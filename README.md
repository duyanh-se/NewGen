# NewGen Construction

Website tiếng Việt, Next.js App Router + Tailwind CSS + ShadcnUI (Base UI).

## Backend và quản trị

Hướng dẫn thiết lập Supabase, cấp admin, nhập dự án, sao lưu/khôi phục và kiểm thử: [docs/backend.md](docs/backend.md). Sao chép `.env.example` thành `.env.local` trước khi kết nối. Admin: `/admin/login`.

## Các trang và điều hướng

- Landing page `/` giữ nguyên các section, intro, hiệu ứng cuộn và popup dự án.
- Navbar/menu và CTA dùng route `/gioi-thieu`, `/nang-luc-xay-dung`, `/du-an`, `/lien-he`. Route `/linh-vuc` chuyển tiếp bằng JavaScript sang `/nang-luc-xay-dung`, giữ query/hash và có liên kết dự phòng khi tắt JavaScript.
- Các trang `/du-an/[slug]` đọc nội dung đã xuất bản từ Supabase; slug không có hoặc chưa xuất bản trả về 404. Blog dùng `/blog` và `/blog/[slug]`.
- `src/app/(pages)/` chứa các trang con và layout chung, không gắn hiệu ứng cuộn của landing page.
- `src/lib/company.ts` giữ thông tin doanh nghiệp, lãnh đạo, lĩnh vực, nhân sự và nguồn nhập bốn dự án ban đầu. Các trang dự án công khai dùng database.
- Ảnh dự án được đối chiếu PDF: trang 17 → pic44–48; trang 18 → pic50–54; trang 21 → pic66–70; trang 22 → pic71–72. Không dùng ảnh minh họa để gán thêm công trình.
- Thông tin lãnh đạo và văn phòng đại diện giữ theo nội dung hiện có của website. Nhân sự và thiết bị phản ánh hồ sơ được cung cấp, không phải số liệu cập nhật theo thời gian thực.
## Chạy trên máy

```sh
npm install
npm run dev
```

Mở http://localhost:3000.

## Build server

Trang `/nang-luc-xay-dung` giới thiệu 8 loại công trình, 22 dòng thiết bị và 12 ảnh máy móc theo PDF trang 14–15 (trang in 26–29). Ảnh máy cắt được trích từ PDF gốc. Hero chuyển cảnh theo cuộn trên desktop; mobile và reduced motion dùng bố cục tĩnh. Mục lục ghim dưới header, không chặn cuộn trang.

```sh
npm run build
```

Bản backend dùng `npm start` sau khi build; không dùng thư mục `out/` cũ.

## Nội dung và hình ảnh

- Nguồn: `../pics/Newgen Profile_file xem_3.pdf` và ảnh trong `../pics`.
- Nội dung trang: `src/app/page.tsx`.
- Theme NewGen: `src/app/brand.css`; styles nền Shadcn: `src/app/globals.css`.
- Ảnh đã tối ưu: `public/images/`.
- Thông tin doanh nghiệp lấy từ phần giới thiệu hồ sơ; không đưa tài liệu hợp đồng, chữ ký và thông tin tài khoản vào website.
- Trang `/gioi-thieu` có 5 section cao tối thiểu bằng vùng màn hình dưới header; trên màn hình nhỏ, nội dung mở rộng và cuộn thông thường. CSS riêng nằm trong `src/app/(pages)/gioi-thieu/about.module.css`.
- `about-motion.tsx` điều khiển hiệu ứng xuất hiện theo thứ tự đọc, zoom nhẹ ảnh nền và snap giữa 5 section trên desktop. Cooldown cố định cho phép cuộn touchpad liên tục; section dài và footer cuộn thông thường. Mobile, thao tác touch và reduced motion không bị giữ cuộn; listener và animation frame được dọn khi rời trang.
- Nút tải hồ sơ dùng `public/documents/newgen-ho-so-doanh-nghiep.pdf`: bản công khai gồm trang PDF gốc 1, 3, 4, 5, 6, 13, 15, 16, 17, 18, 21, 22. Các trang đã được kiểm tra trực quan và xuất thành ảnh trong PDF mới, không chứa đối tượng ẩn, tệp đính kèm, hồ sơ pháp lý hay hợp đồng của bản gốc.
- 36 cán bộ chuyên môn là tổng số nhân sự trong bảng ở trang PDF 13 (trang in 24–25). Vốn điều lệ lấy từ trang PDF 3. Thông tin phản ánh hồ sơ được cung cấp.
- Dự án Đồng Đăng: PDF 18; 31 căn nhà Hà Nam: PDF 21; Hoa Đất 3: PDF 22. Đối tác: PDF 117.
- Nút gọi/email mở ứng dụng tương ứng của khách truy cập. Backend Supabase quản lý công trình, blog, tài khoản admin và ảnh.

## Storytelling và thư viện ảnh

- `src/components/story/data.ts`: phân nhóm toàn bộ 87 ảnh được duyệt (74 pic, 3 office, 9 partner, 1 logo). Loại cert, contract, report, PDF và AI.
- `src/components/story/experience.tsx`: ghép logo gốc bằng SVG clip, xuất hiện theo cuộn, ba chương ảnh chạy theo vị trí cuộn, thư viện vuốt ngang với lightbox, dải đối tác chạy liên tục.
- `src/app/story.css`: chuyển động và responsive bổ sung, giữ nguyên theme NewGen.
- Logo giữ nguyên hình gốc, không vẽ lại nhận diện. Các nhóm ảnh minh họa không được gắn tên dự án chưa xác minh.
- 77 thumbnail giúp giảm tải thư viện; ảnh lớn chỉ dùng khi mở lightbox. Mỗi ảnh trong pics có bản WebP tương ứng.
- Nút “Dừng chuyển động” chuyển phần kể chuyện về bố cục tĩnh. `prefers-reduced-motion` được tôn trọng. Mobile dùng các chương ảnh theo chiều dọc, không chiếm cuộn trang.
- Dải đối tác dừng khi hover, nhận focus, tab bị ẩn hoặc khi người dùng tắt chuyển động.
- Đã kiểm tra build/TypeScript, độ phủ 87/87 ảnh, 1440/768/390px, rail, lightbox, Escape/phím mũi tên, reduced motion và scroll animation; không có lỗi JavaScript.
## H?nh ?nh v? chuy?n ??ng

Gi? c?c section ban ??u: Hero, gi?i thi?u, l?nh v?c ho?t ??ng, d? ?n, n?ng l?c, ??i t?c, FAQ v? li?n h?. ?nh v?n ph?ng l?ng trong gi?i thi?u; ?nh d?ch v? l?ng v?o th? l?nh v?c. Kh?ng c? section c?u chuy?n, h?nh tr?nh hay th? vi?n ri?ng.

Chuy?n ??ng xu?t hi?n khi cu?n v? carousel ??i t?c gi? trong c?c section c?; h? tr? gi?m chuy?n ??ng theo thi?t b?. Carousel c? n?t d?ng v? ti?p t?c.

## Phần nền tảng tương tác

Dải số liệu cũ được thay bằng `FoundationStory` độc lập sau Hero theo yêu cầu mới. Ba bước do người xem chủ động chọn, có chuyển cảnh ảnh và nội dung; không tự động chuyển khi đang đọc. Nút chi tiết mở bảng nhân sự hoặc bốn nhóm lĩnh vực.

Nguồn: vốn điều lệ ở PDF trang 3 (trang in 04); nhân sự PDF trang 13 (trang in 24), đối chiếu trực quan để giữ đúng nhóm khảo sát 4 người / 3–10 năm và nhóm khác 5 người / 2–8 năm; bốn nhóm lĩnh vực theo Thư ngỏ PDF trang 2 (trang in 03). Không đồng nhất “4 nhóm được giới thiệu” với toàn bộ ngành nghề đăng ký.

Đã kiểm tra 1440/768/390px, tổng nhân sự 36, đủ bốn lĩnh vực, mở/đóng chi tiết, điều hướng tab bằng bàn phím và reduced motion.
