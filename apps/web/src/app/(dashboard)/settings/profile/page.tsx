"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/shared/form-field";
import { useAuthStore } from "@/stores/auth-store";
import { updateProfileSchema, type UpdateProfileFormData } from "@/lib/validation/schemas";
import { ROUTES } from "@/constants/routes";
import { toast } from "sonner";

export default function EditProfilePage() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();

  const { register, handleSubmit, formState: { errors, isSubmitting, isDirty } } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      fullName: user?.fullName ?? "",
      phone: user?.phone ?? "",
      location: user?.location ?? "",
      bio: user?.bio ?? "",
    },
  });

  async function onSave(data: UpdateProfileFormData) {
    await new Promise(r => setTimeout(r, 500));
    updateUser(data);
    toast.success("Profile updated.");
    router.push(ROUTES.PROFILE);
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => router.push(ROUTES.PROFILE)}
          aria-label="Back to profile"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-black text-[hsl(var(--text-primary))] flex items-center gap-2">
            <User className="h-6 w-6 text-[hsl(var(--primary))]" /> Edit Profile
          </h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-0.5">
            Update your personal information
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSave)} className="space-y-4" noValidate>
            <FormField label="Full name" htmlFor="fullName" required error={errors.fullName?.message}>
              <Input
                id="fullName"
                placeholder="Your full name"
                {...register("fullName")}
                error={!!errors.fullName}
              />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Phone" htmlFor="phone" error={errors.phone?.message}>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 00000 00000"
                  {...register("phone")}
                />
              </FormField>
              <FormField label="Location" htmlFor="location" error={errors.location?.message}>
                <Input
                  id="location"
                  placeholder="City, Country"
                  {...register("location")}
                />
              </FormField>
            </div>

            {/* Email — read-only */}
            <div>
              <p className="text-sm font-medium text-[hsl(var(--text-primary))] mb-1.5">Email</p>
              <p className="text-sm text-[hsl(var(--text-secondary))] bg-[hsl(var(--muted))] rounded-lg px-3 py-2">
                {user?.email}
              </p>
              <p className="text-xs text-[hsl(var(--text-secondary))] mt-1">
                Email cannot be changed here. Contact support if needed.
              </p>
            </div>

            <FormField
              label="Bio"
              htmlFor="bio"
              error={errors.bio?.message}
              description="A short description about yourself (max 500 characters)"
            >
              <Textarea
                id="bio"
                rows={4}
                placeholder="Tell us about yourself…"
                {...register("bio")}
              />
            </FormField>

            <div className="flex gap-3 pt-2">
              <Button type="submit" loading={isSubmitting} disabled={!isDirty}>
                Save changes
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(ROUTES.PROFILE)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
