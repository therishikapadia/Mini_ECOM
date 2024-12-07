import React from 'react';
import { useAuth } from '../Context/AuthProvider.js';
import toast from 'react-hot-toast';

const Logout=()=> {
    const [authuser, setAuthuser]= useAuth()
    const handlleLogout = ()=>{
        try {
            setAuthuser({
                ...authuser,
                user:null
            })
            localStorage.removeItem('Users')
            toast.success("Logged out Successfully");
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (error) {
            setTimeout(() => {
                
            }, 2000);
            toast.error("Error:"+error.message);
        }
    }
  return (
    <div>
      <button className='btn btn-outline-danger p-2' style={{fontWeight:'500'}} onClick={handlleLogout}>Logout</button>
    </div>
  )
}

export default Logout
