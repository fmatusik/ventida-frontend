"use client";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import Image from "next/image";
import Logo from "@/components/Logo";


export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");


  return (
    <div className="w-screen h-screen bg-gradient-to-br from-primary to-secondary flex">
      <div className="w-[50%]"></div>
      <div className="bg-white w-[50%] p-20 relative">
        <a href="/">
          <Logo />
        </a>
        <div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[80%]">
          <h1 className="font-bold text-4xl mb-8">Log In</h1>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <form className="space-y-1">
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
                placeholder="Enter your Email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                id="passwordInput"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter your Password"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary transition-all hover:bg-primary-hover text-white font-semibold py-3 rounded-xl cursor-pointer mt-6"
            >
              Sign In
            </button>

            <div className="relative my-6">
              <hr className="border-gray-300" />
              <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-sm text-gray-500">
                or
              </span>
            </div>

            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 border border-gray-300 py-3 rounded-xl hover:bg-gray-100 transition cursor-pointer"
            >
              <FontAwesomeIcon icon={faGoogle} className="text-primary" />
              <span className="font-medium text-gray-700">Sign in with Google</span>
            </button>

            <div className="flex justify-between text-sm text-gray-500 mt-6">
              <a href="/register" className="hover:underline">
                Don't have an account?{" "}
                <span className="text-primary font-medium">Sign Up</span>
              </a>
            </div>
            <div className="text-sm text-center hover:underline cursor-pointer hover:text-primary">
              Forgot Password?
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}