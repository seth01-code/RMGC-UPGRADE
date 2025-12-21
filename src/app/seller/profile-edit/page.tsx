"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import Image from "next/image";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useRouter } from "next/navigation";
import newRequest from "../../utils/newRequest";
import upload from "../../utils/upload";
import Footer from "@/app/components/footer";
import SellerNavbar from "../components/navbar";

interface ProfileData {
  username: string;
  email: string;
  desc: string;
  phone: string;
  country: string;
  img: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  yearsOfExperience: string;
}

const EditProfile: React.FC = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData>({
    username: "",
    email: "",
    desc: "",
    phone: "",
    country: "",
    img: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    yearsOfExperience: "",
  });

  const [file, setFile] = useState<File | null>(null);
  const [passwordVisible, setPasswordVisible] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const res = await newRequest.get("/users/profile");
      return res.data;
    },
  });

  useEffect(() => {
    if (user) {
      setProfile({
        username: user.username || "",
        email: user.email || "",
        desc: user.desc || "",
        phone: user.phone || "",
        country: user.country || "",
        img: user.img || "",
        yearsOfExperience: user.yearsOfExperience || "",
      });
    }
  }, [user]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
  };

  const togglePassword = (field: keyof typeof passwordVisible) => {
    setPasswordVisible((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    let imageUrl = profile.img;

    if (file) {
      try {
        imageUrl = await upload(file);
      } catch {
        toast.error("Failed to upload image");
        return;
      }
    }

    if (
      profile.newPassword &&
      profile.newPassword !== profile.confirmPassword
    ) {
      toast.error("Passwords do not match");
      return;
    }

    const updatedProfile: any = {
      ...profile,
      img: typeof imageUrl === "string" ? imageUrl : imageUrl?.url || "",
    };

    if (profile.newPassword) updatedProfile.password = profile.newPassword;

    try {
      await newRequest.patch("/users/profile", updatedProfile);
      toast.success("Profile Updated Successfully");
      queryClient.invalidateQueries(["userProfile"]);
      router.push("/seller");
      router.refresh();
    } catch {
      toast.error("Failed to update profile");
    }
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse w-full max-w-3xl p-6 bg-gray-200 rounded-xl" />
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6 bg-red-50 border border-red-200 rounded-xl">
          <h2 className="text-2xl font-semibold text-red-700 mb-2">
            Failed to load profile
          </h2>
          <p className="text-red-500">Please try again later.</p>
        </div>
      </div>
    );

  return (
    <>
      <SellerNavbar />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-3xl bg-white rounded-3xl shadow-xl p-8 md:p-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-10 text-center">
            Edit Profile
          </h2>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="username"
                  className="block mb-2 font-medium text-gray-700"
                >
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  name="username"
                  value={profile.username}
                  onChange={handleChange}
                  placeholder="Username"
                  className="p-4 border rounded-xl shadow-sm w-full focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleChange}
                  placeholder="Email"
                  className="p-4 border rounded-xl shadow-sm w-full focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="yearsOfExperience"
                className="block mb-2 font-medium text-gray-700"
              >
                Years of Experience
              </label>
              <input
                id="yearsOfExperience"
                type="text"
                name="yearsOfExperience"
                value={profile.yearsOfExperience}
                onChange={handleChange}
                placeholder="Years of Experience"
                className="p-4 border rounded-xl shadow-sm w-full focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {["currentPassword", "newPassword", "confirmPassword"].map(
                (field) => (
                  <div key={field} className="relative">
                    <label
                      htmlFor={field}
                      className="block mb-2 font-medium text-gray-700 capitalize"
                    >
                      {field.replace(/([A-Z])/g, " $1")}
                    </label>
                    <input
                      id={field}
                      type={
                        passwordVisible[field as keyof typeof passwordVisible]
                          ? "text"
                          : "password"
                      }
                      name={field}
                      value={profile[field as keyof ProfileData] || ""}
                      onChange={handleChange}
                      placeholder={
                        field === "currentPassword"
                          ? "Current Password"
                          : field === "newPassword"
                          ? "New Password"
                          : "Confirm Password"
                      }
                      className="p-4 border rounded-xl shadow-sm w-full focus:ring-2 focus:ring-orange-500"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        togglePassword(field as keyof typeof passwordVisible)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {passwordVisible[
                        field as keyof typeof passwordVisible
                      ] ? (
                        <FaEyeSlash />
                      ) : (
                        <FaEye />
                      )}
                    </button>
                  </div>
                )
              )}
            </div>

            <div>
              <label
                htmlFor="desc"
                className="block mb-2 font-medium text-gray-700"
              >
                Bio
              </label>
              <textarea
                id="desc"
                name="desc"
                value={profile.desc}
                onChange={handleChange}
                placeholder="Bio"
                rows={4}
                className="w-full p-4 border rounded-xl shadow-sm focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block mb-2 font-medium text-gray-700"
              >
                Phone Number
              </label>
              <input
                id="phone"
                type="text"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                placeholder="Phone Number"
                className="p-4 border rounded-xl shadow-sm w-full focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
             <div>
  <label className="block mb-2 font-medium text-gray-700">Profile Image</label>
  <div
    className="relative w-full h-40 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 transition"
    onClick={() => document.getElementById("profileImg")?.click()}
  >
    <input
      type="file"
      id="profileImg"
      accept="image/*"
      onChange={handleFileChange}
      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
    />
    {file || profile.img ? (
      <div className="relative w-32 h-32">
        <Image
          src={file ? URL.createObjectURL(file) : profile.img}
          alt="Profile"
          fill
          className="object-cover rounded-full border-2 border-gray-200"
        />
      </div>
    ) : (
      <>
        <svg
          className="w-12 h-12 text-gray-400 mb-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16V4m0 0L3 8m4-4l4 4m6 8V4m0 0l-4 4m4-4l4 4"
          />
        </svg>
        <p className="text-gray-500">Click or drag file to upload</p>
      </>
    )}
  </div>
</div>
              {(profile.img || file) && (
                <div className="mt-4 w-32 h-32 relative mx-auto rounded-full overflow-hidden border-2 border-gray-200">
                  <Image
                    src={file ? URL.createObjectURL(file) : profile.img}
                    alt="Profile"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-orange-500 text-white font-semibold rounded-xl shadow-md hover:bg-orange-600 transition"
            >
              Save Changes
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default EditProfile;
