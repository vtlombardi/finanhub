import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { AuthProvider } from "@/features/auth/AuthProvider";
import "./globals.css";
import NotificationToast from "@/components/common/NotificationToast";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Pagina Inicial | FINANHUB",
  description: "Onde negócios e oportunidades se encontram",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
        />
      </head>
      <body className={poppins.variable} suppressHydrationWarning>
        <AuthProvider>
          {children}
          <NotificationToast />
        </AuthProvider>
      </body>
    </html>
  );
}
