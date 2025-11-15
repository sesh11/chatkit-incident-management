"""
ChatKit Server implementation with identity propagation.
"""
import json
from typing import AsyncIterator, Dict, Any
from chatkit.server import ChatKitServer, ThreadStreamEvent
from agent import IncidentManagementAgent
from models import UserContext
from store import chat_store


class IncidentChatKitServer(ChatKitServer):
    """
    Custom ChatKit server for incident management.
    Propagates user identity through all operations.
    """

    def __init__(self, api_key: str):
        """
        Initialize the ChatKit server.

        Args:
            api_key: OpenAI API key
        """
        super().__init__(store=chat_store)
        self.agent = IncidentManagementAgent(api_key)

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
        user_context: UserContext = context.get('user_context')

        if not user_context:
            # Yield error event if no user context
            yield {
                "type": "error",
                "error": {
                    "message": "Authentication required: No user context provided"
                }
            }
            return

        # Extract user message
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
            # Process message with agent (includes identity propagation)
            result = await self.agent.process_message(
                message=user_message,
                context=user_context,
                thread_id=thread.id if thread else None
            )

            # Stream tool execution events
            if result.get('tool_calls'):
                for tool_call in result['tool_calls']:
                    # Yield tool start event
                    yield {
                        "type": "tool.call.started",
                        "tool_call": {
                            "id": f"tool_{tool_call['tool']}",
                            "name": tool_call['tool'],
                            "arguments": tool_call['arguments']
                        }
                    }

                    # Yield tool completion event
                    yield {
                        "type": "tool.call.completed",
                        "tool_call": {
                            "id": f"tool_{tool_call['tool']}",
                            "name": tool_call['tool'],
                            "result": tool_call['result']
                        }
                    }

            # Stream assistant message
            assistant_message = result.get('message', 'No response generated')

            # Yield message delta event (streaming text)
            yield {
                "type": "thread.message.delta",
                "delta": {
                    "role": "assistant",
                    "content": [{"type": "text", "text": assistant_message}]
                }
            }

            # Yield message completed event
            yield {
                "type": "thread.message.completed",
                "message": {
                    "role": "assistant",
                    "content": [{"type": "text", "text": assistant_message}],
                    "metadata": {
                        "user_role": user_context.role.value,
                        "user_id": user_context.user_id,
                        "tool_calls_count": len(result.get('tool_calls', []))
                    }
                }
            }

        except Exception as e:
            # Yield error event
            yield {
                "type": "error",
                "error": {
                    "message": f"Error processing request: {str(e)}",
                    "code": "processing_error"
                }
            }

    async def get_context_for_request(self, request_context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extract and prepare context from request.
        This is called before respond() to prepare the context.

        Args:
            request_context: Raw request context

        Returns:
            Processed context dictionary
        """
        return request_context
