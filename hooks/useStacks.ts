import { useMemo } from "react";
import { Container } from "@/lib/types";
import { Stack } from "@/components/dashboard/StackListView";

// Groups containers by Docker Compose project label.
// Containers without a compose project are placed in a "standalone" group.
export function useStacks(containers: Container[]) {
  return useMemo(() => {
    const map: { [key: string]: Container[] } = {};
    const standalone: Container[] = [];

    containers.forEach((c) => {
      if (c.composeProject) {
        if (!map[c.composeProject]) {
          map[c.composeProject] = [];
        }
        map[c.composeProject].push(c);
      } else {
        standalone.push(c);
      }
    });

    const result: Stack[] = Object.entries(map).map(([name, containers]) => ({
      name,
      isCompose: true,
      containers,
    }));

    if (standalone.length > 0) {
      result.push({
        name: "standalone",
        isCompose: false,
        containers: standalone,
      });
    }

    return result;
  }, [containers]);
}
