from flask import Blueprint, render_template, request, current_app, redirect
from dashboard.utils.auth import login_required, get_current_user
from dashboard.services.stats_service import StatsService
from dashboard.services.discord_service import DiscordService

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def home():
    """Home page"""
    try:
        stats_service = StatsService(current_app.db)
        stats = stats_service.get_dashboard_stats()
        
        user = get_current_user()
        if user:
            is_bot_owner = user.get('id') == current_app.config.get('DISCORD_BOT_OWNER_ID')
            template = 'DEVindex.html' if is_bot_owner and request.host == 'localhost:5000' else 'index.html'
            return render_template(template, username=user.get('username'), stats=stats, is_bot_owner=is_bot_owner)
        
        return render_template('home.html', stats=stats)
    except Exception as e:
        current_app.logger.error(f"Error in home route: {e}")
        return render_template('error.html', error_code=500, error_message="Internal server error"), 500

@main_bp.route('/servers')
@login_required
def servers():
    """Servers page"""
    try:
        user = get_current_user()
        discord_service = DiscordService(current_app.config)
        
        user_guilds = discord_service.get_user_guilds(user.get('access_token'))
        
        # Get bot guilds from database or Discord API
        if current_app.db.is_available():
            # Try to get from database first
            bot_guilds = current_app.db.get_bot_guilds() if hasattr(current_app.db, 'get_bot_guilds') else []
        else:
            bot_guilds = []
        
        # If no bot guilds from database, try Discord API
        if not bot_guilds:
            bot_guilds = discord_service.get_bot_guilds()
        
        # Process guilds for display
        processed_guilds = discord_service.process_user_guilds(user_guilds, bot_guilds)
        
        return render_template('servers.html', 
                             guilds=processed_guilds,
                             username=user.get('username'),
                             config={'CLIENT_ID': current_app.config.get('DISCORD_CLIENT_ID')})
    except Exception as e:
        current_app.logger.error(f"Error in servers route: {e}")
        return render_template('error.html', error_code=500, error_message="Internal server error"), 500

@main_bp.route('/servers/<guild_id>')
@login_required
def server_details(guild_id):
    """Server details page"""
    try:
        user = get_current_user()
        discord_service = DiscordService(current_app.config)
        
        # Verify user has access to this guild
        user_guilds = discord_service.get_user_guilds(user.get('access_token'))
        user_guild = next((g for g in user_guilds if str(g['id']) == str(guild_id)), None)
        
        if not user_guild:
            return render_template('error.html', error_code=403, error_message="Access denied"), 403
        
        # Check manage guild permission
        permissions = int(user_guild.get('permissions', 0))
        if not (permissions & 0x20):  # MANAGE_GUILD
            return render_template('error.html', error_code=403, error_message="Insufficient permissions"), 403
        
        # Get guild details
        guild_info = discord_service.get_guild_info(guild_id)
        channels = discord_service.get_guild_channels(guild_id)
        roles = discord_service.get_guild_roles(guild_id)
        
        # Get guild settings from database
        guild_settings = {}
        if current_app.db.is_available():
            guild_settings = current_app.db.get_guild_settings(guild_id)
        
        return render_template('server_details.html',
                             guild=guild_info or user_guild,
                             channels=channels,
                             roles=roles,
                             settings=guild_settings,
                             username=user.get('username'))
    except Exception as e:
        current_app.logger.error(f"Error in server details route: {e}")
        return render_template('error.html', error_code=500, error_message="Internal server error"), 500

@main_bp.route('/privacy')
def privacy():
    """Privacy policy page"""
    return render_template('privacy.html')

@main_bp.route('/faq')
def faq():
    """FAQ page"""
    return render_template('faq.html')

@main_bp.route('/invite')
def invite():
    """Bot invite redirect"""
    try:
        discord_service = DiscordService(current_app.config)
        
        redirect_uri = current_app.config.get('DISCORD_REDIRECT_URI', 'http://localhost:5000/callback')
        invite_url = discord_service.generate_invite_url(redirect_uri=redirect_uri)
        
        return redirect(invite_url)
    except ValueError as e:
        current_app.logger.error(f"Error generating invite URL: {e}")
        return "Discord configuration not available", 503
    except Exception as e:
        current_app.logger.error(f"Unexpected error in invite route: {e}")
        return "Internal server error", 500

@main_bp.route('/status')
def status():
    """Bot status page"""
    try:
        discord_service = DiscordService(current_app.config)
        stats_service = StatsService(current_app.db)
        
        # Get basic stats
        stats = stats_service.get_dashboard_stats()
        
        # Get bot guilds count
        bot_guilds = discord_service.get_bot_guilds()
        
        status_data = {
            'bot_online': len(bot_guilds) > 0,
            'guild_count': len(bot_guilds),
            'database_online': current_app.db.is_available() if current_app.db else False,
            'uptime': stats.get('uptime', {}),
            'last_updated': stats.get('last_updated')
        }
        
        return render_template('status.html', status=status_data)
    except Exception as e:
        current_app.logger.error(f"Error in status route: {e}")
        return render_template('error.html', error_code=500, error_message="Internal server error"), 500