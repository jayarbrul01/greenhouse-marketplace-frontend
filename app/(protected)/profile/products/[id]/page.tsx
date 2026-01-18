"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useGetPostQuery, useUpdatePostMutation, useDeletePostMutation, useUploadImageMutation, useUploadVideoMutation } from "@/store/api/posts.api";
import { useLanguage } from "@/contexts/LanguageContext";
import { useGetProfileQuery } from "@/store/api/user.api";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import toast from "react-hot-toast";

export default function ProductDetailPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  
  const { data: profile } = useGetProfileQuery();
  const { data: postData, isLoading, refetch } = useGetPostQuery(postId);
  const [updatePost, { isLoading: isUpdating }] = useUpdatePostMutation();
  const [deletePost, { isLoading: isDeleting }] = useDeletePostMutation();
  const [uploadImage, { isLoading: isUploadingImage }] = useUploadImageMutation();
  const [uploadVideo, { isLoading: isUploadingVideo }] = useUploadVideoMutation();

  const isSeller = profile?.roles?.includes("SELLER") || false;
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [information, setInformation] = useState("");
  const [price, setPrice] = useState("");
  const [region, setRegion] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");
  const [video, setVideo] = useState("");
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);

  // Initialize form with post data
  useEffect(() => {
    if (postData?.post) {
      const post = postData.post;
      setTitle(post.title || "");
      setInformation(post.information || "");
      setPrice(post.price?.toString() || "");
      setRegion(post.region || "");
      setCategory(post.category || "");
      setImage(post.image || "");
      setVideo(post.video || "");
    }
  }, [postData]);

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (!isSeller) {
      toast.error("You need SELLER role to upload images.");
      e.target.value = "";
      return;
    }

    setSelectedImageFile(file);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadImage(formData).unwrap();
      setImage(result.url);
      toast.success("Image uploaded successfully!");
    } catch (err: any) {
      console.error("Upload error:", err);
      let errorMessage = "Failed to upload image";
      if (err.status === 403) {
        errorMessage = "You need SELLER role to upload images. Please update your roles first.";
      } else if (err.data?.message) {
        errorMessage = err.data.message;
      } else if (err.data?.error) {
        errorMessage = err.data.error;
      }
      toast.error(errorMessage);
      setSelectedImageFile(null);
      e.target.value = "";
    }
  };

  const handleVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast.error("Please select a video file");
      return;
    }

    if (!isSeller) {
      toast.error("You need SELLER role to upload videos. Please update your roles first.");
      e.target.value = "";
      return;
    }

    setSelectedVideoFile(file);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadVideo(formData).unwrap();
      setVideo(result.url);
      toast.success("Video uploaded successfully!");
    } catch (err: any) {
      console.error("Upload error:", err);
      let errorMessage = "Failed to upload video";
      if (err.status === 403) {
        errorMessage = "You need SELLER role to upload videos. Please update your roles first.";
      } else if (err.data?.message) {
        errorMessage = err.data.message;
      } else if (err.data?.error) {
        errorMessage = err.data.error;
      }
      toast.error(errorMessage);
      setSelectedVideoFile(null);
      e.target.value = "";
    }
  };

  const handleUpdatePost = async () => {
    if (!title.trim()) {
      toast.error("Post title is required");
      return;
    }

    try {
      await updatePost({
        postId,
        data: {
          title,
          information: information || undefined,
          price: price ? parseFloat(price) : undefined,
          region: region || undefined,
          category: category || undefined,
          image: image || undefined,
          video: video || undefined,
        },
      }).unwrap();

      toast.success("Product updated successfully!");
      setIsEditing(false);
      refetch();
    } catch (err: any) {
      const errorMessage = err.data?.message || err.message || "Failed to update product.";
      toast.error(errorMessage);
    }
  };

  const handleDeletePost = async () => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      await deletePost(postId).unwrap();
      toast.success("Product deleted successfully!");
      router.push("/profile");
    } catch (err: any) {
      const errorMessage = err.data?.message || err.message || "Failed to delete product.";
      toast.error(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <Container>
        <Card title={t("productDetails")}>
          <div className="flex items-center justify-center py-8">
            <Spinner />
          </div>
        </Card>
      </Container>
    );
  }

  if (!postData?.post) {
    return (
      <Container>
        <Card title={t("productDetails")}>
          <p className="text-sm text-red-400">Product not found.</p>
        </Card>
      </Container>
    );
  }

  const post = postData.post;

  return (
    <Container>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={() => router.push("/profile")}>
            ← Back to Profile
          </Button>
          {isSeller && (
            <div className="flex gap-2">
              {!isEditing ? (
                <>
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    {t("editProduct")}
                  </Button>
                  <Button variant="outline" onClick={handleDeletePost} disabled={isDeleting}>
                    {isDeleting ? <Spinner /> : t("deletePost")}
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  {t("cancel")}
                </Button>
              )}
            </div>
          )}
        </div>
        <div className="space-y-6">
          {isEditing ? (
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 shadow-sm">
              {/* Header Section */}
              <div className="mb-6 pb-4 border-b border-gray-700">
                <h3 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  {t("editProduct")}
                </h3>
                <p className="text-sm text-gray-400 mt-1">Update your product information below</p>
              </div>

              <div className="space-y-6">
                {/* Title Section */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-300 flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    {t("postTitle")} <span className="text-red-400">*</span>
                  </label>
                  <Input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter product title"
                    className="transition-all duration-200 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                {/* Information Section */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-300 flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {t("postInformation")}
                  </label>
                  <textarea
                    value={information}
                    onChange={(e) => setInformation(e.target.value)}
                    placeholder="Enter detailed product information..."
                    rows={5}
                    className="w-full rounded-lg border border-gray-600 bg-gray-800 text-gray-100 px-4 py-3 text-sm placeholder:text-gray-500 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all duration-200 resize-none"
                  />
                </div>

                {/* Price and Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-300 flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {t("postPrice")}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                      <Input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        className="pl-8 transition-all duration-200 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-300 flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      {t("postCategory")}
                    </label>
                    <Select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="transition-all duration-200 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Select category</option>
                      <option value="Equipment">Equipment</option>
                      <option value="Jobs">Jobs</option>
                      <option value="Packaging Material">Packaging Material</option>
                      <option value="Farming Machines">Farming Machines</option>
                      <option value="Free Stuff">Free Stuff</option>
                      <option value="Consultation">Consultation</option>
                    </Select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-300 flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {t("region")}
                    </label>
                    <Select
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className="transition-all duration-200 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Select region</option>
                      <option value="North America">North America</option>
                      <option value="South America">South America</option>
                      <option value="Europe">Europe</option>
                      <option value="Asia">Asia</option>
                      <option value="Africa">Africa</option>
                      <option value="Oceania">Oceania</option>
                    </Select>
                  </div>
                </div>

                {/* Media Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-700">
                  {/* Image Upload */}
                  <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 hover:border-green-500 transition-colors">
                    <label className="mb-3 block text-sm font-semibold text-gray-300 flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {t("postImage")}
                    </label>
                    <div className="space-y-3">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:bg-gray-700 hover:border-green-400 transition-all duration-200">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <svg className="w-8 h-8 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p className="mb-2 text-sm text-gray-400">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF (MAX. 10MB)</p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileChange}
                          disabled={!isSeller || isUploadingImage}
                          className="hidden"
                        />
                      </label>
                      {isUploadingImage && (
                        <div className="flex items-center justify-center gap-2 text-sm text-green-400 bg-green-900/30 py-2 rounded-lg border border-green-700/50">
                          <Spinner /> {t("uploading")}
                        </div>
                      )}
                      {image && (
                        <div className="relative group">
                          <PhotoProvider>
                            <PhotoView src={image}>
                              <img
                                src={image}
                                alt="Preview"
                                className="w-full h-40 object-cover rounded-lg cursor-pointer border-2 border-gray-700 group-hover:border-green-400 transition-all"
                              />
                            </PhotoView>
                          </PhotoProvider>
                          <button
                            onClick={() => setImage("")}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Video Upload */}
                  <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 hover:border-green-500 transition-colors">
                    <label className="mb-3 block text-sm font-semibold text-gray-300 flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      {t("postVideo")}
                    </label>
                    <div className="space-y-3">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:bg-gray-700 hover:border-green-400 transition-all duration-200">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <svg className="w-8 h-8 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <p className="mb-2 text-sm text-gray-400">
                            <span className="font-semibold">Click to upload</span> video
                          </p>
                          <p className="text-xs text-gray-500">MP4, MOV, AVI (MAX. 50MB)</p>
                        </div>
                        <input
                          type="file"
                          accept="video/*"
                          onChange={handleVideoFileChange}
                          disabled={!isSeller || isUploadingVideo}
                          className="hidden"
                        />
                      </label>
                      {isUploadingVideo && (
                        <div className="flex items-center justify-center gap-2 text-sm text-green-400 bg-green-900/30 py-2 rounded-lg border border-green-700/50">
                          <Spinner /> {t("uploading")}
                        </div>
                      )}
                      {video && (
                        <div className="relative group">
                          <video
                            src={video}
                            controls
                            className="w-full h-40 object-cover rounded-lg border-2 border-gray-700 group-hover:border-green-400 transition-all"
                          />
                          <button
                            onClick={() => setVideo("")}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-700">
                  <Button
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all duration-200"
                    onClick={handleUpdatePost}
                    disabled={isUpdating || !title.trim()}
                  >
                    {isUpdating ? (
                      <span className="flex items-center gap-2">
                        <Spinner /> {t("updating")}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {t("saveChanges")}
                      </span>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    className="px-6 hover:bg-gray-700"
                  >
                    {t("cancel")}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
              {/* Product Header */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 px-6 py-5 border-b border-gray-700">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {post.category && (
                      <span className="inline-block px-3 py-1 text-xs font-semibold bg-gradient-to-r from-green-600 to-green-700 text-white rounded-full mb-3 shadow-lg">
                        {post.category}
                      </span>
                    )}
                    <h2 className="text-3xl font-bold text-gray-100 mb-2">{post.title}</h2>
                    {post.information && (
                      <p className="text-gray-300 leading-relaxed">{post.information}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Product Details */}
              <div className="px-6 py-5 border-b border-gray-700">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {post.price && (
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-lg border border-green-700/50">
                        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-medium">Price</p>
                        <p className="text-lg font-bold bg-gradient-to-r from-green-400 to-green-500 bg-clip-text text-transparent">${post.price}</p>
                      </div>
                    </div>
                  )}
                  {post.region && (
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-gradient-to-br from-blue-900/30 to-indigo-900/30 rounded-lg border border-blue-700/50">
                        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-medium">Region</p>
                        <p className="text-sm font-semibold text-gray-100">{post.region}</p>
                      </div>
                    </div>
                  )}
                  {post.category && (
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-lg border border-purple-700/50">
                        <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-medium">Category</p>
                        <p className="text-sm font-semibold text-gray-100">{post.category}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-gray-800 rounded-lg border border-gray-700">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium">Created</p>
                      <p className="text-sm font-semibold text-gray-400">{new Date(post.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Media Section */}
              {(post.image || post.video) && (
                <div className="px-6 py-5">
                  <h3 className="text-sm font-semibold text-gray-100 mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Media
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {post.image && (
                      <div className="relative group overflow-hidden rounded-lg border-2 border-gray-700 hover:border-green-500 transition-all">
                        <PhotoProvider>
                          <PhotoView src={post.image}>
                            <img
                              src={post.image}
                              alt={post.title}
                              className="w-full h-64 object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105"
                            />
                          </PhotoView>
                        </PhotoProvider>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                          <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-sm font-medium bg-black/50 px-3 py-1.5 rounded-lg">
                            Click to view full size
                          </span>
                        </div>
                      </div>
                    )}

                    {post.video && (
                      <div className="relative overflow-hidden rounded-lg border-2 border-gray-700 hover:border-green-500 transition-all">
                        <video
                          src={post.video}
                          controls
                          className="w-full h-64 object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}
