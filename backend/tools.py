"""
Role-based tools for incident management.
Each tool checks permissions and propagates user identity.
"""
from typing import List, Dict, Any
from datetime import datetime
from auth import requires_permission, AuthenticationError
from models import UserContext, IncidentPriority, IncidentStatus, Role
from store import incident_store


# IT Admin Tools

@requires_permission("view_technical_logs")
def view_technical_logs(context: UserContext, incident_id: str) -> dict:
    """
    View technical logs for an incident.
    Only accessible by IT Admin.

    Args:
        context: User context with identity
        incident_id: Incident ID to view logs for

    Returns:
        Dictionary containing log entries
    """
    incident = incident_store.get_incident(incident_id)
    if not incident:
        return {"error": f"Incident {incident_id} not found"}

    # Simulate log retrieval
    logs = [
        {"timestamp": "2025-01-09 14:23:11", "level": "ERROR", "service": "PostgreSQL",
         "message": "Connection pool exhausted. Max connections: 100, Active: 100"},
        {"timestamp": "2025-01-09 14:23:45", "level": "ERROR", "service": "Redis",
         "message": "Cache service unresponsive. Timeout after 5000ms"},
        {"timestamp": "2025-01-09 14:24:02", "level": "WARN", "service": "API Gateway",
         "message": "High latency detected. P95: 3000ms (threshold: 500ms)"},
    ]

    return {
        "incident_id": incident_id,
        "logs": logs,
        "accessed_by": context.display_name,
        "timestamp": datetime.now().isoformat()
    }


@requires_permission("restart_service")
def restart_service(context: UserContext, service_name: str) -> dict:
    """
    Restart a service.
    Only accessible by IT Admin.

    Args:
        context: User context with identity
        service_name: Name of service to restart

    Returns:
        Status of restart operation
    """
    # Simulate service restart
    return {
        "service": service_name,
        "status": "restarted",
        "restarted_by": context.display_name,
        "user_id": context.user_id,
        "timestamp": datetime.now().isoformat(),
        "message": f"{service_name} has been successfully restarted"
    }


@requires_permission("run_diagnostics")
def run_diagnostics(context: UserContext, incident_id: str, diagnostic_type: str) -> dict:
    """
    Run diagnostic tests.
    Only accessible by IT Admin.

    Args:
        context: User context with identity
        incident_id: Incident ID
        diagnostic_type: Type of diagnostic (network, database, cache)

    Returns:
        Diagnostic results
    """
    results = {
        "network": {
            "latency_p50": "45ms",
            "latency_p95": "120ms",
            "packet_loss": "0.01%",
            "status": "healthy"
        },
        "database": {
            "connection_pool": "95/100 (95% utilization)",
            "query_time_p95": "3000ms",
            "active_connections": "95",
            "status": "degraded"
        },
        "cache": {
            "hit_rate": "45%",
            "memory_usage": "98%",
            "evictions_per_sec": "1500",
            "status": "critical"
        }
    }

    return {
        "incident_id": incident_id,
        "diagnostic_type": diagnostic_type,
        "results": results.get(diagnostic_type, {"error": "Unknown diagnostic type"}),
        "run_by": context.display_name,
        "timestamp": datetime.now().isoformat()
    }


# Operations Director Tools

@requires_permission("set_incident_priority")
def set_incident_priority(context: UserContext, incident_id: str, priority: str) -> dict:
    """
    Set incident priority level.
    Only accessible by Operations Director.

    Args:
        context: User context with identity
        incident_id: Incident ID
        priority: Priority level (P1, P2, P3, P4)

    Returns:
        Updated incident priority
    """
    try:
        priority_enum = IncidentPriority(priority.upper())
    except ValueError:
        return {"error": f"Invalid priority: {priority}. Must be P1, P2, P3, or P4"}

    success = incident_store.update_incident_priority(incident_id, priority_enum)

    if not success:
        return {"error": f"Incident {incident_id} not found"}

    return {
        "incident_id": incident_id,
        "priority": priority,
        "updated_by": context.display_name,
        "user_id": context.user_id,
        "timestamp": datetime.now().isoformat(),
        "message": f"Incident {incident_id} priority updated to {priority}"
    }


@requires_permission("view_business_impact")
def view_business_impact(context: UserContext, incident_id: str) -> dict:
    """
    View business impact metrics.
    Accessible by Operations Director.

    Args:
        context: User context with identity
        incident_id: Incident ID

    Returns:
        Business impact data
    """
    incident = incident_store.get_incident(incident_id)
    if not incident:
        return {"error": f"Incident {incident_id} not found"}

    return {
        "incident_id": incident_id,
        "affected_customers": incident.affected_customers,
        "customer_segments": {
            "enterprise": 50,
            "smb": 200,
            "free": 250
        },
        "revenue_at_risk": f"${incident.estimated_cost:,.2f}",
        "sla_violations": 12,
        "accessed_by": context.display_name,
        "timestamp": datetime.now().isoformat()
    }


