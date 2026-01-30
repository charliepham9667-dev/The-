import { useState } from 'react';
import { X, Loader2, Trash2, Plus } from 'lucide-react';
import { useTargets, useCreateTarget, useUpdateTarget, useDeleteTarget } from '../../hooks/useDashboardData';

interface TargetManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function TargetManager({ isOpen, onClose }: TargetManagerProps) {
  const { data: targets, isLoading } = useTargets();
  const createTarget = useCreateTarget();
  const updateTarget = useUpdateTarget();
  const deleteTarget = useDeleteTarget();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newMonth, setNewMonth] = useState(new Date().getMonth());
  const [newYear, setNewYear] = useState(new Date().getFullYear());
  const [newValue, setNewValue] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  if (!isOpen) return null;

  const handleCreate = async () => {
    if (!newValue) return;
    const valueInVND = parseFloat(newValue) * 1000000; // Convert from millions
    await createTarget.mutateAsync({ month: newMonth, year: newYear, targetValue: valueInVND });
    setNewValue('');
    setShowAddForm(false);
  };

  const handleUpdate = async (id: string) => {
    if (!editValue) return;
    const valueInVND = parseFloat(editValue) * 1000000;
    await updateTarget.mutateAsync({ id, targetValue: valueInVND });
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this target?')) {
      await deleteTarget.mutateAsync(id);
    }
  };

  const formatTarget = (value: number) => `${Math.round(value / 1000000)}M đ`;

  const getMonthFromPeriodStart = (periodStart: string) => {
    const month = parseInt(periodStart.split('-')[1], 10) - 1;
    const year = parseInt(periodStart.split('-')[0], 10);
    return { month, year };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl border border-[#374151] bg-[#1a1f2e] p-4 md:p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="text-lg md:text-xl font-semibold text-white">Manage Revenue Targets</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-2 -mr-2 min-h-[44px] min-w-[44px] flex items-center justify-center">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : (
          <>
            {/* Existing Targets */}
            <div className="space-y-3 mb-4 md:mb-6">
              {targets && targets.length > 0 ? (
                targets.map(target => {
                  const { month, year } = getMonthFromPeriodStart(target.periodStart);
                  const isEditing = editingId === target.id;

                  return (
                    <div
                      key={target.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg bg-[#0f1419] p-3 md:p-4"
                    >
                      <div className="min-w-0">
                        <p className="text-white font-medium text-sm md:text-base">{MONTH_NAMES[month]} {year}</p>
                        {isEditing ? (
                          <div className="flex items-center gap-2 mt-1">
                            <input
                              type="number"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="w-24 rounded bg-[#1a1f2e] border border-[#374151] px-2 py-2 md:py-1 text-sm text-white"
                              placeholder="M đ"
                            />
                            <span className="text-slate-400 text-sm">M đ</span>
                          </div>
                        ) : (
                          <p className="text-slate-400 text-xs md:text-sm">Target: {formatTarget(target.targetValue)}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => handleUpdate(target.id)}
                              disabled={updateTarget.isPending}
                              className="px-3 py-2 md:py-1.5 text-xs md:text-sm rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 min-h-[40px] md:min-h-0 flex-1 sm:flex-initial"
                            >
                              {updateTarget.isPending ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="px-3 py-2 md:py-1.5 text-xs md:text-sm rounded bg-slate-600 text-white hover:bg-slate-700 min-h-[40px] md:min-h-0 flex-1 sm:flex-initial"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setEditingId(target.id);
                                setEditValue(String(Math.round(target.targetValue / 1000000)));
                              }}
                              className="px-3 py-2 md:py-1.5 text-xs md:text-sm rounded bg-[#374151] text-white hover:bg-[#4b5563] min-h-[40px] md:min-h-0"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(target.id)}
                              disabled={deleteTarget.isPending}
                              className="p-2 md:p-1 text-red-400 hover:text-red-300 disabled:opacity-50 min-h-[40px] min-w-[40px] md:min-h-0 md:min-w-0 flex items-center justify-center"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-slate-400 text-center py-4 text-sm">No targets set yet</p>
              )}
            </div>

            {/* Add New Target */}
            {showAddForm ? (
              <div className="rounded-lg border border-[#374151] bg-[#0f1419] p-3 md:p-4">
                <h3 className="text-white font-medium mb-3 text-sm md:text-base">Add New Target</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Month</label>
                    <select
                      value={newMonth}
                      onChange={(e) => setNewMonth(parseInt(e.target.value))}
                      className="w-full rounded bg-[#1a1f2e] border border-[#374151] px-3 py-2.5 md:py-2 text-sm text-white min-h-[44px] md:min-h-0"
                    >
                      {MONTH_NAMES.map((name, index) => (
                        <option key={index} value={index}>{name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Year</label>
                    <select
                      value={newYear}
                      onChange={(e) => setNewYear(parseInt(e.target.value))}
                      className="w-full rounded bg-[#1a1f2e] border border-[#374151] px-3 py-2.5 md:py-2 text-sm text-white min-h-[44px] md:min-h-0"
                    >
                      <option value={2025}>2025</option>
                      <option value={2026}>2026</option>
                      <option value={2027}>2027</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Target (M đ)</label>
                    <input
                      type="number"
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                      placeholder="750"
                      className="w-full rounded bg-[#1a1f2e] border border-[#374151] px-3 py-2.5 md:py-2 text-sm text-white min-h-[44px] md:min-h-0"
                    />
                  </div>
                </div>
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2.5 md:py-2 text-sm rounded bg-slate-600 text-white hover:bg-slate-700 min-h-[44px] md:min-h-0 w-full sm:w-auto"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={!newValue || createTarget.isPending}
                    className="px-4 py-2.5 md:py-2 text-sm rounded bg-[#ff6b35] text-white hover:bg-[#e55a2b] disabled:opacity-50 min-h-[44px] md:min-h-0 w-full sm:w-auto"
                  >
                    {createTarget.isPending ? 'Creating...' : 'Create Target'}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full flex items-center justify-center gap-2 rounded-lg border border-dashed border-[#374151] py-3 md:py-3 text-slate-400 hover:text-white hover:border-[#4b5563] transition-colors min-h-[48px]"
              >
                <Plus className="h-4 w-4" />
                Add Monthly Target
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
