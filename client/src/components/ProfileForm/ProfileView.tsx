import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const sex: { [key: string]: string } = {
  male: "homme",
  female: "femme",
  other: "autre",
};

const sexual_preferences: { [key: string]: string } = {
  male: "hommes",
  female: "lydia",
  other: "autres",
};

const formatSexualPreferences = (preferences: string[]) => {
  preferences = preferences.sort().reverse();
  if (preferences.length === 1) {
    return sexual_preferences[preferences[0]];
  }
  if (preferences.length === 2) {
    return `${sexual_preferences[preferences[0]]} et ${sexual_preferences[preferences[1]]}`;
  }
  return "tout le monde";
};

function ProfileView({ setProfileComplete }: { setProfileComplete: React.Dispatch<React.SetStateAction<boolean>> }) {
  const { user } = useAuth();

  if (!user) return null;
  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          {user.firstname} {user.lastname}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-6 items-center">
          <Avatar className="w-24 h-24">
            {user.profile_picture ? (
              <AvatarImage src={user.profile_picture} alt="Profile Picture" />
            ) : (
              <AvatarFallback className="bg-blue-100 text-blue-800 text-xl">{user.firstname?.charAt(0).toUpperCase() + user.lastname?.charAt(0).toUpperCase()}</AvatarFallback>
            )}
          </Avatar>

          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-xl font-medium">
              {new Date().getFullYear() - new Date(user.birth_date).getFullYear()} ans, {sex[user.gender]}
            </h3>
            <p className="text-muted-foreground">{`${user.location.city}, ${user.location.country}`}</p>
            <p className="text-sm">Intéressé par {formatSexualPreferences(user.sexual_preferences)}</p>
          </div>
        </div>
        <Separator />
        <div>
          <h3 className="font-medium mb-2">Biography</h3>
          <p className="text-muted-foreground">{user.biography || "No biography provided"}</p>
        </div>
        <div>
          <h3 className="font-medium mb-2">Interests</h3>
          <div className="flex flex-wrap gap-2">
            {user.interests && user.interests.length > 0 ? (
              user.interests.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))
            ) : (
              <p className="text-muted-foreground">No interests added</p>
            )}
          </div>
        </div>
        {user.pictures && user.pictures.length > 0 && (
          <div>
            <h3 className="font-medium mb-2">Photos</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {user.pictures.map((pic, index) => (
                <div key={index} className="aspect-square rounded-md overflow-hidden">
                  {typeof pic === "string" ? (
                    <img src={pic} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                  ) : (
                    <img src={URL.createObjectURL(pic)} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        <Button className="w-full" variant="outline" onClick={() => setProfileComplete(false)}>
          Edit Profile
        </Button>
      </CardContent>
    </Card>
  );
}

export default ProfileView;
