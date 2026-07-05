import { z } from 'zod';

export const containerFormSchema = z.object({
  name: z.string().min(1, 'Container name is required').regex(/^[a-zA-Z0-9][a-zA-Z0-9_.-]+$/, 'Invalid container name format'),
  image: z.string().min(1, 'Image is required'),
  ports: z.string().optional(),
  env: z.string().optional(),
  cpu: z.string().optional(),
  memory: z.string().optional(),
  privileged: z.string().optional(),
  volumes: z.string().optional(),
  restartPolicy: z.enum(['no', 'always', 'on-failure', 'unless-stopped']),
  networkMode: z.string().optional(),
  command: z.string().optional(),
  labels: z.string().optional(),
});

export type ContainerFormValues = z.infer<typeof containerFormSchema>;
