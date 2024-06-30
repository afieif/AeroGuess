import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate, Outlet, useNavigate } from 'react-router-dom';

export default function ProtectedRoute() {
    const game = useSelector(state=>state.game);
    
  return (
    <div>
    {
        game.host?
        <Outlet/>
        :
        <Navigate to="/start" replace={true}/>

    }
    </div>
  )
}
