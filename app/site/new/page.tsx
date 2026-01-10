import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { auth } from '@/lib/auth';
import { CreateSiteForm } from './_components/CreateSiteForm';

export default async function NewSitePage() {
  // Check authentication
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-xl">
        {/* Back Link */}
        <Link
          href="/app"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Create New Site</h1>
          <p className="text-muted-foreground mt-2">
            Set up your new site with a name and subdomain.
          </p>
        </div>

        {/* Form */}
        <CreateSiteForm />
      </div>
    </div>
  );
}
