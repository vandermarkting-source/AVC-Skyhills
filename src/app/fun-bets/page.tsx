import type { Metadata } from 'next';
import FunBetsInteractive from './components/FunBetsInteractive';
import RequireAuth from '@/components/auth/RequireAuth';

export const metadata: Metadata = {
  title: 'Fun Bets - AVC Skyhills',
  description:
    'Voorspel clubevenementen, aanwezigheid en uitdagingen bij AVC 69. Plaats leuke weddenschappen en win punten met je voorspellingen.',
};

export default function FunBetsPage() {
  return (
    <RequireAuth>
      <FunBetsInteractive />
    </RequireAuth>
  );
}
