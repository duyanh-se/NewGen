import { BriefcaseBusiness, Building2, ClipboardList, Crown, HardHat, Network, Users, Wallet } from "lucide-react";
import { OrganizationStory } from "./organization-story";
import { OrganizationCarousel } from "./organization-carousel";
import organization from "./organization.module.css";

const specialties = [
  ["Kỹ sư xây dựng", 15, "3–15"],
  ["Kỹ sư cầu, đường", 5, "4–15"],
  ["Kiến trúc sư", 3, "5–15"],
  ["Kỹ sư cấp thoát nước", 2, "3–15"],
  ["Kỹ sư điện", 2, "2–10"],
  ["Khảo sát trắc địa, địa chất công trình", 4, "3–10"],
  ["Các chuyên ngành khác", 5, "2–8"],
] as const;

const departments = [
  { name: "Phòng Dự án", icon: ClipboardList },
  { name: "Phòng Kinh tế kỹ thuật", icon: Building2 },
  { name: "Phòng Tài chính kế hoạch", icon: Wallet },
  { name: "Phòng Hành chính nhân sự", icon: Users },
];

const photos = [
  { image: "member1", width: 1280, height: 720, alt: "Các thành viên NewGen và đại biểu chụp ảnh tập thể tại lễ khởi công" },
  { image: "member2", width: 2560, height: 1920, alt: "Đội ngũ và các đại biểu cầm xẻng chuẩn bị nghi thức khởi công" },
  { image: "member3", width: 2560, height: 1920, alt: "Các thành viên đội ngũ đội mũ bảo hộ, tham gia động thổ tại công trường" },
  { image: "member4", width: 1920, height: 2560, alt: "Các thành viên tham gia nghi thức động thổ ngoài trời" },
];

export function OrganizationSection() {
  return (
    <OrganizationStory>
      <div className={organization.panel} data-organization-panel="" role="region" aria-labelledby="organization-overview-title">
        <div className={organization.overview} aria-labelledby="organization-overview-title">
          <div>
            <h3 id="organization-overview-title">Tổng quan</h3>
            <p>
              NewGen xác định người lao động là lực lượng trọng yếu cho sự vững
              mạnh của doanh nghiệp. Lãnh đạo và nhân viên được đối xử công bằng
              trong các quyết định, chính sách của công ty.
            </p>
            <p>
              Tinh thần tự học luôn được khuyến khích. Các khóa học nội bộ và
              bên ngoài giúp đội ngũ trau dồi kiến thức, nâng cao tay nghề và
              phát huy khả năng sáng tạo trong công việc.
            </p>
          </div>
          <div className={organization.staff}>
            <table aria-label="Nhân sự chuyên môn NewGen">
              <thead>
                <tr>
                  <th scope="col">Chuyên ngành</th>
                  <th scope="col">Số lượng</th>
                  <th scope="col">Thâm niên (năm)</th>
                </tr>
              </thead>
              <tbody>
                {specialties.map(([name, count, experience]) => (
                  <tr key={name}>
                    <th scope="row">{name}</th>
                    <td>{count}</td>
                    <td>{experience}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

        <div className={`${organization.panel} ${organization.subsection}`} data-organization-panel="" role="region" aria-labelledby="organization-chart-title">
          <h3 id="organization-chart-title">Sơ đồ tổ chức</h3>
          <div className={organization.chartViewport}>
            <div className={organization.chart}>
              <ol className={organization.management} aria-label="Các cấp điều hành, từ trên xuống">
                {[
                  { title: "Chủ tịch HĐQT", icon: Crown },
                  { title: "Giám đốc điều hành", icon: BriefcaseBusiness },
                  { title: "Phó giám đốc", icon: Network },
                ].map(({ title, icon: Icon }) => (
                  <li key={title}><span className={organization.nodeIcon}><Icon size={22} strokeWidth={1.5} aria-hidden="true" /></span>{title}</li>
                ))}
              </ol>
              <div className={organization.departmentGroup}>
                <ul className={organization.departments} aria-label="Các phòng ban trực thuộc">
                  {departments.map(({ name, icon: Icon }) => <li key={name}><span className={organization.nodeIcon}><Icon size={24} strokeWidth={1.5} aria-hidden="true" /></span>{name}</li>)}
                </ul>
              </div>
              <ul className={organization.sites} aria-label="Các công trường xây dựng được các phòng ban phối hợp hỗ trợ">
                {[1, 2, 3, 4].map(number => <li key={number}><HardHat size={20} strokeWidth={1.5} aria-hidden="true" /><span>Công trường xây dựng số {number}</span></li>)}
              </ul>
            </div>
          </div>
        </div>

        <div className={`${organization.panel} ${organization.subsection} ${organization.photosPanel}`} data-organization-panel="" role="region" aria-labelledby="organization-photos-title">
          <h3 id="organization-photos-title">Hình ảnh</h3>
          <OrganizationCarousel photos={photos} />
        </div>
    </OrganizationStory>
  );
}
