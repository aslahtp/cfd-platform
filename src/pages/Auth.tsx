import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";

function Auth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    if (isLogin) {
      axios.post("http://localhost:3000/auth/signin", {
        email: (form.elements.namedItem('email') as HTMLInputElement).value,
        password: (form.elements.namedItem('password') as HTMLInputElement).value,
      }).then((res) => {
        console.log(res);
        if (res.status === 200) {
          localStorage.setItem("token", res.data.token);
          navigate("/home");
        }
      }).catch((err) => {
        console.log(err);
      });
    } else {
      axios.post("http://localhost:3000/auth/signup", {
        name: (form.elements.namedItem('name') as HTMLInputElement).value,
        email: (form.elements.namedItem('email') as HTMLInputElement).value,
        password: (form.elements.namedItem('password') as HTMLInputElement).value,
      }).then((res) => {
        console.log(res);
        if (res.status === 201) {
          localStorage.setItem("token", res.data.token);
          navigate("/home");
        }
      }).catch((err) => {
        console.log(err);
      });
    }
  };

  return (
    <div className="bg-gray-100 h-screen flex flex-col items-center justify-center">
      <div className="flex flex-col gap-4 bg-white p-8 rounded-md w-96">
        <h1 className="text-3xl font-bold text-center">
          {isLogin ? "LOGIN" : "SIGN UP"}
        </h1>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              className="border-2 border-gray-300 rounded-md p-2"
              id="name"
              type="text"
              placeholder="Name"
              required
            />
          )}
          <input
            className="border-2 border-gray-300 rounded-md p-2"
            id="email"
            type="email"
            placeholder="Email"
            required
          />
          <input
            className="border-2 border-gray-300 rounded-md p-2"
            id="password"
            type="password"
            placeholder="Password"
            required
          />
          {!isLogin && (
            <input
              className="border-2 border-gray-300 rounded-md p-2"
              id="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              required
            />
          )}

          <button
            className="bg-blue-500 text-white p-2 rounded-md"
            type="submit"
          >
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </form>

        <p className="text-center">
          {isLogin ? (
            <>
              Don't have an account?{" "}
              <button
                onClick={() => setIsLogin(false)}
                className="text-blue-500 underline"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                onClick={() => setIsLogin(true)}
                className="text-blue-500 underline"
              >
                Login
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

export default Auth;  
