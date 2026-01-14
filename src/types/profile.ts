export type DetailedProfile = {
    id: string;
    username?: string;
    age: number;
    personas: string[];
    lookingFor: string[];
    purpose?: 'friendship' | 'relationship' | 'exploring';
    gender: 'male' | 'female' | 'non-binary' | 'other' | 'prefer not to say';
    country: string;
    bio: string;
    mainImage: string;
    profileImages: string[];
    dataAiHints: string[];
    interests: string[];
    favoriteBook?: string;
};