@requires_permission("allocate_resources")
def allocate_resources(context: UserContext, incident_id: str, resource_type: str, amount: int) -> dict:
    """
    Allocate additional resources to address incident.
    Only accessible by Operations Director.

    Args:
        context: User context with identity
        incident_id: Incident ID
        resource_type: Type of resource (compute, storage, bandwidth)
        amount: Amount to allocate

    Returns:
        Resource allocation confirmation
    """
    return {
        "incident_id": incident_id,
        "resource_type": resource_type,
        "amount": amount,
        "allocated_by": context.display_name,
        "user_id": context.user_id,
        "timestamp": datetime.now().isoformat(),
        "message": f"Allocated {amount} units of {resource_type} to incident {incident_id}"
    }


# Finance Controller Tools

@requires_permission("approve_emergency_spending")
def approve_emergency_spending(context: UserContext, incident_id: str, amount: float, justification: str) -> dict:
    """
    Approve emergency spending for incident resolution.
    Only accessible by Finance Controller.

    Args:
        context: User context with identity
        incident_id: Incident ID
        amount: Amount to approve
        justification: Reason for spending

    Returns:
        Approval confirmation
    """
    return {
        "incident_id": incident_id,
        "amount": f"${amount:,.2f}",
        "justification": justification,
        "approved_by": context.display_name,
        "user_id": context.user_id,
        "approval_id": f"APR-{datetime.now().strftime('%Y%m%d%H%M%S')}",
        "timestamp": datetime.now().isoformat(),
        "message": f"Emergency spending of ${amount:,.2f} approved for incident {incident_id}"
    }


@requires_permission("view_cost_impact")
def view_cost_impact(context: UserContext, incident_id: str) -> dict:
    """
    View financial impact and cost implications.
    Accessible by Finance Controller.

    Args:
        context: User context with identity
        incident_id: Incident ID

    Returns:
        Cost impact data
    """
    incident = incident_store.get_incident(incident_id)
    if not incident:
        return {"error": f"Incident {incident_id} not found"}

    return {
        "incident_id": incident_id,
        "estimated_cost": f"${incident.estimated_cost:,.2f}",
        "sla_penalty_exposure": f"${incident.sla_penalty:,.2f}",
        "cost_breakdown": {
            "infrastructure": f"${incident.estimated_cost * 0.4:,.2f}",
            "labor": f"${incident.estimated_cost * 0.3:,.2f}",
            "customer_credits": f"${incident.estimated_cost * 0.3:,.2f}"
        },
        "accessed_by": context.display_name,
        "timestamp": datetime.now().isoformat()
    }


# Customer Success Manager Tools

@requires_permission("notify_customers")
def notify_customers(context: UserContext, incident_id: str, message: str, customer_segment: str = "all") -> dict:
    """
    Send notification to affected customers.
    Only accessible by Customer Success Manager.

    Args:
        context: User context with identity
        incident_id: Incident ID
        message: Notification message
        customer_segment: Target segment (enterprise, smb, free, all)

    Returns:
        Notification delivery status
    """
    incident = incident_store.get_incident(incident_id)
    if not incident:
        return {"error": f"Incident {incident_id} not found"}

    segment_counts = {
        "enterprise": 50,
        "smb": 200,
        "free": 250,
        "all": incident.affected_customers
    }

    recipients = segment_counts.get(customer_segment, 0)

    return {
        "incident_id": incident_id,
        "notification_id": f"NOTIF-{datetime.now().strftime('%Y%m%d%H%M%S')}",
        "recipients": recipients,
        "customer_segment": customer_segment,
        "message": message,
        "sent_by": context.display_name,
        "user_id": context.user_id,
        "timestamp": datetime.now().isoformat(),
        "status": "delivered"
    }


@requires_permission("view_affected_customers")
def view_affected_customers(context: UserContext, incident_id: str) -> dict:
    """
    View list of affected customers.
    Accessible by multiple roles with different levels of detail.

    Args:
        context: User context with identity
        incident_id: Incident ID

    Returns:
        Customer impact data (filtered by role)
    """
    incident = incident_store.get_incident(incident_id)
    if not incident:
        return {"error": f"Incident {incident_id} not found"}

    base_data = {
        "incident_id": incident_id,
        "total_affected": incident.affected_customers,
        "accessed_by": context.display_name,
        "timestamp": datetime.now().isoformat()
    }

    # CSM sees detailed customer info
    if context.role == Role.CSM:
        base_data["customer_details"] = [
            {"name": "Acme Corp", "tier": "Enterprise", "sla": "99.9%", "impact": "High"},
            {"name": "TechStart Inc", "tier": "SMB", "sla": "99.5%", "impact": "Medium"},
        ]

    return base_data


