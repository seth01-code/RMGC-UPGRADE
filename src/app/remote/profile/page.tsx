"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { CheckCircle, } from "lucide-react";
import newRequest from "../../utils/newRequest";

export default function WorkerProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);

  const [profile, setProfile] = useState({
    fullName: "",
    bio: "",
    phone: "",
    address: "",
    stateOfResidence: "",
    country: "",
    services: "",
    portfolioLink: "",
    cvUrl: "",
  });

  /* ---------------- AUTH + FETCH PROFILE ---------------- */
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (!storedUser) return router.replace("/login");

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    const fetchProfile = async () => {
      try {
        const res = await newRequest.get("/users/worker-profile");
        const data = res.data;
        setProfile({
          fullName: data.fullName || "",
          bio: data.bio || "",
          phone: data.phone || "",
          address: data.address || "",
          stateOfResidence: data.stateOfResidence || "",
          country: data.country || "",
          services: data.services?.join(", ") || "",
          portfolioLink: data.portfolioLink?.[0] || "",
          cvUrl: data.cvUrl || "",
        });
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Failed to fetch profile");
      }
    };

    fetchProfile();
  }, [router]);

  if (!user) return null;

  /* ---------------- HANDLERS ---------------- */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      let cvUrl = profile.cvUrl;

      // Upload CV if a new file is selected
      if (cvFile) {
        const formData = new FormData();
        formData.append("file", cvFile);
        const uploadRes = await newRequest.post("/upload/cv", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        cvUrl = uploadRes.data.url;
      }

      // Update profile
      await newRequest.patch("/users/worker-profile", {
        ...profile,
        services: profile.services.split(",").map((s) => s.trim()),
        portfolioLink: profile.portfolioLink ? [profile.portfolioLink] : [],
        cvUrl,
      });

      toast.success("Profile updated successfully!");
      setProfile((prev) => ({ ...prev, cvUrl }));
      setCvFile(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <h1 className="text-3xl font-bold">My Profile</h1>

      <div className="bg-white p-6 rounded-xl shadow space-y-5">
        <div className="flex flex-col">
          <label htmlFor="fullName" className="font-medium mb-1">
            Full Name
          </label>
          <input
            id="fullName"
            name="fullName"
            value={profile.fullName}
            onChange={handleChange}
            placeholder="Full Name"
            className="w-full border p-3 rounded-xl"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="bio" className="font-medium mb-1">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            value={profile.bio}
            onChange={handleChange}
            placeholder="Short bio about yourself"
            className="w-full h-28 border p-3 rounded-xl"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="phone" className="font-medium mb-1">
            Phone Number
          </label>
          <input
            id="phone"
            name="phone"
            value={profile.phone}
            onChange={handleChange}
            placeholder="Phone Number"
            className="w-full border p-3 rounded-xl"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="address" className="font-medium mb-1">
            Address
          </label>
          <input
            id="address"
            name="address"
            value={profile.address}
            onChange={handleChange}
            placeholder="Address"
            className="w-full border p-3 rounded-xl"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="stateOfResidence" className="font-medium mb-1">
            State of Residence
          </label>
          <input
            id="stateOfResidence"
            name="stateOfResidence"
            value={profile.stateOfResidence}
            onChange={handleChange}
            placeholder="State"
            className="w-full border p-3 rounded-xl"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="country" className="font-medium mb-1">
            Country
          </label>
          <input
            id="country"
            name="country"
            value={profile.country}
            onChange={handleChange}
            placeholder="Country"
            className="w-full border p-3 rounded-xl"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="services" className="font-medium mb-1">
            Skills / Services
          </label>
          <input
            id="services"
            name="services"
            value={profile.services}
            onChange={handleChange}
            placeholder="Skills / Services (comma-separated)"
            className="w-full border p-3 rounded-xl"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="portfolioLink" className="font-medium mb-1">
            Portfolio Link
          </label>
          <input
            id="portfolioLink"
            name="portfolioLink"
            value={profile.portfolioLink}
            onChange={handleChange}
            placeholder="Portfolio link"
            className="w-full border p-3 rounded-xl"
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={loading}
        className="w-full px-6 py-4 bg-green-600 text-white rounded-xl flex items-center justify-center gap-2 text-lg"
      >
        <CheckCircle className="w-5 h-5" />
        {loading ? "Saving..." : "Save Profile"}
      </button>
    </div>
  );
}
