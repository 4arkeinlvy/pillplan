import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type UniqueIdentifier,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { strings } from '@/shared/strings';
import { Button } from '@/shared/ui/Button';
import { Icon } from '@/shared/ui/Icon';
import type { Medicine } from '../model';
import { PillPreview } from './PillPreview';
import styles from './MedicineList.module.css';

interface MedicineListProps {
  medicines: readonly Medicine[];
  onMove: (from: number, to: number) => void;
  onEdit: (medicine: Medicine) => void;
  onRemove: (medicine: Medicine) => void;
}

export function scheduleSummary(medicine: Medicine): string {
  return medicine.prn
    ? strings.list.prnSummary(medicine.prnMaxPerDay)
    : strings.list.schedule(medicine.times.map((slot) => strings.slots[slot]));
}

export function MedicineList({ medicines, onMove, onEdit, onRemove }: MedicineListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const indexOf = (id: UniqueIdentifier) => medicines.findIndex((m) => m.id === id);
  const nameOf = (id: UniqueIdentifier) => medicines[indexOf(id)]?.name ?? '';
  const total = medicines.length;

  const announcements: Announcements = {
    onDragStart: ({ active }) => strings.list.pickedUp(nameOf(active.id)),
    onDragOver: ({ active, over }) =>
      over ? strings.list.movedTo(nameOf(active.id), indexOf(over.id) + 1, total) : undefined,
    onDragEnd: ({ active, over }) =>
      over ? strings.list.dropped(nameOf(active.id), indexOf(over.id) + 1, total) : undefined,
    onDragCancel: ({ active }) => strings.list.cancelled(nameOf(active.id)),
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    onMove(indexOf(active.id), indexOf(over.id));
  };

  return (
    <section aria-labelledby="medicine-list-heading">
      <h2 id="medicine-list-heading" className={styles.heading}>
        {strings.list.heading} ({total})
      </h2>
      {total === 0 ? (
        <p className={styles.empty}>{strings.list.empty}</p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          accessibility={{
            announcements,
            screenReaderInstructions: { draggable: strings.list.dragInstructions },
          }}
        >
          <SortableContext
            items={medicines.map((m) => m.id)}
            strategy={verticalListSortingStrategy}
          >
            <ol className={styles.list}>
              {medicines.map((medicine) => (
                <SortableItem
                  key={medicine.id}
                  medicine={medicine}
                  onEdit={onEdit}
                  onRemove={onRemove}
                />
              ))}
            </ol>
          </SortableContext>
        </DndContext>
      )}
    </section>
  );
}

interface SortableItemProps {
  medicine: Medicine;
  onEdit: (medicine: Medicine) => void;
  onRemove: (medicine: Medicine) => void;
}

function SortableItem({ medicine, onEdit, onRemove }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: medicine.id });

  return (
    <li
      ref={setNodeRef}
      className={`${styles.item} ${isDragging ? styles.dragging : ''}`}
      style={{ transform: CSS.Translate.toString(transform), transition }}
    >
      <button
        ref={setActivatorNodeRef}
        type="button"
        className={styles.handle}
        aria-label={strings.list.reorder(medicine.name)}
        {...attributes}
        {...listeners}
      >
        <Icon name="grip" />
      </button>
      <PillPreview pill={medicine.pill} size={36} />
      <div>
        <p className={styles.name}>
          {medicine.name} {medicine.strength}
        </p>
        <p className={styles.summary}>{scheduleSummary(medicine)}</p>
      </div>
      <div className={styles.actions}>
        <Button variant="quiet" icon="edit" onClick={() => onEdit(medicine)}>
          <span className="visually-hidden">{medicine.name}: </span>
          <span className={styles.actionText}>{strings.list.edit}</span>
        </Button>
        <Button variant="quiet" icon="remove" onClick={() => onRemove(medicine)}>
          <span className="visually-hidden">{medicine.name}: </span>
          <span className={styles.actionText}>{strings.list.remove}</span>
        </Button>
      </div>
    </li>
  );
}
