import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import axiosClient from "../axios-client"
import { useStateContext } from "../contexts/ContextProvider";

export default function UserForm(){
    const {id} = useParams()
    const navigate =useNavigate();
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState(null)
    const {setNotification} = useStateContext()
    const [user,setUser] = useState({
        id: null,
        name:'',
        email:'',
        password:'',
        password_confirmation:'',

    })

    if(id){
        useEffect(() =>{
            setLoading(true)
            axiosClient.get(`/users/${id}`)
            .then(({data})=>{
                setLoading(false)
                setUser(data)
            })
            .catch(()=>{
                setLoading(false)
            })
        },[])
    }

    const onSubmit = (ev) => {
        ev.preventDefault();

        if(user.id)
        {
            axiosClient.put(`/users/${user.id}`, user)
            .then(() => {
                //NOTIFICATION
                setNotification("User was successfully updated")
                navigate('/users')
            })
            .catch(err => {
                const response = err.response;
                if(response && response.status === 422)
                {
                    // console.log(response.data.errors);
                    setErrors(response.data.errors);
                }
            })
        }else{
            axiosClient.post(`/users`, user)
            .then(() => {
                //NOTIFICATION
                setNotification("User was successfully created")
                navigate('/users')
            })
            .catch(err => {
                const response = err.response;
                if(response && response.status === 422)
                {
                    // console.log(response.data.errors);
                    setErrors(response.data.errors);
                }
            })  
        }
    }

    return(
        <div>
            {user.id && <h1>Update user: {user.name}</h1>}
            {!user.id && <h1>New User</h1>}
            <div className="card animated fadeInDown">
                {loading && (
                    <div className="text-center">Loading...</div>
                )}
                {errors && <div className="alert">
                    <div className="max-w-md py-4 px-6 shadow-2xl shadow-red-800 rounded-lg bg-red-600">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                <h3 className="text-xl text-white font-semibold">Error</h3>
                            </div>
                            {Object.keys(errors).map(key => (
                                <p key={key}>{errors[key][0]}</p>
                            ))}
                        </div>
                    </div>
                </div>
                }
                {!loading &&
                    <form onSubmit={onSubmit}>
                        <input value={user.name} onChange={ev => setUser({...user, name: ev.target.value})} placeholder="Name" />
                        <input type="email" value={user.email} onChange={ev => setUser({...user, email: ev.target.value})} placeholder="Email" />
                        <input type="password" onChange={ev => setUser({...user, password: ev.target.value})} placeholder="Password" />
                        <input type="password" onChange={ev => setUser({...user, password_confirmation: ev.target.value})} placeholder="Password Confirmation" />
                        <button className="btn">Save</button>
                    </form>
                }
            </div>

       </div>
    )
}