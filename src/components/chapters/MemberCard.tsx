import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { type User } from '@/types';

interface MemberCardProps {
  member: User;
  onMemberClick: (member: User) => void;
}

const MemberCard: React.FC<MemberCardProps> = ({ member, onMemberClick }) => (
  <Button
    variant="ghost"
    onClick={() => onMemberClick(member)}
    className="flex h-auto w-full items-center justify-start space-x-3 p-2 text-left"
  >
    <Avatar className="size-10">
      <AvatarImage
        src={member.profilePictureUrl}
        alt={member.name}
        className="object-cover"
      />
      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
    </Avatar>
    <div>
      <p className="font-semibold text-foreground">{member.name}</p>
      <p className="text-sm capitalize text-muted-foreground">
        {member.role.replace('_', ' ').toLowerCase()}
      </p>
    </div>
  </Button>
);

export default MemberCard;
