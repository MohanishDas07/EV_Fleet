import './globals.css'
import { Inter, Outfit } from 'next/font/google'
import { ThemeProvider } from "../components/theme-provider"
import Sidebar from "../components/Sidebar"

// Modern Typography: Using Inter for data density, Outfit for elegant headings
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' })

export const metadata = {
  title: 'VoltGrid | Enterprise EV Orchestration',
  description: 'AI-driven energy orchestration for commercial EV fleets.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${outfit.variable}`}>
      <body className="bg-background text-foreground font-sans antialiased selection:bg-primary/30">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <div className="flex bg-black min-h-screen">
            <Sidebar />
            <div className="flex-1 ml-64 p-8">
              {/* Subtle Dark Mode Gradients applied globally via Tailwind */}
              <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black">
                {children}
              </div>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
