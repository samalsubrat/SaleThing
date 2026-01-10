'use server';

import { z } from 'zod';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

// Zod schema for page creation validation
const createPageSchema = z.object({
  siteId: z.string().min(1, 'Site ID is required'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(100, 'Slug must be at most 100 characters')
    .regex(
      /^[a-z0-9-]+$/,
      'Slug can only contain lowercase letters, numbers, and hyphens'
    ),
  title: z.string().optional(),
});

// Standard response type
type ActionResponse<T = unknown> = {
  success: boolean;
  error?: string | z.ZodError['errors'];
  data?: T;
};

export async function createPage(
  prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  try {
    // 1. Authentication check
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return {
        success: false,
        error: 'You must be logged in to create a page',
      };
    }

    const userId = session.user.id;

    // 2. Extract and validate form data
    const rawData = {
      siteId: formData.get('siteId') as string,
      slug: formData.get('slug') as string,
      title: (formData.get('title') as string) || undefined,
    };

    const validationResult = createPageSchema.safeParse(rawData);

    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.errors,
      };
    }

    const { siteId, slug, title } = validationResult.data;

    // 3. Verify the user owns this site
    const site = await prisma.site.findFirst({
      where: {
        id: siteId,
        userId,
      },
      select: { id: true },
    });

    if (!site) {
      return {
        success: false,
        error: 'Site not found or you do not have permission',
      };
    }

    // 4. Check if slug is already taken for this site
    const existingPage = await prisma.page.findFirst({
      where: {
        siteId,
        slug,
      },
      select: { id: true },
    });

    if (existingPage) {
      return {
        success: false,
        error: 'A page with this slug already exists',
      };
    }

    // 5. Create the new page
    const newPage = await prisma.page.create({
      data: {
        siteId,
        slug,
        title: title || slug,
        content: [],
      },
    });

    // 6. Revalidate cache
    revalidatePath(`/app/site/${siteId}`);

    return {
      success: true,
      data: newPage,
    };
  } catch (error) {
    console.error('Error creating page:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}
