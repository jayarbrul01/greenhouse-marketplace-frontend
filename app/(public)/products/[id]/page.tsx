"use client";

import { useParams, useRouter } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { useGetPostQuery } from "@/store/api/posts.api";
import { useLanguage } from "@/contexts/LanguageContext";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";

export default function PublicProductDetailPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  
  const { data: postData, isLoading } = useGetPostQuery(postId);

  if (isLoading) {
    return (
      <Container>
        <Card>
          <div className="flex items-center justify-center py-12">
            <Spinner />
          </div>
        </Card>
      </Container>
    );
  }

  if (!postData?.post) {
    return (
      <Container>
        <Card>
          <p className="text-sm text-red-600">Product not found.</p>
          <Button className="mt-4" onClick={() => router.push("/")}>
            Back to Home
          </Button>
        </Card>
      </Container>
    );
  }

  const post = postData.post;

  return (
    <Container>
      <div className="space-y-6">
        {/* Back Button */}
        <div>
          <Button 
            variant="outline" 
            onClick={() => router.push("/")}
            className="flex items-center gap-2 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Header Card */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 shadow-sm p-8">
              <div className="space-y-6">
                {/* Category and Title */}
                <div>
                  {post.category && (
                    <div className="mb-4">
                      <span className="inline-flex items-center px-4 py-2 text-sm font-bold bg-gradient-to-r from-green-600 to-green-700 text-white rounded-full shadow-md">
                        {post.category}
                      </span>
                    </div>
                  )}
                  <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">{post.title}</h1>
                  {post.information && (
                    <p className="text-lg text-gray-700 leading-relaxed">{post.information}</p>
                  )}
                </div>

                {/* Price and Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-gray-200">
                  {post.price != null && (
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-100">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-600 rounded-lg">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <p className="text-sm font-medium text-gray-600">Price</p>
                      </div>
                      <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                        ${post.price}
                      </p>
                    </div>
                  )}
                  {post.region && (
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-600 rounded-lg">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <p className="text-sm font-medium text-gray-600">Region</p>
                      </div>
                      <p className="text-xl font-bold text-gray-900">{post.region}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Media Section */}
            {(post.image || post.video) && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Media Gallery
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {post.image && (
                    <div className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-green-400 transition-all">
                      <PhotoProvider>
                        <PhotoView src={post.image}>
                          <img
                            src={post.image}
                            alt={post.title}
                            className="w-full h-80 object-cover cursor-pointer transition-transform duration-500 group-hover:scale-105"
                          />
                        </PhotoView>
                      </PhotoProvider>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                        <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-sm font-medium bg-black/50 px-4 py-2 rounded-lg backdrop-blur-sm">
                          Click to view full size
                        </span>
                      </div>
                    </div>
                  )}

                  {post.video && (
                    <div className="relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-green-400 transition-all">
                      <video
                        src={post.video}
                        controls
                        className="w-full h-80 object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Posted Date */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-medium">Posted on {new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>
          </div>

          {/* Sidebar - Contact Information */}
          {post.user && (
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 shadow-lg p-6 sticky top-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">{t("contactInformation")}</h2>
                </div>
                
                <div className="space-y-5">
                  {post.user.fullName && (
                    <div className="bg-white rounded-lg p-4 border border-gray-100 hover:border-green-300 transition-colors">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-1.5 bg-gray-100 rounded-lg">
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t("name")}</p>
                      </div>
                      <p className="text-base font-semibold text-gray-900 ml-9">{post.user.fullName}</p>
                    </div>
                  )}
                  
                  {post.user.email && (
                    <div className="bg-white rounded-lg p-4 border border-gray-100 hover:border-green-300 transition-colors">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-1.5 bg-green-100 rounded-lg">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t("email")}</p>
                      </div>
                      <a 
                        href={`mailto:${post.user.email}`}
                        className="text-base font-semibold text-green-600 hover:text-green-700 hover:underline ml-9 block transition-colors"
                      >
                        {post.user.email}
                      </a>
                    </div>
                  )}
                  
                  {post.user.phone && (
                    <div className="bg-white rounded-lg p-4 border border-gray-100 hover:border-green-300 transition-colors">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-1.5 bg-blue-100 rounded-lg">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t("phone")}</p>
                      </div>
                      <a 
                        href={`tel:${post.user.phone}`}
                        className="text-base font-semibold text-green-600 hover:text-green-700 hover:underline ml-9 block transition-colors"
                      >
                        {post.user.phone}
                      </a>
                    </div>
                  )}
                </div>

                {/* Contact Button */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <Button 
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all duration-200"
                    onClick={() => {
                      if (post.user?.email) {
                        window.location.href = `mailto:${post.user.email}`;
                      }
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Contact Seller
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}
