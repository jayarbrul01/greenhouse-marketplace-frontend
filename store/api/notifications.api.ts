import { api } from "./baseApi";

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  postId: string | null;
  createdAt: string;
}

export const notificationsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    registerFCMToken: builder.mutation<{ message: string }, { fcmToken: string }>({
      query: (body) => ({
        url: "/notifications/fcm-token",
        method: "POST",
        body,
      }),
    }),
    removeFCMToken: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: "/notifications/fcm-token",
        method: "DELETE",
      }),
    }),
    getUnreadNotifications: builder.query<{ notifications: Notification[] }, void>({
      query: () => ({
        url: "/notifications/unread",
        method: "GET",
      }),
      providesTags: ["Notifications"],
    }),
    getUnreadCount: builder.query<{ count: number }, void>({
      query: () => ({
        url: "/notifications/unread/count",
        method: "GET",
      }),
      providesTags: ["Notifications"],
    }),
    markAsRead: builder.mutation<{ notification: Notification }, string>({
      query: (notificationId) => ({
        url: `/notifications/${notificationId}/read`,
        method: "PATCH",
      }),
      invalidatesTags: ["Notifications"],
    }),
  }),
});

export const {
  useRegisterFCMTokenMutation,
  useRemoveFCMTokenMutation,
  useGetUnreadNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
} = notificationsApi;

// Export to ensure it's registered
export default notificationsApi;
