import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { EditorClient } from './_components/EditorClient';

type EditorBlock = {
  id: string;
  type: 'hero';
  props: Record<string, unknown>;
};

interface EditorPageProps {
  params: Promise<{
    siteId: string;
    slug: string;
  }>;
}

export default async function EditorPage({ params }: EditorPageProps) {
  const { siteId, slug } = await params;

  // Fetch the page from database
  const page = await prisma.page.findFirst({
    where: {
      siteId,
      slug,
    },
    select: {
      id: true,
      slug: true,
      title: true,
      content: true,
      site: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!page) {
    notFound();
  }

  // Extract content - it's stored as JSON, default to empty array
  const initialContent = (page.content as EditorBlock[]) || [];

  return (
    <div className="h-screen flex flex-col">
      {/* Top Bar */}
      <header className="h-14 border-b bg-background flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {page.site.name}
          </span>
          <span className="text-muted-foreground">/</span>
          <span className="font-medium">{page.title || page.slug}</span>
        </div>
      </header>

      {/* Editor */}
      <EditorClient initialData={initialContent} pageId={page.id} />
    </div>
  );
}
