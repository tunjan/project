import React from 'react';
import { type OutreachLog, type CubeEvent, OutreachOutcome } from '@/types';
import { Tag } from '@/components/ui/Tag';
import { PencilIcon, XCircleIcon } from '@/icons';

interface LogEntryCardProps {
  log: OutreachLog;
  event?: CubeEvent;
  onEdit: (log: OutreachLog) => void;
  onDelete: (log: OutreachLog) => void;
}

const getOutcomeVariant = (outcome: OutreachOutcome) => {
  switch (outcome) {
    case OutreachOutcome.BECAME_VEGAN_ACTIVIST:
      return 'success';
    case OutreachOutcome.BECAME_VEGAN:
      return 'primary';
    case OutreachOutcome.ALREADY_VEGAN_NOW_ACTIVIST:
      return 'info';
    default:
      return 'neutral';
  }
};

const LogEntryCard: React.FC<LogEntryCardProps> = ({
  log,
  event,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="p-4 transition-colors hover:bg-neutral-50">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <p className="font-bold text-black">
              {event?.location || 'Unknown Event'}
            </p>
            <Tag variant={getOutcomeVariant(log.outcome)} size="sm">
              {log.outcome}
            </Tag>
          </div>
          <p className="text-sm text-neutral-500">
            {new Date(log.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          <button
            onClick={() => onEdit(log)}
            className="p-2 text-neutral-500 hover:text-black"
            title="Edit Log"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(log)}
            className="p-2 text-neutral-500 hover:text-danger"
            title="Delete Log"
          >
            <XCircleIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
      {log.notes && (
        <div className="mt-3 border-l-4 border-neutral-200 pl-4">
          <p className="text-sm text-black">{log.notes}</p>
        </div>
      )}
    </div>
  );
};

export default LogEntryCard;
