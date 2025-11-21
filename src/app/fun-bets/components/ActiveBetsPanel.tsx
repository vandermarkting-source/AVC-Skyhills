'use client';

import Icon from '@/components/ui/AppIcon';

interface ActiveBet {
  id: string;
  title: string;
  option: string;
  stake: number;
  potentialWin: number;
  emoji: string;
  status: 'pending' | 'won' | 'lost';
}

interface ActiveBetsPanelProps {
  bets: ActiveBet[];
}

const ActiveBetsPanel = ({ bets }: ActiveBetsPanelProps) => {
  if (bets.length === 0) {
    return (
      <div className="bg-card border border-border rounded-md shadow-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Icon name="TicketIcon" size={20} className="text-primary" />
          <h3 className="font-semibold text-text-primary">Mijn actieve weddenschappen</h3>
        </div>
        <div className="text-center py-8">
          <Icon name="InboxIcon" size={48} className="text-text-secondary mx-auto mb-3" />
          <p className="text-text-secondary">Nog geen actieve weddenschappen</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-md shadow-card p-4">
      <div className="flex items-center gap-2 mb-4">
        <Icon name="TicketIcon" size={20} className="text-primary" />
        <h3 className="font-semibold text-text-primary">Mijn actieve weddenschappen</h3>
        <span className="ml-auto bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded-sm">
          {bets.length}
        </span>
      </div>

      <div className="space-y-3">
        {bets.map((bet) => (
          <div key={bet.id} className="p-3 bg-muted rounded-sm border border-border">
            <div className="flex items-start gap-3 mb-2">
              <span className="text-2xl" role="img" aria-label={bet.title}>
                {bet.emoji}
              </span>
              <div className="flex-1">
                <p className="font-medium text-text-primary text-sm mb-1">{bet.title}</p>
                <p className="text-xs text-text-secondary">{bet.option}</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-xs text-text-secondary">Inzet</p>
                  <p className="font-data font-semibold text-text-primary">{bet.stake}</p>
                </div>
                <div>
                  <p className="text-xs text-text-secondary">Mogelijke winst</p>
                  <p className="font-data font-semibold text-success">{bet.potentialWin}</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-warning text-warning-foreground text-xs font-medium rounded-sm">
                <Icon name="ClockIcon" size={12} />
                Lopend
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActiveBetsPanel;
