'use client';

import { useEffect, useRef, useState } from 'react';
import {
  DayFlowCalendar,
  useCalendarApp,
  createDayView,
  createWeekView,
  createMonthView,
  createYearView,
  createEvent,
  ViewType,
  type Event,
} from '@dayflow/react';
import { createSidebarPlugin } from '@dayflow/plugin-sidebar';
import { getSupabaseClient } from '@/lib/supabaseClient';

/* ─── DB Row Type ─── */
type DBEvent = {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  all_day: boolean;
  description?: string;
  calendar_id: string;
};

function toCalendarEvent(row: DBEvent): Event {
  return createEvent({
    id: row.id,
    title: row.title,
    start: new Date(row.start_time),
    end: new Date(row.end_time),
    allDay: row.all_day,
    description: row.description,
    calendarId: row.calendar_id,
  });
}

/* ─── Add Event Modal ─── */
type FormState = {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  allDay: boolean;
};

function AddEventModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (form: FormState) => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState<FormState>({
    title: '',
    date: today,
    startTime: '09:00',
    endTime: '10:00',
    allDay: false,
  });

  useEffect(() => {
    if (open) setForm({ title: '', date: today, startTime: '09:00', endTime: '10:00', allDay: false });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 flex flex-col gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-[0.65rem] tracking-[0.35em] text-black/30 uppercase">스케줄 추가</p>

        <input
          className="border border-black/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-black/30 transition-colors"
          placeholder="제목"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          autoFocus
          onKeyDown={(e) => e.key === 'Enter' && form.title.trim() && onSubmit(form)}
        />

        <input
          type="date"
          className="border border-black/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-black/30 transition-colors"
          value={form.date}
          onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
        />

        <label className="flex items-center gap-2 text-xs text-black/50 cursor-pointer select-none">
          <input
            type="checkbox"
            className="rounded"
            checked={form.allDay}
            onChange={(e) => setForm((f) => ({ ...f, allDay: e.target.checked }))}
          />
          종일
        </label>

        {!form.allDay && (
          <div className="flex items-center gap-2">
            <input
              type="time"
              className="border border-black/10 rounded-lg px-3 py-2 text-sm flex-1 outline-none focus:border-black/30 transition-colors"
              value={form.startTime}
              onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
            />
            <span className="text-xs text-black/30">~</span>
            <input
              type="time"
              className="border border-black/10 rounded-lg px-3 py-2 text-sm flex-1 outline-none focus:border-black/30 transition-colors"
              value={form.endTime}
              onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
            />
          </div>
        )}

        <div className="flex gap-2 mt-1">
          <button
            onClick={() => form.title.trim() && onSubmit(form)}
            disabled={!form.title.trim()}
            className="flex-1 py-2 rounded-xl text-sm bg-black text-white disabled:opacity-30 hover:bg-black/80 transition-colors"
          >
            추가
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl text-sm bg-black/6 text-black/50 hover:bg-black/10 transition-colors"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
export function ScheduleScreen({ onBack }: { onBack: () => void }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const lastClickRef = useRef<{ id: string; time: number } | null>(null);

  /* Load events from Supabase */
  useEffect(() => {
    (async () => {
      const supabase = getSupabaseClient();
      if (!supabase) return;
      const { data } = await supabase
        .from('schedule_events')
        .select('*')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .order('start_time' as any, { ascending: true });
      if (data) setEvents((data as DBEvent[]).map(toCalendarEvent));
    })();
  }, []);

  /* Calendar app */
  const calendar = useCalendarApp({
    views: [createDayView(), createWeekView(), createMonthView(), createYearView()],
    defaultView: ViewType.MONTH,
    initialDate: new Date(),
    events,
    locale: 'ko',
    plugins: [createSidebarPlugin({ initialCollapsed: false })],
    calendars: [
      {
        id: 'personal',
        name: '개인',
        colors: {
          eventColor: '#3b82f6',
          eventSelectedColor: '#2563eb',
          lineColor: '#3b82f6',
          textColor: '#ffffff',
        },
      },
    ],
    defaultCalendar: 'personal',
    callbacks: {
      onEventCreate: async (event: Event) => {
        const supabase = getSupabaseClient();
        if (!supabase) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('schedule_events') as any).insert({
          id: event.id,
          title: event.title,
          start_time: new Date(event.start as unknown as string).toISOString(),
          end_time: new Date(event.end as unknown as string).toISOString(),
          all_day: event.allDay ?? false,
          description: event.description ?? null,
          calendar_id: event.calendarId ?? 'personal',
        });
        setEvents((prev) => [...prev, event]);
      },
      onEventDelete: async (eventId: string) => {
        const supabase = getSupabaseClient();
        if (supabase) await supabase.from('schedule_events').delete().eq('id', eventId);
        setEvents((prev) => prev.filter((e) => e.id !== eventId));
      },
    },
  });

  /* Add event via + button */
  const handleAddSubmit = async (form: FormState) => {
    const id = crypto.randomUUID();
    let start: Date, end: Date;

    if (form.allDay) {
      start = new Date(form.date + 'T00:00:00');
      end = new Date(form.date + 'T23:59:59');
    } else {
      start = new Date(`${form.date}T${form.startTime}:00`);
      end = new Date(`${form.date}T${form.endTime}:00`);
    }

    const newEvent = createEvent({
      id,
      title: form.title,
      start,
      end,
      allDay: form.allDay,
      calendarId: 'personal',
    });

    const supabase = getSupabaseClient();
    if (supabase) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('schedule_events') as any).insert({
        id,
        title: form.title,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        all_day: form.allDay,
        calendar_id: 'personal',
      });
    }

    calendar.addEvent(newEvent);
    setEvents((prev) => [...prev, newEvent]);
    setShowAdd(false);
  };

  /* Custom event detail dialog – handles double-click delete */
  const renderEventDialog = (props: { event: Event | null; close?: () => void }) => {
    const { event, close } = props;
    if (!event) return null;

    const now = Date.now();
    const last = lastClickRef.current;

    // Double-click: same event opened twice within 400ms → delete
    if (last?.id === event.id && now - last!.time < 400) {
      lastClickRef.current = null;
      queueMicrotask(() => {
        calendar.deleteEvent(event.id);
        close?.();
      });
      return null;
    }

    lastClickRef.current = { id: event.id, time: now };

    return (
      <div
        className="fixed inset-0 z-100 flex items-center justify-center bg-black/20"
        onClick={() => close?.()}
      >
        <div
          className="bg-white rounded-2xl shadow-xl p-5 max-w-xs w-full mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-sm font-medium text-black/80">{event.title}</p>
          <p className="text-[0.6rem] tracking-[0.15em] text-black/30 mt-1 uppercase">
            더블클릭하면 삭제됩니다
          </p>
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => { calendar.deleteEvent(event.id); close?.(); }}
              className="flex-1 py-2 rounded-xl text-xs bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
            >
              삭제
            </button>
            <button
              onClick={() => close?.()}
              className="flex-1 py-2 rounded-xl text-xs bg-black/5 text-black/40 hover:bg-black/10 transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="absolute inset-0 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-black/6 shrink-0">
        <button
          onClick={onBack}
          className="text-[0.55rem] tracking-[0.35em] text-black/25 hover:text-black/50 transition-colors uppercase"
        >
          ← back
        </button>
        <button
          onClick={() => setShowAdd(true)}
          className="w-6 h-6 rounded-full bg-black/7 hover:bg-black/14 transition-colors flex items-center justify-center text-black/40 text-sm leading-none"
          title="스케줄 추가"
        >
          +
        </button>
      </div>

      {/* DayFlow Calendar */}
      <div className="flex-1 min-h-0 schedule-calendar-wrap">
        <DayFlowCalendar
          calendar={calendar}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          eventDetailDialog={renderEventDialog as any}
        />
      </div>

      {/* Add modal */}
      <AddEventModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSubmit={handleAddSubmit}
      />
    </div>
  );
}
