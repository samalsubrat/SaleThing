import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileText, Plus, ExternalLink } from 'lucide-react';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { protocol, rootDomain } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { CreatePageModal } from './_components/CreatePageModal';

interface SiteBuilderPageProps {
  params: Promise<{
    siteId: string;
  }>;
}

async function getSiteWithPages(siteId: string, userId: string) {
  return prisma.site.findFirst({
    where: {
      id: siteId,
      userId,
    },
    include: {
      pages: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          slug: true,
          title: true,
          published: true,
          createdAt: true,
        },
      },
    },
  });
}

export default async function SiteBuilderPage({ params }: SiteBuilderPageProps) {
  const { siteId } = await params;

  // Check authentication
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect('/login');
  }

  // Fetch site with pages
  const site = await getSiteWithPages(siteId, session.user.id);

  if (!site) {
    notFound();
  }

  const siteUrl = site.subdomain
    ? `${protocol}://${site.subdomain}.${rootDomain}`
    : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Back Link */}
        <Link
          href="/app"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>

        {/* Site Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {site.name || 'Untitled Site'}
            </h1>
            {siteUrl && (
              <a
                href={siteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1 mt-1"
              >
                {siteUrl}
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
          <CreatePageModal siteId={siteId} />
        </div>

        {/* Pages Grid */}
        {site.pages.length === 0 ? (
          <EmptyState siteId={siteId} />
        ) : (
          <div className="grid gap-4">
            {site.pages.map((page) => (
              <PageCard
                key={page.id}
                page={page}
                siteId={siteId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ siteId }: { siteId: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 border-2 border-dashed rounded-lg">
      <div className="rounded-full bg-muted p-4 mb-4">
        <FileText className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-1">No pages yet</h3>
      <p className="text-muted-foreground text-center max-w-md mb-6">
        Create your first page to start building your site.
      </p>
      <CreatePageModal siteId={siteId} />
    </div>
  );
}

function PageCard({
  page,
  siteId,
}: {
  page: {
    id: string;
    slug: string;
    title: string | null;
    published: boolean;
    createdAt: Date;
  };
  siteId: string;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-muted-foreground" />
            {page.title || page.slug}
          </CardTitle>
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              page.published
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
            }`}
          >
            {page.published ? 'Published' : 'Draft'}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">/{page.slug}</span>
          <Button asChild size="sm">
            <Link href={`/app/site/${siteId}/editor/${page.slug}`}>
              Edit Page
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
