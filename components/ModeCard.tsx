'use client';

interface ModeCardProps {
  icon: string;
  title: string;
  description: string;
  badge?: string;
  onClick: () => void;
}

export default function ModeCard({ icon, title, description, badge, onClick }: ModeCardProps) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-3xl p-6 shadow-md hover:shadow-xl transition-all hover:-translate-y-1 text-left relative overflow-hidden group"
    >
      {/* Background gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink/0 to-pink/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative z-10">
        <div className="text-5xl mb-4">{icon}</div>
        <h3 className="font-fraunces text-2xl font-semibold text-primary mb-2">
          {title}
        </h3>
        <p className="text-text-light mb-3">{description}</p>
        {badge && (
          <span className="inline-block bg-pink text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
            {badge}
          </span>
        )}
      </div>
    </button>
  );
}
