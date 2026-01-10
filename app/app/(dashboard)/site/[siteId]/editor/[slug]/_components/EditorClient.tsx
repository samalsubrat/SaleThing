'use client';

import { useState } from 'react';
import { Plus, Layout, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Block type definition
export type EditorBlock = {
  id: string;
  type: 'hero';
  props: Record<string, unknown>;
};

interface EditorClientProps {
  initialData: EditorBlock[];
  pageId: string;
}

export function EditorClient({ initialData, pageId }: EditorClientProps) {
  const [blocks, setBlocks] = useState<EditorBlock[]>(initialData);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  // Add a new Hero block
  const addHeroBlock = () => {
    const newBlock: EditorBlock = {
      id: crypto.randomUUID(),
      type: 'hero',
      props: {
        title: 'Huge Sale',
        subtitle: '50% Off',
        image: '/placeholder.jpg',
      },
    };
    setBlocks((prev) => [...prev, newBlock]);
  };

  // Remove a block
  const removeBlock = (blockId: string) => {
    setBlocks((prev) => prev.filter((block) => block.id !== blockId));
    if (selectedBlockId === blockId) {
      setSelectedBlockId(null);
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-muted/30 flex flex-col shrink-0">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Components
          </h2>
        </div>

        <div className="p-4 space-y-2 flex-1 overflow-y-auto">
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={addHeroBlock}
          >
            <Plus className="h-4 w-4" />
            Add Hero Section
          </Button>

          {/* Future block types can be added here */}
        </div>

        {/* Block List */}
        {blocks.length > 0 && (
          <div className="border-t p-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
              Layers
            </h3>
            <div className="space-y-1">
              {blocks.map((block, index) => (
                <div
                  key={block.id}
                  className={cn(
                    'flex items-center justify-between px-2 py-1.5 rounded-md text-sm cursor-pointer hover:bg-accent group',
                    selectedBlockId === block.id && 'bg-accent'
                  )}
                  onClick={() => setSelectedBlockId(block.id)}
                >
                  <div className="flex items-center gap-2">
                    <Layout className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {block.type.charAt(0).toUpperCase() + block.type.slice(1)}{' '}
                      {index + 1}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeBlock(block.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 rounded"
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* Canvas */}
      <main className="flex-1 bg-muted/50 overflow-y-auto">
        <div className="min-h-full p-8">
          {blocks.length === 0 ? (
            /* Empty State */
            <div className="h-full flex flex-col items-center justify-center text-center py-32">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Layout className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-1">
                No blocks yet
              </h3>
              <p className="text-muted-foreground mb-4">
                Click a block to add it to your page
              </p>
              <Button onClick={addHeroBlock}>
                <Plus className="mr-2 h-4 w-4" />
                Add Hero Section
              </Button>
            </div>
          ) : (
            /* Render Blocks */
            <div className="space-y-4 max-w-4xl mx-auto">
              {blocks.map((block) => (
                <div
                  key={block.id}
                  onClick={() => setSelectedBlockId(block.id)}
                  className={cn(
                    'cursor-pointer transition-all rounded-lg',
                    selectedBlockId === block.id
                      ? 'ring-2 ring-primary ring-offset-2'
                      : 'hover:ring-2 hover:ring-muted-foreground/20'
                  )}
                >
                  {block.type === 'hero' && (
                    <HeroBlockPreview props={block.props} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// Hero Block Preview Component
function HeroBlockPreview({ props }: { props: Record<string, unknown> }) {
  const title = (props.title as string) || 'Hero Title';
  const subtitle = (props.subtitle as string) || 'Hero Subtitle';

  return (
    <div className="bg-gray-200 dark:bg-gray-800 rounded-lg p-12 text-center">
      <h2 className="text-3xl font-bold text-foreground mb-2">{title}</h2>
      <p className="text-lg text-muted-foreground">{subtitle}</p>
    </div>
  );
}
