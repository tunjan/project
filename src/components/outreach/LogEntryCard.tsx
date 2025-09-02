import React from 'react';

import { Tag } from '@/components/ui';
import { PencilIcon, XCircleIcon } from '@/icons';
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
    <div className="p-4 transition-colors hover:bg-neutral-50 dark:hover:bg-gray-800">
      <div className="flex justify-between">
        <div className="flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <p className="font-bold text-black dark:text-white">
              {event?.location || 'Unknown Event'}
            </p>
            <Tag variant={getOutcomeVariant(log.outcome)} size="sm">
              {log.outcome}
            </Tag>
          </div>
          <p className="text-sm text-neutral-500 dark:text-gray-400">
            {new Date(log.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={() => onEdit(log)}
            className="p-2 text-neutral-500 hover:text-black dark:text-gray-400 dark:hover:text-white"
            title="Edit Log"
          >
            <PencilIcon className="size-4" />
          </button>
          <button
            onClick={() => onDelete(log)}
            className="p-2 text-neutral-500 hover:text-danger dark:text-gray-400"
            title="Delete Log"
          >
            <XCircleIcon className="size-4" />
          </button>
        </div>
      </div>
      {log.notes && (
        <div className="mt-3 border-l-4 border-neutral-200 pl-4 dark:border-gray-600">
          <p className="text-sm text-black dark:text-white">{log.notes}</p>
        </div>
      )}
    </div>
  );
};

export default LogEntryCard;
