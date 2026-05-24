import type { CanvasNode, CanvasEdge } from "@/types/canvas";

export interface CanvasTemplate {
  id: string;
  name: string;
  description: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}

function node(
  id: string,
  label: string,
  x: number,
  y: number,
  opts: {
    shape?: CanvasNode["data"]["shape"];
    color?: string;
    textColor?: string;
    w?: number;
    h?: number;
  } = {}
): CanvasNode {
  const { shape = "rectangle", color, textColor, w = 140, h = 44 } = opts;
  return {
    id,
    type: "canvasNode",
    position: { x, y },
    style: { width: w, height: h },
    data: { label, shape, color, textColor },
  };
}

function edge(id: string, source: string, target: string, label?: string): CanvasEdge {
  return {
    id,
    source,
    target,
    type: "canvasEdge",
    data: label ? { label } : {},
  };
}

// ── Microservices ──────────────────────────────────────────────────────────────

const microservicesNodes: CanvasNode[] = [
  node("gw", "API Gateway", 280, 0, { shape: "pill", color: "#10233D", textColor: "#52A8FF", w: 160, h: 44 }),
  node("auth", "Auth Service", 0, 120, { color: "#2E1938", textColor: "#BF7AF0" }),
  node("user", "User Service", 160, 120, { color: "#0F2E18", textColor: "#62C073" }),
  node("product", "Product Service", 320, 120, { color: "#331B00", textColor: "#FF990A" }),
  node("order", "Order Service", 480, 120, { color: "#3C1618", textColor: "#FF6166" }),
  node("auth-db", "Auth DB", 0, 230, { shape: "cylinder", color: "#1F1F1F", textColor: "#EDEDED", w: 140, h: 44 }),
  node("user-db", "User DB", 160, 230, { shape: "cylinder", color: "#1F1F1F", textColor: "#EDEDED", w: 140, h: 44 }),
  node("product-db", "Product DB", 320, 230, { shape: "cylinder", color: "#1F1F1F", textColor: "#EDEDED", w: 140, h: 44 }),
  node("order-db", "Order DB", 480, 230, { shape: "cylinder", color: "#1F1F1F", textColor: "#EDEDED", w: 140, h: 44 }),
];

const microservicesEdges: CanvasEdge[] = [
  edge("gw-auth", "gw", "auth"),
  edge("gw-user", "gw", "user"),
  edge("gw-product", "gw", "product"),
  edge("gw-order", "gw", "order"),
  edge("auth-db-e", "auth", "auth-db"),
  edge("user-db-e", "user", "user-db"),
  edge("product-db-e", "product", "product-db"),
  edge("order-db-e", "order", "order-db"),
];

// ── CI/CD Pipeline ─────────────────────────────────────────────────────────────

const cicdNodes: CanvasNode[] = [
  node("src", "Source Code", 0, 60, { shape: "rectangle", color: "#1F1F1F", textColor: "#EDEDED" }),
  node("build", "Build", 180, 60, { shape: "rectangle", color: "#10233D", textColor: "#52A8FF" }),
  node("test", "Test Suite", 360, 60, { shape: "rectangle", color: "#331B00", textColor: "#FF990A" }),
  node("docker", "Docker Build", 540, 60, { shape: "rectangle", color: "#062822", textColor: "#0AC7B4" }),
  node("registry", "Registry", 720, 60, { shape: "cylinder", color: "#2E1938", textColor: "#BF7AF0" }),
  node("staging", "Staging", 900, 0, { shape: "rectangle", color: "#0F2E18", textColor: "#62C073" }),
  node("prod", "Production", 900, 120, { shape: "pill", color: "#3C1618", textColor: "#FF6166", w: 140, h: 44 }),
];

const cicdEdges: CanvasEdge[] = [
  edge("src-build", "src", "build", "push"),
  edge("build-test", "build", "test"),
  edge("test-docker", "test", "docker", "pass"),
  edge("docker-registry", "docker", "registry"),
  edge("registry-staging", "registry", "staging", "auto"),
  edge("staging-prod", "staging", "prod", "approved"),
];

// ── Event-Driven System ────────────────────────────────────────────────────────

const eventDrivenNodes: CanvasNode[] = [
  node("svc-a", "Service A", 0, 40, { color: "#0F2E18", textColor: "#62C073" }),
  node("svc-b", "Service B", 0, 140, { color: "#10233D", textColor: "#52A8FF" }),
  node("svc-c", "Service C", 0, 240, { color: "#331B00", textColor: "#FF990A" }),
  node("broker", "Message Broker", 220, 140, { shape: "hexagon", color: "#2E1938", textColor: "#BF7AF0", w: 160, h: 60 }),
  node("cons-x", "Consumer X", 460, 40, { color: "#062822", textColor: "#0AC7B4" }),
  node("cons-y", "Consumer Y", 460, 140, { color: "#3A1726", textColor: "#F75F8F" }),
  node("cons-z", "Consumer Z", 460, 240, { color: "#3C1618", textColor: "#FF6166" }),
  node("db-x", "Store X", 640, 40, { shape: "cylinder", color: "#1F1F1F", textColor: "#EDEDED", w: 120, h: 44 }),
  node("db-y", "Store Y", 640, 140, { shape: "cylinder", color: "#1F1F1F", textColor: "#EDEDED", w: 120, h: 44 }),
  node("db-z", "Store Z", 640, 240, { shape: "cylinder", color: "#1F1F1F", textColor: "#EDEDED", w: 120, h: 44 }),
];

const eventDrivenEdges: CanvasEdge[] = [
  edge("a-broker", "svc-a", "broker"),
  edge("b-broker", "svc-b", "broker"),
  edge("c-broker", "svc-c", "broker"),
  edge("broker-x", "broker", "cons-x"),
  edge("broker-y", "broker", "cons-y"),
  edge("broker-z", "broker", "cons-z"),
  edge("x-db", "cons-x", "db-x"),
  edge("y-db", "cons-y", "db-y"),
  edge("z-db", "cons-z", "db-z"),
];

export const CANVAS_TEMPLATES: CanvasTemplate[] = [
  {
    id: "microservices",
    name: "Microservices",
    description: "API gateway routing traffic to independent services, each with its own database.",
    nodes: microservicesNodes,
    edges: microservicesEdges,
  },
  {
    id: "cicd-pipeline",
    name: "CI/CD Pipeline",
    description: "Source to production: build, test, containerize, push to registry, and deploy.",
    nodes: cicdNodes,
    edges: cicdEdges,
  },
  {
    id: "event-driven",
    name: "Event-Driven System",
    description: "Producer services publish to a message broker; consumers process and persist to their own stores.",
    nodes: eventDrivenNodes,
    edges: eventDrivenEdges,
  },
];
