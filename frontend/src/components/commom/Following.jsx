import React from 'react'
import { FaArrowLeft } from 'react-icons/fa';
import RightPanelSkeleton from '../skeletons/RightPanelSkeleton';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

const Following = () => {
  const { data: authUser } = useQuery({
    queryKey: ['authUser'],
  })
  const { data: userFollowing, isLoading, isError } = useQuery({
    queryKey: ['userFollowing', authUser?.following],
    queryFn: async () => {
      if (!authUser?.following || authUser.following.length === 0) return []; // Nếu không có following thì trả về mảng rỗng
      try {
        const res = await fetch(`/api/user/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ids: authUser?.following }), // Gửi mảng ID qua POST request
        });
        console.log("following", authUser.following)
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Something went wrong');
        console.log(data)
        return data;
      } catch (error) {
        throw new Error(error.message);
      }
    },
    enabled: !!authUser && authUser.following.length > 0, // Chỉ thực hiện khi authUser đã có dữ liệu và có người dùng để theo dõi
  });
  return (
    <div className='flex-[4_4_0] md:border-r border-gray-700 min-h-screen'>
      <div className='flex items-center ml-5 mt-3 gap-3 '>
        <Link to='/'>
          <FaArrowLeft className='w-5 h-5' />
        </Link>
        <div className='hidden md:block'>
          <p className='text-white font-bold text-sm w-20 truncate'>{authUser?.fullName}</p>
          <p className='text-slate-500 text-sm'>@{authUser?.username}</p>
        </div>
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
        {!isLoading && userFollowing?.map((user) => (
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
                {authUser?.following?.includes(user._id) ? 'Unfollow' : 'Follow'}
              </button>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default Following