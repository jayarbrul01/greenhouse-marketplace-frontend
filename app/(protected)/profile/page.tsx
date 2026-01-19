"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Modal } from "@/components/ui/Modal";
import { Pagination } from "@/components/marketplace/Pagination";
import { useGetProfileQuery, useUpdateProfileMutation, useUpdateRolesMutation } from "@/store/api/user.api";
import { useCheckFirebasePhoneVerificationMutation } from "@/store/api/auth.api";
import { setAccessToken } from "@/lib/auth";
import { useCreatePostMutation, useGetUserPostsQuery, useDeletePostMutation, useUploadImageMutation, useUploadVideoMutation } from "@/store/api/posts.api";
import { useLanguage } from "@/contexts/LanguageContext";
import { useDebounce } from "@/hooks/useDebounce";
import { auth } from "@/lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"profile" | "products">("profile");
  const { data: profile, isLoading, refetch } = useGetProfileQuery();
  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();
  const [updateRoles, { isLoading: isUpdatingRoles }] = useUpdateRolesMutation();
  const [checkPhoneVerification] = useCheckFirebasePhoneVerificationMutation();
  const [createPost, { isLoading: isCreatingPost }] = useCreatePostMutation();
  
  // Products search and pagination state
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const ITEMS_PER_PAGE = 12;

  // Build query params for posts
  const postsQueryParams = useMemo(() => ({
    q: debouncedSearchQuery || undefined,
    page: currentPage,
    limit: ITEMS_PER_PAGE,
  }), [debouncedSearchQuery, currentPage]);

  const { data: postsData, isLoading: isLoadingPosts, refetch: refetchPosts } = useGetUserPostsQuery(postsQueryParams);
  const [deletePost, { isLoading: isDeletingPost }] = useDeletePostMutation();
  const [uploadImage, { isLoading: isUploadingImage }] = useUploadImageMutation();
  const [uploadVideo, { isLoading: isUploadingVideo }] = useUploadVideoMutation();
  
  // Phone verification state
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneVerificationStep, setPhoneVerificationStep] = useState<"idle" | "sending" | "verifying">("idle");
  const [verificationCode, setVerificationCode] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  // Form state
  const [fullName, setFullName] = useState("");
  const [region, setRegion] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState<"en" | "es" | "fr">("en");
  const [avatar, setAvatar] = useState("");
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
  
  // Roles state
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  
  // Post creation state
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [postTitle, setPostTitle] = useState("");
  const [postInformation, setPostInformation] = useState("");
  const [postPrice, setPostPrice] = useState("");
  const [postCategory, setPostCategory] = useState("");
  const [postRegion, setPostRegion] = useState("");
  const [postImage, setPostImage] = useState("");
  const [postVideo, setPostVideo] = useState("");
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);

  // Initialize form with profile data
  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || "");
      setRegion(profile.region || "");
      setPreferredLanguage(profile.preferredLanguage as "en" | "es" | "fr" || "en");
      setPhoneNumber(profile.phone || "");
      setSelectedRoles(profile.roles || []);
      setAvatar(profile.avatar || "");
    }
  }, [profile]);

  // Reset modal state when it closes
  useEffect(() => {
    if (!isPhoneModalOpen) {
      setPhoneVerificationStep("idle");
      setVerificationCode("");
      setConfirmationResult(null);
      // Clean up reCAPTCHA when modal closes
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch (err) {
          // Ignore cleanup errors
        }
        recaptchaVerifierRef.current = null;
      }
    } else {
      // Reset phone number to current profile phone when modal opens
      setPhoneNumber(profile?.phone || "");
    }
  }, [isPhoneModalOpen, profile]);

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery]);

  const handleUpdateProfile = async () => {
    try {
      await updateProfile({
        fullName: fullName || undefined,
        region: region || undefined,
        preferredLanguage: preferredLanguage,
        avatar: avatar || undefined,
      }).unwrap();
      toast.success("Profile updated successfully!");
      refetch();
    } catch (err: any) {
      const errorMessage = err.data?.message || err.message || "Failed to update profile.";
      toast.error(errorMessage);
    }
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    setSelectedAvatarFile(file);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadImage(formData).unwrap();
      setAvatar(result.url);
      toast.success("Avatar uploaded successfully!");
    } catch (err: any) {
      console.error("Upload error:", err);
      let errorMessage = "Failed to upload avatar";
      if (err.data?.message) {
        errorMessage = err.data.message;
      } else if (err.data?.error) {
        errorMessage = err.data.error;
      }
      toast.error(errorMessage);
      setSelectedAvatarFile(null);
      e.target.value = ""; // Reset file input
    }
  };

  const toggleRole = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const handleUpdateRoles = async () => {
    if (selectedRoles.length === 0) {
      toast.error("Please select at least one role");
      return;
    }

    try {
      const result = await updateRoles({
        roles: selectedRoles,
      }).unwrap();
      
      // Update access token if provided (contains new roles)
      if (result.accessToken) {
        setAccessToken(result.accessToken);
      }
      
      toast.success("Roles updated successfully! Please wait a moment for changes to take effect.");
      refetch();
    } catch (err: any) {
      const errorMessage = err.data?.message || err.message || "Failed to update roles.";
      toast.error(errorMessage);
    }
  };

  const isSeller = profile?.roles?.includes("SELLER") || false;

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Check if user has SELLER role
    if (!isSeller) {
      toast.error("You need SELLER role to upload images.");
      e.target.value = ""; // Reset file input
      return;
    }

    setSelectedImageFile(file);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadImage(formData).unwrap();
      setPostImage(result.url);
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
      e.target.value = ""; // Reset file input
    }
  };

  const handleVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast.error("Please select a video file");
      return;
    }

    // Check if user has SELLER role
    if (!isSeller) {
      toast.error("You need SELLER role to upload videos. Please update your roles first.");
      e.target.value = ""; // Reset file input
      return;
    }

    setSelectedVideoFile(file);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadVideo(formData).unwrap();
      setPostVideo(result.url);
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
      e.target.value = ""; // Reset file input
    }
  };

  const handleCreatePost = async () => {
    if (!postTitle.trim()) {
      toast.error("Post title is required");
      return;
    }

    try {
      await createPost({
        title: postTitle,
        information: postInformation || undefined,
        price: postPrice ? parseFloat(postPrice) : undefined,
        region: postRegion || undefined,
        category: postCategory || undefined,
        image: postImage || undefined,
        video: postVideo || undefined,
      }).unwrap();

      toast.success("Post created successfully!");
      setIsCreatePostModalOpen(false);
      // Reset form
      setPostTitle("");
      setPostInformation("");
      setPostPrice("");
      setPostCategory("");
      setPostRegion("");
      setPostImage("");
      setPostVideo("");
      setSelectedImageFile(null);
      setSelectedVideoFile(null);
      refetchPosts();
    } catch (err: any) {
      const errorMessage = err.data?.message || err.message || "Failed to create post.";
      toast.error(errorMessage);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      await deletePost(postId).unwrap();
      toast.success("Post deleted successfully!");
      refetchPosts();
    } catch (err: any) {
      const errorMessage = err.data?.message || err.message || "Failed to delete post.";
      toast.error(errorMessage);
    }
  };

  // Cleanup reCAPTCHA on unmount
  useEffect(() => {
    return () => {
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch (err) {
          // Ignore cleanup errors
        }
        recaptchaVerifierRef.current = null;
      }
    };
  }, []);

  const handleOpenPhoneModal = () => {
    setPhoneNumber(profile?.phone || "");
    setIsPhoneModalOpen(true);
  };

  const handleSendPhoneVerification = async () => {
    if (!phoneNumber) {
      toast.error("Phone number is required");
      return;
    }

    try {
      setPhoneVerificationStep("sending");
      
      // Clean up any existing verifier first
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch (clearErr) {
          // Ignore cleanup errors
        }
        recaptchaVerifierRef.current = null;
      }
      
      // Wait for DOM to be ready and ensure container exists
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const container = document.getElementById("recaptcha-container-modal");
      if (!container) {
        throw new Error("reCAPTCHA container not found. Please try again.");
      }

      // Verify container is in the DOM
      if (!container.isConnected) {
        throw new Error("reCAPTCHA container not connected to DOM.");
      }

      // Create new RecaptchaVerifier
      recaptchaVerifierRef.current = new RecaptchaVerifier(auth, "recaptcha-container-modal", {
        size: "invisible",
        callback: () => {
          // reCAPTCHA solved
        },
        "expired-callback": () => {
          toast.error("reCAPTCHA expired. Please try again.");
          if (recaptchaVerifierRef.current) {
            try {
              recaptchaVerifierRef.current.clear();
            } catch (err) {
              // Ignore cleanup errors
            }
            recaptchaVerifierRef.current = null;
          }
        },
      });

      // Wait a bit more for reCAPTCHA to initialize
      await new Promise(resolve => setTimeout(resolve, 100));

      const confirmation = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        recaptchaVerifierRef.current
      );
      
      setConfirmationResult(confirmation);
      setPhoneVerificationStep("verifying");
      toast.success("Verification code sent to your phone!");
    } catch (err: any) {
      console.error("Phone verification error:", err);
      setPhoneVerificationStep("idle");
      
      // Clean up reCAPTCHA on error
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch (clearErr) {
          // Ignore cleanup errors
        }
        recaptchaVerifierRef.current = null;
      }
      
      let errorMessage = "Failed to send verification code. Please try again.";
      if (err.code === "auth/invalid-phone-number") {
        errorMessage = "Invalid phone number format. Please check your phone number.";
      } else if (err.code === "auth/too-many-requests") {
        errorMessage = "Too many requests. Please try again later.";
      } else if (err.code === "auth/argument-error") {
        errorMessage = "reCAPTCHA error. Please close and reopen the modal, then try again.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      toast.error(errorMessage);
    }
  };

  const handleVerifyPhoneCode = async () => {
    if (!confirmationResult || !verificationCode) {
      toast.error("Please enter the verification code");
      return;
    }

    try {
      const result = await confirmationResult.confirm(verificationCode);
      const user = result.user;
      
      // Get ID token and sync with backend
      const idToken = await user.getIdToken(true);
      const verificationResult = await checkPhoneVerification({ idToken }).unwrap();
      
      toast.success(verificationResult.message || "Phone verified successfully!");
      
      // Close modal and refresh profile
      setIsPhoneModalOpen(false);
      refetch();
    } catch (err: any) {
      console.error("Phone code verification error:", err);
      
      let errorMessage = "Invalid verification code. Please try again.";
      if (err.code === "auth/invalid-verification-code") {
        errorMessage = "Invalid verification code. Please check and try again.";
      } else if (err.code === "auth/code-expired") {
        errorMessage = "Verification code expired. Please request a new one.";
      } else if (err.data?.message) {
        errorMessage = err.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      toast.error(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <Container>
        <Card title={t("profile")}>
          <div className="flex items-center justify-center py-8">
            <Spinner />
          </div>
        </Card>
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container>
        <Card title={t("profile")}>
          <p className="text-sm text-red-600">Failed to load profile.</p>
        </Card>
      </Container>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Container>
        {/* Tabs */}
        <div className="mb-6 border-b border-gray-700">
          <nav className="flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("profile")}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${
                  activeTab === "profile"
                    ? "border-green-500 text-green-500"
                    : "border-transparent text-gray-400 hover:text-gray-300"
                }
              `}
            >
              {t("profile")}
            </button>
            <button
              onClick={() => setActiveTab("products")}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${
                  activeTab === "products"
                    ? "border-green-500 text-green-500"
                    : "border-transparent text-gray-400 hover:text-gray-300"
                }
              `}
            >
              {t("products")}
            </button>
          </nav>
        </div>

      {activeTab === "profile" && (
        <div className="space-y-6">
          {/* Profile Information */}
          <div className="bg-gray-800 rounded-xl border border-green-500/30 p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-6">{t("profileInformation")}</h2>
            <div className="space-y-5">
              {/* Avatar Upload */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">Profile Avatar</label>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt="Profile avatar"
                        className="w-20 h-20 rounded-full border-2 border-gray-600 object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gray-700 border-2 border-gray-600 flex items-center justify-center">
                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFileChange}
                      className="hidden"
                      id="avatar-upload"
                    />
                    <label
                      htmlFor="avatar-upload"
                      className="inline-block px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg cursor-pointer transition-colors text-sm font-medium"
                    >
                      {avatar ? "Change Avatar" : "Upload Avatar"}
                    </label>
                    {selectedAvatarFile && (
                      <p className="mt-1 text-xs text-gray-400">
                        {selectedAvatarFile.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">{t("email")}</label>
                <Input
                  type="email"
                  value={profile.email}
                  disabled
                  className="bg-gray-700 border-gray-600 text-white"
                />
                <p className="mt-2 text-xs flex items-center gap-1.5">
                  {profile.emailVerified ? (
                    <span className="text-green-500 flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {t("emailVerified")}
                    </span>
                  ) : (
                    <span className="text-red-500 flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      {t("emailNotVerified")}
                    </span>
                  )}
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">{t("phone")}</label>
                <div className="flex gap-2">
                  <Input
                    type="tel"
                    value={profile.phone}
                    disabled
                    className="bg-gray-700 border-gray-600 text-white flex-1"
                  />
                  {!profile.phoneVerified && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleOpenPhoneModal}
                      className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600 whitespace-nowrap"
                    >
                      {t("verifyPhone")}
                    </Button>
                  )}
                </div>
                <p className="mt-2 text-xs flex items-center gap-1.5">
                  {profile.phoneVerified ? (
                    <span className="text-green-500 flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {t("phoneVerified")}
                    </span>
                  ) : (
                    <span className="text-red-500 flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      {t("phoneNotVerified")}
                    </span>
                  )}
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">{t("fullName")}</label>
                <Input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t("enterFullName")}
                  className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">{t("region")}</label>
                <Input
                  type="text"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  placeholder={t("enterRegion")}
                  className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">{t("preferredLanguage")}</label>
                <select
                  value={preferredLanguage}
                  onChange={(e) => setPreferredLanguage(e.target.value as "en" | "es" | "fr")}
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 text-white px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="en" className="bg-gray-700">{t("english")}</option>
                  <option value="es" className="bg-gray-700">{t("spanish")}</option>
                  <option value="fr" className="bg-gray-700">{t("french")}</option>
                </select>
              </div>

              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium mt-2"
                onClick={handleUpdateProfile}
                disabled={isUpdatingProfile}
              >
                {isUpdatingProfile ? (
                  <span className="flex items-center justify-center gap-2">
                    <Spinner /> {t("updating")}
                  </span>
                ) : (
                  t("updateProfile")
                )}
              </Button>
            </div>
          </div>

          {/* Roles Management */}
          <div className="bg-gray-800 rounded-xl border border-green-500/30 p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-6">{t("selectRole")}</h2>
            <div className="space-y-4">
              <div className="space-y-3">
                {["BUYER", "SELLER", "WISHLIST"].map((role) => {
                  const roleLabels: Record<string, string> = {
                    BUYER: t("buyer"),
                    SELLER: t("seller"),
                    WISHLIST: t("wishlist"),
                  };
                  return (
                    <label key={role} className="flex items-center gap-3 cursor-pointer hover:bg-gray-700/50 p-2 rounded-lg transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedRoles.includes(role)}
                        onChange={() => toggleRole(role)}
                        className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-green-500 focus:ring-green-500 focus:ring-2 cursor-pointer"
                      />
                      <span className="text-sm text-gray-300">{roleLabels[role]}</span>
                    </label>
                  );
                })}
              </div>
              {selectedRoles.length === 0 && (
                <p className="text-xs text-red-500">{t("pleaseSelectRole")}</p>
              )}

              <Button
                className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium border border-gray-600"
                onClick={handleUpdateRoles}
                disabled={isUpdatingRoles || selectedRoles.length === 0}
              >
                {isUpdatingRoles ? (
                  <span className="flex items-center justify-center gap-2">
                    <Spinner /> {t("updating")}
                  </span>
                ) : (
                  t("updateRoles") || "Update Roles"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "products" && (
        <div className="space-y-6">
          {/* Products Section - Only visible to SELLER */}
          {isSeller ? (
            <>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl font-semibold text-white">{t("products")}</h2>
                <Button
                  onClick={() => setIsCreatePostModalOpen(true)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {t("createNewPost")}
                </Button>
              </div>

              {/* Search Input */}
              <div>
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("searchProducts")}
                  className="w-full bg-gray-800 border-gray-700 text-white"
                />
              </div>

              {isLoadingPosts ? (
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-8">
                  <div className="flex items-center justify-center py-8">
                    <Spinner />
                  </div>
                </div>
              ) : postsData?.posts && postsData.posts.length > 0 ? (
                <>
                  <div className="mb-4 text-sm text-gray-400">
                    Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, postsData.total)} of {postsData.total} products
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {postsData.posts.map((post) => (
                      <div
                        key={post.id}
                        onClick={() => router.push(`/profile/products/${post.id}`)}
                        className="group cursor-pointer"
                      >
                        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden h-full flex flex-col hover:shadow-xl hover:border-green-500 transition-all duration-300 transform hover:-translate-y-1">
                          {/* Image Section */}
                          <div className="relative overflow-hidden bg-gray-700">
                            {post.image ? (
                              <div className="relative h-48 overflow-hidden">
                                <img
                                  src={post.image}
                                  alt={post.title}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                {post.category && (
                                  <span className="absolute top-3 left-3 px-3 py-1 text-xs font-semibold bg-green-600 text-white rounded-full shadow-lg">
                                    {post.category}
                                  </span>
                                )}
                                {post.price && (
                                  <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="bg-gray-800/95 backdrop-blur-sm rounded-lg px-3 py-2 border border-gray-700">
                                      <p className="text-xs text-gray-400 font-medium">Price</p>
                                      <p className="text-xl font-bold text-green-400">${post.price}</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="h-48 bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                                <div className="text-center">
                                  <svg className="w-16 h-16 text-gray-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  <p className="text-xs text-gray-400">No image</p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Content Section */}
                          <div className="p-5 flex-1 flex flex-col">
                            <div className="flex-1">
                              <h3 className="font-bold text-gray-100 text-lg mb-2 line-clamp-2 group-hover:text-green-400 transition-colors">
                                {post.title}
                              </h3>
                              {post.information && (
                                <p className="text-sm text-gray-400 line-clamp-2 mb-4 leading-relaxed">
                                  {post.information}
                                </p>
                              )}
                            </div>

                            {/* Details Section */}
                            <div className="mt-auto pt-4 border-t border-gray-700">
                              <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                                {post.price && (
                                  <div className="flex items-center gap-1.5">
                                    <div className="p-1.5 bg-green-900/30 rounded-lg border border-green-700/50">
                                      <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                    </div>
                                    <span className="font-bold text-green-400 text-base">${post.price}</span>
                                  </div>
                                )}
                                {post.region && (
                                  <div className="flex items-center gap-1.5">
                                    <div className="p-1.5 bg-blue-900/30 rounded-lg border border-blue-700/50">
                                      <svg className="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                      </svg>
                                    </div>
                                    <span className="text-xs font-medium text-gray-300">{post.region}</span>
                                  </div>
                                )}
                              </div>
                              
                              {/* Footer */}
                              <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-green-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                  <span>View Details</span>
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {postsData.totalPages > 1 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={postsData.totalPages}
                      onPageChange={setCurrentPage}
                    />
                  )}
                </>
              ) : (
                <Card>
                  <p className="text-sm text-gray-400 text-center py-8">
                    {searchQuery ? "No products found matching your search." : t("noPosts")}
                  </p>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <p className="text-sm text-gray-500 text-center py-8">
                You need SELLER role to view and manage products.
              </p>
            </Card>
          )}
        </div>
      )}

      {/* Phone Verification Modal */}
      <Modal
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
        title={t("verifyPhoneNumber")}
      >
        <div className="space-y-4">
          {phoneVerificationStep === "idle" && (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-900">
                  {t("phoneNumber")}
                </label>
                <PhoneInput
                  international
                  defaultCountry="US"
                  value={phoneNumber}
                  onChange={(value) => setPhoneNumber(value || "")}
                  className="w-full"
                />
              </div>
              <Button
                className="w-full"
                onClick={handleSendPhoneVerification}
                disabled={!phoneNumber}
              >
                {t("sendVerificationCode")}
              </Button>
            </>
          )}

          {phoneVerificationStep === "sending" && (
            <div className="flex flex-col items-center justify-center py-4">
              <Spinner />
              <p className="mt-2 text-sm text-gray-600">{t("sendingVerificationCode")}</p>
            </div>
          )}

          {phoneVerificationStep === "verifying" && (
            <>
              <div>
                <p className="text-sm text-gray-700 mb-2">
                  {t("enterVerificationCode")} {phoneNumber}
                </p>
                <Input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="text-center text-lg font-mono tracking-widest"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={handleVerifyPhoneCode}
                  disabled={verificationCode.length < 6}
                >
                  {t("verifyCode")}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setPhoneVerificationStep("idle");
                    setVerificationCode("");
                    setConfirmationResult(null);
                  }}
                >
                  {t("cancel")}
                </Button>
              </div>
            </>
          )}

          {/* reCAPTCHA container (hidden, always rendered when modal is open) */}
          {isPhoneModalOpen && (
            <div 
              id="recaptcha-container-modal" 
              style={{ position: "absolute", left: "-9999px", visibility: "hidden" }}
              aria-hidden="true"
            ></div>
          )}
        </div>
      </Modal>

      {/* Create Post Modal */}
      <Modal
        isOpen={isCreatePostModalOpen}
        onClose={() => setIsCreatePostModalOpen(false)}
        title={t("createPost")}
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">
              {t("postTitle")} *
            </label>
            <Input
              type="text"
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              placeholder="Enter post title"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">
              {t("postInformation")}
            </label>
            <textarea
              value={postInformation}
              onChange={(e) => setPostInformation(e.target.value)}
              placeholder="Enter post information"
              rows={4}
              className="w-full rounded-lg border border-gray-600 bg-gray-800 text-gray-100 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 placeholder:text-gray-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">
              {t("postPrice")}
            </label>
            <Input
              type="number"
              value={postPrice}
              onChange={(e) => setPostPrice(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">
                {t("postCategory")}
              </label>
              <Select
                value={postCategory}
                onChange={(e) => setPostCategory(e.target.value)}
              >
                <option value="">Select a category</option>
                <option value="Equipment">Equipment</option>
                <option value="Jobs">Jobs</option>
                <option value="Packaging Material">Packaging Material</option>
                <option value="Farming Machines">Farming Machines</option>
                <option value="Free Stuff">Free Stuff</option>
                <option value="Consultation">Consultation</option>
              </Select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">
                {t("region")}
              </label>
              <Select
                value={postRegion}
                onChange={(e) => setPostRegion(e.target.value)}
              >
                <option value="">Select a region</option>
                <option value="North America">North America</option>
                <option value="South America">South America</option>
                <option value="Europe">Europe</option>
                <option value="Asia">Asia</option>
                <option value="Africa">Africa</option>
                <option value="Oceania">Oceania</option>
              </Select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">
              {t("postImage")}
            </label>
            {!isSeller && (
              <p className="text-xs text-amber-400 mb-2">
                You need SELLER role to upload images. Please update your roles first.
              </p>
            )}
            <div className="space-y-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                disabled={!isSeller}
                className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {isUploadingImage && (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Spinner /> {t("uploading")}
                </div>
              )}
              {postImage && (
                <div className="mt-2">
                  <img
                    src={postImage}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded border border-gray-700"
                  />
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">
              {t("postVideo")}
            </label>
            {!isSeller && (
              <p className="text-xs text-amber-400 mb-2">
                You need SELLER role to upload videos. Please update your roles first.
              </p>
            )}
            <div className="space-y-2">
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoFileChange}
                disabled={!isSeller}
                className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {isUploadingVideo && (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Spinner /> {t("uploading")}
                </div>
              )}
              {postVideo && (
                <div className="mt-2">
                  <video
                    src={postVideo}
                    controls
                    className="w-full h-32 rounded border border-gray-700"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              className="flex-1"
              onClick={handleCreatePost}
              disabled={isCreatingPost || !postTitle.trim()}
            >
              {isCreatingPost ? (
                <span className="flex items-center gap-2">
                  <Spinner /> {t("creatingAccount")}
                </span>
              ) : (
                t("createPost")
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsCreatePostModalOpen(false)}
            >
              {t("cancel")}
            </Button>
          </div>
        </div>
      </Modal>
      </Container>
    </div>
  );
}
