import { Sparkles, Trophy } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { BADGE_TEMPLATES } from '@/constants';
import { type BadgeTemplate, type User } from '@/types';

const Icons: Record<string, React.FC<{ className?: string }>> = {
  SparklesIcon: Sparkles,
  TrophyIcon: Trophy,
};

interface AwardBadgeModalProps {
  userToAward: User;
  onClose: () => void;
  onConfirm: (badge: BadgeTemplate) => void;
}

const AwardBadgeModal: React.FC<AwardBadgeModalProps> = ({
  userToAward,
  onClose,
  onConfirm,
}) => {
  const [awardType, setAwardType] = useState<'standard' | 'custom'>('standard');
  const [selectedBadge, setSelectedBadge] = useState<BadgeTemplate | null>(
    null
  );
  const [customName, setCustomName] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const customIcon = 'SparklesIcon'; // Use an existing icon for custom recognitions.

  const userBadgeNames = new Set(userToAward.badges.map((b) => b.name));
  const availableBadges = BADGE_TEMPLATES.filter(
    (b) => !userBadgeNames.has(b.name)
  );

  const handleConfirm = () => {
    if (awardType === 'standard' && selectedBadge) {
      onConfirm(selectedBadge);
    } else if (awardType === 'custom' && customName.trim()) {
      onConfirm({
        name: customName.trim(),
        description: customDescription.trim(),
        icon: customIcon,
      });
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Award Recognition to {userToAward.name}</DialogTitle>
          <DialogDescription>
            Select a standard recognition or create a custom recognition.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={awardType}
          onValueChange={(value) => {
            setAwardType(value as 'standard' | 'custom');
            if (value === 'standard') {
              setCustomName('');
              setCustomDescription('');
            } else {
              setSelectedBadge(null);
            }
          }}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="standard">Standard Recognitions</TabsTrigger>
            <TabsTrigger value="custom">Custom Recognition</TabsTrigger>
          </TabsList>

          <TabsContent value="standard" className="mt-6">
            <div className="max-h-80 min-h-[180px] space-y-2 overflow-y-auto">
              {availableBadges.map((badge) => {
                const IconComponent =
                  Icons[badge.icon as keyof typeof Icons] || Icons.TrophyIcon;
                const isSelected = selectedBadge?.name === badge.name;
                return (
                  <Button
                    key={badge.name}
                    onClick={() => setSelectedBadge(badge)}
                    variant={isSelected ? 'default' : 'outline'}
                    className="flex h-auto w-full items-center justify-start space-x-4 p-3"
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded bg-primary text-primary-foreground">
                      <IconComponent className="size-6" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-foreground">{badge.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {badge.description}
                      </p>
                    </div>
                  </Button>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="custom" className="mt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="custom-name">Recognition Name</Label>
                <Input
                  id="custom-name"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g., 'Chapter MVP'"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="custom-description">Description</Label>
                <Textarea
                  id="custom-description"
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  placeholder="e.g., For outstanding contributions in Q3."
                  rows={3}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={
              (awardType === 'standard' && !selectedBadge) ||
              (awardType === 'custom' && !customName.trim())
            }
          >
            Award Recognition
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AwardBadgeModal;
