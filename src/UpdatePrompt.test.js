import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SW_UPDATE_STATUS as S, createUpdateController } from './swUpdate';
import { UpdatePrompt, mountUpdatePrompt } from './UpdatePrompt';

// The prompt's behaviour against a real update controller driven by fake worker objects.

const worker = () => { const w = new EventTarget(); w.state = 'installed'; w.postMessage = jest.fn(); return w; };
const container = () => { const c = new EventTarget(); c.controller = {}; c.changeController = () => { c.dispatchEvent(new Event('controllerchange')); }; return c; };
const make = () => {
  const sw = container();
  const reload = jest.fn();
  const controller = createUpdateController({ serviceWorker: sw, document: new EventTarget(), storage: null, reload, isOnline: () => true, logger: { debug: jest.fn() } });
  const waiting = worker();
  const registration = Object.assign(new EventTarget(), { waiting, installing: null, update: jest.fn(() => Promise.resolve()) });
  return { sw, reload, controller, waiting, registration };
};

test('nothing is rendered while there is no update', () => {
  const { controller } = make();
  render(<UpdatePrompt controller={controller} />);
  expect(screen.queryByTestId('sw-update-prompt')).toBeNull();
});

test('an available update shows an accessible polite status with "New version available —" and a Refresh button', () => {
  const { controller, registration } = make();
  render(<UpdatePrompt controller={controller} />);
  act(() => controller.attach(registration));
  const box = screen.getByRole('status');
  expect(box).toHaveAttribute('aria-live', 'polite');
  expect(box).toHaveTextContent('New version available —');
  const refresh = screen.getByRole('button', { name: 'Refresh' });
  expect(refresh).toBeEnabled();
  expect(screen.getByRole('button', { name: 'Dismiss update notice' })).toBeInTheDocument();
});

test('only the visitor\'s click activates the waiting worker; nothing is activated by merely showing the prompt', () => {
  const { controller, registration, waiting, reload } = make();
  render(<UpdatePrompt controller={controller} />);
  act(() => controller.attach(registration));
  expect(waiting.postMessage).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));
  expect(waiting.postMessage).toHaveBeenCalledTimes(1);
  expect(waiting.postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' });
  expect(reload).not.toHaveBeenCalled();
  expect(controller.getState().status).toBe(S.APPLYING);
});

test('while applying the button is disabled and says "Updating…"; after the controller changes the page reloads once', () => {
  const { controller, registration, sw, reload } = make();
  render(<UpdatePrompt controller={controller} />);
  act(() => controller.attach(registration));
  fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));
  const busy = screen.getByRole('button', { name: 'Updating…' });
  expect(busy).toBeDisabled();
  act(() => sw.changeController());
  expect(reload).toHaveBeenCalledTimes(1);
});

test('an update that could not be applied explains itself in an alert and offers Refresh again', () => {
  jest.useFakeTimers();
  try {
    const { controller, registration, waiting } = make();
    render(<UpdatePrompt controller={controller} />);
    act(() => controller.attach(registration));
    fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));
    act(() => { jest.advanceTimersByTime(9000); });
    expect(screen.getByRole('alert')).toHaveTextContent(/close other tabs/i);
    const retry = screen.getByRole('button', { name: 'Refresh' });
    expect(retry).toBeEnabled();
    fireEvent.click(retry);
    expect(waiting.postMessage).toHaveBeenCalledTimes(2);
  } finally { jest.useRealTimers(); }
});

test('the prompt can be dismissed, and is keyboard reachable in a sensible order (Refresh, then Dismiss)', () => {
  const { controller, registration } = make();
  render(<UpdatePrompt controller={controller} />);
  act(() => controller.attach(registration));
  userEvent.tab();
  expect(screen.getByRole('button', { name: 'Refresh' })).toHaveFocus();
  userEvent.tab();
  expect(screen.getByRole('button', { name: 'Dismiss update notice' })).toHaveFocus();
  fireEvent.click(screen.getByRole('button', { name: 'Dismiss update notice' }));
  expect(screen.queryByTestId('sw-update-prompt')).toBeNull();
});

test('another tab updated: the prompt asks this tab to refresh and the click reloads (no worker message needed)', () => {
  const { controller, registration, sw, reload, waiting } = make();
  render(<UpdatePrompt controller={controller} />);
  act(() => controller.attach(registration));
  act(() => sw.changeController());
  expect(controller.getState().status).toBe(S.STALE);
  expect(reload).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));
  expect(reload).toHaveBeenCalledTimes(1);
  expect(waiting.postMessage).not.toHaveBeenCalled();
});

test('mountUpdatePrompt renders into its own root outside the application tree', async () => {
  const { controller, registration } = make();
  let host;
  await act(async () => { host = mountUpdatePrompt(controller); });
  expect(document.body.contains(host)).toBe(true);
  expect(host.id).toBe('cv-update-prompt-root');
  expect(host.querySelector('[data-testid="sw-update-prompt"]')).toBeNull();
  await act(async () => { controller.attach(registration); });
  expect(host.querySelector('[data-testid="sw-update-prompt"]')).not.toBeNull();
  host.remove();
});
