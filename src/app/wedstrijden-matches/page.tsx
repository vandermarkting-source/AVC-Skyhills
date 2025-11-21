import type { Metadata } from 'next';
import WedstrijdenInteractive from './components/WedstrijdenInteractive';
import RequireAuth from '@/components/auth/RequireAuth';

export const metadata: Metadata = {
  title: 'Wedstrijden - AVC Skyhills',
  description:
    'Plaats punten-gebaseerde weddenschappen op aankomende volleybalwedstrijden van AVC Skyhills en andere clubs met real-time odds en uitgebreide wedopties.',
};

export default function WedstrijdenPage() {
  return (
    <RequireAuth>
      <WedstrijdenInteractive />
    </RequireAuth>
  );
}
