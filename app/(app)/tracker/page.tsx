'use client';

import { DragDropContext, Draggable, Droppable, type DropResult } from '@hello-pangea/dnd';
import Link from 'next/link';
import { Countdown, PageHeader, Progress } from '@/components/ui';
import { buildChecklist, checklistProgress } from '@/lib/checklist';
import { daysUntil } from '@/lib/dates';
import { useApp } from '@/lib/store';
import type { ApplicationStatus } from '@/lib/types';
import { APPLICATION_STATUSES, STATUS_TONE } from '@/lib/utils';

export default function TrackerPage() {
  const programs = useApp(s => s.programs);
  const referees = useApp(s => s.referees);
  const today = useApp(s => s.today);
  const update = useApp(s => s.update);

  const onDragEnd = ({ destination, draggableId }: DropResult) => {
    if (!destination) return;
    const status = destination.droppableId as ApplicationStatus;
    const p = programs.find(x => x.id === draggableId);
    if (p && p.status !== status) update('programs', p.id, { status }, `${p.university}: ${status}`);
  };

  return (
    <div>
      <PageHeader title="Board" lede="Drag a program to its stage. On iPhone and iPad, press and hold a card, then drag." />
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="board">
          {APPLICATION_STATUSES.map(status => {
            const col = programs
              .filter(p => p.status === status)
              .sort((a, b) => (a.deadlineDate ?? '9999').localeCompare(b.deadlineDate ?? '9999'));
            return (
              <section key={status} aria-label={status} className="flex min-h-[60dvh] flex-col rounded-[14px] bg-surface-2/70 p-2">
                <h2 className="flex items-center justify-between px-2 pb-2 pt-1 text-[14px] font-semibold">
                  <span className="flex items-center gap-2"><span className={`chip tone-${STATUS_TONE[status]} !min-h-0 !px-1.5 !py-1.5`} aria-hidden />{status}</span>
                  <span className="num text-ink-3">{col.length}</span>
                </h2>
                <Droppable droppableId={status}>
                  {(drop, snap) => (
                    <ul ref={drop.innerRef} {...drop.droppableProps}
                      className={`flex flex-1 flex-col gap-2 rounded-[10px] p-0.5 transition-colors ${snap.isDraggingOver ? 'bg-accent-soft' : ''}`}>
                      {col.map((p, i) => {
                        const pct = checklistProgress(buildChecklist(p, referees)).pct;
                        return (
                          <Draggable key={p.id} draggableId={p.id} index={i}>
                            {(drag, ds) => (
                              <li ref={drag.innerRef} {...drag.draggableProps} {...drag.dragHandleProps}
                                className={`panel select-none p-3 ${ds.isDragging ? 'lift rotate-1' : ''}`} style={drag.draggableProps.style}>
                                <Link href={`/programs/${p.id}`} className="block" draggable={false}>
                                  <span className="block font-serif text-[17px] font-semibold leading-snug">{p.university}</span>
                                  <span className="mt-0.5 block line-clamp-2 text-[13px] text-ink-2">{p.program}</span>
                                </Link>
                                <span className="mt-2.5 flex items-center gap-2">
                                  <Countdown days={daysUntil(p.deadlineDate, today)} />
                                  <span className="flex-1"><Progress pct={pct} label="Documents" /></span>
                                  <span className="num text-[12px] text-ink-3">{pct}%</span>
                                </span>
                              </li>
                            )}
                          </Draggable>
                        );
                      })}
                      {drop.placeholder}
                    </ul>
                  )}
                </Droppable>
              </section>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}
