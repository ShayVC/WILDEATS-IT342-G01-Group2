// src/pages/Profile.jsx
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/api";

export default function Profile(){
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/users/me/");
        setProfile(res.data);
      // eslint-disable-next-line no-unused-vars
      } catch (e) {
        setProfile(user || null);
      }
    })();
  });

  if (!profile) return <div>Loading...</div>;

  return (
    <div className="container">
      <h2>Profile</h2>
      <p>Name: {profile.name || profile.username}</p>
      <p>Email: {profile.email}</p>
      <p>Role: {profile.role || (user && (user.role||user.roles))}</p>
    </div>
  );
}
