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
    <div className="bg-ui-bg border border-ui-border rounded-lg p-6 space-y-5 group hover:border-brand/30 transition-all shadow-sm">
      <div className="flex items-center justify-between">
        <input 
          value={service.name}
          onChange={(e) => updateService(service.id, 'name', e.target.value)}
          className="bg-transparent border-none text-base font-semibold text-text-main focus:ring-0 p-0 w-full outline-none"
          placeholder="service-name"
        />
        <button 
          onClick={() => removeService(service.id)} 
          className="p-2 hover:bg-rose-500/10 rounded-md transition-all text-text-sub hover:text-rose-500"
          title="Remove Service"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5">
        <div className="space-y-2">
          <label className="text-xs font-bold text-text-sub uppercase tracking-wider">Container Image</label>
          <input 
            placeholder="nginx:alpine"
            value={service.image || ''}
            onChange={(e) => updateService(service.id, 'image', e.target.value)}
            className="w-full bg-ui-accent border border-ui-border rounded-md px-4 py-2.5 text-sm text-text-main focus:border-brand/50 outline-none transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-sub uppercase tracking-wider">Exposed Ports</label>
            <input 
              placeholder="80:80"
              value={service.ports || ''}
              onChange={(e) => updateService(service.id, 'ports', e.target.value)}
              className="w-full bg-ui-accent border border-ui-border rounded-md px-4 py-2.5 text-sm text-text-main focus:border-brand/50 outline-none transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-sub uppercase tracking-wider">Restart Policy</label>
            <select 
              value={service.restartPolicy || 'no'}
              onChange={(e) => updateService(service.id, 'restartPolicy', e.target.value)}
              className="w-full bg-ui-accent border border-ui-border rounded-md px-3 py-2.5 text-xs font-semibold text-text-main outline-none focus:border-brand/50 transition-colors"
            >
              <option value="no">No</option>
              <option value="always">Always</option>
              <option value="unless-stopped">Unless Stopped</option>
              <option value="on-failure">On Failure</option>
            </select>
          </div>
        </div>

        {/* Advanced Docker Compose Options */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-sub uppercase tracking-wider">Depends On (Comma sep)</label>
            <input 
              placeholder="db, cache"
              value={service.depends_on || ''}
              onChange={(e) => updateService(service.id, 'depends_on', e.target.value)}
              className="w-full bg-ui-accent border border-ui-border rounded-md px-4 py-2.5 text-sm text-text-main focus:border-brand/50 outline-none transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-sub uppercase tracking-wider">Networks (Comma sep)</label>
            <input 
              placeholder="frontend, backend"
              value={service.networks || ''}
              onChange={(e) => updateService(service.id, 'networks', e.target.value)}
              className="w-full bg-ui-accent border border-ui-border rounded-md px-4 py-2.5 text-sm text-text-main focus:border-brand/50 outline-none transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-sub uppercase tracking-wider">Volumes (Comma sep)</label>
            <input 
              placeholder="./data:/var/lib/mysql"
              value={service.volumes || ''}
              onChange={(e) => updateService(service.id, 'volumes', e.target.value)}
              className="w-full bg-ui-accent border border-ui-border rounded-md px-4 py-2.5 text-sm text-text-main focus:border-brand/50 outline-none transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-sub uppercase tracking-wider">Environment (Comma sep)</label>
            <input 
              placeholder="NODE_ENV=production, DEBUG=*"
              value={service.env || ''}
              onChange={(e) => updateService(service.id, 'env', e.target.value)}
              className="w-full bg-ui-accent border border-ui-border rounded-md px-4 py-2.5 text-sm text-text-main focus:border-brand/50 outline-none transition-colors"
            />
          </div>
        </div>
        
        <div className="space-y-2">
           <label className="text-xs font-bold text-text-sub uppercase tracking-wider">Command (Override)</label>
           <input 
             placeholder="npm start"
             value={service.command || ''}
             onChange={(e) => updateService(service.id, 'command', e.target.value)}
             className="w-full bg-ui-accent border border-ui-border rounded-md px-4 py-2.5 text-sm text-text-main focus:border-brand/50 outline-none transition-colors"
           />
        </div>
      </div>
    </div>
  );
};
