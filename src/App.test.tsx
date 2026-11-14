import { render, screen, within, type RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FILTER_STORAGE_KEY, STORAGE_KEY } from './lib/storage';
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
    expect(screen.queryByRole('checkbox', { name: 'Купить молоко' })).not.toBeInTheDocument();
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

type User = ReturnType<typeof userEvent.setup>;

async function addTasks(user: User, titles: string[]): Promise<void> {
  const input = screen.getByRole('textbox', { name: 'Новая задача' });
  for (const title of titles) {
    await user.type(input, `${title}{Enter}`);
  }
}

function visibleTitles(): string[] {
  return screen.queryAllByRole('listitem').map((item) => item.textContent ?? '');
}

function filterButton(name: 'Все задачи' | 'Активные задачи' | 'Выполненные задачи'): HTMLElement {
  return within(screen.getByRole('group', { name: 'Фильтр задач' })).getByRole('button', { name });
}

function renderApp(): { user: User } & RenderResult {
  const user = userEvent.setup();
  return { user, ...render(<App />) };
}

describe('App: filters', () => {
  it('renders the filter group with "all" pressed by default', () => {
    renderApp();
    expect(filterButton('Все задачи')).toHaveAttribute('aria-pressed', 'true');
    expect(filterButton('Активные задачи')).toHaveAttribute('aria-pressed', 'false');
    expect(filterButton('Выполненные задачи')).toHaveAttribute('aria-pressed', 'false');
  });

  it('filters tasks by status', async () => {
    const { user } = renderApp();
    await addTasks(user, ['Первая', 'Вторая', 'Третья']);
    await user.click(screen.getByRole('checkbox', { name: 'Вторая' }));

    await user.click(filterButton('Активные задачи'));
    expect(filterButton('Активные задачи')).toHaveAttribute('aria-pressed', 'true');
    expect(filterButton('Все задачи')).toHaveAttribute('aria-pressed', 'false');
    expect(visibleTitles()).toEqual(['Третья', 'Первая']);

    await user.click(filterButton('Выполненные задачи'));
    expect(visibleTitles()).toEqual(['Вторая']);

    await user.click(filterButton('Все задачи'));
    expect(visibleTitles()).toEqual(['Третья', 'Вторая', 'Первая']);
  });

  it('keeps the selected filter after a reload', async () => {
    const { user, unmount } = renderApp();
    await addTasks(user, ['Активная', 'Готовая']);
    await user.click(screen.getByRole('checkbox', { name: 'Готовая' }));
    await user.click(filterButton('Выполненные задачи'));
    expect(localStorage.getItem(FILTER_STORAGE_KEY)).toBe('completed');
    unmount();

    render(<App />);
    expect(filterButton('Выполненные задачи')).toHaveAttribute('aria-pressed', 'true');
    expect(visibleTitles()).toEqual(['Готовая']);
  });

  it('falls back to "all" for an unknown stored filter', () => {
    localStorage.setItem(FILTER_STORAGE_KEY, 'garbage');
    renderApp();
    expect(filterButton('Все задачи')).toHaveAttribute('aria-pressed', 'true');
  });
});

describe('App: empty states', () => {
  it('shows a filter-specific message', async () => {
    const { user } = renderApp();
    await user.click(filterButton('Активные задачи'));
    expect(screen.getByText('Задач пока нет — добавьте первую')).toBeInTheDocument();

    await addTasks(user, ['Одна']);
    await user.click(filterButton('Выполненные задачи'));
    expect(screen.getByText('Нет выполненных задач')).toBeInTheDocument();

    await user.click(filterButton('Все задачи'));
    await user.click(screen.getByRole('checkbox', { name: 'Одна' }));
    await user.click(filterButton('Активные задачи'));
    expect(screen.getByText('Все задачи выполнены')).toBeInTheDocument();
  });
});

