import React from 'react';
import { IJobListing } from '../../../types/job';

interface Props {
  listing: IJobListing;
  onClick?: () => void;
}

const MarketplaceListingCard: React.FC<Props> = ({ listing, onClick }) => {
  return (
    <div className="cursor-pointer rounded-lg overflow-hidden hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors" onClick={onClick}>
      <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-200 dark:bg-neutral-700">
        <img
          src={listing.image}
          alt={listing.title}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="p-1.5">
        <p className="text-sm font-bold text-primary dark:text-hub-cyan">
          {listing.isFree
            ? 'OPEN SOURCE'
            : `${listing.salary.toLocaleString('fr-FR')} €/an`}
        </p>
        <p className="line-clamp-2 text-sm leading-tight text-black dark:text-gray-200">
          {listing.title}
        </p>
        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{listing.location}</p>
      </div>
    </div>
  );
};

export default MarketplaceListingCard;
