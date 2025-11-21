import type { Metadata } from 'next';
import AdminPanelInteractive from './components/AdminPanelInteractive';
import RequireAuth from '@/components/auth/RequireAuth';

export const metadata: Metadata = {
  title: 'Admin Panel - AVC Skyhills',
  description:
    "Beheer markten, gebruikers en platform instellingen voor AVC '69 betting platform. Maak nieuwe weddenschappen aan, stel odds in en reken markten af.",
};

export default function AdminPanelPage() {
  return (
    <RequireAuth>
      <AdminPanelInteractive />
    </RequireAuth>
  );
}
