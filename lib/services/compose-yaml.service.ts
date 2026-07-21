import {
  ComposeNetwork,
  ComposeVolume,
  ServiceData,
} from "../types/index";

/**
 * Build a docker-compose YAML string from service/network/volume definitions.
 *
 * Newlines in user-supplied values are stripped to prevent YAML key injection
 * (a user could otherwise inject a new line containing arbitrary YAML content).
 *
 * Type-safe — accepts the typed domain models, not `any`.
 */
export function buildComposeYaml(
  services: ServiceData[],
  networks: ComposeNetwork[] = [],
  volumes: ComposeVolume[] = [],
): string {
  const safe = (v: string) => (v ?? "").replace(/[\n\r]/g, "");

  let yaml = "services:\n";

  services.forEach((s) => {
    yaml += `  ${safe(s.name)}:\n`;
    yaml += `    image: ${safe(s.image || "no-image")}\n`;

    if (s.ports) yaml += `    ports:\n      - "${safe(s.ports)}"\n`;
    if (s.restartPolicy) yaml += `    restart: ${safe(s.restartPolicy)}\n`;

    if (s.env) {
      yaml += `    environment:\n`;
      safe(s.env)
        .split(",")
        .forEach((e) => (yaml += `      - ${e.trim()}\n`));
    }

    if (s.volumes) {
      yaml += `    volumes:\n`;
      safe(s.volumes)
        .split(",")
        .forEach((v) => (yaml += `      - ${v.trim()}\n`));
    }

    if (s.command) yaml += `    command: ${safe(s.command)}\n`;

    if (s.depends_on) {
      yaml += `    depends_on:\n`;
      safe(s.depends_on)
        .split(",")
        .forEach((d) => (yaml += `      - ${d.trim()}\n`));
    }

    if (s.networks) {
      yaml += `    networks:\n`;
      safe(s.networks)
        .split(",")
        .forEach((n) => {
          const netName = n.trim();
          if (netName) yaml += `      - ${netName}\n`;
        });
    }

    if (s.networkMode) yaml += `    network_mode: ${safe(s.networkMode)}\n`;
    if (s.pidMode) yaml += `    pid: ${safe(s.pidMode)}\n`;
    if (s.privileged) yaml += `    privileged: true\n`;

    if (s.capAdd?.length) {
      yaml += `    cap_add:\n`;
      s.capAdd.forEach((c) => (yaml += `      - ${safe(c)}\n`));
    }

    if (s.securityOpt?.length) {
      yaml += `    security_opt:\n`;
      s.securityOpt.forEach((o) => (yaml += `      - ${safe(o)}\n`));
    }
  });

  const namedNetworks = networks.filter((n) => n.name.trim());
  if (namedNetworks.length > 0) {
    yaml += "\nnetworks:\n";
    namedNetworks.forEach((n) => {
      yaml += `  ${safe(n.name)}:\n`;
      if (n.driver && n.driver !== "bridge") {
        yaml += `    driver: ${safe(n.driver)}\n`;
      }
      if (n.external) {
        yaml += "    external: true\n";
      } else if (n.subnet || n.gateway) {
        yaml += `    ipam:\n      config:\n        -\n`;
        if (n.subnet) yaml += `          subnet: "${safe(n.subnet)}"\n`;
        if (n.gateway) yaml += `          gateway: "${safe(n.gateway)}"\n`;
      }
      if (n.labels) {
        yaml += `    labels:\n`;
        safe(n.labels)
          .split(",")
          .forEach((labelPair) => {
            const [k, val] = labelPair.split("=");
            if (k && val) yaml += `      ${k.trim()}: "${val.trim()}"\n`;
          });
      }
    });
  }

  const namedVolumes = volumes.filter((v) => v.type === "named" && v.name.trim());
  if (namedVolumes.length > 0) {
    yaml += "\nvolumes:\n";
    namedVolumes.forEach((v) => {
      yaml += `  ${safe(v.name)}:\n`;
      if (v.driver && v.driver !== "local") {
        yaml += `    driver: ${safe(v.driver)}\n`;
      }
      if (v.labels) {
        yaml += `    labels:\n`;
        safe(v.labels)
          .split(",")
          .forEach((labelPair) => {
            const [k, val] = labelPair.split("=");
            if (k && val) yaml += `      ${k.trim()}: "${val.trim()}"\n`;
          });
      }
    });
  }

  return yaml;
}
