import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import CreatePostModal from './CreatePostModal';

const CreatePostBox: React.FC = () => {
  const { profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const firstName = profile?.full_name?.split(' ')[0] ?? 'développeur';

  return (
    <>
      <div className="flex flex-col rounded-lg bg-white p-3 px-4 shadow dark:bg-neutral-800">
        <div className="mb-2 flex items-center space-x-2 border-b pb-3 dark:border-neutral-700">
          <div className="h-10 w-10">
            <img
              src={profile?.avatar_url ?? 'https://random.imagecdn.app/200/200'}
              className="h-full w-full rounded-full object-cover"
              alt="dp"
            />
          </div>
          <button
            onClick={() => setIsOpen(true)}
            className="h-10 flex-grow rounded-full bg-gray-100 pl-5 text-left text-gray-500 hover:bg-gray-200 focus:bg-gray-300 focus:outline-none dark:bg-neutral-700 dark:text-gray-300 dark:hover:bg-neutral-600 dark:focus:bg-neutral-700"
          >
            Quoi de neuf, {firstName} ?
          </button>
        </div>
        <div className="-mb-1 flex space-x-1 text-sm font-thin sm:space-x-3">
          <button
            onClick={() => setIsOpen(true)}
            className="flex h-8 flex-1 items-center justify-center space-x-1 rounded-md text-gray-600 hover:bg-gray-100 focus:bg-gray-200 focus:outline-none dark:text-gray-300 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700 sm:space-x-2"
          >
            <i className="fas fa-code text-primary"></i>
            <p className="hidden font-semibold sm:block">Code</p>
          </button>
          <button
            onClick={() => setIsOpen(true)}
            className="flex h-8 flex-1 items-center justify-center space-x-1 rounded-md text-gray-600 hover:bg-gray-100 focus:bg-gray-200 focus:outline-none dark:text-gray-300 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700 sm:space-x-2"
          >
            <i className="fas fa-images text-green-600"></i>
            <p className="hidden font-semibold sm:block">Photos/Vidéo</p>
          </button>
          <button
            onClick={() => setIsOpen(true)}
            className="flex h-8 flex-1 items-center justify-center space-x-1 rounded-md text-gray-600 hover:bg-gray-100 focus:bg-gray-200 focus:outline-none dark:text-gray-300 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700 sm:space-x-2"
          >
            <i className="far fa-smile text-yellow-600"></i>
            <p className="hidden font-semibold sm:block">Activité</p>
          </button>
        </div>
      </div>

      <CreatePostModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default CreatePostBox;
