import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { emptyPlan } from '@/features/medicines';
import { testCatalog } from '@/test/catalog';
import { App } from './App';
import type { Startup } from './startup';

const today = new Date(2026, 10, 2);

function startup(patch: Partial<Startup> = {}): Startup {
  return {
    today,
    storage: window.localStorage,
    plan: emptyPlan('2026-11-02'),
    lang: 'en',
    invalidSaved: false,
    example: false,
    counsel: false,
    ...patch,
  };
}

async function addFromSearch(
  user: ReturnType<typeof userEvent.setup>,
  query: string,
  optionName: RegExp,
) {
  await user.type(screen.getByRole('combobox', { name: 'Find a medicine' }), query);
  await user.click(screen.getByRole('option', { name: optionName }));
  await user.click(screen.getByRole('button', { name: 'Add to chart' }));
}

const chart = () => screen.getByRole('article', { name: 'Medicine chart' });

describe('PillPlan app', () => {
  it('adds a medicine from the search to the chart', async () => {
    const user = userEvent.setup();
    render(<App startup={startup()} catalog={testCatalog} />);

    expect(within(chart()).getByText('The chart is empty')).toBeInTheDocument();
    await addFromSearch(user, 'metf', /^Metformin/);

    const row = within(chart()).getByRole('rowheader', { name: /Metformin/ });
    expect(row).toHaveTextContent('500 mg');
    expect(within(chart()).getAllByText('tablet')).toHaveLength(2);
    expect(screen.getByRole('heading', { name: 'Medicines on the chart (1)' })).toBeInTheDocument();
  });

  it('shows safety notes for hidden paracetamol and lets the user undo a removal', async () => {
    const user = userEvent.setup();
    render(<App startup={startup()} catalog={testCatalog} />);

    await addFromSearch(user, 'paracetamol (', /^Paracetamol \(acetaminophen\)/);
    await addFromSearch(user, 'panadol extra', /Panadol Extra/);

    const notes = screen.getByRole('region', { name: /Safety notes/ });
    expect(within(notes).getByText('Paracetamol is in 2 medicines')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Paracetamol \+ caffeine:\s*Remove/ }));
    expect(screen.getByRole('heading', { name: 'Medicines on the chart (1)' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Undo' }));
    expect(screen.getByRole('heading', { name: 'Medicines on the chart (2)' })).toBeInTheDocument();
  });

  it('adds a custom medicine marked as not checked', async () => {
    const user = userEvent.setup();
    render(<App startup={startup()} catalog={testCatalog} />);

    await user.type(screen.getByRole('combobox', { name: 'Find a medicine' }), 'Ginger tea');
    await user.click(screen.getByRole('option', { name: /Add "Ginger tea"/ }));
    await user.click(screen.getByRole('button', { name: 'Add to chart' }));

    expect(screen.getByText('Ginger tea is not in the drug list')).toBeInTheDocument();
  });

  it('asks for a time before adding', async () => {
    const user = userEvent.setup();
    render(<App startup={startup()} catalog={testCatalog} />);

    await user.type(screen.getByRole('combobox', { name: 'Find a medicine' }), 'amlo');
    await user.click(screen.getByRole('option', { name: /^Amlodipine/ }));
    await user.click(screen.getByRole('checkbox', { name: 'Morning' }));
    await user.click(screen.getByRole('button', { name: 'Add to chart' }));

    expect(screen.getByText('Choose at least one time, or "When needed".')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Medicines on the chart (0)' })).toBeInTheDocument();
  });

  it('loads the example and steps through counseling mode', async () => {
    const user = userEvent.setup();
    render(<App startup={startup({ example: true, counsel: true })} catalog={testCatalog} />);

    const dialog = await screen.findByRole('dialog', { name: 'Counseling mode' });
    expect(within(dialog).getByText('Medicine 1 of 4')).toBeInTheDocument();
    expect(within(dialog).getByRole('heading', { name: /Metformin/ })).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: 'Next' }));
    expect(within(dialog).getByText('Medicine 2 of 4')).toBeInTheDocument();
    await user.keyboard('{ArrowRight}{ArrowRight}');
    expect(within(dialog).getByText('Medicine 4 of 4')).toBeInTheDocument();
    expect(within(dialog).getByText(/No more than 4 times a day/)).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: 'Done' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('pops tracker bubbles and saves them', async () => {
    const user = userEvent.setup();
    render(<App startup={startup({ example: true })} catalog={testCatalog} />);

    const bubble = await screen.findByRole('button', {
      name: /Tuesday, November 3, Evening: not taken yet/,
    });
    await user.click(bubble);
    expect(
      screen.getByRole('button', { name: /Tuesday, November 3, Evening: taken/ }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(window.localStorage.getItem('pillplan:plan')).toContain('d1-evening');
  });

  it('highlights one time of day', async () => {
    const user = userEvent.setup();
    render(<App startup={startup({ example: true })} catalog={testCatalog} />);

    const bedtime = await screen.findByRole('button', { name: /^Bedtime/, pressed: false });
    await user.click(bedtime);
    expect(
      within(chart()).getByRole('table', { name: 'When to take each medicine' }),
    ).toHaveAttribute('data-spot', 'bedtime');
  });

  it('stops saving when "Remember on this device" is turned off', async () => {
    const user = userEvent.setup();
    render(<App startup={startup({ example: true })} catalog={testCatalog} />);

    await screen.findByRole('rowheader', { name: /Metformin/ });
    expect(window.localStorage.getItem('pillplan:plan')).not.toBeNull();
    await user.click(screen.getByRole('switch', { name: 'Remember on this device' }));
    expect(window.localStorage.getItem('pillplan:plan')).toBeNull();
  });
});