describe('App: summary', () => {
  it('shows 0/0 when there are no tasks', () => {
    renderApp();
    expect(screen.getByText('Вы выполнили 0/0 задач')).toBeInTheDocument();
  });

  it('updates the counter as tasks change', async () => {
    const { user } = renderApp();
    await addTasks(user, ['Раз', 'Два', 'Три']);
    expect(screen.getByText('Вы выполнили 0/3 задач')).toBeInTheDocument();

    await user.click(screen.getByRole('checkbox', { name: 'Раз' }));
    await user.click(screen.getByRole('checkbox', { name: 'Три' }));
    expect(screen.getByText('Вы выполнили 2/3 задач')).toBeInTheDocument();

    await user.click(screen.getByRole('checkbox', { name: 'Три' }));
    expect(screen.getByText('Вы выполнили 1/3 задач')).toBeInTheDocument();
  });

  it('disables "clear completed" when nothing is completed', async () => {
    const { user } = renderApp();
    const clear = screen.getByRole('button', { name: 'Очистить выполненные' });
    expect(clear).toBeDisabled();

    await addTasks(user, ['Задача']);
    expect(clear).toBeDisabled();

    await user.click(screen.getByRole('checkbox', { name: 'Задача' }));
    expect(clear).toBeEnabled();
  });

  it('clears completed tasks and keeps active ones', async () => {
    const { user } = renderApp();
    await addTasks(user, ['Оставить', 'Убрать 1', 'Убрать 2']);
    await user.click(screen.getByRole('checkbox', { name: 'Убрать 1' }));
    await user.click(screen.getByRole('checkbox', { name: 'Убрать 2' }));

    const clear = screen.getByRole('button', { name: 'Очистить выполненные' });
    await user.click(clear);

    expect(visibleTitles()).toEqual(['Оставить']);
    expect(screen.getByText('Вы выполнили 0/1 задач')).toBeInTheDocument();
    expect(clear).toBeDisabled();
    const stored: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    expect(stored).toHaveLength(1);
  });
});

describe('App: theme toggle', () => {
  afterEach(() => {
    delete document.documentElement.dataset.theme;
  });

  it('switches the theme from the header button and remembers it', async () => {
    const { user } = renderApp();
    await user.click(screen.getByRole('button', { name: 'Включить тёмную тему' }));
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(screen.getByRole('button', { name: 'Включить светлую тему' })).toBeInTheDocument();
    expect(localStorage.getItem('focus-todo:theme')).toBe('dark');
  });
});

describe('App: keyboard focus', () => {
  const removeButton = (title: string) => screen.getByRole('button', { name: `Удалить задачу «${title}»` });
  const taskInput = () => screen.getByRole('textbox', { name: 'Новая задача' });

  it('focuses the task input on load', () => {
    renderApp();
    expect(taskInput()).toHaveFocus();
  });

  it('keeps focus in the input after adding via Enter or the button', async () => {
    const { user } = renderApp();
    await user.type(taskInput(), 'Через Enter{Enter}');
    expect(taskInput()).toHaveFocus();

    await user.type(taskInput(), 'Через кнопку');
    await user.click(screen.getByRole('button', { name: 'Добавить задачу' }));
    expect(taskInput()).toHaveFocus();
  });

  // Tasks are prepended, so adding А, Б, В renders them as В, Б, А.
  it('moves focus to the next task’s delete button after removing', async () => {
    const { user } = renderApp();
    await addTasks(user, ['А', 'Б', 'В']);
    await user.click(removeButton('В'));
    expect(removeButton('Б')).toHaveFocus();
  });

  it('moves focus to the previous task’s delete button when removing the last one', async () => {
    const { user } = renderApp();
    await addTasks(user, ['А', 'Б', 'В']);
    await user.click(removeButton('А'));
    expect(removeButton('Б')).toHaveFocus();
  });

  it('moves focus to the input when the only task is removed', async () => {
    const { user } = renderApp();
    await addTasks(user, ['Единственная']);
    await user.click(removeButton('Единственная'));
    expect(taskInput()).toHaveFocus();
  });

  it('works with the keyboard: Enter on a focused delete button', async () => {
    const { user } = renderApp();
    await addTasks(user, ['А', 'Б']);
    removeButton('Б').focus();
    await user.keyboard('{Enter}');
    expect(removeButton('А')).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(taskInput()).toHaveFocus();
  });

  it('moves focus to the input after clearing completed tasks', async () => {
    const { user } = renderApp();
    await addTasks(user, ['Готово', 'Не готово']);
    await user.click(screen.getByRole('checkbox', { name: 'Готово' }));
    await user.click(screen.getByRole('button', { name: 'Очистить выполненные' }));
    expect(taskInput()).toHaveFocus();
  });
});
