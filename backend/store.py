"""
Data storage for incidents, threads, and messages.
"""
from datetime import datetime
from typing import Optional, List, Dict
from chatkit.server import Store, Thread, ThreadItem
from chatkit.store import Attachment
from models import Incident, IncidentPriority, IncidentStatus, Role


class IncidentStore:
    """
    In-memory storage for incidents.
    Can be easily swapped with SQLite/Postgres for production.
    """

    def __init__(self):
        self.incidents: Dict[str, Incident] = {}
        self._init_sample_incident()

    def _init_sample_incident(self):
        """Initialize with a sample incident for demo purposes."""
        sample_incident = Incident(
            incident_id="INC-001",
            title="Production Database Slowdown",
            description="Primary PostgreSQL database experiencing high latency. "
                       "Query response times increased from 50ms to 3000ms. "
                       "Cache service unresponsive.",
            priority=IncidentPriority.P2,
            status=IncidentStatus.INVESTIGATING,
            affected_systems=["PostgreSQL Primary", "Redis Cache", "API Gateway"],
            affected_customers=500,
            estimated_cost=25000.0,
            sla_penalty=50000.0,
            created_at=datetime.now(),
            created_by="system",
            updated_at=datetime.now()
        )
        self.incidents[sample_incident.incident_id] = sample_incident

    def get_incident(self, incident_id: str) -> Optional[Incident]:
        """Get incident by ID."""
        return self.incidents.get(incident_id)

    def get_incident_for_role(self, incident_id: str, role: Role) -> Optional[dict]:
        """Get role-filtered view of incident."""
        incident = self.get_incident(incident_id)
        if not incident:
            return None
        return incident.get_filtered_view(role)

    def list_incidents(self, role: Optional[Role] = None) -> List[dict]:
        """List all incidents, optionally filtered by role."""
        if role:
            return [inc.get_filtered_view(role) for inc in self.incidents.values()]
        return [inc.to_dict() for inc in self.incidents.values()]

    def create_incident(
        self,
        title: str,
        description: str,
        affected_systems: List[str],
        created_by: str
    ) -> Incident:
        """Create a new incident."""
        incident_id = f"INC-{len(self.incidents) + 1:03d}"
        incident = Incident(
            incident_id=incident_id,
            title=title,
            description=description,
            priority=IncidentPriority.P3,
            status=IncidentStatus.OPEN,
            affected_systems=affected_systems,
            affected_customers=0,
            estimated_cost=0.0,
            sla_penalty=0.0,
            created_at=datetime.now(),
            created_by=created_by,
            updated_at=datetime.now()
        )
        self.incidents[incident_id] = incident
        return incident

    def update_incident_priority(self, incident_id: str, priority: IncidentPriority) -> bool:
        """Update incident priority."""
        incident = self.get_incident(incident_id)
        if not incident:
            return False
        incident.priority = priority
        incident.updated_at = datetime.now()
        return True

    def update_incident_status(self, incident_id: str, status: IncidentStatus) -> bool:
        """Update incident status."""
        incident = self.get_incident(incident_id)
        if not incident:
            return False
        incident.status = status
        incident.updated_at = datetime.now()
        return True


class SimpleStore(Store):
    """
    Simple in-memory implementation of ChatKit Store interface.
    """

    def __init__(self):
        self.threads: Dict[str, Thread] = {}
        self.thread_items: Dict[str, List[ThreadItem]] = {}
        self.attachments: Dict[str, Attachment] = {}

    async def create_thread(self) -> Thread:
        """Create a new thread."""
        thread_id = f"thread_{len(self.threads) + 1}"
        thread = Thread(id=thread_id, metadata={})
        self.threads[thread_id] = thread
        self.thread_items[thread_id] = []
        return thread

    async def get_thread(self, thread_id: str) -> Optional[Thread]:
        """Get thread by ID."""
        return self.threads.get(thread_id)

    async def update_thread(self, thread_id: str, metadata: dict) -> Thread:
        """Update thread metadata."""
        thread = self.threads.get(thread_id)
        if not thread:
            raise ValueError(f"Thread {thread_id} not found")
        thread.metadata.update(metadata)
        return thread

    async def delete_thread(self, thread_id: str) -> bool:
        """Delete a thread."""
        if thread_id in self.threads:
            del self.threads[thread_id]
            if thread_id in self.thread_items:
                del self.thread_items[thread_id]
            return True
        return False

    async def add_thread_item(self, thread_id: str, item: ThreadItem) -> ThreadItem:
        """Add an item to a thread."""
        if thread_id not in self.thread_items:
            self.thread_items[thread_id] = []
        self.thread_items[thread_id].append(item)
        return item

    async def get_thread_items(self, thread_id: str) -> List[ThreadItem]:
        """Get all items in a thread."""
        return self.thread_items.get(thread_id, [])

    async def create_attachment(self, attachment: Attachment) -> Attachment:
        """Create an attachment."""
        self.attachments[attachment.id] = attachment
        return attachment

    async def get_attachment(self, attachment_id: str) -> Optional[Attachment]:
        """Get attachment by ID."""
        return self.attachments.get(attachment_id)

    # Required abstract methods from Store interface
    async def save_thread(self, thread: Thread) -> Thread:
        """Save a thread (create or update)."""
        self.threads[thread.id] = thread
        if thread.id not in self.thread_items:
            self.thread_items[thread.id] = []
        return thread

    async def load_thread(self, thread_id: str) -> Optional[Thread]:
        """Load a thread by ID."""
        return await self.get_thread(thread_id)

    async def load_threads(self) -> List[Thread]:
        """Load all threads."""
        return list(self.threads.values())

    async def save_item(self, thread_id: str, item: ThreadItem) -> ThreadItem:
        """Save a thread item."""
        return await self.add_thread_item(thread_id, item)

    async def load_item(self, thread_id: str, item_id: str) -> Optional[ThreadItem]:
        """Load a specific thread item by ID."""
        items = await self.get_thread_items(thread_id)
        for item in items:
            if item.id == item_id:
                return item
        return None

    async def load_thread_items(self, thread_id: str) -> List[ThreadItem]:
        """Load all items for a thread."""
        return await self.get_thread_items(thread_id)

    async def delete_thread_item(self, thread_id: str, item_id: str) -> bool:
        """Delete a thread item."""
        if thread_id not in self.thread_items:
            return False
        items = self.thread_items[thread_id]
        for i, item in enumerate(items):
            if item.id == item_id:
                del items[i]
                return True
        return False

    async def save_attachment(self, attachment: Attachment) -> Attachment:
        """Save an attachment."""
        return await self.create_attachment(attachment)

    async def load_attachment(self, attachment_id: str) -> Optional[Attachment]:
        """Load an attachment by ID."""
        return await self.get_attachment(attachment_id)

    async def delete_attachment(self, attachment_id: str) -> bool:
        """Delete an attachment."""
        if attachment_id in self.attachments:
            del self.attachments[attachment_id]
            return True
        return False


# Global store instances
incident_store = IncidentStore()
chat_store = SimpleStore()
