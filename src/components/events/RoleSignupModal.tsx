import React, { useState } from 'react';
import { EventRole, type EventRoleRequirement, type CubeEvent } from '@/types';
import { SelectField } from '@/components/ui/Form';
import Modal from '@/components/ui/Modal';
import { UsersIcon } from '@/icons';
import { toast } from 'sonner';

interface RoleSignupModalProps {
  event: CubeEvent;
  currentRole?: EventRole;
  onClose: () => void;
  onConfirm: (role: EventRole) => void;
}

const RoleSignupModal: React.FC<RoleSignupModalProps> = ({
  event,
  currentRole,
  onClose,
  onConfirm,
}) => {
  const [selectedRole, setSelectedRole] = useState<EventRole>(
    currentRole || EventRole.ACTIVIST
  );

  const roleRequirements = event.roleRequirements || [];

  // Get available roles (either with requirements or standard roles)
  const availableRoles =
    roleRequirements.length > 0
      ? roleRequirements.map((req) => req.role)
      : [EventRole.ACTIVIST, EventRole.VOLUNTEER];

  // Add ACTIVIST as default if not in requirements
  if (!availableRoles.includes(EventRole.ACTIVIST)) {
    availableRoles.unshift(EventRole.ACTIVIST);
  }

  // Get role requirement details
  const getRoleInfo = (role: EventRole) => {
    const requirement = roleRequirements.find((req) => req.role === role);
    if (!requirement) {
      if (role === EventRole.ACTIVIST) {
        return {
          needed: '∞',
          filled: 0,
          description: 'General participation in the event',
        };
      }
      return {
        needed: '∞',
        filled: 0,
        description: 'No specific requirements',
      };
    }

    const filled = event.participants.filter(
      (p) => p.eventRole === role
    ).length;
    return {
      needed: requirement.needed.toString(),
      filled,
      description:
        requirement.description || `Help with ${role.toLowerCase()} tasks`,
      isFull: filled >= requirement.needed,
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const roleInfo = getRoleInfo(selectedRole);
    if (roleInfo.isFull && selectedRole !== currentRole) {
      toast.error(`The ${selectedRole} role is already full`);
      return;
    }

    // NOTE: This client-side check prevents basic over-filling, but there's still a race condition
    // where two users could sign up for the last available spot simultaneously. The parent component
    // should re-validate role availability just before calling the RSVP action to minimize this window.
    onConfirm(selectedRole);
  };

  return (
    <Modal
      onClose={onClose}
      title={currentRole ? 'Change Your Role' : 'Choose Your Role'}
    >
      <form onSubmit={handleSubmit} className="form-spacing">
        <div className="mb-6">
          <p className="text-sm text-neutral-600">
            {currentRole
              ? `You're currently signed up as: ${currentRole}. Choose a different role if you'd like to change.`
              : "Select the role you'd like to contribute in for this event."}
          </p>
        </div>

        <SelectField
          label="Select Role"
          id="role"
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value as EventRole)}
        >
          {availableRoles.map((role) => {
            const info = getRoleInfo(role);
            return (
              <option
                key={role}
                value={role}
                disabled={info.isFull && role !== currentRole}
              >
                {role} ({info.filled}/{info.needed})
                {info.isFull && role !== currentRole ? ' - FULL' : ''}
              </option>
            );
          })}
        </SelectField>

        {/* Role Description */}
        <div className="card-brutal card-padding bg-neutral-50">
          <div className="flex items-start gap-3">
            <UsersIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
            <div>
              <h4 className="mb-1 font-bold text-black">{selectedRole}</h4>
              <p className="text-sm text-neutral-600">
                {getRoleInfo(selectedRole).description}
              </p>

              {roleRequirements.find((req) => req.role === selectedRole) && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider">
                    <span>Spots:</span>
                    <span className="tag-brutal">
                      {getRoleInfo(selectedRole).filled}/
                      {getRoleInfo(selectedRole).needed}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary w-full"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary w-full"
            disabled={
              getRoleInfo(selectedRole).isFull && selectedRole !== currentRole
            }
          >
            {currentRole ? 'Change Role' : 'Sign Up'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default RoleSignupModal;
