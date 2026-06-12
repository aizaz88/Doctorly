import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const Login = () => {
  const navigate = useNavigate();
  const { registerUser, loginUser } = useContext(AppContext);
  const [mode, setMode] = useState("Sign Up");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    let success = false;

    try {
      if (mode === "Sign Up") {
        // Validation
        if (!name || name.length < 2) {
          alert("Please enter a valid name");
          setIsLoading(false);
          return;
        }
        success = await registerUser(name, email, password);
      } else {
        success = await loginUser(email, password);
      }

      if (success) {
        // Redirect to home after successful login/register
        setTimeout(() => {
          navigate("/");
        }, 500);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={onSubmitHandler}
        className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg"
      >
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-900">
          {mode === "Sign Up" ? "Create Account" : "Login"}
        </h1>

        <p className="text-sm text-gray-600 text-center mb-6">
          {mode === "Sign Up"
            ? "Please sign up to book appointment"
            : "Please login to continue"}
        </p>

        {mode === "Sign Up" && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required={mode === "Sign Up"}
            />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Password (min 8 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition duration-300"
        >
          {isLoading
            ? "Processing..."
            : mode === "Sign Up"
              ? "Create Account"
              : "Login"}
        </button>

        <p className="text-sm text-center text-gray-600 mt-6">
          {mode === "Sign Up"
            ? "Already have an account?"
            : "Don't have an account?"}
          <span
            className="text-blue-600 font-medium cursor-pointer ml-1 hover:text-blue-700"
            onClick={() => {
              setMode(mode === "Sign Up" ? "Login" : "Sign Up");
              setName("");
              setEmail("");
              setPassword("");
            }}
          >
            {mode === "Sign Up" ? "Login" : "Sign Up"}
          </span>
        </p>
      </form>
    </div>
  );
};

export default Login;
