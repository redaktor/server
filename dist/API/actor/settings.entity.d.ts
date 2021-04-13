import LinkEntity from '../link/link.entity';
export default class SettingsEntity {
    uid: string;
    bannerLink?: LinkEntity;
    isAdmin: boolean;
    isModerator: boolean;
    isVerified: boolean;
    primaryColor: string;
    secondaryColor: string;
    autoAcceptFollowed: boolean;
    json: {
        [key: string]: string;
    };
}
