// <========================== file to create the signup page ================>

// importing the required modules
import React, { ChangeEventHandler, useState } from "react";
import { isStrongPassword, isValidUsername } from "../../utils/validate";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface FormData {
  username?: string;
  email?: string;
  phone?: string;
  password?: string;
}

const Signup = () => {
  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    phone: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [errors, setError] = useState<FormData>({});

  const navigate = useNavigate();

  // function for change events
  const changeEvent: ChangeEventHandler<HTMLInputElement> = (e) => {
    const target = e.currentTarget;
    const { id, value } = target;
    let error = "";

    if (id === "username" && !isValidUsername(value)) {
      error = "username should contain only alphabetic characters";
    } else if (id === "password" && !isStrongPassword(value)) {
      error =
        "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a digit, and a special character";
    }

    setError((prevError) => ({ ...prevError, [id]: error }));

    setFormData((prevData) => ({ ...prevData, [id]: value }));
  };

  // function for submitting the data
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (Object.values(errors).some((error) => error !== "")) {
      setMessage("Please fix the errors before submitting");
      return;
    }

    const baseUrl = import.meta.env.VITE_BASE_URL;

    try {
      const response = await axios.post(`${baseUrl}/signup`, formData);

      if (response.status === 201) {
        console.log(response.data);
        navigate("/");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="bg-custom w-full flex justify-center items-center min-h-screen">
      <form
        onSubmit={handleSubmit}
        className="relative w-[450px] bg-[rgba(0,0,0,0.2)] backdrop-blur-[25px] border-2 border-[#c6c3c3] rounded-[15px] p-[7.5em_2.5em_4em_2.5em] text-[#ffffff]"
      >
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 flex items-center justify-center bg-[#c6c3c3] w-[140px] h-[70px] rounded-b-[20px]">
          <span className="text-[30px] text-[#000000]">Signup</span>
        </div>
        {message && <p className="text-red-500 mt-4">{message}</p>}
        <div className="relative flex flex-col items-center my-5">
          <input
            type="text"
            id="username"
            onChange={changeEvent}
            className="input_field peer"
            placeholder=" "
            required
          />
          <label htmlFor="email" className="label">
            username
          </label>
          {errors.username && (
            <p className="text-red-500 mt-1">{errors.username}</p>
          )}
        </div>

        <div className="relative flex flex-col items-center my-5">
          <input
            type="email"
            id="email"
            onChange={changeEvent}
            className="input_field peer"
            placeholder=" "
            required
          />
          <label htmlFor="email" className="label">
            email
          </label>
        </div>

        <div className="relative flex flex-col items-center my-5">
          <input
            type="string"
            id="phone"
            onChange={changeEvent}
            className="input_field peer"
            placeholder=" "
            required
          />
          <label htmlFor="phone" className="label">
            phone
          </label>
        </div>

        <div className="relative flex flex-col items-center my-5">
          <input
            type="password"
            id="password"
            onChange={changeEvent}
            className="input_field peer"
            placeholder=" "
            required
          />
          <label htmlFor="password" className="label">
            password
          </label>
          {errors.password && (
            <p className="text-red-500 mt-1">{errors.password}</p>
          )}
        </div>

        <div className="relative flex flex-col items-center my-5">
          <button
            type="submit"
            className="w-full h-[45px] bg-[#f71616] text-[16px] font-medium border-none rounded-full cursor-pointer transition-colors duration-300 uppercase hover:bg-[#f53c3c]"
          >
            Signup
          </button>
        </div>
      </form>
    </div>
  );
};

export default Signup;
