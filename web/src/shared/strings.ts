/**
 * Every piece of interface text lives here, so the app can be translated
 * in one place. Plain words, numbers as digits, no dashes as punctuation.
 */
import type { FoodRule, TimeSlot } from '@/shared/domain/time';

const list = (items: readonly string[]): string =>
  items.length <= 1
    ? (items[0] ?? '')
    : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1] ?? ''}`;

export const strings = {
  app: {
    name: 'PillPlan',
    tagline: 'Turn a list of medicines into a clear chart a patient can follow.',
    counsel: 'Counseling mode',
    print: 'Print chart',
    example: 'Try an example patient',
    repo: 'Source code and documentation',
    disclaimer:
      'PillPlan helps people remember how to take their medicines. It does not replace advice from a doctor or pharmacist.',
    dataNote:
      'Starter drug data comes from US FDA labels. Check it against your own formulary before real use.',
    privacy: 'Everything stays in this browser. Nothing is uploaded.',
  },
  slots: {
    morning: 'Morning',
    noon: 'Noon',
    evening: 'Evening',
    bedtime: 'Bedtime',
  } satisfies Record<TimeSlot, string>,
  whenNeeded: 'When needed',
  food: {
    before: 'Before food',
    with_after: 'With or after food',
    any: 'With or without food',
  } satisfies Record<FoodRule, string>,
  foodLong: {
    before: 'Take before food, on an empty stomach.',
    with_after: 'Take with food or just after eating.',
    any: 'Take with or without food.',
  } satisfies Record<FoodRule, string>,
  patient: {
    heading: 'Patient',
    nameLabel: 'Patient name',
    nameHint: 'Optional. Leave it blank on a shared computer.',
  },
  search: {
    label: 'Find a medicine',
    placeholder: 'Generic or brand name',
    hint: 'Not in the list? Type the name and choose to add it as a custom medicine.',
    loading: 'Loading the drug list',
    listLabel: 'Matching medicines',
    addCustom: (name: string) => `Add "${name}" as a custom medicine`,
    customNote: 'Not checked by PillPlan',
    matches: (count: number) => (count === 1 ? '1 match' : `${count} matches`),
    strengths: (labels: readonly string[]) => list(labels),
  },
  form: {
    addHeading: (name: string) => `Add ${name}`,
    editHeading: (name: string) => `Edit ${name}`,
    name: 'Medicine name',
    strength: 'Strength',
    strengthCustomHint: 'For example 5 mg, or 125 mg in 5 mL.',
    amount: 'Amount each time',
    less: 'Less',
    more: 'More',
    form: 'Form',
    forms: { tablet: 'Tablet', capsule: 'Capsule', mL: 'Liquid (mL)', puff: 'Puff', drop: 'Drop' },
    when: 'When to take it',
    whenNeededHint: 'Only when the patient needs it, for example for pain.',
    maxPerDay: 'Most times a day',
    food: 'Food',
    warnings: 'Warning stickers',
    purpose: 'What it is for',
    purposeHint: 'Plain words, for example "for blood pressure".',
    advice: 'Note for the patient',
    pillLook: 'How the pill looks',
    shape: 'Shape',
    shapes: { round: 'Round', oval: 'Oval', capsule: 'Capsule' },
    color: 'Color',
    add: 'Add to chart',
    save: 'Save changes',
    cancel: 'Cancel',
    errors: {
      name: 'Enter the medicine name.',
      amount: 'Enter an amount above zero.',
      times: 'Choose at least one time, or "When needed".',
      maxPerDay: 'Enter how many times a day, from 1 to 24.',
    },
  },
  list: {
    heading: 'Medicines on the chart',
    empty: 'No medicines yet. Find one above to start.',
    edit: 'Edit',
    remove: 'Remove',
    reorder: (name: string) => `Move ${name}`,
    removed: (name: string) => `${name} removed.`,
    undo: 'Undo',
    schedule: (times: readonly string[]) => list(times),
    prnSummary: (max: number | null) =>
      max ? `When needed, at most ${max} times a day` : 'When needed',
    dragInstructions:
      'To move a medicine, press Space or Enter on its handle, use the arrow keys, then press Space or Enter again. Press Escape to cancel.',
    pickedUp: (name: string) => `Picked up ${name}.`,
    movedTo: (name: string, position: number, total: number) =>
      `${name} is now number ${position} of ${total}.`,
    dropped: (name: string, position: number, total: number) =>
      `${name} placed at number ${position} of ${total}.`,
    cancelled: (name: string) => `Moving ${name} was cancelled.`,
  },
  chart: {
    heading: 'Medicine chart',
    patient: 'Patient',
    date: 'Date',
    medicine: 'Medicine',
    caption: 'When to take each medicine',
    none: 'None',
    whenNeededHeading: 'When needed',
    prnLine: (dose: string, max: number | null) =>
      max ? `Take ${dose}. No more than ${max} times a day.` : `Take ${dose} when needed.`,
    emptyTitle: 'The chart is empty',
    emptyBody: 'Add a medicine on the left and it appears here straight away.',
    spotlightLabel: 'Highlight one time of day',
    medicinesAt: (count: number) => (count === 1 ? '1 medicine' : `${count} medicines`),
    footer: 'Bring this chart to every doctor and pharmacy visit.',
  },
  tracker: {
    heading: '7-day tracker',
    hint: 'Tap a bubble each time the doses are taken.',
    reset: 'Start a new week',
    bubble: (day: string, slot: string, taken: boolean) =>
      `${day}, ${slot}: ${taken ? 'taken' : 'not taken yet'}`,
  },
  counsel: {
    title: 'Counseling mode',
    progress: (index: number, total: number) => `Medicine ${index} of ${total}`,
    whatFor: 'What it is for',
    when: 'When to take it',
    how: 'How to take it',
    warnings: 'Remember',
    note: 'Note',
    back: 'Back',
    next: 'Next',
    done: 'Done',
    close: 'Close',
    at: (slot: string, dose: string) => `${slot}: ${dose}`,
  },
  safety: {
    heading: 'Safety notes',
    none: 'No issues found by the checks PillPlan can do.',
    noneDetail:
      'PillPlan checks daily totals, duplicates and time of day. It does not check interactions.',
    maxDailyTitle: (ingredient: string, total: string) => `${ingredient}: ${total} a day`,
    maxDailyDetail: (max: string) =>
      `This is above the usual maximum of ${max} a day. Check with your pharmacist.`,
    duplicateIngredientTitle: (ingredient: string, count: number) =>
      `${ingredient} is in ${count} medicines`,
    duplicateIngredientDetail: (names: readonly string[], ingredient: string) =>
      `${list(names)} all contain ${ingredient}. Taking them together can add up to too much. Check with your pharmacist.`,
    duplicateClassTitle: (drugClass: string) => `Two or more from one group: ${drugClass}`,
    duplicateClassDetail: (names: readonly string[]) =>
      `${list(names)} work in the same way. This is usually not intended. Check with your pharmacist.`,
    timingTitle: (name: string) => `${name}: check the time of day`,
    uncheckedTitle: (name: string) => `${name} is not in the drug list`,
    uncheckedDetail: 'PillPlan cannot check the dose, duplicates or timing for this medicine.',
  },
  storage: {
    heading: 'Save and share',
    remember: 'Remember on this device',
    rememberHint: 'Turn off on a shared computer. Saved data is then removed.',
    unavailable: 'This browser is not letting PillPlan save. Use Export to keep a copy.',
    export: 'Export file',
    import: 'Import file',
    clear: 'Clear all data',
    clearTitle: 'Clear all data?',
    clearBody: 'This removes every medicine, the tracker and the patient name from this device.',
    clearConfirm: 'Yes, clear everything',
    imported: 'Chart imported.',
    importFailed: 'That file is not a PillPlan chart.',
    invalidSaved: 'Saved data could not be read, so PillPlan started a new chart.',
    cleared: 'All data cleared.',
  },
} as const;
