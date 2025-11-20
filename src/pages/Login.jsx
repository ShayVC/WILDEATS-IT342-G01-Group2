import React, { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const schema = yup.object({ email: yup.string().email().required(), password: yup.string().required() });

export default function Login(){
  const { login } = useContext(AuthContext);
  const { register, handleSubmit } = useForm({ resolver: yupResolver(schema) });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try { await login(data.email, data.password); navigate("/", { replace: true }); }
    catch (err) { setError(err?.response?.data?.detail || err.message || "Login failed"); }
  };

  return (
    <div className="container">
      <h1>Login to WildEats</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <label>Email</label><input {...register("email")} />
        <label>Password</label><input type="password" {...register("password")} />
        <button type="submit">Login</button>
      </form>
      {error && <div className="error">{error}</div>}
      <p>Don't have an account? <Link to="/register">Register here</Link></p>
    </div>
  );
}
