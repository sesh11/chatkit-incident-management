"""
ChatKit Server implementation with identity propagation.
"""
import json
from typing import AsyncIterator, Dict, Any
from chatkit.server import ChatKitServer, ThreadStreamEvent
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

    async def respond(
        self,
        thread,
        input,
        context: Dict[str, Any]
    ) -> AsyncIterator[ThreadStreamEvent]:
        """
        Respond to user input with identity-aware processing.

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
            yield {
                "type": "error",
                "error": {
                    "message": "Authentication required: No user context provided"
                }
            }
            return

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
            agent = create_incident_agent(incident_user_context.user_context.role)
            # runner = Runner(agent=agent, ctx=incident_user_context)

            result = Runner.run_streamed(agent, input=user_message, context=incident_user_context)
            async for event in result.stream_events():
                chatkit_event = self._transform_event(event, incident_user_context)
                if chatkit_event:
                    yield chatkit_event
            async for event in Runner.run_streamed(agent, input=user_message, context=incident_user_context):
                chatkit_event = self._transform_event(event, incident_user_context)
                if chatkit_event:
                    yield chatkit_event
        except Exception as e:
            # Yield error event
            yield {
                "type": "error",
                "error": {
                    "message": f"Error processing request: {str(e)}",
                    "code": "processing_error"
                }
            }

    def _transform_event(self, agent_event: Dict[str, Any], user_context: IncidentUserContext) -> Dict[str, Any]:
        """Transform Agents SDK events to ChatKit events."""

        if agent_event.type == "run_item_stream_event":

          if agent_event.item.type == "tool_call_item":
              return {
                  "type": "tool.call.started",
                  "tool_call": {
                      "id": getattr(agent_event.item, 'id', ''),
                      "name": getattr(agent_event.item, 'name', ''),
                      "arguments": getattr(agent_event.item, 'arguments', {})
                  }
              }

          elif agent_event.item.type == "tool_call_output_item":
              return {
                  "type": "tool.call.completed",
                  "tool_call": {
                      "id": getattr(agent_event.item, 'id', ''),
                      "name": getattr(agent_event.item, 'name', ''),
                      "result": agent_event.item.output
                  }
              }

          elif agent_event.item.type == "message_output_item":
              text = ItemHelpers.text_message_output(agent_event.item)

              return {
                  "type": "thread.message.delta",
                  "delta": {
                      "role": "assistant",
                      "content": [{"type": "text", "text": text}]
                  }
              }

          elif agent_event.type == "raw_response_event":
          # Skip raw events for ChatKit
            return None

      # Unknown event - skip
        return None

        
        # """
        # Transform an OpenAI event into a ChatKit event.
        # """
        # event_type = agent_event.get('type')
        # if event_type == "tool.call.started":
        #     return {
        #         "type": "tool.call.started",
        #         "tool_call": {
        #             "id": agent_event.get("tool_call", {}).get("id"),
        #             "name": agent_event.get("tool_call", {}).get("name"),
        #             "arguments": agent_event.get("tool_call", {}).get("arguments")
        #         }
        #     }

        # elif event_type == "tool.call.completed":
        #     return {
        #         "type": "tool.call.completed",
        #         "tool_call": {
        #             "id": agent_event.get("tool_call", {}).get("id"),
        #             "name": agent_event.get("tool_call", {}).get("name"),
        #             "result": agent_event.get("tool_call", {}).get("result")
        #         }
        #     }
        # elif event_type == "message.delta":
        #     return {
        #         "type": "thread.message.delta",
        #         "delta": {
        #             "role": "assistant",
        #             "content": agent_event.get("delta", {}).get("content", [])
        #         }
        #     }
        
        # elif event_type == "message.completed":
        #     return {
        #         "type": "thread.message.completed",
        #         "message": {
        #             "role": "assistant",
        #             "content": agent_event.get("message", {}).get("content", []),
        #             "metadata": {
        #                 "user_role": user_context.user_context.role.value,
        #                 "user_id": user_context.user_context.user_id,
        #             }
        #         }
        #     }

        # elif event_type == "error":
        #     return {
        #         "type": "error",
        #         "error": agent_event.get("error", {})
        #         }

        # return None
