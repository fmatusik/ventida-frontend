"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {UserResponseDto} from "@/models/user/UserResponseDto";



type UserContextType = {
  user: UserResponseDto | null;
  setUser: (user: UserResponseDto | null) => void;
  isLoading: boolean;
};

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  isLoading: true,
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
        fetch(process.env.NEXT_PUBLIC_SERVER_URL + "/user/me", {
        headers: { Authorization: `Bearer ${token}` },
        })
        .then(res => {
            if(!res.ok) {
                localStorage.removeItem("accessToken");
                setUser(null);
                return null;
            }
            return res.json()
        })
        .then((data: UserResponseDto | null) => {
            if (data) setUser(data);
        })
        .catch(err => {
            setUser(null);
        })
        .finally(() => {
            setIsLoading(false);
        });
    } else {
        setIsLoading(false);
    }
    }, []);


  return (
    <UserContext.Provider value={{ user, setUser, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
