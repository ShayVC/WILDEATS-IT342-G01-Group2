
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Dashboard(){
  const { user, logout } = useContext(AuthContext);
  return (
    <div className="container">
      <header>
        <h2>Welcome to WildEats</h2>
        {user ? (<div>{user.email} <button onClick={logout}>Logout</button></div>) :
          (<div><Link to="/login">Login</Link> | <Link to="/register">Register</Link></div>)}
      </header>

      <section>
        <h3>Quick Actions</h3>
        <Link to="/shops">Browse Shops</Link>
      </section>
    </div>
  );
}
