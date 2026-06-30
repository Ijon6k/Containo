# Graph Report - .  (2026-06-30)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 584 nodes · 942 edges · 49 communities (30 shown, 19 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.83)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `eaf1679b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]

## God Nodes (most connected - your core abstractions)
1. `Vercel React Best Practices Guide` - 51 edges
2. `Container` - 36 edges
3. `docker` - 20 edges
4. `compilerOptions` - 16 edges
5. `useNotify()` - 13 edges
6. `Logger` - 13 edges
7. `ServiceData` - 12 edges
8. `Volume` - 10 edges
9. `withErrorHandler()` - 9 edges
10. `ContainerStats` - 8 edges

## Surprising Connections (you probably didn't know these)
- `MaintenanceProps` --references--> `Container`  [EXTRACTED]
  components/Maintenance.tsx → lib/types/index.ts
- `Vercel React Best Practices Guide` --references--> `Store Event Handlers in Refs`  [EXTRACTED]
  .agents/skills/vercel-react-best-practices/AGENTS.md → rules/advanced-event-handler-refs.md
- `Vercel React Best Practices Guide` --references--> `Use SWR for Automatic Deduplication`  [EXTRACTED]
  .agents/skills/vercel-react-best-practices/AGENTS.md → rules/client-swr-dedup.md
- `Vercel React Best Practices Guide` --references--> `Defer Non-Critical Work with requestIdleCallback`  [EXTRACTED]
  .agents/skills/vercel-react-best-practices/AGENTS.md → rules/js-request-idle-callback.md
- `Vercel React Best Practices Guide` --references--> `Use React DOM Resource Hints`  [EXTRACTED]
  .agents/skills/vercel-react-best-practices/AGENTS.md → rules/rendering-resource-hints.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Containo Visual Identity** — public_asset_auth_loginlight, public_docs_preview1, public_logo_containologo [EXTRACTED 0.90]
- **React Performance Optimization Categories** — rules_server_cache_react, rules_client_swr_dedup, rules_rerender_memo, rules_rendering_resource_hints, rules_js_request_idle_callback [EXTRACTED 0.90]
- **Containo Technology Stack** — nextjs, dockerode, ws, better_sqlite3 [EXTRACTED 1.00]
- **Agent Engineering Skills** — agents_skills_clean_architecture_skill, code_review_skill, agents_skills_performance_optimization_skill, agents_skills_ponytail_skill, agents_skills_typescript_advanced_types_skill, react_best_practices_skill [INFERRED 0.80]

## Communities (49 total, 19 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (40): POST, GET, POST, DELETE, GET, GET, POST, DELETE (+32 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (48): RecoveryActions(), RecoveryActionsProps, RestoreModal(), RestoreModalProps, RestoreProgress(), RestoreProgressProps, VolumeList(), VolumeListProps (+40 more)

### Community 2 - "Community 2"
Cohesion: 0.07
Nodes (32): DirectoryPicker(), DirectoryPickerProps, FileItem, LocalStackDeployer(), LocalStackDeployerProps, ServiceCard(), ServiceCardProps, VisualizerTab() (+24 more)

### Community 3 - "Community 3"
Cohesion: 0.04
Nodes (39): Better-SQLite3, Containo Application, Docker Compose Configuration, Docker Socket, Dockerode, docker, Next.js, dependencies (+31 more)

### Community 4 - "Community 4"
Cohesion: 0.05
Nodes (43): Vercel React Best Practices Guide, Do Not Put Effect Events in Dependency Arrays, Initialize App Once, Not Per Mount, Deduplicate Global Event Listeners, Version and Minimize localStorage Data, Use Passive Event Listeners for Scrolling Performance, Avoid Layout Thrashing, Cache Repeated Function Calls (+35 more)

### Community 5 - "Community 5"
Cohesion: 0.09
Nodes (19): AuthLayout(), AuthLayoutProps, LoginForm(), LoginFormProps, SetupForm(), SetupFormProps, useAuthForm(), UseAuthFormOptions (+11 more)

### Community 6 - "Community 6"
Cohesion: 0.11
Nodes (22): BackupsPage(), DeployPage(), DashboardLayoutInner(), MaintenancePage(), SettingsPage(), NotificationContext, NotificationContextType, NotificationProvider() (+14 more)

### Community 7 - "Community 7"
Cohesion: 0.08
Nodes (21): AutoHealToggle(), AutoHealToggleProps, HealthScoreCard(), HealthScoreCardProps, Maintenance(), MaintenanceProps, PruneAction(), PruneActionProps (+13 more)

### Community 8 - "Community 8"
Cohesion: 0.13
Nodes (18): POST(), POST(), POST(), comparePassword(), createSession(), deleteSession(), getSession(), hashPassword() (+10 more)

### Community 9 - "Community 9"
Cohesion: 0.16
Nodes (16): DashboardPage(), useWS(), WebSocketContext, WebSocketContextType, useContainers(), useDashboardActions(), UseDashboardActionsProps, useSearch() (+8 more)

### Community 10 - "Community 10"
Cohesion: 0.09
Nodes (22): devDependencies, esbuild, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/better-sqlite3, @types/dockerode (+14 more)

### Community 11 - "Community 11"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 12 - "Community 12"
Cohesion: 0.22
Nodes (9): Vercel React Best Practices Skill, Store Event Handlers in Refs, useEffectEvent for Stable Callback Refs, Use SWR for Automatic Deduplication, Defer Non-Critical Work with requestIdleCallback, Use React DOM Resource Hints, Don't Define Components Inside Components, Use after() for Non-Blocking Operations (+1 more)

### Community 13 - "Community 13"
Cohesion: 0.40
Nodes (3): archivo, metadata, QueryProvider()

### Community 14 - "Community 14"
Cohesion: 0.40
Nodes (4): ImageCard(), ImageCardProps, ImageListView(), ImageListViewProps

### Community 15 - "Community 15"
Cohesion: 0.33
Nodes (4): fs, mappings, path, serverContent

### Community 16 - "Community 16"
Cohesion: 0.67
Nodes (3): is_server_ready(), main(), Wait for server to be ready by polling the port.

### Community 17 - "Community 17"
Cohesion: 0.50
Nodes (4): Containo Docker Management, Login Page Background Illustration, Containo Dashboard UI Preview, Containo Logo

## Knowledge Gaps
- **203 isolated node(s):** `POST`, `GET`, `POST`, `GET`, `DELETE` (+198 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **19 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Dockerode` connect `Community 3` to `Community 0`?**
  _High betweenness centrality (0.141) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Community 3` to `Community 10`?**
  _High betweenness centrality (0.110) - this node is a cross-community bridge._
- **What connects `Wait for server to be ready by polling the port.`, `POST`, `GET` to the rest of the system?**
  _204 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.051425213047311194 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.0635814889336016 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.070578231292517 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.044444444444444446 - nodes in this community are weakly interconnected._