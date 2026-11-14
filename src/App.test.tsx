import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { STORAGE_KEY } from './lib/storage';
import { App } from './App';

describe('App', () => {
  it('shows the heading and the empty state', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: 'Мои задачи' })).toBeInTheDocument();
    expect(screen.getByText('Задач пока нет — добавьте первую')).toBeInTheDocument();
  });

  it('adds, completes and removes a task', async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByRole('textbox', { name: 'Новая задача' });

    // Blank input is not added
    await user.type(input, '   {Enter}');
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();

    // Add via Enter and via the button
    await user.clear(input);
    await user.type(input, 'Купить молоко{Enter}');
    await user.type(input, 'Позвонить маме');
    await user.click(screen.getByRole('button', { name: 'Добавить задачу' }));
    expect(input).toHaveValue('');
    expect(screen.getAllByRole('listitem')).toHaveLength(2);

    // Complete
    const checkbox = screen.getByRole('checkbox', { name: 'Купить молоко' });
    await user.click(checkbox);
    expect(checkbox).toBeChecked();

    // Saved to storage
    const stored: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    expect(stored).toHaveLength(2);

    // Remove
    const item = checkbox.closest('li');
    if (!item) throw new Error('list item not found');
    await user.click(within(item).getByRole('button', { name: 'Удалить задачу «Купить молоко»' }));
    expect(screen.queryByText('Купить молоко')).not.toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
  });

  it('restores tasks from storage after a reload', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);
    await user.type(screen.getByRole('textbox', { name: 'Новая задача' }), 'Сохранится{Enter}');
    unmount();

    render(<App />);
    expect(screen.getByRole('checkbox', { name: 'Сохранится' })).not.toBeChecked();
  });
});
