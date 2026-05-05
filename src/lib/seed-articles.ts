import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://wnzxztcrtksiuhwbyctd.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Induenh6dGNydGtzaXVod2J5Y3RkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Nzg4NDEzNywiZXhwIjoyMDkzNDYwMTM3fQ.RsKNvK61Bo0DfTb8PfWTzXMTK3AAT1JpEzDVDV_nK30"
);

const AUTHOR_ID = "ee9213d6-536f-4fd7-aea3-440a1312bdbf";

const articles = [
  {
    slug: "grpc-go-microservices",
    title: "Practical Guide to gRPC in Go Microservices",
    excerpt: "Learn how to design, implement, and deploy high-performance gRPC microservices in Go, from protobuf definitions to production patterns.",
    category_slug: "development",
    tag_slugs: ["go"],
    reading_time: 12,
    content: `## Why gRPC for Microservices?

When building distributed systems, the choice of communication protocol shapes everything from latency to developer experience. gRPC has emerged as the go-to choice for service-to-service communication, and Go's first-class protobuf support makes this combination particularly powerful.

## Setting Up Your First Service

\`\`\`go
// greeter.proto
syntax = "proto3";
package greeter;
option go_package = "github.com/example/greeter/proto";

service Greeter {
  rpc SayHello (HelloRequest) returns (HelloReply);
}

message HelloRequest {
  string name = 1;
}

message HelloReply {
  string message = 1;
}
\`\`\`

The protobuf definition serves as the single source of truth for your API contract. Generate Go code with \`protoc\`:

\`\`\`bash
protoc --go_out=. --go-grpc_out=. greeter.proto
\`\`\`

## Server Implementation

\`\`\`go
type server struct {
  pb.UnimplementedGreeterServer
}

func (s *server) SayHello(ctx context.Context, req *pb.HelloRequest) (*pb.HelloReply, error) {
  return &pb.HelloReply{Message: "Hello, " + req.Name}, nil
}

func main() {
  lis, _ := net.Listen("tcp", ":50051")
  s := grpc.NewServer()
  pb.RegisterGreeterServer(s, &server{})
  s.Serve(lis)
}
\`\`\`

## Connection Pooling and Load Balancing

In production, you'll want client-side load balancing. Go's gRPC client supports this natively:

\`\`\`go
conn, err := grpc.Dial(
  "dns:///greeter-service:50051",
  grpc.WithDefaultServiceConfig(\`{"loadBalancingPolicy":"round_robin"}\`),
  grpc.WithInsecure(),
)
\`\`\`

## Related Topics

- How gRPC streaming compares to WebSockets — see [[scalable-apis]] for REST vs gRPC trade-offs
- Type safety across service boundaries — see [[deep-dive]] for TypeScript's decorator approach to API contracts
`,
  },
  {
    slug: "docker-to-kubernetes-migration",
    title: "Docker to Kubernetes: A Migration Playbook",
    excerpt: "A step-by-step guide to migrating from Docker Compose to Kubernetes, covering pod design, service mesh, and production deployment strategies.",
    category_slug: "infrastructure",
    tag_slugs: ["docker", "kubernetes"],
    reading_time: 15,
    content: `## Why Migrate from Docker Compose to Kubernetes?

Docker Compose excels at local development, but as your application grows, you need orchestration. Kubernetes provides automated rollouts, self-healing, horizontal scaling, and declarative configuration — capabilities that Compose simply doesn't offer.

## Mapping Compose Concepts to Kubernetes

| Docker Compose | Kubernetes |
|---------------|------------|
| Service | Deployment + Service |
| Network | Internal DNS (ClusterIP) |
| Volume | PersistentVolume + PVC |
| Environment | ConfigMap / Secret |
| depends_on | Init Containers |

## Step 1: Containerizing with Production in Mind

Before migrating, ensure your [[docker]] images follow best practices:

\`\`\`dockerfile
FROM golang:1.24-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o server .

FROM alpine:3.21
RUN apk add --no-cache ca-certificates
COPY --from=builder /app/server /server
USER 1000
ENTRYPOINT ["/server"]
\`\`\`

## Step 2: Creating Kubernetes Manifests

\`\`\`yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-server
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api-server
  template:
    metadata:
      labels:
        app: api-server
    spec:
      containers:
        - name: api
          image: registry.example.com/api:latest
          ports:
            - containerPort: 8080
          readinessProbe:
            httpGet:
              path: /healthz
              port: 8080
            initialDelaySeconds: 5
          resources:
            requests:
              memory: "128Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "500m"
\`\`\`

## Service Mesh Considerations

Once you have dozens of services, a service mesh like Istio or Linkerd becomes essential for observability, traffic management, and security. Linkerd is the pragmatic choice — minimal overhead, simple configuration.

\`\`\`bash
linkerd install | kubectl apply -f -
kubectl annotate deployment api-server linkerd.io/inject=enabled
\`\`\`

With the sidecar injected, you get mTLS, latency metrics, and retry policies without changing application code.

## Production Checklist

- Set resource requests and limits on every container
- Use PodDisruptionBudgets for voluntary disruptions
- Configure HPA with both CPU and memory targets
- Enable audit logging on the API server
- Use NetworkPolicies to restrict inter-pod traffic

## Related Articles

- [[scalable-apis]] covers the API patterns that make Kubernetes-native services reliable
- [[deep-dive]] examines the type-safe contracts that underpin service communication
`,
  },
  {
    slug: "css-container-style-queries",
    title: "Mastering CSS Container Queries and Style Queries",
    excerpt: "Container queries and style queries represent the biggest CSS evolution since Flexbox. Learn how to build truly responsive components that adapt to their context.",
    category_slug: "frontend",
    tag_slugs: ["css"],
    reading_time: 10,
    content: `## Beyond Media Queries

For over a decade, @media queries were our only tool for responsive design. They work at the _page_ level but fail at the _component_ level. A card component doesn't care about the viewport width — it cares about the width of its container.

## Container Queries: The Basics

\`\`\`css
.card-wrapper {
  container-type: inline-size;
  container-name: card;
}

@container card (min-width: 400px) {
  .card {
    display: grid;
    grid-template-columns: 200px 1fr;
    gap: 1.5rem;
  }
  .card__image {
    aspect-ratio: 1;
  }
}

@container card (max-width: 399px) {
  .card {
    display: flex;
    flex-direction: column;
  }
}
\`\`\`

## Style Queries: The New Frontier

Style queries let you query a parent's computed style. This is revolutionary for theme-aware components and design system tokens:

\`\`\`css
.theme-provider {
  --theme: "dark";
}

@container style(--theme: "dark") {
  .data-card {
    background: hsl(220 15% 12%);
    border-color: hsl(220 15% 20%);
  }
}

@container style(--theme: "light") {
  .data-card {
    background: hsl(220 15% 98%);
    border-color: hsl(220 15% 90%);
  }
}
\`\`\`

## Combining Container and Style Queries

The real power emerges when you combine both:

\`\`\`css
.sidebar {
  container-type: inline-size;
  --density: "comfortable";
}

@container (min-width: 300px) and style(--density: "comfortable") {
  .nav-item {
    padding-block: 0.75rem;
    font-size: 0.9375rem;
  }
}

@container (min-width: 300px) and style(--density: "compact") {
  .nav-item {
    padding-block: 0.375rem;
    font-size: 0.8125rem;
  }
}
\`\`\`

## Browser Support and Progressive Enhancement

As of 2026, container queries are supported in all modern browsers. Style queries are available in Chrome, Edge, and Safari. For Firefox, provide a sensible fallback:

\`\`\`css
/* Fallback when style queries aren't supported */
.nav-item {
  padding-block: 0.5rem;
}

/* Enhanced when supported */
@container style(--density: "comfortable") {
  .nav-item { padding-block: 0.75rem; }
}
\`\`\`

## Related Topics

- [[server-components]] explores how RSC patterns influence CSS architecture
- [[deep-dive]] covers TypeScript patterns for type-safe design tokens
`,
  },
  {
    slug: "rag-langchain-postgresql",
    title: "Building RAG Applications with LangChain and PostgreSQL",
    excerpt: "Build a production-ready Retrieval-Augmented Generation system combining LangChain's orchestration layer with PostgreSQL's pgvector for semantic search.",
    category_slug: "ai",
    tag_slugs: ["llm", "langchain", "python", "postgresql"],
    reading_time: 14,
    content: `## What is RAG and Why Does It Matter?

Retrieval-Augmented Generation (RAG) is the architectural pattern that grounds [[llm]] outputs in your actual data. Instead of relying on the model's training data (which is frozen in time), RAG retrieves relevant documents at query time and injects them into the prompt.

## Architecture Overview

\`\`\`
User Query → Embedding → pgvector Search → Retrieved Docs
                                                    ↓
User Answer ← LLM ← Augmented Prompt (query + docs)
\`\`\`

## Setting Up pgvector

Enable the pgvector extension in your [[postgresql]] database:

\`\`\`sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX ON documents USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
\`\`\`

## Document Ingestion Pipeline

\`\`\`python
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import PGVector

embeddings = OpenAIEmbeddings(model="text-embedding-3-small")

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50,
    separators=["\\n\\n", "\\n", ". ", " ", ""]
)

vectorstore = PGVector(
    connection_string=os.environ["DATABASE_URL"],
    embedding_function=embeddings,
    collection_name="knowledge_base",
)
\`\`\`

## Building the RAG Chain

\`\`\`python
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser

prompt = ChatPromptTemplate.from_template("""\\
Answer the question based on the following context.
If you cannot answer from the context, say so.

Context:
{context}

Question: {question}
""")

llm = ChatOpenAI(model="gpt-4o", temperature=0)

chain = (
    {"context": vectorstore.as_retriever(search_kwargs={"k": 4}),
     "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)

response = chain.invoke("How do I configure pgvector indexes?")
\`\`\`

## Production Considerations

### Re-ranking for Better Relevance

The initial vector search returns candidates, but a re-ranker (like Cohere's) improves precision:

\`\`\`python
from langchain.retrievers import ContextualCompressionRetriever
from langchain_cohere import CohereRerank

compressor = CohereRerank(top_n=3)
retriever = ContextualCompressionRetriever(
    base_compressor=compressor,
    base_retriever=vectorstore.as_retriever(search_kwargs={"k": 10})
)
\`\`\`

### Caching Embeddings

Use PostgreSQL itself as a cache for embeddings to avoid re-computing:

\`\`\`sql
CREATE UNIQUE INDEX idx_documents_content_hash
  ON documents (md5(content));
\`\`\`

## Monitoring RAG Quality

Track these metrics in production:
- **Retrieval precision**: What fraction of retrieved chunks are relevant?
- **Answer faithfulness**: Does the answer stay grounded in the context?
- **Latency breakdown**: Embedding time vs. retrieval time vs. LLM inference

## Related Articles

- [[scalable-apis]] covers building the API layer that serves your RAG application
- [[server-components]] explores RSC streaming patterns for AI-generated content
`,
  },
  {
    slug: "oauth2-nextjs-implementation",
    title: "Implementing OAuth 2.0 and OpenID Connect in Next.js",
    excerpt: "A complete guide to adding social login and OAuth 2.0 authentication to your Next.js application, covering both server-side and client-side flows.",
    category_slug: "security",
    tag_slugs: ["nextjs", "typescript"],
    reading_time: 13,
    content: `## The OAuth 2.0 Landscape

OAuth 2.0 is the industry-standard protocol for authorization, and OpenID Connect (OIDC) extends it for authentication. Understanding the difference is crucial: OAuth grants access to resources, OIDC verifies identity.

## Authorization Code Flow (PKCE)

For modern SPAs and server-rendered apps, the Authorization Code flow with PKCE is the recommended approach. Here's how it works in a [[nextjs]] application:

\`\`\`typescript
// app/auth/callback/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  // Verify state to prevent CSRF
  const storedState = request.cookies.get("oauth_state")?.value;
  if (state !== storedState) {
    return NextResponse.redirect(new URL("/login?error=invalid_state", request.url));
  }

  // Exchange code for tokens
  const tokenResponse = await fetch("https://provider.example.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code,
      client_id: process.env.OAUTH_CLIENT_ID,
      code_verifier: request.cookies.get("code_verifier")?.value,
      grant_type: "authorization_code",
      redirect_uri: process.env.OAUTH_REDIRECT_URI,
    }),
  });

  const tokens = await tokenResponse.json();

  // Store refresh token securely (httpOnly cookie)
  const response = NextResponse.redirect(new URL("/dashboard", request.url));
  response.cookies.set("refresh_token", tokens.refresh_token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60,
    path: "/",
  });

  return response;
}
\`\`\`

## Generating the PKCE Challenge

\`\`\`typescript
// lib/oauth/pkce.ts
export function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64URLEncode(array);
}

export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return base64URLEncode(new Uint8Array(digest));
}

function base64URLEncode(buffer: Uint8Array): string {
  return btoa(String.fromCharCode(...buffer))
    .replace(/\\+/g, "-")
    .replace(/\\//g, "_")
    .replace(/=+$/, "");
}
\`\`\`

## Token Refresh Strategy

Access tokens expire quickly (typically 1 hour). Implement a refresh middleware:

\`\`\`typescript
// lib/oauth/refresh.ts
export async function refreshAccessToken(refreshToken: string) {
  const response = await fetch("https://provider.example.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: process.env.OAUTH_CLIENT_ID,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to refresh token — user must re-authenticate");
  }

  const tokens = await response.json();
  return {
    accessToken: tokens.access_token,
    expiresAt: Date.now() + tokens.expires_in * 1000,
    refreshToken: tokens.refresh_token ?? refreshToken,
  };
}
\`\`\`

## Session Management with Supabase

If you're using [[postgresql]] and Supabase, you can delegate OAuth entirely:

\`\`\`typescript
// auth.server.ts
import { createClient } from "@/lib/supabase/server";

export async function signInWithGoogle() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: \`\${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback\`,
      queryParams: { access_type: "offline", prompt: "consent" },
    },
  });
  return { data, error };
}
\`\`\`

## Security Checklist

- Always validate the \`state\` parameter to prevent CSRF attacks
- Store refresh tokens in httpOnly, Secure, SameSite cookies — never localStorage
- Use PKCE even for confidential clients (defense in depth)
- Validate JWT \`aud\`, \`iss\`, and \`exp\` claims
- Rotate refresh tokens on each use
- Set short access token lifetimes (15-60 minutes)

## Related Articles

- [[server-components]] — how auth state flows through React Server Components
- [[scalable-apis]] — API patterns that complement OAuth-protected endpoints
`,
  },
  {
    slug: "cross-platform-2026",
    title: "Cross-Platform Development in 2026: React Native vs Flutter",
    excerpt: "An honest comparison of React Native and Flutter for cross-platform mobile development in 2026, covering performance, developer experience, and ecosystem maturity.",
    category_slug: "mobile",
    tag_slugs: ["flutter", "react"],
    reading_time: 11,
    content: `## The State of Cross-Platform in 2026

The cross-platform debate has evolved far beyond "write once, run anywhere." Today's frameworks deliver near-native performance, platform-specific APIs, and rich ecosystems. The choice between React Native and Flutter shapes your team's velocity, hireability, and long-term maintenance burden.

## Performance: The Gap Has Narrowed

### Flutter's Rendering Advantage

Flutter uses Skia/Impeller to draw directly on the canvas, bypassing platform UI components entirely. This means consistent 60fps animations and identical rendering across platforms:

\`\`\`dart
class AnimatedFab extends StatefulWidget {
  @override
  _AnimatedFabState createState() => _AnimatedFabState();
}

class _AnimatedFabState extends State<AnimatedFab>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: Duration(milliseconds: 300),
      vsync: this,
    );
  }
}
\`\`\`

### React Native's New Architecture

React Native's Fabric renderer and TurboModules have closed the performance gap significantly. The new architecture eliminates the async bridge bottleneck that plagued earlier versions:

\`\`\`typescript
// With TurboModules, native calls are synchronous when possible
import { NativeModules } from 'react-native';

const { HeavyComputation } = NativeModules;

// This now runs on a background thread via TurboModule
const result = await HeavyComputation.processLargeDataset(data);
\`\`\`

## Developer Experience

| Aspect | React Native | Flutter |
|--------|-------------|---------|
| Language | JavaScript/TypeScript | Dart |
| Hot Reload | Fast Refresh (sub-second) | Hot Reload (sub-second) |
| UI Paradigm | Declarative (JSX) | Declarative (Widget tree) |
| State Management | React ecosystem (Zustand, Jotai) | Riverpod, Bloc |
| Learning Curve | Shallow (web devs feel at home) | Steep (Dart + widget model) |
| Debugging | React DevTools + Flipper | DevTools suite |

## Ecosystem and Third-Party Libraries

React Native's npm ecosystem is larger (2M+ packages), but many aren't mobile-compatible. Flutter's pub.dev is smaller but more curated:

\`\`\`bash
# React Native — leveraging the web ecosystem
npm install @tanstack/react-query react-native-reanimated

# Flutter — purpose-built packages
flutter pub add flutter_bloc drift_sqflite
\`\`\`

## When to Choose Each

**Choose React Native if:**
- Your team already knows React/TypeScript
- You need to share code with a web app ([[nextjs]] monorepo)
- You're building a content-driven app with standard UI patterns
- Time-to-market is the priority

**Choose Flutter if:**
- You need pixel-perfect custom UI and animations
- Your app is graphically intensive (charts, canvases, custom painters)
- You're building for desktop (Windows, macOS, Linux) alongside mobile
- Performance consistency across low-end devices matters

## The Third Option: Kotlin Multiplatform

KMP has matured rapidly. It shares business logic while keeping platform-native UI. Worth considering for teams with strong Kotlin investment, but the ecosystem is still smaller than RN or Flutter.

## Real-World Data Point

A 2026 survey of 5,000 mobile developers shows:
- 42% use React Native as primary framework
- 35% use Flutter
- 12% use native-only (Swift/Kotlin)
- 8% use KMP
- 3% use other (Ionic, Xamarin, etc.)

## Related Articles

- [[deep-dive]] — TypeScript patterns that apply equally to React and React Native
- [[docker-to-kubernetes-migration]] — deploying your mobile API backend
- [[css-container-style-queries]] — the CSS evolution that influences mobile-first design thinking
`,
  },
];

