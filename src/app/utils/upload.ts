import axios from "axios";
import { toast } from "react-toastify";

const MAX_LIMITS: Record<"image" | "video" | "raw", number> = {
  image: 10 * 1024 * 1024, // 10MB
  video: 100 * 1024 * 1024, // 100MB
  raw: 10 * 1024 * 1024, // 10MB
};

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB

type UploadResponse = {
  url: string;
  public_id: string;
} | null;

const upload = async (
  file: File,
  onProgress?: (percent: number) => void
): Promise<UploadResponse> => {
  const formattedFileName = file.name.replace(/\s+/g, "_"); // avoid spaces
  const data = new FormData();
  data.append("upload_preset", "fiverr");
  data.append("public_id", formattedFileName);

  let resourceType: "image" | "video" | "raw" = "raw";
  let fileType: keyof typeof MAX_LIMITS = "raw";

  if (file.type.startsWith("image/")) {
    resourceType = "image";
    fileType = "image";
  } else if (file.type.startsWith("video/")) {
    resourceType = "video";
    fileType = "video";
  }

  // 🔎 Size validation
  if (file.size > MAX_LIMITS[fileType]) {
    toast.error(
      `❌ File exceeds ${
        MAX_LIMITS[fileType] / (1024 * 1024)
      }MB limit for ${fileType}s.`
    );
    return null;
  }

  // Small file → normal upload
  if (file.size <= CHUNK_SIZE) {
    data.append("file", file);
    return await uploadToCloudinary(data, resourceType, file.size, onProgress);
  }

  // Large file → chunked upload
  return await uploadInChunks(file, resourceType, onProgress);
};

// 📌 Normal Cloudinary Upload
const uploadToCloudinary = async (
  data: FormData,
  resourceType: string,
  totalSize: number,
  onProgress?: (percent: number) => void
): Promise<UploadResponse> => {
  try {
    const res = await axios.post(
      `https://api.cloudinary.com/v1_1/dogvsdqvz/${resourceType}/upload`,
      data,
      {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded / totalSize) * 100
          );
          if (onProgress) onProgress(percentCompleted);
        },
      }
    );

    return { url: res.data.secure_url, public_id: res.data.public_id };
  } catch (err) {
    console.error("❌ Error uploading file:", err);
    toast.error("❌ Upload failed. Please try again.");
    return null;
  }
};

// 📌 Chunked Upload for Large Files
const uploadInChunks = async (
  file: File,
  resourceType: string,
  onProgress?: (percent: number) => void
): Promise<UploadResponse> => {
  const chunkCount = Math.ceil(file.size / CHUNK_SIZE);
  let uploadedUrl: string | null = null;
  let publicId: string | null = null;
  let offset = 0;

  for (let i = 0; i < chunkCount; i++) {
    const chunk = file.slice(offset, offset + CHUNK_SIZE);
    const data = new FormData();
    data.append("file", chunk);
    data.append("upload_preset", "fiverr");
    data.append("public_id", file.name);
    data.append("resource_type", resourceType);

    try {
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/dogvsdqvz/${resourceType}/upload`,
        data,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            const overallProgress = Math.round(
              ((offset + progressEvent.loaded) / file.size) * 100
            );
            if (onProgress) onProgress(overallProgress);
          },
        }
      );

      uploadedUrl = res.data.secure_url;
      publicId = res.data.public_id;
      offset += CHUNK_SIZE;
    } catch (err) {
      console.error(`❌ Error uploading chunk ${i + 1}:`, err);
      toast.error(`❌ Upload failed at chunk ${i + 1}.`);
      return null;
    }
  }

  return uploadedUrl && publicId
    ? { url: uploadedUrl, public_id: publicId }
    : null;
};

export default upload;
