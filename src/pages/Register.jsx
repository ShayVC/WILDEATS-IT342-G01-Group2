import React, { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Register(){
  const { register: regApi } = useContext(AuthContext);
  const { register, handleSubmit } = useForm();
  const [msg, setMsg] = useState(null);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      await regApi({ email: data.email, password: data.password, name: data.name });
      setMsg("Registered — check your email for activation.");
      navigate("/login");
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setMsg("Registration failed");
    }
  };

  return (
    <div className="container">
      <h1>Register</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <label>Name</label><input {...register("name")} />
        <label>Email</label><input {...register("email")} />
        <label>Password</label><input type="password" {...register("password")} />
        <button type="submit">Register</button>
      </form>
      {msg && <div>{msg}</div>}
    </div>
  );
}
