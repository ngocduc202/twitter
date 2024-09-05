import React from 'react';
import { Link } from 'react-router-dom';
import { MdHomeFilled } from 'react-icons/md';
import { IoNotifications } from 'react-icons/io5';
import { FaUser } from 'react-icons/fa';
import { BiLogOut } from 'react-icons/bi';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { IoSearch } from "react-icons/io5";

const NavMobile = () => {
  const queryClient = useQueryClient()
  const { mutate: logout } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch('/api/auth/logout', {
          method: 'POST',
        })

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Something went wrong')
      } catch (error) {
        throw new Error(error)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authUser'] })
    },
    onError: () => {
      toast.error(error.message)
    }
  })
  const { data: authUser } = useQuery({ queryKey: ["authUser"] })
  return (
    <div className='fixed bottom-0 left-0 h-auto w-full border-t border-gray-700 bg-black z-50'>
      <ul className='flex flex-row gap-5 mt-2'>
        <li className='flex justify-center'>
          <Link
            to='/'
            className='flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer'
          >
            <MdHomeFilled className='w-8 h-8' />
            <span className='text-lg hidden md:block'>Home</span>
          </Link>
        </li>
        <li className='flex justify-center'>
          <Link
            to='/notifications'
            className='flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer'
          >
            <IoNotifications className='w-8 h-8' />
            <span className='text-lg hidden md:block'>Notifications</span>
          </Link>
        </li>
        <li className='flex justify-center'>
          <Link
            to='/search'
            className='flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer'
          >
            <IoSearch className='w-8 h-8' />
            <span className='text-lg hidden md:block'>Search</span>
          </Link>
        </li>
        <li className='flex justify-center'>
          <Link
            to={`/profile/${authUser?.username}`}
            className='flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer'
          >
            <FaUser className='w-7 h-7' />
            <span className='text-lg hidden md:block'>Profile</span>
          </Link>
        </li>
        <li className='flex justify-center'>
          <Link
            to={`/profile/${authUser?.username}`}
            className='flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer'
          >
            <div className='avatar md:hidden'>
              <div className='w-8 rounded-full'>
                <img src={authUser?.profileImg || "/avatar-placeholder.png"} />
              </div>
            </div>
          </Link>
        </li>
        <li className='flex justify-center items-center'>
          <BiLogOut className='w-8 h-8 cursor-pointer' onClick={(e) => {
            e.preventDefault()
            logout()
          }} />
        </li>
      </ul>
    </div>
  );
};

export default NavMobile;
