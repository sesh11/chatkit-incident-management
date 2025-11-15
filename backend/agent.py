"""
Incident Management Agent using OpenAI Agents SDK.
"""
from typing import Any, Dict, Optional
import os
from openai import OpenAI
from models import UserContext, Role
from tools import (
    view_technical_logs,
    restart_service,
    run_diagnostics,
    set_incident_priority,
    view_business_impact,
    allocate_resources,
    approve_emergency_spending,
    view_cost_impact,
    notify_customers,
    view_affected_customers,
    view_incident_details,
    create_incident,
    TOOL_REGISTRY,
    get_tools_for_role,
)
from auth import AuthenticationError


class IncidentManagementAgent:
    """
    Agent for handling incident management across different roles.
    Propagates user identity through all tool calls.
    """

    def __init__(self, api_key: str, model: Optional[str] = None):
        """
        Initialize the agent.

        Args:
            api_key: OpenAI API key
            model: OpenAI model to use
        """
        self.client = OpenAI(api_key=api_key)
        self.model = model or os.getenv("OPENAI_MODEL", "gpt-4o-mini")
        if not self.model:
            raise ValueError("OPENAI_MODEL environment variable is not set")

        # Map tool names to functions
        self.tool_functions = {
            "view_technical_logs": view_technical_logs,
            "restart_service": restart_service,
            "run_diagnostics": run_diagnostics,
            "set_incident_priority": set_incident_priority,
            "view_business_impact": view_business_impact,
            "allocate_resources": allocate_resources,
            "approve_emergency_spending": approve_emergency_spending,
            "view_cost_impact": view_cost_impact,
            "notify_customers": notify_customers,
            "view_affected_customers": view_affected_customers,
            "view_incident_details": view_incident_details,
            "create_incident": create_incident,
        }

    def get_system_prompt(self, context: UserContext) -> str:
        """
        Generate role-specific system prompt.

        Args:
            context: User context with role and permissions

        Returns:
            System prompt string
        """
        available_tools = get_tools_for_role(context.role)
        tool_descriptions = [
            f"- {tool}: {TOOL_REGISTRY[tool]['description']}"
            for tool in available_tools
        ]

        return f"""You are an Incident Management Assistant helping {context.display_name}.

Current User Context:
- Role: {context.display_name}
- User ID: {context.user_id}
- Permissions: {', '.join(context.permissions)}

Available Tools:
{chr(10).join(tool_descriptions)}

Guidelines:
1. You can ONLY use tools that are available to this user's role
2. When asked to perform actions outside your permissions, politely explain the limitation
3. Focus on helping the user with incident-related tasks within their role
4. Provide clear, actionable responses
5. Always reference the current incident context (INC-001) when relevant
6. Be professional and efficient - this is an enterprise incident management system

Current Active Incident: INC-001 - Production Database Slowdown

Remember: You represent {context.display_name} and can only perform actions they are authorized for."""

    def get_tool_schemas_for_role(self, role: Role) -> list:
        """
        Get OpenAI function schemas for tools available to this role.

        Args:
            role: User role

        Returns:
            List of tool schemas in OpenAI format
        """
        available_tools = get_tools_for_role(role)
        schemas = []

        for tool_name in available_tools:
            metadata = TOOL_REGISTRY[tool_name]
            schema = {
                "type": "function",
                "function": {
                    "name": tool_name,
                    "description": metadata["description"],
                    "parameters": {
                        "type": "object",
                        "properties": {},
                        "required": []
                    }
                }
            }

            # Define parameter schemas
            param_definitions = {
                "incident_id": {"type": "string", "description": "Incident ID (e.g., INC-001)"},
                "service_name": {"type": "string", "description": "Name of the service to restart"},
                "diagnostic_type": {"type": "string", "description": "Type of diagnostic: network, database, or cache"},
                "priority": {"type": "string", "description": "Priority level: P1, P2, P3, or P4"},
                "resource_type": {"type": "string", "description": "Type of resource: compute, storage, or bandwidth"},
                "amount": {"type": "integer", "description": "Amount to allocate"},
                "justification": {"type": "string", "description": "Justification for the spending"},
                "message": {"type": "string", "description": "Notification message to send"},
                "customer_segment": {"type": "string", "description": "Customer segment: enterprise, smb, free, or all"},
                "title": {"type": "string", "description": "Incident title"},
                "description": {"type": "string", "description": "Incident description"},
                "affected_systems": {"type": "string", "description": "Comma-separated list of affected systems"},
            }

            for param in metadata["parameters"]:
                if param in param_definitions:
                    schema["function"]["parameters"]["properties"][param] = param_definitions[param]
                    schema["function"]["parameters"]["required"].append(param)

            schemas.append(schema)

        return schemas

    def execute_tool(self, tool_name: str, arguments: Dict[str, Any], context: UserContext) -> Dict[str, Any]:
        """
        Execute a tool with user context.

        Args:
            tool_name: Name of the tool to execute
            arguments: Tool arguments
            context: User context for identity propagation

        Returns:
            Tool execution result
        """
        tool_function = self.tool_functions.get(tool_name)

        if not tool_function:
            return {"error": f"Tool {tool_name} not found"}

        try:
            # Inject user context as first argument
            result = tool_function(context, **arguments)
            return result
        except AuthenticationError as e:
            return {
                "error": "Permission denied",
                "message": str(e),
                "user": context.display_name
            }
        except Exception as e:
            return {
                "error": "Tool execution failed",
                "message": str(e),
                "tool": tool_name
            }

    async def process_message(self, message: str, context: UserContext, thread_id: str = None) -> Dict[str, Any]:
        """
        Process a user message and generate a response.

        Args:
            message: User message
            context: User context for identity propagation
            thread_id: Optional thread ID for conversation history

        Returns:
            Agent response with tool calls and results
        """
        messages = [
            {"role": "system", "content": self.get_system_prompt(context)},
            {"role": "user", "content": message}
        ]

        tools = self.get_tool_schemas_for_role(context.role)

        # Initial completion
        response = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            tools=tools if tools else None,
            tool_choice="auto" if tools else None,
        )

        assistant_message = response.choices[0].message
        messages.append(assistant_message)

        # Handle tool calls
        tool_results = []
        if assistant_message.tool_calls:
            for tool_call in assistant_message.tool_calls:
                tool_name = tool_call.function.name
                tool_args = eval(tool_call.function.arguments)

                # Execute tool with user context
                result = self.execute_tool(tool_name, tool_args, context)
                tool_results.append({
                    "tool": tool_name,
                    "arguments": tool_args,
                    "result": result
                })

                # Add tool result to messages
                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": str(result)
                })

            # Get final response after tool execution
            final_response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
            )

            final_message = final_response.choices[0].message.content
        else:
            final_message = assistant_message.content

        return {
            "message": final_message,
            "tool_calls": tool_results,
            "context": {
                "user": context.display_name,
                "role": context.role.value,
                "user_id": context.user_id
            }
        }
