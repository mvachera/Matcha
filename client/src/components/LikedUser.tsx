import React, { useState, useEffect } from 'react';
import { User, Heart, X } from 'lucide-react';
// import { formatDistance, set } from 'date-fns';
// import { fr } from 'date-fns/locale';
import api from '@/services/api';
// Import shadcn components
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { calculateAge } from "./utils/dateUtils";

interface LikedUser {
  username: string;
  firstname: string;
  profile_picture: string;
  birth_date: string;
}

interface LikedUsersProps {
  username: string;
}

const LikedUsers: React.FC<LikedUsersProps> = ({ username }) => {
  const [likedUsers, setLikedUsers] = useState<LikedUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLikedUsers = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/like/${username}/sent`);

		    setLikedUsers(response.data);
		    console.log(response.data);

      } catch (err) {
        setError('Impossible de charger les utilisateurs likés');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (username) {
      fetchLikedUsers();
    }
  }, [username]);

  const unlikeUser = (username: string) => async () => {
    try {
      setIsLoading(true);
      const unlike = await api.delete(`/like/delete/${username}`);

      setLikedUsers(likedUsers.filter((user) => user.username !== username));
      console.log(unlike.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className={`transition-all duration-300 overflow-hidden ${isExpanded ? 'w-64' : 'w-16'}`}>
      <CardHeader className="p-2 bg-purple-100 flex flex-row items-center justify-between space-y-0">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsExpanded(!isExpanded)}
          className="rounded-full hover:bg-purple-200 p-2"
          title={isExpanded ? 'Réduire' : 'Voir mes likes'}
        >
          <Heart size={20} className="text-purple-600" />
        </Button>
        {isExpanded && <Badge variant="secondary" className="bg-purple-200 text-purple-800">Mes Likes</Badge>}
      </CardHeader>

      {isExpanded && (
      <CardContent className="p-0">
        {/* Condition pour afficher le chargement */}
        {isLoading ? (
          <div className="p-4 text-center text-gray-500">
            Chargement...
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-500">
            {error}
          </div>
        ) : !likedUsers || likedUsers.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            Vous n'avez liké personne
          </div>
        ) : (
          <div className="max-h-60 overflow-y-auto">
            {likedUsers.map((user) => (
              <div key={user.username} 
              onClick={() => navigate(`/user/${user.username}`)}
              className="p-3 border-b hover:bg-purple-50 transition-colors flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Avatar>
                    {user.profile_picture ? (
                      <AvatarImage 
                        src={user.profile_picture} 
                        alt={user.firstname || user.username} 
                      />
                    ) : (
                      <AvatarFallback className="bg-purple-200">
                        <User size={16} className="text-purple-600" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{user.firstname} {calculateAge(user.birth_date)}ans</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={unlikeUser(user.username)}
                  className="h-7 w-7 rounded-full hover:bg-red-100 hover:text-red-500">
                  <X size={14} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    )}
    </Card>
  );
};

export default LikedUsers;