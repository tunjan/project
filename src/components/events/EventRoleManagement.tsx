import React, { useState } from 'react';
import { type EventRoleRequirement, EventRole, type CubeEvent } from '@/types';
import { UsersIcon, PlusIcon, PencilIcon, TrashIcon } from '@/icons';
import { toast } from 'sonner';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { InputField, SelectField } from '@/components/ui/Form';

interface EventRoleManagementProps {
  event: CubeEvent;
  onUpdateRoleRequirements: (requirements: EventRoleRequirement[]) => void;
  canEdit: boolean;
}

interface RoleFormProps {
  requirement?: EventRoleRequirement;
  onSave: (requirement: Omit<EventRoleRequirement, 'filled'>) => void;
  onCancel: () => void;
  existingRoles: EventRole[];
}

const RoleForm: React.FC<RoleFormProps> = ({
  requirement,
  onSave,
  onCancel,
  existingRoles,
}) => {
  const [formData, setFormData] = useState({
    role: requirement?.role || EventRole.VOLUNTEER,
    needed: requirement?.needed || 1,
    description: requirement?.description || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.needed < 1) {
      toast.error('Number needed must be at least 1');
      return;
    }
    if (!requirement && existingRoles.includes(formData.role)) {
      toast.error('Role already exists for this event');
      return;
    }
    onSave(formData);
  };

  const availableRoles = Object.values(EventRole).filter(
    (role) =>
      role !== EventRole.ORGANIZER &&
      (requirement?.role === role || !existingRoles.includes(role))
  );

  return (
    <div className="card-brutal card-padding">
      <h3 className="h-subsection">
        {requirement ? 'Edit Role Requirement' : 'Add Role Requirement'}
      </h3>
      <form onSubmit={handleSubmit} className="form-spacing">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <SelectField
            label="Role"
            id="role"
            value={formData.role}
            onChange={(e) =>
              setFormData({ ...formData, role: e.target.value as EventRole })
            }
            disabled={!!requirement}
          >
            {availableRoles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </SelectField>

          <InputField
            label="Number Needed"
            id="needed"
            type="number"
            min="1"
            value={formData.needed}
            onChange={(e) =>
              setFormData({
                ...formData,
                needed: parseInt(e.target.value) || 1,
              })
            }
          />
        </div>

        <InputField
          label="Description (optional)"
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="e.g., Need drivers with van access"
        />

        <div className="flex gap-3 pt-4">
          <button type="submit" className="btn-primary">
            {requirement ? 'Update Role' : 'Add Role'}
          </button>
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

const RoleRequirementCard: React.FC<{
  requirement: EventRoleRequirement;
  onEdit: () => void;
  onDelete: () => void;
  canEdit: boolean;
}> = ({ requirement, onEdit, onDelete, canEdit }) => {
  const progressPercentage =
    requirement.needed > 0
      ? Math.round((requirement.filled / requirement.needed) * 100)
      : 0;

  const statusColor =
    requirement.filled >= requirement.needed
              ? 'text-black bg-white border-black'
        : requirement.filled > 0
        ? 'text-red bg-white border-red'
        : 'text-red bg-white border-red';

  return (
    <div className="card-brutal card-padding">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-3 flex items-center gap-3">
            <h4 className="h-card">{requirement.role}</h4>
            <span className={`tag-status ${statusColor}`}>
              {requirement.filled}/{requirement.needed}
            </span>
          </div>

          <div className="mb-3">
            <div className="mb-1 flex items-center justify-between font-mono text-sm">
              <span>Progress</span>
              <span>{progressPercentage}%</span>
            </div>
            <div className="h-3 border-2 border-black bg-white">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

          {requirement.description && (
            <p className="mb-2 text-sm text-red">
              {requirement.description}
            </p>
          )}
        </div>

        {canEdit && (
          <div className="flex gap-2">
            <button
              onClick={onEdit}
              className="p-2 text-red transition-colors duration-300 hover:bg-black hover:text-white"
              title="Edit requirement"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-red transition-colors duration-300 hover:bg-primary hover:text-white"
              title="Delete requirement"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const EventRoleManagement: React.FC<EventRoleManagementProps> = ({
  event,
  onUpdateRoleRequirements,
  canEdit,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingRequirement, setEditingRequirement] =
    useState<EventRoleRequirement | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<EventRole | null>(null);

  const roleRequirements = event.roleRequirements || [];

  // Calculate filled counts based on participants
  const roleRequirementsWithCounts = roleRequirements.map((req) => {
    const filled = event.participants.filter(
      (p) => p.eventRole === req.role
    ).length;
    return { ...req, filled };
  });

  const handleSaveRequirement = (
    requirementData: Omit<EventRoleRequirement, 'filled'>
  ) => {
    const filled = event.participants.filter(
      (p) => p.eventRole === requirementData.role
    ).length;

    if (editingRequirement) {
      // Update existing requirement
      const updatedRequirements = roleRequirements.map((req) =>
        req.role === editingRequirement.role
          ? { ...requirementData, filled }
          : req
      );
      onUpdateRoleRequirements(updatedRequirements);
      toast.success('Role requirement updated successfully');
    } else {
      // Add new requirement
      const newRequirement: EventRoleRequirement = {
        ...requirementData,
        filled,
      };
      onUpdateRoleRequirements([...roleRequirements, newRequirement]);
      toast.success('Role requirement added successfully');
    }
    setShowForm(false);
    setEditingRequirement(null);
  };

  const handleDeleteRequirement = (role: EventRole) => {
    const updatedRequirements = roleRequirements.filter(
      (req) => req.role !== role
    );
    onUpdateRoleRequirements(updatedRequirements);
    toast.success('Role requirement deleted successfully');
  };

  const openDeleteModal = (role: EventRole) => {
    setRoleToDelete(role);
    setDeleteModalOpen(true);
  };

  const handleEdit = (requirement: EventRoleRequirement) => {
    setEditingRequirement(requirement);
    setShowForm(true);
  };

  const existingRoles = roleRequirements.map((req) => req.role);

  return (
    <div className="section-spacing">
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={() => {
          if (roleToDelete) {
            handleDeleteRequirement(roleToDelete);
          }
        }}
        title="Delete Role Requirement"
        message={`Are you sure you want to delete the ${roleToDelete} requirement?`}
        confirmText="Delete"
        variant="danger"
      />

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="h-subsection">Event Roles</h3>
          <p className="font-mono text-sm uppercase tracking-wider text-red">
            Coordinate specific roles needed for this event
          </p>
        </div>
        {canEdit && (
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center gap-2"
          >
            <PlusIcon className="h-4 w-4" />
            Add Role
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-6">
          <RoleForm
            requirement={editingRequirement || undefined}
            onSave={handleSaveRequirement}
            onCancel={() => {
              setShowForm(false);
              setEditingRequirement(null);
            }}
            existingRoles={existingRoles}
          />
        </div>
      )}

      {roleRequirementsWithCounts.length > 0 ? (
        <div className="grid-spacing grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {roleRequirementsWithCounts.map((requirement) => (
            <RoleRequirementCard
              key={requirement.role}
              requirement={requirement}
              onEdit={() => handleEdit(requirement)}
              onDelete={() => openDeleteModal(requirement.role)}
              canEdit={canEdit}
            />
          ))}
        </div>
      ) : (
        <div className="card-brutal card-padding text-center">
          <UsersIcon className="mx-auto mb-3 h-12 w-12 text-red" />
          <h4 className="h-card text-black">No specific roles defined</h4>
          <p className="text-sm text-red">
            {canEdit
              ? 'Add role requirements to help coordinate this event.'
              : "The organizer hasn't defined specific roles for this event yet."}
          </p>
        </div>
      )}
    </div>
  );
};

export default EventRoleManagement;
