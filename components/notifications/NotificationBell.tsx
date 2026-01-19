"use client";

import { forwardRef } from "react";

interface NotificationBellProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  unreadCount: number;
}

export const NotificationBell = forwardRef<HTMLButtonElement, NotificationBellProps>(
  ({ isOpen, onToggle, onClose, unreadCount }, ref) => {
    return (
      <button
        ref={ref}
        onClick={onToggle}
        className="relative p-2 rounded-lg bg-black hover:bg-gray-950 border border-gray-900/80 hover:border-green-500/60 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-black"
        aria-label="Notifications"
      >
        <svg
          className="w-6 h-6 text-white hover:text-green-400 transition-colors"
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
        {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-red-500 rounded-full border-2 border-black shadow-lg shadow-red-500/50">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>
    );
  }
);

NotificationBell.displayName = "NotificationBell";
