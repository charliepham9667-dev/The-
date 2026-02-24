import { useState } from 'react';
import { 
  FileText, 
  Plus, 
  ExternalLink, 
  Folder,
  BookOpen,
  Shield,
  Utensils,
  Users,
  Palette,
  HelpCircle,
  ChevronDown,
  X,
  Loader2,
  AlertCircle,
  Search
} from 'lucide-react';
import { useResources, useCreateResource, useDeleteResource } from '../../hooks/useResources';
import { useAuthStore } from '../../stores/authStore';
import type { ResourceLink, ResourceCategory } from '../../types';

const categoryConfig: Record<ResourceCategory, { label: string; icon: any; color: string }> = {
  sop: { label: 'SOPs', icon: FileText, color: 'text-info' },
  training: { label: 'Training', icon: BookOpen, color: 'text-success' },
  safety: { label: 'Safety', icon: Shield, color: 'text-error' },
  branding: { label: 'Branding', icon: Palette, color: 'text-purple-400' },
  hr: { label: 'HR', icon: Users, color: 'text-warning' },
  menu: { label: 'Menu', icon: Utensils, color: 'text-primary' },
  recipes: { label: 'Recipes', icon: Utensils, color: 'text-pink-400' },
  licenses: { label: 'Licenses', icon: FileText, color: 'text-cyan-400' },
  other: { label: 'Other', icon: HelpCircle, color: 'text-muted-foreground' },
};

export function Resources() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ResourceCategory | 'all'>('all');
  const [showForm, setShowForm] = useState(false);

  const profile = useAuthStore((s) => s.profile);
  const isOwner = profile?.role === 'owner';

  const { data: resources, isLoading } = useResources(
    categoryFilter === 'all' ? undefined : categoryFilter
  );

  const filteredResources = resources?.filter(r =>
    !searchQuery || 
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Group by category
  const groupedResources = filteredResources.reduce((acc, resource) => {
    if (!acc[resource.category]) {
      acc[resource.category] = [];
    }
    acc[resource.category].push(resource);
    return acc;
  }, {} as Record<ResourceCategory, ResourceLink[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Resource Library</h1>
          <p className="text-sm text-muted-foreground mt-1">
            SOPs, training materials, and important documents
          </p>
        </div>
        {isOwner && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Resource
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-card pl-10 pr-4 py-2 text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
          />
        </div>
        <div className="relative">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as ResourceCategory | 'all')}
            className="appearance-none rounded-lg border border-border bg-card px-4 py-2 pr-10 text-foreground focus:border-ring focus:outline-none"
          >
            <option value="all">All Categories</option>
            {Object.entries(categoryConfig).map(([value, config]) => (
              <option key={value} value={value}>{config.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-9 gap-3">
        {Object.entries(categoryConfig).map(([key, config]) => {
          const Icon = config.icon;
          const count = resources?.filter(r => r.category === key).length || 0;
          const isActive = categoryFilter === key;
          
          return (
            <button
              key={key}
              onClick={() => setCategoryFilter(isActive ? 'all' : key as ResourceCategory)}
              className={`flex flex-col items-center gap-1 rounded-lg border p-3 transition-colors ${
                isActive
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-card hover:border-border/80'
              }`}
            >
              <Icon className={`h-5 w-5 ${config.color}`} />
              <span className="text-xs text-foreground">{config.label}</span>
              <span className="text-xs text-muted-foreground">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Resources */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <Folder className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No resources found</p>
          {isOwner && (
            <button
              onClick={() => setShowForm(true)}
              className="mt-2 text-sm text-primary hover:underline"
            >
              Add your first resource
            </button>
          )}
        </div>
      ) : categoryFilter === 'all' ? (
        // Grouped view
        <div className="space-y-6">
          {Object.entries(groupedResources).map(([category, items]) => {
            const config = categoryConfig[category as ResourceCategory];
            const Icon = config.icon;
            
            return (
              <div key={category} className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-background/50">
                  <Icon className={`h-4 w-4 ${config.color}`} />
                  <h3 className="font-medium text-foreground">{config.label}</h3>
                  <span className="text-xs text-muted-foreground">({items.length})</span>
                </div>
                <div className="divide-y divide-border">
                  {items.map(resource => (
                    <ResourceCard key={resource.id} resource={resource} canDelete={isOwner} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Flat view
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="divide-y divide-border">
            {filteredResources.map(resource => (
              <ResourceCard key={resource.id} resource={resource} canDelete={isOwner} />
            ))}
          </div>
        </div>
      )}

      {/* Add Form Modal */}
      {showForm && (
        <ResourceForm onClose={() => setShowForm(false)} />
      )}
    </div>
  );
}

function ResourceCard({ resource, canDelete }: { resource: ResourceLink; canDelete?: boolean }) {
  const deleteResource = useDeleteResource();
  const config = categoryConfig[resource.category];
  const Icon = config.icon;

  return (
    <div className="p-4 hover:bg-muted/50 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`rounded-lg bg-muted p-2`}>
            <Icon className={`h-5 w-5 ${config.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-foreground">{resource.title}</h4>
            {resource.description && (
              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{resource.description}</p>
            )}
            {resource.subcategory && (
              <span className="text-xs text-muted-foreground mt-1 inline-block">
                {resource.subcategory}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Open <ExternalLink className="h-3 w-3" />
          </a>
          {canDelete && (
            <button
              onClick={() => deleteResource.mutate(resource.id)}
              className="rounded-lg p-1.5 text-muted-foreground hover:text-error hover:bg-error/10 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ResourceForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    category: 'sop' as ResourceCategory,
    subcategory: '',
  });
  const [error, setError] = useState<string | null>(null);

  const createResource = useCreateResource();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    if (!formData.url.trim()) {
      setError('URL is required');
      return;
    }

    try {
      await createResource.mutateAsync(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create resource');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Add Resource</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g., Bartender Training Guide"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">URL *</label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData(f => ({ ...f, url: e.target.value }))}
              placeholder="https://drive.google.com/..."
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(f => ({ ...f, category: e.target.value as ResourceCategory }))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-ring focus:outline-none"
              >
                {Object.entries(categoryConfig).map(([value, config]) => (
                  <option key={value} value={value}>{config.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Subcategory</label>
              <input
                type="text"
                value={formData.subcategory}
                onChange={(e) => setFormData(f => ({ ...f, subcategory: e.target.value }))}
                placeholder="e.g., Bar SOPs"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))}
              rows={2}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none resize-none"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-error">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-muted-foreground hover:text-foreground">
              Cancel
            </button>
            <button
              type="submit"
              disabled={createResource.isPending}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {createResource.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Add Resource
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
