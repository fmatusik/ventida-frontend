"use client";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import Logo from "@/components/Logo";


export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const user = {
      email,
      password,
    };

    try {
      const res = await fetch(
        process.env.NEXT_PUBLIC_SERVER_URL + "/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(user),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Coś poszło nie tak");
        return;
      }

      localStorage.setItem("accessToken", data.accessToken);

      window.location.href = "/";
    } catch (err) {
      console.error(err);
      setError("Nie udało się połączyć z serwerem");
    }
  };


  return (
    <div className="w-screen h-screen bg-gradient-to-br from-primary to-secondary flex">
      <div className="w-[50%]"></div>
      <div className="bg-white w-[50%] p-20 relative">
        <Logo />
        <div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[80%]">
          <h1 className="font-bold text-4xl mb-8">Zaloguj się</h1>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <form className="space-y-1" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                id="emailInput"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Wprowadź swój email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hasło
              </label>
              <input
                type="password"
                name="password"
                id="passwordInput"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Wprowadź swoje hasło"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary transition-all hover:bg-primary-hover text-white font-semibold py-3 rounded-xl cursor-pointer mt-6"
            >
              Zaloguj się
            </button>

            <div className="flex justify-between text-sm text-gray-500 mt-6">
              <a href="/register" className="hover:underline">
                Nie masz konta?{" "}
                <span className="text-primary font-medium">Zarejestruj się</span>
              </a>
            </div>
            <div className="text-sm text-center hover:underline cursor-pointer hover:text-primary">
              Zapomniałeś hasła?
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}