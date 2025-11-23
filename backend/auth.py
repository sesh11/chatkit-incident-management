"""
Identity management and authentication utilities.
"""
from typing import Optional
from fastapi import Header, HTTPException
from models import UserContext, Role, PERMISSIONS, IncidentUserContext
import functools


class AuthenticationError(Exception):
    """Custom exception for authentication errors."""
    pass


def extract_user_context(
    x_user_role: Optional[str] = Header(None, alias="X-User-Role"),
    x_user_id: Optional[str] = Header(None, alias="X-User-Id")
) -> IncidentUserContext:
    """
    Extract user identity from request headers.

    Args:
        x_user_role: User role from X-User-Role header
        x_user_id: User ID from X-User-Id header

    Returns:
        IncidentUserContext with user context

    Raises:
        HTTPException: If headers are missing or invalid
    """
    if not x_user_role or not x_user_id:
        raise HTTPException(
            status_code=401,
            detail="Missing authentication headers: X-User-Role and X-User-Id required"
        )

    try:
        role = Role(x_user_role.upper())
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid role: {x_user_role}. Must be one of: IT, OPS, FINANCE, CSM"
        )

    permissions = PERMISSIONS.get(role, [])

    return IncidentUserContext(
        user_context=UserContext(
            user_id=x_user_id,
            role=role,
            permissions=permissions
        )
    )


def requires_permission(permission: str):
    """
    Decorator to enforce permission checks on tool functions.

    Usage:
        @requires_permission("restart_service")
        def restart_service_tool(context: IncidentUserContext, service_name: str):
            # Tool implementation
            pass
    """
    def decorator(func):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            # First argument should be UserContext
            first_arg = args[0] if args else kwargs.get('ctx')

            if hasattr(first_arg, 'context'):
                incident_context = first_arg.context
            elif isinstance(first_arg, IncidentUserContext):
                incident_context = first_arg
            else:
                raise AuthenticationError("UserContext not provided to tool function")

            if permission not in incident_context.user_context.permissions:
                raise AuthenticationError(
                    f"Permission denied: {incident_context.user_context.display_name} lacks '{permission}' permission"
                )

            return await func(*args, **kwargs)

        # # Preserve function metadata
        # wrapper.__name__ = func.__name__
        # wrapper.__doc__ = func.__doc__
        wrapper._requires_permission = permission

        return wrapper
    return decorator


def check_permission(context: IncidentUserContext, permission: str) -> bool:
    """
    Check if user has a specific permission.

    Args:
        context: User context
        permission: Permission to check

    Returns:
        True if user has permission, False otherwise
    """
    return permission in context.user_context.permissions

def get_user_permissions(context: IncidentUserContext) -> list[str]:
    """
    Get all permissions for a user.

    Args:
        context: IncidentUserContext

    Returns:
        List of permission strings
    """
    return PERMISSIONS.get(context.user_context.role, [])
