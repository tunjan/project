import {
  BrainCircuit,
  HelpCircle,
  Leaf,
  MessageCircle,
  Minus,
  Pencil,
  Plus,
  Star,
  Target,
  Undo2,
  X,
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  type CubeEvent,
  type OutreachLog,
  OutreachOutcome,
  type User,
} from '@/types';

const OUTCOME_LABELS: Record<OutreachOutcome, string> = {
  [OutreachOutcome.BECAME_VEGAN_ACTIVIST]: 'Became Activist',
  [OutreachOutcome.BECAME_VEGAN]: 'Became Vegan',
  [OutreachOutcome.ALREADY_VEGAN_NOW_ACTIVIST]: 'Vegan to Activist',
  [OutreachOutcome.MOSTLY_SURE]: 'Mostly Sure',
  [OutreachOutcome.NOT_SURE]: 'Not Sure',
  [OutreachOutcome.NO_CHANGE]: 'No Change',
};

interface QuickLogFormProps {
  currentUser: User;
  events: CubeEvent[];
  users: User[];
  addOutreachLog: (log: Omit<OutreachLog, 'id'>) => string;
  removeOutreachLog: (logId: string) => void;
  isTeamView: boolean;
}

const OutcomeButton: React.FC<{
  outcome: OutreachOutcome;
  onClick: () => void;
  className?: string;
}> = ({ outcome, onClick, className = '' }) => {
  const getOutcomeStyling = (outcome: OutreachOutcome) => {
    switch (outcome) {
      case OutreachOutcome.BECAME_VEGAN_ACTIVIST:
        return {
          variant: 'outline' as const,
          Icon: Target,
        };
      case OutreachOutcome.BECAME_VEGAN:
        return {
          variant: 'outline' as const,
          Icon: Leaf,
        };
      case OutreachOutcome.ALREADY_VEGAN_NOW_ACTIVIST:
        return {
          variant: 'outline' as const,
          Icon: Star,
        };
      case OutreachOutcome.MOSTLY_SURE:
        return {
          variant: 'outline' as const,
          Icon: BrainCircuit,
        };
      case OutreachOutcome.NOT_SURE:
        return {
          variant: 'outline' as const,
          Icon: HelpCircle,
        };
      case OutreachOutcome.NO_CHANGE:
        return {
          variant: 'destructive' as const,
          Icon: X,
        };
      default:
        return {
          variant: 'outline' as const,
          Icon: MessageCircle,
        };
    }
  };

  const styling = getOutcomeStyling(outcome);

  return (
    <Button
      onClick={onClick}
      variant={styling.variant}
      className={`group relative h-20 w-full flex-col gap-2 border-2 transition-all duration-200 ${className}`}
    >
      <styling.Icon className="size-6" />
      <span className="text-xs font-medium leading-tight">
        {OUTCOME_LABELS[outcome]}
      </span>
    </Button>
  );
};

