import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { UpdateProfileData } from "@/types/auth";

const SexualPreferencesSelector = ({ profileData, setProfileData }: { profileData: UpdateProfileData, setProfileData: React.Dispatch<React.SetStateAction<UpdateProfileData>> }) => {
  const handleCheckboxChange = (option: string, checked: boolean) => {
    if (checked) {
      setProfileData({
        ...profileData,
        sexual_preferences: [...profileData.sexual_preferences, option]
      });
    } else {
      setProfileData({
        ...profileData,
        sexual_preferences: profileData.sexual_preferences.filter(pref => pref !== option)
      });
    }
  };

  return (
    <div className="space-y-3">
      <Label className="text-base font-semibold">Sexual Preferences</Label>
      <div className="flex flex-col sm:flex-row gap-4">
        {["male", "female", "other"].map((option) => (
          <div key={option} className="flex items-center space-x-2">
            <Checkbox 
              id={`preference-${option}`} 
              checked={profileData.sexual_preferences.includes(option)}
              onCheckedChange={(checked) => handleCheckboxChange(option, checked as boolean)}
            />
            <Label 
              htmlFor={`preference-${option}`} 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SexualPreferencesSelector;