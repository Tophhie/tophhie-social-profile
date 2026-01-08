export type TophhieSocialProfile = {
    $type: 'social.tophhie.profile';
    createdAt: string;
    updatedAt?: string;
    pdsPreferences?: {
        accessibilityScoring?: boolean;
        showOnHomepage?: boolean;
    }
    communicationPreferences?: {
        marketing: boolean;
    };
}