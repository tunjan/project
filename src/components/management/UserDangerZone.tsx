import { AlertTriangle, Trash2 } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from '@/types';

interface UserDangerZoneProps {
  user: User;
  canManuallyVerify: boolean;
  canDeleteUser: boolean;
  onManualVerify?: () => void;
  onOpenDeleteModal: () => void;
}

const UserDangerZone: React.FC<UserDangerZoneProps> = ({
  canManuallyVerify,
  canDeleteUser,
  onManualVerify,
  onOpenDeleteModal,
}) => {
  return (
    <section>
      <h2 className="mb-4 text-2xl font-bold text-destructive">Danger Zone</h2>
      <div className="space-y-4">
        {/* Manual Verification */}
        {canManuallyVerify && onManualVerify && (
          <Card className="border-warning bg-warning/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-warning-foreground">
                <AlertTriangle className="size-5" />
                Manual Verification Override
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-3 text-sm text-warning-foreground">
                This bypasses the entire onboarding process and immediately
                grants full activist permissions. Only use for trusted
                individuals who don't need standard verification steps.
              </p>
              <Button
                onClick={onManualVerify}
                variant="outline"
                className="w-full border-warning bg-warning text-warning-foreground hover:bg-warning/80"
              >
                Bypass & Verify User
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Delete User */}
        {canDeleteUser && (
          <Card className="border-destructive bg-destructive/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-destructive">
                <Trash2 className="size-5" />
                Delete User Account
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-3 text-sm text-destructive">
                This action permanently removes the user account and all
                associated data. This action cannot be undone.
              </p>
              <Button
                onClick={onOpenDeleteModal}
                variant="destructive"
                className="w-full"
              >
                Delete User Account
              </Button>
            </CardContent>
          </Card>
        )}

        {!canManuallyVerify && !canDeleteUser && (
          <p className="text-sm text-muted-foreground">
            You don't have permission to perform dangerous actions on this user.
          </p>
        )}
      </div>
    </section>
  );
};

export default UserDangerZone;
