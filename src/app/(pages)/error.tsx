"use client";
export default function ContentError({reset}:{reset:()=>void}){return <section className="wrap inner-section"><h1>Chưa thể tải nội dung</h1><p>Kết nối đang gián đoạn. Vui lòng thử lại sau.</p><button className="inner-button" onClick={reset}>Thử lại</button></section>;}