async function main() {
  for (const article of articles) {
    // Get category ID
    const { data: catData } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", article.category_slug)
      .single();

    if (!catData) {
      console.error(`Category not found: ${article.category_slug}`);
      continue;
    }

    // Get tag IDs
    const tagIds: string[] = [];
    for (const tagSlug of article.tag_slugs) {
      const { data: tagData } = await supabase
        .from("tags")
        .select("id")
        .eq("slug", tagSlug)
        .single();
      if (tagData) tagIds.push(tagData.id);
    }

    // Insert post
    const { data: post, error } = await supabase
      .from("posts")
      .insert({
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt,
        content: article.content,
        published: true,
        category_id: catData.id,
        author_id: AUTHOR_ID,
        reading_time: article.reading_time,
        published_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select("id")
      .single();

    if (error) {
      console.error(`Failed to insert ${article.slug}:`, error.message);
      continue;
    }

    console.log(`Created: ${article.slug} (${post.id})`);

    // Insert post_tags
    if (tagIds.length > 0) {
      const { error: tagError } = await supabase
        .from("post_tags")
        .insert(tagIds.map((tagId) => ({ post_id: post.id, tag_id: tagId })));

      if (tagError) {
        console.error(`  Tags failed for ${article.slug}:`, tagError.message);
      } else {
        console.log(`  Tags: ${article.tag_slugs.join(", ")}`);
      }
    }
  }

  console.log("\nDone seeding articles!");
}

main();
