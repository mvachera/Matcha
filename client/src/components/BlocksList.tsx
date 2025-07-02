import React, { useState, useEffect } from 'react';
import { User, X } from 'lucide-react';
import api from '@/services/api';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { calculateAge } from "./utils/dateUtils";

interface BlocksUser {
  username: string;
  firstname: string;
  profile_picture: string;
  birth_date: string;
}

interface BlocksUserProps {
  username: string;
  isExpanded?: boolean;
  setIsExpanded?: React.Dispatch<React.SetStateAction<boolean>>;
}

const BlocksUser: React.FC<BlocksUserProps> = ({ username, isExpanded = true, setIsExpanded }) => {
  const [blocksUser, setBlocksUser] = useState<BlocksUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const toggleExpanded = () => {
    if (setIsExpanded) {
      setIsExpanded(!isExpanded);
    }
  };

  const fetchBlocksUser = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/block`);
      
      setBlocksUser(response.data);
      console.log(response.data);
    } catch (err) {
      setError('Impossible de charger les utilisateurs matchés');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (username) {
      fetchBlocksUser();
    }
  }, [username]);

  const handleUnblock = async (blockedUsername: string, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to user profile
    e.stopPropagation(); // Stop event propagation

    try {
      await api.delete(`/block/delete/${blockedUsername}`);
      // Refresh the blocks list after successful unblock
      fetchBlocksUser();
    } catch (err) {
      console.error('Error unblocking user:', err);
      setError('Impossible de débloquer cet utilisateur');
    }
  };

  return (
    <Card className={`transition-all duration-300 overflow-hidden ${isExpanded ? 'w-64' : 'w-16'}`}>
      <CardHeader className="p-2 bg-purple-100 flex flex-row items-center justify-between space-y-0">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleExpanded}
          className="rounded-full hover:bg-purple-200 p-2"
          title={isExpanded ? 'Réduire' : 'Voir utilisateurs blockés'}
        >
          <X size={20} className="text-purple-600" />
        </Button>
        {isExpanded && <Badge variant="secondary" className="bg-purple-200 text-purple-800">Utilisateurs bloquer</Badge>}
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
          ) : !blocksUser || blocksUser.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              Vous n'avez bloquer aucun utilisateur
            </div>
          ) : (
            <div className="max-h-60 overflow-y-auto">
              {blocksUser.map((user) => (
                <div key={user.username} className="p-3 border-b hover:bg-purple-50 transition-colors flex items-center justify-between relative">
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
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-full hover:bg-red-100 p-1"
                    onClick={(e) => handleUnblock(user.username, e)}
                    title="Débloquer"
                  >
                    <X size={14} className="text-red-500" />
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

export default BlocksUser;