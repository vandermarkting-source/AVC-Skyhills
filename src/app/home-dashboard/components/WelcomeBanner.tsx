import Icon from '@/components/ui/AppIcon';

interface WelcomeBannerProps {
  userName: string;
  pointsBalance: number;
}

const WelcomeBanner = ({ userName, pointsBalance }: WelcomeBannerProps) => {
  return (
    <div className="bg-gradient-to-br from-primary via-secondary to-primary rounded-lg p-8 text-primary-foreground shadow-card">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Welkom terug, {userName}!</h1>
          <p className="text-primary-foreground/90 text-lg">
            Plaats je weddenschappen en win punten bij AVC &apos;69 Skyhills
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 min-w-[200px]">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="CurrencyDollarIcon" size={24} className="text-primary-foreground" />
            <span className="text-sm font-medium opacity-90">Jouw Saldo</span>
          </div>
          <div className="font-data text-4xl font-bold">
            {pointsBalance.toLocaleString('nl-NL')}
          </div>
          <div className="text-sm opacity-80 mt-1">punten beschikbaar</div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-white/5 rounded-md border border-white/10">
        <div className="flex items-start gap-3">
          <Icon
            name="InformationCircleIcon"
            size={20}
            className="text-primary-foreground flex-shrink-0 mt-0.5"
          />
          <p className="text-sm text-primary-foreground/90">
            Dit is een puntensysteem voor entertainment binnen onze volleybalclub. Geen echt geld
            betrokken - gewoon plezier en vriendschappelijke competitie!
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeBanner;
