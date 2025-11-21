import type { Metadata } from 'next';
import Header from '@/components/common/Header';
import AccountInteractive from './components/AccountInteractive';
import RequireAuth from '@/components/auth/RequireAuth';

export const metadata: Metadata = {
  title: 'Mijn Account - AVC Skyhills',
  description:
    'Beheer je profiel, bekijk je wedgeschiedenis en volg je punten transacties binnen het AVC Skyhills betting platform.',
};

export default function MijnAccountPage() {
  return (
    <RequireAuth>
      <Header />
      <AccountInteractive />
    </RequireAuth>
  );
}