# Shared Tools (accessible by all roles with different data views)

@requires_permission("view_incident_details")
def view_incident_details(context: UserContext, incident_id: str) -> dict:
    """
    View incident details.
    Accessible by all roles but returns filtered data based on role.

    Args:
        context: User context with identity
        incident_id: Incident ID

    Returns:
        Incident details (filtered by role)
    """
    incident_data = incident_store.get_incident_for_role(incident_id, context.role)

    if not incident_data:
        return {"error": f"Incident {incident_id} not found"}

    incident_data["accessed_by"] = context.display_name
    incident_data["timestamp"] = datetime.now().isoformat()

    return incident_data


@requires_permission("create_incident")
def create_incident(
    context: UserContext,
    title: str,
    description: str,
    affected_systems: str
) -> dict:
    """
    Create a new incident.
    Typically accessible by IT Admin.

    Args:
        context: User context with identity
        title: Incident title
        description: Incident description
        affected_systems: Comma-separated list of affected systems

    Returns:
        Created incident details
    """
    systems_list = [s.strip() for s in affected_systems.split(',')]

    incident = incident_store.create_incident(
        title=title,
        description=description,
        affected_systems=systems_list,
        created_by=context.user_id
    )

    return {
        "incident_id": incident.incident_id,
        "title": incident.title,
        "status": incident.status.value,
        "priority": incident.priority.value,
        "created_by": context.display_name,
        "timestamp": incident.created_at.isoformat(),
        "message": f"Incident {incident.incident_id} created successfully"
    }


# Tool registry with metadata
TOOL_REGISTRY = {
    "view_technical_logs": {
        "function": view_technical_logs,
        "description": "View technical logs and error messages",
        "roles": [Role.IT],
        "parameters": ["incident_id"]
    },
    "restart_service": {
        "function": restart_service,
        "description": "Restart a service to resolve issues",
        "roles": [Role.IT],
        "parameters": ["service_name"]
    },
    "run_diagnostics": {
        "function": run_diagnostics,
        "description": "Run system diagnostics",
        "roles": [Role.IT],
        "parameters": ["incident_id", "diagnostic_type"]
    },
    "set_incident_priority": {
        "function": set_incident_priority,
        "description": "Update incident priority level",
        "roles": [Role.OPS],
        "parameters": ["incident_id", "priority"]
    },
    "view_business_impact": {
        "function": view_business_impact,
        "description": "View business and customer impact metrics",
        "roles": [Role.OPS],
        "parameters": ["incident_id"]
    },
    "allocate_resources": {
        "function": allocate_resources,
        "description": "Allocate additional infrastructure resources",
        "roles": [Role.OPS],
        "parameters": ["incident_id", "resource_type", "amount"]
    },
    "approve_emergency_spending": {
        "function": approve_emergency_spending,
        "description": "Approve emergency spending for incident resolution",
        "roles": [Role.FINANCE],
        "parameters": ["incident_id", "amount", "justification"]
    },
    "view_cost_impact": {
        "function": view_cost_impact,
        "description": "View financial costs and SLA penalties",
        "roles": [Role.FINANCE],
        "parameters": ["incident_id"]
    },
    "notify_customers": {
        "function": notify_customers,
        "description": "Send notifications to affected customers",
        "roles": [Role.CSM],
        "parameters": ["incident_id", "message", "customer_segment"]
    },
    "view_affected_customers": {
        "function": view_affected_customers,
        "description": "View list of affected customers",
        "roles": [Role.OPS, Role.FINANCE, Role.CSM],
        "parameters": ["incident_id"]
    },
    "view_incident_details": {
        "function": view_incident_details,
        "description": "View incident information (role-filtered)",
        "roles": [Role.IT, Role.OPS, Role.FINANCE, Role.CSM],
        "parameters": ["incident_id"]
    },
    "create_incident": {
        "function": create_incident,
        "description": "Create a new incident ticket",
        "roles": [Role.IT],
        "parameters": ["title", "description", "affected_systems"]
    },
}


def get_tools_for_role(role: Role) -> List[str]:
    """Get list of available tools for a specific role."""
    return [
        tool_name
        for tool_name, metadata in TOOL_REGISTRY.items()
        if role in metadata["roles"]
    ]
