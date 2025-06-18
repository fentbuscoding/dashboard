"""
Discord API integration service
"""
import logging
import requests
from typing import List, Dict, Any, Optional
from urllib.parse import urlencode

logger = logging.getLogger(__name__)

class DiscordService:
    """Service for Discord API operations"""
    
    def __init__(self, config):
        self.config = config
        self.client_id = config.get('DISCORD_CLIENT_ID')
        self.client_secret = config.get('DISCORD_CLIENT_SECRET')
        self.bot_token = config.get('DISCORD_BOT_TOKEN')
        self.base_url = 'https://discord.com/api'
        
    def get_user_guilds(self, access_token: str) -> List[Dict[str, Any]]:
        """Fetch user's Discord guilds"""
        if not access_token:
            logger.warning("No access token provided for get_user_guilds")
            return []
        
        try:
            response = requests.get(
                f'{self.base_url}/users/@me/guilds',
                headers={'Authorization': f'Bearer {access_token}'},
                timeout=10
            )
            
            if response.status_code == 200:
                guilds = response.json()
                logger.info(f"Retrieved {len(guilds)} user guilds")
                return guilds
            else:
                logger.warning(f"Failed to fetch user guilds: {response.status_code}")
                return []
                
        except requests.RequestException as e:
            logger.error(f"Error fetching user guilds: {e}")
            return []
    
    def get_user_info(self, access_token: str) -> Optional[Dict[str, Any]]:
        """Fetch user info from Discord API"""
        if not access_token:
            return None
        
        try:
            response = requests.get(
                f'{self.base_url}/users/@me',
                headers={'Authorization': f'Bearer {access_token}'},
                timeout=10
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                logger.warning(f"Failed to fetch user info: {response.status_code}")
                return None
                
        except requests.RequestException as e:
            logger.error(f"Error fetching user info: {e}")
            return None
    
    def get_bot_guilds(self) -> List[str]:
        """Fetch bot's current guilds"""
        if not self.bot_token:
            logger.warning("No bot token available")
            return []
        
        try:
            response = requests.get(
                f'{self.base_url}/users/@me/guilds',
                headers={'Authorization': f'Bot {self.bot_token}'},
                timeout=10
            )
            
            if response.status_code == 200:
                guilds = response.json()
                guild_ids = [guild['id'] for guild in guilds]
                logger.info(f"Bot is in {len(guild_ids)} guilds")
                return guild_ids
            else:
                logger.warning(f"Failed to fetch bot guilds: {response.status_code}")
                return []
                
        except requests.RequestException as e:
            logger.error(f"Error fetching bot guilds: {e}")
            return []
    
    def get_guild_info(self, guild_id: str) -> Optional[Dict[str, Any]]:
        """Get detailed guild information"""
        if not self.bot_token:
            return None
        
        try:
            response = requests.get(
                f'{self.base_url}/guilds/{guild_id}',
                headers={'Authorization': f'Bot {self.bot_token}'},
                timeout=10
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                logger.warning(f"Failed to fetch guild {guild_id}: {response.status_code}")
                return None
                
        except requests.RequestException as e:
            logger.error(f"Error fetching guild {guild_id}: {e}")
            return None
    
    def get_guild_channels(self, guild_id: str) -> List[Dict[str, Any]]:
        """Get guild channels"""
        if not self.bot_token:
            return []
        
        try:
            response = requests.get(
                f'{self.base_url}/guilds/{guild_id}/channels',
                headers={'Authorization': f'Bot {self.bot_token}'},
                timeout=10
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                logger.warning(f"Failed to fetch channels for guild {guild_id}")
                return []
                
        except requests.RequestException as e:
            logger.error(f"Error fetching channels for guild {guild_id}: {e}")
            return []
    
    def get_guild_roles(self, guild_id: str) -> List[Dict[str, Any]]:
        """Get guild roles"""
        if not self.bot_token:
            return []
        
        try:
            response = requests.get(
                f'{self.base_url}/guilds/{guild_id}/roles',
                headers={'Authorization': f'Bot {self.bot_token}'},
                timeout=10
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                logger.warning(f"Failed to fetch roles for guild {guild_id}")
                return []
                
        except requests.RequestException as e:
            logger.error(f"Error fetching roles for guild {guild_id}: {e}")
            return []
    
    def process_user_guilds(self, user_guilds: List[Dict[str, Any]], bot_guilds: List[str]) -> List[Dict[str, Any]]:
        """Process user guilds and add bot presence information"""
        processed_guilds = []
        
        for guild in user_guilds:
            # Check if user has manage guild permission
            permissions = int(guild.get('permissions', 0))
            has_manage_permission = (permissions & 0x20) == 0x20  # MANAGE_GUILD
            
            if has_manage_permission:
                guild_id = str(guild['id'])
                processed_guild = {
                    'id': guild_id,
                    'name': guild['name'],
                    'icon': guild.get('icon'),
                    'owner': guild.get('owner', False),
                    'permissions': guild.get('permissions'),
                    'bot_present': guild_id in bot_guilds or str(guild_id) in [str(g) for g in bot_guilds],
                    'member_count': guild.get('approximate_member_count', 0),
                    'icon_url': self.get_guild_icon_url(guild_id, guild.get('icon'))
                }
                processed_guilds.append(processed_guild)
        
        # Sort guilds: bot present first, then alphabetically
        processed_guilds.sort(key=lambda g: (not g['bot_present'], g['name'].lower()))
        
        return processed_guilds
    
    def get_guild_icon_url(self, guild_id: str, icon_hash: Optional[str], size: int = 128) -> Optional[str]:
        """Generate guild icon URL"""
        if icon_hash:
            return f"https://cdn.discordapp.com/icons/{guild_id}/{icon_hash}.png?size={size}"
        return None
    
    def get_avatar_url(self, user_id: str, avatar_hash: Optional[str], size: int = 64) -> str:
        """Generate user avatar URL"""
        if avatar_hash:
            return f"https://cdn.discordapp.com/avatars/{user_id}/{avatar_hash}.png?size={size}"
        else:
            # Default avatar
            discriminator = int(user_id) % 5
            return f"https://cdn.discordapp.com/embed/avatars/{discriminator}.png"
    
    def generate_invite_url(self, permissions: Optional[str] = None, redirect_uri: Optional[str] = None) -> str:
        """Generate Discord bot invite URL"""
        if not self.client_id:
            raise ValueError("Discord client ID not configured")
        
        params = {
            'client_id': self.client_id,
            'permissions': permissions or '10140354735863',
            'response_type': 'code',
            'scope': 'identify guilds bot applications.commands.permissions.update applications.commands',
            'integration_type': '0'
        }
        
        if redirect_uri:
            params['redirect_uri'] = redirect_uri
        
        return f'https://discord.com/oauth2/authorize?{urlencode(params)}'
    
    def exchange_code_for_token(self, code: str, redirect_uri: str) -> Optional[Dict[str, Any]]:
        """Exchange OAuth2 code for access token"""
        if not self.client_id or not self.client_secret:
            logger.error("Discord OAuth2 credentials not configured")
            return None
        
        data = {
            'client_id': self.client_id,
            'client_secret': self.client_secret,
            'grant_type': 'authorization_code',
            'code': code,
            'redirect_uri': redirect_uri,
            'scope': 'identify guilds'
        }
        
        try:
            response = requests.post(
                f'{self.base_url}/oauth2/token',
                data=data,
                headers={'Content-Type': 'application/x-www-form-urlencoded'},
                timeout=10
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                logger.warning(f"Failed to exchange code for token: {response.status_code}")
                return None
                
        except requests.RequestException as e:
            logger.error(f"Error exchanging code for token: {e}")
            return None
    
    def revoke_token(self, access_token: str) -> bool:
        """Revoke Discord access token"""
        if not self.client_id or not self.client_secret or not access_token:
            return False
        
        data = {
            'client_id': self.client_id,
            'client_secret': self.client_secret,
            'token': access_token
        }
        
        try:
            response = requests.post(
                f'{self.base_url}/oauth2/token/revoke',
                data=data,
                timeout=10
            )
            return response.status_code == 200
        except requests.RequestException as e:
            logger.error(f"Error revoking token: {e}")
            return False