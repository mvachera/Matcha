// ProfileHeader.tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UpdateProfileData, User } from "@/types/auth";
import moment from "moment";

interface ProfileHeaderProps {
  user: User;
  profileData: UpdateProfileData;
}

function formatDate(date: string) {
  return moment(date).fromNow().replace("ago", "old");
}

const ProfileHeader = ({ user, profileData }: ProfileHeaderProps) => {
  // Get profile initials for avatar fallback
  const getInitials = () => {
    return user?.username ? user.username.substring(0, 2).toUpperCase() : "PF";
  };

  return (
    <div className="bg-grexen-400 flex items-center space-x-4 justify-center bg-gxreen-400">
      <div className="text-sm text-center text-gray-600">
        <p className="text-xl font-bold">{user.firstname} {user.lastname} (@{user.username})</p>
        <p className="text-right">{formatDate(user.birth_date)}</p>
      </div>
      <Avatar className="h-12 w-12 border-2 border-white">
        {typeof profileData.profile_picture === "string" ? (
          <AvatarImage src={profileData.profile_picture} alt="Profile" />
        ) : profileData.profile_picture ? (
          <AvatarImage src={URL.createObjectURL(profileData.profile_picture)} alt="Profile" />
        ) : null}
        <AvatarFallback>{getInitials()}</AvatarFallback>
      </Avatar>
    </div>
  );
};

export default ProfileHeader;
