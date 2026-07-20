import React from 'react';
import { Trash2 } from 'lucide-react';
import { ServiceData } from '@/lib/types';

interface ServiceCardProps {
  service: ServiceData;
  updateService: (id: string, field: keyof ServiceData, value: string) => void;
  removeService: (id: string) => void;
}

export const ServiceCard = ({ service, updateService, removeService }: ServiceCardProps) => {
  return (
    <div className="bg-surface border border-border rounded-md p-6 space-y-5 group hover:border-brand/30 transition-all shadow-sm">
      <div className="flex items-center justify-between">
        <input 
          value={service.name}
          onChange={(e) => updateService(service.id, 'name', e.target.value)}
          className="bg-transparent border-none text-lg font-semibold text-text-primary focus:ring-0 p-0 w-full outline-none"
          placeholder="service-name"
        />
        <button 
          onClick={() => removeService(service.id)} 
          className="p-2 hover:bg-danger-bg rounded-sm transition-all text-text-secondary hover:text-danger"
          title="Remove service"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-text-secondary">Container image</label>
          <input 
            placeholder="nginx:alpine"
            value={service.image || ''}
            onChange={(e) => updateService(service.id, 'image', e.target.value)}
            className="w-full bg-surface2 border border-border rounded-sm px-4 py-2.5 text-base text-text-primary focus:border-brand/50 outline-none transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-text-secondary">Exposed ports</label>
            <input 
              placeholder="80:80"
              value={service.ports || ''}
              onChange={(e) => updateService(service.id, 'ports', e.target.value)}
              className="w-full bg-surface2 border border-border rounded-sm px-4 py-2.5 text-base text-text-primary focus:border-brand/50 outline-none transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-text-secondary">Restart policy</label>
            <select 
              value={service.restartPolicy || 'no'}
              onChange={(e) => updateService(service.id, 'restartPolicy', e.target.value)}
              className="w-full bg-surface2 border border-border rounded-sm px-3 py-2.5 text-sm font-semibold text-text-primary outline-none focus:border-brand/50 transition-colors"
            >
              <option value="no">No</option>
              <option value="always">Always</option>
              <option value="unless-stopped">Unless stopped</option>
              <option value="on-failure">On failure</option>
            </select>
          </div>
        </div>

        {/* Advanced Docker Compose Options */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-text-secondary">Depends on (comma sep.)</label>
            <input 
              placeholder="db, cache"
              value={service.depends_on || ''}
              onChange={(e) => updateService(service.id, 'depends_on', e.target.value)}
              className="w-full bg-surface2 border border-border rounded-sm px-4 py-2.5 text-base text-text-primary focus:border-brand/50 outline-none transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-text-secondary">Networks (comma sep.)</label>
            <input 
              placeholder="frontend, backend"
              value={service.networks || ''}
              onChange={(e) => updateService(service.id, 'networks', e.target.value)}
              className="w-full bg-surface2 border border-border rounded-sm px-4 py-2.5 text-base text-text-primary focus:border-brand/50 outline-none transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-text-secondary">Volumes (comma sep.)</label>
            <input 
              placeholder="./data:/var/lib/mysql"
              value={service.volumes || ''}
              onChange={(e) => updateService(service.id, 'volumes', e.target.value)}
              className="w-full bg-surface2 border border-border rounded-sm px-4 py-2.5 text-base text-text-primary focus:border-brand/50 outline-none transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-text-secondary">Environment (comma sep.)</label>
            <input 
              placeholder="NODE_ENV=production, DEBUG=*"
              value={service.env || ''}
              onChange={(e) => updateService(service.id, 'env', e.target.value)}
              className="w-full bg-surface2 border border-border rounded-sm px-4 py-2.5 text-base text-text-primary focus:border-brand/50 outline-none transition-colors"
            />
          </div>
        </div>
        
        <div className="space-y-2">
           <label className="text-sm font-semibold text-text-secondary">Command (override)</label>
           <input 
             placeholder="npm start"
             value={service.command || ''}
             onChange={(e) => updateService(service.id, 'command', e.target.value)}
             className="w-full bg-surface2 border border-border rounded-sm px-4 py-2.5 text-base text-text-primary focus:border-brand/50 outline-none transition-colors"
           />
        </div>
      </div>
    </div>
  );
};
