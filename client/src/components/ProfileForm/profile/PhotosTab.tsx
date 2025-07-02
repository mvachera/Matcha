// PhotosTab.tsx
import { X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UpdateProfileData } from "@/types/auth";
import { useToast } from "@/hooks/use-toast";

interface PhotosTabProps {
  profileData: UpdateProfileData;
  setProfileData: (data: UpdateProfileData) => void;
  goToPreviousTab: () => void;
}

const PhotosTab = ({ 
  profileData, 
  setProfileData, 
  goToPreviousTab 
}: PhotosTabProps) => {
  const { toast } = useToast();
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isProfilePic: boolean) => {
    const files = e.target.files;
    if (!files) return true;

    if (isProfilePic) {
      setProfileData({
        ...profileData,
        profile_picture: files[0],
      });
    } else {
      if (profileData.pictures && profileData.pictures.length + files.length <= 4) {
        setProfileData({
          ...profileData,
          pictures: [...profileData.pictures, ...Array.from(files)],
        });
      } else {
        toast({
          title: "Too many pictures",
          description: "Maximum 4 additional pictures allowed",
          variant: "destructive",
        });
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    setProfileData({
      ...profileData,
      pictures: profileData.pictures && profileData.pictures.filter((_, i) => i !== index),
    });
  };

  return (
    <>
      {/* Profile Picture */}
      <div className="space-y-3">
        <Label htmlFor="profilePic" className="text-base font-semibold">
          Profile Picture
        </Label>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="w-32 h-32 rounded-md overflow-hidden flex-shrink-0 bg-gray-100 flex justify-center items-center">
            {profileData.profile_picture ? (
              typeof profileData.profile_picture === "string" ? (
                <img src={profileData.profile_picture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <img src={URL.createObjectURL(profileData.profile_picture)} alt="Profile" className="w-full h-full object-cover" />
              )
            ) : (
              <span className="text-gray-400">No image</span>
            )}
          </div>
          <div className="flex-grow w-full">
            <Input 
              id="profilePic" 
              name="profile_picture" 
              type="file" 
              accept="image/*" 
              onChange={(e) => handleImageUpload(e, true)} 
              className="text-base" 
            />
            <p className="text-xs text-gray-500 mt-1">This will be your main profile picture visible to others</p>
          </div>
        </div>
      </div>

      {/* Additional Pictures */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">
            Additional Pictures
          </Label>
          <span className={profileData.pictures?.length === 0 ? "text-red-500 text-sm" : "text-gray-500 text-sm"}>
            {profileData.pictures?.length || 0}/4 (at least 1 required)
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
          {profileData.pictures &&
            profileData.pictures.map((pic, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-md overflow-hidden bg-slate-100">
                  {typeof pic === "string" ? (
                    <img src={pic} alt={`Additional ${index + 1}`} className="w-full h-full object-cover" />
                  ) : (
                    <img src={URL.createObjectURL(pic)} alt={`Additional ${index + 1}`} className="w-full h-full object-cover" />
                  )}
                </div>
                <Button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0">
                  <X className="h-4 w-4" />
                  <span className="sr-only">Remove</span>
                </Button>
              </div>
            ))}

          {/* Empty slots */}
          {profileData.pictures &&
            profileData.pictures.length < 4 &&
            Array.from({ length: 4 - profileData.pictures.length }).map((_, i) => (
              <Label
                htmlFor={`additionalPics-${i}`}
                key={`empty-${i}`}
                className="aspect-square rounded-md border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50">
                <Input
                  id={`additionalPics-${i}`}
                  name="additionalPictures"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleImageUpload(e, false)}
                  disabled={profileData.pictures && profileData.pictures.length >= 4}
                  className="text-base hidden"
                />
                <p className="text-gray-400 text-xs">Empty slot</p>
              </Label>
            ))}
        </div>
      </div>

      <div className="flex justify-between mt-6 pt-4">
        <Button type="button" onClick={goToPreviousTab} variant="outline" className="mb-5">
          Previous
        </Button>
        <Button type="submit" variant="default" className="mb-5">
          Save Profile
        </Button>
      </div>
    </>
  );
};

export default PhotosTab;