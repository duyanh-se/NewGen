// Construction types and equipment: supplied NewGen profile, PDF pages 14–15.
// Illustrations also use supplied Centa photos and Vinhomes Smart City imagery.
export const constructionTypes = [
  { name: "Chung cư", image: "vinhomes-smart-city" },
  { name: "Nhà xưởng", image: "pic24" },
  { name: "Văn phòng", image: "office3" },
  { name: "Trường học", image: "pic27" },
  { name: "Nhà phố shophouse", image: "centa2" },
  { name: "Villa", image: "pic26" },
  { name: "Nhà ở tư nhân", image: "centa3" },
  { name: "Nhà phố liền kề", image: "pic29" },
] as const;

export const equipmentGroups = [
  {
    name: "Thiết bị thi công",
    items: [
      { name: "Ô tô con 5 chỗ", count: 3 },
      { name: "Ô tô tải 10 tấn", count: 5 },
      { name: "Ô tô tải 1,5 tấn", count: 5 },
      { name: "Xe tưới nước 13 m³", count: 2 },
      { name: "Máy xúc, đào", count: 2 },
      { name: "Máy lu", count: 2 },
      { name: "Máy ủi", count: 2 },
      { name: "Vận thăng", count: 2 },
      { name: "Đầm dùi", count: 4 },
      { name: "Đầm bàn", count: 3 },
      { name: "Đầm cóc", count: 2 },
      { name: "Máy hàn", count: 5 },
      { name: "Máy bơm nước", count: 3 },
      { name: "Máy trộn bê tông 250 lít", count: 4 },
      { name: "Máy cắt cỏ HONDA GX35", count: 3 },
      { name: "Máy bơm nước 55 m³/h", count: 4 },
      { name: "Cưa máy", count: 6 },
      { name: "Máy cắt gạch, cắt sắt", count: 5 },
      { name: "Máy toàn đạc", count: 1 },
    ].map(item => ({ ...item, note: "Chất lượng tốt" })),
  },
];

export const equipmentPhotos = [
  { name: "Cẩu tự hành", image: "pic34" },
  { name: "Cần trục tháp", image: "pic31" },
  { name: "Xe trộn bê tông", image: "pic32" },
  { name: "Cần cẩu bánh xích", image: "pic35" },
  { name: "Máy ủi bánh xích", image: "pic36" },
  { name: "Máy đầm bê tông", image: "pic37" },
  { name: "Vận thăng", image: "pic38" },
  { name: "Máy xúc", image: "pic39" },
  { name: "Máy cắt", image: "machine-cut" },
  { name: "Xe lu", image: "pic41" },
  { name: "Giàn giáo", image: "pic42" },
  { name: "Máy sàng", image: "pic40" },
] as const;
