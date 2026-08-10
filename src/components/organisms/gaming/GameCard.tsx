import React from 'react';

interface IChallengeView {
  _id: string;
  title: string;
  image: string;
  category: string;
  participantsCount?: number;
}

interface IProps {
  challenge: IChallengeView;
  size?: 'md' | 'lg';
}

const GameCard: React.FC<IProps> = ({ challenge, size = 'md' }) => {
  const dimensions = size === 'lg' ? 'w-36 h-44 md:w-40 md:h-48' : 'w-28 h-36 md:w-36 md:h-44';

  return (
    <div
      className={`${dimensions} relative flex-shrink-0 cursor-pointer overflow-hidden rounded-xl shadow transition-transform hover:scale-[1.02]`}
    >
      <img src={challenge.image} alt={challenge.title} className="h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-2">
        {challenge.participantsCount != null && challenge.participantsCount > 0 && (
          <span className="mb-1 inline-block rounded-full bg-black/50 px-1.5 py-0.5 text-[10px] text-gray-200">
            👥 {challenge.participantsCount.toLocaleString('fr-FR')}
          </span>
        )}
        <p className="truncate text-xs font-semibold leading-tight text-white">{challenge.title}</p>
        <span className="mt-0.5 inline-block rounded-full bg-black/50 px-1.5 py-0.5 text-[10px] text-gray-200">
          {challenge.category}
        </span>
      </div>
    </div>
  );
};

export default GameCard;
