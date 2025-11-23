"""
Data models for incident management system.
"""
from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from typing import Optional, List


class Role(str, Enum):
    """User roles in the system."""
    IT = "IT"
    OPS = "OPS"
    FINANCE = "FINANCE"
    CSM = "CSM"


class IncidentPriority(str, Enum):
    """Incident priority levels."""
    P1 = "P1"  # Critical
    P2 = "P2"  # High
    P3 = "P3"  # Medium
    P4 = "P4"  # Low


class IncidentStatus(str, Enum):
    """Incident status."""
    OPEN = "OPEN"
    INVESTIGATING = "INVESTIGATING"
    RESOLVED = "RESOLVED"
    CLOSED = "CLOSED"


@dataclass
class UserContext:
    """User identity and permissions context."""
    user_id: str
    role: Role
    permissions: List[str]

    @property
    def display_name(self) -> str:
        """Get friendly display name for role."""
        names = {
            Role.IT: "IT Admin",
            Role.OPS: "Operations Director",
            Role.FINANCE: "Finance Controller",
            Role.CSM: "Customer Success Manager"
        }
        return names.get(self.role, str(self.role))


@dataclass
class Incident:
    """Incident data model."""
    incident_id: str
    title: str
    description: str
    priority: IncidentPriority
    status: IncidentStatus
    affected_systems: List[str]
    affected_customers: int
    estimated_cost: float
    sla_penalty: float
    created_at: datetime
    created_by: str
    updated_at: datetime

    def to_dict(self) -> dict:
        """Convert to dictionary."""
        return {
            "incident_id": self.incident_id,
            "title": self.title,
            "description": self.description,
            "priority": self.priority.value,
            "status": self.status.value,
            "affected_systems": self.affected_systems,
            "affected_customers": self.affected_customers,
            "estimated_cost": self.estimated_cost,
            "sla_penalty": self.sla_penalty,
            "created_at": self.created_at.isoformat(),
            "created_by": self.created_by,
            "updated_at": self.updated_at.isoformat()
        }

    def get_filtered_view(self, role: Role) -> dict:
        """Get role-filtered view of incident data."""
        base_data = {
            "incident_id": self.incident_id,
            "title": self.title,
            "priority": self.priority.value,
            "status": self.status.value,
        }

        # IT sees technical details
        if role == Role.IT:
            base_data.update({
                "description": self.description,
                "affected_systems": self.affected_systems,
            })

        # Ops sees business impact
        if role == Role.OPS:
            base_data.update({
                "description": self.description,
                "affected_systems": self.affected_systems,
                "affected_customers": self.affected_customers,
            })

        # Finance sees cost implications
        if role == Role.FINANCE:
            base_data.update({
                "affected_customers": self.affected_customers,
                "estimated_cost": self.estimated_cost,
                "sla_penalty": self.sla_penalty,
            })

        # CSM sees customer impact
        if role == Role.CSM:
            base_data.update({
                "affected_customers": self.affected_customers,
                "description": self.description,
            })

        return base_data


# Permission constants
PERMISSIONS = {
    Role.IT: [
        "view_technical_logs",
        "restart_service",
        "run_diagnostics",
        "view_incident_details",
        "create_incident",
    ],
    Role.OPS: [
        "view_incident_details",
        "set_incident_priority",
        "allocate_resources",
        "view_business_impact",
        "view_affected_customers",
    ],
    Role.FINANCE: [
        "view_incident_details",
        "view_cost_impact",
        "approve_emergency_spending",
        "view_sla_penalties",
        "view_affected_customers",
    ],
    Role.CSM: [
        "view_incident_details",
        "notify_customers",
        "view_affected_customers",
        "view_customer_slas",
    ],
}

@dataclass
class IncidentUserContext:
    user_context: UserContext

