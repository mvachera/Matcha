// types/auth.ts
export interface User  extends UpdateProfileData {
  email: string;
  firstname: string;
  lastname: string;
  birth_date: string;
  createdAt: string;
  profile_complete: boolean;
  username: string;
  fame: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  firstname: string;
  username: string;
  lastname: string;
  birth_date: string;
  password: string;
}

export interface UpdateProfileData {
  gender: string;
  sexual_preferences: string[];
  authorize_location: boolean;
  location: {
    latitude: number,
    longitude: number,
    city: string,
    country: string,
  }
  biography: string;
  interests: string[];
  pictures: File[] | string[];
  profile_picture: string | File | null;
}
