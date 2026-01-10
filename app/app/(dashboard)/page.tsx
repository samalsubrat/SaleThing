import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus, Globe, ExternalLink, LayoutDashboard } from 'lucide-react';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { protocol, rootDomain } from '@/lib/utils';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

async function getSites(userId: string) {
  return prisma.site.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      subdomain: true,
      customDomain: true,
      logo: true,
    },
  });
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="rounded-full bg-muted p-6 mb-6">
        <Globe className="h-12 w-12 text-muted-foreground" />
      </div>
      <h2 className="text-2xl font-semibold text-foreground mb-2">
        No sites created yet
      </h2>
      <p className="text-muted-foreground text-center max-w-md mb-8">
        Get started by creating your first site. You can customize it with your
        own subdomain, content, and branding.
      </p>
      <Button asChild size="lg">
        <Link href="/site/new">
          <Plus className="mr-2 h-5 w-5" />
          Create Your First Site
        </Link>
      </Button>
    </div>
  );
}

function SiteCard({
  site,
}: {
  site: {
    id: string;
    name: string | null;
    subdomain: string | null;
    customDomain: string | null;
    logo: string | null;
  };
}) {
  const siteUrl = site.subdomain
    ? `${protocol}://${site.subdomain}.${rootDomain}`
    : null;
  const displayUrl = site.subdomain ? `${site.subdomain}.${rootDomain}` : null;

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 truncate">
          {site.logo ? (
            <img
              src={site.logo}
              alt={site.name || 'Site logo'}
              className="h-6 w-6 rounded-md object-cover"
            />
          ) : (
            <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center">
              <Globe className="h-4 w-4 text-primary" />
            </div>
          )}
          <span className="truncate">{site.name || 'Untitled Site'}</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        {/* Subdomain Link */}
        {siteUrl && displayUrl && (
          <div className="flex items-center gap-2 text-sm">
            <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <a
              href={siteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline truncate flex items-center gap-1"
            >
              {displayUrl}
              <ExternalLink className="h-3 w-3 flex-shrink-0" />
            </a>
          </div>
        )}

        {/* Custom Domain */}
        {site.customDomain && (
          <div className="flex items-center gap-2 text-sm">
            <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <a
              href={`${protocol}://${site.customDomain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline truncate flex items-center gap-1"
            >
              {site.customDomain}
              <ExternalLink className="h-3 w-3 flex-shrink-0" />
            </a>
          </div>
        )}

        {/* No domain configured */}
        {!site.subdomain && !site.customDomain && (
          <p className="text-sm text-muted-foreground italic">
            No domain configured
          </p>
        )}
      </CardContent>

      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/app/site/${site.id}`}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Open Builder
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default async function DashboardPage() {
  // Check authentication
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect('/login');
  }

  // Fetch user's sites
  const sites = await getSites(session.user.id);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Your Sites</h1>
            <p className="text-muted-foreground mt-1">
              Manage and edit your websites
            </p>
          </div>
          {sites.length > 0 && (
            <Button asChild>
              <Link href="/site/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Site
              </Link>
            </Button>
          )}
        </div>

        {/* Content */}
        {sites.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sites.map((site) => (
              <SiteCard key={site.id} site={site} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
