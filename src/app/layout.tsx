import type { Metadata } from "next";
import "./globals.css";
import "./brand.css";
import "./story.css";
import "./foundation.css";
import "./header.css";
import "./leadership.css";
import "./services.css";
import "./intro.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({
  subsets: ["latin", "vietnamese"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "NewGen Construction | Công trình thực. Giá trị thực.",
  description:
    "NewGen – Giải pháp xây dựng dân dụng, công nghiệp, hạ tầng kỹ thuật và chống thấm. Tận tâm trong từng công trình, đồng hành cùng chủ đầu tư.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={cn("font-sans", geist.variable)}>
      <body>{children}</body>
    </html>
  );
}
