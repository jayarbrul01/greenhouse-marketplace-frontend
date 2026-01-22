"use client";

import { useState } from "react";
import { useGetAllAdvertisementsQuery, useUpdateAdvertisementMutation } from "@/store/api/advertisements.api";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/layout/Container";
import { useLanguage } from "@/contexts/LanguageContext";
import toast from "react-hot-toast";

export default function AdminAdvertisementsPage() {
  const { t } = useLanguage();
  const [page, setPage] = useState(1);
  const limit = 20;
  const { data, isLoading, refetch } = useGetAllAdvertisementsQuery({ page, limit });
  const [updateAdvertisement, { isLoading: isUpdating }] = useUpdateAdvertisementMutation();

  const handleApprove = async (id: string) => {
    try {
      await updateAdvertisement({
        id,
        status: "APPROVED",
      }).unwrap();
      toast.success("Advertisement approved successfully");
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to approve advertisement");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await updateAdvertisement({
        id,
        status: "REJECTED",
      }).unwrap();
      toast.success("Advertisement rejected successfully");
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to reject advertisement");
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-semibold";
    switch (status) {
      case "APPROVED":
        return `${baseClasses} bg-green-600/20 text-green-400 border border-green-600/30`;
      case "REJECTED":
        return `${baseClasses} bg-red-600/20 text-red-400 border border-red-600/30`;
      case "PENDING":
        return `${baseClasses} bg-yellow-600/20 text-yellow-400 border border-yellow-600/30`;
      default:
        return `${baseClasses} bg-gray-600/20 text-gray-400 border border-gray-600/30`;
    }
  };

  if (isLoading) {
    return (
      <Container>
        <div className="flex items-center justify-center py-12">
          <Spinner />
        </div>
      </Container>
    );
  }

  const advertisements = data?.advertisements || [];
  const pagination = data?.pagination;

  return (
    <Container>
      <div className="py-6">
        <h1 className="text-2xl font-bold text-white mb-6">Advertisement Management</h1>

        {advertisements.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <p className="text-gray-400">No advertisements found</p>
          </div>
        ) : (
          <>
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-900">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Banner</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Business</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Contact</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Views</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Clicks</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Created</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {advertisements.map((ad) => (
                      <tr key={ad.id} className="hover:bg-gray-750">
                        <td className="px-4 py-3">
                          <img
                            src={ad.bannerUrl}
                            alt={ad.businessName}
                            className="w-24 h-16 object-cover rounded"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-white font-medium">{ad.businessName}</div>
                          {ad.description && (
                            <div className="text-xs text-gray-400 mt-1">{ad.description}</div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-300">{ad.contactEmail}</div>
                          {ad.contactPhone && (
                            <div className="text-xs text-gray-400">{ad.contactPhone}</div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={getStatusBadge(ad.status)}>{ad.status}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-300">{ad.views}</td>
                        <td className="px-4 py-3 text-sm text-gray-300">{ad.clicks}</td>
                        <td className="px-4 py-3 text-sm text-gray-400">
                          {new Date(ad.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            {ad.status === "PENDING" && (
                              <>
                                <Button
                                  onClick={() => handleApprove(ad.id)}
                                  disabled={isUpdating}
                                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-xs"
                                >
                                  Approve
                                </Button>
                                <Button
                                  onClick={() => handleReject(ad.id)}
                                  disabled={isUpdating}
                                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-xs"
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                            {ad.status === "APPROVED" && (
                              <Button
                                onClick={() => handleReject(ad.id)}
                                disabled={isUpdating}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-xs"
                              >
                                Reject
                              </Button>
                            )}
                            {ad.status === "REJECTED" && (
                              <Button
                                onClick={() => handleApprove(ad.id)}
                                disabled={isUpdating}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-xs"
                              >
                                Approve
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, pagination.total)} of{" "}
                  {pagination.total} advertisements
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2"
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                    disabled={page === pagination.totalPages}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Container>
  );
}
