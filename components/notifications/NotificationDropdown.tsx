"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useGetUnreadNotificationsQuery, useMarkAsReadMutation, Notification } from "@/store/api/notifications.api";
import { Spinner } from "@/components/ui/Spinner";
// Simple date formatter
function formatTimeAgo(date: string): string {
  const now = new Date();
  const notificationDate = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - notificationDate.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minute${Math.floor(diffInSeconds / 60) > 1 ? "s" : ""} ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hour${Math.floor(diffInSeconds / 3600) > 1 ? "s" : ""} ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} day${Math.floor(diffInSeconds / 86400) > 1 ? "s" : ""} ago`;
  return `${Math.floor(diffInSeconds / 604800)} week${Math.floor(diffInSeconds / 604800) > 1 ? "s" : ""} ago`;
}

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  buttonRef?: React.RefObject<HTMLButtonElement | null> | React.MutableRefObject<HTMLButtonElement | null>;
}

export function NotificationDropdown({ isOpen, onClose, buttonRef }: NotificationDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; right: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { data, isLoading, refetch } = useGetUnreadNotificationsQuery(undefined, {
    skip: !isOpen, // Only fetch when dropdown is open
  });
  const [markAsRead] = useMarkAsReadMutation();

  // Set mounted state for portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate dropdown position based on button position
  useEffect(() => {
    if (isOpen && buttonRef?.current) {
      const calculatePosition = () => {
        if (!buttonRef?.current) return;
        
        const buttonRect = buttonRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const spacing = 8; // mt-2 = 8px
        const dropdownWidth = 384; // w-96 = 384px on desktop
        const mobileDropdownWidth = window.innerWidth - 32; // calc(100vw - 2rem)
        const isMobile = window.innerWidth < 640; // sm breakpoint
        const actualDropdownWidth = isMobile ? mobileDropdownWidth : dropdownWidth;

        // Calculate right position - distance from right edge of viewport
        // Align dropdown's right edge with button's right edge (or close to it)
        let right = viewportWidth - buttonRect.right;
        
        // Ensure dropdown doesn't go off the left edge of screen
        const minRight = 16;
        const maxRight = viewportWidth - actualDropdownWidth - 16;
        right = Math.max(minRight, Math.min(right, maxRight));
        
        // Calculate top position (below the button)
        let top = buttonRect.bottom + spacing;
        
        // If dropdown would go off the bottom, position it above the button instead
        const estimatedDropdownHeight = 400; // reasonable estimate
        if (top + estimatedDropdownHeight > viewportHeight - 16) {
          top = buttonRect.top - estimatedDropdownHeight - spacing;
          // Ensure it doesn't go off the top
          if (top < 16) {
            top = 16;
          }
        }

        setPosition({ top, right });
      };

      // Calculate immediately
      calculatePosition();
      
      // Also calculate on next frame to ensure accurate positioning
      requestAnimationFrame(calculatePosition);

      // Recalculate on scroll/resize to keep dropdown aligned with button
      const handleScroll = () => {
        if (isOpen) calculatePosition();
      };
      const handleResize = () => {
        if (isOpen) calculatePosition();
      };
      
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleResize);
      };
    } else if (!isOpen) {
      setPosition(null);
    }
  }, [isOpen, buttonRef]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef?.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      refetch(); // Refetch when opening
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose, refetch, buttonRef]);


  const handleNotificationClick = async (notification: Notification) => {
    // For unread notifications, mark as read and navigate to product detail page
    if (!notification.read) {
      // Mark as read (don't wait for it to complete)
      markAsRead(notification.id).unwrap().catch((error) => {
        console.error("Error marking notification as read:", error);
      });
    }

    console.log("notification:", notification.postId);

    // Navigate to product detail page if postId exists
    if (notification.postId) {
      router.push(`/products/${notification.postId}`);
      onClose();
    } else {
      // If no postId, just close the dropdown
      onClose();
    }
  };

  const notifications = data?.notifications || [];

  // Don't render until mounted and position is calculated
  if (!isOpen || !mounted || !position) return null;

  // TypeScript guard: position is guaranteed to be non-null here
  const { top, right } = position;

  const dropdownContent = (
    <>
      {/* Backdrop - only on mobile */}
      <div
        className="fixed inset-0 bg-black/20 z-[9998] md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Dropdown */}
      <div
        ref={dropdownRef}
        className="fixed w-[calc(100vw-2rem)] sm:w-96 max-w-sm bg-black rounded-2xl shadow-2xl shadow-black/80 border border-gray-900/80 z-[9999] overflow-hidden flex flex-col backdrop-blur-xl"
        style={{
          top: `${top}px`,
          right: `${right}px`,
          maxHeight: "min(600px, calc(100vh - 8rem))",
          position: 'fixed',
        }}
      >
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-900/80 bg-gradient-to-r from-black to-gray-950">
        <h3 className="text-lg font-bold text-white tracking-tight">Notifications</h3>
        <p className="text-xs text-gray-400 mt-1.5 font-medium">
          {notifications.length} unread {notifications.length === 1 ? "notification" : "notifications"}
        </p>
      </div>

      {/* Notifications List */}
      <div className="overflow-y-auto flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner />
          </div>
        ) : notifications.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <div className="text-gray-400 text-sm">No unread notifications</div>
          </div>
        ) : (
          <div className="divide-y divide-gray-900/80">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className="w-full px-5 py-4 text-left hover:bg-gray-950/50 transition-colors duration-200 focus:outline-none focus:bg-gray-950/50"
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30">
                      <svg
                        className="w-5 h-5 text-green-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-white mb-1.5">{notification.title}</div>
                    <div className="text-sm text-gray-300 line-clamp-2 leading-relaxed">{notification.message}</div>
                    <div className="text-xs text-gray-500 mt-2 font-medium">
                      {formatTimeAgo(notification.createdAt)}
                    </div>
                  </div>

                  {/* Unread indicator */}
                  {!notification.read && (
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-lg shadow-green-500/50"></div>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      </div>
    </>
  );

  return createPortal(dropdownContent, document.body);
}
