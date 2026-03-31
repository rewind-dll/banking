import { useEffect, useRef } from 'react';

const isDebug = typeof (window as any).GetParentResourceName !== 'function';

if (isDebug) {
  document.body.style.background = 'rgba(0, 0, 0, 0.6)';
}

export { isDebug };

export function debugNuiEvent(action: string, data: unknown) {
  window.dispatchEvent(new (window as any).MessageEvent('message', { data: { action, data } }));
}

export function useNuiEvent<T = unknown>(action: string, handler: (data: T) => void) {
  const savedHandler = useRef(handler);
  useEffect(() => { savedHandler.current = handler; }, [handler]);
  useEffect(() => {
    function eventListener(event: any) {
      let payload = event.data;
      if (typeof payload === 'string') { try { payload = JSON.parse(payload); } catch {} }
      const { action: eventAction, data } = payload ?? {};
      if (eventAction === action) savedHandler.current((data ?? {}) as T);
    }
    window.addEventListener('message', eventListener);
    return () => window.removeEventListener('message', eventListener);
  }, [action]);
}

export async function fetchNui<T = unknown>(
  eventName: string,
  data: Record<string, unknown> = {},
  mockData?: T
): Promise<T> {
  if (isDebug && mockData !== undefined) {
    console.log(`[NUI Dev] ${eventName}:`, mockData);
    return mockData;
  }
  if (isDebug) {
    console.warn(`[NUI Dev] No mock for '${eventName}'. Pass mockData as 3rd arg.`);
    return {} as T;
  }
  const resourceName = (window as any).GetParentResourceName();
  const response = await fetch(`https://${resourceName}/${eventName}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

if (isDebug) {
  setTimeout(() => debugNuiEvent('open', {
    player: {
      cash: 5000,
      bank: 25000,
      dirtyMoney: 1500,
      name: 'John Doe',
      identifier: 'steam:110000123456789'
    },
    societies: [
      { name: 'Police Department', jobName: 'police', balance: 150000, isBoss: true, canWithdraw: true },
      { name: 'EMS', jobName: 'ambulance', balance: 85000, isBoss: false, canWithdraw: false }
    ],
    transactions: [
      { id: 1, transaction_type: 'deposit_cash', amount: 1000, timestamp: new Date().toISOString() },
      { id: 2, transaction_type: 'withdraw_cash', amount: 500, timestamp: new Date(Date.now() - 3600000).toISOString() },
      { id: 3, transaction_type: 'transfer_received', amount: 2500, timestamp: new Date(Date.now() - 7200000).toISOString(), target_identifier: 'steam:110000111111111' },
      { id: 4, transaction_type: 'society_deposit', amount: 5000, timestamp: new Date(Date.now() - 86400000).toISOString() }
    ]
  }), 100);
}
