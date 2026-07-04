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
        className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1.5 bg-ui-accent hover:bg-ui-border text-text-sub hover:text-text-main rounded-md text-xs font-medium transition-all border border-ui-border"
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 text-emerald-500" />
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
        {copied ? "Copied" : "Copy"}
      </button>
      <pre className="h-full bg-ui-accent/30 p-8 pt-14 rounded-lg font-mono text-sm text-text-main overflow-auto border border-ui-border leading-relaxed">
        {yamlContent}
      </pre>
    </motion.div>
  );
};
