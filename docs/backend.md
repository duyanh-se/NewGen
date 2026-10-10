# Backend công trình và blog

## Chuẩn bị Supabase

1. Tạo một project Supabase thử nghiệm. Chọn region gần người dùng; ưu tiên Singapore nếu có.
2. Mở SQL Editor, chạy toàn bộ `supabase/migrations/202610080001_content.sql` một lần. Migration tạo bảng, index, RLS, các hàm lưu công trình/xóa ảnh và bucket `content-images`.
3. Trong Authentication → cấu hình đăng ký, tắt **Allow new users to sign up**. Không có trang đăng ký trong ứng dụng; việc tắt đăng ký tại Supabase cũng ngăn gọi trực tiếp Auth API.
4. Trong Authentication → Users, tạo người dùng email/password, xác nhận email. Sao chép UUID của người dùng và chạy:

```sql
insert into public.admin_users(user_id) values ('UUID_CUA_ADMIN');
```

Mỗi admin có cùng quyền. Người dùng không thể tự thêm vào bảng này. Để thu hồi quyền, xóa đúng dòng `admin_users` trong dashboard; ứng dụng kiểm tra quyền mỗi thao tác.

5. Sao chép `.env.example` thành `.env.local` trong thư mục `newgen-web`. Điền URL và publishable key từ mục Connect/API Keys. Khóa `SUPABASE_SERVICE_ROLE_KEY` chỉ cần cho các script; không dùng trong runtime website, không thêm tiền tố NEXT_PUBLIC, không đưa vào Git.
6. Chạy `npm install`, `npm run dev`, mở http://localhost:3000/admin/login. Không có cấu hình Supabase thì admin hiển thị hướng dẫn thiết lập, danh sách công khai hiển thị trạng thái chưa có nội dung.

## Nhập dữ liệu hiện có

```sh
npm run content:seed
```

Script dùng bốn hồ sơ công trình trong `src/lib/company.ts`, xác minh các file WebP trong `public/images`, tải ảnh lên Storage và giữ đúng slug, chủ đầu tư, nhóm ảnh. Không suy đoán diện tích, năm hoặc tình trạng thi công. Slug đã tồn tại được bỏ qua để không ghi đè nội dung admin đã sửa. File seed dùng hash nội dung, không tạo ảnh trùng khi chạy lại. Chưa có bài blog mẫu.

## Quản trị

- `/admin/projects`: tìm kiếm/lọc/phân trang công trình; thêm và chỉnh sửa thông tin, ảnh đại diện, thứ tự thư viện.
- `/admin/posts`: soạn bài blog bằng Tiptap; chọn tác giả và chuyên mục.
- `/admin/categories`: thêm/xóa chuyên mục; chuyên mục có bài viết không được xóa.
- `/admin/media`: tải ảnh, sửa mô tả ảnh và xóa ảnh không được dùng.
- Lưu nháp, xuất bản, gỡ xuất bản và lưu trữ qua biểu mẫu. Ngày xuất bản được ghi ở lần xuất bản đầu tiên và giữ khi chỉnh sửa.
- Xem trước mở nội dung đã lưu, yêu cầu quyền admin, không cache công khai.
- Công khai: `/du-an`, `/du-an/[slug]`, `/blog`, `/blog/[slug]`. Chỉ đọc bản đã xuất bản, kể cả khi khách đang đăng nhập admin.

Ảnh JPEG/PNG/WebP tối đa 5 MB được giải mã và chuyển sang WebP tại server; từ chối file hỏng, ảnh động và ảnh quá 40 triệu pixel. Bucket ảnh công khai: ảnh bản nháp cũng có thể truy cập khi biết URL. Không tải hồ sơ mật vào đây. Nội dung rich text hỗ trợ đoạn văn, tiêu đề H2–H4, chữ đậm/nghiêng/gạch, danh sách, trích dẫn và code; không hỗ trợ HTML tùy ý, liên kết hoặc ảnh nhúng trong editor. Dùng ảnh đại diện/thư viện riêng.

Xóa ảnh có hai bước: database khóa ảnh và kiểm tra tham chiếu, rồi xóa file và metadata. Ảnh đang được dùng trong nháp, lưu trữ hoặc bản xuất bản đều được bảo vệ. Nếu Storage lỗi sau khi đánh dấu xóa, ảnh hiển thị “Đang xóa”; bấm xóa lại để hoàn tất. Không cấp quyền UPDATE trên Storage nên không thể ghi đè file đang dùng.

## Sao lưu và khôi phục

Ngừng biên tập trong lúc backup để các bảng và ảnh nhất quán. Hoàn tất những ảnh đang xóa trước khi chạy.

```sh
npm run content:backup -- backups/thu-nghiem-01
```

