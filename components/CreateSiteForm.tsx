'use client';

import { useActionState } from 'react';
import { createSite } from '@/app/actions/site';

export function CreateSiteForm() {
  const [state, formAction, isPending] = useActionState(createSite, null);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="name">Site Name</label>
        <input name="name" id="name" required minLength={3} />
      </div>
      <div>
        <label htmlFor="subdomain">Subdomain</label>
        <input name="subdomain" id="subdomain" required minLength={3} maxLength={30} />
      </div>
      <div>
        <label htmlFor="description">Description (optional)</label>
        <textarea name="description" id="description" />
      </div>
      <button type="submit" disabled={isPending}>
        {isPending ? 'Creating...' : 'Create Site'}
      </button>
      
      {state?.error && <p className="text-red-500">{JSON.stringify(state.error)}</p>}
      {state?.success && <p className="text-green-500">Site created! {JSON.stringify(state.data)}</p>}
    </form>
  );
}