import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WUIDataTable, createDataTableColumns } from '../wui-data-table.component';

type Row = { name: string; email: string };

const helper = createDataTableColumns<Row>();
const columns = helper.columns([
  helper.accessor((r) => r.name, { id: 'name', header: 'Name' }),
  helper.accessor((r) => r.email, { id: 'email', header: 'Email' }),
]);

const DATA: Row[] = [
  { name: 'Amina', email: 'amina@example.com' },
  { name: 'Zawadi', email: 'zawadi@example.com' },
  { name: 'Baraka', email: 'baraka@example.com' },
];

describe('WUIDataTable', () => {
  it('renders headers and rows', () => {
    render(<WUIDataTable data={DATA} columns={columns} />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Amina')).toBeInTheDocument();
    expect(screen.getByText('zawadi@example.com')).toBeInTheDocument();
  });

  // Loading, empty and failed all used to render as a blank table, which reads
  // to an admin as "the data is gone".
  describe('distinguishes its three empty-ish states', () => {
    it('shows a loading state', () => {
      render(<WUIDataTable data={[]} columns={columns} isLoading />);
      expect(screen.getByText(/Loading/)).toBeInTheDocument();
    });

    it('shows an empty state with the given message', () => {
      render(
        <WUIDataTable data={[]} columns={columns} emptyMessage="No users yet." />
      );
      expect(screen.getByText('No users yet.')).toBeInTheDocument();
    });

    it('shows an error, not an empty table, when loading failed', () => {
      render(
        <WUIDataTable data={[]} columns={columns} error="Network unreachable" />
      );
      expect(screen.getByText('Network unreachable')).toBeInTheDocument();
      expect(screen.queryByText(/Nothing to show/)).not.toBeInTheDocument();
    });

    it('offers a retry when one is supplied', async () => {
      const onRetry = jest.fn();
      const user = userEvent.setup();
      render(
        <WUIDataTable data={[]} columns={columns} error="Boom" onRetry={onRetry} />
      );
      await user.click(screen.getByText('Try again'));
      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('prefers the error over the loading state once loading finishes', () => {
      render(<WUIDataTable data={[]} columns={columns} error="Boom" />);
      expect(screen.queryByText(/Loading/)).not.toBeInTheDocument();
    });
  });

  describe('search', () => {
    it('filters rows and reports the count', async () => {
      const user = userEvent.setup();
      render(<WUIDataTable data={DATA} columns={columns} />);
      await user.type(screen.getByLabelText('Search…'), 'Amina');
      expect(screen.getByText('Amina')).toBeInTheDocument();
      expect(screen.queryByText('Zawadi')).not.toBeInTheDocument();
      expect(screen.getByText('1 of 3 rows')).toBeInTheDocument();
    });

    it('explains a no-match search rather than looking empty', async () => {
      const user = userEvent.setup();
      render(<WUIDataTable data={DATA} columns={columns} />);
      await user.type(screen.getByLabelText('Search…'), 'zzzz');
      expect(screen.getByText(/No results for/)).toBeInTheDocument();
    });

    it('can be hidden for short fixed lists', () => {
      render(<WUIDataTable data={DATA} columns={columns} enableSearch={false} />);
      expect(screen.queryByLabelText('Search…')).not.toBeInTheDocument();
    });
  });

  describe('sorting', () => {
    it('exposes a labelled sort control per column', () => {
      render(<WUIDataTable data={DATA} columns={columns} />);
      expect(screen.getByLabelText('Sort by name')).toBeInTheDocument();
    });

    it('reorders rows when a header is clicked', async () => {
      const user = userEvent.setup();
      render(<WUIDataTable data={DATA} columns={columns} />);
      await user.click(screen.getByLabelText('Sort by name'));
      const cells = screen.getAllByRole('cell').map((c) => c.textContent);
      expect(cells[0]).toBe('Amina');
    });
  });

  describe('pagination', () => {
    const many = Array.from({ length: 25 }, (_, i) => ({
      name: `User ${i}`,
      email: `u${i}@example.com`,
    }));

    it('is hidden when everything fits on one page', () => {
      render(<WUIDataTable data={DATA} columns={columns} pageSize={10} />);
      expect(screen.queryByText('Next')).not.toBeInTheDocument();
    });

    it('paginates and moves between pages', async () => {
      const user = userEvent.setup();
      render(<WUIDataTable data={many} columns={columns} pageSize={10} />);
      expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
      await user.click(screen.getByText('Next'));
      expect(screen.getByText('Page 2 of 3')).toBeInTheDocument();
    });

    it('disables Previous on the first page', () => {
      render(<WUIDataTable data={many} columns={columns} pageSize={10} />);
      expect(screen.getByText('Previous')).toBeDisabled();
    });
  });

  it('calls onRowClick with the original row', async () => {
    const onRowClick = jest.fn();
    const user = userEvent.setup();
    render(<WUIDataTable data={DATA} columns={columns} onRowClick={onRowClick} />);
    await user.click(screen.getByText('Amina'));
    expect(onRowClick).toHaveBeenCalledWith(DATA[0]);
  });
});
