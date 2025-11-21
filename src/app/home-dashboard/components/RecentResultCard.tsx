import Icon from '@/components/ui/AppIcon';

interface RecentResultCardProps {
  matchTitle: string;
  betType: string;
  stake: number;
  odds: number;
  result: 'won' | 'lost';
  payout: number;
  settledDate: string;
}

const RecentResultCard = ({
  matchTitle,
  betType,
  stake,
  odds,
  result,
  payout,
  settledDate,
}: RecentResultCardProps) => {
  const isWin = result === 'won';

  return (
    <div className="bg-card border border-border rounded-lg p-5 hover:shadow-md transition-micro">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <h4 className="font-semibold text-text-primary mb-1">{matchTitle}</h4>
          <p className="text-sm text-text-secondary">{betType}</p>
        </div>
        {isWin ? (
          <div className="bg-success/10 text-success rounded-full p-2">
            <Icon name="TrophyIcon" size={20} variant="solid" />
          </div>
        ) : (
          <div className="bg-error/10 text-error rounded-full p-2">
            <Icon name="XCircleIcon" size={20} variant="solid" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <p className="text-xs text-text-secondary mb-1">Inzet</p>
          <p className="font-data font-semibold text-text-primary">{stake}</p>
        </div>
        <div>
          <p className="text-xs text-text-secondary mb-1">Odds</p>
          <p className="font-data font-semibold text-text-primary">{odds.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs text-text-secondary mb-1">Uitbetaling</p>
          <p className={`font-data font-semibold ${isWin ? 'text-success' : 'text-error'}`}>
            {isWin ? '+' : '-'}
            {payout}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border">
        <span className="text-xs text-text-secondary">Afgerekend op {settledDate}</span>
        <span
          className={`text-xs font-semibold px-2 py-1 rounded ${
            isWin ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
          }`}
        >
          {isWin ? 'Gewonnen' : 'Verloren'}
        </span>
      </div>
    </div>
  );
};

export default RecentResultCard;
