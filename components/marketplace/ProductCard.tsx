import { Post } from "@/store/api/posts.api";
import { useRouter } from "next/navigation";

export function ProductCard({ post }: { post: Post & { user?: { id: string; fullName: string | null; email: string } } }) {
  const router = useRouter();

  return (
    <div 
      className="group bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden shadow-sm hover:shadow-2xl hover:border-green-500 transition-all duration-500 cursor-pointer h-full flex flex-col transform hover:-translate-y-2"
      onClick={() => router.push(`/products/${post.id}`)}
    >
      {/* Image Section */}
      <div className="relative w-full h-64 overflow-hidden bg-gradient-to-br from-gray-700 to-gray-900">
        {post.image ? (
          <>
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </>
        ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <svg className="w-20 h-20 text-gray-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-xs text-gray-400 font-medium">No Image</p>
              </div>
            </div>
        )}
        
        {/* Category Badge */}
        {post.category && (
          <div className="absolute top-4 left-4 z-10">
            <span className="inline-flex items-center px-3 py-1.5 text-xs font-bold bg-gray-800/95 backdrop-blur-md text-green-400 rounded-full shadow-lg border border-green-500/50">
              {post.category}
            </span>
          </div>
        )}

        {/* Price Overlay on Hover */}
        {post.price != null && (
          <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
            <div className="bg-gray-800/95 backdrop-blur-md rounded-xl px-4 py-3 shadow-xl border border-gray-700/50">
              <p className="text-xs text-gray-400 font-medium mb-1">Price</p>
              <p className="text-2xl font-bold text-green-400">${post.price}</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Content Section */}
      <div className="p-6 flex flex-col flex-1 bg-gray-800">
        {/* Title */}
        <h3 className="text-xl font-bold text-gray-100 line-clamp-2 mb-3 group-hover:text-green-400 transition-colors duration-300 leading-tight">
          {post.title}
        </h3>
        
        {/* Description */}
        {post.information && (
          <p className="text-sm text-gray-400 line-clamp-2 mb-5 leading-relaxed">
            {post.information}
          </p>
        )}
        
        {/* Details Section */}
        <div className="mt-auto pt-5 border-t border-gray-700">
          {/* Price and Region Row */}
          <div className="flex items-center justify-between mb-4">
            {post.price != null && (
              <div className="flex items-baseline gap-1">
                <span className="text-xs text-gray-400 font-medium">Price</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-green-500 bg-clip-text text-transparent">
                  ${post.price}
                </span>
              </div>
            )}
            {post.region && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-900/30 rounded-lg border border-blue-700/50">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-xs font-semibold text-blue-400">{post.region}</span>
              </div>
            )}
          </div>
          
          {/* Seller Info */}
          {post.user && (
            <div className="flex items-center gap-3 pt-4 border-t border-gray-700">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-md ring-2 ring-gray-800">
                  <span className="text-sm font-bold text-white">
                    {(post.user.fullName || "U")[0].toUpperCase()}
                  </span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-gray-800 rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 font-medium mb-0.5">Seller</p>
                <p className="text-sm font-semibold text-gray-200 truncate">
                  {post.user.fullName || "User"}
                </p>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