Thư mục đích phải chưa tồn tại. Script lưu `manifest.json` với năm bảng nội dung và checksum SHA-256, cùng toàn bộ file ảnh trong `files/`. Đây là sao lưu nội dung của ứng dụng, không phải backup toàn bộ project Supabase: không gồm Auth users, mật khẩu, cấu hình dashboard, quyền hoặc lịch sử migration. Thư mục `backups/` được Git bỏ qua; chép bản sao sang nơi lưu độc lập.

Khôi phục thử trên **project khác có các bảng nội dung trống**, chạy migration trước và đổi kết nối trong `.env.local` sang project đích. Dừng ứng dụng đang chạy khi đổi môi trường. Giữ riêng thông tin kết nối project nguồn.

```sh
npm run content:restore -- backups/thu-nghiem-01
npm run content:restore -- backups/thu-nghiem-01 --confirm
```

Lệnh đầu chỉ kiểm tra manifest, file, checksum và bảng trống; lệnh sau mới upload file và nhập dữ liệu theo thứ tự quan hệ. Không ghi đè file đã có. Nếu quá trình nhập bị ngắt, giữ log và dùng một project thử nghiệm trống khác để thử lại; script không tự xóa dữ liệu còn lại. Tạo/cấp lại tài khoản admin ở project đích. Thời gian cập nhật được database ghi lại khi nhập; ID, slug, ngày xuất bản và thứ tự ảnh được giữ.

Sau khôi phục, mở ít nhất một công trình và một bài blog, đối chiếu nội dung, ngày đăng và thứ tự ảnh. Gỡ xuất bản thử và xác nhận khách không còn thấy bài. Cấu hình project thật trở lại rồi khởi động lại Next.js.

## Kiểm tra

```sh
npm test
npm run typecheck
npm run lint
npm run build
npm start
```

Kiểm thử PostgreSQL dùng PGlite, tạo mô hình Auth/Storage tối thiểu và chạy nguyên migration để kiểm tra RLS, khách/không phải admin, tự cấp quyền, xuất bản/gỡ xuất bản, slug trùng, rollback thư viện, xóa ảnh và khôi phục dữ liệu. Bộ kiểm thử cũng chạy các script seed/backup/restore qua HTTP fixture kết nối PostgreSQL: nhập bốn công trình hai lần không tạo trùng, giữ nội dung đã sửa, đối chiếu file ảnh sau khôi phục và từ chối checksum sai. Đây không thay thế kiểm thử Auth/Storage API thực tế.

Để chạy kiểm thử tích hợp thực tế, dùng project Supabase **thử nghiệm**, điền URL, publishable key và service role key, đặt `RUN_SUPABASE_INTEGRATION=1` trong `.env.local`, rồi chạy `npm run test:integration`. Test tạo hai tài khoản tạm (admin và người thường), nội dung/ảnh có UUID riêng, kiểm tra quyền qua API và dọn đúng các tài nguyên đó khi kết thúc. Nếu chưa bật biến này, test được bỏ qua có chủ đích. Không chạy lên project production.

Kiểm thử giao diện tự động: sau `npm run build`, chạy `npm run test:ui`. Test dùng fixture Supabase giả riêng trên localhost:3105 và Next.js trên localhost:3104, kiểm tra luồng biên tập và lỗi lưu; không xác minh bảo mật của dịch vụ thật. Mặc định dùng Chrome đã cài trên Windows; có thể đặt `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` hoặc cài Chromium của Playwright trên nền tảng khác. Hai cổng phải chưa được dùng. Ảnh chụp desktop/mobile được lưu trong `tmp/`.

Các bước nghiệm thu trực quan: đăng nhập, tạo công trình/bài viết, nhập nội dung có danh sách, chọn/upload ảnh, đổi thứ tự, lưu nháp và mở preview; thử slug trùng/ảnh hỏng; xác nhận biểu mẫu giữ dữ liệu khi lưu lỗi; xuất bản rồi gỡ và xem bằng cửa sổ khách. Kiểm tra màn hình desktop và mobile.

## Chạy production sau giai đoạn thử

Cấu hình `output: export` đã được bỏ vì đăng nhập và cập nhật nội dung cần Next.js server. `npm run build` tạo bản chạy bằng `npm start`; thư mục `out/` cũ không phải bản backend mới. Chưa triển khai hosting công khai. Trước khi vận hành chính thức, chọn gói hosting phù hợp, thiết lập backup định kỳ và theo dõi dung lượng database/Storage trong dashboard.

Tham khảo: [Supabase SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client), [Storage access control](https://supabase.com/docs/guides/storage/security/access-control), [Database backups](https://supabase.com/docs/guides/platform/backups).

Kết quả rà dependency: các cảnh báo audit hiện nằm trong chuỗi công cụ shadcn/eslint-config-next đã có của project. Không tự chạy audit fix --force vì đề xuất thay đổi phiên bản lớn ngoài phạm vi backend.
