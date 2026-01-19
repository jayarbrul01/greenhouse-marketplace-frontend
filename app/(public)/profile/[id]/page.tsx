"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useGetUserByIdQuery } from "@/store/api/user.api";
import { useGetPostsByUserIdQuery } from "@/store/api/posts.api";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { useDebounce } from "@/hooks/useDebounce";

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const ITEMS_PER_PAGE = 12;

  const { data: userData, isLoading: isLoadingUser } = useGetUserByIdQuery(userId);

  const postsQueryParams = useMemo(() => ({
    q: debouncedSearchQuery || undefined,
    page: currentPage,
    limit: ITEMS_PER_PAGE,
  }), [debouncedSearchQuery, currentPage]);

  const { data: postsData, isLoading: isLoadingPosts } = useGetPostsByUserIdQuery(
    userId ? { userId, ...postsQueryParams } : { userId: "" },
    { skip: !userId }
  );

  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!userData?.user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-400 mb-4">User not found.</p>
          <Button onClick={() => router.push("/")}>
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const user = userData.user;
  const posts = postsData?.posts || [];
  const totalPages = postsData?.totalPages || 0;

  // Calculate join date
  const calculateJoinDate = () => {
    if (!user.createdAt) return "N/A";
    const joinDate = new Date(user.createdAt);
    const now = new Date();
    const yearsDiff = now.getFullYear() - joinDate.getFullYear();
    const monthsDiff = now.getMonth() - joinDate.getMonth();
    const daysDiff = now.getDate() - joinDate.getDate();
    const totalMonths = yearsDiff * 12 + monthsDiff;
    
    if (totalMonths < 12) {
      return `${totalMonths}m ${daysDiff}d`;
    } else {
      return `${yearsDiff}y ${daysDiff}d`;
    }
  };

  const username = user.email.split("@")[0];

  return (
    <div className="min-h-screen bg-black">
      {/* Red Patterned Banner */}
      <div className="w-full h-32 bg-gradient-to-brrelative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-20"          
        />
      </div>

      <Container>
        {/* Profile Header Card */}
        <div className="relative -mt-16 mb-8">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-2xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              {/* Left: Profile Info */}
              <div className="flex items-start gap-4 flex-1">
                {/* Avatar */}
                <div className="w-20 h-20 rounded-full bg-gray-700 border-2 border-white flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.fullName || username}
                      className="w-full h-full object-cover"
                    />
                  ) : user.fullName ? (
                    <span className="text-white font-semibold text-2xl">
                      {user.fullName.charAt(0).toUpperCase()}
                    </span>
                  ) : (
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </div>

                {/* User Details */}
                <div className="flex-1 min-w-0">
                  <h1 className="text-3xl font-bold text-white mb-2">
                    @{username}
                  </h1>
                  <button
                    onClick={() => {}}
                    className="text-gray-400 hover:text-white text-sm flex items-center gap-1 mb-4 transition-colors"
                  >
                    Profile details
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  {/* User Statistics */}
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <span className="text-gray-400">
                      N/A No review yet
                    </span>
                    <span className="text-gray-400">
                      {calculateJoinDate()} Joined
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Action Buttons */}
              {/* <div className="flex items-center gap-3">
                <Button className="bg-gray-700 hover:bg-gray-600 text-white px-6">
                  Follow
                </Button>
                <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </button>
                <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div> */}
            </div>
          </div>
        </div>

        {/* Listings Section */}
        <div className="space-y-6">
          {/* Listings Header */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Listings</h2>
            
            {/* Search and Filter Bar */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 relative">
                <Input
                  type="text"
                  placeholder="Search listings..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-gray-800 border-gray-700 text-white pr-10"
                />
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <Button className="bg-gray-700 hover:bg-gray-600 text-white px-6 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
              </Button>
            </div>

            {/* Product Grid */}
            {isLoadingPosts ? (
              <div className="flex items-center justify-center py-12">
                <Spinner />
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">No listings found.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {posts.map((post) => (
                    <ProductCard key={post.id} post={post} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <Button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="bg-gray-800 hover:bg-gray-700 text-white disabled:opacity-50"
                    >
                      Previous
                    </Button>
                    <span className="text-gray-400 px-4">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="bg-gray-800 hover:bg-gray-700 text-white disabled:opacity-50"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
