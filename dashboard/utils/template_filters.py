"""
Template filters for the Flask application
"""

def register_template_filters(app):
    """Register all template filters with the Flask app"""
    
    @app.template_filter('thousands')
    def thousands_filter(value):
        """Format a number with thousands separator"""
        try:
            return "{:,}".format(int(value))
        except (ValueError, TypeError):
            return "0"
    
    @app.template_filter('formatnumber')
    def format_number_filter(value):
        """Format number with K/M suffix"""
        try:
            num = int(value)
            if num >= 1000000:
                return f"{num / 1000000:.1f}M"
            elif num >= 1000:
                return f"{num / 1000:.1f}K"
            return str(num)
        except (ValueError, TypeError):
            return "0"
    
    @app.template_filter('duration')
    def duration_filter(seconds):
        """Convert seconds to human readable duration"""
        try:
            seconds = int(seconds)
            days, remainder = divmod(seconds, 86400)
            hours, remainder = divmod(remainder, 3600)
            minutes, _ = divmod(remainder, 60)
            
            if days > 0:
                return f"{days}d {hours}h {minutes}m"
            elif hours > 0:
                return f"{hours}h {minutes}m"
            else:
                return f"{minutes}m"
        except (ValueError, TypeError):
            return "0m"
    
    @app.template_filter('percentage')
    def percentage_filter(value):
        """Format number as percentage"""
        try:
            return f"{float(value):.1f}%"
        except (ValueError, TypeError):
            return "0.0%"
    
    @app.template_filter('filesize')
    def filesize_filter(bytes_value):
        """Convert bytes to human readable file size"""
        try:
            bytes_value = int(bytes_value)
            for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
                if bytes_value < 1024.0:
                    return f"{bytes_value:.1f}{unit}"
                bytes_value /= 1024.0
            return f"{bytes_value:.1f}PB"
        except (ValueError, TypeError):
            return "0B"
    
    @app.template_filter('truncate_smart')
    def truncate_smart_filter(text, length=50):
        """Smart truncate that doesn't break words"""
        try:
            if len(text) <= length:
                return text
            return text[:length].rsplit(' ', 1)[0] + '...'
        except (AttributeError, TypeError):
            return str(text) if text else ""
    
    @app.template_filter('ago')
    def time_ago_filter(datetime_obj):
        """Convert datetime to 'time ago' format"""
        try:
            from datetime import datetime, timezone
            if isinstance(datetime_obj, str):
                # Try to parse ISO format
                datetime_obj = datetime.fromisoformat(datetime_obj.replace('Z', '+00:00'))
            
            now = datetime.now(timezone.utc)
            if datetime_obj.tzinfo is None:
                datetime_obj = datetime_obj.replace(tzinfo=timezone.utc)
            
            diff = now - datetime_obj
            seconds = diff.total_seconds()
            
            if seconds < 60:
                return "just now"
            elif seconds < 3600:
                minutes = int(seconds // 60)
                return f"{minutes} minute{'s' if minutes != 1 else ''} ago"
            elif seconds < 86400:
                hours = int(seconds // 3600)
                return f"{hours} hour{'s' if hours != 1 else ''} ago"
            else:
                days = int(seconds // 86400)
                return f"{days} day{'s' if days != 1 else ''} ago"
        except:
            return "unknown"
    
    @app.template_filter('status_color')
    def status_color_filter(status):
        """Return CSS color class for status"""
        status_colors = {
            'online': 'text-green-500',
            'offline': 'text-red-500',
            'idle': 'text-yellow-500',
            'dnd': 'text-red-500',
            'invisible': 'text-gray-500',
            'active': 'text-green-500',
            'inactive': 'text-gray-500',
            'enabled': 'text-green-500',
            'disabled': 'text-red-500'
        }
        return status_colors.get(str(status).lower(), 'text-gray-500')
    
    @app.template_filter('avatar_url')
    def avatar_url_filter(user_id, avatar_hash=None, size=64):
        """Generate Discord avatar URL"""
        if avatar_hash:
            return f"https://cdn.discordapp.com/avatars/{user_id}/{avatar_hash}.png?size={size}"
        else:
            # Default avatar
            discriminator = int(user_id) % 5
            return f"https://cdn.discordapp.com/embed/avatars/{discriminator}.png"
    
    @app.template_filter('guild_icon')
    def guild_icon_filter(guild_id, icon_hash=None, size=64):
        """Generate Discord guild icon URL"""
        if icon_hash:
            return f"https://cdn.discordapp.com/icons/{guild_id}/{icon_hash}.png?size={size}"
        return None
    
    @app.template_filter('discord_timestamp')
    def discord_timestamp_filter(timestamp, format_type='f'):
        """Convert timestamp to Discord timestamp format"""
        try:
            from datetime import datetime
            if isinstance(timestamp, str):
                timestamp = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
            
            unix_timestamp = int(timestamp.timestamp())
            return f"<t:{unix_timestamp}:{format_type}>"
        except:
            return str(timestamp)