'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createSite } from '@/app/actions/site';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { rootDomain } from '@/lib/utils';

type SiteData = { id: string } | null | undefined;

export function CreateSiteForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(createSite, null);

  // Redirect on success
  useEffect(() => {
    const siteData = state?.data as SiteData;
    if (state?.success && siteData?.id) {
      router.push(`/app/site/${siteData.id}`);
    }
  }, [state?.success, state?.data, router]);

  // Generate subdomain from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const subdomainInput = document.getElementById('subdomain') as HTMLInputElement;
    if (subdomainInput && !subdomainInput.dataset.manual) {
      subdomainInput.value = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 30);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Site Details</CardTitle>
        <CardDescription>
          Choose a name and subdomain for your site.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          {/* Site Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Site Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g., My Awesome Store"
              onChange={handleNameChange}
              minLength={3}
              required
            />
            <p className="text-xs text-muted-foreground">
              This will be displayed as your site title.
            </p>
          </div>

          {/* Subdomain */}
          <div className="space-y-2">
            <Label htmlFor="subdomain">Subdomain</Label>
            <div className="flex items-center">
              <Input
                id="subdomain"
                name="subdomain"
                placeholder="my-store"
                pattern="^[a-z0-9-]+$"
                minLength={3}
                maxLength={30}
                onInput={(e) => {
                  (e.target as HTMLInputElement).dataset.manual = 'true';
                }}
                className="rounded-r-none"
                required
              />
              <span className="inline-flex items-center px-3 h-9 border border-l-0 rounded-r-md bg-muted text-muted-foreground text-sm">
                .{rootDomain}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Only lowercase letters, numbers, and hyphens. 3-30 characters.
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="description"
              name="description"
              placeholder="A short description of your site"
            />
          </div>

          {/* Error Display */}
          {state?.error && (
            <div className="text-sm text-destructive bg-destructive/10 px-4 py-3 rounded-md">
              {typeof state.error === 'string'
                ? state.error
                : (state.error as Array<{ message: string }>).map((e) => e.message).join(', ')}
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="flex-1">
              {isPending ? 'Creating...' : 'Create Site'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
