"""
Identity management and authentication utilities.
"""
from typing import Optional
from fastapi import Header, HTTPException
from models import UserContext, Role, PERMISSIONS


class AuthenticationError(Exception):
    """Custom exception for authentication errors."""
    pass


def extract_user_context(
    x_user_role: Optional[str] = Header(None, alias="X-User-Role"),
    x_user_id: Optional[str] = Header(None, alias="X-User-Id")
) -> UserContext:
    """
    Extract user identity from request headers.

    Args:
        x_user_role: User role from X-User-Role header
        x_user_id: User ID from X-User-Id header

    Returns:
        UserContext with role and permissions

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

    return UserContext(
        user_id=x_user_id,
        role=role,
        permissions=permissions
    )


def requires_permission(permission: str):
    """
    Decorator to enforce permission checks on tool functions.

    Usage:
        @requires_permission("restart_service")
        def restart_service_tool(context: UserContext, service_name: str):
            # Tool implementation
            pass
    """
    def decorator(func):
        def wrapper(*args, **kwargs):
            # First argument should be UserContext
            context = args[0] if args else kwargs.get('context')

            if not isinstance(context, UserContext):
                raise AuthenticationError("UserContext not provided to tool function")

            if permission not in context.permissions:
                raise AuthenticationError(
                    f"Permission denied: {context.display_name} lacks '{permission}' permission"
                )

            return func(*args, **kwargs)

        # Preserve function metadata
        wrapper.__name__ = func.__name__
        wrapper.__doc__ = func.__doc__
        wrapper._requires_permission = permission

        return wrapper
    return decorator


def check_permission(context: UserContext, permission: str) -> bool:
    """
    Check if user has a specific permission.

    Args:
        context: User context
        permission: Permission to check

    Returns:
        True if user has permission, False otherwise
    """
    return permission in context.permissions


def get_user_permissions(role: Role) -> list[str]:
    """
    Get all permissions for a role.

    Args:
        role: User role

    Returns:
        List of permission strings
    """
    return PERMISSIONS.get(role, [])
