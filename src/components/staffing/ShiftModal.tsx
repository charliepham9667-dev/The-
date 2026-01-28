import { useState, useEffect } from 'react';
import { X, Loader2, Trash2, Clock, Play, Square } from 'lucide-react';
import {
  useShift,
  useCreateShift,
  useUpdateShift,
  useDeleteShift,
  useClockInOut,
  useStaffList,
} from '../../hooks/useShifts';

interface ShiftModalProps {
  shiftId: string | null;
  defaultDate: Date;
  onClose: () => void;
}

const ROLES = ['server', 'bartender', 'host', 'manager', 'kitchen', 'security', 'dj'];

export function ShiftModal({ shiftId, defaultDate, onClose }: ShiftModalProps) {
  const isEditing = !!shiftId;

  const { data: existingShift, isLoading: isLoadingShift } = useShift(shiftId);
  const { data: staffList, isLoading: isLoadingStaff } = useStaffList();
  const createShift = useCreateShift();
  const updateShift = useUpdateShift();
  const deleteShift = useDeleteShift();
  const clockInOut = useClockInOut();

  const [formData, setFormData] = useState({
    staffId: '',
    shiftDate: defaultDate.toISOString().split('T')[0],
    startTime: '14:00',
    endTime: '22:00',
    role: 'server',
    notes: '',
  });

  const [error, setError] = useState('');

  // Load existing shift data
  useEffect(() => {
    if (existingShift) {
      setFormData({
        staffId: existingShift.staffId,
        shiftDate: existingShift.shiftDate,
        startTime: existingShift.startTime,
        endTime: existingShift.endTime,
        role: existingShift.role,
        notes: existingShift.notes || '',
      });
    }
  }, [existingShift]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.staffId) {
      setError('Please select a staff member');
      return;
    }

    try {
      if (isEditing) {
        await updateShift.mutateAsync({ id: shiftId, ...formData });
      } else {
        await createShift.mutateAsync(formData);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save shift');
    }
  };

  const handleDelete = async () => {
    if (!shiftId || !confirm('Are you sure you want to delete this shift?')) return;

    try {
      await deleteShift.mutateAsync(shiftId);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to delete shift');
    }
  };

  const handleClockIn = async () => {
    if (!shiftId) return;
    try {
      await clockInOut.mutateAsync({ shiftId, action: 'in' });
    } catch (err: any) {
      setError(err.message || 'Failed to clock in');
    }
  };

  const handleClockOut = async () => {
    if (!shiftId) return;
    try {
      await clockInOut.mutateAsync({ shiftId, action: 'out' });
    } catch (err: any) {
      setError(err.message || 'Failed to clock out');
    }
  };

  const isLoading = isLoadingShift || isLoadingStaff;
  const isSaving = createShift.isPending || updateShift.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl border border-[#374151] bg-[#1a1f2e] shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#374151] p-4">
          <h2 className="text-lg font-semibold text-white">
            {isEditing ? 'Edit Shift' : 'Add New Shift'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-[#374151] hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Staff Member */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Staff Member *
              </label>
              <select
                value={formData.staffId}
                onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                className="w-full rounded-lg border border-[#374151] bg-[#0f1419] px-3 py-2 text-sm text-white focus:border-[#ff6b35] focus:outline-none"
              >
                <option value="">Select staff...</option>
                {(staffList || []).map((staff) => (
                  <option key={staff.id} value={staff.id}>
                    {staff.full_name} ({staff.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Shift Date *
              </label>
              <input
                type="date"
                value={formData.shiftDate}
                onChange={(e) => setFormData({ ...formData, shiftDate: e.target.value })}
                className="w-full rounded-lg border border-[#374151] bg-[#0f1419] px-3 py-2 text-sm text-white focus:border-[#ff6b35] focus:outline-none"
              />
            </div>

            {/* Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Start Time *
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full rounded-lg border border-[#374151] bg-[#0f1419] px-3 py-2 text-sm text-white focus:border-[#ff6b35] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  End Time *
                </label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full rounded-lg border border-[#374151] bg-[#0f1419] px-3 py-2 text-sm text-white focus:border-[#ff6b35] focus:outline-none"
                />
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Role *
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full rounded-lg border border-[#374151] bg-[#0f1419] px-3 py-2 text-sm text-white focus:border-[#ff6b35] focus:outline-none"
              >
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
                placeholder="Any special instructions..."
                className="w-full rounded-lg border border-[#374151] bg-[#0f1419] px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-[#ff6b35] focus:outline-none resize-none"
              />
            </div>

            {/* Clock In/Out (only for existing shifts) */}
            {isEditing && existingShift && (
              <div className="rounded-lg border border-[#374151] bg-[#0f1419] p-3">
                <p className="text-xs text-slate-400 mb-2">Time Tracking</p>
                <div className="flex items-center gap-2">
                  {!existingShift.clockIn ? (
                    <button
                      type="button"
                      onClick={handleClockIn}
                      disabled={clockInOut.isPending}
                      className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 transition-colors disabled:opacity-50"
                    >
                      <Play className="h-3 w-3" />
                      Clock In
                    </button>
                  ) : !existingShift.clockOut ? (
                    <>
                      <span className="flex items-center gap-1 text-xs text-emerald-400">
                        <Clock className="h-3 w-3" />
                        Clocked in at {new Date(existingShift.clockIn).toLocaleTimeString()}
                      </span>
                      <button
                        type="button"
                        onClick={handleClockOut}
                        disabled={clockInOut.isPending}
                        className="flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        <Square className="h-3 w-3" />
                        Clock Out
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-slate-400">
                      Completed: {new Date(existingShift.clockIn).toLocaleTimeString()} - {new Date(existingShift.clockOut).toLocaleTimeString()}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              {isEditing && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleteShift.isPending}
                  className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              )}
              <div className={`flex gap-2 ${isEditing ? '' : 'ml-auto'}`}>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-[#374151] px-4 py-2 text-sm text-slate-400 hover:bg-[#374151] hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 rounded-lg bg-[#ff6b35] px-4 py-2 text-sm font-medium text-white hover:bg-[#e55a2b] transition-colors disabled:opacity-50"
                >
                  {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isEditing ? 'Save Changes' : 'Create Shift'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
