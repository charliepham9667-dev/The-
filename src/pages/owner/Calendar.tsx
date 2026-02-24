import { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  X,
  Loader2,
  AlertCircle,
  ChevronDown
} from 'lucide-react';
import { useEvents, useCreateEvent, useDeleteEvent } from '../../hooks/useEvents';
import type { CalendarEvent, EventType } from '../../types';

const eventTypeConfig: Record<EventType, { label: string; color: string; bg: string }> = {
  meeting: { label: 'Meeting', color: 'text-info', bg: 'bg-info' },
  holiday: { label: 'Holiday', color: 'text-error', bg: 'bg-error' },
  birthday: { label: 'Birthday', color: 'text-pink-400', bg: 'bg-pink-500' },
  team_building: { label: 'Team Building', color: 'text-purple-400', bg: 'bg-purple-500' },
  training: { label: 'Training', color: 'text-success', bg: 'bg-success' },
  promotion: { label: 'Promotion', color: 'text-warning', bg: 'bg-warning' },
  special_event: { label: 'Special Event', color: 'text-primary', bg: 'bg-primary' },
  other: { label: 'Other', color: 'text-muted-foreground', bg: 'bg-muted' },
};

export function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Get first and last day of the month for query
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  const { data: events, isLoading } = useEvents(
    firstDay.toISOString().split('T')[0],
    lastDay.toISOString().split('T')[0]
  );

  const navigateMonth = (delta: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + delta);
      return newDate;
    });
  };

  // Build calendar grid
  const calendarDays = buildCalendarDays(currentDate);

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events?.filter(e => {
      const start = e.startDate;
      const end = e.endDate || e.startDate;
      return dateStr >= start && dateStr <= end;
    }) || [];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Calendar</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Team events, meetings, and important dates
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Event
        </button>
      </div>

      {/* Calendar */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {/* Month Navigation */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <button
            onClick={() => navigateMonth(-1)}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold text-foreground">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <button
            onClick={() => navigateMonth(1)}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 border-b border-border">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-3 text-center text-xs font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-7">
            {calendarDays.map((day, index) => {
              const isCurrentMonth = day.getMonth() === currentDate.getMonth();
              const isToday = day.toDateString() === new Date().toDateString();
              const dayEvents = getEventsForDate(day);

              return (
                <div
                  key={index}
                  className={`min-h-[100px] p-2 border-b border-r border-border ${
                    !isCurrentMonth ? 'bg-background/50' : ''
                  } ${isToday ? 'bg-primary/5' : ''}`}
                >
                  <div className={`text-sm ${
                    isToday 
                      ? 'text-primary font-semibold' 
                      : isCurrentMonth 
                      ? 'text-foreground' 
                      : 'text-muted-foreground/50'
                  }`}>
                    {day.getDate()}
                  </div>
                  <div className="mt-1 space-y-1">
                    {dayEvents.slice(0, 2).map(event => {
                      const config = eventTypeConfig[event.eventType];
                      return (
                        <button
                          key={event.id}
                          onClick={() => setSelectedEvent(event)}
                          className={`w-full text-left rounded px-1.5 py-0.5 text-xs truncate ${config.bg}/20 ${config.color} hover:opacity-80`}
                        >
                          {event.title}
                        </button>
                      );
                    })}
                    {dayEvents.length > 2 && (
                      <p className="text-xs text-muted-foreground px-1.5">
                        +{dayEvents.length - 2} more
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upcoming Events List */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="font-semibold text-foreground mb-4">This Month's Events</h3>
        {events && events.length > 0 ? (
          <div className="space-y-3">
            {events.map(event => {
              const config = eventTypeConfig[event.eventType];
              return (
                <div 
                  key={event.id}
                  className="flex items-start gap-3 rounded-lg bg-background p-3 cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedEvent(event)}
                >
                  <div className={`w-1 h-full min-h-[40px] rounded ${config.bg}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium text-foreground">{event.title}</h4>
                      <span className={`rounded-full px-2 py-0.5 text-xs ${config.bg}/20 ${config.color}`}>
                        {config.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      {event.startTime && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {event.startTime}
                        </span>
                      )}
                      {event.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">No events this month</p>
        )}
      </div>

      {/* Event Form Modal */}
      {showForm && (
        <EventForm onClose={() => setShowForm(false)} />
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <EventDetail event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </div>
  );
}

function buildCalendarDays(currentDate: Date): Date[] {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  const days: Date[] = [];
  
  // Add days from previous month
  const startPadding = firstDay.getDay();
  for (let i = startPadding - 1; i >= 0; i--) {
    const date = new Date(year, month, -i);
    days.push(date);
  }
  
  // Add days of current month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i));
  }
  
  // Add days from next month
  const endPadding = 42 - days.length;
  for (let i = 1; i <= endPadding; i++) {
    days.push(new Date(year, month + 1, i));
  }
  
  return days;
}

function EventForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    title: '',
    eventType: 'meeting' as EventType,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    startTime: '',
    endTime: '',
    location: '',
    description: '',
    isAllDay: false,
  });
  const [error, setError] = useState<string | null>(null);

  const createEvent = useCreateEvent();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim()) {
      setError('Event title is required');
      return;
    }

    try {
      await createEvent.mutateAsync(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create event');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">New Event</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(f => ({ ...f, title: e.target.value }))}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-ring focus:outline-none"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Type</label>
              <select
                value={formData.eventType}
                onChange={(e) => setFormData(f => ({ ...f, eventType: e.target.value as EventType }))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-ring focus:outline-none"
              >
                {Object.entries(eventTypeConfig).map(([value, config]) => (
                  <option key={value} value={value}>{config.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(f => ({ ...f, location: e.target.value }))}
                placeholder="e.g., The Roof Office"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Start Date *</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(f => ({ ...f, startDate: e.target.value }))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-ring focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(f => ({ ...f, endDate: e.target.value }))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-ring focus:outline-none"
              />
            </div>
            {!formData.isAllDay && (
              <>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Start Time</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData(f => ({ ...f, startTime: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-ring focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">End Time</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData(f => ({ ...f, endTime: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-ring focus:outline-none"
                  />
                </div>
              </>
            )}
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isAllDay}
              onChange={(e) => setFormData(f => ({ ...f, isAllDay: e.target.checked }))}
              className="rounded border-border bg-background text-primary"
            />
            <span className="text-sm text-foreground">All day event</span>
          </label>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none resize-none"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-error">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-muted-foreground hover:text-foreground">
              Cancel
            </button>
            <button
              type="submit"
              disabled={createEvent.isPending}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {createEvent.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Create Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EventDetail({ event, onClose }: { event: CalendarEvent; onClose: () => void }) {
  const deleteEvent = useDeleteEvent();
  const config = eventTypeConfig[event.eventType];

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this event?')) {
      await deleteEvent.mutateAsync(event.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-xl border border-border bg-card p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className={`inline-block rounded-full px-2 py-0.5 text-xs mb-2 ${config.bg}/20 ${config.color}`}>
              {config.label}
            </span>
            <h2 className="text-lg font-semibold text-foreground">{event.title}</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CalendarIcon className="h-4 w-4" />
            {new Date(event.startDate).toLocaleDateString('en-US', { 
              weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' 
            })}
            {event.endDate && event.endDate !== event.startDate && (
              <> - {new Date(event.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</>
            )}
          </div>
          
          {event.startTime && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              {event.startTime}{event.endTime && ` - ${event.endTime}`}
            </div>
          )}
          
          {event.location && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {event.location}
            </div>
          )}

          {event.description && (
            <p className="text-foreground pt-2 border-t border-border">
              {event.description}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
          <button
            onClick={handleDelete}
            className="px-4 py-2 text-sm text-error hover:text-error/80"
          >
            Delete
          </button>
          <button
            onClick={onClose}
            className="rounded-lg bg-muted px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/80"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
