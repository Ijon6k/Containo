import { Layout, ChevronDown } from 'lucide-react';
import { ServiceData } from '@/lib/types';


interface SimpleFormProps {
  data: ServiceData;
  onChange: (data: ServiceData) => void;
  onDeploy: () => void;
  isDeploying: boolean;
}

export const SimpleForm = ({ data, onChange, onDeploy, isDeploying }: SimpleFormProps) => {
  const handleChange = (field: keyof ServiceData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-text-sub uppercase tracking-widest">Container Name</label>
          <input 
            type="text"
            value={data.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full input-field py-2 text-sm"
            placeholder="e.g. my-awesome-app"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-text-sub uppercase tracking-widest">Docker Image</label>
          <input 
            type="text"
            value={data.image}
            onChange={(e) => handleChange('image', e.target.value)}
            className="w-full input-field py-2 text-sm"
            placeholder="e.g. nginx:latest"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-text-sub uppercase tracking-widest">Port Mapping</label>
          <input 
            type="text"
            value={data.ports}
            onChange={(e) => handleChange('ports', e.target.value)}
            className="w-full input-field py-2 text-sm"
            placeholder="e.g. 8080:80"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-text-sub uppercase tracking-widest">Restart Policy</label>
          <div className="relative">
            <select 
              value={data.restartPolicy}
              onChange={(e) => handleChange('restartPolicy', e.target.value)}
              className="w-full input-field py-2 text-sm appearance-none pr-10"
            >
              <option value="no">No</option>
              <option value="always">Always</option>
              <option value="unless-stopped">Unless Stopped</option>
              <option value="on-failure">On Failure</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-sub pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-text-sub uppercase tracking-widest">Volumes (one per line)</label>
        <textarea 
          value={data.volumes}
          onChange={(e) => handleChange('volumes', e.target.value)}
          className="w-full input-field py-3 text-sm h-24 resize-none"
          placeholder="/host/path:/container/path"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-text-sub uppercase tracking-widest">Environment Variables (one per line)</label>
        <textarea 
          value={data.env}
          onChange={(e) => handleChange('env', e.target.value)}
          className="w-full input-field py-3 text-sm h-24 resize-none"
          placeholder="KEY=VALUE"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button 
          onClick={onDeploy} 
          disabled={isDeploying}
          className="bg-brand hover:bg-brand/90 text-white px-6 py-2 rounded-md flex items-center justify-center gap-2 text-sm font-bold shadow-sm transition-all active:scale-95 disabled:opacity-50"
        >
          {isDeploying && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          Start Deployment
        </button>
      </div>
    </div>
  );
};
