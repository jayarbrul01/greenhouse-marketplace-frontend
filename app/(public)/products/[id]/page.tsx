"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useGetPostQuery, useGetAllPostsQuery } from "@/store/api/posts.api";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { getAccessToken } from "@/lib/auth";
import { hydrateAuth } from "@/store/slices/auth.slice";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { useAddToWishlistMutation, useRemoveFromWishlistMutation, useGetWishlistStatusQuery } from "@/store/api/wishlist.api";
import { useGetProfileQuery } from "@/store/api/user.api";
import toast from "react-hot-toast";

export default function PublicProductDetailPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  const { isAuthenticated } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();
  const [mounted, setMounted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showPhoneNumber, setShowPhoneNumber] = useState(false);
  const [offerAmount, setOfferAmount] = useState("");
  const [isInWishlist, setIsInWishlist] = useState(false);
  
  const { data: postData, isLoading } = useGetPostQuery(postId);
  const { data: profile } = useGetProfileQuery(undefined, { skip: !isAuthenticated });
  const [addToWishlist, { isLoading: isAdding }] = useAddToWishlistMutation();
  const [removeFromWishlist, { isLoading: isRemoving }] = useRemoveFromWishlistMutation();
  
  // Check wishlist status
  const { data: wishlistStatus } = useGetWishlistStatusQuery([postId], {
    skip: !isAuthenticated,
  });

  // Fetch similar products (same category, excluding current product)
  const similarProductsParams = useMemo(() => {
    if (!postData?.post?.category) return undefined;
    return {
      category: postData.post.category,
      page: 1,
      limit: 6, // Show up to 6 similar products
    };
  }, [postData?.post?.category]);

  const { data: similarProductsData, isLoading: isLoadingSimilar } = useGetAllPostsQuery(
    similarProductsParams || undefined,
    { skip: !similarProductsParams }
  );

  // Filter out current product from similar products
  const similarProducts = useMemo(() => {
    if (!similarProductsData?.posts) return [];
    return similarProductsData.posts.filter((p) => p.id !== postId);
  }, [similarProductsData?.posts, postId]);

  // Check authentication on mount
  useEffect(() => {
    setMounted(true);
    const token = getAccessToken();
    dispatch(hydrateAuth({ isAuthenticated: !!token }));
  }, [dispatch]);

  // Update wishlist status when data changes
  useEffect(() => {
    if (wishlistStatus && wishlistStatus[postId]) {
      setIsInWishlist(true);
    } else {
      setIsInWishlist(false);
    }
  }, [wishlistStatus, postId]);

  // Handle wishlist click
  const handleWishlistClick = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to add items to wishlist");
      router.push("/login");
      return;
    }

    // Check if user is trying to add their own product
    if (profile && postData?.post && profile.id === postData.post.userId) {
      toast.error("You cannot add your own products to your wishlist");
      return;
    }

    try {
      if (isInWishlist) {
        await removeFromWishlist(postId).unwrap();
        toast.success("Removed from wishlist");
        setIsInWishlist(false);
      } else {
        await addToWishlist({ postId }).unwrap();
        toast.success("Added to wishlist");
        setIsInWishlist(true);
      }
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || "Failed to update wishlist";
      toast.error(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!postData?.post) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-400 mb-4">Product not found.</p>
          <Button onClick={() => router.push("/")}>
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const post = postData.post;
  const images = post.image ? [post.image] : [];
  const hasMultipleImages = images.length > 1;

  // Format price
  const formatPrice = (price?: number) => {
    if (!price) return null;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Format phone number for display
  const formatPhoneDisplay = (phone?: string) => {
    if (!phone) return "";
    if (showPhoneNumber) return phone;
    return phone.length > 3 ? `... ${phone.slice(-3)}` : "...";
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Breadcrumbs */}
      <Container>
        <div className="py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-400">
            <button onClick={() => router.push("/")} className="hover:text-white transition-colors">
              Home
            </button>
            <span>/</span>
            <span>{post.category || "Product"}</span>
            {post.region && (
              <>
                <span>/</span>
                <span>{post.region}</span>
              </>
            )}
          </nav>
        </div>
      </Container>

      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Carousel */}
            {post.image && (
              <div className="relative w-full aspect-video bg-gray-900 rounded-xl overflow-hidden">
                <PhotoProvider>
                  <PhotoView src={post.image}>
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover cursor-pointer"
                    />
                  </PhotoView>
                </PhotoProvider>

                {/* Action Buttons Overlay (Top Right) */}
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <button
                    onClick={handleWishlistClick}
                    disabled={isAdding || isRemoving || (profile && postData?.post && profile.id === postData.post.userId)}
                    className="bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-black/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    <svg
                      className={`w-4 h-4 transition-colors duration-300 ${
                        isInWishlist
                          ? "text-red-500 fill-red-500"
                          : "text-gray-400"
                      }`}
                      fill={isInWishlist ? "currentColor" : "none"}
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className="text-sm font-medium">
                      {isInWishlist ? "In wishlist" : "Add to wishlist"}
                    </span>
                  </button>
                </div>

                {/* Navigation Arrow (Right) */}
                {hasMultipleImages && (
                  <button
                    onClick={() => setCurrentImageIndex((prev) => (prev + 1) % images.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/70 backdrop-blur-sm text-white p-3 rounded-full hover:bg-black/90 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}

                {/* Image Count Overlay (Bottom Right) */}
                <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm font-medium">{images.length} images</span>
                </div>
              </div>
            )}

            {/* Product Title and Price */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                {post.title}
              </h1>
              {post.price && (
                <p className="text-4xl md:text-5xl font-bold text-white">
                  {formatPrice(post.price)}
                </p>
              )}

              {/* Key Features Strip */}
              <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-gray-800">
                {post.category && (
                  <div className="flex items-center gap-2 text-gray-300">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span className="text-sm font-medium">{post.category}</span>
                  </div>
                )}
                {post.region && (
                  <div className="flex items-center gap-2 text-gray-300">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm font-medium">{post.region}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Unit Details Section */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white">Unit details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {post.category && (
                  <div>
                    <span className="text-gray-400 text-sm">Category:</span>
                    <span className="text-white ml-2 font-medium">{post.category}</span>
                  </div>
                )}
                {post.region && (
                  <div>
                    <span className="text-gray-400 text-sm">Region:</span>
                    <span className="text-white ml-2 font-medium">{post.region}</span>
                  </div>
                )}
                {post.price && (
                  <div>
                    <span className="text-gray-400 text-sm">Price:</span>
                    <span className="text-white ml-2 font-medium">{formatPrice(post.price)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Description Section */}
            {post.information && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white">Description</h2>
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {post.information}
                </p>
                
                {/* Video Section */}
                {post.video && (
                  <div className="mt-6">
                    <h3 className="text-2xl font-bold text-white mb-3">Media</h3>
                    <video
                      src={post.video}
                      controls
                      title={post.title}
                      className="w-full rounded-xl border border-gray-700"
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}
              </div>
            )}
            
            {/* Video Section (if no description) */}
            {!post.information && post.video && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white">{post.title}</h2>
                <video
                  src={post.video}
                  controls
                  title={post.title}
                  className="w-full rounded-xl border border-gray-700"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            )}

            {/* Meet the Seller Section */}
            {post.user && (
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-6">
                {/* Section Header */}
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-bold text-white">Meet the seller</h2>
                  <div className="flex-1 h-px bg-gray-700"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Seller Profile (Left) */}
                  <div className="flex items-start gap-4">
                    {/* Profile Picture */}
                    <div className="w-16 h-16 rounded-full bg-gray-700 border-2 border-white flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {post.user.avatar ? (
                        <img
                          src={post.user.avatar}
                          alt={post.user.fullName || "Seller"}
                          className="w-full h-full object-cover"
                        />
                      ) : post.user.fullName ? (
                        <span className="text-white font-semibold text-xl">
                          {post.user.fullName.charAt(0).toUpperCase()}
                        </span>
                      ) : (
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      )}
                    </div>

                    {/* Seller Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-lg mb-2">
                        {post.user.fullName ? post.user.fullName : `@${post.user.email.split("@")[0]}`}
                      </p>
                      
                      {/* Join Date */}
                      {post.user.createdAt && (
                        <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>
                            Joined {(() => {
                              const joinDate = new Date(post.user.createdAt);
                              const now = new Date();
                              const yearsDiff = now.getFullYear() - joinDate.getFullYear();
                              const monthsDiff = now.getMonth() - joinDate.getMonth();
                              const totalMonths = yearsDiff * 12 + monthsDiff;
                              
                              if (totalMonths < 12) {
                                return totalMonths === 0 ? "this month" : `${totalMonths} ${totalMonths === 1 ? "month" : "months"} ago`;
                              } else {
                                return `${yearsDiff} ${yearsDiff === 1 ? "year" : "years"} ago`;
                              }
                            })()}
                          </span>
                        </div>
                      )}

                      {/* Verification Status */}
                      <div className="flex items-center gap-2">
                        {post.user.emailVerified && (
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            </div>
                          </div>
                        )}
                        {post.user.phoneVerified && (
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                            </div>
                          </div>
                        )}
                        {(post.user.emailVerified || post.user.phoneVerified) && (
                          <span className="text-gray-400 text-sm">Verified</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Reviews Section (Center-Right) */}
                  <div className="md:col-span-2 space-y-3">
                    <h3 className="text-white font-bold text-lg">
                      No reviews for {post.user.fullName || `@${post.user.email.split("@")[0]}`}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      Reviews are given when a buyer or seller completes a deal. Chat with {post.user.fullName || `@${post.user.email.split("@")[0]}`} to find out more!
                    </p>
                    <button
                      onClick={() => {
                        const userId = post.user?.id;
                        if (userId) {
                          router.push(`/profile/${userId}`);
                        }
                      }}
                      className="text-green-500 hover:text-green-400 font-medium text-sm transition-colors inline-flex items-center gap-1"
                    >
                      View profile
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Similar Products Section */}
            {post.category && similarProducts.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-bold text-white">Similar Products</h2>
                  <div className="flex-1 h-px bg-gray-700"></div>
                </div>
                
                {isLoadingSimilar ? (
                  <div className="flex items-center justify-center py-12">
                    <Spinner />
                    <span className="ml-3 text-sm text-gray-400">Loading similar products...</span>
                  </div>
                ) : (
                  <>
                    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                      {similarProducts.map((similarPost) => (
                        <ProductCard key={similarPost.id} post={similarPost} />
                      ))}
                    </div>
                    
                    {/* View More Button */}
                    <div className="flex justify-center pt-4">
                      <Button
                        onClick={() => router.push(`/products?category=${encodeURIComponent(post.category!)}`)}
                        variant="outline"
                        className="px-6 py-3 text-base font-medium"
                      >
                        View More Products in {post.category}
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Seller Information Card (Right Sidebar) */}
          {post.user && (
            <div className="lg:col-span-1">
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 sticky top-6">
                {mounted && (isAuthenticated || getAccessToken()) ? (
                  <div className="space-y-6">
                    {/* Seller Profile */}
                    <div className="flex items-center gap-3 pb-6 border-b border-gray-700">
                      <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {post.user.avatar ? (
                          <img
                            src={post.user.avatar}
                            alt={post.user.fullName || "Seller"}
                            className="w-full h-full object-cover"
                          />
                        ) : post.user.fullName ? (
                          <span className="text-white font-semibold text-lg">
                            {post.user.fullName.charAt(0).toUpperCase()}
                          </span>
                        ) : (
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold truncate">
                          {post.user.fullName || "Seller"}
                        </h3>
                        <p className="text-gray-400 text-sm truncate">
                          @{post.user.email.split("@")[0]}
                        </p>
                        <p className="text-gray-500 text-xs mt-1">No ratings yet</p>
                      </div>
                    </div>

                    {/* Email Display */}
                    {post.user.email && (
                      <div className="pb-3 border-b border-gray-700">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <a
                            href={`mailto:${post.user.email}`}
                            className="text-gray-300 hover:text-white text-sm truncate transition-colors"
                          >
                            {post.user.email}
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      <Button
                        className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium"
                        onClick={() => {
                          if (post.user?.email) {
                            window.location.href = `mailto:${post.user.email}`;
                          }
                        }}
                      >
                        Chat
                      </Button>
                      <Button
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={() => {
                          if (post.user?.phone && post.user?.phoneVerified) {
                            const phoneNumber = post.user.phone.replace(/\D/g, "");
                            window.open(`https://wa.me/${phoneNumber}`, "_blank");
                          }
                        }}
                        disabled={!post.user?.phone || !post.user?.phoneVerified}
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                        WhatsApp
                      </Button>
                    </div>

                    {/* Phone Number */}
                    {post.user.phone && (
                      <div className="pt-3 border-t border-gray-700">
                        <p className="text-white text-sm mb-2">
                          {formatPhoneDisplay(post.user.phone)}
                        </p>
                        <button
                          onClick={() => setShowPhoneNumber(!showPhoneNumber)}
                          className="text-green-500 hover:text-green-400 text-sm font-medium transition-colors"
                        >
                          {showPhoneNumber ? "Hide number" : "Show number"}
                        </button>
                      </div>
                    )}

                    {/* Make Offer Section */}
                    {/* <div className="pt-3 border-t border-gray-700 space-y-3">
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder={post.price ? formatPrice(post.price) || "" : "Enter amount"}
                          value={offerAmount}
                          onChange={(e) => setOfferAmount(e.target.value)}
                          className="flex-1 bg-gray-700 border-gray-600 text-white"
                        />
                        <Button
                          className="bg-gray-700 hover:bg-gray-600 text-white px-6 rounded-lg"
                          onClick={() => {
                            if (offerAmount && post.user?.email) {
                              const subject = `Offer for ${post.title}`;
                              const body = `I would like to make an offer of ${formatPrice(parseFloat(offerAmount))} for this item.`;
                              window.location.href = `mailto:${post.user.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                            }
                          }}
                        >
                          Make Offer
                        </Button>
                      </div>
                    </div> */}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="mb-4">
                      <svg className="w-16 h-16 mx-auto text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Login Required</h3>
                    <p className="text-sm text-gray-400 mb-6">
                      Please login to view seller contact information and contact them directly.
                    </p>
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium"
                      onClick={() => router.push("/login")}
                    >
                      Login to Contact Seller
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
