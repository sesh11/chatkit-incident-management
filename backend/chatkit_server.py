"""
ChatKit Server implementation with identity propagation.
"""
import json
from typing import AsyncIterator, Dict, Any
from datetime import datetime
from chatkit.server import ChatKitServer, ThreadStreamEvent
from chatkit.types import (
    ThreadItemAddedEvent,
    ThreadItemUpdated,
    ThreadItemDoneEvent,
    AssistantMessageItem,
    AssistantMessageContent,
    AssistantMessageContentPartAdded,
    AssistantMessageContentPartTextDelta,
    ErrorEvent,
)
from chatkit.store import default_generate_id
from agent import create_incident_agent
from models import IncidentUserContext
from agents import Runner, ItemHelpers
from store import chat_store


class IncidentChatKitServer(ChatKitServer):
    """
    Custom ChatKit server for incident management.
    Propagates user identity through all operations.
    """

    def __init__(self):
        """
        Initialize the ChatKit server.

        Args:
            api_key: OpenAI API key
        """
        super().__init__(store=chat_store)
        self.accumulated_text = ""  # Track accumulated text for final message

    async def respond(
        self,
        thread,
        input,
        context: Dict[str, Any]
    ) -> AsyncIterator[ThreadStreamEvent]:
        """
        Respond to user input with identity-aware processing and streaming.

        This is the core method called by ChatKit when a user sends a message.
        It receives the thread, user input, and context (which includes user identity).

        Args:
            thread: ChatKit thread object
            input: User input from ChatKit
            context: Request context containing user identity

        Yields:
            ThreadStreamEvent objects for streaming to UI
        """
        # Extract user context from request context
        incident_user_context: IncidentUserContext = context.get('user_context')

        if not incident_user_context:
            # Yield error event if no user context
            yield ErrorEvent(
                code="authentication_required",
                message="No user context provided",
                allow_retry=False
            )
            return

        # Extract user message text
        user_message = ""
        if hasattr(input, 'content'):
            if isinstance(input.content, list):
                for item in input.content:
                    if hasattr(item, 'text'):
                        user_message += item.text
            elif isinstance(input.content, str):
                user_message = input.content
        else:
            user_message = str(input)

        try:
            # Create agent
            agent = create_incident_agent(incident_user_context.user_context.role)

            # Create assistant message item
            item_id = default_generate_id("message")
            self.accumulated_text = ""  # Reset accumulated text

            assistant_item = AssistantMessageItem(
                id=item_id,
                thread_id=thread.id,
                created_at=datetime.now(),
                content=[]  # Start empty, will be populated via deltas
            )

            # Yield ThreadItemAddedEvent to add the item to the thread
            yield ThreadItemAddedEvent(item=assistant_item)

            # Stream agent responses and transform to ChatKit events
            result = Runner.run_streamed(agent, input=user_message, context=incident_user_context)
            async for event in result.stream_events():
                chatkit_event = self._transform_event(event, item_id)
                if chatkit_event:
                    yield chatkit_event

            # Yield ThreadItemDoneEvent with complete message
            final_item = AssistantMessageItem(
                id=item_id,
                thread_id=thread.id,
                created_at=assistant_item.created_at,
                content=[AssistantMessageContent(text=self.accumulated_text)]
            )
            yield ThreadItemDoneEvent(item=final_item)

        except Exception as e:
            # Yield error event
            import traceback
            traceback.print_exc()
            yield ErrorEvent(
                code="processing_error",
                message=f"Error processing request: {str(e)}",
                allow_retry=True
            )

    def _transform_event(self, agent_event: Dict[str, Any], item_id: str) -> ThreadStreamEvent | None:
        """Transform Agents SDK events to ChatKit ThreadStreamEvent objects."""

        if agent_event.type == "run_item_stream_event":

            # Skip tool calls for now - can be added later
            if agent_event.item.type == "tool_call_item":
                return None

            elif agent_event.item.type == "tool_call_output_item":
                return None

            # Stream assistant message text as deltas
            elif agent_event.item.type == "message_output_item":
                text = ItemHelpers.text_message_output(agent_event.item)

                # Accumulate text for final message
                self.accumulated_text += text

                # Return ThreadItemUpdated with text delta
                return ThreadItemUpdated(
                    item_id=item_id,
                    update=AssistantMessageContentPartTextDelta(
                        content_index=0,
                        delta=text
                    )
                )

        elif agent_event.type == "raw_response_event":
            # Skip raw events for ChatKit
            return None

        # Unknown event - skip
        return None
