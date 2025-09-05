import { Pencil, XCircle } from 'lucide-react';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { type CubeEvent, type OutreachLog, OutreachOutcome } from '@/types';

interface LogEntryCardProps {
  log: OutreachLog;
  event?: CubeEvent;
  onEdit: (log: OutreachLog) => void;
  onDelete: (log: OutreachLog) => void;
}

const getOutcomeVariant = (outcome: OutreachOutcome) => {
  switch (outcome) {
    case OutreachOutcome.BECAME_VEGAN_ACTIVIST:
      return 'default';
    case OutreachOutcome.BECAME_VEGAN:
      return 'secondary';
    case OutreachOutcome.ALREADY_VEGAN_NOW_ACTIVIST:
      return 'outline';
    default:
      return 'secondary';
  }
};

const LogEntryCard: React.FC<LogEntryCardProps> = ({
  log,
  event,
  onEdit,
  onDelete,
}) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between">
          <div className="flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <p className="font-bold text-foreground">
                {event?.location || 'Unknown Event'}
              </p>
              <Badge variant={getOutcomeVariant(log.outcome)}>
                {log.outcome}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {new Date(log.createdAt).toLocaleString()}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              onClick={() => onEdit(log)}
              variant="ghost"
              size="icon"
              title="Edit Log"
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              onClick={() => onDelete(log)}
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive"
              title="Delete Log"
            >
              <XCircle className="size-4" />
            </Button>
          </div>
        </div>
        {log.notes && (
          <div className="mt-3 border-l-4 border-border pl-4">
            <p className="text-sm text-foreground">{log.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LogEntryCard;
