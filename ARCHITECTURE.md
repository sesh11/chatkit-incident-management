# System Architecture Diagram

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            FRONTEND (React + Vite)                       │
│                         http://localhost:5173                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │   MainPage   │  │    ITPage    │  │   OpsPage    │  │FinancePage │ │
│  │   (Router)   │  │              │  │              │  │            │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └─────┬──────┘ │
│         │                 │                  │                 │         │
│         └─────────────────┴──────────────────┴─────────────────┘         │
│                                      │                                   │
│                            ┌─────────▼──────────┐                        │
│                            │  ChatKitPanel.tsx  │                        │
│                            │  (Custom Config)   │                        │
│                            └─────────┬──────────┘                        │
│                                      │                                   │
│                            ┌─────────▼──────────┐                        │
│                            │ IncidentContext    │                        │
│                            │  (Global State)    │                        │
│                            └─────────┬──────────┘                        │
│                                      │                                   │
└──────────────────────────────────────┼───────────────────────────────────┘
                                       │
                        HTTP Headers:  │
                        X-User-Role    │
                        X-User-Id      │
                                       │
                        Vite Proxy:    │
                        /api/* → :8000 │
                                       │
┌──────────────────────────────────────▼───────────────────────────────────┐
│                      BACKEND (FastAPI + ChatKit Server)                   │
│                         http://localhost:8000                             │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                        main.py (FastAPI App)                         │ │
│  │  ┌────────────┐  ┌─────────────┐  ┌────────────┐  ┌─────────────┐ │ │
│  │  │POST /chat  │  │GET /incidents│  │GET /health │  │ Other APIs  │ │ │
│  │  └─────┬──────┘  └──────┬──────┘  └────────────┘  └─────────────┘ │ │
│  └────────┼────────────────┼────────────────────────────────────────────┘ │
│           │                │                                               │
│  ┌────────▼────────────────▼──────────────────────────┐                   │
│  │              auth.py (Identity Extraction)         │                   │
│  │        extract_user_context() → UserContext        │                   │
│  └────────┬───────────────────────────────────────────┘                   │
│           │                                                                │
│  ┌────────▼──────────────────────────────────────────────────────────┐   │
│  │               chatkit_server.py (Custom ChatKit Server)            │   │
│  │                                                                     │   │
│  │  ┌────────────────────┐         ┌──────────────────────┐          │   │
│  │  │ ChatKitIncident-   │         │  SimpleStore         │          │   │
│  │  │ ManagementServer   │────────▶│  (Thread Storage)    │          │   │
│  │  │                    │         └──────────────────────┘          │   │
│  │  │  - respond()       │                                            │   │
│  │  │  - process_tool()  │                                            │   │
│  │  │  - streaming SSE   │                                            │   │
│  │  └─────────┬──────────┘                                            │   │
│  └────────────┼───────────────────────────────────────────────────────┘   │
│               │                                                            │
│  ┌────────────▼─────────────────────────────────────────────────────┐    │
│  │                  agent.py (Agent Factory)                         │    │
│  │                                                                    │    │
│  │  create_agent(role: Role, user_context: IncidentUserContext)     │    │
│  │        │                                                           │    │
│  │        ├──▶ Load role-specific tools from tools.py               │    │
│  │        ├──▶ Configure GPT-5 model                                │    │
│  │        └──▶ Create Agent with custom instructions                │    │
│  └─────────┬──────────────────────────────────────────────────────────┘  │
│            │                                                               │
│  ┌─────────▼──────────────────────────────────────────────────────────┐  │
│  │                     tools.py (12 Role-Based Tools)                  │  │
│  │                                                                      │  │
│  │  IT Tools (5):                  OPS Tools (5):                      │  │
│  │  - view_system_logs             - update_priority                   │  │
│  │  - restart_service              - update_business_impact            │  │
│  │  - run_diagnostics              - allocate_resources                │  │
│  │  - view_incident_details        - view_incident_details             │  │
│  │  - create_incident              - list_affected_customers           │  │
│  │                                                                      │  │
│  │  FINANCE Tools (3):             CSM Tools (3):                      │  │
│  │  - approve_emergency_spending   - notify_affected_customers         │  │
│  │  - calculate_cost_impact        - view_customer_details             │  │
│  │  - view_incident_details        - view_incident_details             │  │
│  │                                                                      │  │
│  │  @requires_permission decorator → Permission checks                 │  │
│  └─────────┬────────────────────────────────────────────────────────────┘│
│            │                                                               │
│  ┌─────────▼──────────────┐      ┌──────────────────────────────┐       │
│  │   models.py            │      │      store.py                │       │
│  │                        │      │                              │       │
│  │  - Role (Enum)         │      │  - IncidentStore             │       │
│  │  - Incident            │◀─────┤  - incident_store singleton  │       │
│  │  - UserContext         │      │  - CRUD operations           │       │
│  │  - IncidentUserContext │      │  - Role-based filtering      │       │
│  │  - PERMISSIONS matrix  │      │                              │       │
│  └────────────────────────┘      └──────────────────────────────┘       │
│                                                                            │
└────────────────────────────────────┬───────────────────────────────────────┘
                                     │
                                     │ OpenAI Agents SDK
                                     │ ChatKit Server SDK
                                     │
                          ┌──────────▼──────────┐
                          │  EXTERNAL SERVICES  │
                          ├─────────────────────┤
                          │  - OpenAI API       │
                          │    (GPT-5 Model)    │
                          │                     │
                          │  - ChatKit CDN      │
                          │    (Web Components) │
                          └─────────────────────┘
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          REQUEST FLOW                                    │
└─────────────────────────────────────────────────────────────────────────┘

1. User Input
   │
   ▼
┌─────────────────────┐
│  ChatKit UI         │
│  (Frontend)         │
└──────────┬──────────┘
           │
           │ Custom fetch with headers:
           │ - X-User-Role: IT
           │ - X-User-Id: user@example.com
           │
           ▼
┌─────────────────────┐
│  Vite Proxy         │
│  /api/* → :8000     │
└──────────┬──────────┘
           │
           │ POST /api/chat
           │
           ▼
┌─────────────────────────────┐
│  FastAPI Endpoint           │
│  extract_user_context()     │
└──────────┬──────────────────┘
           │
           │ UserContext {role: IT, user_id: ...}
           │
           ▼
┌────────────────────────────────┐
│  ChatKit Server                │
│  respond() method              │
└──────────┬─────────────────────┘
           │
           │ IncidentUserContext
           │
           ▼
┌────────────────────────────────┐
│  Agent Factory                 │
│  create_agent(role, context)   │
└──────────┬─────────────────────┘
           │
           │ Agent with role-specific tools
           │
           ▼
┌────────────────────────────────┐
│  OpenAI Agents SDK             │
│  GPT-5 Model Processing        │
└──────────┬─────────────────────┘
           │
           │ Tool calls with context
           │
           ▼
┌────────────────────────────────┐
│  Tool Execution                │
│  - Permission check            │
│  - Execute with user context   │
│  - Return attributed result    │
└──────────┬─────────────────────┘
           │
           │ Tool results
           │
           ▼
┌────────────────────────────────┐
│  ChatKit Event Transformation  │
│  - ThreadItemAddedEvent        │
│  - ThreadItemUpdatedEvent      │
│  - ThreadItemDoneEvent         │
└──────────┬─────────────────────┘
           │
           │ SSE Stream
           │
           ▼
┌────────────────────────────────┐
│  Frontend ChatKit UI           │
│  Render streaming response     │
└────────────────────────────────┘
```

## Role-Based Access Control (RBAC)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         PERMISSION MATRIX                                │
├──────────────┬──────────────────────────────────────────────────────────┤
│   ROLE       │               PERMISSIONS                                 │
├──────────────┼──────────────────────────────────────────────────────────┤
│              │ - view_incident                                           │
│      IT      │ - view_technical_details                                  │
│              │ - restart_service                                         │
│              │ - view_logs                                               │
│              │ - run_diagnostics                                         │
│              │ - create_incident                                         │
├──────────────┼──────────────────────────────────────────────────────────┤
│              │ - view_incident                                           │
│      OPS     │ - update_priority                                         │
│              │ - update_status                                           │
│              │ - allocate_resources                                      │
│              │ - view_business_impact                                    │
│              │ - list_customers                                          │
├──────────────┼──────────────────────────────────────────────────────────┤
│              │ - view_incident                                           │
│   FINANCE    │ - view_cost_impact                                        │
│              │ - approve_spending                                        │
├──────────────┼──────────────────────────────────────────────────────────┤
│              │ - view_incident                                           │
│     CSM      │ - view_customer_impact                                    │
│              │ - notify_customers                                        │
└──────────────┴──────────────────────────────────────────────────────────┘

Identity Propagation:
HTTP Headers → UserContext → IncidentUserContext → Tool Execution
```

## Technology Stack

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                    │
├─────────────────────────────────────────────────────────────────────────┤
│  Framework:      React 19.2                                              │
│  Build Tool:     Vite 7.2                                                │
│  Routing:        React Router DOM 7.9                                    │
│  Styling:        TailwindCSS 4.1                                         │
│  ChatKit:        @openai/chatkit-react 1.2.3                            │
│  Animation:      Framer Motion                                           │
│  Notifications:  Sonner                                                  │
│  Icons:          Lucide React                                            │
│  Language:       TypeScript 5.9                                          │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                              BACKEND                                     │
├─────────────────────────────────────────────────────────────────────────┤
│  Framework:      FastAPI                                                 │
│  AI Platform:    OpenAI ChatKit Server SDK 1.1.2+                       │
│  Agents:         OpenAI Agents SDK 0.1.0+                               │
│  Model:          GPT-5                                                   │
│  Data Models:    Pydantic                                                │
│  Server:         Uvicorn (with hot reload)                               │
│  Language:       Python 3.10+                                            │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                         EXTERNAL SERVICES                                │
├─────────────────────────────────────────────────────────────────────────┤
│  - OpenAI API (GPT-5 Model)                                              │
│  - ChatKit CDN (cdn.platform.openai.com)                                 │
└─────────────────────────────────────────────────────────────────────────┘
```

## Module Dependencies

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         BACKEND DEPENDENCIES                             │
└─────────────────────────────────────────────────────────────────────────┘

main.py
  ├─▶ chatkit_server.py
  │     ├─▶ agent.py
  │     │     ├─▶ tools.py
  │     │     │     ├─▶ auth.py
  │     │     │     ├─▶ models.py
  │     │     │     └─▶ store.py
  │     │     └─▶ models.py
  │     └─▶ store.py (SimpleStore)
  ├─▶ auth.py
  ├─▶ models.py
  └─▶ store.py (IncidentStore)

┌─────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND DEPENDENCIES                             │
└─────────────────────────────────────────────────────────────────────────┘

main.tsx
  └─▶ App.tsx
        ├─▶ pages/MainPage.tsx
        ├─▶ pages/ITPage.tsx
        │     └─▶ components/panels/RolePanel.tsx
        │           ├─▶ components/chat/ChatKitPanel.tsx
        │           │     └─▶ context/IncidentContext.tsx
        │           └─▶ components/layout/IncidentSidebar.tsx
        │                 └─▶ context/IncidentContext.tsx
        ├─▶ pages/OperationsPage.tsx
        ├─▶ pages/FinancePage.tsx
        └─▶ pages/CustomerServicePage.tsx
```

## Key Features

1. **Single Shared Agent**: One incident management agent serves all departments with role-based tool access
2. **Identity Propagation**: User roles flow through entire stack (headers → context → tools)
3. **Custom ChatKit Integration**: Advanced custom backend configuration with header injection
4. **Streaming Support**: Server-Sent Events (SSE) for real-time agent responses
5. **Type Safety**: Full TypeScript in frontend, Pydantic in backend
6. **Modular Design**: Clear separation between auth, tools, storage, and presentation
7. **Demo-Ready**: Pre-loaded sample data, four separate UX pages per role
8. **In-Memory Storage**: Fast incident and thread storage for demo purposes
9. **Permission Decorators**: Clean, declarative permission checks on tools
10. **Role-Specific UX**: Each department gets tailored interface and capabilities

## Sample Data

**Pre-loaded Incident: INC-001**
- Title: Production Database Slowdown
- Status: CRITICAL
- Affected Systems: PostgreSQL, Redis, API Gateway
- Impact: 500 customers affected
- Cost: $25,000 direct cost
- SLA Penalty: $50,000 potential
- Departments: IT, OPS, FINANCE, CSM all involved
