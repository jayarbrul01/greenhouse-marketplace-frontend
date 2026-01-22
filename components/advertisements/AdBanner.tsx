"use client";

import { useEffect, useState, useMemo } from "react";
import { useGetActiveAdvertisementsQuery, useTrackAdViewMutation, useTrackAdClickMutation } from "@/store/api/advertisements.api";
import { Spinner } from "@/components/ui/Spinner";
import type { Advertisement } from "@/store/api/advertisements.api";

export function AdBanner() {
  const { data, isLoading } = useGetActiveAdvertisementsQuery();
  const [trackView] = useTrackAdViewMutation();
  const [trackClick] = useTrackAdClickMutation();
  const [currentRotationIndex, setCurrentRotationIndex] = useState(0);
  const [displayedAdIndex, setDisplayedAdIndex] = useState(0); // Which of the two displayed ads to rotate
  const [adPosition, setAdPosition] = useState<"center" | "below-search">("center");
  const [topPosition, setTopPosition] = useState<string>("50%");
  const [transform, setTransform] = useState<string>("translateY(-50%)");

  // Get ads sorted by creation date (latest first)
  const sortedAds = useMemo(() => {
    if (!data?.advertisements) return [];
    return [...data.advertisements].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [data?.advertisements]);

  // Get the two ads to display
  const displayedAds = useMemo(() => {
    if (sortedAds.length === 0) return [null, null];
    if (sortedAds.length === 1) return [sortedAds[0], null];
    
    // Start with the first two ads (latest)
    const firstTwo = [sortedAds[0], sortedAds[1]];
    
    // If we have more than 2 ads, rotate through the rest
    if (sortedAds.length > 2) {
      // Get ads beyond the first two (for rotation)
      const remainingAds = sortedAds.slice(2);
      
      // Calculate which ad to show based on rotation
      const adToShow = remainingAds[currentRotationIndex % remainingAds.length];
      
      // Replace one of the displayed ads based on displayedAdIndex
      if (displayedAdIndex === 0) {
        return [adToShow, firstTwo[1]];
      } else {
        return [firstTwo[0], adToShow];
      }
    }
    
    return firstTwo;
  }, [sortedAds, currentRotationIndex, displayedAdIndex]);

  useEffect(() => {
    // Track views for all active ads
    if (data?.advertisements) {
      data.advertisements.forEach((ad) => {
        trackView(ad.id).catch(() => {
          // Silently fail - tracking shouldn't break the UI
        });
      });
    }
  }, [data, trackView]);

  // Rotate ads every 30 seconds
  useEffect(() => {
    if (sortedAds.length <= 2) return; // No need to rotate if we have 2 or fewer ads

    const interval = setInterval(() => {
      const remainingAdsCount = sortedAds.length - 2;
      
      setCurrentRotationIndex((prev) => {
        const nextIndex = prev + 1;
        // After cycling through all remaining ads, reset to 0
        return nextIndex >= remainingAdsCount ? 0 : nextIndex;
      });
      
      // Alternate between replacing the first and second ad
      setDisplayedAdIndex((prev) => (prev === 0 ? 1 : 0));
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [sortedAds.length]);

  // Detect scroll position and search bar visibility
  useEffect(() => {
    const handleScroll = () => {
      // Find search bar section - look for common search bar containers
      const searchBarSelectors = [
        'div[class*="bg-white"][class*="backdrop-blur"]', // Search interface card
        'div[class*="hero-input"]', // Hero input container
        'input[placeholder*="Search"]', // Search input
      ];

      let searchBarElement: HTMLElement | null = null;
      
      // Try to find search bar by looking for input with search placeholder
      const searchInputs = document.querySelectorAll('input[placeholder*="search" i], input[placeholder*="Search" i]');
      if (searchInputs.length > 0) {
        // Find the parent container that likely contains the search bar section
        for (const input of Array.from(searchInputs)) {
          let parent = input.closest('div[class*="bg-white"], div[class*="backdrop-blur"], div[class*="rounded"]');
          if (parent) {
            searchBarElement = parent as HTMLElement;
            break;
          }
        }
      }

      if (!searchBarElement) {
        // Fallback: look for the first white card with backdrop-blur (likely search interface)
        searchBarElement = document.querySelector('div.bg-white\\/95.backdrop-blur-xl, div.bg-white.backdrop-blur-xl') as HTMLElement;
      }

      if (searchBarElement) {
        const rect = searchBarElement.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const headerHeight = 128; // Approximate header height (h-32 = 128px)
        
        // Check if search bar is visible in viewport (top is above bottom of viewport and bottom is below header)
        const isSearchBarVisible = rect.top < windowHeight && rect.bottom > headerHeight;
        
        // Calculate minimum top position to avoid header overlap
        const minTopPosition = headerHeight + 24; // Header + padding
        
        if (isSearchBarVisible) {
          // Always position ads below search bar when it's visible
          const calculatedTop = rect.bottom + 40; // Increased spacing to 40px to move ads further down
          // Ensure ads don't go above minimum position
          const finalTop = Math.max(calculatedTop, minTopPosition);
          setAdPosition("below-search");
          setTopPosition(`${finalTop}px`);
          setTransform("none");
        } else if (rect.bottom <= 0) {
          // Search bar is scrolled past (above viewport), center ads
          setAdPosition("center");
          setTopPosition("50%");
          setTransform("translateY(-50%)");
        } else {
          // Search bar exists but not fully visible, use minimum position
          setAdPosition("below-search");
          setTopPosition(`${minTopPosition}px`);
          setTransform("none");
        }
      } else {
        // If no search bar found, default to center
        setAdPosition("center");
        setTopPosition("50%");
        setTransform("translateY(-50%)");
      }
    };

    // Initial check
    handleScroll();

    // Listen to scroll events
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const handleAdClick = async (ad: { id: string; websiteUrl?: string }) => {
    // Track click
    trackClick(ad.id).catch(() => {
      // Silently fail
    });

    // Open website in new tab if available
    if (ad.websiteUrl) {
      window.open(ad.websiteUrl, "_blank", "noopener,noreferrer");
    }
  };

  if (isLoading) {
    return (
      <div 
        className="hidden lg:block fixed right-0 w-64 bg-white py-4 flex items-center justify-center border-l border-gray-200 z-40 max-h-96"
        style={{
          top: topPosition,
          transform: transform,
        }}
      >
        <Spinner />
      </div>
    );
  }

  if (!data?.advertisements || data.advertisements.length === 0) {
    return null;
  }

  // Filter out null ads
  const validAds = displayedAds.filter((ad): ad is Advertisement => ad !== null);

  if (validAds.length === 0) {
    return null;
  }

  return (
    <div 
      className="hidden lg:block fixed right-0 w-64 bg-black z-40 max-h-96 overflow-y-auto transition-all duration-300"
      style={{
        top: topPosition,
        transform: transform,
      }}
    >
      <div className="space-y-4">
        {validAds.map((ad) => (
          <div
            key={ad.id}
            className="rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <a
              href={ad.websiteUrl || "#"}
              onClick={(e) => {
                e.preventDefault();
                handleAdClick(ad);
              }}
              className="block w-full hover:opacity-90 transition-opacity"
              target={ad.websiteUrl ? "_blank" : undefined}
              rel={ad.websiteUrl ? "noopener noreferrer" : undefined}
            >
              <img
                src={ad.bannerUrl}
                alt={ad.businessName}
                className="w-full h-auto object-contain mx-auto rounded max-h-36"
              />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
