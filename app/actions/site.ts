'use server';

import { z } from 'zod';
import { headers } from 'next/headers';
import { revalidateTag, revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

// Zod schema for site creation validation
const createSiteSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  subdomain: z
    .string()
    .min(3, 'Subdomain must be at least 3 characters')
    .max(30, 'Subdomain must be at most 30 characters')
    .regex(
      /^[a-z0-9-]+$/,
      'Subdomain can only contain lowercase letters, numbers, and hyphens'
    ),
  description: z.string().optional(),
});

// Standard response type
type ActionResponse<T = unknown> = {
  success: boolean;
  error?: string | z.ZodError['errors'];
  data?: T;
};

export async function createSite(
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
        error: 'You must be logged in to create a site',
      };
    }

    const userId = session.user.id;

    // 2. Extract and validate form data
    const rawData = {
      name: formData.get('name') as string,
      subdomain: formData.get('subdomain') as string,
      description: formData.get('description') as string | undefined,
    };

    const validationResult = createSiteSchema.safeParse(rawData);

    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.issues,
      };
    }

    const { name, subdomain, description } = validationResult.data;

    // 3. Check if subdomain is already taken
    const existingSite = await prisma.site.findUnique({
      where: { subdomain },
      select: { id: true },
    });

    if (existingSite) {
      return {
        success: false,
        error: 'Subdomain already taken',
      };
    }

    // 4. Create the new site
    const newSite = await prisma.site.create({
      data: {
        name,
        subdomain,
        description: description || null,
        userId,
      },
    });

    // 5. Revalidate cache so dashboard updates
    revalidateTag('user-sites');
    revalidatePath('/admin');

    return {
      success: true,
      data: newSite,
    };
  } catch (error) {
    console.error('Error creating site:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}
