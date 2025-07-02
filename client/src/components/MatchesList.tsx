import React, { useState, useEffect } from 'react';
import { User, Heart, X } from 'lucide-react';
import api from '@/services/api';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { calculateAge } from "./utils/dateUtils";

interface MatchesUser {
  username: string;
  firstname: string;
  profile_picture: string;
  birth_date: string;
}

interface MatchesUserProps {
  username: string;
  isExpanded?: boolean;
  setIsExpanded?: React.Dispatch<React.SetStateAction<boolean>>;
}

const MatchesUser: React.FC<MatchesUserProps> = ({ username, isExpanded = true, setIsExpanded }) => {
  const [matchesUser, setMatchesUser] = useState<MatchesUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const toggleExpanded = () => {
    if (setIsExpanded) {
      setIsExpanded(!isExpanded);
    }
  };

  useEffect(() => {
    const fetchMatchesUser = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/match`);

        setMatchesUser(response.data);
        console.log(response.data);

      } catch (err) {
        setError('Impossible de charger les utilisateurs matchés');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (username) {
      fetchMatchesUser();
    }
  }, [username]);

  return (
    <Card className={`transition-all duration-300 overflow-hidden ${isExpanded ? 'w-64' : 'w-16'}`}>
      <CardHeader className="p-2 bg-purple-100 flex flex-row items-center justify-between space-y-0">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleExpanded}
          className="rounded-full hover:bg-purple-200 p-2"
          title={isExpanded ? 'Réduire' : 'Voir mes matches'}
        >
          <Heart size={20} className="text-purple-600" />
        </Button>
        {isExpanded && <Badge variant="secondary" className="bg-purple-200 text-purple-800">Mes Matches</Badge>}
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
        ) : !matchesUser || matchesUser.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            Vous n'avez aucun match
          </div>
        ) : (
          <div className="max-h-60 overflow-y-auto">
            {matchesUser.map((user) => (
              <Link 
                to={`/user/${user.username}`}
                key={user.username} 
                className="p-3 border-b hover:bg-purple-50 transition-colors flex items-center justify-between no-underline block">
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
                    <p className="font-medium text-sm">{user.firstname} {calculateAge(user.birth_date)} ans</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    )}
    </Card>
  );
};

export default MatchesUser;