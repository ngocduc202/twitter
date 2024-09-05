import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import LoadingSpinner from '../../components/commom/LoadingSpinner'
import { useQuery } from '@tanstack/react-query';
import { IoSearch } from 'react-icons/io5';
import RightPanelSkeleton from '../../components/skeletons/RightPanelSkeleton';
import { FaArrowLeft } from 'react-icons/fa';
import useFollow from '../../hooks/useFollow';


const Search = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: user, isLoading, isError, error } = useQuery({
    queryKey: ['searchUsers', searchTerm],
    queryFn: async () => {
      if (!searchTerm) return [];
      try {
        const res = await fetch('/api/user/search', {
          params: { username: searchTerm },
        });
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Something went wrong')
        return data
      } catch (err) {
        throw new Error(err.message || 'Có lỗi xảy ra khi tìm kiếm.');
      }
    },
    enabled: !!searchTerm, // Chỉ kích hoạt query khi có searchTerm
  });

  const { follow, isPending } = useFollow()
  return (
    <div className='flex-[4_4_0] md:border-r border-gray-700 min-h-screen'>
      <div className='flex items-center justify-center mt-3 gap-3'>
        <Link to='/'>
          <FaArrowLeft className='w-5 h-5' />
        </Link>
        <span className='w-[48px] h-[48px] flex items-center justify-center rounded-l-full bg-gray-700 relative left-4'>
          <IoSearch className='w-6 h-6' />
        </span>
        <input
          type='text'
          placeholder='Search'
          className='input w-full max-w-[300px] rounded-r-full md:max-w-[500px] bg-gray-700'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className='w-full p-5 mt-3'>

        {isLoading && (
          <>
            <RightPanelSkeleton />
            <RightPanelSkeleton />
            <RightPanelSkeleton />
            <RightPanelSkeleton />
          </>
        )}
        {!isLoading && user?.map((user) => (
          <Link
            to={`/profile/${user.username}`}
            className='flex items-center justify-between gap-4 w-full mb-3'
            key={user._id}
          >
            <div className='flex gap-2 items-center'>
              <div className='avatar'>
                <div className='w-8 rounded-full'>
                  <img src={user.profileImg || '/avatar-placeholder.png'} alt={user.username} />
                </div>
              </div>
              <div className='flex flex-col'>
                <span className='font-semibold tracking-tight truncate w-28'>
                  {user.fullName}
                </span>
                <span className='text-sm text-slate-500'>@{user.username}</span>
              </div>
            </div>
            <div>
              <button
                className='btn bg-white text-black hover:bg-white hover:opacity-90 rounded-full btn-sm'
                onClick={(e) => {
                  e.preventDefault();
                  follow(user._id);
                }}
              >
                {isPending ? <LoadingSpinner size="sm" /> : "Follow"}
              </button>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Search