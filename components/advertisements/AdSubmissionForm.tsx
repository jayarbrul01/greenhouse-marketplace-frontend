"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useCreateAdvertisementMutation } from "@/store/api/advertisements.api";
import { useUploadImageMutation } from "@/store/api/posts.api";
import { useLanguage } from "@/contexts/LanguageContext";
import toast from "react-hot-toast";

interface AdSubmissionFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdSubmissionForm({ isOpen, onClose }: AdSubmissionFormProps) {
  const { t } = useLanguage();
  const [businessName, setBusinessName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [description, setDescription] = useState("");
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string>("");
  
  const [createAdvertisement, { isLoading: isSubmitting }] = useCreateAdvertisementMutation();
  const [uploadImage, { isLoading: isUploading }] = useUploadImageMutation();

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    setBannerFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setBannerPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bannerFile) {
      toast.error("Please upload a banner image");
      return;
    }

    try {
      // Upload banner image
      const formData = new FormData();
      formData.append("file", bannerFile);
      const uploadResult = await uploadImage(formData).unwrap();

      // Create advertisement
      await createAdvertisement({
        businessName,
        contactEmail,
        contactPhone: contactPhone || undefined,
        bannerUrl: uploadResult.url,
        websiteUrl: websiteUrl || undefined,
        description: description || undefined,
      }).unwrap();

      toast.success("Advertisement submitted successfully! We'll review it and get back to you soon.");
      
      // Reset form
      setBusinessName("");
      setContactEmail("");
      setContactPhone("");
      setWebsiteUrl("");
      setDescription("");
      setBannerFile(null);
      setBannerPreview("");
      
      onClose();
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || "Failed to submit advertisement";
      toast.error(errorMessage);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t("advertiseHere") || "Advertise Here - Free"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">
            {t("businessName") || "Business Name"} *
          </label>
          <Input
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            required
            placeholder={t("enterBusinessName") || "Enter your business name"}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">
            {t("contactEmail") || "Contact Email"} *
          </label>
          <Input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            required
            placeholder={t("enterEmail") || "your@email.com"}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">
            {t("contactPhone") || "Contact Phone"}
          </label>
          <Input
            type="tel"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            placeholder={t("enterPhone") || "+1 (555) 123-4567"}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">
            {t("websiteUrl") || "Website URL"}
          </label>
          <Input
            type="url"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="https://yourwebsite.com"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">
            {t("description") || "Description"}
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder={t("enterDescription") || "Tell us about your business..."}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">
            {t("bannerImage") || "Banner Image"} *
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleBannerChange}
            className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-500"
          />
          {bannerPreview && (
            <div className="mt-2">
              <img
                src={bannerPreview}
                alt="Banner preview"
                className="w-full h-32 object-cover rounded border border-gray-700"
              />
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting || isUploading}
            className="flex-1"
          >
            {t("cancel")}
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || isUploading || !businessName || !contactEmail || !bannerFile}
            className="flex-1"
          >
            {isSubmitting || isUploading ? (
              <span className="flex items-center gap-2">
                <Spinner /> {t("submitting") || "Submitting..."}
              </span>
            ) : (
              t("submit") || "Submit"
            )}
          </Button>
        </div>

        <p className="text-xs text-gray-400 text-center">
          {t("adSubmissionNote") || "Your advertisement will be reviewed before being displayed on the site."}
        </p>
      </form>
    </Modal>
  );
}
