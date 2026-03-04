"use client";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import Image from "next/image";
import Logo from "@/components/Logo";
import { useRouter } from "next/navigation";


export default function RegisterPage() {

  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e : React.FormEvent) => {
    e.preventDefault();
    let user = {
        email: email,
        password: password
    }
    try{
        const res = await fetch(process.env.NEXT_PUBLIC_SERVER_URL + "/user", {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify(user)
        });

        if(!res.ok){
            const data = await res.json();
            setError(data.message || "Coś poszło nie tak")
            return ;
        }
        
        setSuccess(true);

        setTimeout(() => {
          router.push("/login"); 
        }, 5000);


    }catch(err) {
        console.error(err);
        setError("Nie udało się połączyć z serwerem")
    }


  };


  return (
    <>
      {success && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
          <h2 className="text-2xl font-semibold text-gray-700">
            Pomyślnie stworzono konto 🎉
          </h2>
          <p className="text-gray-500 mt-2">
            Za chwilę nastąpi przekierowanie...
          </p>
        </div>
      )}
    <div className="w-screen h-screen bg-gradient-to-br from-primary to-secondary flex">
      <div className="w-[50%]"></div>
      <div className="bg-white w-[50%] p-20 relative">
        <a href="/">
          <Logo />
        </a>
        <div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[80%]">
          <h1 className="font-bold text-4xl mb-8">Sign up</h1>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <form className="space-y-1" onSubmit={handleRegister}>
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
              Sign up
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
              <span className="font-medium text-gray-700">Sign up with Google</span>
            </button>

            <div className="flex justify-between text-sm text-gray-500 mt-6">
              <a href="/login" className="hover:underline">
                Already have account?{" "}
                <span className="text-primary font-medium">Sign up</span>
              </a>
            </div>
            <div className="text-sm text-center hover:underline cursor-pointer hover:text-primary">
              Forgot Password?
            </div>
          </form>
        </div>
      </div>
    </div>
    </>
  );
}