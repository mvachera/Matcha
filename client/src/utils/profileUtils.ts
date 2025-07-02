import { UserProfile, MatchProfile } from "@/components/home";

/**
 * Calculate age from birth date
 */
export const calculateAge = (birthDate?: string): number => {
  if (!birthDate) return 0;
  
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
};

/**
 * Calculate distance between two points using Haversine formula
 */
export const calculateDistance = (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
};

/**
 * Calculate common interests score between two profiles
 */
export const calculateCommonInterestsScore = (
  profile1: UserProfile, 
  profile2: MatchProfile
): number => {
  if (!profile1.interests?.length) return 0;

  // Normalize interests (remove # and convert to lowercase)
  const normalizeInterest = (interest: string): string => {
    if (typeof interest !== "string") return String(interest).toLowerCase();
    return interest.startsWith("#")
      ? interest.substring(1).toLowerCase()
      : interest.toLowerCase();
  };

  const normalizedInterests1 = profile1.interests.map(normalizeInterest);
  const normalizedInterests2 = profile2.interests.map(normalizeInterest);

  // Find common interests
  const commonInterests = normalizedInterests1.filter((interest) =>
    normalizedInterests2.includes(interest)
  );

  return (commonInterests.length / normalizedInterests1.length) * 100;
};

/**
 * Check if profiles match based on sexual preferences
 */
export const checkSexualPreferenceMatch = (
  profile1: UserProfile, 
  profile2: UserProfile
): boolean => {
  if (
    !profile1.sexual_preferences ||
    !profile2.sexual_preferences ||
    !profile1.gender ||
    !profile2.gender
  ) {
    return false;
  }
  
  return (
    profile1.sexual_preferences.includes(profile2.gender) && 
    profile2.sexual_preferences.includes(profile1.gender)
  );
};