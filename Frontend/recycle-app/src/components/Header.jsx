import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import { AppContent } from '../context/AppContext'

const Header = () => {
  const {userData}=useContext(AppContent)
  return (
    <div className='flex px-10 py-3 mt-20 justify-between'>
        <div className='w-[40%] self-center'>
          {userData?<h2 className='text-xl p-3'>Welcome to BinWise,{userData.name}!</h2> :<h2 className='text-xl p-3'>Welcome to BinWise,Eco-hero!</h2>}
        <h1 className='text-6xl font-bold'>Recycle Today,<span className='block text-[#186933]'>Save Tomorrow</span></h1>
        <p className='p-4 font-medium'>Every small step matters.Together,We can reduce waste, save energy, and build a cleaner planet.</p>
        <button className='bg-[#186933] text-white text-sm font-medium p-3 m-3 w-40 rounded-xl cursor-pointer'>Start Recycling</button>
        </div>
        <div>
            <img src={assets.hero} alt='Hero'/>
        </div>
    </div>
  )
}

export default Header
