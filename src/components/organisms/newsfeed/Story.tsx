import React from 'react';
import { Link } from 'react-router-dom';
import type { Database } from '../../../types/database';

type NewsRow = Database['public']['Tables']['news']['Row'];

interface IProps {
  news: NewsRow;
}

const Story: React.FC<IProps> = ({ news }) => {
  return (
    <Link
      to={`/news/${news.id}`}
      className="relative block h-48 w-28 flex-shrink-0 cursor-pointer overflow-hidden rounded-xl bg-cover bg-center p-3 shadow"
      style={{
        backgroundImage: `url(${news.image ?? 'https://random.imagecdn.app/500/400'})`,
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <span className="absolute left-3 top-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase text-white">
        Actu
      </span>
      <p className="absolute bottom-3 left-3 right-3 line-clamp-3 text-xs font-semibold leading-tight text-white drop-shadow">
        {news.title}
      </p>
    </Link>
  );
};

export default Story;
