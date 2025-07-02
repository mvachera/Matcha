import React from 'react';
import { UserProfile } from './home'; // Assuming you'll create a types file

interface MenuFilterProps {
  userProfile: UserProfile;
  allInterests: string[];
  isOpen: boolean;
  onClose: () => void;
  onDistanceChange: (distance: number) => void;
  onMinAgeChange: (minAge: number) => void;
  onMaxAgeChange: (maxAge: number) => void;
  onInterestToggle: (interest: string) => void;
  onSubmit: () => void;
}

const MenuFilter: React.FC<MenuFilterProps> = ({
  userProfile,
  allInterests,
  isOpen,
  onClose,
  onDistanceChange,
  onMinAgeChange,
  onMaxAgeChange,
  onInterestToggle,
  onSubmit
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute top-28 right-4 bg-white p-4 rounded-xl shadow-lg z-20 w-80">
      <h3 className="font-bold text-purple-800 mb-3">Filtres</h3>
      
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Distance maximale: {userProfile.maxDistance} km
          </label>
          <input 
            type="range" 
            min="1" 
            max="200"
            value={userProfile.maxDistance}
            onChange={(e) => onDistanceChange(parseInt(e.target.value))}
            className="w-full"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Âge: {userProfile.ageRange?.min} - {userProfile.ageRange?.max} ans
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              min="18"
              max={userProfile.ageRange?.max}
              value={userProfile.ageRange?.min}
              onChange={(e) => onMinAgeChange(parseInt(e.target.value))}
              className="w-1/2 p-1 border rounded"
            />
            <input
              type="number"
              min={userProfile.ageRange?.min}
              max="100"
              value={userProfile.ageRange?.max}
              onChange={(e) => onMaxAgeChange(parseInt(e.target.value))}
              className="w-1/2 p-1 border rounded"
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Centres d'intérêt
          </label>
          <div className="flex flex-wrap gap-2">
            {allInterests.map((interest, idx) => (
              <button
                type="button"
                key={idx}
                onClick={() => onInterestToggle(interest)}
                className={`text-sm px-2 py-1 rounded-full ${
                  userProfile.activeFilters?.interests.includes(interest)
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex justify-end gap-2 mt-4">
          <button 
            type="button"
            onClick={onClose}
            className="px-3 py-1 text-gray-600 hover:text-gray-800"
          >
            Annuler
          </button>
          <button 
            type="submit"
            className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Appliquer
          </button>
        </div>
      </form>
    </div>
  );
};

export default MenuFilter;