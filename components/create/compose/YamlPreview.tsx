import React from 'react';
import { motion } from 'framer-motion';

interface YamlPreviewProps {
  yamlContent: string;
}

export const YamlPreview = ({ yamlContent }: YamlPreviewProps) => {
  return (
    <motion.div key="yaml" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
      <pre className="h-full bg-ui-accent/30 p-8 rounded-lg font-mono text-sm text-text-main overflow-auto border border-ui-border leading-relaxed">
        {yamlContent}
      </pre>
    </motion.div>
  );
};
