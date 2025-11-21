import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: string;
  href: string;
  color: 'primary' | 'accent' | 'secondary';
}

const QuickActionCard = ({ title, description, icon, href, color }: QuickActionCardProps) => {
  const colorClasses = {
    primary: 'bg-primary hover:bg-secondary',
    accent: 'bg-accent hover:bg-accent/90',
    secondary: 'bg-secondary hover:bg-primary',
  };

  return (
    <Link href={href}>
      <div
        className={`${colorClasses[color]} rounded-lg p-6 text-primary-foreground transition-micro hover:scale-micro hover:shadow-md cursor-pointer h-full`}
      >
        <div className="flex items-start gap-4">
          <div className="bg-white/20 rounded-lg p-3 flex-shrink-0">
            <Icon name={icon as any} size={28} className="text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className="text-primary-foreground/90 text-sm leading-relaxed">{description}</p>
          </div>
          <Icon
            name="ChevronRightIcon"
            size={24}
            className="text-primary-foreground/60 flex-shrink-0"
          />
        </div>
      </div>
    </Link>
  );
};

export default QuickActionCard;
