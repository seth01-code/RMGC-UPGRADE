"use client";

import React, { useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import newRequest from "../utils/newRequest";
import upload from "../utils/upload";
import { toast, ToastContainer } from "react-toastify";
import { motion } from "framer-motion";
import { MdOutlinePostAdd } from "react-icons/md";
import { HiOutlinePhotograph } from "react-icons/hi";
import { IoClose } from "react-icons/io5";
import Image from "next/image";

const categories = [
  "Web Development", "Graphic Design", "Digital Marketing", "Content Writing",
  "Video Editing", "App Development", "SEO (Search Engine Optimization)",
  "Social Media Management", "Mobile App Design", "Branding", "Photography",
  "Illustration", "Logo Design", "UI/UX Design", "E-commerce Development",
  "Copywriting", "Voice Over", "Translation Services", "Music Production",
  "Business Consulting", "Virtual Assistant", "Photography Editing",
  "3D Modeling", "Animation", "Web Scraping", "Game Development",
  "Custom Software Development", "Cybersecurity", "Data Analysis",
  "Blockchain Development", "Artificial Intelligence & Machine Learning",
  "Cloud Computing",
];

const budgetRanges = [
  "Under $50", "$50 – $100", "$100 – $250", "$250 – $500",
  "$500 – $1,000", "$1,000 – $5,000", "$5,000+", "Open to Negotiation",
];

export default function PostRequestPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const currentUser: any =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("currentUser") || "null")
      : null;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [categoryInput, setCategoryInput] = useState("");
  const [showCatDropdown, setShowCatDropdown] = useState(false);
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const handleCategorySelect = (cat: string) => {
    setCategory(cat);
    setCategoryInput(cat);
    setShowCatDropdown(false);
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
      setTagInput("");
    }
  };

  const handleFileAdd = (e: ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    setAttachments((prev) => [...prev, ...newFiles]);
  };

  const mutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await newRequest.post("/requests", payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["serviceRequests"] });
      toast.success("Request posted successfully!");
      router.push("/requests");
    },
    onError: () => toast.error("Failed to post request. Please try again."),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !category) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setUploading(true);
    try {
      const uploaded = await Promise.all(
        attachments.map(async (file) => {
          const result = await upload(file);
          return { url: result?.url || "", type: file.type };
        })
      );

      const images = uploaded.filter((f) => f.type.startsWith("image/")).map((f) => f.url);
      const videos = uploaded.filter((f) => f.type.startsWith("video/")).map((f) => f.url);
      const documents = uploaded.filter((f) => f.type === "application/pdf").map((f) => f.url);

      mutation.mutate({
        title,
        description,
        category,
        budget,
        deadline,
        tags,
        images,
        videos,
        documents,
      });
    } catch {
      toast.error("File upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white px-4 sm:px-8 py-12">
      <ToastContainer position="top-center" autoClose={3000} />

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 bg-orange-100 rounded-2xl mb-4">
            <MdOutlinePostAdd className="text-orange-500 text-3xl" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Post a Service Request</h1>
          <p className="mt-2 text-gray-500 text-sm sm:text-base">
            Describe what you need — qualified freelancers will apply directly to your post.
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-6 sm:p-10 space-y-7"
        >
          {/* Title */}
          <div>
            <label className="block mb-2 font-semibold text-gray-700">
              Request Title <span className="text-orange-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. I need a logo designer for my startup"
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm text-gray-800"
            />
          </div>

          {/* Category */}
          <div className="relative">
            <label className="block mb-2 font-semibold text-gray-700">
              Category <span className="text-orange-500">*</span>
            </label>
            <input
              type="text"
              value={categoryInput}
              onChange={(e) => {
                setCategoryInput(e.target.value);
                setCategory(e.target.value);
                setShowCatDropdown(true);
              }}
              onFocus={() => setShowCatDropdown(true)}
              placeholder="Select or type a category"
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
            />
            {showCatDropdown && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto">
                {categories
                  .filter((c) => c.toLowerCase().includes(categoryInput.toLowerCase()))
                  .map((c, i) => (
                    <div
                      key={i}
                      onClick={() => handleCategorySelect(c)}
                      className="px-4 py-2 cursor-pointer hover:bg-orange-50 hover:text-orange-700 transition text-sm"
                    >
                      {c}
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block mb-2 font-semibold text-gray-700">
              Description <span className="text-orange-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              placeholder="Describe the service you need, your goals, and any specific requirements..."
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm resize-none text-gray-800"
            />
            <p className="text-right text-xs text-gray-400 mt-1">{description.length} characters</p>
          </div>

          {/* Budget & Deadline row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block mb-2 font-semibold text-gray-700">Budget Range</label>
              <select
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm bg-white text-gray-700"
              >
                <option value="">Select a range</option>
                {budgetRanges.map((b, i) => (
                  <option key={i} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-2 font-semibold text-gray-700">Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm text-gray-700"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block mb-2 font-semibold text-gray-700">Tags / Skills Needed</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); handleAddTag(); }
                }}
                placeholder="e.g. React, Figma, Photoshop"
                className="flex-1 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="bg-orange-500 text-white px-5 py-2 rounded-lg hover:bg-orange-600 transition shadow"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {tag}
                  <button type="button" onClick={() => setTags((prev) => prev.filter((t) => t !== tag))}>
                    <IoClose className="text-base hover:text-red-500" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Attachments */}
          <div>
            <label className="block mb-2 font-semibold text-gray-700">
              Attachments <span className="text-gray-400 font-normal text-sm">(images, videos, PDFs)</span>
            </label>
            <label className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-orange-400 rounded-lg cursor-pointer hover:bg-orange-50 transition">
              <HiOutlinePhotograph className="text-orange-400 text-3xl mb-1" />
              <span className="text-orange-600 font-medium text-sm">Click to attach files</span>
              <input
                type="file"
                multiple
                accept="image/*,video/*,application/pdf"
                onChange={handleFileAdd}
                className="hidden"
              />
            </label>

            {attachments.length > 0 && (
              <div className="mt-4 space-y-3">
                {/* Image previews */}
                <div className="flex flex-wrap gap-3">
                  {attachments
                    .filter((f) => f.type.startsWith("image/"))
                    .map((file) => (
                      <div key={file.name + file.size} className="relative w-20 h-20">
                        <Image
                          src={URL.createObjectURL(file)}
                          alt="preview"
                          fill
                          className="object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => setAttachments((prev) => prev.filter((f) => f !== file))}
                          className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          <IoClose />
                        </button>
                      </div>
                    ))}
                </div>

                {/* Video & PDF labels */}
                <div className="flex flex-wrap gap-2">
                  {attachments
                    .filter((f) => f.type.startsWith("video/") || f.type === "application/pdf")
                    .map((file) => (
                      <span
                        key={file.name + file.size}
                        className="flex items-center gap-1 bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm"
                      >
                        {file.type === "application/pdf" ? "📄" : "🎬"} {file.name}
                        <button
                          type="button"
                          onClick={() => setAttachments((prev) => prev.filter((f) => f !== file))}
                        >
                          <IoClose className="text-red-400 hover:text-red-600" />
                        </button>
                      </span>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={uploading || mutation.isPending}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl text-lg transition shadow-md disabled:opacity-60"
          >
            {uploading || mutation.isPending ? "Posting..." : "Post Request"}
          </motion.button>
        </motion.form>
      </div>
    </div>
  );
}