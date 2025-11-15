# ChatKit Incident Management Demo

Enterprise-grade incident management system demonstrating OpenAI ChatKit with role-based access control and identity propagation.

## Overview

This prototype showcases:
- **Single Shared Agent**: One incident management agent serves all departments
- **Identity Propagation**: User roles (IT, Ops, Finance, CSM) flow through entire tool chain
- **Role-Based Access Control**: Tool-level permissions based on user identity
- **Embedded ChatKit UI**: Custom React components with ChatKit integration

## Architecture

### Backend (FastAPI + ChatKit Server)
- Custom ChatKit server implementation
- Identity extraction from request headers
- Role-based tool filtering
- SQLite storage for incidents and threads

### Roles & Permissions

| Role | Capabilities |
|------|-------------|
| **IT Admin** | View logs, restart services, run diagnostics |
| **Operations Director** | Set priority, allocate resources, view business impact |
| **Finance Controller** | View costs, approve emergency spending, view SLA penalties |
| **Customer Success Manager** | View affected customers, send notifications |

## Setup

### Prerequisites
- Python 3.10+
- OpenAI API key

### Installation

```bash
cd backend
pip install -r requirements.txt
```

### Configuration

1. Copy `.env` and add your OpenAI API key:
```bash
OPENAI_API_KEY=your_key_here
```

### Running

```bash
cd backend
python main.py
```

Server runs on `http://localhost:8000`

## API Usage

### Test with different roles

```bash
# IT Admin request
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -H "X-User-Role: IT" \
  -H "X-User-Id: it-admin-001" \
  -d '{"message": "What technical logs are available?"}'

# Operations Director request
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -H "X-User-Role: OPS" \
  -H "X-User-Id: ops-director-001" \
  -d '{"message": "Set incident priority to P1"}'
```

## Development Roadmap

- [x] FastAPI backend with ChatKit server
- [x] Identity propagation
- [x] Role-based tools
- [ ] React dashboard with embedded ChatKit
- [ ] Visual access matrix
- [ ] Real-time incident updates across roles
