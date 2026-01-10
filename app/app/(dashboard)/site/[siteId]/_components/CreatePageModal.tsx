'use client';

import { useActionState, useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { createPage } from '@/app/actions/page';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface CreatePageModalProps {
  siteId: string;
}

export function CreatePageModal({ siteId }: CreatePageModalProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(createPage, null);

  // Close modal on success
  useEffect(() => {
    if (state?.success) {
      setOpen(false);
    }
  }, [state?.success]);

  // Generate slug from title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const slugInput = document.getElementById('slug') as HTMLInputElement;
    if (slugInput && !slugInput.dataset.manual) {
      slugInput.value = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 100);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Page
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Page</DialogTitle>
          <DialogDescription>
            Add a new page to your site. You can edit the content after creating it.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="siteId" value={siteId} />

          <div className="space-y-2">
            <Label htmlFor="title">Page Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="e.g., About Us"
              onChange={handleTitleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">URL Slug</Label>
            <Input
              id="slug"
              name="slug"
              placeholder="e.g., about-us"
              pattern="^[a-z0-9-]+$"
              onInput={(e) => {
                (e.target as HTMLInputElement).dataset.manual = 'true';
              }}
              required
            />
            <p className="text-xs text-muted-foreground">
              Only lowercase letters, numbers, and hyphens allowed.
            </p>
          </div>

          {/* Error Display */}
          {state?.error && (
            <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
              {typeof state.error === 'string'
                ? state.error
                : state.error.map((e) => e.message).join(', ')}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Creating...' : 'Create Page'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
