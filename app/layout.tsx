import type { Metadata } from 'next';
import './globals.css';
import { AdaptiveLuxProvider } from '@/components/AdaptiveLuxProvider';
import { EmergencyRedFlagModal } from '@/components/EmergencyRedFlagModal';

export const metadata: Metadata = {
  title: 'NeuroPulse DTx - Clinical SaMD Concussion & mTBI Recovery Platform',
  description:
    'Clinical-grade Software-as-a-Medical-Device (SaMD) for traumatic brain injury recovery aligned with SCAT6 and PCSS guidelines.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#080808] text-[#F5F5F7] min-h-screen selection:bg-amber-500/30 selection:text-[#E5A93C]">
        <AdaptiveLuxProvider>
          <EmergencyRedFlagModal />
          {children}
        </AdaptiveLuxProvider>
      </body>
    </html>
  );
}
