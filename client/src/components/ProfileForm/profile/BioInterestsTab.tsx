// BioInterestsTab.tsx
import { useState } from "react";
import { X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UpdateProfileData } from "@/types/auth";

interface BioInterestsTabProps {
  profileData: UpdateProfileData;
  setProfileData: (data: UpdateProfileData) => void;
  goToNextTab: () => void;
  goToPreviousTab: () => void;
}

const BioInterestsTab = ({ 
  profileData, 
  setProfileData, 
  goToNextTab, 
  goToPreviousTab 
}: BioInterestsTabProps) => {
  const [newTag, setNewTag] = useState("");

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newTag.trim() !== "") {
      e.preventDefault();
      if (profileData.interests && profileData.interests.length >= 5) return true;

      const formattedTag = !newTag.startsWith("#") ? `#${newTag.trim()}` : newTag.trim();

      setProfileData({
        ...profileData,
        interests: [...profileData.interests, formattedTag],
      });
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setProfileData({
      ...profileData,
      interests: profileData.interests.filter((tag) => tag !== tagToRemove),
    });
  };

  return (
    <>
      {/* Biography */}
      <div className="space-y-3">
        <Label htmlFor="bio" className="text-base font-semibold">
          Biography
        </Label>
        <Textarea
          id="bio"
          name="biography"
          value={profileData.biography}
          onChange={(e) => setProfileData({ ...profileData, biography: e.target.value })}
          className="min-h-32 text-base"
          placeholder="Tell us about yourself..."
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>10-200 characters</span>
          <span className={profileData.biography.length < 10 || profileData.biography.length > 200 ? "text-red-500" : ""}>
            {profileData.biography.length}/200 characters
          </span>
        </div>
      </div>

      {/* Interests/Tags */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="interests" className="text-base font-semibold">
            Interests (Press Enter to add)
          </Label>
          <span className={profileData.interests && profileData.interests.length >= 5 ? "text-red-500 text-sm" : "text-gray-500 text-sm"}>
            {profileData.interests.length}/5
          </span>
        </div>
        <Input
          id="interests"
          name="interests"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={handleAddTag}
          className="text-base"
          placeholder="Add interests (e.g. vegan, geek, piercing)"
          disabled={profileData.interests && profileData.interests.length >= 5}
        />
        <div className="flex flex-wrap gap-2 mt-3">
          {profileData.interests.map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-base py-1 px-3 flex items-center gap-1">
              {tag}
              <Button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0 ml-1 text-blue-600 hover:text-blue-800 hover:bg-transparent">
                <X className="h-3 w-3" />
                <span className="sr-only">Remove</span>
              </Button>
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex justify-between mt-6 pt-4">
        <Button type="button" onClick={goToPreviousTab} variant="outline" className="mb-5">
          Previous
        </Button>
        <Button type="button" onClick={goToNextTab}>
          Next
        </Button>
      </div>
    </>
  );
};

export default BioInterestsTab;