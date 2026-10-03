"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Building2, Factory, Route, Droplets, Phone, Mail, MapPin, Menu, X, Check, ShieldCheck, HardHat, Ruler, Plus } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const projects = [
 { name: 'Khu dân cư Hoa Đất 3', location: 'VSIP Bắc Ninh', image: 'pic71', type: 'Nhà ở & đô thị', owner: 'Công ty Cổ phần Bất động sản Hoa Đất', description: 'Các lô nhà ở thuộc quy hoạch chi tiết Khu đô thị và Dịch vụ VSIP Bắc Ninh. Một trong những dự án tiêu biểu được giới thiệu trong hồ sơ năng lực NewGen.' },
 { name: 'Khu nhà ở cao cấp Đồng Đăng', location: 'Lạng Sơn', image: 'pic50', type: 'Nhà ở & đô thị', owner: '', description: 'Dự án tại đường Trần Quốc Toản, thị trấn Đồng Đăng, huyện Cao Lộc, tỉnh Lạng Sơn. Hình ảnh ghi lại công trình trong quá trình thi công và hoàn thiện.' },
 { name: 'Kết cấu & hoàn thiện 31 căn nhà', location: 'Hà Nam', image: 'pic66', type: 'Thi công & hoàn thiện', owner: 'Công ty CP Đầu tư Đô thị và Khu công nghiệp Sông Đà 7', description: 'Thi công kết cấu và hoàn thiện mặt ngoài 31 căn nhà ở thấp tầng tại các lô LK9, LK19, LK20, LK25, LK26 (XL11).' },
];
const services = [
 { icon: Building2, name: 'Xây dựng dân dụng', text: 'Kiến tạo không gian sống và làm việc, từ nhà ở, biệt thự đến văn phòng và trường học.', tags: 'Nhà ở · Văn phòng · Trường học' },
 { icon: Factory, name: 'Xây dựng công nghiệp', text: 'Thi công nhà xưởng và công trình công nghiệp, đáp ứng yêu cầu về kết cấu và công năng.', tags: 'Nhà xưởng · Kết cấu · Cơ khí' },
 { icon: Route, name: 'Hạ tầng kỹ thuật', text: 'Xây dựng công trình đường bộ, hệ thống điện, cấp thoát nước và hạ tầng đồng bộ.', tags: 'Giao thông · Điện · Cấp thoát nước' },
 { icon: Droplets, name: 'Chống thấm & sửa chữa', text: 'Thi công chống thấm, xử lý nứt bê tông và hoàn thiện để bảo vệ chất lượng công trình.', tags: 'Chống thấm · Xử lý nứt · Hoàn thiện' },
];
const faqs = [
 ['NewGen triển khai những loại công trình nào?', 'NewGen hoạt động trong xây dựng dân dụng, công nghiệp, nhà xưởng, hạ tầng kỹ thuật, chống thấm và xử lý nứt bê tông. Chúng tôi trao đổi trực tiếp để xác định phạm vi phù hợp với từng dự án.'],
 ['Tôi cần chuẩn bị thông tin gì để trao đổi về dự án?', 'Bạn có thể cung cấp địa điểm, loại công trình, quy mô dự kiến, bản vẽ hiện có và yêu cầu tiến độ. Đội ngũ NewGen sẽ tiếp nhận và cùng bạn làm rõ các yêu cầu kỹ thuật.'],
 ['Có thể xem thêm hồ sơ năng lực của NewGen ở đâu?', 'Vui lòng liên hệ hotline 0967 779 137 hoặc email Newgenconstruction.hz@gmail.com để nhận hồ sơ năng lực và trao đổi về các dự án liên quan.'],
 ['NewGen có thực hiện các hạng mục riêng lẻ không?', 'Bên cạnh xây dựng, hồ sơ năng lực có các hạng mục kết cấu, hoàn thiện, điện nước, chống thấm và xử lý nứt bê tông. Phạm vi công việc sẽ được thống nhất theo nhu cầu và điều kiện thực tế.'],
];
export default function Home() {
 const [menuOpen, setMenuOpen] = useState(false);
 const [selected, setSelected] = useState<(typeof projects)[number] | null>(null);
 return <>
  <a className="skip-link" href="#main">Đến nội dung chính</a>
  <div className="topbar"><div className="wrap"><span>CÔNG TY CỔ PHẦN ĐẦU TƯ XÂY DỰNG NEWGEN</span><a href="tel:0967779137"><Phone size={13}/>0967 779 137</a></div></div>
  <header className="header"><div className="wrap nav-wrap">
   <a href="#" aria-label="NewGen - Trang chủ" className="brand"><Image src="/images/logo.webp" alt="NewGen Construction" width={108} height={86} priority /></a>
   <nav aria-label="Điều hướng chính" className={menuOpen ? 'navigation open' : 'navigation'}>
    {[['Về NewGen','gioi-thieu'],['Lĩnh vực hoạt động','linh-vuc'],['Dự án tiêu biểu','du-an'],['Năng lực','nang-luc']].map(([label,id])=><a key={id} href={'#'+id} onClick={()=>setMenuOpen(false)}>{label}</a>)}
    <a data-slot="button" className={buttonVariants() + " nav-cta"} href="#lien-he" onClick={()=>setMenuOpen(false)}>Liên hệ hợp tác</a>
   </nav>
   <button className="menu-toggle" aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'} aria-expanded={menuOpen} onClick={()=>setMenuOpen(!menuOpen)}>{menuOpen ? <X/> : <Menu/>}</button>
  </div></header>
  <main id="main">
   <section className="hero">
    <Image src="/images/pic1.webp" alt="Cần trục và công trường xây dựng trong hồ sơ NewGen" fill priority sizes="100vw" className="hero-image"/>
    <div className="hero-shade"/>
    <div className="wrap hero-content"><div className="eyebrow light"><span/> NEWGEN CONSTRUCTION</div>
     <h1>Công trình thực.<br/><span>Giá trị thực.</span></h1>
     <p>Bền vững từ nền móng. Tận tâm trong từng chi tiết.<br className="desktop-break"/> NewGen đồng hành cùng bạn kiến tạo những công trình có giá trị lâu dài.</p>
     <div className="hero-actions"><a data-slot="button" className={buttonVariants() + " button-white"} href="#du-an">Khám phá dự án</a><a className="hero-secondary" href="#lien-he">Trao đổi cùng NewGen <span className="small-line"/></a></div>
     <div className="hero-values"><span><Check size={16}/> Chất lượng</span><span><Check size={16}/> Uy tín</span><span><Check size={16}/> Tiến độ</span></div>
    </div>
    <div className="hero-caption">XÂY NỀN TẢNG VỮNG CHẮC<br/><strong>KIẾN TẠO TƯƠNG LAI</strong></div>
   </section>
   <div className="fact-strip wrap"><div className="fact-intro">Nền tảng cho<br/><strong>niềm tin vững bền.</strong></div><div><strong>10 <small>tỷ đồng</small></strong><span>Vốn điều lệ</span></div><div><strong>36 <small>nhân sự</small></strong><span>Cán bộ chuyên môn</span></div><div><strong>04 <small>lĩnh vực</small></strong><span>Giải pháp xây dựng chủ lực</span></div></div>
   <section className="section wrap about" id="gioi-thieu">
    <div className="about-photo"><Image src="/images/pic69.webp" alt="Đội ngũ NewGen trao đổi kỹ thuật tại công trường" fill sizes="(max-width: 768px) 100vw, 45vw"/><div className="photo-label"><HardHat size={27}/><span>Con người tận tâm.<br/><strong>Công trình vững chắc.</strong></span></div></div>
    <div className="about-copy"><div className="eyebrow">VỀ NEWGEN</div><h2>Xây bằng năng lực.<br/><span>Gắn kết bằng niềm tin.</span></h2><p>Công ty Cổ phần Đầu tư Xây dựng NewGen mang đến giải pháp thi công cho các công trình dân dụng, công nghiệp và hạ tầng kỹ thuật.</p><p>Với đội ngũ kỹ thuật có chuyên môn, tinh thần trách nhiệm và sự đầu tư vào máy móc, chúng tôi đặt chất lượng và tiến độ làm nền tảng cho mỗi mối quan hệ hợp tác.</p><div className="value-row"><span>Tận tâm</span><span>Hợp tác</span><span>Đổi mới</span></div><a className="text-link" href="#nang-luc">Tìm hiểu năng lực NewGen <Plus size={17}/></a></div>
   </section>
   <section className="services-section" id="linh-vuc"><div className="wrap section"><div className="section-heading"><div><div className="eyebrow">LĨNH VỰC HOẠT ĐỘNG</div><h2>Giải pháp đồng bộ.<br/>Giá trị bền vững.</h2></div><p>Từ nền móng đến hoàn thiện, NewGen đáp ứng nhu cầu xây dựng với chuyên môn và sự tận tâm.</p></div><div className="services-grid">{services.map(s=><article className="service" key={s.name}><s.icon size={34} strokeWidth={1.4}/><h3>{s.name}</h3><p>{s.text}</p><div className="service-tags">{s.tags}</div></article>)}</div></div></section>
   <section className="section wrap projects" id="du-an"><div className="section-heading"><div><div className="eyebrow">DỰ ÁN TIÊU BIỂU</div><h2>Dấu ấn trên từng công trình.</h2></div><span className="section-note">Năng lực được thể hiện qua thực tế.</span></div><div className="project-grid">{projects.map((p,i)=><button className={'project project-'+i} key={p.name} onClick={()=>setSelected(p)}><div className="project-image"><Image src={'/images/'+p.image+'.webp'} alt={p.name} fill sizes="(max-width: 768px) 100vw, 50vw"/><span className="project-location"><MapPin size={13}/>{p.location}</span><span className="project-plus"><Plus size={22}/></span></div><div className="project-copy"><span>{p.type}</span><h3>{p.name}</h3></div></button>)}</div></section>
   <section className="capability" id="nang-luc"><div className="wrap capability-grid"><div><div className="eyebrow light">NĂNG LỰC NEWGEN</div><h2>Nền tảng vững vàng.<br/>Sẵn sàng đồng hành.</h2><p>Con người, thiết bị và tinh thần trách nhiệm tạo nên năng lực triển khai của NewGen.</p><div className="capability-items">{[[HardHat,'Đội ngũ chuyên môn','Kỹ sư xây dựng, cầu đường, điện, cấp thoát nước và kiến trúc sư, với thâm niên công tác từ 2 đến 15 năm.'],[Ruler,'Thiết bị phục vụ thi công','Máy xúc, máy lu, máy ủi, vận thăng và thiết bị trắc đạc phục vụ các hạng mục xây dựng.'],[ShieldCheck,'Cam kết trong từng hạng mục','Lấy chất lượng, uy tín và tiến độ làm trọng tâm; tôn trọng yêu cầu và đồng hành cùng chủ đầu tư.']].map(([Icon,title,text])=>{const I=Icon as typeof HardHat; return <div className="capability-item" key={title as string}><I size={26}/><div><h3>{title as string}</h3><p>{text as string}</p></div></div>})}</div></div><div className="capability-photo"><Image src="/images/pic24.webp" alt="Thi công kết cấu nhà xưởng trong hồ sơ năng lực" fill sizes="(max-width: 768px) 100vw, 45vw"/><div><span>HIỆN ĐẠI · CHUYÊN NGHIỆP · NHÂN VĂN</span><p>Thành công của khách hàng<br/>là niềm tự hào của chúng tôi.</p></div></div></div></section>
   <section className="partners wrap"><div className="eyebrow">ĐỐI TÁC TIÊU BIỂU</div><h2>Cùng hợp tác. Cùng phát triển.</h2><div className="partner-logos">{[['partner1','Đông Dương'],['partner4','Vinhomes'],['partner5','HACC1'],['partner6','Vinaconex'],['partner7','Thép Việt Ý'],['partner8','Hòa Phát']].map(([img,name])=><Image key={img} src={'/images/'+img+'.webp'} alt={name} width={140} height={75}/>)}</div></section>
   <section className="faq-section"><div className="wrap faq-grid"><div><div className="eyebrow">THÔNG TIN HỮU ÍCH</div><h2>Trước khi<br/>bắt đầu hợp tác.</h2><p>Hiểu rõ nhu cầu là bước đầu tiên<br/>để xây dựng một giải pháp phù hợp.</p></div><Accordion multiple={false} className="faq-list">{faqs.map(([q,a],i)=><AccordionItem value={'faq-'+i} key={q}><AccordionTrigger>{q}</AccordionTrigger><AccordionContent>{a}</AccordionContent></AccordionItem>)}</Accordion></div></section>
   <section className="contact-section" id="lien-he"><div className="wrap contact-grid"><div><div className="eyebrow light">KẾT NỐI VỚI NEWGEN</div><h2>Công trình tiếp theo.<br/>Bắt đầu từ một cuộc trò chuyện.</h2><p>Chia sẻ nhu cầu của bạn. NewGen sẵn sàng lắng nghe<br className="desktop-break"/> và trao đổi giải pháp cho dự án.</p><a data-slot="button" className={buttonVariants() + " button-white"} href="tel:0967779137"><Phone size={17}/>0967 779 137</a></div><div className="contact-details"><a href="mailto:Newgenconstruction.hz@gmail.com"><Mail/><div><span>EMAIL</span><strong>Newgenconstruction.hz@gmail.com</strong></div></a><div><MapPin/><div><span>TRỤ SỞ</span><strong>Số 39, Ngõ 36 Đường Khuyến Lương,<br/>Phường Lĩnh Nam, Thành phố Hà Nội</strong></div></div><div className="contact-note">TẬN TÂM TỪ TIẾP NHẬN ĐẾN THI CÔNG</div></div></div></section>
  </main>
  <footer className="wrap footer"><div className="footer-brand"><Image src="/images/logo.webp" alt="NewGen Construction" width={75} height={60}/><span>CÔNG TY CỔ PHẦN ĐẦU TƯ XÂY DỰNG NEWGEN<br/><small>Mã số doanh nghiệp: 2301262147</small></span></div><span>© {new Date().getFullYear()} NewGen Construction.</span></footer>
  <Dialog open={!!selected} onOpenChange={open=>{if(!open)setSelected(null)}}><DialogContent className="project-dialog">{selected&&<><div className="dialog-image"><Image src={'/images/'+selected.image+'.webp'} alt={selected.name} fill sizes="700px"/></div><DialogTitle>{selected.name}</DialogTitle><DialogDescription>{selected.description}</DialogDescription><p className="dialog-location"><MapPin size={16}/>{selected.location}</p>{selected.owner&&<p className="dialog-owner"><strong>Chủ đầu tư:</strong> {selected.owner}</p>}<a data-slot="button" className={buttonVariants() + " "} href="#lien-he" onClick={()=>setSelected(null)}>Trao đổi về dự án của bạn</a></>}</DialogContent></Dialog>
 </>;
}

