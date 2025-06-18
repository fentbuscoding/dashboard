import os
import logging
from flask import Flask, request, jsonify
from flask_wtf.csrf import CSRFProtect
from functools import wraps
from datetime import datetime, timedelta
from collections import defaultdict

from dashboard.config import Config
from dashboard.database import Database
from dashboard.routes import register_routes
from dashboard.utils.error_handlers import register_error_handlers
from dashboard.utils.template_filters import register_template_filters
from dashboard.utils.logging_config import setup_logging

# Simple rate limiting storage
rate_limit_storage = defaultdict(list)

def rate_limit(max_requests=50, window_minutes=60):
    """Simple rate limiting decorator"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            client_ip = request.remote_addr
            now = datetime.now()
            window_start = now - timedelta(minutes=window_minutes)
            
            # Clean old requests
            rate_limit_storage[client_ip] = [
                req_time for req_time in rate_limit_storage[client_ip] 
                if req_time > window_start
            ]
            
            # Check rate limit
            if len(rate_limit_storage[client_ip]) >= max_requests:
                return jsonify({'error': 'Rate limit exceeded'}), 429
            
            # Add current request
            rate_limit_storage[client_ip].append(now)
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def create_app(config_class=Config):
    """Application factory pattern"""
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Setup logging
    setup_logging(app)
    
    # Initialize extensions
    csrf = CSRFProtect(app)
    
    # Initialize database
    db = Database(app)
    
    # Register components
    register_routes(app, db, None, None)  # Pass None for cache and limiter
    register_error_handlers(app)
    register_template_filters(app)
    
    # Health check endpoint
    @app.route('/health')
    @rate_limit(max_requests=10, window_minutes=1)
    def health_check():
        return {'status': 'healthy', 'version': app.config.get('VERSION', '1.0.0')}
    
    return app

# Create app instance
app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug)
