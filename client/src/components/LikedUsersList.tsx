import React from "react";
import { X, Heart, MapPin, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserProfile, MatchProfile } from "./home";
import { calculateAge, calculateDistance } from "@/utils/profileUtils";

interface LikedUsersListProps {
  isVisible: boolean;
  onClose: () => void;
  isLoading: boolean;
  likedProfiles: MatchProfile[];
  receivedLikeProfiles: MatchProfile[]; // Data for received likes
  isLoadingReceived: boolean; // Loading indicator for received likes
  userProfile: UserProfile;
  handleProfileClick: (username: string) => void;
  handleRemoveLike: (profile: MatchProfile) => Promise<void>;
  isMobile: boolean;
}

const LikedUsersList: React.FC<LikedUsersListProps> = ({
  isVisible,
  onClose,
  isLoading,
  likedProfiles,
  receivedLikeProfiles,
  isLoadingReceived,
  userProfile,
  handleProfileClick,
  handleRemoveLike,
  isMobile,
}) => {
  // If this is the desktop version and not visible, don't render anything
  if (!isMobile && !isVisible) return null;
  
  const renderProfiles = (profiles: MatchProfile[], isProfilesLoading: boolean, emptyMessage: string) => {
    if (isProfilesLoading) {
      return (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      );
    }

    if (profiles.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-6 h-64">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <Heart className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-base font-medium mb-1">{emptyMessage}</h3>
          <p className="text-sm text-gray-500">
            {emptyMessage === "No likes yet" 
              ? "When you like someone, they'll appear here" 
              : "When someone likes you, they'll appear here"}
          </p>
        </div>
      );
    }

    return (
      <div className="divide-y">
        {profiles.map((profile) => (
          <div key={profile.username || profile.email} className="p-4 hover:bg-gray-50 transition-colors relative group">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleProfileClick(profile.username)}>
              <Avatar className="h-12 w-12 border-2 border-indigo-100">
                <AvatarImage src={profile.profile_picture || "/api/placeholder/100/100"} alt={profile.firstname} />
                <AvatarFallback>{profile.firstname?.charAt(0)}</AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900 truncate">
                    {profile.firstname}, {calculateAge(profile.birth_date)}
                  </h3>
                </div>

                {profile.location?.city && (
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span className="truncate">{profile.location.city}</span>
                    {userProfile.location?.latitude && profile.location?.latitude && (
                      <span className="ml-1 flex-shrink-0">
                        (
                        {calculateDistance(
                          userProfile.location.latitude,
                          userProfile.location.longitude,
                          profile.location.latitude,
                          profile.location.longitude
                        )}{" "}
                        km)
                      </span>
                    )}
                  </div>
                )}

                {/* Common interests */}
                {userProfile.interests?.length > 0 && profile.interests?.length > 0 && (
                  <div className="mt-2">
                    <div className="flex flex-wrap gap-1">
                      {profile.interests
                        .filter((interest) => userProfile.interests.includes(interest))
                        .slice(0, 2)
                        .map((interest, index) => (
                          <Badge key={index} variant="outline" className="text-xs px-2 py-0">
                            {interest}
                          </Badge>
                        ))}
                      {profile.interests.filter((interest) => userProfile.interests.includes(interest)).length > 2 && (
                        <Badge variant="outline" className="text-xs px-2 py-0 bg-gray-50">
                          +{profile.interests.filter((interest) => userProfile.interests.includes(interest)).length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>

            {/* Remove like button - appears on hover - only for profiles user has liked */}
            {likedProfiles.includes(profile) && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 bg-white/80 text-red-500 hover:bg-red-50 hover:text-red-600"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveLike(profile);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Mobile view
  if (isMobile) {
    return (
      <div
        className={`fixed top-16 left-0 right-0 bottom-0 bg-white z-50 transition-transform duration-300 md:hidden ${
          isVisible ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ display: isVisible ? "block" : "none" }} // This ensures it's fully hidden when not visible
      >
        <div className="flex items-center justify-between border-b p-4 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold">People You've Liked</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="overflow-y-auto">
          {renderProfiles(likedProfiles, isLoading, "No likes yet")}
        </div>

        <div className="flex items-center justify-between border-b p-4 sticky bg-white z-10">
          <h2 className="text-lg font-bold">People Who Liked You</h2>
        </div>

        <div className="overflow-y-auto h-[calc(100vh-8rem-64px)]">
          {renderProfiles(receivedLikeProfiles, isLoadingReceived, "No likes received yet")}
        </div>
      </div>
    );
  }

  // Desktop view
  return (
    <aside
      className={`hidden md:block absolute top-16 right-0 bottom-0 w-80 bg-white border-l border-gray-200 overflow-y-auto transition-transform duration-300 ${
        isVisible ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="p-4 border-b sticky top-0 bg-white z-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">People You've Liked</h2>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {renderProfiles(likedProfiles, isLoading, "No likes yet")}

      <div className="p-4 border-b sticky bg-white z-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">People Who Liked You</h2>
        </div>
      </div>

      {renderProfiles(receivedLikeProfiles, isLoadingReceived, "No likes received yet")}
    </aside>
  );
};

export default LikedUsersList;