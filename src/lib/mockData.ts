import { Profile, Post, Job, Contest, ContestSubmission, MarketplaceItem, TrainingProgramme, ChatThread, ChatMessage, AdminSettings } from '../types';

export const INITIAL_USER: Profile = {
  uid: 'demo-user-123',
  name: 'Amara Okafor',
  email: 'amara.okafor@cineconnect.app',
  role: 'Actor/Actress',
  location: 'Lagos, Nigeria',
  timezone: 'GMT+1 (WAT)',
  skills: ['Dramatic Acting', 'Voiceover', 'Stage Combat', 'Improv', 'Nollywood Accent'],
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
  verified: true,
  premium: true,
  bio: 'Lead Actress in "Voices of the Sahara" (2025). Passionate about storytelling, independent cinema, and high-impact dramatic roles.',
  resumeUrl: 'https://cineconnect.app/resumes/amara_okafor.pdf',
  headshots: [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=400'
  ],
  reelsUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  pushToken: 'ExponentPushToken[demo-amara-123]',
  isAdmin: true,
  isVendor: true,
  followersCount: 1420,
  followingCount: 380,
  createdAt: '2025-01-15'
};

export const INITIAL_POSTS: Post[] = [
  {
    id: 'post-1',
    authorId: 'user-201',
    authorName: 'David Kalu',
    authorRole: 'Casting Director',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    text: '🎬 HUGE CASTING CALL! Looking for 3 principal actors and 2 stunt coordinators for an upcoming epic action feature shooting in Lagos & Abuja. Submit your monologues via the Jobs tab now!',
    mediaUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=800',
    mediaType: 'image',
    category: 'Casting Updates',
    likes: ['demo-user-123', 'user-102', 'user-103'],
    reactions: {
      'demo-user-123': '🔥',
      'user-102': '🎬',
      'user-103': '👏'
    },
    commentsCount: 14,
    comments: [
      {
        id: 'c1',
        authorId: 'demo-user-123',
        authorName: 'Amara Okafor',
        text: 'Applied! Just submitted my dramatic monologue. Looking forward to this!',
        createdAt: '10 mins ago'
      }
    ],
    repostCount: 8,
    moderationStatus: 'approved',
    createdAt: '2 hours ago'
  },
  {
    id: 'post-2',
    authorId: 'user-202',
    authorName: 'Zara Chen',
    authorRole: 'Producer',
    authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
    text: 'Behind the scenes on day 12 of #MidnightMirage! Our RED V-Raptor setup from the CineConnect Marketplace is performing like an absolute dream.',
    mediaUrl: 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?auto=format&fit=crop&q=80&w=800',
    mediaType: 'image',
    category: 'Trending',
    likes: ['demo-user-123', 'user-105'],
    reactions: { 'demo-user-123': '❤️' },
    commentsCount: 5,
    repostCount: 3,
    repostComment: 'This cinematography setup looks world class! 🔥',
    originalPost: {
      id: 'post-orig-1',
      authorName: 'LensCraft Studios',
      authorRole: 'Crew member',
      authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
      text: 'RED V-Raptor 8K Package now available for weekly rentals on CineConnect Marketplace!'
    },
    moderationStatus: 'approved',
    createdAt: '5 hours ago'
  },
  {
    id: 'post-3',
    authorId: 'user-203',
    authorName: 'Marcus Vance',
    authorRole: 'Actor/Actress',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
    text: 'Just uploaded my entry for the #ActionMonologue Challenge! Check out the Contests tab and drop a vote if you enjoy dramatic fight monologues! 🥋💥',
    category: 'All Gists',
    likes: ['user-101'],
    reactions: {},
    commentsCount: 9,
    repostCount: 2,
    moderationStatus: 'approved',
    createdAt: '1 day ago'
  }
];

