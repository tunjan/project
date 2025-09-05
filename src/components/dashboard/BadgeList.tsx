import {
  Award,
  Bell,
  Book,
  Box,
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
  Minus,
  Moon,
  MousePointerClick,
  Pencil,
  Plus,
  Podcast,
  Presentation,
  Puzzle,
  Quote,
  School,
  Settings,
  Share2,
  Shield,
  Sparkles,
  Star,
  Sun,
  Swords,
  Tag,
  Target,
  ThumbsUp,
  Trophy,
  Upload,
  Users,
  Video,
} from 'lucide-react';
import React from 'react';

import { Card } from '@/components/ui/card';
import { type EarnedBadge } from '@/types';

const Icons = {
  AcademicCapIcon: GraduationCap,
  TrophyIcon: Trophy,
  UserGroupIcon: Users,
  CubeIcon: Box,
  SparklesIcon: Sparkles,
  UsersIcon: Users,
  PencilIcon: Pencil,
  PlusIcon: Plus,
  MegaphoneIcon: Megaphone,
  HomeIcon: Home,
  CheckCircleIcon: CheckCircle,
  BellIcon: Bell,
  SunIcon: Sun,
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
};

interface BadgeListProps {
  badges: EarnedBadge[];
}

const BadgeList: React.FC<BadgeListProps> = ({ badges }) => {
  if (badges.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">
          No recognitions earned yet. Your contributions matter.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-2">
      {badges.map((badge) => {
        const IconComponent = Icons[badge.icon as keyof typeof Icons] || Trophy;

        return (
          <Card key={badge.id} className="flex items-center p-3">
            <div className="mr-3 shrink-0 text-primary">
              <IconComponent className="size-8" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold">{badge.name}</h4>
              <p className="text-xs text-muted-foreground">
                {badge.description}
              </p>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default BadgeList;
