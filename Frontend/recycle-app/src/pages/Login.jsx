import React, { useContext, useState } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const Login = () => {
  const navigate = useNavigate();
  const { backendUrl, setIsLoggedin, getUserData } = useContext(AppContent);

  const [state, setState] = useState("Sign Up");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    axios.defaults.withCredentials = true;

    if (!backendUrl) {
      toast.error("Backend URL is missing! Check your .env file.");
      console.error("Missing VITE_BACKEND_URL in .env");
      return;
    }

    try {
      let data;

      if (state === "Sign Up") {
        const res = await axios.post(`${backendUrl}/api/auth/register`, {
          name,
          email,
          password,
        });
        data = res.data;
      } else {
        const res = await axios.post(`${backendUrl}/api/auth/login`, {
          email,
          password,
        });
        data = res.data;
      }

      if (data.success) {
        toast.success(state === "Sign Up" ? "Account created successfully" : "Welcome back");
        setIsLoggedin(true);

        // ✅ fetch user details (with role)
        const user = await getUserData();

        // ✅ redirect based on role
        if (user?.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      } else {
        toast.error(data.message || "Something went wrong");
      }
    } catch (error) {
      console.error("Error in login/signup:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Network error. Please try again.");
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Logo */}
      <div className="p-4">
        <img
          onClick={() => navigate("/")}
          src={assets.logo}
          alt="logo"
          className="w-28 sm:w-32 cursor-pointer"
        />
      </div>

      {/* Form Card */}
      <div className="flex items-center justify-center mb-10">
        <div className="flex gap-4 bg-white shadow-lg rounded-xl w-230">
          {/* Left Form Section */}
          <div className="w-[50%] py-10 px-5">
            <form onSubmit={onSubmitHandler} className="flex flex-col gap-4">
              <h1 className="text-2xl font-bold">
                {state === "Sign Up" ? "Get Started Now" : "Welcome Back!"}
              </h1>
              <p className="text-gray-600">
                {state === "Sign Up"
                  ? "Enter your credentials to create an account."
                  : "Enter your credentials to access your account."}
              </p>

              {/* Name Field */}
              {state === "Sign Up" && (
                <div className="flex flex-col">
                  <label htmlFor="name" className="mb-1 font-medium">
                    Name
                  </label>
                  <input
                    onChange={(e) => setName(e.target.value)}
                    value={name}
                    className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    id="name"
                    type="text"
                    placeholder="Enter your Name"
                    required
                  />
                </div>
              )}

              {/* Email Field */}
              <div className="flex flex-col">
                <label htmlFor="email" className="mb-1 font-medium">
                  Email address
                </label>
                <input
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  id="email"
                  type="email"
                  placeholder="Enter your Email"
                  required
                />
              </div>

              {/* Password Field */}
              <div className="flex flex-col">
                <label htmlFor="pass" className="mb-1 font-medium">
                  Password
                </label>
                <input
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  id="pass"
                  type="password"
                  placeholder="Enter your Password"
                  required
                />
              </div>

              {/* Forgot Password */}
              {state === "Login" && (
                <p
                  onClick={() => navigate("/reset-password")}
                  className="text-blue-800 cursor-pointer"
                >
                  Forget Password?
                </p>
              )}

              {/* Submit Button */}
              <button className="bg-[#186933] text-white rounded-lg py-2 hover:bg-green-700 transition cursor-pointer">
                {state === "Sign Up" ? "Sign Up" : "Login"}
              </button>
            </form>

            {/* Toggle Sign Up / Login */}
            {state === "Sign Up" ? (
              <p className="text-gray-400 text-xs text-center mt-4">
                Already have an account?{" "}
                <span
                  onClick={() => setState("Login")}
                  className="text-blue-800 cursor-pointer underline"
                >
                  Login here
                </span>
              </p>
            ) : (
              <p className="text-gray-400 text-xs text-center mt-4">
                Don’t have an account?{" "}
                <span
                  onClick={() => setState("Sign Up")}
                  className="text-blue-800 cursor-pointer underline"
                >
                  Sign Up
                </span>
              </p>
            )}
          </div>

          {/* Right Side Image */}
          <div className="flex items-end">
            <img
              src={state === "Sign Up" ? assets.signup : assets.login}
              alt="login"
              className="rounded-r-xl"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

// import React, { useContext, useState } from "react";
// import { assets } from "../assets/assets";
// import { useNavigate } from "react-router-dom";
// import { AppContent } from "../context/AppContext";
// import axios from "axios";
// import { toast } from "react-toastify";

// const Login = () => {
//   const navigate = useNavigate();
//   const { backendUrl, setIsLoggedin,getUserData } = useContext(AppContent);
//   const [state, setState] = useState("Sign Up");
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const onSubmitHandler = async (e) => {
//     e.preventDefault();
//     axios.defaults.withCredentials = true;

//     if (!backendUrl) {
//       toast.error("Backend URL is missing! Check your .env file.");
//       console.error("Missing VITE_BACKEND_URL in .env");
//       return;
//     }

//     try {
//       if (state === "Sign Up") {
//         const { data } = await axios.post(`${backendUrl}/api/auth/register`, {
//           name,
//           email,
//           password,
//         });

//         if (data.success) {
//           toast.success("Account created successfully");
//           setIsLoggedin(true);
//           getUserData()
//           navigate("/");
//         } else {
//           toast.error(data.message || "Signup failed");
//         }
//       } else {
//         const { data } = await axios.post(`${backendUrl}/api/auth/login`, {email, password,});

//         if (data.success) {
//           toast.success("Welcome back");
//           setIsLoggedin(true);
//           getUserData()
//           navigate("/");
//         } else {
//           toast.error(data.message || "Login failed");
//         }
//       }
//     } catch (error) {
//       console.error("Error in login/signup:", error);

//       if (error.response?.data?.message) {
//         toast.error(error.response.data.message);
//       } else {
//         toast.error("Network error. Please try again.");
//       }
//     }
//   };

//   return (
//     <div className="flex flex-col min-h-screen bg-gray-100">
//       {/* Logo */}
//       <div className="p-4">
//         <img
//           onClick={() => navigate("/")}
//           src={assets.logo}
//           alt="logo"
//           className="w-28 sm:w-32 cursor-pointer"
//         />
//       </div>

//       {/* Form Card */}
//       <div className="flex items-center justify-center mb-10">
//         <div className="flex gap-4 bg-white shadow-lg rounded-xl w-230">
//           {/* Left Form Section */}
//           <div className="w-[50%] py-10 px-5">
//             <form onSubmit={onSubmitHandler} className="flex flex-col gap-4">
//               <h1 className="text-2xl font-bold">
//                 {state === "Sign Up" ? "Get Started Now" : "Welcome Back!"}
//               </h1>
//               <p className="text-gray-600">
//                 {state === "Sign Up"
//                   ? "Enter your credentials to create an account."
//                   : "Enter your credentials to access your account."}
//               </p>

//               {/* Name Field */}
//               {state === "Sign Up" && (
//                 <div className="flex flex-col">
//                   <label htmlFor="name" className="mb-1 font-medium">
//                     Name
//                   </label>
//                   <input
//                     onChange={(e) => setName(e.target.value)}
//                     value={name}
//                     className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
//                     id="name"
//                     type="text"
//                     name="name"
//                     placeholder="Enter your Name"
//                     required
//                   />
//                 </div>
//               )}

//               {/* Email Field */}
//               <div className="flex flex-col">
//                 <label htmlFor="email" className="mb-1 font-medium">
//                   Email address
//                 </label>
//                 <input
//                   onChange={(e) => setEmail(e.target.value)}
//                   value={email}
//                   className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
//                   id="email"
//                   type="email"
//                   name="email"
//                   placeholder="Enter your Email"
//                   required
//                 />
//               </div>

//               {/* Password Field */}
//               <div className="flex flex-col">
//                 <label htmlFor="pass" className="mb-1 font-medium">
//                   Password
//                 </label>
//                 <input
//                   onChange={(e) => setPassword(e.target.value)}
//                   value={password}
//                   className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
//                   id="pass"
//                   type="password"
//                   name="password"
//                   placeholder="Enter your Password"
//                   required
//                 />
//               </div>

//               {/* Forgot Password */}
//               {state==="Sign Up"?('') :
//               (<p
//                 onClick={() => navigate("/reset-password")}
//                 className="text-blue-800 cursor-pointer"
//               >
//                 Forget Password?
//               </p>)} 

//               {/* Submit Button */}
//               <button className="bg-[#186933] text-white rounded-lg py-2 hover:bg-green-700 transition cursor-pointer">
//                 {state === "Sign Up" ? "Sign Up" : "Login"}
//               </button>
//             </form>

//             {/* Toggle Sign Up / Login */}
//             {state === "Sign Up" ? (
//               <p className="text-gray-400 text-xs text-center mt-4">
//                 Already have an account?
//                 <span
//                   onClick={() => setState("Login")}
//                   className="text-blue-800 cursor-pointer underline"
//                 >
//                   Login here
//                 </span>
//               </p>
//             ) : (
//               <p className="text-gray-400 text-xs text-center mt-4">
//                 Don’t have an account?
//                 <span
//                   onClick={() => setState("Sign Up")}
//                   className="text-blue-800 cursor-pointer underline"
//                 >
//                   Sign Up
//                 </span>
//               </p>
//             )}
//           </div>

//           {/* Right Side Image */}
//           <div className="flex items-end">
//             <img
//               src={state === "Sign Up" ? assets.signup : assets.login}
//               alt="login"
//               className="rounded-r-xl"
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;

