export const company = {
  name: "CÔNG TY CỔ PHẦN ĐẦU TƯ XÂY DỰNG NEWGEN",
  taxId: "2301262147",
  capital: "10 tỷ đồng",
  phone: "0967 779 137",
  phoneHref: "tel:0967779137",
  email: "newgenconstruction.hz@gmail.com",
  address:
    "Số 39, Ngõ 36 Đường Khuyến Lương, Phường Lĩnh Nam, Thành phố Hà Nội",
  office:
    "Căn SH1 - 29 KĐT Centa Dianmond Đại Đồng, Phù Chẩn, Từ Sơn, Bắc Ninh",
};

// Project identities and photo groups verified against PDF pages 17, 18, 21, 22.
export const projects = [
  {
    name: "Khu dân cư Hoa Đất 3",
    slug: "khu-dan-cu-hoa-dat-3",
    gallery: ["pic71", "pic72"],
    scope:
      "Các lô LK-A83+86, LK-A89-90, LK-A93-94, LK-A97-98, SL-A16-17 và SL-A20+21 thuộc quy hoạch chi tiết Khu đô thị và Dịch vụ VSIP Bắc Ninh.",
    location: "VSIP Bắc Ninh",
    image: "pic71",
    type: "Nhà ở & đô thị",
    owner: "Công ty Cổ phần Bất động sản Hoa Đất",
    description:
      "Các lô nhà ở thuộc quy hoạch chi tiết Khu đô thị và Dịch vụ VSIP Bắc Ninh. Một trong những dự án tiêu biểu được giới thiệu trong hồ sơ năng lực NewGen.",
  },
  {
    name: "Khu nhà ở cao cấp Đồng Đăng",
    slug: "khu-nha-o-cao-cap-dong-dang",
    gallery: ["pic50", "pic51", "pic52", "pic53", "pic54"],
    scope:
      "Công trình nhà ở cao cấp tại đường Trần Quốc Toản, thị trấn Đồng Đăng, huyện Cao Lộc, tỉnh Lạng Sơn. Hồ sơ giới thiệu hình ảnh thi công kết cấu và hoàn thiện tại công trình.",
    location: "Lạng Sơn",
    image: "pic50",
    type: "Nhà ở & đô thị",
    owner: "",
    description:
      "Dự án tại đường Trần Quốc Toản, thị trấn Đồng Đăng, huyện Cao Lộc, tỉnh Lạng Sơn. Hình ảnh ghi lại công trình trong quá trình thi công và hoàn thiện.",
  },
  {
    name: "Kết cấu & hoàn thiện 31 căn nhà",
    slug: "31-can-nha-ha-nam",
    gallery: ["pic66", "pic67", "pic68", "pic69", "pic70"],
    scope:
      "Thi công kết cấu và hoàn thiện mặt ngoài 31 căn nhà ở thấp tầng tại các lô LK9, LK19, LK20, LK25, LK26 (XL11).",
    location: "Hà Nam",
    image: "pic66",
    type: "Thi công & hoàn thiện",
    owner: "Công ty CP Đầu tư Đô thị và Khu công nghiệp Sông Đà 7",
    description:
      "Thi công kết cấu và hoàn thiện mặt ngoài 31 căn nhà ở thấp tầng tại các lô LK9, LK19, LK20, LK25, LK26 (XL11).",
  },
  {
    name: "Lắp đặt điện nước tại Bắc Ninh",
    slug: "lap-dat-dien-nuoc-bac-ninh",
    location: "Bắc Ninh",
    image: "pic44",
    type: "Điện nước & dịch vụ",
    owner: "Công ty Cổ phần BĐS Việt Nhân Bắc Ninh",
    description:
      "Xây dựng, lắp đặt điện nước và các dịch vụ khác tại Bắc Ninh, được giới thiệu trong hồ sơ năng lực NewGen.",
    scope:
      "Xây dựng, lắp đặt điện nước và các dịch vụ khác cho công trình của Công ty Cổ phần BĐS Việt Nhân Bắc Ninh.",
    gallery: ["pic44", "pic45", "pic46", "pic47", "pic48"],
  },
];
export const leaders = [
  {
    name: "Nguyễn Tuấn Huy",
    role: "Chủ tịch Hội đồng Quản trị",
    summary:
      "Từng điều hành hoạt động sản xuất - kinh doanh, quản lý nhân sự, tài chính và tiến độ dự án. Hiện định hướng tầm nhìn, chiến lược phát triển bền vững, mở rộng hợp tác và thị trường cho NEWGEN.",
    qualification: "Cử nhân Luật Kinh tế",
    image: "ceo1",
  },
  {
    name: "Nguyễn Văn Tuệ",
    role: "Tổng Giám đốc",
    summary:
      "Kỹ sư xây dựng với kinh nghiệm quản lý dự án từ hạ tầng giao thông đến khu đô thị, thương mại và nghỉ dưỡng. Từng đảm nhiệm vai trò Giám đốc dự án, Chỉ huy trưởng và Giám đốc.",
    qualification: "Kỹ sư Xây dựng dân dụng và công nghiệp",
    image: "ceo2",
  },
];
export const services = [
  {
    name: "Xây dựng dân dụng",
    image: "pic29",
    text: "Thiết kế, xây dựng và hoàn thiện các công trình dân dụng như nhà, văn phòng, khu ký túc xá và nhiều dự án dân dụng khác.",
    tags: "Nhà ở · Văn phòng · Ký túc xá",
  },
  {
    name: "Xây dựng công nghiệp",
    image: "pic24",
    text: "Thiết kế, xây dựng và hoàn thiện các công trình công nghiệp có chất lượng và giá trị bền vững.",
    tags: "Nhà xưởng · Kết cấu · Cơ khí",
  },
  {
    name: "Hạ tầng kỹ thuật",
    image: "pic56",
    text: "Xây dựng các công trình hạ tầng kỹ thuật, giao thông đáp ứng nhu cầu khách hàng và sự phát triển chung của cộng đồng.",
    tags: "Giao thông · Điện · Cấp thoát nước",
  },
  {
    name: "Công trình thủy lợi",
    image: "pic61",
    text: "Xây dựng các công trình thủy lợi, xử lý và thoát nước thải để đảm bảo đáp ứng xả thải theo quy định nhà nước",
    tags: "Thủy lợi · Xử lý thải · Hoàn thiện",
  },
];

// PDF page 13, printed pages 24–25. Figures describe the supplied profile.
export const personnel = [
  { name: "Kỹ sư xây dựng", count: 15, years: "3–15" },
  { name: "Kỹ sư cầu, đường", count: 5, years: "4–15" },
  { name: "Kiến trúc sư", count: 3, years: "5–15" },
  { name: "Kỹ sư cấp thoát nước", count: 2, years: "3–15" },
  { name: "Kỹ sư điện", count: 2, years: "2–10" },
  { name: "Khảo sát trắc địa, địa chất công trình", count: 4, years: "3–10" },
  { name: "Các chuyên ngành khác", count: 5, years: "2–8" },
];
export const personnelTotal = personnel.reduce(
  (total, item) => total + item.count,
  0,
);

