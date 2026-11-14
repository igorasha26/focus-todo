import { expect, test, type Page } from '@playwright/test';

function taskInput(page: Page) {
  return page.getByRole('textbox', { name: 'Новая задача' });
}

function taskCheckbox(page: Page, title: string) {
  return page.getByRole('checkbox', { name: title, exact: true });
}

function removeButton(page: Page, title: string) {
  return page.getByRole('button', { name: `Удалить задачу «${title}»` });
}

function filterButton(page: Page, name: 'Все задачи' | 'Активные задачи' | 'Выполненные задачи') {
  return page.getByRole('group', { name: 'Фильтр задач' }).getByRole('button', { name });
}

async function addTask(page: Page, title: string) {
  await taskInput(page).fill(title);
  await taskInput(page).press('Enter');
  await expect(taskCheckbox(page, title)).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  // Each test runs in a new browser context, so storage starts empty. On mount the
  // app writes only its defaults; anything else would mean leaked state.
  const storage = await page.evaluate(() => ({ ...localStorage }));
  expect(storage).toEqual({ 'focus-todo:v1': '[]', 'focus-todo:filter': 'all' });
});

test('added task survives a reload', async ({ page }) => {
  await addTask(page, 'Купить молоко');
  await page.reload();
  await expect(taskCheckbox(page, 'Купить молоко')).toBeVisible();
  await expect(page.getByRole('listitem')).toHaveCount(1);
});

test('completed mark survives a reload', async ({ page }) => {
  await addTask(page, 'Сделанная');
  await addTask(page, 'Несделанная');
  await taskCheckbox(page, 'Сделанная').check();

  await page.reload();
  await expect(taskCheckbox(page, 'Сделанная')).toBeChecked();
  await expect(taskCheckbox(page, 'Несделанная')).not.toBeChecked();
  await expect(page.getByText('Вы выполнили 1/2 задач')).toBeVisible();
});

test('removed task stays removed after a reload', async ({ page }) => {
  await addTask(page, 'Удалить меня');
  await addTask(page, 'Оставить');
  await removeButton(page, 'Удалить меня').click();
  await expect(taskCheckbox(page, 'Удалить меня')).toHaveCount(0);

  await page.reload();
  await expect(taskCheckbox(page, 'Удалить меня')).toHaveCount(0);
  await expect(taskCheckbox(page, 'Оставить')).toBeVisible();
});

test('a whitespace-only title cannot be added', async ({ page }) => {
  await taskInput(page).fill('     ');
  await expect(page.getByRole('button', { name: 'Добавить задачу' })).toBeDisabled();
  await taskInput(page).press('Enter');

  await expect(page.getByRole('listitem')).toHaveCount(0);
  await expect(page.getByText('Задач пока нет — добавьте первую')).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('focus-todo:v1'))).toBe('[]');
});

test('selected filter survives a reload', async ({ page }) => {
  await addTask(page, 'Активная');
  await addTask(page, 'Выполненная');
  await taskCheckbox(page, 'Выполненная').check();
  await filterButton(page, 'Выполненные задачи').click();
  await expect(filterButton(page, 'Выполненные задачи')).toHaveAttribute('aria-pressed', 'true');

  await page.reload();
  await expect(filterButton(page, 'Выполненные задачи')).toHaveAttribute('aria-pressed', 'true');
  await expect(filterButton(page, 'Все задачи')).toHaveAttribute('aria-pressed', 'false');
  await expect(taskCheckbox(page, 'Выполненная')).toBeVisible();
  await expect(taskCheckbox(page, 'Активная')).toHaveCount(0);
});

test('chosen theme survives a reload', async ({ page }) => {
  const html = page.locator('html');
  // System theme is light (colorScheme in config): no explicit choice yet.
  await expect(html).not.toHaveAttribute('data-theme');

  await page.getByRole('button', { name: 'Включить тёмную тему' }).click();
  await expect(html).toHaveAttribute('data-theme', 'dark');

  await page.reload();
  await expect(html).toHaveAttribute('data-theme', 'dark');
  await expect(page.getByRole('button', { name: 'Включить светлую тему' })).toBeVisible();
});

test('keyboard: focus on load, Tab reaches the delete button, Enter removes the task', async ({ page }) => {
  await expect(taskInput(page)).toBeFocused();

  await page.keyboard.type('С клавиатуры');
  await page.keyboard.press('Enter');
  await expect(taskCheckbox(page, 'С клавиатуры')).toBeVisible();
  await expect(taskInput(page)).toBeFocused();

  // «Добавить» and «Очистить выполненные» are disabled now, so Tab skips them.
  await page.keyboard.press('Tab');
  await expect(taskCheckbox(page, 'С клавиатуры')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(removeButton(page, 'С клавиатуры')).toBeFocused();

  await page.keyboard.press('Enter');
  await expect(taskCheckbox(page, 'С клавиатуры')).toHaveCount(0);
  await expect(taskInput(page)).toBeFocused();
});
