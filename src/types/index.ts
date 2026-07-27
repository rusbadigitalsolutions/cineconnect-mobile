export type UserRole = 'Actor/Actress' | 'Crew member' | 'Casting Director' | 'Producer';

export interface Profile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  location: string;
  timezone: string;
  skills: string[];
  avatar?: string;
  verified: boolean;
  premium: boolean;
  bio?: string;
  resumeUrl?: string;
  headshots?: string[];
  reelsUrl?: string;
  pushToken?: string;
  isAdmin?: boolean;
  isVendor?: boolean;
  followersCount?: number;
  followingCount?: number;
  createdAt?: string;
}

export interface PostComment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  text: string;
  createdAt: string;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  authorAvatar?: string;
  text: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  category: 'Trending' | 'All Gists' | 'Casting Updates';
  likes: string[]; // userIds
  reactions: Record<string, string>; // userId -> emoji (🔥, 👏, 🎬, ❤️)
  commentsCount: number;
  comments?: PostComment[];
  repostCount?: number;
  repostComment?: string;
  originalPost?: {
    id: string;
    authorName: string;
    authorRole: UserRole;
    authorAvatar?: string;
    text: string;
    mediaUrl?: string;
  };
  moderationStatus: 'approved' | 'flagged' | 'suspended';
  createdAt: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  roleType: 'Actor/Actress' | 'Crew member';
  requiredSkills: string[];
  budget: number;
  currency: string;
  location: string;
  description: string;
  deadline: string;
  createdAt: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  resumeUrl?: string;
  monologueUrl?: string;
  appliedAt: string;
}

export interface MatchmakerScore {
  job: Job;
  scorePercentage: number;
  matchingSkills: string[];
}

export interface Contest {
  id: string;
  title: string;
  description: string;
  hashtag: string;
  rules: string[];
  prizePool: string;
  bannerUrl?: string;
  deadline: string;
  submissionsCount: number;
}

export interface ContestSubmission {
  id: string;
  contestId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  videoUrl: string;
  caption: string;
  votes: string[]; // array of userIds who voted
  createdAt: string;
}

export type MarketplaceCategory = 'Equipment' | 'Location' | 'Props' | 'Costumes' | 'Services';

export interface MarketplaceItem {
  id: string;
  title: string;
  category: MarketplaceCategory;
  price: number;
  period: 'hour' | 'day' | 'week';
  location: string;
  imageUrl: string;
  status: 'available' | 'rented' | 'unavailable';
  vendorId: string;
  vendorName: string;
  createdAt: string;
}

export interface TrainingProgramme {
  id: string;
  title: string;
  type: 'programme' | 'seminar' | 'workshop';
  description: string;
  instructor: string;
  date: string;
  location: string;
  contactEmail: string;
  contactPhone: string;
  bannerUrl?: string;
  subscriberCount: number;
  isSubscribed?: boolean;
}

export interface WebcamSchedule {
  date: string;
  time: string;
  timezoneOffset: string;
  meetingUrl: string;
  title: string;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  senderRole: UserRole;
  senderVerified?: boolean;
  receiverId: string;
  text: string;
  mediaUrl?: string;
  scheduleWebcam?: WebcamSchedule;
  createdAt: string;
}

export interface ChatThread {
  id: string;
  participantIds: string[];
  otherUser: {
    uid: string;
    name: string;
    role: UserRole;
    avatar?: string;
    verified?: boolean;
    timezone?: string;
  };
  lastMessage: string;
  updatedAt: string;
}

export interface AdminSettings {
  emergencyLockdown: boolean;
  smartMatchmakerEnabled: boolean;
  adBannersActive: boolean;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpSenderEmail: string;
}
