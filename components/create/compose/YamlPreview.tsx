import React, { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";

interface YamlPreviewProps {
  yamlContent: string;
}

export const YamlPreview = ({ yamlContent }: YamlPreviewProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(yamlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      key="yaml"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full relative"
    >
      <button
        onClick={handleCopy}
        className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1.5 bg-surface2 hover:bg-hover text-text-secondary hover:text-text-primary rounded-sm text-sm font-medium transition-all border border-border"
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 text-success" />
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
        {copied ? "Copied" : "Copy"}
      </button>
      <pre className="h-full bg-surface2/30 p-8 pt-14 rounded-sm font-mono text-base text-text-primary overflow-auto border border-border leading-relaxed">
        {yamlContent}
      </pre>
    </motion.div>
  );
};