export const INITIAL_JOBS: Job[] = [
  {
    id: 'job-101',
    title: 'Lead Female Protagonist - "Echoes of Gold"',
    company: 'Sahara Horizon Pictures',
    roleType: 'Actor/Actress',
    requiredSkills: ['Dramatic Acting', 'Stage Combat', 'Nollywood Accent'],
    budget: 4500,
    currency: '$',
    location: 'Lagos / On-Location',
    description: 'Seeking a dynamic female lead (24-35) capable of expressing deep emotional range and performing mild physical action scenes.',
    deadline: '2026-08-15',
    createdAt: '1 day ago'
  },
  {
    id: 'job-102',
    title: 'Chief Cinematographer (DP)',
    company: 'Apex Media Group',
    roleType: 'Crew member',
    requiredSkills: ['Camera Operation', 'Color Grading', 'Lighting Setup'],
    budget: 6000,
    currency: '$',
    location: 'Abuja, Nigeria',
    description: 'Looking for an experienced DP with ARRI Alexa or RED Cinema camera proficiency for a 3-week feature film shoot.',
    deadline: '2026-08-01',
    createdAt: '2 days ago'
  },
  {
    id: 'job-103',
    title: 'Supporting Male Villain - "Shadow Syndicate"',
    company: 'Starlight Studios',
    roleType: 'Actor/Actress',
    requiredSkills: ['Improv', 'Voiceover', 'Dramatic Acting'],
    budget: 3000,
    currency: '$',
    location: 'Port Harcourt, Nigeria',
    description: 'Charismatic antagonist role with heavy dialogue sequences and intense face-offs with the protagonist.',
    deadline: '2026-08-20',
    createdAt: '3 days ago'
  }
];

export const INITIAL_CONTESTS: Contest[] = [
  {
    id: 'contest-1',
    title: '#ActionMonologue Challenge 2026',
    description: 'Showcase your intense action sequence monologue (60 seconds max). Perform with high energy, physical realism, and vocal command.',
    hashtag: '#ActionMonologue',
    rules: [
      'Must be under 60 seconds long.',
      'Must be filmed in high definition (1080p minimum).',
      'No background copyrighted music.',
      'Community votes determine top 5 finalists.'
    ],
    prizePool: '$2,500 + Talent Agency Representation',
    bannerUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=800',
    deadline: '12 Days Left',
    submissionsCount: 42
  },
  {
    id: 'contest-2',
    title: '#NollywoodClassic Monologue Contest',
    description: 'Re-enact an iconic monologue from a Nollywood masterpiece with your own modern twist!',
    hashtag: '#NollywoodClassic',
    rules: [
      'Specify the original film title in caption.',
      'One submission per actor.',
      'Creative props encouraged.'
    ],
    prizePool: '$1,500 + Full Acting Masterclass Scholarship',
    bannerUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=800',
    deadline: '24 Days Left',
    submissionsCount: 28
  }
];

export const INITIAL_SUBMISSIONS: ContestSubmission[] = [
  {
    id: 'sub-1',
    contestId: 'contest-1',
    userId: 'user-203',
    userName: 'Marcus Vance',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    caption: 'My submission for #ActionMonologue! "You crossed the line the moment you entered this warehouse." 🔥',
    votes: ['demo-user-123', 'user-101', 'user-102', 'user-104'],
    createdAt: '2 days ago'
  },
  {
    id: 'sub-2',
    contestId: 'contest-1',
    userId: 'demo-user-123',
    userName: 'Amara Okafor',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    caption: 'Dramatic monologue entry for #ActionMonologue. "I spent ten years waiting for this exact moment!" 🎭⚡',
    votes: ['user-201', 'user-202', 'user-203', 'user-105', 'user-106'],
    createdAt: '1 day ago'
  }
];

export const INITIAL_MARKETPLACE: MarketplaceItem[] = [
  {
    id: 'item-1',
    title: 'RED V-Raptor 8K VV Cinema Camera Package',
    category: 'Equipment',
    price: 350,
    period: 'day',
    location: 'Lagos Island, Nigeria',
    imageUrl: 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?auto=format&fit=crop&q=80&w=600',
    status: 'available',
    vendorId: 'demo-user-123',
    vendorName: 'Amara Cine Equipment',
    createdAt: '3 days ago'
  },
  {
    id: 'item-2',
    title: 'Aputure 600d Pro Daylight LED Video Light',
    category: 'Equipment',
    price: 90,
    period: 'day',
    location: 'Ikeja, Lagos',
    imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=600',
    status: 'available',
    vendorId: 'user-301',
    vendorName: 'Lagos Light & Motion',
    createdAt: '5 days ago'
  },
  {
    id: 'item-3',
    title: 'Victorian Mansion & Courtyard Shooting Location',
    category: 'Location',
    price: 1200,
    period: 'day',
    location: 'Lekki Phase 1, Lagos',
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=600',
    status: 'available',
    vendorId: 'user-302',
    vendorName: 'Heritage Estates',
    createdAt: '1 week ago'
  },
  {
    id: 'item-4',
    title: 'Authentic Traditional Royal Costumes Set (10 Outfits)',
    category: 'Costumes',
    price: 150,
    period: 'day',
    location: 'Surulere, Lagos',
    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=600',
    status: 'available',
    vendorId: 'user-303',
    vendorName: 'Royal Threads Nollywood',
    createdAt: '2 weeks ago'
  }
];

