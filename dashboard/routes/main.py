from flask import Blueprint, render_template, request, current_app
from dashboard.utils.auth import login_required, get_current_user
from dashboard.services.stats_service import StatsService

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
        from dashboard.services.discord_service import DiscordService
        
        user = get_current_user()
        discord_service = DiscordService(current_app.config)
        
        user_guilds = discord_service.get_user_guilds(user.get('access_token'))
        bot_guilds = current_app.db.get_bot_guilds() if current_app.db.is_available() else []
        
        # Process guilds for display
        processed_guilds = discord_service.process_user_guilds(user_guilds, bot_guilds)
        
        return render_template('servers.html', 
                             guilds=processed_guilds,
                             username=user.get('username'),
                             config={'CLIENT_ID': current_app.config.get('DISCORD_CLIENT_ID')})
    except Exception as e:
        current_app.logger.error(f"Error in servers route: {e}")
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
    client_id = current_app.config.get('DISCORD_CLIENT_ID')
    if not client_id:
        return "Discord configuration not available", 503
    
    permissions = "10140354735863"
    scope = "identify+guilds+bot+applications.commands.permissions.update+applications.commands"
    redirect_uri = current_app.config.get('DISCORD_REDIRECT_URI', 'http://localhost:5000/callback')
    
    invite_url = (f'https://discord.com/oauth2/authorize?client_id={client_id}'
                 f'&permissions={permissions}&response_type=code'
                 f'&redirect_uri={redirect_uri}&integration_type=0&scope={scope}')
    
    return redirect(invite_url)