"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import newRequest from "../../utils/newRequest";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { FaTrash, FaExclamationTriangle } from "react-icons/fa";
import SellerNavbar from "@/app/seller/components/navbar";
import Footer from "@/app/components/footer";
import { toast } from "react-toastify";

interface Seller {
  _id: string;
  username: string;
  email: string;
  img?: string;
}

const Sellers: React.FC = () => {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Fetch sellers
  const fetchSellers = async () => {
    try {
      setError(false);
      const response = await newRequest.get("/users/sellers");
      setSellers(response.data);
    } catch (err) {
      console.error("Error fetching sellers", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // Delete a seller
  const handleDelete = async (id: string, sellerName: string) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete seller "${sellerName}"? This action cannot be undone.`
    );
    if (!confirmDelete) return;

    const deletingToast = toast.info(`Deleting ${sellerName}...`, {
      autoClose: false,
    });

    try {
      const response = await newRequest.delete(`/users/${id}`);
      toast.dismiss(deletingToast);

      // Success
      setSellers((prev) => prev.filter((seller) => seller._id !== id));
      toast.success(`Seller "${sellerName}" deleted successfully!`);
    } catch (err: any) {
      toast.dismiss(deletingToast);

      if (err.response) {
        // Server responded with a status code outside 2xx
        toast.error(
          `Failed to delete "${sellerName}". ${
            err.response.data.message || "Server error."
          }`
        );
      } else if (err.request) {
        // No response received
        toast.error(`No response from server. Check your connection.`);
      } else {
        // Something else
        toast.error(`Error: ${err.message}`);
      }

      console.error("Delete error:", err);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  if (loading) {
    // Skeleton Loader
    return (
      <div className="p-6 max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {Array(6)
          .fill(0)
          .map((_, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl shadow-lg bg-white flex flex-col items-center gap-4"
            >
              <Skeleton circle height={80} width={80} />
              <Skeleton height={20} width={100} />
              <Skeleton height={16} width={140} />
              <Skeleton height={32} width={80} />
            </div>
          ))}
      </div>
    );
  }

  if (error) {
    // Stylish Error
    return (
      <div className="p-6 max-w-3xl mx-auto flex flex-col items-center gap-4">
        <FaExclamationTriangle className="text-red-500 text-4xl" />
        <h2 className="text-red-600 font-semibold text-xl">
          Failed to load sellers
        </h2>
        <p className="text-gray-500 text-center">
          Something went wrong while fetching sellers. Try refreshing the page.
        </p>
        <button
          onClick={fetchSellers}
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition"
        >
          Retry
        </button>
      </div>
    );
  }

  if (sellers.length === 0) {
    return (
      <div className="p-6 max-w-3xl mx-auto text-center text-gray-500">
        No sellers found.
      </div>
    );
  }

  return (
    <>
      <SellerNavbar />
      <div className="p-6 max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {sellers.map((seller) => (
          <div
            key={seller._id}
            className="p-4 bg-white rounded-2xl shadow-lg flex flex-col items-center gap-4 hover:shadow-xl transition"
          >
            <div className="relative w-20 h-20 rounded-full overflow-hidden border border-gray-300 shadow-sm">
              <Image
                src={
                  seller.img ||
                  "https://miamistonesource.com/wp-content/uploads/2018/05/no-avatar-25359d55aa3c93ab3466622fd2ce712d1.jpg"
                }
                alt={seller.username}
                fill
                className="object-cover"
              />
            </div>
            <h3 className="font-semibold text-gray-800 text-lg truncate text-center">
              {seller.username}
            </h3>
            <p className="text-gray-500 text-sm text-center truncate w-full">
              {seller.email}
            </p>
            <button
              onClick={() => handleDelete(seller._id, seller.username)}
              className="mt-2 flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition"
            >
              <FaTrash />
              Delete
            </button>
          </div>
        ))}
      </div>
      <Footer />
    </>
  );
};

export default Sellers;
