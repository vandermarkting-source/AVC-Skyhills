import type { Metadata } from 'next';
import Header from '@/components/common/Header';
import HomeDashboardInteractive from './components/HomeDashboardInteractive';
import RequireAuth from '@/components/auth/RequireAuth';

export const metadata: Metadata = {
  title: 'Home Dashboard - AVC Skyhills',
  description:
    "Welkom bij het AVC '69 Skyhills puntenweddenschap platform. Bekijk je recente resultaten, plaats weddenschappen op volleybalwedstrijden en neem deel aan fun bets.",
};

export default function HomeDashboardPage() {
  return (
    <RequireAuth>
      <Header />
      <HomeDashboardInteractive />
    </RequireAuth>
  );
}
