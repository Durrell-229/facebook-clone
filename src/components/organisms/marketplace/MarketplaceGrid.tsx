import React, { useState } from 'react';
import { useRealtimeJobs } from '../../../hooks/useRealtime';
import { IJobListing } from '../../../types/job';
import MarketplaceListingCard from './MarketplaceListingCard';
import MarketplaceListingModal from './MarketplaceListingModal';

interface Props {
  onOpenSidebar?: () => void;
}

const MarketplaceGrid: React.FC<Props> = ({ onOpenSidebar }) => {
  const { jobs, loading } = useRealtimeJobs();
  const [selectedListing, setSelectedListing] =
    useState<IJobListing | null>(null);

  const listings: IJobListing[] = jobs.map((j) => ({
    _id: j._id,
    salary: j.salaryMax ?? 0,
    isFree: j.isFree,
    title: j.title,
    location: j.location ?? 'Remote',
    image: j.companyLogo ?? 'https://random.imagecdn.app/200/200',
    category: j.category ?? 'Développement',
    contractType: j.contractType ?? undefined,
    description: j.description ?? undefined,
    listedAgo: j.listedAgo,
    company: {
      _id: j._id,
      name: j.company,
      dp: j.companyLogo ?? undefined,
      responsive: true,
    },
  }));

  return (
    <>
      <div className="flex-1 overflow-y-auto p-3 sm:p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-black hover:bg-gray-200 md:hidden dark:bg-neutral-700 dark:text-white dark:hover:bg-neutral-600"
              onClick={onOpenSidebar}
              aria-label="Open menu"
            >
              <i className="fas fa-bars text-sm"></i>
            </button>
            <h2 className="text-lg font-bold text-black sm:text-xl dark:text-white">
              Dernières offres
            </h2>
          </div>
          <span className="flex items-center gap-1 text-xs text-primary sm:text-sm">
            <i className="fas fa-map-marker-alt text-xs"></i>
            <span className="xs:inline hidden">Remote & France</span>
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {loading ? (
            <div className="col-span-full flex items-center justify-center py-10">
              <i className="fas fa-circle-notch fa-spin text-xl text-primary"></i>
            </div>
          ) : listings.length ? (
            listings.map((listing) => (
              <MarketplaceListingCard
                key={listing._id}
                listing={listing}
                onClick={() => setSelectedListing(listing)}
              />
            ))
          ) : (
            <p className="col-span-full py-10 text-center text-sm text-gray-500 dark:text-gray-400">
              Aucune offre pour l’instant. Les offres publiées apparaîtront ici.
            </p>
          )}
        </div>
      </div>

      {selectedListing && (
        <MarketplaceListingModal
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
        />
      )}
    </>
  );
};

export default MarketplaceGrid;
