"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, User, Shield, Activity, Plus, X, Target, Pencil, Check } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { FormField } from "@/components/shared/form-field";
import { CategoryBadge } from "@/components/shared/category-badge";
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog";
import { useAuthStore } from "@/stores/auth-store";
import { updateProfileSchema, type UpdateProfileFormData } from "@/lib/validation/schemas";
import { getInitials, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { CATEGORIES } from "@/constants/categories";
import type { Category } from "@/types/common";

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuthStore();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingGoals, setEditingGoals] = useState(false);
  const [goalDraft, setGoalDraft] = useState<string[]>(user?.personalGoals ?? []);
  const [newGoalText, setNewGoalText] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting, isDirty } } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      fullName: user?.fullName ?? "",
      phone: user?.phone ?? "",
      location: user?.location ?? "",
      bio: user?.bio ?? "",
    },
  });

  async function onSaveProfile(data: UpdateProfileFormData) {
    await new Promise(r => setTimeout(r, 600));
    updateUser(data);
    toast.success("Profile updated successfully.");
  }

  function toggleFocusArea(cat: Category) {
    if (!user) return;
    const areas = user.focusAreas.includes(cat)
      ? user.focusAreas.filter(a => a !== cat)
      : [...user.focusAreas, cat];
    updateUser({ focusAreas: areas });
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user?.avatarUrl} />
            <AvatarFallback className="text-2xl font-bold">{getInitials(user?.fullName ?? "U")}</AvatarFallback>
          </Avatar>
          <button
            className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-white shadow hover:bg-[hsl(var(--primary-hover))] transition-colors"
            aria-label="Change profile photo"
            onClick={() => toast("Photo upload coming soon!")}
          >
            <Camera className="h-3.5 w-3.5" />
          </button>
        </div>
        <div>
          <h1 className="text-2xl font-black text-[hsl(var(--text-primary))]">{user?.fullName}</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))]">{user?.email}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <Badge variant="secondary" className="capitalize">{user?.userType}</Badge>
            <Badge variant="purple" className="capitalize">{user?.subscriptionPlan} plan</Badge>
          </div>
        </div>
      </div>

      <Tabs defaultValue="personal">
        <TabsList className="w-full overflow-x-auto justify-start">
          <TabsTrigger value="personal"><User className="h-4 w-4 mr-1.5" />Personal</TabsTrigger>
          <TabsTrigger value="goals">Goals & Interests</TabsTrigger>
          <TabsTrigger value="security"><Shield className="h-4 w-4 mr-1.5" />Security</TabsTrigger>
          <TabsTrigger value="activity"><Activity className="h-4 w-4 mr-1.5" />Activity</TabsTrigger>
        </TabsList>

        {/* Personal information */}
        <TabsContent value="personal" className="mt-5">
          <Card>
            <CardHeader><CardTitle className="text-base">Personal Information</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSaveProfile)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Full name" htmlFor="fullName" required error={errors.fullName?.message}>
                    <Input id="fullName" {...register("fullName")} error={!!errors.fullName} />
                  </FormField>
                  <FormField label="Phone" htmlFor="phone" error={errors.phone?.message}>
                    <Input id="phone" type="tel" {...register("phone")} />
                  </FormField>
                  <FormField label="Location" htmlFor="location" error={errors.location?.message}>
                    <Input id="location" placeholder="City, Country" {...register("location")} />
                  </FormField>
                  <div className="flex items-end">
                    <div className="space-y-1 flex-1">
                      <p className="text-sm font-medium text-[hsl(var(--text-primary))]">Email</p>
                      <p className="text-sm text-[hsl(var(--text-secondary))] bg-[hsl(var(--muted))] rounded-lg px-3 py-2">{user?.email}</p>
                    </div>
                  </div>
                </div>
                <FormField label="Bio" htmlFor="bio" error={errors.bio?.message} description="A short description about yourself (max 500 characters)">
                  <Textarea id="bio" rows={3} placeholder="Tell us about yourself…" {...register("bio")} />
                </FormField>
                <div className="flex gap-3 pt-2">
                  <Button type="submit" loading={isSubmitting} disabled={!isDirty}>Save changes</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Goals & interests */}
        <TabsContent value="goals" className="mt-5 space-y-5">
          <Card>
            <CardHeader><CardTitle className="text-base">Focus Areas</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-[hsl(var(--text-secondary))] mb-4">Select the areas you want LifeKit to focus on for recommendations and mission templates.</p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => {
                  const active = user?.focusAreas.includes(cat.value);
                  return (
                    <button
                      key={cat.value}
                      onClick={() => toggleFocusArea(cat.value)}
                      className={`rounded-full border-2 px-3 py-1.5 text-sm font-medium transition-all ${
                        active ? "border-[hsl(var(--primary))] bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]" : "border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:border-[hsl(var(--primary))]/50"
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
              <Button className="mt-4" size="sm" onClick={() => toast.success("Focus areas saved!")}>Save preferences</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Personal Goals</CardTitle>
                {!editingGoals ? (
                  <Button
                    variant="ghost"
                    size="xs"
                    leftIcon={<Pencil className="h-3.5 w-3.5" />}
                    onClick={() => { setGoalDraft(user?.personalGoals ?? []); setEditingGoals(true); }}
                  >
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => setEditingGoals(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="xs"
                      leftIcon={<Check className="h-3.5 w-3.5" />}
                      onClick={() => {
                        updateUser({ personalGoals: goalDraft });
                        setEditingGoals(false);
                        toast.success("Goals saved!");
                      }}
                    >
                      Save
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {editingGoals ? (
                <>
                  {goalDraft.map((goal, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-[hsl(var(--primary))] shrink-0" />
                      <input
                        value={goal}
                        onChange={e => setGoalDraft(prev => prev.map((g, idx) => idx === i ? e.target.value : g))}
                        className="flex-1 text-sm bg-transparent border-b border-[hsl(var(--border))] focus:border-[hsl(var(--primary))] outline-none py-0.5 text-[hsl(var(--text-primary))]"
                      />
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setGoalDraft(prev => prev.filter((_, idx) => idx !== i))}
                        aria-label="Remove goal"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      value={newGoalText}
                      onChange={e => setNewGoalText(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter" && newGoalText.trim()) {
                          setGoalDraft(prev => [...prev, newGoalText.trim()]);
                          setNewGoalText("");
                        }
                      }}
                      placeholder="Add a new goal and press Enter…"
                      className="flex-1 text-sm bg-[hsl(var(--muted))] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--muted-foreground))]"
                    />
                    <Button
                      size="icon-sm"
                      variant="outline"
                      onClick={() => {
                        if (newGoalText.trim()) {
                          setGoalDraft(prev => [...prev, newGoalText.trim()]);
                          setNewGoalText("");
                        }
                      }}
                      aria-label="Add goal"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {goalDraft.length === 0 && (
                    <p className="text-xs text-[hsl(var(--text-secondary))]">No goals yet — add one above.</p>
                  )}
                </>
              ) : (
                <>
                  {(user?.personalGoals ?? []).length === 0 ? (
                    <p className="text-sm text-[hsl(var(--text-secondary))]">No personal goals set yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {(user?.personalGoals ?? []).map((goal, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-[hsl(var(--text-secondary))]">
                          <Target className="h-4 w-4 text-[hsl(var(--primary))] shrink-0" />
                          {goal}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="mt-5 space-y-5">
          <Card>
            <CardHeader><CardTitle className="text-base">Change Password</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <FormField label="Current password" htmlFor="current-password">
                <Input id="current-password" type="password" autoComplete="current-password" />
              </FormField>
              <FormField label="New password" htmlFor="new-password">
                <Input id="new-password" type="password" autoComplete="new-password" />
              </FormField>
              <FormField label="Confirm new password" htmlFor="confirm-password">
                <Input id="confirm-password" type="password" autoComplete="new-password" />
              </FormField>
              <Button onClick={() => toast.success("Password updated!")}>Update password</Button>
            </CardContent>
          </Card>

          <Card className="border-red-200 dark:border-red-800">
            <CardHeader><CardTitle className="text-base text-red-600 dark:text-red-400">Danger Zone</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-[hsl(var(--text-secondary))] mb-3">Permanently delete your account and all associated data. This action cannot be undone.</p>
              <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>Delete my account</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity */}
        <TabsContent value="activity" className="mt-5">
          <Card>
            <CardHeader><CardTitle className="text-base">Recent Activity</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { action: "Completed task", detail: "Complete React advanced patterns module", time: "2 hours ago" },
                  { action: "Mission updated", detail: "Become a Software Engineer", time: "1 day ago" },
                  { action: "Milestone achieved", detail: "Learn Python, DSA and GitHub", time: "3 days ago" },
                  { action: "Memory saved", detail: "Prefers hands-on learning", time: "1 week ago" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm">
                    <div className="h-2 w-2 rounded-full bg-[hsl(var(--primary))] mt-1.5 shrink-0" />
                    <div>
                      <span className="font-medium text-[hsl(var(--text-primary))]">{item.action}:</span>
                      <span className="text-[hsl(var(--text-secondary))] ml-1">{item.detail}</span>
                      <p className="text-[10px] text-[hsl(var(--text-secondary))] mt-0.5">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Connected accounts tab removed — available in Settings > Integrations */}
      </Tabs>

      <ConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete your account?"
        description="All your missions, tasks, memories and data will be permanently deleted. This cannot be undone."
        confirmLabel="Yes, delete my account"
        onConfirm={() => { logout(); toast("Account deleted."); }}
      />
    </div>
  );
}