const QuickLogForm: React.FC<QuickLogFormProps> = ({
  currentUser,
  events,
  users,
  addOutreachLog,
  removeOutreachLog,
  isTeamView,
}) => {
  const [mode, setMode] = useState<'single' | 'bulk'>('single');
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [bulkCounts, setBulkCounts] = useState<Record<OutreachOutcome, number>>(
    () =>
      Object.fromEntries(
        Object.values(OutreachOutcome).map((o) => [o, 0])
      ) as Record<OutreachOutcome, number>
  );

  // Memoize bulk count callbacks to prevent infinite loops
  const updateBulkCount = useMemo(() => {
    return (outcome: OutreachOutcome, delta: number) => {
      setBulkCounts((prev) => ({
        ...prev,
        [outcome]: Math.max(0, prev[outcome] + delta),
      }));
    };
  }, []);

  const resetBulkCounts = useMemo(() => {
    return () => {
      setBulkCounts(
        Object.fromEntries(
          Object.values(OutreachOutcome).map((o) => [o, 0])
        ) as Record<OutreachOutcome, number>
      );
    };
  }, []);

  const getOutcomeStyling = (outcome: OutreachOutcome) => {
    switch (outcome) {
      case OutreachOutcome.BECAME_VEGAN_ACTIVIST:
        return { Icon: Target };
      case OutreachOutcome.BECAME_VEGAN:
        return { Icon: Leaf };
      case OutreachOutcome.ALREADY_VEGAN_NOW_ACTIVIST:
        return { Icon: Star };
      case OutreachOutcome.MOSTLY_SURE:
        return { Icon: BrainCircuit };
      case OutreachOutcome.NOT_SURE:
        return { Icon: HelpCircle };
      case OutreachOutcome.NO_CHANGE:
        return { Icon: X };
      default:
        return { Icon: MessageCircle };
    }
  };

  const pastEvents = useMemo(() => {
    const now = new Date();
    return events
      .filter((e) => new Date(e.startDate) <= now)
      .sort(
        (a, b) =>
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      );
  }, [events]);

  useEffect(() => {
    if (pastEvents.length > 0 && !selectedEventId) {
      setSelectedEventId(pastEvents[0].id);
    }
    setSelectedUserId(currentUser.id);
  }, [pastEvents, currentUser, selectedEventId]);

  const handleLog = (outcome: OutreachOutcome) => {
    if (!selectedEventId) {
      toast.error('Please select an event to log against.');
      return;
    }
    const userIdToLog = isTeamView ? selectedUserId : currentUser.id;
    if (!userIdToLog) {
      toast.error('Please select a user to log for.');
      return;
    }
    const newLog = {
      userId: userIdToLog,
      eventId: selectedEventId,
      outcome,
      notes: notes || undefined,
      createdAt: new Date(),
    };
    const logId = addOutreachLog(newLog);
    toast.success('Conversation logged!', {
      action: {
        label: 'Undo',
        onClick: () => removeOutreachLog(logId),
      },
      icon: <Undo2 className="size-5" />,
    });
    setNotes('');
  };

  const handleBulkSubmit = () => {
    const totalLogs = Object.values(bulkCounts).reduce((sum, c) => sum + c, 0);
    if (totalLogs === 0) {
      toast.error('Add at least one conversation to submit.');
      return;
    }
    const userIdToLog = isTeamView ? selectedUserId : currentUser.id;

    Object.entries(bulkCounts).forEach(([outcome, count]) => {
      for (let i = 0; i < count; i++) {
        addOutreachLog({
          userId: userIdToLog,
          eventId: selectedEventId,
          outcome: outcome as OutreachOutcome,
          notes: notes || undefined,
          createdAt: new Date(),
        });
      }
    });

    toast.success(`${totalLogs} conversations logged successfully!`);
    resetBulkCounts();
    setNotes('');
  };

  if (pastEvents.length === 0) {
    return (
      <Card className="border-0 bg-gradient-to-br from-muted/30 to-muted/10 shadow-sm">
        <CardContent className="py-16 text-center">
          <div className="mx-auto mb-6 size-20 rounded-full bg-muted/50 p-4">
            <Pencil className="size-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground">
            Ready to start logging?
          </h3>
          <p className="mx-auto mt-3 max-w-sm text-muted-foreground">
            Attend your first event to begin tracking meaningful conversations
            and measuring your impact.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 px-6">
      <CardHeader className="px-0 pb-6">
        <CardTitle className="flex items-center gap-2 text-xl font-semibold">
          Quick Log
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8 px-0">
        {/* Form Section */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <Label className="text-sm font-medium">Event</Label>
              <Select
                value={selectedEventId}
                onValueChange={setSelectedEventId}
              >
                <SelectTrigger className="h-11 w-full">
                  <SelectValue placeholder="Select an event" />
                </SelectTrigger>
                <SelectContent>
                  {pastEvents.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      <div className="flex w-full items-center justify-between gap-4">
                        <span className="font-medium">{e.location}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(e.startDate).toLocaleDateString()}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isTeamView && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Log for Member</Label>
                <Select
                  value={selectedUserId}
                  onValueChange={setSelectedUserId}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select a member" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Notes (optional)</Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add context about your conversation..."
              className="h-11"
            />
          </div>
        </div>

        {/* Outcome Selection */}
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="mb-2 text-lg font-medium text-foreground">
              How did the conversation go?
            </h3>
            <p className="text-sm text-muted-foreground">
              Select the outcome that best describes your interaction
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {Object.values(OutreachOutcome).map((outcome) => (
              <OutcomeButton
                key={outcome}
                outcome={outcome}
                onClick={() => handleLog(outcome)}
              />
            ))}
          </div>
        </div>

        {/* Bulk Logging Section */}
        <div className="border-t border-border/50 pt-6">
          <Tabs
            value={mode}
            onValueChange={(value: string) =>
              setMode(value as 'single' | 'bulk')
            }
          >
            <TabsList className="grid h-10 w-full grid-cols-2">
              <TabsTrigger value="single" className="text-sm">
                Quick Log
              </TabsTrigger>
              <TabsTrigger value="bulk" className="text-sm">
                Bulk Entry
              </TabsTrigger>
            </TabsList>

            <TabsContent value="bulk" className="mt-6 space-y-6">
              <div className="text-center">
                <h4 className="mb-2 font-medium text-foreground">
                  Bulk Conversation Logging
                </h4>
                <p className="text-sm text-muted-foreground">
                  Count multiple conversations by outcome type
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {Object.entries(bulkCounts).map(([outcome, count]) => {
                  const { Icon } = getOutcomeStyling(
                    outcome as OutreachOutcome
                  );
                  return (
                    <div
                      key={outcome}
                      className="flex items-center justify-between rounded-lg border bg-muted/30 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="size-5" />
                        <span className="text-sm font-medium">
                          {OUTCOME_LABELS[outcome as OutreachOutcome]}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-8"
                          onClick={() =>
                            updateBulkCount(outcome as OutreachOutcome, -1)
                          }
                        >
                          <Minus className="size-3" />
                        </Button>
                        <span className="w-8 text-center text-lg font-semibold">
                          {count}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-8"
                          onClick={() =>
                            updateBulkCount(outcome as OutreachOutcome, 1)
                          }
                        >
                          <Plus className="size-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Button
                onClick={handleBulkSubmit}
                className="h-11 w-full"
                size="lg"
              >
                Submit Bulk Logs
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickLogForm;
