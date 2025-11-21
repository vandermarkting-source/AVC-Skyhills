import type { Metadata } from 'next';
import Header from '@/components/common/Header';
import LeaderboardInteractive from './components/LeaderboardInteractive';
import RequireAuth from '@/components/auth/RequireAuth';

export const metadata: Metadata = {
  title: 'Ranglijst - AVC Skyhills',
  description:
    "Bekijk de top 20 spelers van AVC '69 met hun punten, win rates en prestaties in de competitieve ranglijst.",
};

export default function RanglijstLeaderboardPage() {
  return (
    <RequireAuth>
      <Header />
      <LeaderboardInteractive />
    </RequireAuth>
  );
}
