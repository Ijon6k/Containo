import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Settings2, 
  Cpu, 
  Database, 
  Network, 
  ShieldCheck, 
  Terminal, 
  ChevronDown, 
  ChevronUp,
  Layout,
  AlertCircle
} from 'lucide-react';
import { ServiceData } from '@/lib/types';

const formSchema = z.object({
  name: z.string().min(1, 'Container name is required').regex(/^[a-zA-Z0-9][a-zA-Z0-9_.-]+$/, 'Invalid container name format'),
  image: z.string().min(1, 'Image is required'),
  ports: z.string().optional(),
  env: z.string().optional(),
  cpu: z.string().optional(),
  memory: z.string().optional(),
  privileged: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

interface SimpleFormProps {
  onDeploy: (data: ServiceData) => void;
  isDeploying: boolean;
  cliCommand: string;
  setCliCommand: (cmd: string) => void;
  deploymentMode: 'form' | 'cli';
  setDeploymentMode: (mode: 'form' | 'cli') => void;
}

export const SimpleForm = ({ 
  onDeploy, 
  isDeploying,
  cliCommand,
  setCliCommand,
  deploymentMode,
  setDeploymentMode
}: SimpleFormProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const { register, handleSubmit, formState: { errors, isValid } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      image: '',
      ports: '',
      env: '',
      cpu: '',
      memory: '',
      privileged: 'false'
    }
  });

  const onSubmit = (data: FormValues) => {
    // Map FormValues to ServiceData if needed
    onDeploy({
      id: '',
      name: data.name,
      image: data.image,
      ports: data.ports || '',
      env: data.env || '',
      volumes: '',
      restartPolicy: 'unless-stopped'
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Switcher */}
      <div className="flex bg-ui-accent p-1 rounded-md border border-ui-border self-start">
        <button 
          onClick={() => setDeploymentMode('form')}
          className={`flex items-center gap-2 px-6 py-2 rounded-md text-sm font-semibold transition-all ${deploymentMode === 'form' ? 'bg-ui-bg text-text-main shadow-sm' : 'text-text-sub hover:text-text-main'}`}
        >
          <Layout className="w-4 h-4" />
          Form Mode
        </button>
        <button 
          onClick={() => setDeploymentMode('cli')}
          className={`flex items-center gap-2 px-6 py-2 rounded-md text-sm font-semibold transition-all ${deploymentMode === 'cli' ? 'bg-ui-bg text-text-main shadow-sm' : 'text-text-sub hover:text-text-main'}`}
        >
          <Terminal className="w-4 h-4" />
          CLI Mode
        </button>
      </div>

      <AnimatePresence mode="wait">
        {deploymentMode === 'form' ? (
          <motion.div 
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            {/* Basic Settings */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 border-b border-ui-border pb-4">
                <Settings2 className="w-5 h-5 text-text-sub" />
                <h3 className="text-base font-semibold text-text-main">Basic Settings</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-sub">Container Name</label>
                  <input 
                    {...register('name')}
                    placeholder="app-name"
                    className={`w-full bg-ui-accent border ${errors.name ? 'border-red-500' : 'border-ui-border'} rounded-md px-4 py-3 text-sm text-text-main focus:border-brand/50 outline-none`}
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" /> {errors.name.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-sub">Image</label>
                  <input 
                    {...register('image')}
                    placeholder="nginx:latest"
                    className={`w-full bg-ui-accent border ${errors.image ? 'border-red-500' : 'border-ui-border'} rounded-md px-4 py-3 text-sm text-text-main focus:border-brand/50 outline-none`}
                  />
                  {errors.image && (
                    <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" /> {errors.image.message}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Config */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 border-b border-ui-border pb-4">
                <Network className="w-5 h-5 text-text-sub" />
                <h3 className="text-base font-semibold text-text-main">Network & Environment</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-sub">Ports</label>
                  <input 
                    {...register('ports')}
                    placeholder="80:80"
                    className="w-full bg-ui-accent border border-ui-border rounded-md px-4 py-3 text-sm text-text-main focus:border-brand/50 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-sub">Environment Variables</label>
                  <textarea 
                    {...register('env')}
                    placeholder="KEY=VALUE"
                    className="w-full bg-ui-accent border border-ui-border rounded-md px-4 py-3 text-sm text-text-main focus:border-brand/50 outline-none h-24"
                  />
                </div>
              </div>
            </section>

            <button 
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-sm font-semibold text-text-sub hover:text-text-main transition-all"
            >
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {showAdvanced ? 'Fewer options' : 'More options'}
            </button>

            <AnimatePresence>
              {showAdvanced && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden space-y-6 bg-ui-accent/50 border border-ui-border p-6 rounded-md"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div className="space-y-2">
                        <label className="text-sm font-medium text-text-sub flex items-center gap-2">
                           <Cpu className="w-4 h-4" /> CPU
                        </label>
                        <input {...register('cpu')} type="number" placeholder="1024" className="w-full bg-ui-bg border border-ui-border rounded-md px-4 py-2.5 text-sm text-text-main" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-sm font-medium text-text-sub flex items-center gap-2">
                           <Database className="w-4 h-4" /> RAM (MB)
                        </label>
                        <input {...register('memory')} type="number" placeholder="512" className="w-full bg-ui-bg border border-ui-border rounded-md px-4 py-2.5 text-sm text-text-main" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-sm font-medium text-text-sub flex items-center gap-2">
                           <ShieldCheck className="w-4 h-4" /> Privileged
                        </label>
                        <select {...register('privileged')} className="w-full bg-ui-bg border border-ui-border rounded-md px-4 py-2.5 text-sm text-text-main font-semibold">
                           <option value="false">No</option>
                           <option value="true">Yes</option>
                        </select>
                     </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div 
            key="cli"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
             <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-ui-border pb-4">
                   <Terminal className="w-5 h-5 text-text-sub" />
                   <h3 className="text-base font-semibold text-text-main">Command Line</h3>
                </div>
                <p className="text-sm text-text-sub">Paste your docker run command here. The system will parse it automatically.</p>
                <textarea 
                  value={cliCommand}
                  onChange={(e) => setCliCommand(e.target.value)}
                  placeholder="docker run -d --name app ..."
                  className="w-full h-48 bg-ui-accent border border-ui-border rounded-md p-6 font-mono text-sm text-text-main focus:border-brand/50 outline-none leading-relaxed"
                />
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action */}
      <div className="pt-8 border-t border-ui-border flex justify-end">
        {deploymentMode === 'form' ? (
          <button 
            onClick={handleSubmit(onSubmit)}
            disabled={isDeploying || !isValid}
            className="bg-brand hover:bg-brand/90 text-white px-10 py-3 rounded-md text-sm font-semibold transition-all active:scale-95 disabled:opacity-30 disabled:grayscale shadow-sm"
          >
            {isDeploying ? 'Deploying...' : 'Deploy Container'}
          </button>
        ) : (
          <button 
            onClick={() => onDeploy(undefined as any)} // Handled by parent for CLI mode
            disabled={isDeploying || !cliCommand}
            className="bg-brand hover:bg-brand/90 text-white px-10 py-3 rounded-md text-sm font-semibold transition-all active:scale-95 disabled:opacity-30 disabled:grayscale shadow-sm"
          >
            {isDeploying ? 'Deploying...' : 'Deploy from CLI'}
          </button>
        )}
      </div>
    </div>
  );
};
