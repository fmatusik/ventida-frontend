"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {UserResponseDto} from "@/models/user/UserResponseDto";



type UserContextType = {
  user: UserResponseDto | null;
  setUser: (user: UserResponseDto | null) => void;
};

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserResponseDto | null>(null);

    useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
        fetch(process.env.NEXT_PUBLIC_SERVER_URL + "/user/me", {
        headers: { Authorization: `Bearer ${token}` },
        })
        .then(res => {
            if(!res.ok) {
                setUser(null);
            }
            return res.json()
        })
        .then((data: UserResponseDto) => {
            setUser(data);
        })
        .catch(err => {
            setUser(null);
        });
    }
    }, []);


  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
