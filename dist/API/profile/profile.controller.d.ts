import ProfileService from './profile.service';
export interface ProfileData {
    username: string;
    bio: string;
    image?: string;
    following?: boolean;
}
export interface ProfileRO {
    profile: ProfileData;
}
export interface ApRO {
}
export default class ProfileController {
    private readonly profileService;
    constructor(profileService: ProfileService);
    getAPProfile(): Promise<ApRO | undefined>;
    getProfile(userId: number, username: string): Promise<ProfileRO | undefined>;
    follow(mail: string, username: string): Promise<ProfileRO | undefined>;
    unFollow(mail: string, username: string): Promise<ProfileRO | undefined>;
}
