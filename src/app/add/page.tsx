"use client";

import React, {
  useEffect,
  useReducer,
  useState,
  ChangeEvent,
  FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import newRequest from "../utils/newRequest";
import upload from "../utils/upload";
import { gigReducer, INITIAL_STATE, GigState } from "../reducers/gigReducer";
import { useExchangeRate } from "../hooks/useExchangeRate";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";

const Add: React.FC = () => {
  type GigField = keyof GigState;
  const router = useRouter();
  const queryClient = useQueryClient();
  const [state, dispatch] = useReducer(gigReducer, INITIAL_STATE);
  const [singleFile, setSingleFile] = useState<File | undefined>();
  const [featureInput, setFeatureInput] = React.useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [displayPrice, setDisplayPrice] = useState("");
  const [categoryInput, setCategoryInput] = useState(state.cat || "");
  const [showDropdown, setShowDropdown] = useState(false);
  const [country, setCountry] = useState("United States");

  const currentUser: any =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("currentUser") || "null")
      : null;

  const { data: userData } = useQuery({
    queryKey: ["userData", currentUser?.id],
    queryFn: async () => {
      const res = await newRequest.get(`/users/me`);
      return res.data;
    },
    enabled: !!currentUser?.id,
  });

  useEffect(() => {
    if (userData?.country) setCountry(userData.country);
  }, [userData]);

  const { exchangeRate } = useExchangeRate(country);

  const categories = [
    "Web Development",
    "Graphic Design",
    "Digital Marketing",
    "Content Writing",
    "Video Editing",
    "App Development",
    "SEO (Search Engine Optimization)",
    "Social Media Management",
    "Mobile App Design",
    "Branding",
    "Photography",
    "Illustration",
    "Logo Design",
    "UI/UX Design",
    "E-commerce Development",
    "Copywriting",
    "Voice Over",
    "Translation Services",
    "Music Production",
    "Business Consulting",
    "Virtual Assistant",
    "Photography Editing",
    "3D Modeling",
    "Animation",
    "Web Scraping",
    "Game Development",
    "Custom Software Development",
    "Cybersecurity",
    "Data Analysis",
    "Blockchain Development",
    "Artificial Intelligence & Machine Learning",
    "Cloud Computing",
  ];

  const handleCategoryChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCategoryInput(value);
    dispatch({ type: "CHANGE_INPUT", payload: { name: "cat", value } });
    setShowDropdown(value.length > 0);
  };

  const handleCategorySelect = (cat: string) => {
    setCategoryInput(cat);
    setShowDropdown(false);
    dispatch({ type: "CHANGE_INPUT", payload: { name: "cat", value: cat } });
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const name = e.target.name as GigField;
    const value = e.target.value;

    dispatch({
      type: "CHANGE_INPUT",
      payload: {
        name,
        value,
      },
    });
  };

  const handleFeature = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = (e.currentTarget[0] as HTMLInputElement).value;
    if (input.trim()) {
      dispatch({ type: "ADD_FEATURE", payload: input.trim() });
      (e.currentTarget[0] as HTMLInputElement).value = "";
    }
  };

  const handleUpload = async () => {
    setUploading(true);
    try {
      const cover =
        singleFile && singleFile.type.startsWith("image/")
          ? (await upload(singleFile))?.url || ""
          : "";

      const validTypes = ["image/", "video/", "application/pdf"];
      const filteredFiles = files.filter((file) =>
        validTypes.some((type) => file.type.startsWith(type))
      );

      const uploads = await Promise.all(
        filteredFiles.map(async (file) => {
          const uploaded = await upload(file);
          return { url: uploaded?.url || "", type: file.type };
        })
      );

      const images = uploads
        .filter((f) => f.type.startsWith("image/"))
        .map((f) => f.url);
      const videos = uploads
        .filter((f) => f.type.startsWith("video/"))
        .map((f) => f.url);
      const documents = uploads
        .filter((f) => f.type === "application/pdf")
        .map((f) => f.url);

      dispatch({
        type: "ADD_IMAGES",
        payload: { cover, images, videos, documents },
      });
      toast.success("Files uploaded successfully");
    } catch {
      toast.error("Upload failed, please try again");
    } finally {
      setUploading(false);
    }
  };

  const mutation = useMutation({
    mutationFn: async (gig: any) => {
      const res = await newRequest.post("/gigs", gig);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myGigs"] });
      toast.success("Gig added successfully");
      router.push("/mygigs");
    },
    onError: () => toast.error("Failed to add gig"),
  });
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove all non-numeric characters (leave only digits)
    const rawValue = e.target.value.replace(/\D/g, "");

    // Format number with commas for display
    const formattedValue = rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    // Dispatch the raw numeric value (Paystack expects integer values)
    dispatch({
      type: "CHANGE_INPUT",
      payload: { name: "price", value: rawValue },
    });

    // Update formatted display
    setDisplayPrice(formattedValue);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const priceUSD = (Number(state.price) / exchangeRate).toFixed(0);
    mutation.mutate({ ...state, price: Number(priceUSD) });
  };

  return (
    <div className="flex justify-center px-4 sm:px-8 py-12 bg-gradient-to-b from-orange-50 to-white min-h-screen">
      <ToastContainer position="top-center" autoClose={3000} pauseOnHover />
      <div className="w-full max-w-6xl bg-white shadow-lg rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-gray-700 mb-10 text-center">
          Add New Gig
        </h1>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12"
        >
          {/* LEFT SECTION */}
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block mb-2 font-semibold text-gray-700">
                Title
              </label>
              <input
                type="text"
                name="title"
                onChange={handleChange}
                placeholder="Enter gig title"
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
              />
            </div>

            {/* Category */}
            <div className="relative">
              <label className="block mb-2 font-semibold text-gray-700">
                Category
              </label>
              <input
                type="text"
                value={categoryInput}
                onChange={handleCategoryChange}
                onFocus={() => setShowDropdown(true)}
                placeholder="Select category"
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
              />
              {showDropdown && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {categories
                    .filter((cat) =>
                      cat.toLowerCase().includes(categoryInput.toLowerCase())
                    )
                    .map((cat, i) => (
                      <div
                        key={i}
                        onClick={() => handleCategorySelect(cat)}
                        className="px-4 py-2 cursor-pointer hover:bg-orange-100 hover:text-orange-700 transition"
                      >
                        {cat}
                      </div>
                    ))}
                </div>
              )}
            </div>
            {/* Cover Image */}
            <div>
              <label className="block mb-2 font-semibold text-gray-700">
                Cover Image
              </label>
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-orange-400 rounded-lg cursor-pointer hover:bg-orange-50 transition">
                <span className="text-orange-600 font-medium">
                  Click to select a cover image
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSingleFile(e.target.files?.[0])}
                  className="hidden"
                />
              </label>

              {singleFile && (
                <div className="flex items-center gap-3 mt-3">
                  <div className="relative w-32 h-32">
                    <Image
                      src={URL.createObjectURL(singleFile)}
                      alt="Cover Preview"
                      fill
                      className="object-cover rounded-xl border border-gray-200 shadow-sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setSingleFile(undefined)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow"
                  >
                    ✖
                  </button>
                </div>
              )}
            </div>

            {/* Additional Files */}
            <div className="mt-8">
              <label className="block mb-4 text-center text-lg font-semibold text-gray-500">
                Upload Additional Files (Images, Videos, PDFs)
              </label>

              <div className="flex flex-col gap-6">
                {/* Images */}
                <div>
                  <label className="block mb-2 font-semibold text-gray-700">
                    Upload Images
                  </label>
                  <label className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-orange-400 rounded-lg cursor-pointer hover:bg-orange-50 transition">
                    <span className="text-orange-600 font-medium">
                      Click to select images
                    </span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        const newImages = Array.from(
                          e.target.files || []
                        ).filter((f) => f.type.startsWith("image/"));
                        setFiles((prev) => [...prev, ...newImages]);
                      }}
                      className="hidden"
                    />
                  </label>

                  {/* Images Preview */}
                  <div className="flex flex-wrap gap-3 mt-2">
                    {files
                      .filter((f) => f.type.startsWith("image/"))
                      .map((file) => (
                        <div
                          key={file.name + file.lastModified}
                          className="relative w-24 h-24"
                        >
                          <Image
                            src={URL.createObjectURL(file)}
                            alt={`Image Preview`}
                            fill
                            className="object-cover rounded-lg border border-gray-200 shadow-sm"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setFiles((prev) => prev.filter((f) => f !== file))
                            }
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                          >
                            ✖
                          </button>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Videos */}
                <div>
                  <label className="block mb-2 font-semibold text-gray-700">
                    Upload Videos
                  </label>
                  <label className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-orange-400 rounded-lg cursor-pointer hover:bg-orange-50 transition">
                    <span className="text-orange-600 font-medium">
                      Click to select videos
                    </span>
                    <input
                      type="file"
                      multiple
                      accept="video/*"
                      onChange={(e) => {
                        const newVideos = Array.from(
                          e.target.files || []
                        ).filter((f) => f.type.startsWith("video/"));
                        setFiles((prev) => [...prev, ...newVideos]);
                      }}
                      className="hidden"
                    />
                  </label>

                  {/* Videos Preview */}
                  <div className="flex flex-wrap gap-3 mt-2">
                    {files
                      .filter((f) => f.type.startsWith("video/"))
                      .map((file) => (
                        <div
                          key={file.name + file.lastModified}
                          className="relative w-48 h-32"
                        >
                          <video
                            src={URL.createObjectURL(file)}
                            controls
                            className="w-full h-full rounded-lg border border-gray-200 shadow-sm"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setFiles((prev) => prev.filter((f) => f !== file))
                            }
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                          >
                            ✖
                          </button>
                        </div>
                      ))}
                  </div>
                </div>

                {/* PDFs */}
                <div>
                  <label className="block mb-2 font-semibold text-gray-700">
                    Upload PDF Documents
                  </label>
                  <label className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-orange-400 rounded-lg cursor-pointer hover:bg-orange-50 transition">
                    <span className="text-orange-600 font-medium">
                      Click to select PDFs
                    </span>
                    <input
                      type="file"
                      multiple
                      accept="application/pdf"
                      onChange={(e) => {
                        const newDocs = Array.from(e.target.files || []).filter(
                          (f) => f.type === "application/pdf"
                        );
                        setFiles((prev) => [...prev, ...newDocs]);
                      }}
                      className="hidden"
                    />
                  </label>

                  {/* PDFs Preview */}
                  <div className="flex flex-wrap gap-3 mt-2">
                    {files
                      .filter((f) => f.type === "application/pdf")
                      .map((file) => (
                        <div
                          key={file.name + file.lastModified}
                          className="relative"
                        >
                          <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 font-medium shadow-sm">
                            {file.name}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setFiles((prev) => prev.filter((f) => f !== file))
                            }
                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            ✖
                          </button>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Upload All Button */}
                <button
                  type="button"
                  className="mt-3 bg-orange-500 text-white px-5 py-2 rounded-lg hover:bg-orange-600 transition shadow"
                  onClick={handleUpload}
                  disabled={uploading}
                >
                  {uploading ? "Uploading..." : "Upload All Selected Files"}
                </button>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block mb-2 font-semibold text-gray-700">
                Description
              </label>
              <textarea
                name="desc"
                onChange={handleChange}
                placeholder="Describe your gig..."
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
              />
            </div>
          </div>

          {/* RIGHT SECTION */}
          <div className="space-y-6">
            {/* Service Title */}
            <div>
              <label className="block mb-2 font-semibold text-gray-700">
                Service Title
              </label>
              <input
                name="shortTitle"
                onChange={handleChange}
                placeholder="Short title"
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
              />
            </div>

            {/* Short Description */}
            <div>
              <label className="block mb-2 font-semibold text-gray-700">
                Short Description
              </label>
              <textarea
                name="shortDesc"
                onChange={handleChange}
                placeholder="Short description"
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
              />
            </div>

            {/* Delivery Time */}
            <div>
              <label className="block mb-2 font-semibold text-gray-700">
                Delivery Time (days)
              </label>
              <input
                type="number"
                name="deliveryTime"
                min={1} // minimum value 1
                onChange={handleChange}
                value={state.deliveryTime || 1} // default 1
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
              />
            </div>

            {/* Revisions */}
            <div>
              <label className="block mb-2 font-semibold text-gray-700">
                Revisions
              </label>
              <input
                type="number"
                name="revisionNumber"
                min={1} // minimum value 1
                onChange={handleChange}
                value={state.revisionNumber || 1} // default 1
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
              />
            </div>

            {/* Features */}
            <div>
              <label className="block mb-2 font-semibold text-gray-700">
                Features
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  placeholder="Add feature"
                  className="flex-1 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (featureInput.trim() !== "") {
                        dispatch({
                          type: "ADD_FEATURE",
                          payload: featureInput,
                        });
                        setFeatureInput("");
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (featureInput.trim() !== "") {
                      dispatch({ type: "ADD_FEATURE", payload: featureInput });
                      setFeatureInput("");
                    }
                  }}
                  className="bg-orange-500 text-white px-5 py-2 rounded-lg hover:bg-orange-600 transition shadow"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                {state.features.map((f: string) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() =>
                      dispatch({ type: "REMOVE_FEATURE", payload: f })
                    }
                    className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full flex items-center gap-2 font-medium shadow-sm hover:bg-orange-200"
                  >
                    {f} ✖
                  </button>
                ))}
              </div>
            </div>

            {/* Price */}
            <div>
              <label className="block mb-2 font-semibold text-gray-700">
                Price
              </label>
              <input
                type="text"
                name="price"
                onChange={handlePriceChange}
                value={displayPrice}
                placeholder="Enter price"
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-6 bg-orange-500 text-white py-3 rounded-xl font-bold text-lg hover:bg-orange-600 transition shadow"
            >
              Create Gig
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Add;
