import Navbar from "@/components/Navbar";
import Background from "@/components/Background";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs';


export const metadata = {
  title: "HackNect",
  description: "Host and participate in coding competitions",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icon.png" type="image/png" />
      </head>
      <body>
        <ClerkProvider>
          <div className="fixed inset-0 z-0 overflow-hidden">
            <Background />
          </div>
          <div className='relative w-full p-8 z-20'>
            <Navbar />
          </div>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
