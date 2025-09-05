import {
  Award,
  Book,
  Box,
  Building2,
  Calendar,
  Camera,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clapperboard,
  Clock,
  Coins,
  Compass,
  Film,
  Flame,
  GraduationCap,
  Heart,
  HeartHandshake,
  HelpCircle,
  Home,
  Lightbulb,
  MapPin,
  Megaphone,
  MessageCircle,
  MessagesSquare,
  Minus,
  Moon,
  MousePointerClick,
  Pen,
  Plus,
  Podcast,
  Presentation,
  Puzzle,
  Quote,
  School,
  Settings,
  Share2,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Swords,
  Tag,
  Target,
  ThumbsUp,
  Trophy,
  Upload,
  Users,
  Video,
  Volume2,
  X,
} from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAwardsActions } from '@/store';
import { type BadgeAward } from '@/types';

const Icons = {
  AcademicCapIcon: GraduationCap,
  TrophyIcon: Trophy,
  UserGroupIcon: Users,
  CubeIcon: Box,
  SparklesIcon: Sparkles,
  UsersIcon: Users,
  PencilIcon: Pen,
  PlusIcon: Plus,
  MegaphoneIcon: Megaphone,
  HomeIcon: Home,
  CheckCircleIcon: CheckCircle,
  BellIcon: Volume2,
  SunIcon: Lightbulb,
  MoonIcon: Moon,
  CameraIcon: Camera,
  TagIcon: Tag,
  CalendarIcon: Calendar,
  ClockIcon: Clock,
  MapPinIcon: MapPin,
  StarIcon: Star,
  AwardIcon: Award,
  BookIcon: Book,
  ClapperboardIcon: Clapperboard,
  CoinsIcon: Coins,
  CompassIcon: Compass,
  FilmIcon: Film,
  FlameIcon: Flame,
  HeartIcon: Heart,
  HeartHandshakeIcon: HeartHandshake,
  HelpCircleIcon: HelpCircle,
  LightbulbIcon: Lightbulb,
  MessageCircleIcon: MessageCircle,
  MousePointerClickIcon: MousePointerClick,
  PodcastIcon: Podcast,
  PresentationIcon: Presentation,
  PuzzleIcon: Puzzle,
  QuoteIcon: Quote,
  SchoolIcon: School,
  SettingsIcon: Settings,
  Share2Icon: Share2,
  ShieldIcon: Shield,
  SwordsIcon: Swords,
  TargetIcon: Target,
  ThumbsUpIcon: ThumbsUp,
  UploadIcon: Upload,
  VideoIcon: Video,
  MinusIcon: Minus,
  ChevronDownIcon: ChevronDown,
  ChevronUpIcon: ChevronUp,
  // New Lucide icon mappings
  Heart: Heart,
  MapPin: MapPin,
  MessagesSquare: MessagesSquare,
  Clock: Clock,
  Trophy: Trophy,
  Building2: Building2,
  Users: Users,
  ShieldCheck: ShieldCheck,
  Lightbulb: Lightbulb,
};

interface BadgeAwardCardProps {
  award: BadgeAward;
  onRespond: (awardId: string, response: 'Accepted' | 'Rejected') => void;
}

const BadgeAwardCard: React.FC<BadgeAwardCardProps> = ({
  award,
  onRespond,
}) => {
  const IconComponent = Icons[award.badge.icon as keyof typeof Icons] || Trophy;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          <div className="flex size-12 shrink-0 items-center justify-center bg-foreground text-background">
            <IconComponent className="size-7" />
          </div>
          <div className="grow">
            <p className="text-sm text-muted-foreground">
              Awarded by{' '}
              <span className="font-bold text-foreground">
                {award.awarder.name}
              </span>
            </p>
            <p className="text-lg font-bold text-foreground">
              {award.badge.name}
            </p>
            <p className="text-sm text-muted-foreground">
              {award.badge.description}
            </p>
          </div>
        </div>
        <div className="mt-4 flex items-center space-x-2 border-t border-border pt-3">
          <Button
            onClick={() => onRespond(award.id, 'Rejected')}
            variant="destructive"
            className="flex w-full items-center justify-center"
          >
            <X className="mr-1.5 size-4" /> Decline
          </Button>
          <Button
            onClick={() => onRespond(award.id, 'Accepted')}
            className="flex w-full items-center justify-center"
          >
            <Users className="mr-1.5 size-4" /> Accept
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

interface BadgeAwardsDashboardProps {
  pendingAwards: BadgeAward[];
}

const BadgeAwardsDashboard: React.FC<BadgeAwardsDashboardProps> = ({
  pendingAwards,
}) => {
  const { respondToBadgeAward } = useAwardsActions();

  const handleRespond = (
    awardId: string,
    response: 'Accepted' | 'Rejected'
  ) => {
    respondToBadgeAward(awardId, response);
    toast.success(
      `Recognition ${response.toLowerCase()}. It will now appear on your profile.`
    );
  };

  if (pendingAwards.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="mb-4 text-2xl font-bold tracking-tight text-foreground">
        Pending Recognitions
      </h2>
      <div className="space-y-4">
        {pendingAwards.map((award) => (
          <BadgeAwardCard
            key={award.id}
            award={award}
            onRespond={handleRespond}
          />
        ))}
      </div>
    </section>
  );
};

export default BadgeAwardsDashboard;
