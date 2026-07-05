/**
 * Build a docker-compose YAML string from an array of service definitions.
 * Extracted from CreateContainerFlow to keep the component focused on UI.
 */
export function buildComposeYaml(services: any[]): { yaml: string; networks: Set<string> } {
  const allNetworks = new Set<string>();
  let yaml = "services:\n";

  services.forEach((s: any) => {
    yaml += `  ${s.name}:\n`;
    yaml += `    image: ${s.image || 'no-image'}\n`;
    if (s.ports) yaml += `    ports:\n      - "${s.ports}"\n`;
    if (s.restartPolicy) yaml += `    restart: ${s.restartPolicy}\n`;
    if (s.env) {
      yaml += `    environment:\n`;
      s.env.split(',').forEach((e: string) => yaml += `      - ${e.trim()}\n`);
    }
    if (s.volumes) {
      yaml += `    volumes:\n`;
      s.volumes.split(',').forEach((v: string) => yaml += `      - ${v.trim()}\n`);
    }
    if (s.command) yaml += `    command: ${s.command}\n`;
    if (s.depends_on) {
      yaml += `    depends_on:\n`;
      s.depends_on.split(',').forEach((d: string) => yaml += `      - ${d.trim()}\n`);
    }
    if (s.networks) {
      yaml += `    networks:\n`;
      s.networks.split(',').forEach((n: string) => {
        const netName = n.trim();
        if (netName) {
          yaml += `      - ${netName}\n`;
          allNetworks.add(netName);
        }
      });
    }
  });

  if (allNetworks.size > 0) {
    yaml += `\nnetworks:\n`;
    allNetworks.forEach(net => {
      yaml += `  ${net}:\n`;
    });
  }

  return { yaml, networks: allNetworks };
}
