// 1. ProfileForm.tsx - Main container component
import { useState, FormEvent, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { UpdateProfileData } from "@/types/auth";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import ProfileView from "./ProfileView";
import { Progress } from "@/components/ui/progress";
import BasicInfoTab from "./profile/BasicInfoTab";
import BioInterestsTab from "./profile/BioInterestsTab";
import PhotosTab from "./profile/PhotosTab";
import ProfileHeader from "./profile/ProfileHeader";
import { handleProfileUpdateError } from "@/components/utils/profileValidation";

function PreferencesForms() {
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const [profileComplete, setProfileComplete] = useState(false);
  const [activeTab, setActiveTab] = useState("basic-info");
  const [profileData, setProfileData] = useState<UpdateProfileData>({
    gender: "male",
    sexual_preferences: ["female", "other"],
    authorize_location: false,
    location: { latitude: 0, longitude: 0, city: "", country: "" },
    biography: "Pitié pour moi, je suis un(e) flemmard(e) et je n'ai pas écrit de biographie. 😅",
    interests: ["#coding", "#gaming", "#music"],
    pictures: ["https://randomuser.me/api/portraits/men/4.jpg", "https://randomuser.me/api/portraits/men/3.jpg", "https://randomuser.me/api/portraits/men/4.jpg"],
    profile_picture: "https://randomuser.me/api/portraits/men/1.jpg",
  });
  const { updateProfile } = useAuth();
  const [isGeolocationEnabled, setIsGeolocationEnabled] = useState(true);
  const [formErrors, setFormErrors] = useState<Record<string, boolean>>({
    basicInfo: false,
    biography: false,
    photos: false,
  });

  // Update profileData when user data is loaded
  useEffect(() => {
    if (user) {
      setProfileComplete(user.profile_complete || false);
      setProfileData({
        gender: user.gender || profileData.gender,
        sexual_preferences: user.sexual_preferences?.length > 0 ? user.sexual_preferences : profileData.sexual_preferences,
        authorize_location: user.authorize_location || profileData.authorize_location,
        location: user.location || profileData.location,
        biography: user.biography || profileData.biography,
        interests: user.interests?.length > 0 ? user.interests : profileData.interests,
        pictures: user.pictures?.length > 0 ? user.pictures : profileData.pictures,
        profile_picture: user.profile_picture || profileData.profile_picture,
      });
    }
  }, [user]);

  // Check completion status for tabs
  const checkTabCompletion = () => {
    const errors = {
      basicInfo: !profileData.gender || !profileData.sexual_preferences || profileData.sexual_preferences.length === 0,
      biography: !profileData.biography || profileData.biography.length < 10 || profileData.interests.length === 0,
      photos: !profileData.profile_picture || !profileData.pictures || profileData.pictures.length === 0,
    };

    setFormErrors(errors);
    return errors;
  };

  useEffect(() => {
    checkTabCompletion();
  }, [profileData]);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position: GeolocationPosition) => {
          setIsGeolocationEnabled(true);
          if (profileData.location.city && profileData.location.country) return true;
          fetchCityAndCountryFromCoords(position.coords.latitude, position.coords.longitude);
        },
        (error: GeolocationPositionError) => {
          setIsGeolocationEnabled(false);
          console.warn("Permission denied or error: ", error);
          getLocationByIP(); // Fallback to IP
        }
      );
    } else {
      getLocationByIP();
    }
  }, []);

  // If still loading or no user, show loading state
  if (loading) {
    return <div>Loading profile information...</div>;
  }

  // If not loading and no user, redirect to login
  if (!loading && !user) {
    // You could use a React Router redirect here
    // Or show a message with a link to login
    return (
      <div>
        <h2>Please log in to access your preferences</h2>
        <button onClick={() => (window.location.href = "/login")}>Go to Login</button>
      </div>
    );
  }
  async function fetchCityAndCountryFromCoords(latitude: number, longitude: number): Promise<void> {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
      const data = await response.json();

      const city = data.address.city || data.address.town || data.address.village || "";
      const country = data.address.country || "";

      setProfileData((prevData) => ({
        ...prevData,
        location: {
          latitude: latitude,
          longitude: longitude,
          city: city,
          country: country,
        },
      }));
    } catch (error) {
      console.error("Error during reverse geocoding:", error);
    }
  }

  async function getLocationByIP(): Promise<void> {
    try {
      if (profileData.location.longitude && profileData.location.latitude && profileData.location.city && profileData.location.country) {
        return true;
      }
      const response = await fetch("https://ipapi.co/json/");
      const data: {
        city: string;
        country_name: string;
        latitude: number;
        longitude: number;
      } = await response.json();

      setProfileData((prevData) => ({
        ...prevData,
        location: {
          latitude: data.latitude,
          longitude: data.longitude,
          city: data.city,
          country: data.country_name,
        },
      }));
    } catch (error) {
      console.error("Error retrieving IP location:", error);
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Check for errors
    const errors = checkTabCompletion();
    const hasErrors = Object.values(errors).some((error) => error);

    if (hasErrors) {
      // Find first tab with error and switch to it
      if (errors.basicInfo) {
        setActiveTab("basic-info");
      } else if (errors.biography) {
        setActiveTab("bio-interests");
      } else if (errors.photos) {
        setActiveTab("photos");
      }

      toast({
        title: "Please complete all required information",
        description: "Check that all tabs are filled correctly",
        variant: "destructive",
      });
      return;
    }

    if (handleProfileUpdateError(profileData)) return;

    try {
      await updateProfile(profileData);
      toast({
        title: "Profile updated successfully",
        description: "Your profile has been saved",
        variant: "default",
      });
      setProfileComplete(true);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error updating profile",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  const goToNextTab = () => {
    if (activeTab === "basic-info") {
      setActiveTab("bio-interests");
    } else if (activeTab === "bio-interests") {
      setActiveTab("photos");
    }
  };

  const goToPreviousTab = () => {
    if (activeTab === "photos") {
      setActiveTab("bio-interests");
    } else if (activeTab === "bio-interests") {
      setActiveTab("basic-info");
    }
  };

  if (profileComplete) {
    return <ProfileView setProfileComplete={setProfileComplete} />;
  }

  return (
    <div className="w-full px-4 py-8 sm:px-6 md:py-12 h-full flex justify-center items-center">
      <Card>
        <div className="w-[700px] h-[600px] max-w-xl mx-auto p-5 flex flex-col justify-between bg-yelloxw-900">
          <ProfileHeader user={user} profileData={profileData} />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full bg-x-600">
            <form onSubmit={handleSubmit}>
              <TabsContent value="basic-info" className="space-y-6 mt-4">
                <BasicInfoTab profileData={profileData} setProfileData={setProfileData} isGeolocationEnabled={isGeolocationEnabled} goToNextTab={goToNextTab} />
              </TabsContent>

              <TabsContent value="bio-interests" className="space-y-6 mt-4">
                <BioInterestsTab profileData={profileData} setProfileData={setProfileData} goToNextTab={goToNextTab} goToPreviousTab={goToPreviousTab} />
              </TabsContent>

              <TabsContent value="photos" className="space-y-6 mt-4">
                <PhotosTab profileData={profileData} setProfileData={setProfileData} goToPreviousTab={goToPreviousTab} />
              </TabsContent>

              {/* Progress indicator */}
              <div className="px-6 pb-6">
                <Progress value={activeTab === "basic-info" ? 33 : activeTab === "bio-interests" ? 66 : 100} className="w-full" />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Basic Info</span>
                  <span>Bio & Interests</span>
                  <span>Photos</span>
                </div>
              </div>
            </form>
          </Tabs>
        </div>
      </Card>
    </div>
  );
}

export default PreferencesForms;