export const INITIAL_TRAININGS: TrainingProgramme[] = [
  {
    id: 'train-1',
    title: 'Masterclass: Screen Acting & Audition Mastery with David Kalu',
    type: 'workshop',
    description: 'An intensive 2-day hands-on workshop covering cold reading techniques, character immersion, and how to nail self-tape casting auditions.',
    instructor: 'David Kalu (Veteran Casting Director)',
    date: 'August 12-13, 2026',
    location: 'Eko Hotel Convention Centre / Live Stream',
    contactEmail: 'workshop@cineconnect.app',
    contactPhone: '+234 803 123 4567',
    bannerUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800',
    subscriberCount: 148,
    isSubscribed: true
  },
  {
    id: 'train-2',
    title: 'Seminar: Film Financing, Tax Incentives & Global Distribution',
    type: 'seminar',
    description: 'Learn how independent producers secure international co-productions, Netflix/Amazon licensing deals, and film festival strategies.',
    instructor: 'Zara Chen & Industry Panel',
    date: 'September 5, 2026',
    location: 'Abuja Film Hub / Zoom Webinar',
    contactEmail: 'seminars@cineconnect.app',
    contactPhone: '+234 809 987 6543',
    bannerUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&q=80&w=800',
    subscriberCount: 230,
    isSubscribed: false
  }
];

export const INITIAL_CHATS: ChatThread[] = [
  {
    id: 'chat-1',
    participantIds: ['demo-user-123', 'user-201'],
    otherUser: {
      uid: 'user-201',
      name: 'David Kalu',
      role: 'Casting Director',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
      verified: true,
      timezone: 'GMT+1 (WAT)'
    },
    lastMessage: 'Hi Amara, loved your monologue submission! Are you free for a webcam callback on Friday?',
    updatedAt: '15 mins ago'
  },
  {
    id: 'chat-2',
    participantIds: ['demo-user-123', 'user-202'],
    otherUser: {
      uid: 'user-202',
      name: 'Zara Chen',
      role: 'Producer',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
      verified: true,
      timezone: 'GMT+0 (UTC)'
    },
    lastMessage: 'The RED V-Raptor package rental was delivered safely. Thanks!',
    updatedAt: '2 hours ago'
  }
];

export const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {
  'chat-1': [
    {
      id: 'm1',
      chatId: 'chat-1',
      senderId: 'user-201',
      senderName: 'David Kalu',
      senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
      senderRole: 'Casting Director',
      senderVerified: true,
      receiverId: 'demo-user-123',
      text: 'Hi Amara! Your dramatic monologue submission for "Echoes of Gold" stood out to our entire team.',
      createdAt: '20 mins ago'
    },
    {
      id: 'm2',
      chatId: 'chat-1',
      senderId: 'user-201',
      senderName: 'David Kalu',
      senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
      senderRole: 'Casting Director',
      senderVerified: true,
      receiverId: 'demo-user-123',
      text: 'Are you available for a live webcam callback interview?',
      scheduleWebcam: {
        date: '2026-07-24',
        time: '14:00 WAT',
        timezoneOffset: '+1 Hour Difference',
        meetingUrl: 'https://meet.cineconnect.app/room-echoes-gold-amara',
        title: 'Casting Callback: Echoes of Gold Lead Role'
      },
      createdAt: '15 mins ago'
    }
  ]
};

export const INITIAL_ADMIN_SETTINGS: AdminSettings = {
  emergencyLockdown: false,
  smartMatchmakerEnabled: true,
  adBannersActive: true,
  smtpHost: 'smtp-relay.brevo.com',
  smtpPort: 587,
  smtpUser: 'admin@cineconnect.app',
  smtpSenderEmail: 'notifications@cineconnect.app'
};
