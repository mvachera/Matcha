// utils/profileValidation.ts
import { UpdateProfileData } from "@/types/auth";

export function handleProfileUpdateError(profileData: UpdateProfileData) {
  let description: string | null = null;

  if (!profileData.interests || profileData.interests.length === 0) {
    description = "Please add at least one interest";
  } else if (!profileData.profile_picture) {
    description = "Please add a profile picture";
  } else if (profileData.pictures && profileData.pictures.length === 0) {
    description = "Please add at least one additional picture";
  } else if (!profileData.location.city || !profileData.location.country) {
    description = "Please authorize location sharing";
  } else if (profileData.interests.length > 5) {
    description = "Maximum 5 interests allowed";
  } else if (profileData.pictures && profileData.pictures.length > 4) {
    description = "Maximum 4 additional pictures allowed";
  } else if (profileData.biography.length > 200 || profileData.biography.length < 10) {
    description = "Biography must be between 10 and 200 characters";
  } else if (profileData.interests.some((tag) => tag.length > 20)) {
    description = "Interests must be less than 20 characters";
  }

  if (description) {
    return true;
  }
  return false;
}