"""
Incident Management Agent using OpenAI Agents SDK.
"""
from typing import Any, Dict, Optional
from agents import Agent, Tool
from models import IncidentUserContext, Role
from tools import get_tools_for_role


def get_instructions_for_role(role: Role) -> str:
    """
    Get instructions for a role.
    """
    role_names = {
        Role.IT: "IT Admin",
        Role.OPS: "Operations Director",
        Role.FINANCE: "Finance Operations Director",
        Role.CSM: "Customer Success Manager",
    }

    display_name = role_names.get(role, str(role))

    tools_for_role = get_tools_for_role(role)

    return f"""You are an Incident Management Assistant helping a {display_name}.
    
    Your responsibilities:
  1. Help manage incidents within the scope of the role that you are assisting. 
  2. Use ONLY the tools available to you based on your role
  2.a. If the user role can't perform the action, you should inform them clearly that they are not authorized to perform that action.  
  2.b. If the user role can't perform that action, then only provide them with alternative actions that they are authorized to do. You can get the list of actions that they are authorized to perform by using the tools that are available for that particular role.
  Tools available to you: {tools_for_role}
  3. Provide clear, actionable responses
  4. Be professional, direct, and efficient - this is an enterprise incident management system
  5. Always reference incident IDs (e.g., INC-001) when relevant
  6. Don't change the incident details or the priority of the incient unless you are explicitly told to do so by the user.

  Current Active Incident: INC-001 - Production Database Slowdown. 
  Remember: You can only perform actions authorized for the {display_name} role."""



def create_incident_agent(role: Role) -> Agent[IncidentUserContext]:
    """
    Create an incident agent for a role.
    """
    tools = get_tools_for_role(role)

    return Agent[IncidentUserContext](
        name=f"Incident Management Agent - {role.value}",
        instructions=get_instructions_for_role(role),
        tools=tools,
        model="gpt-5",
    )
