import os
import logging
from flask import Flask
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_wtf.csrf import CSRFProtect
from flask_caching import Cache

from dashboard.config import Config
from dashboard.database import Database
from dashboard.routes import register_routes
from dashboard.utils.error_handlers import register_error_handlers
from dashboard.utils.template_filters import register_template_filters
from dashboard.utils.logging_config import setup_logging

def create_app(config_class=Config):
    """Application factory pattern"""
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Setup logging
    setup_logging(app)
    
    # Initialize extensions
    csrf = CSRFProtect(app)
    cache = Cache(app)
    limiter = Limiter(
        app,
        key_func=get_remote_address,
        default_limits=["200 per day", "50 per hour"]
    )
    
    # Initialize database
    db = Database(app)
    
    # Register components
    register_routes(app, db, cache, limiter)
    register_error_handlers(app)
    register_template_filters(app)
    
    # Health check endpoint
    @app.route('/health')
    def health_check():
        return {'status': 'healthy', 'version': app.config.get('VERSION', '1.0.0')}
    
    return app

# Create app instance
app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug)
