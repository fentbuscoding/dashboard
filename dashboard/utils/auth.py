"""
Authentication utilities for the Flask application
"""
import functools
import requests
from flask import request, redirect, url_for, current_app, session, g

def login_required(f):
    """Decorator to require login for a route"""
    @functools.wraps(f)
    def decorated_function(*args, **kwargs):
        user = get_current_user()
        if not user:
            return redirect(url_for('auth.login'))
        return f(*args, **kwargs)
    return decorated_function

def admin_required(f):
    """Decorator to require admin privileges"""
    @functools.wraps(f)
    def decorated_function(*args, **kwargs):
        user = get_current_user()
        if not user:
            return redirect(url_for('auth.login'))
        
        bot_owner_id = current_app.config.get('DISCORD_BOT_OWNER_ID')
        if not bot_owner_id or user.get('id') != bot_owner_id:
            return "Access denied: Admin privileges required", 403
        
        return f(*args, **kwargs)
    return decorated_function

def get_current_user():
    """Get current authenticated user from cookies/session"""
    user_id = request.cookies.get('user_id')
    if not user_id:
        return None
    
    return {
        'id': user_id,
        'username': request.cookies.get('username'),
        'avatar_hash': request.cookies.get('avatar_hash'),
        'access_token': request.cookies.get('access_token')
    }

def is_bot_owner(user_id=None):
    """Check if user is the bot owner"""
    if not user_id:
        user = get_current_user()
        user_id = user.get('id') if user else None
    
    bot_owner_id = current_app.config.get('DISCORD_BOT_OWNER_ID')
    return bool(bot_owner_id and str(user_id) == str(bot_owner_id))

def get_user_guilds(access_token):
    """Fetch user's Discord guilds"""
    if not access_token:
        return []
    
    try:
        response = requests.get(
            'https://discord.com/api/users/@me/guilds',
            headers={'Authorization': f'Bearer {access_token}'},
            timeout=10
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            current_app.logger.warning(f"Failed to fetch user guilds: {response.status_code}")
            return []
    except requests.RequestException as e:
        current_app.logger.error(f"Error fetching user guilds: {e}")
        return []

def get_user_info(access_token):
    """Fetch user info from Discord API"""
    if not access_token:
        return None
    
    try:
        response = requests.get(
            'https://discord.com/api/users/@me',
            headers={'Authorization': f'Bearer {access_token}'},
            timeout=10
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            current_app.logger.warning(f"Failed to fetch user info: {response.status_code}")
            return None
    except requests.RequestException as e:
        current_app.logger.error(f"Error fetching user info: {e}")
        return None

def has_manage_guild_permission(guild_permissions):
    """Check if user has manage guild permission"""
    try:
        permissions = int(guild_permissions)
        # Check for MANAGE_GUILD permission (0x20)
        return (permissions & 0x20) == 0x20
    except (ValueError, TypeError):
        return False

def exchange_code_for_token(code, redirect_uri):
    """Exchange OAuth2 code for access token"""
    client_id = current_app.config.get('DISCORD_CLIENT_ID')
    client_secret = current_app.config.get('DISCORD_CLIENT_SECRET')
    
    if not client_id or not client_secret:
        current_app.logger.error("Discord OAuth2 credentials not configured")
        return None
    
    data = {
        'client_id': client_id,
        'client_secret': client_secret,
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': redirect_uri,
        'scope': 'identify guilds'
    }
    
    headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
    
    try:
        response = requests.post(
            'https://discord.com/api/oauth2/token',
            data=data,
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            current_app.logger.warning(f"Failed to exchange code for token: {response.status_code}")
            return None
    except requests.RequestException as e:
        current_app.logger.error(f"Error exchanging code for token: {e}")
        return None

def revoke_token(access_token):
    """Revoke Discord access token"""
    client_id = current_app.config.get('DISCORD_CLIENT_ID')
    client_secret = current_app.config.get('DISCORD_CLIENT_SECRET')
    
    if not client_id or not client_secret or not access_token:
        return False
    
    data = {
        'client_id': client_id,
        'client_secret': client_secret,
        'token': access_token
    }
    
    try:
        response = requests.post(
            'https://discord.com/api/oauth2/token/revoke',
            data=data,
            timeout=10
        )
        return response.status_code == 200
    except requests.RequestException as e:
        current_app.logger.error(f"Error revoking token: {e}")
        return False

def validate_csrf_token():
    """Basic CSRF validation (Flask-WTF handles this automatically)"""
    # This is handled by Flask-WTF CSRFProtect
    return True

def rate_limit_key():
    """Generate rate limit key for current user"""
    user = get_current_user()
    if user:
        return f"user:{user['id']}"
    return f"ip:{request.remote_addr}"